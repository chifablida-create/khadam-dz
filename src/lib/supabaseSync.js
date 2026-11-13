const DEFAULT_TABLE = 'artisans';
const DEFAULT_CHANNEL = 'khadam_live_updates';

let supabaseClient = null;
let activeSubscription = null;

function getRuntimeSupabaseConfig() {
  try {
    if (typeof window !== 'undefined') {
      const env = window.__ENV__ || window.env || {};
      return {
        url: env.SUPABASE_URL || env.VITE_SUPABASE_URL || '',
        anonKey: env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ''
      };
    }
  } catch {
    // Ignore browser runtime issues.
  }

  try {
    if (typeof process !== 'undefined' && process.env) {
      return {
        url: process.env.VITE_SUPABASE_URL || '',
        anonKey: process.env.VITE_SUPABASE_ANON_KEY || ''
      };
    }
  } catch {
    // Ignore Node or SSR issues.
  }

  return {
    url: '',
    anonKey: ''
  };
}

export async function getSupabaseClient() {
  const { url, anonKey } = getRuntimeSupabaseConfig();

  if (!url || !anonKey) {
    return null;
  }

  if (!supabaseClient) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      supabaseClient = createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    } catch (error) {
      console.error('[supabaseSync] Failed to create Supabase client:', error);
      return null;
    }
  }

  return supabaseClient;
}

export function subscribeToSupabase(options = {}) {
  const {
    supabase,
    table = DEFAULT_TABLE,
    channel = DEFAULT_CHANNEL,
    onData,
    onError
  } = options;

  if (!supabase) {
    return null;
  }

  if (activeSubscription) {
    try {
      activeSubscription.unsubscribe?.();
    } catch {
      // Ignore previous subscription cleanup errors.
    }
  }

  const subscription = supabase
    .channel(channel)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table
      },
      (payload) => {
        try {
          onData?.(payload);
        } catch (error) {
          console.warn('[supabaseSync] onData handler failed:', error);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        const error = new Error(`Supabase subscription error for ${table} (${status})`);
        console.warn('[supabaseSync] Subscription status:', status);
        onError?.(error);
      }
    });

  activeSubscription = subscription;

  return () => {
    activeSubscription = null;
    try {
      subscription.unsubscribe?.();
    } catch {
      // Ignore unsubscribe errors.
    }
  };
}

export async function startSyncBot(options = {}) {
  const {
    table = DEFAULT_TABLE,
    channel = DEFAULT_CHANNEL,
    onData,
    onError
  } = options;

  try {
    const supabase = await getSupabaseClient();

    if (!supabase) {
      console.info('[supabaseSync] Supabase is not configured. Sync is disabled.');
      return { ok: false, reason: 'missing-config' };
    }

    const unsubscribe = subscribeToSupabase({
      supabase,
      table,
      channel,
      onData,
      onError
    });

    console.info(`[supabaseSync] Bot started and subscribed to table "${table}" on channel "${channel}".`);

    return {
      ok: true,
      table,
      channel,
      unsubscribe
    };
  } catch (error) {
    console.error('[supabaseSync] startSyncBot failed:', error);
    onError?.(error);
    return { ok: false, error };
  }
}

export default {
  getSupabaseClient,
  subscribeToSupabase,
  startSyncBot
};
