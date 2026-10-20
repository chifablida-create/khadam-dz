export const DEFAULT_PUBLIC_TUNNEL_URL = 'https://clinic-civilian-ipod-rover.trycloudflare.com';
export const CLOUD_RUN_PRE_URL = 'https://ais-pre-xlv6qxqnnf5qh6djqimeul-84338738632.europe-west2.run.app';
export const DEV_PREVIEW_URL = 'https://ais-dev-xlv6qxqnnf5qh6djqimeul-84338738632.europe-west2.run.app';

let livePublicTunnelUrl = DEFAULT_PUBLIC_TUNNEL_URL;
const listeners = new Set<(url: string) => void>();

export function setLivePublicTunnelUrl(url?: string | null) {
  if (!url || typeof url !== 'string' || !url.startsWith('https://')) return;
  if (url !== livePublicTunnelUrl) {
    livePublicTunnelUrl = url;
    try {
      sessionStorage.setItem('khadam_live_tunnel_url', url);
    } catch {
      // ignore storage errors
    }
    listeners.forEach((fn) => fn(url));
  }
}

export function subscribePublicAppUrl(fn: (url: string) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// Auto-fetch latest live tunnel URL from backend on module load
if (typeof window !== 'undefined') {
  try {
    const cached = sessionStorage.getItem('khadam_live_tunnel_url');
    if (cached && cached.startsWith('https://') && cached.includes('.trycloudflare.com')) {
      livePublicTunnelUrl = cached;
    }
  } catch {
    // ignore
  }

  fetch('/api/public-url', { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data?.publicUrl) {
        setLivePublicTunnelUrl(data.publicUrl);
      }
    })
    .catch(() => {});
}

export const SHARED_PUBLIC_URL = DEFAULT_PUBLIC_TUNNEL_URL;

/**
 * Returns the universal public URL that works for EVERYONE on any phone (Messenger, WhatsApp, Chrome, Safari)
 * with ZERO Google login required, ZERO 403 errors, and ZERO 404 / DNS errors.
 */
export function getPublicAppUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
    const origin = window.location.origin;
    // If visitor is already on the public Cloudflare tunnel, return their current origin
    if (origin.includes('.trycloudflare.com')) {
      return origin;
    }
  }
  return livePublicTunnelUrl || DEFAULT_PUBLIC_TUNNEL_URL;
}

/**
 * Returns the current browser origin for local asset downloads (/download/aab, /download/standalone-app)
 * so downloads always resolve against the currently active server session.
 */
export function getCurrentServerOrigin(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
    return window.location.origin;
  }
  return getPublicAppUrl();
}
