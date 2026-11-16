import { useState, useEffect, useRef, useCallback } from 'react';
import { setLivePublicTunnelUrl } from '../utils/appUrl';
import {
  fetchDemandesFromSupabase,
  fetchArtisansFromSupabase,
  saveDemandeToSupabase,
  saveArtisanToSupabase,
  deleteDemandeFromSupabase,
  subscribeToSupabaseRealtime
} from '../supabase.js';

const PERMANENT_VERCEL_URL = 'https://khadam-dz-2q6o.vercel.app/';
const LIVE_SERVER_FALLBACK = 'https://ais-pre-xlv6qxqnnf5qh6djqimeul-84338738632.europe-west2.run.app';
const FIRESTORE_BASE_URL =
  'https://firestore.googleapis.com/v1/projects/charismatic-castle-z6shk/databases/ai-studio-khadamdz-e03a2bd4-f7fc-4cb5-9f70-63f2c22b676a/documents';
const FIRESTORE_API_KEY = 'AIzaSyDIEs9pw-I8tLu31RIOza2PYu5VZ_ulGp0';

let firestoreRestCooldownUntil = 0;

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

const deletedRequestsMemorySet = new Set<string>();

export async function markRequestDeletedPermanently(id: string, reqObj?: any): Promise<void> {
  if (!id) return;
  const cleanId = String(id).trim();
  deletedRequestsMemorySet.add(cleanId);
  if (reqObj) {
    const sig = getRequestSignature(reqObj);
    if (sig) deletedRequestsMemorySet.add(sig);
  }

  // Delete from Supabase demandes table
  await deleteDemandeFromSupabase(reqObj || cleanId);

  if (Date.now() < firestoreRestCooldownUntil) return;
  try {
    const docId = cleanId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
    if (!docId) return;
    const res = await fetch(`${FIRESTORE_BASE_URL}/requests/${encodeURIComponent(docId)}?key=${FIRESTORE_API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          id: { stringValue: docId },
          title: { stringValue: 'موثق بالبوت - محذوف' },
          desc: { stringValue: 'تم توليد وتوثيق هذا الطلب تلقائياً' },
          craft: { stringValue: String(reqObj?.craft || 'سباك').slice(0, 80) || 'سباك' },
          wilaya: { stringValue: String(reqObj?.wilaya || '16 الجزائر').slice(0, 80) || '16 الجزائر' },
          phone: { stringValue: '0550000000' },
          priority: { booleanValue: false },
          status: { stringValue: 'completed' },
          createdAt: { integerValue: '1000' },
          isCustomerOwn: { booleanValue: false }
        }
      })
    });
    if (res.status === 429) {
      firestoreRestCooldownUntil = Date.now() + 10 * 60 * 1000;
    }
  } catch {
    // ignore network error
  }
}

const SEED_CRAFTSMAN_CARD_IDS_SET = new Set([
  'req_cr_cp1',
  'req_cr_cp2',
  'req_cr_cp3',
  'req_cr_cp4',
  'req_cr_cp5',
  'req_cr_cp6'
]);

export function isFakeOrDeletedRequestItem(r: any): boolean {
  if (!r || !r.id) return true;
  const id = String(r.id).trim();
  const title = String(r.title || '').trim();
  const desc = String(r.desc || '').trim();
  if (
    /^r([1-9]|1[0-9]|20)$/.test(id) ||
    SEED_CRAFTSMAN_CARD_IDS_SET.has(id) ||
    id.startsWith('req_bot_') ||
    id.startsWith('r_bot_') ||
    id.startsWith('r_match_') ||
    id.startsWith('r_bg_') ||
    id.startsWith('r_sim_') ||
    title.includes('حرفي معتمد متاح') ||
    title.includes('موثق بالبوت') ||
    FAKE_DEMO_TITLES.has(title) ||
    desc.includes('متوفر حالياً لتنفيذ أشغال') ||
    desc.includes('تم توليد وتوثيق هذا الطلب تلقائياً') ||
    desc.includes('زبون يبحث عن حرفي معتمد في')
  ) {
    return true;
  }
  if (deletedRequestsMemorySet.has(id)) return true;
  const sig = getRequestSignature(r);
  if (sig && deletedRequestsMemorySet.has(sig)) return true;
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
    if (byId.has(id)) {
      const existing = byId.get(id);
      byId.set(id, {
        ...existing,
        ...r,
        revealedByCraftsmanName: r.revealedByCraftsmanName || existing.revealedByCraftsmanName || '',
        agreedByCraftsmanName: r.agreedByCraftsmanName || existing.agreedByCraftsmanName || '',
        isAgreed: Boolean(r.isAgreed || existing.isAgreed),
        agreementTimeNote: r.agreementTimeNote ?? existing.agreementTimeNote ?? '',
        agreementScheduledAt: Number(r.agreementScheduledAt || existing.agreementScheduledAt || 0),
        agreementReminderMinutes: Number(r.agreementReminderMinutes || existing.agreementReminderMinutes || 30),
        cancellationReason: r.cancellationReason ?? existing.cancellationReason ?? '',
        customerRatingStars: Number(r.customerRatingStars || existing.customerRatingStars || 0),
        customerRatingComment: r.customerRatingComment ?? existing.customerRatingComment ?? '',
        customerRatedAt: Number(r.customerRatedAt || existing.customerRatedAt || 0),
        status:
          r.status === 'completed' || existing.status === 'completed'
            ? 'completed'
            : r.status === 'in_progress' || existing.status === 'in_progress' || r.isAgreed || existing.isAgreed
            ? 'in_progress'
            : 'open'
      });
    } else if (!seenKeys.has(dedupKey)) {
      byId.set(id, r);
      seenKeys.add(dedupKey);
    }
  }
  return Array.from(byId.values()).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
}

let isUiShieldInstalled = false;
function installCleanPublicUiShield() {
  if (typeof document === 'undefined' || isUiShieldInstalled) return;
  isUiShieldInstalled = true;

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

  const triggerAdminOpen = () => {
    if (typeof window !== 'undefined' && typeof (window as any).__KDZ_OPEN_ADMIN_LOGIN__ === 'function') {
      (window as any).__KDZ_OPEN_ADMIN_LOGIN__();
      return;
    }
    const hiddenAdminBtn = document.querySelector(
      'header button[title*="لوحة إدارة التطبيق"]'
    ) as HTMLButtonElement | null;
    if (hiddenAdminBtn) {
      hiddenAdminBtn.click();
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
        triggerAdminOpen();
      } else {
        tapResetTimer = setTimeout(() => {
          tapCount = 0;
        }, 3500);
      }
    },
    true
  );
}

export async function pushRequestToFirestoreRest(req: any): Promise<void> {
  if (!req || !req.id || isFakeOrDeletedRequestItem(req)) return;
  const sanitized = sanitizeRequestItem(req);

  // 1. Always save to Supabase demandes table
  saveDemandeToSupabase(sanitized).catch(() => {});

  // 2. Also sync to Firebase REST if quota is available
  if (Date.now() < firestoreRestCooldownUntil) return;
  try {
    const docId = String(sanitized.id).trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
    if (!docId) return;
    const rawPhoneStr = String(sanitized.phone || '').trim().slice(0, 40);
    const isPhoneMasked =
      !rawPhoneStr ||
      rawPhoneStr.includes('•') ||
      rawPhoneStr.includes('*') ||
      rawPhoneStr.includes('مقفل') ||
      rawPhoneStr.replace(/\D/g, '').length < 8;
    const titleStr = String(sanitized.title || 'طلب خدمة').trim().slice(0, 200) || 'طلب خدمة';
    const craftStr = String(sanitized.craft || 'سباك').trim().slice(0, 80) || 'سباك';
    const wilayaStr = String(sanitized.wilaya || '16 الجزائر').trim().slice(0, 80) || '16 الجزائر';
    const statusStr = sanitized.status === 'in_progress' || sanitized.status === 'completed' ? sanitized.status : 'open';
    const isSeedItem = docId.startsWith('req_live_dz_');
    const createdAtNum = isSeedItem
      ? Math.min(1700000999000, Math.max(1000, Math.floor(Number(sanitized.createdAt || 1700000101000))))
      : Math.max(1000, Math.floor(Number(sanitized.createdAt || Date.now())));

    const fieldsObj: Record<string, any> = {
      id: { stringValue: docId },
      craft: { stringValue: craftStr },
      wilaya: { stringValue: wilayaStr },
      title: { stringValue: titleStr },
      desc: { stringValue: String(sanitized.desc || '').slice(0, 600) },
      createdAt: { integerValue: String(createdAtNum) },
      priority: { booleanValue: Boolean(sanitized.priority) },
      status: { stringValue: statusStr },
      isCustomerOwn: { booleanValue: Boolean(sanitized.isCustomerOwn) },
      revealedByCraftsmanName: { stringValue: String(sanitized.revealedByCraftsmanName || '').trim().slice(0, 120) },
      agreedByCraftsmanName: { stringValue: String(sanitized.agreedByCraftsmanName || '').trim().slice(0, 120) },
      isAgreed: { booleanValue: Boolean(sanitized.isAgreed) },
      agreementTimeNote: { stringValue: String(sanitized.agreementTimeNote || '').trim().slice(0, 200) },
      agreementScheduledAt: {
        integerValue: String(Math.max(0, Math.floor(Number(sanitized.agreementScheduledAt) || 0)))
      },
      agreementReminderMinutes: {
        integerValue: String(Math.max(5, Math.floor(Number(sanitized.agreementReminderMinutes) || 30)))
      },
      cancellationReason: { stringValue: String(sanitized.cancellationReason || '').trim().slice(0, 200) },
      customerRatingStars: {
        integerValue: String(Math.max(0, Math.min(5, Math.floor(Number(sanitized.customerRatingStars) || 0))))
      },
      customerRatingComment: { stringValue: String(sanitized.customerRatingComment || '').trim().slice(0, 300) },
      customerRatedAt: {
        integerValue: String(Math.max(0, Math.floor(Number(sanitized.customerRatedAt) || 0)))
      }
    };

    if (!isPhoneMasked) {
      fieldsObj.phone = { stringValue: rawPhoneStr };
      const res = await fetch(`${FIRESTORE_BASE_URL}/requests/${encodeURIComponent(docId)}?key=${FIRESTORE_API_KEY}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsObj })
      });
      if (res.status === 429) firestoreRestCooldownUntil = Date.now() + 10 * 60 * 1000;
    } else {
      const maskParams = Object.keys(fieldsObj)
        .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
        .join('&');
      const res = await fetch(
        `${FIRESTORE_BASE_URL}/requests/${encodeURIComponent(docId)}?key=${FIRESTORE_API_KEY}&${maskParams}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: fieldsObj })
        }
      );
      if (res.status === 429) firestoreRestCooldownUntil = Date.now() + 10 * 60 * 1000;
    }
  } catch {
    // ignore network error
  }
}

export async function pushCraftsmanToFirestoreRest(c: any, revealedPhonesList?: string[]): Promise<void> {
  if (!c || !c.id || !c.name) return;

  // 1. Always save craftsman & points to Supabase artisans table
  saveArtisanToSupabase(c, revealedPhonesList).catch(() => {});

  // 2. Also sync to Firebase REST if quota is available
  if (Date.now() < firestoreRestCooldownUntil) return;
  try {
    const docId = String(c.id).trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
    if (!docId) return;
    const nameStr = String(c.name || 'حرفي معتمد').trim().slice(0, 120) || 'حرفي معتمد';
    const craftStr = String(c.craft || 'سباك').trim().slice(0, 80) || 'سباك';
    const wilayaStr = String(c.wilaya || '16 الجزائر').trim().slice(0, 80) || '16 الجزائر';
    const phoneStr = String(c.phone || '0550000000').trim().slice(0, 40);
    const pts = Math.max(0, Math.min(1000000, Math.floor(Number(c.points ?? 50) || 50)));
    const res = await fetch(`${FIRESTORE_BASE_URL}/craftsmen/${encodeURIComponent(docId)}?key=${FIRESTORE_API_KEY}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          id: { stringValue: docId },
          name: { stringValue: nameStr },
          craft: { stringValue: craftStr },
          wilaya: { stringValue: wilayaStr },
          phone: { stringValue: phoneStr.length >= 4 ? phoneStr : '0550000000' },
          points: { integerValue: String(pts) },
          baseAvg: { doubleValue: Number(c.baseAvg || 4.9) },
          baseCount: { integerValue: String(Math.floor(Number(c.baseCount || 5))) },
          complaints: { integerValue: String(Math.floor(Number(c.complaints || 0))) },
          isVerified: { booleanValue: Boolean(c.isVerified !== false) },
          isVip: { booleanValue: Boolean(c.isVip) },
          status: { stringValue: c.status === 'suspended' ? 'suspended' : 'active' },
          bio: { stringValue: String(c.bio || 'حرفي معتمد في منصة خدّام ديزاد').slice(0, 300) },
          experience: { stringValue: String(c.experience || '5 سنوات').slice(0, 120) }
        }
      })
    });
    if (res.status === 429) firestoreRestCooldownUntil = Date.now() + 10 * 60 * 1000;
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
  const [serverUptime] = useState<number>(120);
  const [pulseCount] = useState<number>(1);
  const [connectedClients] = useState<number>(1);

  const wakeLockRef = useRef<any>(null);
  const seenRequestIdsRef = useRef<Set<string>>(new Set());
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
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
      const [supaDemandes, supaArtisans] = await Promise.all([
        fetchDemandesFromSupabase(),
        fetchArtisansFromSupabase()
      ]);

      if ((Array.isArray(supaDemandes) && supaDemandes.length > 0) || (Array.isArray(supaArtisans) && supaArtisans.length > 0)) {
        setIsOnline(true);
        setIsLiveStreaming(true);
        setLastHeartbeat(Date.now());

        const validDemandes = cleanAndDeduplicateRequests(supaDemandes || []);
        for (const r of validDemandes) {
          const rid = String(r.id);
          if (!seenRequestIdsRef.current.has(rid)) {
            seenRequestIdsRef.current.add(rid);
            optionsRef.current?.onLiveRequest?.(r);
          }
        }

        if (Array.isArray(supaArtisans)) {
          for (const c of supaArtisans) {
            if (c && c.id) {
              optionsRef.current?.onLiveCraftsman?.(c);
            }
          }
        }

        optionsRef.current?.onFullStateSync?.({
          requests: validDemandes,
          craftsmen: supaArtisans || []
        });
      }
    } catch {
      // ignore supabase poll error
    }
  }, []);

  const pushLiveRequest = useCallback(async (request: any) => {
    if (!request || isFakeOrDeletedRequestItem(request)) return;
    const sanitized = sanitizeRequestItem(request);
    seenRequestIdsRef.current.add(String(sanitized.id));
    await pushRequestToFirestoreRest(sanitized);
  }, []);

  const pushLiveBroadcast = useCallback(async () => {}, []);

  useEffect(() => {
    sendHeartbeat();
    requestWakeLock();

    // Real-time instant subscription via Supabase (demandes + artisans)
    const unsubSupabase = subscribeToSupabaseRealtime({
      onDemandesSnapshot: (demandes) => {
        const cleaned = cleanAndDeduplicateRequests(demandes);
        for (const r of cleaned) {
          if (r && r.id && !seenRequestIdsRef.current.has(String(r.id))) {
            seenRequestIdsRef.current.add(String(r.id));
            optionsRef.current?.onLiveRequest?.(r);
          }
        }
        optionsRef.current?.onFullStateSync?.({ requests: cleaned });
      },
      onArtisansSnapshot: (artisans) => {
        for (const c of artisans) {
          if (c && c.id) {
            optionsRef.current?.onLiveCraftsman?.(c);
          }
        }
        optionsRef.current?.onFullStateSync?.({ craftsmen: artisans });
      },
      onSingleDemandeChange: (demande) => {
        if (demande && demande.id) {
          if (!seenRequestIdsRef.current.has(String(demande.id))) {
            seenRequestIdsRef.current.add(String(demande.id));
          }
          optionsRef.current?.onLiveRequest?.(demande);
        }
      },
      onSingleArtisanChange: (artisan) => {
        if (artisan && artisan.id) {
          optionsRef.current?.onLiveCraftsman?.(artisan);
        }
      }
    });

    const triggerBot30SecAllPhonesSync = () => {
      requestWakeLock();
      sendHeartbeat();
      const apiBase = getKhadamApiBase();
      fetch(`${apiBase}/api/bot/30s-sync-now`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'auto_30s_no_sleep' })
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && (Array.isArray(data.requests) || Array.isArray(data.craftsmen))) {
            optionsRef.current?.onFullStateSync?.({
              requests: data.requests || [],
              craftsmen: data.craftsmen || []
            });
          }
        })
        .catch(() => {});
    };

    const fastInterval = setInterval(() => {
      sendHeartbeat();
    }, 10000);

    const bot30sInterval = setInterval(() => {
      triggerBot30SecAllPhonesSync();
    }, 30000);

    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        triggerBot30SecAllPhonesSync();
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      unsubSupabase();
      clearInterval(fastInterval);
      clearInterval(bot30sInterval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
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
