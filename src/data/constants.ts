import { RequestItem, CraftsmanUser, RatingItem, ComplaintItem, PendingRecharge, ChatThread, AppNotification } from '../types';

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

export const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: "r1",
    craft: "سباك",
    wilaya: "16 الجزائر",
    title: "تسريب مياه في المطبخ يحتاج إصلاح فوري",
    desc: "يوجد تسريب ماء حاد تحت حوض المطبخ، نحتاج سباك محترف اليوم مع عتاده بباب الزوار.",
    phone: "0550 14 28 92",
    createdAt: Date.now() - 480000,
    priority: true,
    status: "open"
  },
  {
    id: "r2",
    craft: "كهربائي",
    wilaya: "31 وهران",
    title: "انقطاع كهرباء في غرفة واحدة",
    desc: "القاطع الكهربائي يسقط كل مرة عند تشغيل الأجهزة، نحتاج تشخيص العطب بحي إيسطو.",
    phone: "0662 38 91 04",
    createdAt: Date.now() - 1320000,
    status: "open"
  },
  {
    id: "r3",
    craft: "نجار",
    wilaya: "25 قسنطينة",
    title: "تركيب باب خشبي جديد مع الإطار",
    desc: "باب خشب صلب قياس 90 سم يحتاج تركيب مع قفل جديد بعلي منجلي.",
    phone: "0771 82 45 19",
    createdAt: Date.now() - 3300000,
    status: "open"
  },
  {
    id: "r4",
    craft: "تبريد",
    wilaya: "16 الجزائر",
    title: "مكيف هوائي لا يبرد - سامسونغ 12000 BTU",
    desc: "المكيف يخرج هواء عادي بدون برودة، يحتاج كشف الغاز وصيانة سريعة.",
    phone: "0554 99 21 80",
    createdAt: Date.now() - 7200000,
    priority: true,
    status: "open"
  },
  {
    id: "r5",
    craft: "دهان",
    wilaya: "19 سطيف",
    title: "دهان شقة كاملة مساحة 70 متر مربع",
    desc: "دهان جدران وأسقف بلون أبيض عاجي ساتيني مع معالجة التشققات الخفيفة.",
    phone: "0665 11 74 32",
    createdAt: Date.now() - 10800000,
    status: "open"
  },
  {
    id: "r6",
    craft: "ميكانيكي",
    wilaya: "09 البليدة",
    title: "تغيير زيت + فلتر لسيارة كليو 4",
    desc: "صيانة دورية للسيارة مع فحص الفرامل في وسط مدينة البليدة.",
    phone: "0778 50 12 66",
    createdAt: Date.now() - 14400000,
    status: "open"
  },
  {
    id: "r7",
    craft: "زجاج",
    wilaya: "16 الجزائر",
    title: "استبدال زجاج نافذة مكسور 120x100",
    desc: "نافذة صالون زجاج دوبل فيتراج مكسور يحتاج قياس وتركيب بالدرارية.",
    phone: "0561 24 88 19",
    createdAt: Date.now() - 18000000,
    status: "open"
  },
  {
    id: "r8",
    craft: "خياط",
    wilaya: "06 بجاية",
    title: "تعديل وتضييق بدلة رجالية رسمية",
    desc: "بدلة مقاس 52 تحتاج تعديل طول الأكمام والسروال لمناسبة قريبة.",
    phone: "0659 40 18 22",
    createdAt: Date.now() - 24000000,
    status: "open"
  },
  {
    id: "r9",
    craft: "بناء",
    wilaya: "35 بومرداس",
    title: "بناء جدار فاصل 4 أمتار في فناء المنزل",
    desc: "بناء بالبلوك والإسمنت مع صب عمود صغير، العتاد متوفر.",
    phone: "0770 93 15 48",
    createdAt: Date.now() - 31200000,
    status: "open"
  },
  {
    id: "r10",
    craft: "حداد",
    wilaya: "31 وهران",
    title: "صناعة باب حديدي خارجي للحديقة",
    desc: "باب حديد مشغول أنيق قياس 2م في 1.5م مع طلائه بمضاد الصدأ.",
    phone: "0558 71 63 90",
    createdAt: Date.now() - 36000000,
    status: "open"
  },
  {
    id: "r11",
    craft: "إصلاح هواتف",
    wilaya: "16 الجزائر",
    title: "استبدال شاشة ايفون 12 مكسورة",
    desc: "الشاشة سوداء بعد السقوط، نحتاج شاشة أصلية أو بجودة ممتازة في القبة.",
    phone: "0664 19 82 73",
    createdAt: Date.now() - 43200000,
    status: "open"
  },
  {
    id: "r12",
    craft: "صيانة غسالات",
    wilaya: "26 المدية",
    title: "غسالة كوندور أوتوماتيك لا تدور في مرحلة العصر",
    desc: "تغسل وتفرغ الماء عادي لكن لا تقوم بالتنشيف، مطلوب تقني متمرس.",
    phone: "0772 34 56 78",
    createdAt: Date.now() - 48000000,
    status: "open"
  }
];

export const INITIAL_CRAFTSMEN: CraftsmanUser[] = [
  {
    id: "cp1",
    craft: "سباك",
    name: "أحمد - سباك محترف",
    phone: "0550 11 22 33",
    baseAvg: 4.8,
    baseCount: 18,
    complaints: 0,
    wilaya: "16 الجزائر",
    experience: "10 سنوات",
    bio: "خبير في تسليك الأنابيب، كشف التسريبات بالأجهزة الحديثة، وتجهيز شبكات المياه والغاز."
  },
  {
    id: "cp2",
    craft: "كهربائي",
    name: "كريم - كهربائي معتمد",
    phone: "0551 22 33 44",
    baseAvg: 4.2,
    baseCount: 9,
    complaints: 1,
    wilaya: "31 وهران",
    experience: "6 سنوات",
    bio: "تركيب اللوحات الكهربائية، الكشف عن الشورت، وتجهيز المنازل والمحلات."
  },
  {
    id: "cp3",
    craft: "نجار",
    name: "سامي - نجار أثاث وديكور",
    phone: "0553 44 55 66",
    baseAvg: 4.9,
    baseCount: 24,
    complaints: 0,
    wilaya: "25 قسنطينة",
    experience: "12 سنة",
    bio: "صناعة وتركيب الأبواب، غرف النوم، المطابخ العصرية وخزائن MDF."
  },
  {
    id: "cp4",
    craft: "دهان",
    name: "ياسين - دهان وديكورات",
    phone: "0554 55 66 77",
    baseAvg: 4.5,
    baseCount: 15,
    complaints: 0,
    wilaya: "19 سطيف",
    experience: "8 سنوات",
    bio: "جميع أنواع الدهانات العصرية، البيرلي، الساتيني، وورق الجدران."
  },
  {
    id: "cp5",
    craft: "تبريد",
    name: "ناصر - تقني تبريد وتكييف",
    phone: "0555 66 77 88",
    baseAvg: 3.8,
    baseCount: 8,
    complaints: 2,
    wilaya: "16 الجزائر",
    experience: "5 سنوات",
    bio: "صيانة المكيفات المنزلية والصناعية، شحن الفريون وإصلاح الكمبروسور."
  },
  {
    id: "cp6",
    craft: "بناء",
    name: "مصطفى - مقاول بناء وتشطيب",
    phone: "0556 77 88 99",
    baseAvg: 4.6,
    baseCount: 12,
    complaints: 0,
    wilaya: "35 بومرداس",
    experience: "15 سنة",
    bio: "بناء فيلات، تسوية أراضي، صب خرسانة وترميمات شاملة."
  }
];

export const INITIAL_RATINGS: RatingItem[] = [
  {
    id: "rt1",
    requestId: "r2",
    craft: "كهربائي",
    stars: 5,
    comment: "عمل احترافي ومتقن، وجد العطب الكهربائي بسرعة كبيرة بارك الله فيه.",
    createdAt: Date.now() - 18000000,
    customerPhone: "0559 00 11 22",
    craftsmanName: "كريم - كهربائي معتمد"
  },
  {
    id: "rt2",
    requestId: "r1",
    craft: "سباك",
    stars: 5,
    comment: "سباك قمة في الأخلاق والاحترافية، أصلح تسريب المياه في نصف ساعة.",
    createdAt: Date.now() - 7200000,
    customerPhone: "0559 00 11 44",
    craftsmanName: "أحمد - سباك محترف"
  },
  {
    id: "rt3",
    requestId: "r3",
    craft: "نجار",
    stars: 5,
    comment: "نجار ممتاز ورائع، دقة تامة في القياسات والموعد مضبوط.",
    createdAt: Date.now() - 10800000,
    customerPhone: "0559 00 11 55",
    craftsmanName: "سامي - نجار أثاث وديكور"
  }
];

export const INITIAL_COMPLAINTS: ComplaintItem[] = [
  {
    id: "co1",
    craftsmanCraft: "كهربائي",
    craftsmanName: "كريم - كهربائي معتمد",
    text: "شكوى: تأخر عن الموعد ساعتين دون إشعار مسبق",
    count: 1,
    createdAt: Date.now() - 28800000
  },
  {
    id: "co2",
    craftsmanCraft: "تبريد",
    craftsmanName: "ناصر - تقني تبريد وتكييف",
    text: "شكوى: طلب تكلفة إضافية لقطع غيار لم يتم تغييرها",
    count: 2,
    createdAt: Date.now() - 72000000
  }
];

export const INITIAL_PENDING_RECHARGES: PendingRecharge[] = [
  {
    id: "pr1",
    user: "أحمد - سباك محترف",
    phone: "0550 11 22 33",
    amount: 3000,
    pts: 300,
    status: "pending",
    createdAt: Date.now() - 1800000,
    receiptName: "baridimob_transfer_3000da.jpg"
  },
  {
    id: "pr2",
    user: "سامي - نجار أثاث",
    phone: "0553 44 55 66",
    amount: 2000,
    pts: 200,
    status: "pending",
    createdAt: Date.now() - 5400000,
    receiptName: "ccp_recu_2000.png"
  }
];

export const INITIAL_CHATS: ChatThread[] = INITIAL_CRAFTSMEN.map((c) => ({
  id: `adm_${c.id}`,
  craftsmanId: c.id,
  craftsmanName: c.name,
  craft: c.craft,
  phone: c.phone,
  messages: [
    {
      id: `m0_${c.id}`,
      sender: "admin",
      text: `مرحبا بك يا ${c.name} في منصة خدّام DZ! هذا الشات المباشر مخصص بينك وبين إدارة المنصة لمساعدتك في أي استفسار أو مشكلة في الطلبات أو شحن النقاط.`,
      ts: Date.now() - 18000000
    },
    ...(c.id === "cp1"
      ? [
          {
            id: `m1_${c.id}`,
            sender: "craftsman" as const,
            text: "شكرا جزيلا إدارة خدام ديزاد، التطبيق رائع وبدأت في التواصل مع الزبائن مباشرة.",
            ts: Date.now() - 7200000
          },
          {
            id: `m2_${c.id}`,
            sender: "admin" as const,
            text: "بالتوفيق لك يا أحمد، نحن في الخدمة دائما!",
            ts: Date.now() - 3600000
          }
        ]
      : [])
  ]
}));

export const INITIAL_BROADCASTS = [
  {
    id: "bc1",
    title: "⚡ طلبات مستعجلة في الجزائر ووهران",
    message: "تتوفر حالياً أكثر من 15 طلباً جديداً في السباكة والكهرباء والتبريد. تفقد قائمة الطلبات الآن!",
    targetCraft: "الكل",
    targetWilaya: "الكل",
    sentAt: Date.now() - 3600000,
    recipientCount: 6,
    type: "urgent_request" as const
  },
  {
    id: "bc2",
    title: "🎁 بونيس شحن النقاط - نهاية الأسبوع",
    message: "اشحن باقة 3000 دج واحصل على 350 نقطة بدلاً من 300 نقطة لفترة محدودة.",
    targetCraft: "الكل",
    targetWilaya: "الكل",
    sentAt: Date.now() - 86400000,
    recipientCount: 6,
    type: "promo" as const
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif_match_1",
    type: "matching_request",
    title: "🎯 طلب جديد يطابق تخصصك (سباك)",
    message: "تسريب مياه في المطبخ يحتاج إصلاح فوري • 16 الجزائر. سارع بكشف رقم الزبون قبل باقي الحرفيين!",
    createdAt: Date.now() - 480000,
    read: false,
    relatedRequestId: "r1",
    relatedCraft: "سباك"
  },
  {
    id: "notif_points_warn",
    type: "low_points",
    title: "⚠️ تنبيه رصيد النقاط",
    message: "تذكر: كشف رقم أي زبون يتطلب 25 نقطة. إذا انخفض رصيدك دون 25 نقطة، يمكنك الشحن الفوري بالبطاقة الذهبية أو بريدي موب.",
    createdAt: Date.now() - 3600000,
    read: false,
    points: 25
  }
];


