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
    ccpNumber: "1220893",
    cle: "53",
    accountHolder: "خَدام ديزاد للخدمات",
    note: "يمكن الدفع في أي مكتب بريد عبر كامل التراب الوطني (CCP: 1220893 / Clé: 53)"
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

export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  if (!timestamp || Number.isNaN(timestamp)) return "غير محدد";
  const diffMs = Math.max(0, now - timestamp);
  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 45) return "الآن";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes === 1) return "منذ دقيقة";
  if (diffMinutes === 2) return "منذ دقيقتين";
  if (diffMinutes <= 10) return `منذ ${diffMinutes} دقائق`;
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return "منذ ساعة";
  if (diffHours === 2) return "منذ ساعتين";
  if (diffHours <= 10) return `منذ ${diffHours} ساعات`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "أمس";
  if (diffDays === 2) return "منذ يومين";
  if (diffDays <= 10) return `منذ ${diffDays} أيام`;
  try {
    return new Date(timestamp).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return `منذ ${diffDays} يوماً`;
  }
}

export function formatExactPostedTime(timestamp: number): string {
  if (!timestamp || Number.isNaN(timestamp)) return '';
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const isSameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    const timeStr = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    if (isSameDay) {
      return `اليوم ${timeStr}`;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month} ${timeStr}`;
  } catch {
    return '';
  }
}

export const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: 'r_test_check_1',
    craft: 'سباك',
    wilaya: '09 البليدة',
    title: 'تصليح تسريب ماء',
    desc: 'حي أولاد يعيش',
    phone: '0550123456',
    createdAt: 1794507550563,
    priority: true,
    status: 'open',
    isCustomerOwn: true
  },
  {
    id: 'req_cust_live_dz_901',
    craft: 'سباك',
    wilaya: '09 البليدة',
    title: 'طلب سباك مستعجل لإصلاح تسرب مياه وتغيير خلاط الحمام',
    desc: 'يوجد تسرب مياه تحت المغسلة وفي أنبوب السخان بحي أولاد يعيش، أبحث عن سباك للتدخل السريع اليوم.',
    phone: '0554821943',
    createdAt: 1794478340229,
    priority: true,
    status: 'open',
    isCustomerOwn: true
  },
  {
    id: 'req_cust_live_dz_902',
    craft: 'كهربائي',
    wilaya: '16 الجزائر',
    title: 'مطلوب كهربائي لتركيب طابلو قواطع كهربائية وإنارة LED لشقة',
    desc: 'شقة جديدة جاهزة وتحتاج تركيب لوحة القواطع الكهربائية مع تثبيت سبوت لايت ومآخذ الغرف والصالون.',
    phone: '0662481920',
    createdAt: 1794478339229,
    priority: true,
    status: 'open',
    isCustomerOwn: true
  },
  {
    id: 'req_cust_live_dz_903',
    craft: 'تبريد',
    wilaya: '31 وهران',
    title: 'طلب تقني تبريد لصيانة وتعمير غاز مكيف هوائي 12000 BTU',
    desc: 'المكيف يشتغل لكن التبريد ضعيف جداً، أحتاج تقني تبريد لفحص أنابيب النحاس وشحن غاز الفريون.',
    phone: '0771839204',
    createdAt: 1794478338229,
    priority: true,
    status: 'open',
    isCustomerOwn: true
  },
  {
    id: 'req_live_01',
    craft: 'سباك',
    wilaya: '09 البليدة',
    title: 'إصلاح تسرب مياه وتركيب سخان',
    desc: 'أحتاج حرفي سباك مستعجل في البليدة لإصلاح تسرب أنبوب',
    phone: '0550112233',
    createdAt: 1793435076072,
    priority: true,
    status: 'open',
    isCustomerOwn: true
  },
  {
    id: 'r_1793081276403',
    craft: 'ميكانيكي سيارات',
    wilaya: '15 تيزي وزو',
    title: 'تصليح سيارات',
    desc: 'احتاج مصلح سيارة متنقل يعاودلي demi mouteur clio 4',
    phone: '0777889901',
    createdAt: 1793250000000,
    priority: true,
    status: 'open',
    isCustomerOwn: true
  },
  {
    id: 'r_1793049691198',
    craft: 'منظف',
    wilaya: '09 البليدة',
    title: 'طلب منظفة لشقة بالبوينان ليوم واحد سكن جديد',
    desc: 'سكن جديد احتاج لمنظفة تتصل بالرقم باش نتفاهمو',
    phone: '0798797662',
    createdAt: 1793249000000,
    priority: true,
    status: 'open',
    isCustomerOwn: true
  },
  {
    id: 'req_cr_c_fb_adm_1793182336382',
    craft: 'سباك',
    wilaya: '09 البليدة',
    title: 'طلب سباك مستعجل لكشف تسرب مياه تحت البلاط',
    desc: 'زبون في البليدة يطلب كشف وإصلاح تسرب مياه داخلي في الحمام.',
    phone: '0554 82 19 43',
    createdAt: 1793182300000,
    priority: true,
    status: 'open'
  },
  {
    id: 'req_fb_live_1793136505389',
    craft: 'سباك',
    wilaya: '09 البليدة',
    title: 'طلب سباك مستعجل في 09 البليدة (عبر منشور شفاء البليدة (Chifa Blida))',
    desc: 'طلب زبون حقيقي تم جلبه عبر إشهار فيسبوك بإسم (شفاء البليدة (Chifa Blida)) في 09 البليدة وحفظه في قاعدة بيانات Firestore.',
    phone: '0554 82 19 43',
    createdAt: 1793136505389,
    priority: true,
    status: 'open'
  },
  {
    id: 'req_cr_c_fb_live_1793136505402',
    craft: 'سباك',
    wilaya: '09 البليدة',
    title: 'طلب سباك لإصلاح تسرب مياه وتجهيز شبكة الحمام',
    desc: 'زبون في وسط مدينة البليدة يبحث عن سباك لإصلاح تسرب مياه في الحمام وتركيب سخان ماء.',
    phone: '0554 82 19 43',
    createdAt: 1793136500000,
    priority: true,
    status: 'open'
  },
  {
    id: 'req_cr_c_parsed_1793136812790',
    craft: 'سباك',
    wilaya: '09 البليدة',
    title: 'طلب مرصص لصيانة أنابيب المياه وتركيب شوديار',
    desc: 'أحتاج سباك ومرصص في البليدة لتركيب شوديار حائطية ومراجعة توصيلات التدفئة المركزية.',
    phone: '0559 44 33 22',
    createdAt: 1793136400000,
    priority: true,
    status: 'open'
  },
  {
    id: 'req_fb_adm_1793126302923',
    craft: 'سباك',
    wilaya: '09 البليدة',
    title: 'طلب سباك في 09 البليدة (عبر بوت فيسبوك)',
    desc: 'طلب زبون حقيقي تم جلبه عبر إشهار فيسبوك بإسم (شفاء البليدة (Chifa Blida)) وحفظه في Firestore.',
    phone: '0554 82 19 43',
    createdAt: 1793126302923,
    priority: true,
    status: 'open'
  },
  {
    id: 'req_cr_c_fb_adm_1793126302934',
    craft: 'سباك',
    wilaya: '09 البليدة',
    title: 'طلب سباك لتغيير حنفيات المطبخ والحمام وإصلاح الصرف',
    desc: 'زبون في البليدة يحتاج سباك لتغيير خلاط المطبخ وتسليك مجرى المياه.',
    phone: '0554 82 19 43',
    createdAt: 1793126200000,
    priority: true,
    status: 'open'
  },
  {
    id: 'req_fb_live_1793123330146',
    craft: 'منظف',
    wilaya: '09 البليدة',
    title: 'طلب منظف مستعجل في 09 البليدة (عبر منشور شفاء البليدة (Chifa Blida))',
    desc: 'طلب زبون حقيقي تم جلبه عبر إشهار فيسبوك بإسم (شفاء البليدة (Chifa Blida)) في 09 البليدة وحفظه في قاعدة بيانات Firestore.',
    phone: '0554 82 19 43',
    createdAt: 1793123330146,
    priority: true,
    status: 'open'
  },
  {
    id: 'req_cr_c_fb_live_1793123330150',
    craft: 'منظف',
    wilaya: '09 البليدة',
    title: 'طلب تنظيف شامل لشقة جديدة بعد أشغال الصباغة',
    desc: 'مطلوب خدمة تنظيف شامل لشقة F4 في البليدة بعد انتهاء أشغال الترميم والدهان.',
    phone: '0554 82 19 43',
    createdAt: 1793123300000,
    priority: true,
    status: 'open'
  },
  {
    id: 'req_social_1793119632873_ntj',
    craft: 'سباك',
    wilaya: '35 بومرداس',
    title: 'مطلوب سباك لتركيب شوديار وإصلاح تسرب مياه (عبر فيسبوك)',
    desc: 'طلب مجلوب آلياً بواسطة بوت الفيسبوك من الصفحة الرسمية (1CCuf6aCuD): تركيب شوديار وإصلاح تسرب مياه مستعجل.',
    phone: '0554 82 19 43',
    createdAt: 1793119632873,
    priority: true,
    status: 'open'
  },
  {
    id: 'req_cr_c_social_1793119632909_2q6',
    craft: 'كهربائي',
    wilaya: '31 وهران',
    title: 'مطلوب كهربائي لإصلاح عطل في لوحة القواطع والإنارة',
    desc: 'شقة في وهران تحتاج كهربائي محترف لفحص وإصلاح انقطاع التيار في الصالون وتغيير القواطع.',
    phone: '0662 91 34 78',
    createdAt: 1793119600000,
    priority: true,
    status: 'open'
  },
  {
    id: 'req_cr_c1',
    craft: 'سباك',
    wilaya: '09 البليدة',
    title: 'مطلوب سباك لتمديد أنابيب الغاز والمياه في مسكن جديد',
    desc: 'طلب زبون لتمديد شبكة المياه والغاز وفق المعايير مع تركيب عداد وسخان.',
    phone: '0551 23 45 67',
    createdAt: 1793100000000,
    priority: true,
    status: 'open'
  },
  {
    id: 'req_live_dz_106',
    craft: 'بناء',
    wilaya: '35 بومرداس',
    title: 'تركيب بلاط أرضية المطبخ والرواق (أستر وداراج)',
    desc: 'مساحة حوالي 28 متر مربع، السلعة متوفرة في عين المكان وأحتاج بناء مختص في الداراج والفايونس.',
    phone: '0773519082',
    createdAt: 1700000106000,
    priority: true,
    status: 'open'
  },
  {
    id: 'req_live_dz_105',
    craft: 'نجار',
    wilaya: '19 سطيف',
    title: 'تركيب 4 أبواب غرف داخلية خشبية مع المقابض والأقفال',
    desc: 'الأبواب جاهزة في المنزل بحي بومرشي، أحتاج نجار متقن لتركيب الإطارات والأبواب وضبط الإغلاق.',
    phone: '0661904382',
    createdAt: 1700000105000,
    priority: false,
    status: 'open'
  },
  {
    id: 'req_live_dz_104',
    craft: 'دهان',
    wilaya: '25 قسنطينة',
    title: 'طلاء غرفتين وصالون مع لوندوي وتصليح الشقوق',
    desc: 'العمل في المقاطعة الإدارية علي منجلي، الجدران تحتاج طبقة لوندوي وصباغة عصرية نظيفة.',
    phone: '0558391045',
    createdAt: 1700000104000,
    priority: false,
    status: 'open'
  },
  {
    id: 'req_live_dz_103',
    craft: 'تبريد',
    wilaya: '31 وهران',
    title: 'تركيب مكيف هوائي جديد 12000 مع تمديد الأنابيب النحاسية',
    desc: 'اشتريت مكيف جديد وأبحث عن تقني تبريد في بئر الجير لتثبيت الوحدة الداخلية والخارجية وتشغيله.',
    phone: '0771839204',
    createdAt: 1700000103000,
    priority: false,
    status: 'open'
  },
  {
    id: 'req_live_dz_102',
    craft: 'كهربائي',
    wilaya: '16 الجزائر',
    title: 'تركيب لوحة قواطع كهربائية جديدة مع مصابيح السقف',
    desc: 'شقة جديدة في باب الزوار تحتاج تركيب طابلو كهرباء كامل مع تثبيت الإنارة ومآخذ الغرف.',
    phone: '0662481920',
    createdAt: 1700000102000,
    priority: true,
    status: 'open'
  },
  {
    id: 'req_live_dz_101',
    craft: 'سباك',
    wilaya: '09 البليدة',
    title: 'إصلاح تسرب ماء في أنبوب الحمام وتركيب حنفية خلاط',
    desc: 'يوجد تسرب تحت المغسلة في الطابق الأول بحي أولاد يعيش، أحتاج سباك محترف اليوم لإصلاح الأنبوب وتغيير الخلاط.',
    phone: '0554128934',
    createdAt: 1700000101000,
    priority: true,
    status: 'open'
  }
];

export const INITIAL_CRAFTSMEN: CraftsmanUser[] = [
  {
    id: 'c1',
    name: 'أمين للترصيص الصحي والغاز',
    craft: 'سباك',
    wilaya: '09 البليدة',
    phone: '0551234567',
    points: 50,
    baseAvg: 5.0,
    baseCount: 6,
    complaints: 0,
    isVerified: true,
    status: 'active',
    bio: 'حرفي ترصيص صحي وغاز معتمد في البليدة.',
    experience: '8 سنوات'
  },
  {
    id: 'c_parsed_1793136812790',
    name: 'حرفي سباك (09 البليدة)',
    craft: 'سباك',
    wilaya: '09 البليدة',
    phone: '0559 44 33 22',
    points: 50,
    baseAvg: 5.0,
    baseCount: 3,
    complaints: 0,
    isVerified: true,
    status: 'active',
    bio: 'سباك ومرصص في البليدة خبرة 10 سنوات متاح للتدخل السريع.',
    experience: '10 سنوات'
  },
  {
    id: 'c_social_1793119632909_2q6',
    name: 'ياسين إلكترو وهران',
    craft: 'كهربائي',
    wilaya: '31 وهران',
    phone: '0662 91 34 78',
    points: 50,
    baseAvg: 5.0,
    baseCount: 2,
    complaints: 0,
    isVerified: true,
    status: 'active',
    bio: 'حرفي كهرباء معمارية وصناعية معتمد.',
    experience: '5 سنوات'
  },
  {
    id: 'cp1',
    name: 'أحمد - سباك محترف',
    craft: 'سباك',
    wilaya: '16 الجزائر',
    phone: '0550 11 22 33',
    points: 850,
    baseAvg: 4.8,
    baseCount: 18,
    complaints: 0,
    isVerified: true,
    status: 'active',
    bio: 'خبير في تسليك الأنابيب، كشف التسريبات بالأجهزة الحديثة، وتجهيز شبكات المياه والغاز.',
    experience: '10 سنوات'
  },
  {
    id: 'cp2',
    name: 'كريم - كهربائي معتمد',
    craft: 'كهربائي',
    wilaya: '31 وهران',
    phone: '0551 22 33 44',
    points: 320,
    baseAvg: 4.6,
    baseCount: 9,
    complaints: 0,
    isVerified: true,
    status: 'active',
    bio: 'تركيب اللوحات الكهربائية، الكشف عن الشورت، وتجهيز المنازل والمحلات.',
    experience: '6 سنوات'
  },
  {
    id: 'cp3',
    name: 'سامي - نجار أثاث وديكور',
    craft: 'نجار',
    wilaya: '25 قسنطينة',
    phone: '0553 44 55 66',
    points: 540,
    baseAvg: 4.9,
    baseCount: 24,
    complaints: 0,
    isVerified: true,
    status: 'active',
    bio: 'صناعة وتركيب الأبواب، غرف النوم، المطابخ العصرية وخزائن MDF.',
    experience: '12 سنة'
  },
  {
    id: 'cp4',
    name: 'ياسين - دهان وديكورات',
    craft: 'دهان',
    wilaya: '19 سطيف',
    phone: '0554 55 66 77',
    points: 210,
    baseAvg: 4.7,
    baseCount: 15,
    complaints: 0,
    isVerified: true,
    status: 'active',
    bio: 'جميع أنواع الدهانات العصرية، البيرلي، الساتيني، وورق الجدران.',
    experience: '8 سنوات'
  },
  {
    id: 'cp5',
    name: 'ناصر - تقني تبريد وتكييف',
    craft: 'تبريد',
    wilaya: '16 الجزائر',
    phone: '0555 66 77 88',
    points: 150,
    baseAvg: 4.5,
    baseCount: 8,
    complaints: 0,
    isVerified: true,
    status: 'active',
    bio: 'صيانة المكيفات المنزلية والصناعية، شحن الفريون وإصلاح الكمبروسور.',
    experience: '5 سنوات'
  },
  {
    id: 'cp6',
    name: 'مصطفى - مقاول بناء وتشطيب',
    craft: 'بناء',
    wilaya: '35 بومرداس',
    phone: '0556 77 88 99',
    points: 430,
    baseAvg: 4.8,
    baseCount: 12,
    complaints: 0,
    isVerified: true,
    status: 'active',
    bio: 'بناء فيلات، تسوية أراضي، صب خرسانة وترميمات شاملة.',
    experience: '15 سنة'
  }
];
export const INITIAL_RATINGS: RatingItem[] = [];
export const INITIAL_COMPLAINTS: ComplaintItem[] = [];
export const INITIAL_PENDING_RECHARGES: PendingRecharge[] = [];
export const INITIAL_CHATS: ChatThread[] = [];
export const INITIAL_BROADCASTS: BroadcastNotification[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

