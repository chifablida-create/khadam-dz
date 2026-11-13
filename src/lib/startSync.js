import { getSupabaseClient } from './supabaseSync.js';

const CHANNEL_NAME = 'khadam-live-guard';
const TABLES = ['artisans', 'demandes'];
const STARTED_KEY = '__KHADAM_SUPABASE_GUARD__';
const LOCAL_SYNC_MAP = {
  artisans: 'khadam_users',
  demandes: 'khadam_requests'
};
const SYNC_GUARD = new Set();

function safeParseList(value) {
  if (value == null || value === '') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
  } catch {
    return [];
  }
}

function normalizeRows(rows) {
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  return list
    .filter(Boolean)
    .map((row, index) => {
      const item = typeof row === 'object' ? { ...row } : { id: `row_${Date.now()}_${index}` };
      if (!item.id) item.id = `row_${Date.now()}_${index}`;
      return item;
    });
}

function mergeRowsById(existingRows, incomingRows) {
  const map = new Map();
  [...existingRows, ...incomingRows].forEach((row) => {
    if (!row || !row.id) return;
    map.set(String(row.id), row);
  });
  return Array.from(map.values());
}

function applyIncomingSupabaseChange(table, payload) {
  const storageKey = LOCAL_SYNC_MAP[table];
  if (!storageKey || typeof localStorage === 'undefined') return;

  const previousRows = safeParseList(localStorage.getItem(storageKey));
  const incoming = payload?.new ?? payload?.old ?? payload;

  if (Array.isArray(incoming)) {
    const merged = mergeRowsById(previousRows, normalizeRows(incoming));
    SYNC_GUARD.add(storageKey);
    try {
      localStorage.setItem(storageKey, JSON.stringify(merged));
    } finally {
      setTimeout(() => SYNC_GUARD.delete(storageKey), 0);
    }
    return;
  }

  if (incoming && incoming.id) {
    const merged = mergeRowsById(previousRows, normalizeRows([incoming]));
    SYNC_GUARD.add(storageKey);
    try {
      localStorage.setItem(storageKey, JSON.stringify(merged));
    } finally {
      setTimeout(() => SYNC_GUARD.delete(storageKey), 0);
    }
    return;
  }

  if (payload?.old && payload.old.id) {
    const filtered = previousRows.filter((item) => String(item.id) !== String(payload.old.id));
    SYNC_GUARD.add(storageKey);
    try {
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    } finally {
      setTimeout(() => SYNC_GUARD.delete(storageKey), 0);
    }
  }
}

async function syncLocalStorageTableToSupabase(table, rows) {
  const supabase = await getSupabaseClient();
  if (!supabase) return;

  const normalized = normalizeRows(rows);
  if (!normalized.length) return;

  try {
    const { error } = await supabase
      .from(table)
      .upsert(normalized, { onConflict: 'id', ignoreDuplicates: false });

    if (error) {
      console.warn(`[startSync] Failed to sync ${table} to Supabase:`, error);
    }
  } catch (error) {
    console.warn(`[startSync] Supabase upsert for ${table} failed:`, error);
  }
}

function publishRemoteChange(table, payload) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;

  try {
    window.dispatchEvent(
      new CustomEvent('khadam:supabase:sync', {
        detail: { table, payload }
      })
    );
  } catch (error) {
    console.warn(`[startSync] Could not publish ${table} update:`, error);
  }
}

function onLocalStorageKeyChanged(key) {
  if (!key || SYNC_GUARD.has(key)) return;

  const table = Object.entries(LOCAL_SYNC_MAP).find(([, value]) => value === key)?.[0];
  if (!table) return;

  const rows = safeParseList(localStorage.getItem(key));
  syncLocalStorageTableToSupabase(table, rows);
}

function hookLocalStorageListeners() {
  if (typeof window === 'undefined') return;

  const storageProto = window.localStorage.__proto__;

  if (storageProto.setItem.__khadamPatched__ && storageProto.removeItem.__khadamPatched__) {
    return;
  }

  const originalSetItem = storageProto.setItem;
  const originalRemoveItem = storageProto.removeItem;

  storageProto.setItem = function patchedSetItem(key, value) {
    const result = originalSetItem.call(this, key, value);
    if (typeof key === 'string') {
      onLocalStorageKeyChanged(key);
    }
    return result;
  };
  storageProto.setItem.__khadamPatched__ = true;

  storageProto.removeItem = function patchedRemoveItem(key) {
    const result = originalRemoveItem.call(this, key);
    if (typeof key === 'string') {
      onLocalStorageKeyChanged(key);
    }
    return result;
  };
  storageProto.removeItem.__khadamPatched__ = true;
}

async function startSync() {
  if (typeof window === 'undefined') return;
  if (window[STARTED_KEY]) return;

  window[STARTED_KEY] = { status: 'starting', channel: null };
  hookLocalStorageListeners();

  const supabase = await getSupabaseClient();
  if (!supabase) {
    window[STARTED_KEY] = { status: 'disabled', reason: 'missing-supabase-config-or-client' };
    console.info('[startSync] Supabase sync is idle: configure the public URL and anon key.');
    return;
  }

  let channel = supabase.channel(CHANNEL_NAME);

  for (const table of TABLES) {
    channel = channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        publishRemoteChange(table, payload);
        applyIncomingSupabaseChange(table, payload);
      }
    );
  }

  channel.subscribe((status, error) => {
    window[STARTED_KEY] = { status, channel };

    if (status === 'SUBSCRIBED') {
      console.info(`[startSync] Realtime guard connected for: ${TABLES.join(', ')}.`);
      return;
    }

    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
      console.warn('[startSync] Realtime channel status:', status, error || '');
    }
  });
}

if (typeof window !== 'undefined') {
  const run = () => {
    startSync().catch((error) => {
      window[STARTED_KEY] = { status: 'error', error };
      console.error('[startSync] Could not start Supabase realtime:', error);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}

export { startSync, syncLocalStorageTableToSupabase, applyIncomingSupabaseChange };
export default startSync;
