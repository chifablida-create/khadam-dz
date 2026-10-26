import { useState, useEffect, useRef, useCallback } from 'react';
import { setLivePublicTunnelUrl } from '../utils/appUrl';

const PERMANENT_VERCEL_URL = 'https://khadam-dz-adua.vercel.app/';
const LIVE_SERVER_FALLBACK = 'https://ais-pre-xlv6qxqnnf5qh6djqimeul-84338738632.europe-west2.run.app';
const FIRESTORE_BASE_URL =
  'https://firestore.googleapis.com/v1/projects/charismatic-castle-z6shk/databases/ai-studio-khadamdz-e03a2bd4-f7fc-4cb5-9f70-63f2c22b676a/documents';
const FIRESTORE_API_KEY = 'AIzaSyDIEs9pw-I8tLu31RIOza2PYu5VZ_ulGp0';
const DELETED_REQUESTS_STORAGE_KEY = 'khadam_dz_deleted_requests_v1';

const FAKE_DEMO_TITLES = new Set([
  'تسريب مياه في المطبخ يحتاج إصلاح فوري',
  'انقطاع كهرباء في غرفة واحدة',
  'تركيب باب خشبي جديد مع الإطار',
  'مكيف هوائي لا يبرد - سامسونغ 12000 BTU',
  'دهان شقة كاملة مساحة 70 متر مربع',
  'تغيير زيت + فلتر لسيارة كليو 4',
  'استبدال زجاج نافذة مكسور 120x100',
  'تعديل وتضييق بدلة رجالية رسمية',
  'بناء جدار فاصل 4 أمتار في فناء المنزل',
  'صناعة باب حديدي خارجي للحديقة',
  'استبدال شاشة ايفون 12 مكسورة',
  'غسالة كوندور أوتوماتيك لا تدور في مرحلة العصر',
  'تسريب مياه ساخنة في الحمام يحتاج إصلاح فوري',
  'تركيب سخان ماء جديد وشبكة أنابيب نحاسية',
  'انسداد في مجرى المطبخ يحتاج تسليك عاجل',
  'انقطاع كهرباء في المحل التجاري وقواطع تسقط باستمرار',
  'تركيب سبوتات ليد ولوحة كهربائية جديدة',
  'تشخيص شورت كهربائي منزلي وإصلاح القاطع',
  'إصلاح باب خشب صلب معلق وتغيير القفل الداخلي',
  'تفصيل وتركيب خزانة ملابس عصرية MDF',
  'تركيب مطبخ عصري مجهز بالدرارية',
  'مكيف كوندور 18000 BTU ينقط ماء ولا يبرد الغرفة',
  'شحن غاز فريون R410 مع تنظيف الفلاتر بالكامل',
  'صيانة مكيف مركزي للصالون التجاري',
  'دهان صالون وشقة كاملة بلون ساتيني عاجي مع معالجة الرطوبة',
  'تجديد دهان فيلا خارجية مع عزل مائي'
]);

export function maskPhoneNumbersInText(input: any, shortMask: boolean = false): string {
  if (!input) return '';
  const replacement = shortMask
    ? ' [🔒 رقم محجوب] '
    : ' [🔒 رقم الهاتف محجوب - اكشف الرقم عبر المنصة] ';
  let text = String(input);

  // 1. Mask any sequence of 8 to 14 digits (including Arabic/Persian digits and separators like spaces, dots, dashes)
  const phoneRegex =
    /(?:\+?\s*213[\s.\-_/*(),]*|00\s*213[\s.\-_/*(),]*)?[0-9٠-٩۰-۹](?:[\s.\-_/*(),]*[0-9٠-٩۰-۹]){7,13}/g;
  text = text.replace(phoneRegex, replacement);

  // 2. Mask phone numbers written out in Arabic words (3+ consecutive number words)
  const arabicWordNum =
    '(?:و)?(?:صفر|واحد|زوج|اثنان|اثنين|ثلاثة|ثلاثه|اربعة|أربعة|اربعه|خمسة|خمسه|ستة|سته|سبعة|سبعه|ثمانية|ثمانيه|تسعة|تسعه|عشرة|عشرين|ثلاثين|اربعين|أربعين|خمسين|ستين|سبعين|ثمانين|تسعين|زيرو|سانك|سيس|سات|ويت|ناف)';
  const wordPhoneRegex = new RegExp(arabicWordNum + '(?:[\\s،,-]+' + arabicWordNum + '){2,}', 'gi');
  text = text.replace(wordPhoneRegex, replacement);

  return text.replace(/\s{2,}/g, ' ').trim();
}

export function sanitizeRequestItem(r: any): any {
  if (!r || typeof r !== 'object') return r;
  return {
    ...r,
    title: maskPhoneNumbersInText(r.title, true),
    desc: maskPhoneNumbersInText(r.desc, false)
  };
}

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
    const raw = window.localStorage.getItem(DELETED_REQUESTS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function saveDeletedRequestsSet(set: Set<string>): void {
  try {
    window.localStorage.setItem(DELETED_REQUESTS_STORAGE_KEY, JSON.stringify(Array.from(set)));
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
  const title = String(r.title || '').trim();
  const desc = String(r.desc || '').trim();
  if (
    /^r([1-9]|1[0-9]|20)$/.test(id) ||
    id.startsWith('req_bot_') ||
    id.startsWith('r_bot_') ||
    id.startsWith('r_match_') ||
    id.startsWith('r_bg_') ||
    id.startsWith('r_sim_') ||
    title.includes('موثق بالبوت') ||
    FAKE_DEMO_TITLES.has(title) ||
    desc.includes('تم توليد وتوثيق هذا الطلب تلقائياً') ||
    desc.includes('زبون يبحث عن حرفي معتمد في')
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
  const sorted = (Array.isArray(list) ? list : [])
    .filter((r) => !isFakeOrDeletedRequestItem(r))
    .map((r) => sanitizeRequestItem(r));
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

function isRequestsKey(key: string): boolean {
  return key === 'khadam_requests' || key === 'khadam_dz_requests';
}

let isStorageHookInstalled = false;
let rawStorageSetItem: ((k: string, v: string) => void) | null = null;
let rawStorageGetItem: ((k: string) => string | null) | null = null;

function installPermanentDeleteInterceptor() {
  if (isStorageHookInstalled || typeof window === 'undefined') return;
  isStorageHookInstalled = true;
  try {
    const origSetItem = window.localStorage.setItem.bind(window.localStorage);
    const origGetItem = window.localStorage.getItem.bind(window.localStorage);
    rawStorageSetItem = origSetItem;
    rawStorageGetItem = origGetItem;

    for (const reqKey of ['khadam_requests', 'khadam_dz_requests']) {
      try {
        const raw = origGetItem(reqKey);
        if (!raw) {
          origSetItem(reqKey, '[]');
        } else {
          const parsed = JSON.parse(raw);
          const cleaned = cleanAndDeduplicateRequests(Array.isArray(parsed) ? parsed : []);
          origSetItem(reqKey, JSON.stringify(cleaned));
        }
      } catch {
        origSetItem(reqKey, '[]');
      }
    }

    const demoCleanMap: Record<string, Set<string>> = {
      khadam_pending_points: new Set(['pr1', 'pr2']),
      khadam_complaints: new Set(['co1', 'co2']),
      khadam_broadcast_notifications: new Set(['bc1', 'bc2']),
      khadam_app_notifications: new Set(['notif_match_1', 'notif_points_warn']),
      khadam_ratings: new Set(['rt1', 'rt2', 'rt3'])
    };
    for (const [k, fakeIds] of Object.entries(demoCleanMap)) {
      try {
        const raw = origGetItem(k);
        if (!raw) {
          origSetItem(k, '[]');
        } else {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            const filtered = arr
              .filter(
                (item: any) =>
                  item &&
                  !fakeIds.has(String(item.id || '')) &&
                  !String(item.id || '').includes('r_sim_')
              )
              .map((item: any) =>
                k === 'khadam_ratings' && item?.comment
                  ? { ...item, comment: maskPhoneNumbersInText(item.comment, false) }
                  : item
              );
            origSetItem(k, JSON.stringify(filtered));
          }
        }
      } catch {
        origSetItem(k, '[]');
      }
    }

    window.localStorage.setItem = function (key: string, value: string) {
      if (isRequestsKey(key)) {
        try {
          const prevRaw = origGetItem(key);
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
            const serialized = JSON.stringify(cleanedNext);
            origSetItem('khadam_requests', serialized);
            origSetItem('khadam_dz_requests', serialized);
            return;
          }
        } catch {
          // fallback to normal setItem
        }
      }
      if (key === 'khadam_ratings' || key === 'khadam_dz_ratings') {
        try {
          const nextRatings = value ? JSON.parse(value) : [];
          if (Array.isArray(nextRatings)) {
            const sanitizedRatings = nextRatings.map((rt: any) =>
              rt && rt.comment ? { ...rt, comment: maskPhoneNumbersInText(rt.comment, false) } : rt
            );
            return origSetItem(key, JSON.stringify(sanitizedRatings));
          }
        } catch {
          // fallback
        }
      }
      return origSetItem(key, value);
    };
  } catch {
    // ignore if storage cannot be wrapped
  }
}

if (typeof window !== 'undefined') {
  installPermanentDeleteInterceptor();
}

let isUiShieldInstalled = false;
function installCleanPublicUiShield() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('kdz-clean-public-ui-style')) {
    const style = document.createElement('style');
    style.id = 'kdz-clean-public-ui-style';
    style.textContent = `
      header, header > div {
        flex-wrap: nowrap !important;
      }
      header, header * {
        touch-action: manipulation !important;
        -webkit-tap-highlight-color: transparent;
      }
      header button[title*="لوحة إدارة التطبيق"] {
        opacity: 0 !important;
        width: 0px !important;
        height: 0px !important;
        padding: 0 !important;
        margin: 0 !important;
        border: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
        position: absolute !important;
      }
      header > div > div:first-child,
      header > div > div:first-child * {
        cursor: pointer !important;
        user-select: none !important;
        -webkit-user-select: none !important;
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
        if (
          div.classList.contains('border-b') &&
          (txt.includes('نقل لـ GitHub') ||
            txt.includes('نشر Vercel أونلاين') ||
            (txt.includes('بث مباشر 24/7') && txt.includes('نسخ الرابط')))
        ) {
          (div as HTMLElement).style.display = 'none';
        }
        if (
          div.classList.contains('border-b') &&
          txt.includes('البوت الذكي والإدارة في خدمة الحرفي') &&
          txt.includes('لوحة الإدارة')
        ) {
          (div as HTMLElement).style.display = 'none';
        }
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
        if (
          div.classList.contains('border-t') &&
          txt.includes('إدارة التطبيق') &&
          txt.includes('الإشهار والرابط')
        ) {
          (div as HTMLElement).style.display = 'none';
        }
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

      // Also scrub any phone numbers leaked inside visible request titles, descriptions, or comments in the DOM
      const textElements = document.querySelectorAll('h3, p');
      textElements.forEach((el) => {
        const rawText = el.textContent || '';
        if (!rawText || rawText.includes('هاتف الزبون:') || rawText.includes('0550 00')) return;
        const masked = maskPhoneNumbersInText(rawText, el.tagName === 'H3');
        if (masked !== rawText) {
          el.textContent = masked;
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

    const showTapToast = (msg: string) => {
      try {
        let toast = document.getElementById('kdz-secret-tap-toast');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'kdz-secret-tap-toast';
          toast.style.cssText =
            'position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:99999;background:#065f46;color:#fff;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:900;box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:none;transition:opacity 0.2s;border:1px solid #34d399;';
          document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
      } catch {
        // ignore
      }
    };

    const hideTapToast = () => {
      const toast = document.getElementById('kdz-secret-tap-toast');
      if (toast) toast.style.opacity = '0';
    };

    const triggerAdminOpen = () => {
      const hiddenAdminBtn = document.querySelector(
        'header button[title*="لوحة إدارة التطبيق"]'
      ) as HTMLButtonElement | null;
      if (hiddenAdminBtn) {
        hiddenAdminBtn.click();
        return;
      }
      const allButtons = Array.from(document.querySelectorAll('button'));
      for (const btn of allButtons) {
        const t = (btn.getAttribute('title') || '') + ' ' + (btn.textContent || '');
        if (
          t.includes('لوحة إدارة التطبيق') ||
          t.includes('لوحة الإدارة') ||
          t.includes('إدارة التطبيق')
        ) {
          (btn as HTMLButtonElement).click();
          return;
        }
      }
    };

    let tapCount = 0;
    let tapResetTimer: any = null;
    document.addEventListener(
      'click',
      (e) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const inHeaderBrand = Boolean(
          target.closest('header > div > div:first-child') ||
            (target.closest('header') && !target.closest('button'))
        );
        const inDzBadge = Boolean(
          target.closest('span')?.textContent?.includes('موثق DZ') ||
            target.closest('span')?.textContent?.includes('ديزاد')
        );
        if (!inHeaderBrand && !inDzBadge) return;

        tapCount += 1;
        if (tapResetTimer) clearTimeout(tapResetTimer);

        if (tapCount >= 5) {
          tapCount = 0;
          showTapToast('🔓 فتح الإدارة...');
          setTimeout(hideTapToast, 900);
          triggerAdminOpen();
        } else {
          if (tapCount >= 2) {
            showTapToast(`🔐 الإدارة: ${tapCount} / 5`);
          }
          tapResetTimer = setTimeout(() => {
            tapCount = 0;
            hideTapToast();
          }, 4000);
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
            const parsed = sanitizeRequestItem(fromFirestoreFields(row.document.fields));
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
  const sanitized = sanitizeRequestItem(req);
  try {
    const docId = encodeURIComponent(String(sanitized.id).replace(/[^a-zA-Z0-9_-]/g, '_'));
    await fetch(`${FIRESTORE_BASE_URL}/requests/${docId}?key=${FIRESTORE_API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          id: { stringValue: String(sanitized.id) },
          craft: { stringValue: String(sanitized.craft || 'سباك') },
          wilaya: { stringValue: String(sanitized.wilaya || '16 الجزائر') },
          title: { stringValue: String(sanitized.title || '') },
          desc: { stringValue: String(sanitized.desc || '') },
          phone: { stringValue: String(sanitized.phone || '') },
          createdAt: { integerValue: String(Math.floor(Number(sanitized.createdAt || Date.now()))) },
          priority: { booleanValue: Boolean(sanitized.priority) },
          status: { stringValue: String(sanitized.status || 'open') }
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

    for (const reqKey of ['khadam_requests', 'khadam_dz_requests']) {
      try {
        const rawLocal = rawStorageGetItem ? rawStorageGetItem(reqKey) : localStorage.getItem(reqKey);
        if (rawLocal) {
          const parsedLocal = JSON.parse(rawLocal);
          if (Array.isArray(parsedLocal)) {
            for (const item of parsedLocal) {
              if (item?.id) seenFirestoreIdsRef.current.add(String(item.id));
            }
            const cleanedLocal = cleanAndDeduplicateRequests(parsedLocal);
            if (rawStorageSetItem) {
              rawStorageSetItem(reqKey, JSON.stringify(cleanedLocal));
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
    }

    try {
      const fsData = await fetchFirestoreRequestsAndCraftsmen();
      if (fsData) {
        setIsOnline(true);
        setIsLiveStreaming(true);
        setLastHeartbeat(Date.now());

        const validFsRequests = fsData.requests
          .filter((r) => !isFakeOrDeletedRequestItem(r))
          .map((r) => sanitizeRequestItem(r));

        for (const r of validFsRequests) {
          const rid = String(r.id);
          pushedRequestIdsRef.current.add(rid);
          if (!seenFirestoreIdsRef.current.has(rid)) {
            seenFirestoreIdsRef.current.add(rid);
            optionsRef.current?.onLiveRequest?.(r);
          }
        }

        if (rawStorageSetItem) {
          const serialized = JSON.stringify(validFsRequests);
          rawStorageSetItem('khadam_requests', serialized);
          rawStorageSetItem('khadam_dz_requests', serialized);
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
    const sanitized = sanitizeRequestItem(request);
    seenFirestoreIdsRef.current.add(String(sanitized.id));
    pushedRequestIdsRef.current.add(String(sanitized.id));
    await pushRequestToFirestoreRest(sanitized);
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
