import { RequestItem, CraftsmanUser, RatingItem, ComplaintItem, PendingRecharge, ChatThread, BroadcastNotification, AppNotification } from '../types';

export const WILAYAS_DZ = [
  "01 أدرار", "02 الشلف", "03 الأغواط", "04 أم البواقي", "05 باتنة",
  "06 بجاية", "07 بسكرة", "08 بشار", "09 البليدة", "10 البويرة",
  "11 تمنراست", "12 تبسة", "13 تلمسان", "14 تيارت", "15 تيزي وزو",
  "16 الجزائر", "17 الجلفة", "18 جيجل", "19 سطيف", "20 سعيدة",
  "21 سكيكدة", "22 سيدي بلعباس", "23 عنابة", "24 قالمة", "25 قسنطينة",
  "26 المدية", "27 مستغانم", "28 المسيلة", "29 معسكر", "30 ورقلة",
  "31 وهران", "32 البيض", "33 إيليزي", "34 برج بوعريريج", "35 بومرداس",
  "36 الطارف", "37 تندوف", "38 تيسمسيلت", "39 الوادي", "40 خنشلة",
  "41 سوق أهراس", "42 تيبازة", "43 ميلة", "44 عين الدفلى", "45 النعامة",
  "46 عين تموشنت", "47 غرداية", "48 غليزان", "49 تيميمون", "50 برج باجي مختار",
  "51 أولاد جلال", "52 بني عباس", "53 عين صالح", "54 عين قزام", "55 تقرت",
  "56 جانت", "57 المغير", "58 المنيعة"
];

export const CRAFTS_LIST = [
  "سباك", "كهربائي", "نجار", "دهان", "بناء", "حداد", "زجاج", "تبريد", "خياط", "ميكانيكي",
  "منظف", "طباخ", "حلاق", "مصور", "سائق", "ناقل", "فلاح", "مربي نحل", "جبس", "بلاط",
  "رخام", "ألمنيوم", "لحام", "ميكانيكي سيارات", "كهربائي سيارات", "غسيل سيارات",
  "إصلاح هواتف", "إصلاح حواسيب", "مصمم جرافيك", "مبرمج", "مترجم", "مدرس", "مدرب رياضي",
  "ممرض", "مساعد منزلي", "جليس أطفال", "حارس", "بستاني", "منظف سجاد", "مكافحة حشرات",
  "عزل مائي", "تركيب كاميرات", "تركيب صحون هوائية", "تركيب أبواب", "تركيب مطابخ", "تنجيد",
  "خياطة ستائر", "صيانة مصاعد", "صيانة مولدات", "إصلاح دراجات", "نقش خشب", "خزف", "فخار",
  "خطاط", "رسام", "مصمم أزياء", "حلويات", "خباز", "جزار", "سمكري", "تكييف مركزي",
  "طاقة شمسية", "تركيب زجاج سيارات", "إصلاح أحذية", "إصلاح ساعات", "مفاتيح وأقفال",
  "تنظيف خزانات", "نقل أثاث", "ديكور داخلي", "صيانة غسالات", "صيانة ثلاجات", "كهرباء صناعية",
  "دهان سيارات", "نجارة عامة", "حدادة أبواب", "إصلاح أفران", "واجهات", "تغليف", "عزل حراري"
];

export const CRAFT_ICONS: Record<string, string> = {
  "سباك": "🚿",
  "كهربائي": "⚡",
  "نجار": "🪚",
  "دهان": "🎨",
  "بناء": "🧱",
  "حداد": "🔨",
  "زجاج": "🪟",
  "تبريد": "❄️",
  "خياط": "🧵",
  "ميكانيكي": "🔧",
  "منظف": "🧹",
  "طباخ": "🍳",
  "حلاق": "✂️",
  "مصور": "📸",
  "سائق": "🚗",
  "ناقل": "🚚",
  "فلاح": "🌾",
  "جبس": "🏛️",
  "بلاط": "📐",
  "رخام": "🪨",
  "ألمنيوم": "🚪",
  "لحام": "🔥",
  "إصلاح هواتف": "📱",
  "إصلاح حواسيب": "💻",
  "تركيب كاميرات": "📹",
  "طاقة شمسية": "☀️",
  "صيانة غسالات": "🧺",
  "صيانة ثلاجات": "🧊",
  "نقل أثاث": "📦",
  "ديكور داخلي": "🛋️",
  "مفاتيح وأقفال": "🔑"
};

export function getCraftIcon(craft: string): string {
  return CRAFT_ICONS[craft] || "🛠️";
}

export const STORAGE_KEYS = {
  users: "khadam_users",
  requests: "khadam_requests",
  chats: "khadam_chats",
  ratings: "khadam_ratings",
  points_log: "khadam_points_log",
  receipts: "khadam_receipts",
  settings: "khadam_settings",
  pending: "khadam_pending_points",
  complaints: "khadam_complaints",
  points_balance: "khadam_points_balance",
  revealed_phones: "khadam_revealed_phones",
  current_user: "khadam_current_user",
  user_mode: "khadam_user_mode",
  theme: "khadam_theme",
  broadcasts: "khadam_broadcast_notifications",
  notifications: "khadam_app_notifications"
};

export const RECHARGE_PACKAGES = [
  { amount: 2000, pts: 200, reveals: 8, popular: false, bonus: "+10 نقاط هدية" },
  { amount: 3000, pts: 300, reveals: 12, popular: true, bonus: "+25 نقطة إضافية" },
  { amount: 4000, pts: 400, reveals: 16, popular: false, bonus: "+40 نقطة إضافية" },
  { amount: 5000, pts: 500, reveals: 20, popular: false, bonus: "+60 نقطة إضافية" }
];

export const PAYMENT_METHODS = {
  baridimob: {
    title: "بريدي موب - BaridiMob",
    rip: "00799999000122089353",
    accountHolder: "KHADAM DZ PLATFORM",
    note: "يرجى نسخ الـ RIP وإرسال المبلغ مع التقاط صورة الوصل"
  },
  chargily: {
    title: "شارجيلي باي - Chargily Pay (البطاقة الذهبية / CIB)",
    merchant: "خدّام ديزاد - Khadam DZ Services",
    note: "الدفع الإلكتروني الفوري والآمن بالبطاقة الذهبية أو بطاقة CIB البنكية",
    appUrl: "https://pay.chargily.net"
  },
  ccp: {
    title: "الحساب البريدي الجاري - CCP",
    ccpNumber: "0012208935",
    cle: "53",
    accountHolder: "خَدام ديزاد للخدمات",
    note: "يمكن الدفع في أي مكتب بريد عبر كامل التراب الوطني"
  },
  flexy: {
    title: "تعبئة رصيد فليكسي (Flexy)",
    mobilis: "0661 00 22 33",
    djezzy: "0770 11 33 55",
    ooredoo: "0550 22 44 66"
  }
};

export function calculatePointsFromAmount(amount: number): number {
  const match = RECHARGE_PACKAGES.find((p) => p.amount === amount);
  if (match) return match.pts;
  const base = Math.max(10, Math.round(amount / 10));
  if (amount >= 5000) return base + 60;
  if (amount >= 4000) return base + 40;
  if (amount >= 3000) return base + 25;
  if (amount >= 2000) return base + 10;
  return base;
}

export function formatRelativeTime(timestamp: number): string {
  const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) return "الآن";
  if (diffMinutes < 60) return `منذ ${diffMinutes} د`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} س`;
  const diffDays = Math.floor(diffHours / 24);
  return `منذ ${diffDays} ي`;
}

export const INITIAL_REQUESTS: RequestItem[] = [];
export const INITIAL_CRAFTSMEN: CraftsmanUser[] = [];
export const INITIAL_RATINGS: RatingItem[] = [];
export const INITIAL_COMPLAINTS: ComplaintItem[] = [];
export const INITIAL_PENDING_RECHARGES: PendingRecharge[] = [];
export const INITIAL_CHATS: ChatThread[] = [];
export const INITIAL_BROADCASTS: BroadcastNotification[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
