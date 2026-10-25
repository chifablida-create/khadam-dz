export const OFFICIAL_VERCEL_APP_URL = 'https://khadam-dz-adua.vercel.app';
export const PERMANENT_VERCEL_URL = OFFICIAL_VERCEL_APP_URL;
export const GITHUB_PAGES_URL = 'https://chifablida-create.github.io/khadam-dz/';
export const GITHUB_REPO_URL = 'https://github.com/chifablida-create/khadam-dz';
export const DEFAULT_PUBLIC_TUNNEL_URL = OFFICIAL_VERCEL_APP_URL;
export const CLOUD_RUN_PRE_URL = OFFICIAL_VERCEL_APP_URL;
export const DEV_PREVIEW_URL = OFFICIAL_VERCEL_APP_URL;

let livePublicUrl = OFFICIAL_VERCEL_APP_URL;
const listeners = new Set<(url: string) => void>();

export function setLivePublicTunnelUrl(url?: string | null) {
  if (!url || typeof url !== 'string' || !url.startsWith('https://')) return;
  if (url.includes('.trycloudflare.com') || url.includes('khadam-dz.vercel.app')) {
    return;
  }
  if (url !== livePublicUrl) {
    livePublicUrl = url;
    listeners.forEach((fn) => fn(url));
  }
}

export function subscribePublicAppUrl(fn: (url: string) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

if (typeof window !== 'undefined') {
  try {
    sessionStorage.removeItem('khadam_live_tunnel_url');
    localStorage.removeItem('khadam_live_tunnel_url');
  } catch {
    // ignore
  }
}

export const SHARED_PUBLIC_URL = OFFICIAL_VERCEL_APP_URL;

export function getPublicAppUrl(): string {
  return OFFICIAL_VERCEL_APP_URL;
}

export function getOfficialPublicAppUrl(): string {
  return OFFICIAL_VERCEL_APP_URL;
}

export function getCurrentServerOrigin(): string {
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.origin &&
    window.location.origin !== 'null'
  ) {
    return window.location.origin;
  }
  return OFFICIAL_VERCEL_APP_URL;
}
