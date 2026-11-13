import { getSupabaseClient } from './supabaseSync.js';

const CHANNEL_NAME = 'khadam-live-guard';
const TABLES = ['artisans', 'demandes'];
const STARTED_KEY = '__KHADAM_SUPABASE_GUARD__';

function publishChange(table, payload) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;

  try {
    window.dispatchEvent(
      new CustomEvent(`khadam:supabase:${table}`, {
        detail: payload
      })
    );
  } catch (error) {
    console.warn(`[startSync] Could not publish ${table} update:`, error);
  }
}

async function startSync() {
  if (typeof window === 'undefined') return;
  if (window[STARTED_KEY]) return;

  // Mark the startup attempt so duplicate imports (including hot reload) do not
  // create multiple listeners in the same page.
  window[STARTED_KEY] = { status: 'starting', channel: null };

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
      (payload) => publishChange(table, payload)
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

export { startSync };
export default startSync;
