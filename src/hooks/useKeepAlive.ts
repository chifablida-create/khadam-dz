import { useState, useEffect, useRef, useCallback } from 'react';
import { setLivePublicTunnelUrl } from '../utils/appUrl';

const PERMANENT_VERCEL_URL = 'https://chifablida-create.github.io/khadam-dz/';
const LIVE_SERVER_FALLBACK = 'https://ais-pre-xlv6qxqnnf5qh6djqimeul-84338738632.europe-west2.run.app';
const FIRESTORE_BASE_URL =
  'https://firestore.googleapis.com/v1/projects/charismatic-castle-z6shk/databases/ai-studio-khadamdz-e03a2bd4-f7fc-4cb5-9f70-63f2c22b676a/documents';
const FIRESTORE_API_KEY = 'AIzaSyDIEs9pw-I8tLu31RIOza2PYu5VZ_ulGp0';
const DELETED_REQUESTS_STORAGE_KEY = 'khadam_dz_deleted_requests_v1';

export function getKhadamApiBase(): string {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  if (host.includes('vercel.app') || host.includes('github.io')) {
    return LIVE_SERVER_FALLBACK;
  }
  return '';
}

function getRequestSignature(r: any): string {
  if (!r) return '';
  return `${String(r.title || '').trim()}|${String(r.wilaya || '').trim()}|${String(r.craft || '').trim()}`;
}

function loadDeletedRequestsSet(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_REQUESTS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function saveDeletedRequestsSet(set: Set<string>): void {
  try {
    localStorage.setItem(DELETED_REQUESTS_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore storage errors
  }
}

export async function markRequestDeletedPermanently(id: string, reqObj?: any): Promise<void> {
  if (!id) return;
  const cleanId = String(id).trim();
  const deletedSet = loadDeletedRequestsSet();
  deletedSet.add(cleanId);
  if (reqObj) {
    const sig = getRequestSignature(reqObj);
    if (sig) deletedSet.add(sig);
  }
  saveDeletedRequestsSet(deletedSet);

  try {
    const docId = encodeURIComponent(cleanId.replace(/[^a-zA-Z0-9_-]/g, '_'));
    await fetch(`${FIRESTORE_BASE_URL}/requests/${docId}?key=${FIRESTORE_API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          id: { stringValue: cleanId },
          title: { stringValue: 'موثق بالبوت - محذوف' },
          desc: { stringValue: 'تم توليد وتوثيق هذا الطلب تلقائياً' },
          craft: { stringValue: String(reqObj?.craft || 'سباك') },
          wilaya: { stringValue: String(reqObj?.wilaya || '16 الجزائر') },
          phone: { stringValue: '0550000000' },
          status: { stringValue: 'completed' },
          createdAt: { integerValue: '1000' }
        }
      })
    });
  } catch {
    // ignore network error
  }
}

export function isFakeOrDeletedRequestItem(r: any): boolean {
  if (!r || !r.id) return true;
  const id = String(r.id).trim();
  const title = String(r.title || '');
  const desc = String(r.desc || '');
  if (
    id.startsWith('req_bot_') ||
    id.startsWith('r_bot_') ||
    id.startsWith('r_match_') ||
    id.startsWith('r_bg_') ||
    id.startsWith('r_sim_') ||
    title.includes('موثق بالبوت') ||
    desc.includes('تم توليد وتوثيق هذا الطلب تلقائياً')
  ) {
    return true;
  }
  const deletedSet = loadDeletedRequestsSet();
  if (deletedSet.has(id)) return true;
  const sig = getRequestSignature(r);
  if (sig && deletedSet.has(sig)) return true;
  return false;
}

export function cleanAndDeduplicateRequests(list: any[]): any[] {
  const byId = new Map<string, any>();
  const seenKeys = new Set<string>();
  const sorted = (Array.isArray(list) ? list : []).filter((r) => !isFakeOrDeletedRequestItem(r));
  for (const r of sorted) {
    const id = String(r.id);
    const dedupKey = getRequestSignature(r);
    if (!byId.has(id) && !seenKeys.has(dedupKey)) {
      byId.set(id, r);
      seenKeys.add(dedupKey);
    }
  }
  return Array.from(byId.values()).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
}

let isStorageHookInstalled = false;
function installPermanentDeleteInterceptor() {
  if (isStorageHookInstalled || typeof window === 'undefined') return;
  isStorageHookInstalled = true;
  try {
    const origSetItem = window.localStorage.setItem.bind(window.localStorage);
    const origGetItem = window.localStorage.getItem.bind(window.localStorage);

    window.localStorage.setItem = function (key: string, value: string) {
      if (key === 'khadam_dz_requests') {
        try {
          const prevRaw = origGetItem('khadam_dz_requests');
          const prevList = prevRaw ? JSON.parse(prevRaw) : [];
          const nextList = value ? JSON.parse(value) : [];
          if (Array.isArray(prevList) && Array.isArray(nextList)) {
            const nextIds = new Set(nextList.map((item: any) => String(item?.id || '')));
            for (const oldItem of prevList) {
              if (oldItem && oldItem.id && !nextIds.has(String(oldItem.id))) {
                markRequestDeletedPermanently(String(oldItem.id), oldItem).catch(() => {});
              }
            }
            const cleanedNext = cleanAndDeduplicateRequests(nextList);
            return origSetItem(key, JSON.stringify(cleanedNext));
          }
        } catch {
          // fallback to normal setItem
        }
      }
      return origSetItem(key, value);
    };
  } catch {
    // ignore if storage cannot be wrapped
  }
}

let isUiShieldInstalled = false;
function installCleanPublicUiShield() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('kdz-clean-public-ui-style')) {
    const style = document.createElement('style');
    style.id = 'kdz-clean-public-ui-style';
    style.textContent = `
      header button[title*="لوحة إدارة التطبيق"] {
        display: none !important;
      }
      header > div > div:first-child {
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
    `;
    document.head.appendChild(style);
  }

  const scrubLeaks = () => {
    try {
      const divs = document.querySelectorAll('div');
      divs.forEach((div) => {
        if (div.closest('.fixed.inset-0')) return;
        const txt = (div.textContent || '').trim();
        // 1. Hide top OnlineKeepAliveStatus bar
        if (
          div.classList.contains('border-b') &&
          (txt.includes('نقل لـ GitHub') ||
            txt.includes('نشر Vercel أونلاين') ||
            (txt.includes('بث مباشر 24/7') && txt.includes('نسخ الرابط')))
        ) {
          (div as HTMLElement).style.display = 'none';
        }
        // 2. Hide subtitle bar with "لوحة الإدارة 🤖"
        if (
          div.classList.contains('border-b') &&
          txt.includes('البوت الذكي والإدارة في خدمة الحرفي') &&
          txt.includes('لوحة الإدارة')
        ) {
          (div as HTMLElement).style.display = 'none';
        }
        // 3. Hide AppPromoBanner green card
        if (
          div.classList.contains('px-3') &&
          div.classList.contains('pt-2') &&
          (txt.includes('تطبيق الهاتف (بدون 403)') ||
            txt.includes('رابط الشحن والإشهار') ||
            txt.includes('نسخ الرابط العام') ||
            txt.includes('بدون خطأ 403'))
        ) {
          (div as HTMLElement).style.display = 'none';
        }
        // 4. Hide bottom 3-button bar
        if (
          div.classList.contains('border-t') &&
          txt.includes('إدارة التطبيق') &&
          txt.includes('الإشهار والرابط')
        ) {
          (div as HTMLElement).style.display = 'none';
        }
        // 5. Hide the two cards in Craftsman Account (حسابي):
        //    - "إشهارات التطبيق والرابط الرسمي"
        //    - "تطبيق متجر Google Play للأندرويد" / "تحميل AAB"
        if (
          div.classList.contains('p-4') &&
          div.classList.contains('rounded-2xl') &&
          div.classList.contains('border') &&
          (txt.includes('إشهارات التطبيق والرابط الرسمي') ||
            txt.includes('انسخ رابط التطبيق وبوستات الإعلانات') ||
            txt.includes('تطبيق متجر Google Play للأندرويد') ||
            txt.includes('تحميل AAB') ||
            txt.includes('تنزيل ملف AAB'))
        ) {
          (div as HTMLElement).style.display = 'none';
        }
      });
    } catch {
      // ignore DOM scrub errors
    }
  };

  scrubLeaks();

  if (!isUiShieldInstalled) {
    isUiShieldInstalled = true;
    const observer = new MutationObserver(() => scrubLeaks());
    observer.observe(document.body, { childList: true, subtree: true });

    // Secret 5-tap handler on the "خدّام ديزاد / DZ" badge in the top navbar
    let tapCount = 0;
    let tapResetTimer: any = null;
    document.addEventListener(
      'click',
      (e) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const headerBrand = target.closest('header > div > div:first-child') as HTMLElement | null;
        if (!headerBrand) return;

        tapCount += 1;
        if (tapResetTimer) clearTimeout(tapResetTimer);
        if (tapCount >= 5) {
          tapCount = 0;
          const hiddenAdminBtn = document.querySelector(
            'header button[title*="لوحة إدارة التطبيق"]'
          ) as HTMLButtonElement | null;
          if (hiddenAdminBtn) {
            hiddenAdminBtn.click();
          }
        } else {
          tapResetTimer = setTimeout(() => {
            tapCount = 0;
          }, 2500);
        }
      },
      true
    );
  }
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
            if (parsed.id && !isFakeOrDeletedRequestItem(parsed)) {
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
  if (!req || !req.id || isFakeOrDeletedRequestItem(req)) return;
  try {
    const docId = encodeURIComponent(String(req.id).replace(/[^a-zA-Z0-9_-]/g, '_'));
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
          status: { stringValue: String(req.status || 'open') }
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
  const pushedRequestIdsRef = useRef<Set<string>>(new Set());
  const seenFirestoreIdsRef = useRef<Set<string>>(new Set());
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    installPermanentDeleteInterceptor();
    installCleanPublicUiShield();
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

  const toggleAntiSleep = useCallback(() => {
    setIsAntiSleepActive((prev) => !prev);
  }, []);

  const sendHeartbeat = useCallback(async () => {
    setLivePublicTunnelUrl(PERMANENT_VERCEL_URL);

    try {
      const rawLocal = localStorage.getItem('khadam_dz_requests');
      if (rawLocal) {
        const parsedLocal = JSON.parse(rawLocal);
        if (Array.isArray(parsedLocal)) {
          for (const item of parsedLocal) {
            if (item?.id) seenFirestoreIdsRef.current.add(String(item.id));
          }
          const cleanedLocal = cleanAndDeduplicateRequests(parsedLocal);
          if (cleanedLocal.length !== parsedLocal.length) {
            localStorage.setItem('khadam_dz_requests', JSON.stringify(cleanedLocal));
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
      // ignore storage errors
    }

    try {
      const fsData = await fetchFirestoreRequestsAndCraftsmen();
      if (fsData) {
        setIsOnline(true);
        setIsLiveStreaming(true);
        setLastHeartbeat(Date.now());

        const validFsRequests = fsData.requests.filter((r) => !isFakeOrDeletedRequestItem(r));
        for (const r of validFsRequests) {
          const rid = String(r.id);
          pushedRequestIdsRef.current.add(rid);
          if (!seenFirestoreIdsRef.current.has(rid)) {
            seenFirestoreIdsRef.current.add(rid);
            optionsRef.current?.onLiveRequest?.(r);
          }
        }

        optionsRef.current?.onFullStateSync?.({
          requests: validFsRequests,
          craftsmen: fsData.craftsmen
        });
      }
    } catch {
      // ignore firestore error
    }
  }, []);

  const pushLiveRequest = useCallback(async (request: any) => {
    if (!request || isFakeOrDeletedRequestItem(request)) return;
    seenFirestoreIdsRef.current.add(String(request.id));
    pushedRequestIdsRef.current.add(String(request.id));
    await pushRequestToFirestoreRest(request);
  }, []);

  const pushLiveBroadcast = useCallback(async () => {}, []);

  useEffect(() => {
    sendHeartbeat();
    requestWakeLock();
    const interval = setInterval(() => {
      sendHeartbeat();
    }, 12000);
    return () => {
      clearInterval(interval);
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
