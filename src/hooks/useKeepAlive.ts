import { useState, useEffect, useRef, useCallback } from 'react';
import { setLivePublicTunnelUrl } from '../utils/appUrl';

const PERMANENT_VERCEL_URL = 'https://khadam-dz-adua.vercel.app';
const LIVE_SERVER_FALLBACK = 'https://ais-pre-xlv6qxqnnf5qh6djqimeul-84338738632.europe-west2.run.app';
const FIRESTORE_BASE_URL =
  'https://firestore.googleapis.com/v1/projects/charismatic-castle-z6shk/databases/ai-studio-khadamdz-e03a2bd4-f7fc-4cb5-9f70-63f2c22b676a/documents';
const FIRESTORE_API_KEY = 'AIzaSyDIEs9pw-I8tLu31RIOza2PYu5VZ_ulGp0';

export function getKhadamApiBase(): string {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  if (host.includes('vercel.app') || host.includes('github.io')) {
    return LIVE_SERVER_FALLBACK;
  }
  return '';
}

function isFakeOrBotRequestItem(r: any): boolean {
  if (!r || !r.id) return true;
  const id = String(r.id);
  const title = String(r.title || '');
  const desc = String(r.desc || '');
  if (
    id.startsWith('req_bot_') ||
    id.startsWith('r_bot_') ||
    id.startsWith('r_match_') ||
    id.startsWith('r_bg_') ||
    title.includes('موثق بالبوت') ||
    desc.includes('تم توليد وتوثيق هذا الطلب تلقائياً')
  ) {
    return true;
  }
  return false;
}

function cleanAndDeduplicateRequests(list: any[]): any[] {
  const byId = new Map<string, any>();
  const seenKeys = new Set<string>();
  const sorted = [...list].filter((r) => !isFakeOrBotRequestItem(r));
  for (const r of sorted) {
    const id = String(r.id);
    const dedupKey = `${String(r.title || '').trim()}|${String(r.wilaya || '').trim()}|${String(r.craft || '').trim()}`;
    if (!byId.has(id) && !seenKeys.has(dedupKey)) {
      byId.set(id, r);
      seenKeys.add(dedupKey);
    }
  }
  return Array.from(byId.values()).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
}

function fromFirestoreFields(fields: Record<string, any> | undefined): Record<string, any> {
  const out: Record<string, any> = {};
  if (!fields) return out;
  for (const [k, v] of Object.entries(fields)) {
    if ('stringValue' in v) out[k] = v.stringValue;
    else if ('integerValue' in v) out[k] = Number(v.integerValue);
    else if ('doubleValue' in v) out[k] = Number(v.doubleValue);
    else if ('booleanValue' in v) out[k] = Boolean(v.booleanValue);
  }
  return out;
}

async function fetchFirestoreRequestsAndCraftsmen(): Promise<{ requests: any[]; craftsmen: any[] } | null> {
  try {
    const [reqRes, crRes] = await Promise.all([
      fetch(`${FIRESTORE_BASE_URL}:runQuery?key=${FIRESTORE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'requests' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'status' },
                op: 'IN',
                value: {
                  arrayValue: {
                    values: [
                      { stringValue: 'open' },
                      { stringValue: 'in_progress' },
                      { stringValue: 'completed' }
                    ]
                  }
                }
              }
            }
          }
        })
      }),
      fetch(`${FIRESTORE_BASE_URL}:runQuery?key=${FIRESTORE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'craftsmen' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'status' },
                op: 'IN',
                value: {
                  arrayValue: {
                    values: [{ stringValue: 'active' }, { stringValue: 'suspended' }]
                  }
                }
              }
            }
          }
        })
      })
    ]);

    const requests: any[] = [];
    if (reqRes.ok) {
      const rows = await reqRes.json();
      if (Array.isArray(rows)) {
        for (const row of rows) {
          if (row?.document?.fields) {
            const parsed = fromFirestoreFields(row.document.fields);
            if (parsed.id && !isFakeOrBotRequestItem(parsed)) {
              requests.push(parsed);
            }
          }
        }
      }
    }

    const craftsmen: any[] = [];
    if (crRes.ok) {
      const rows = await crRes.json();
      if (Array.isArray(rows)) {
        for (const row of rows) {
          if (row?.document?.fields) {
            const parsed = fromFirestoreFields(row.document.fields);
            if (parsed.id) {
              craftsmen.push(parsed);
            }
          }
        }
      }
    }

    return {
      requests: cleanAndDeduplicateRequests(requests),
      craftsmen
    };
  } catch {
    return null;
  }
}

async function pushRequestToFirestoreRest(req: any): Promise<void> {
  if (!req || !req.id || isFakeOrBotRequestItem(req)) return;
  try {
    const docId = encodeURIComponent(String(req.id));
    await fetch(`${FIRESTORE_BASE_URL}/requests/${docId}?key=${FIRESTORE_API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          id: { stringValue: String(req.id) },
          craft: { stringValue: String(req.craft || 'سباك') },
          wilaya: { stringValue: String(req.wilaya || '16 الجزائر') },
          title: { stringValue: String(req.title || '') },
          desc: { stringValue: String(req.desc || '') },
          phone: { stringValue: String(req.phone || '') },
          createdAt: { integerValue: String(Math.floor(Number(req.createdAt || Date.now()))) },
          priority: { booleanValue: Boolean(req.priority) },
          status: { stringValue: String(req.status || 'open') },
          ...(req.budget ? { budget: { stringValue: String(req.budget) } } : {})
        }
      })
    });
  } catch {
    // ignore network error
  }
}

interface UseKeepAliveOptions {
  onLiveRequest?: (req: any) => void;
  onLiveCraftsman?: (craftsman: any) => void;
  onLiveBroadcast?: (bc: any) => void;
  onFullStateSync?: (state: any) => void;
}

export function useKeepAlive(options?: UseKeepAliveOptions) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
  const [isAntiSleepActive, setIsAntiSleepActive] = useState<boolean>(true);
  const [lastHeartbeat, setLastHeartbeat] = useState<number>(Date.now());
  const [serverUptime, setServerUptime] = useState<number>(120);
  const [pulseCount, setPulseCount] = useState<number>(1);
  const [connectedClients, setConnectedClients] = useState<number>(1);

  const wakeLockRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<any>(null);
  const consecutiveFailuresRef = useRef<number>(0);
  const lastRevisionRef = useRef<number>(1);
  const pushedRequestIdsRef = useRef<Set<string>>(new Set());
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const refreshServiceWorkerCache = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'FORCE_UPDATE_ALL' });
        }
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) reg.update().catch(() => {});
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && (navigator as any).wakeLock) {
      try {
        if (!wakeLockRef.current) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          setIsWakeLockActive(true);
          wakeLockRef.current.addEventListener('release', () => {
            wakeLockRef.current = null;
            setIsWakeLockActive(false);
          });
        }
      } catch {
        setIsWakeLockActive(false);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch {
        // ignore
      }
      setIsWakeLockActive(false);
    }
  }, []);

  const startSilentAudioKeepAlive = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.00001;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        audioCtxRef.current = ctx;
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      setIsAntiSleepActive(true);
    } catch {
      // ignore
    }
  }, []);

  const toggleAntiSleep = useCallback(() => {
    setIsAntiSleepActive((prev) => {
      const next = !prev;
      if (next) {
        requestWakeLock();
        startSilentAudioKeepAlive();
      } else {
        releaseWakeLock();
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          audioCtxRef.current.suspend().catch(() => {});
        }
      }
      return next;
    });
  }, [requestWakeLock, releaseWakeLock, startSilentAudioKeepAlive]);

  const sendHeartbeat = useCallback(async () => {
    setLivePublicTunnelUrl(PERMANENT_VERCEL_URL);

    try {
      const rawLocal = localStorage.getItem('khadam_dz_requests');
      if (rawLocal) {
        const parsedLocal = JSON.parse(rawLocal);
        if (Array.isArray(parsedLocal)) {
          const cleanedLocal = cleanAndDeduplicateRequests(parsedLocal);
          if (cleanedLocal.length !== parsedLocal.length) {
            const nextJson = JSON.stringify(cleanedLocal);
            localStorage.setItem('khadam_dz_requests', nextJson);
            window.dispatchEvent(
              new StorageEvent('storage', { key: 'khadam_dz_requests', newValue: nextJson })
            );
          }
          for (const item of cleanedLocal) {
            if (item && item.id && !pushedRequestIdsRef.current.has(String(item.id))) {
              pushedRequestIdsRef.current.add(String(item.id));
              pushRequestToFirestoreRest(item).catch(() => {});
            }
          }
        }
      }
    } catch {
      // ignore
    }

    try {
      const fsData = await fetchFirestoreRequestsAndCraftsmen();
      if (fsData && (fsData.requests.length > 0 || fsData.craftsmen.length > 0)) {
        consecutiveFailuresRef.current = 0;
        setIsOnline(true);
        setIsLiveStreaming(true);
        setLastHeartbeat(Date.now());
        for (const r of fsData.requests) {
          if (r?.id) pushedRequestIdsRef.current.add(String(r.id));
        }
        optionsRef.current?.onFullStateSync?.(fsData);
        for (const req of fsData.requests) {
          if (req && req.id) {
            optionsRef.current?.onLiveRequest?.(req);
          }
        }
        for (const cr of fsData.craftsmen) {
          if (cr && cr.id) {
            optionsRef.current?.onLiveCraftsman?.(cr);
          }
        }
        try {
          const rawLocal = localStorage.getItem('khadam_dz_requests');
          const localArr = rawLocal ? JSON.parse(rawLocal) : [];
          const merged = cleanAndDeduplicateRequests([
            ...fsData.requests,
            ...(Array.isArray(localArr) ? localArr : [])
          ]);
          const prevJson = rawLocal || '';
          const nextJson = JSON.stringify(merged);
          if (prevJson !== nextJson) {
            localStorage.setItem('khadam_dz_requests', nextJson);
            window.dispatchEvent(
              new StorageEvent('storage', { key: 'khadam_dz_requests', newValue: nextJson })
            );
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }

    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'KEEP_ALIVE_PING',
          ts: Date.now()
        });
      }
    } catch {
      // ignore
    }
  }, [refreshServiceWorkerCache]);

  const connectLiveStream = useCallback(() => {
    // Firestore REST sync runs via Web Worker timer every 10s
  }, []);

  const pushLiveRequest = useCallback(async (request: any) => {
    await pushRequestToFirestoreRest(request);
  }, []);

  const pushLiveBroadcast = useCallback(async () => {}, []);

  useEffect(() => {
    sendHeartbeat();
    requestWakeLock();

    let worker: Worker | null = null;
    let fallbackInterval: any = null;
    try {
      const workerCode = 'setInterval(function() { postMessage("tick"); }, 10000);';
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      worker = new Worker(URL.createObjectURL(blob));
      worker.onmessage = () => {
        sendHeartbeat();
      };
    } catch {
      fallbackInterval = setInterval(() => {
        sendHeartbeat();
      }, 10000);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (worker) worker.terminate();
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
      releaseWakeLock();
    };
  }, [sendHeartbeat, requestWakeLock, releaseWakeLock]);

  return {
    isOnline,
    isLiveStreaming,
    isWakeLockActive,
    isAntiSleepActive,
    lastHeartbeat,
    serverUptime,
    pulseCount,
    connectedClients,
    requestWakeLock,
    toggleAntiSleep,
    sendHeartbeat,
    pushLiveRequest,
    pushLiveBroadcast
  };
}
