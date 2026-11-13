const DEFAULT_TABLE = 'artisans';
const DEFAULT_CHANNEL = 'khadam_live_updates';

let supabaseClient = null;
let activeSubscription = null;

function getRuntimeSupabaseConfig() {
  // Vite replaces these statically at build time; process.env is not exposed in browser builds.
  const viteEnv = import.meta.env || {};
  const envUrl = viteEnv.VITE_SUPABASE_URL || viteEnv.SUPABASE_URL || '';
  const envKey = viteEnv.VITE_SUPABASE_ANON_KEY || viteEnv.SUPABASE_ANON_KEY || '';
  if (envUrl && envKey) return { url: envUrl, anonKey: envKey };

  try {
    if (typeof window !== 'undefined') {
      const runtimeEnv = window.__ENV__ || window.env || {};
      return {
        url: runtimeEnv.SUPABASE_URL || runtimeEnv.VITE_SUPABASE_URL || envUrl,
        anonKey: runtimeEnv.SUPABASE_ANON_KEY || runtimeEnv.VITE_SUPABASE_ANON_KEY || envKey
      };
    }
  } catch {
    // Runtime configuration is optional outside the browser.
  }

  return { url: envUrl, anonKey: envKey };
}

export async function getSupabaseClient() {
  const { url, anonKey } = getRuntimeSupabaseConfig();
  if (!url || !anonKey) return null;

  if (!supabaseClient) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      supabaseClient = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    } catch (error) {
      console.error('[supabaseSync] Failed to create Supabase client:', error);
      return null;
    }
  }
  return supabaseClient;
}

export function subscribeToSupabase(options = {}) {
  const { supabase, table = DEFAULT_TABLE, channel = DEFAULT_CHANNEL, onData, onError } = options;
  if (!supabase) return null;

  if (activeSubscription) {
    try { activeSubscription.unsubscribe?.(); } catch { /* ignore cleanup errors */ }
  }

  const subscription = supabase
    .channel(channel)
    .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      try { onData?.(payload); } catch (error) { console.warn('[supabaseSync] onData handler failed:', error); }
    })
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        const error = new Error(`Supabase subscription error for ${table} (${status})`);
        console.warn('[supabaseSync] Subscription status:', status);
        onError?.(error);
      }
    });

  activeSubscription = subscription;
  return () => {
    if (activeSubscription === subscription) activeSubscription = null;
    try { subscription.unsubscribe?.(); } catch { /* ignore unsubscribe errors */ }
  };
}

export async function startSyncBot(options = {}) {
  const { table = DEFAULT_TABLE, channel = DEFAULT_CHANNEL, onData, onError } = options;
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return { ok: false, reason: 'missing-config' };
    const unsubscribe = subscribeToSupabase({ supabase, table, channel, onData, onError });
    return { ok: true, table, channel, unsubscribe };
  } catch (error) {
    console.error('[supabaseSync] startSyncBot failed:', error);
    onError?.(error);
    return { ok: false, error };
  }
}

export default { getSupabaseClient, subscribeToSupabase, startSyncBot };
