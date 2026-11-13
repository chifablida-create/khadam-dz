import { createClient } from 'npm:@supabase/supabase-js@2';

// This function reads Firestore and appends missing records to Supabase only.
// It intentionally never writes to Firebase and never updates/deletes existing rows.
const TABLES = [
  {
    firestoreCollection: 'craftsmen',
    supabaseTable: 'artisans',
    columns: ['full_name', 'phone', 'wilaya', 'commune', 'metier', 'description', 'price', 'is_active'],
    identity: ['phone'],
  },
  {
    firestoreCollection: 'requests',
    supabaseTable: 'demandes',
    columns: ['client_name', 'client_phone', 'wilaya', 'metier', 'message', 'status'],
    identity: ['client_phone', 'wilaya', 'metier', 'message'],
  },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-bot-secret',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}

function decodeFirestoreValue(value: any): any {
  if (!value || typeof value !== 'object') return value ?? null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('referenceValue' in value) return value.referenceValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeFirestoreValue);
  if ('mapValue' in value) return decodeFirestoreFields(value.mapValue.fields || {});
  return null;
}

function decodeFirestoreFields(fields: Record<string, any> = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

function mapFirestoreDocument(collection: string, document: any) {
  const fields = decodeFirestoreFields(document?.fields || {});
  if (collection === 'craftsmen') {
    return {
      full_name: String(fields.full_name ?? fields.name ?? ''),
      phone: String(fields.phone ?? ''),
      wilaya: String(fields.wilaya ?? ''),
      commune: String(fields.commune ?? ''),
      metier: String(fields.metier ?? fields.craft ?? ''),
      description: String(fields.description ?? fields.bio ?? ''),
      price: fields.price === undefined || fields.price === null ? null : Number(fields.price),
      is_active: fields.is_active ?? fields.status !== 'suspended',
    };
  }

  return {
    client_name: String(fields.client_name ?? fields.clientName ?? fields.name ?? ''),
    client_phone: String(fields.client_phone ?? fields.phone ?? ''),
    wilaya: String(fields.wilaya ?? ''),
    metier: String(fields.metier ?? fields.craft ?? ''),
    message: String(fields.message ?? fields.desc ?? fields.title ?? ''),
    status: String(fields.status ?? 'open'),
  };
}

async function listFirestoreDocuments(collection: string, documentsUrl: string, apiKey: string) {
  const documents: any[] = [];
  let pageToken = '';

  do {
    const url = new URL(`${documentsUrl.replace(/\/$/, '')}/${encodeURIComponent(collection)}`);
    url.searchParams.set('pageSize', '1000');
    url.searchParams.set('key', apiKey);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Firestore list failed for ${collection}: ${response.status} ${await response.text()}`);
    }

    const result = await response.json();
    documents.push(...(result.documents || []));
    pageToken = result.nextPageToken || '';
  } while (pageToken);

  return documents;
}

async function rowExists(client: any, table: string, row: Record<string, any>, identity: string[]) {
  let query = client.from(table).select('*').limit(1);
  for (const column of identity) {
    const value = row[column];
    query = value === null || value === undefined ? query.is(column, null) : query.eq(column, value);
  }
  const { data, error } = await query;
  if (error) throw new Error(`Supabase lookup failed for ${table}: ${error.message}`);
  return Boolean(data?.length);
}

async function syncCollection(client: any, documentsUrl: string, firebaseApiKey: string, config: typeof TABLES[number]) {
  const docs = await listFirestoreDocuments(config.firestoreCollection, documentsUrl, firebaseApiKey);
  let inserted = 0;
  let skipped = 0;

  for (const document of docs) {
    const row = mapFirestoreDocument(config.firestoreCollection, document);
    // Do not create empty-key rows, which cannot be deduplicated safely.
    if (config.identity.some((column) => !String(row[column] ?? '').trim())) {
      skipped++;
      continue;
    }

    if (await rowExists(client, config.supabaseTable, row, config.identity)) {
      skipped++;
      continue;
    }

    const { error } = await client.from(config.supabaseTable).insert(row);
    if (error) {
      // A concurrent scheduled invocation may have inserted the same record after
      // the lookup. Report it rather than attempting an update or destructive repair.
      throw new Error(`Supabase insert failed for ${config.supabaseTable}: ${error.message}`);
    }
    inserted++;
  }

  return { collection: config.firestoreCollection, table: config.supabaseTable, read: docs.length, inserted, skipped };
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-bot-secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }});
  if (request.method !== 'POST') return jsonResponse({ error: 'Use POST' }, 405);

  const syncSecret = Deno.env.get('SYNC_BOT_SECRET');
  if (!syncSecret || request.headers.get('x-sync-bot-secret') !== syncSecret) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  // Server-only secret must be configured as an Edge Function secret. Never commit
  // its value. The browser anon key remains read-only and is not used for inserts.
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const firestoreDocumentsUrl = Deno.env.get('FIRESTORE_DOCUMENTS_URL');
  const firebaseApiKey = Deno.env.get('FIREBASE_API_KEY');
  if (!supabaseUrl || !serviceRoleKey || !firestoreDocumentsUrl || !firebaseApiKey) {
    return jsonResponse({ error: 'Missing required Edge Function secrets' }, 500);
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const results = [];
    for (const config of TABLES) {
      results.push(await syncCollection(client, firestoreDocumentsUrl, firebaseApiKey, config));
    }
    return jsonResponse({ success: true, direction: 'firestore-to-supabase', appendOnly: true, results });
  } catch (error) {
    console.error('sync-bot failed', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Sync failed' }, 500);
  }
});
