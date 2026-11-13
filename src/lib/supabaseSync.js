import supabase from '../supabase.js';

const SYNC_INTERVAL_MS = 60_000;

const TABLES = {
  demandes: { firebaseCollection: 'demandes', identity: ['client_phone', 'metier', 'wilaya', 'message'] },
  artisans: { firebaseCollection: 'artisans', identity: ['phone'] },
  points: { firebaseCollection: 'points', identity: ['user_id'] }
};

let syncTimer = null;
let syncInFlight = false;
let realtimeChannel = null;

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.');
  }
  return supabase;
}

function normalizeRow(table, row = {}) {
  if (table === 'demandes') {
    return {
      client_name: String(row.client_name ?? row.clientName ?? row.name ?? ''),
      client_phone: String(row.client_phone ?? row.phone ?? ''),
      wilaya: String(row.wilaya ?? ''),
      metier: String(row.metier ?? row.craft ?? ''),
      message: String(row.message ?? row.desc ?? row.title ?? ''),
      status: String(row.status ?? 'open')
    };
  }

  if (table === 'artisans') {
    return {
      full_name: String(row.full_name ?? row.name ?? ''),
      phone: String(row.phone ?? ''),
      wilaya: String(row.wilaya ?? ''),
      commune: String(row.commune ?? ''),
      metier: String(row.metier ?? row.craft ?? ''),
      description: String(row.description ?? row.bio ?? ''),
      price: row.price ?? null,
      is_active: row.is_active ?? row.status !== 'suspended' ?? true
    };
  }

  if (table === 'points') {
    return {
      user_id: String(row.user_id ?? row.userId ?? row.id ?? ''),
      points: Number(row.points ?? 0),
      updated_at: row.updated_at ?? new Date().toISOString()
    };
  }

  throw new Error(`Unsupported Supabase table: ${table}`);
}

function identityMatches(table, left, right) {
  const fields = TABLES[table].identity;
  return fields.every((field) => String(left?.[field] ?? '').trim() === String(right?.[field] ?? '').trim());
}

async function insertIfMissing(table, rawRow) {
  const client = requireSupabase();
  const row = normalizeRow(table, rawRow);
  if (table === 'points' && !row.user_id) return { inserted: false, reason: 'missing user_id' };

  // Compare existing rows before inserting. This is intentionally append-only and
  // does not update, upsert, or delete existing data on either backend.
  const { data: existingRows, error: readError } = await client.from(table).select('*');
  if (readError) throw readError;
  if ((existingRows || []).some((existing) => identityMatches(table, existing, row))) {
    return { inserted: false, reason: 'already exists' };
  }

  const { data, error } = await client.from(table).insert(row).select().single();
  if (error) throw error;
  return { inserted: true, data };
}

/** Save one row into Supabase only; an existing matching row is left untouched. */
export async function saveToSupabase(table, payload) {
  return insertIfMissing(table, payload);
}

/**
 * Install a realtime listener. Supabase Postgres changes must be enabled for
 * these existing tables in the Supabase dashboard. Deletes are never subscribed.
 */
export function subscribeToSupabase(handlers = {}) {
  const client = requireSupabase();
  const channel = client.channel('khadam-supabase-live');

  for (const table of Object.keys(TABLES)) {
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, (payload) => {
        handlers[table]?.(payload.new, { event: 'INSERT', table });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table }, (payload) => {
        handlers[table]?.(payload.new, { event: 'UPDATE', table });
      });
  }

  channel.subscribe();
  realtimeChannel = channel;
  return () => {
    if (realtimeChannel === channel) realtimeChannel = null;
    return client.removeChannel(channel);
  };
}

async function copyFirebaseToSupabase(firebase) {
  for (const [table, config] of Object.entries(TABLES)) {
    const items = await firebase.list(config.firebaseCollection);
    for (const item of items || []) {
      await insertIfMissing(table, item.data ?? item);
    }
  }
}

async function copySupabaseToFirebase(firebase) {
  const client = requireSupabase();
  for (const [table, config] of Object.entries(TABLES)) {
    const { data, error } = await client.from(table).select('*');
    if (error) throw error;

    for (const row of data || []) {
      const normalized = normalizeRow(table, row);
      const firebaseId = String(row.id ?? normalized.user_id ?? normalized.phone ?? '');
      if (!firebaseId) continue;

      const exists = await firebase.get(config.firebaseCollection, firebaseId);
      if (!exists) {
        // Firebase adapter must create only when absent; this file never calls
        // Firebase update, remove, or delete methods.
        await firebase.create(config.firebaseCollection, firebaseId, normalized);
      }
    }
  }
}

/**
 * Start append-only two-way synchronization, with one pass each minute.
 * `firebase` is an adapter for the project's existing Firebase client and must
 * provide list(collection), get(collection, id), and create(collection, id, data).
 *
 * Browser timers run only while the page/runtime is alive; 24/7 execution while
 * every browser is closed requires a trusted server/Cloud Function scheduler.
 */
export function startSyncBot({ firebase, onError = console.error, runImmediately = true } = {}) {
  if (!firebase || typeof firebase.list !== 'function' || typeof firebase.get !== 'function' || typeof firebase.create !== 'function') {
    throw new Error('Provide a Firebase adapter with list, get, and create methods.');
  }
  if (syncTimer) return stopSyncBot;

  const run = async () => {
    if (syncInFlight) return;
    syncInFlight = true;
    try {
      await copyFirebaseToSupabase(firebase);
      await copySupabaseToFirebase(firebase);
    } catch (error) {
      onError(error);
    } finally {
      syncInFlight = false;
    }
  };

  if (runImmediately) void run();
  syncTimer = setInterval(() => void run(), SYNC_INTERVAL_MS);
  return stopSyncBot;
}

/** Stop this runtime's timer; no stored data is touched. */
export function stopSyncBot() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

export default {
  saveToSupabase,
  subscribeToSupabase,
  startSyncBot,
  stopSyncBot
};
