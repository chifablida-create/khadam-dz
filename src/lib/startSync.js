import { getSupabaseClient } from './supabaseSync.js';

const CHANNEL_NAME = 'khadam-live-guard';
const TABLES = ['artisans', 'demandes'];
const STARTED_KEY = '__KHADAM_SUPABASE_GUARD__';
const LOCAL_SYNC_MAP = { artisans: 'khadam_users', demandes: 'khadam_requests' };
const SYNC_GUARD = new Set();

function safeParseList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
  } catch { return []; }
}

function rowsFrom(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.filter((row) => row && typeof row === 'object' && row.id != null);
}

function mergeById(existing, incoming) {
  const map = new Map();
  [...rowsFrom(existing), ...rowsFrom(incoming)].forEach((row) => map.set(String(row.id), row));
  return Array.from(map.values());
}

function writeLocal(storageKey, rows) {
  if (typeof localStorage === 'undefined') return;
  SYNC_GUARD.add(storageKey);
  try { localStorage.setItem(storageKey, JSON.stringify(rows)); }
  finally { setTimeout(() => SYNC_GUARD.delete(storageKey), 0); }
}

function applyIncomingSupabaseChange(table, payload) {
  const storageKey = LOCAL_SYNC_MAP[table];
  if (!storageKey || typeof localStorage === 'undefined') return;

  const current = safeParseList(localStorage.getItem(storageKey));
  if (payload?.eventType === 'DELETE' && payload.old?.id != null) {
    writeLocal(storageKey, current.filter((row) => String(row.id) !== String(payload.old.id)));
    return;
  }
  const row = payload?.new;
  if (row?.id != null) writeLocal(storageKey, mergeById(current, [row]));
}

async function syncLocalStorageTableToSupabase(table, rows) {
  const supabase = await getSupabaseClient();
  if (!supabase) return;
  const validRows = rowsFrom(rows);
  if (!validRows.length) return;
  const { error } = await supabase.from(table).upsert(validRows, { onConflict: 'id' });
  if (error) console.warn(`[startSync] Could not sync ${table}:`, error.message);
}

function publishRemoteChange(table, payload) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('khadam:supabase:sync', { detail: { table, payload } }));
}

function onLocalStorageKeyChanged(key) {
  if (!key || SYNC_GUARD.has(key)) return;
  const table = Object.keys(LOCAL_SYNC_MAP).find((name) => LOCAL_SYNC_MAP[name] === key);
  if (table) syncLocalStorageTableToSupabase(table, safeParseList(localStorage.getItem(key)));
}

function hookLocalStorage() {
  if (typeof window === 'undefined') return;
  const proto = Object.getPrototypeOf(window.localStorage);
  if (proto.setItem.__khadamPatched__) return;
  const originalSet = proto.setItem;
  const originalRemove = proto.removeItem;
  proto.setItem = function (key, value) {
    const result = originalSet.call(this, key, value);
    if (typeof key === 'string') onLocalStorageKeyChanged(key);
    return result;
  };
  proto.setItem.__khadamPatched__ = true;
  proto.removeItem = function (key) {
    const result = originalRemove.call(this, key);
    if (typeof key === 'string') onLocalStorageKeyChanged(key);
    return result;
  };
  proto.removeItem.__khadamPatched__ = true;
}

async function startSync() {
  if (typeof window === 'undefined' || window[STARTED_KEY]) return;
  window[STARTED_KEY] = { status: 'starting' };
  hookLocalStorage();

  const supabase = await getSupabaseClient();
  if (!supabase) {
    window[STARTED_KEY] = { status: 'disabled', reason: 'missing-config' };
    console.warn('[startSync] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
    return;
  }

  let channel = supabase.channel(CHANNEL_NAME);
  for (const table of TABLES) {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      publishRemoteChange(table, payload);
      applyIncomingSupabaseChange(table, payload);
    });
  }
  channel.subscribe((status, error) => {
    window[STARTED_KEY] = { status };
    if (status !== 'SUBSCRIBED') console.warn('[startSync] Realtime status:', status, error || '');
  });
  window[STARTED_KEY] = { status: 'connecting', channel };
}

if (typeof window !== 'undefined') {
  const run = () => startSync().catch((error) => {
    window[STARTED_KEY] = { status: 'error' };
    console.error('[startSync] Could not start:', error);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
}

// Compatibility exports for existing imports in the app.
export { startSync, startSync as startSyncBot, syncLocalStorageTableToSupabase, applyIncomingSupabaseChange };
export default startSync;
