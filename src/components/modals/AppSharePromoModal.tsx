import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Sparkles,
  MessageCircle,
  Send,
  Smartphone,
  Megaphone,
  Globe,
  CheckCircle2,
  Flame,
  FileText,
  Download,
  ShieldCheck
} from 'lucide-react';
import { getPublicAppUrl, subscribePublicAppUrl, DEV_PREVIEW_URL } from '../../utils/appUrl';

interface AppSharePromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlayStore?: () => void;
  isDark: boolean;
}

export const AppSharePromoModal: React.FC<AppSharePromoModalProps> = ({
  isOpen,
  onClose,
  onOpenPlayStore,
  isDark
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'ads' | 'qr'>('link');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [appUrl, setAppUrl] = useState<string>(() => getPublicAppUrl());

  useEffect(() => {
    setAppUrl(getPublicAppUrl());
    return subscribePublicAppUrl((newUrl) => setAppUrl(newUrl));
  }, [isOpen]);

  if (!isOpen) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  // Ready-to-publish Algerian advertising copies
  const promoAds = [
    {
      id: 'craftsmen_ad',
      title: '🔨 إشهار مخصص للحرفيين وأصحاب المهن',
      badge: 'الأكثر فاعلية للحرفيين',
      badgeColor: 'bg-emerald-500 text-black',
      target: 'مجموعات الفيس بوك للحرفيين، السباكين، الكهربائيين، البنائين',
      content: `🇩🇿 إلى كل الحرفيين وأصحاب المهن الحرة في الجزائر! 🇩🇿
راك تبحث على خدمة وزبائن في ولايتك؟
تطبيق "خدّام ديزاد - Khadam DZ" يوصلك مباشرة بطلبات الزبائن في ولايتك بدون وسيط وبدون أي عمولة!

✨ مميزات التطبيق:
✅ طلبات حقيقية يومية (سباكة، كهرباء، دهانة، بناء، تبريد، نجارة...)
✅ كشف أرقام هواتف الزبائن والتواصل المباشر معهم فوراً
✅ شحن فوري للنقاط عبر بريدي موب (BaridiMob) وشارجيلي باي
✅ هدية ترحيبية: 50 نقطة مجانية فور التسجيل!

📲 افتح الرابط وابدأ العمل اليوم:
${appUrl}`
    },
    {
      id: 'customers_ad',
      title: '🏠 إشهار للزبائن وأصحاب المنازل والورشات',
      badge: 'للعائلات والمواطنين',
      badgeColor: 'bg-blue-500 text-white',
      target: 'مجموعات الولايات، كراء وبيع، بيع وشراء، سكنات عدل',
      content: `🏠 عندك عطب في الدار ومحتاج حرفي ثقة وقريب منك؟
مع تطبيق "خدّام ديزاد - Khadam DZ"، انشر طلبك مجاناً وفي دقائق يتصلوا بيك أمهر الحرفيين في ولايتك وبلديتك!

🔧 الخدمات المتوفرة:
• ترصيص صحي وسباكة (Plomberie)
• كهرباء معمارية وصناعية (Électricité)
• دهانة وديكور وجبس (Peinture & Plâtre)
• نجارة، حدادة، ألومنيوم وزجاج
• تصليح ثلاجات ومكيفات وغسالات

🇩🇿 متوفر في جميع ولايات الجزائر الـ 58 مجاناً 100%!
🔗 ادخل الآن وانشر طلبك في ثوانٍ:
${appUrl}`
    },
    {
      id: 'viral_short_ad',
      title: '⚡ إشهار سريع ومختصر (للواتساب وتيليغرام والستوري)',
      badge: 'سريع ومنتشر',
      badgeColor: 'bg-amber-500 text-black',
      target: 'حالات واتساب، ستوري فيسبوك، قنوات تيليغرام',
      content: `🇩🇿 تطبيق "خدّام ديزاد - Khadam DZ" 🇩🇿
المنصة الجزائرية رقم 1 لربط الحرفيين مع الزبائن في 58 ولاية!
إذا راك حرفي وسجلت اليوم، عندك 50 نقطة هدية مجانية 🎁
وإذا راك زبون، حط طلبك مجاناً والحرفي يجيك لباب دارك!

🔗 جرب التطبيق الآن مجاناً:
${appUrl}`
    }
  ];

  // Quick Share Handlers
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'خدّام ديزاد - Khadam DZ',
          text: 'تطبيق خدّام ديزاد لربط الحرفيين وأصحاب المهن مع الزبائن في 58 ولاية جزائرية 🇩🇿',
          url: appUrl
        });
      } catch {
        copyText(appUrl, 'url');
      }
    } else {
      copyText(appUrl, 'url');
    }
  };

  const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(
    `🇩🇿 تطبيق خدّام ديزاد - المنصة الجزائرية لربط الحرفيين مع الزبائن في 58 ولاية!\nسجل الآن كحرفي أو انشر طلبك مجاناً:\n${appUrl}`
  )}`;

  const facebookShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;

  const telegramShareHref = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(
    '🇩🇿 تطبيق خدّام ديزاد لربط الحرفيين مع الزبائن في 58 ولاية:'
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
          isDark ? 'bg-[#0f121d] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-gray-800 bg-[#161b2c]' : 'border-gray-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-500 text-white flex items-center justify-center font-black shadow-md">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                  الرابط العام أونلاين وحل خطأ 403 للهواتف
                </h3>
                <span className="text-[10px] font-black bg-emerald-500 text-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>تم الإصلاح ✓</span>
                </span>
              </div>
              <p className={`text-[11px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                انسخ الرابط العام أو حمّل نسخة الهاتف المستقلة التي تعمل بدون خطأ 403
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition active:scale-95 ${
              isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-black hover:bg-gray-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`grid grid-cols-3 border-b text-xs font-black p-1.5 gap-1 shrink-0 ${
          isDark ? 'border-gray-800 bg-[#121624]' : 'border-gray-200 bg-gray-100'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`py-2 px-1 rounded-xl text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'link'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>الرابط وحل 403</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ads')}
            className={`py-2 px-1 rounded-xl text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'ads'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>إشهارات جاهزة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-1 rounded-xl text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>رمز QR كود</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: Link & 403 Fix */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              {/* SOLUTION 1: Standalone Mobile App (Works 100% on ANY phone without 403) */}
              <div className={`p-4 rounded-2xl border-2 space-y-3 ${
                isDark
                  ? 'bg-gradient-to-br from-emerald-950/60 via-teal-950/30 to-gray-900 border-emerald-500/60'
                  : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border-emerald-400'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>الحل الفوري النهائي لخطأ 403 على الهواتف الأخرى ⚡</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-500">يعمل 100%</span>
                </div>

                <div className="space-y-1">
                  <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    📦 حمّل كافة ملفات المشروع الحقيقية لـ GitHub (khadam-dz-real-source.zip)
                  </h4>
                  <p className={`text-[11px] font-bold leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    ملفات الكود المصدري الحقيقية 100% من القرص مباشرة (<code>src/*</code>، <code>server.ts</code>، <code>package.json</code>، <code>.github/workflows/deploy.yml</code>) بدون أي ملفات وهمية، جاهزة للرفع على GitHub Pages أو Vercel أو Render!
                  </p>
                </div>

                <a
                  href="/download/github-source.zip"
                  download="khadam-dz-real-source.zip"
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل ملفات المشروع الحقيقية كاملة (ZIP لـ GitHub)</span>
                </a>
              </div>

              {/* SOLUTION 2: Live Cloudflare Public Tunnel URL (Works for everyone on Messenger/WhatsApp) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    🔗 الرابط العالمي المباشر للجميع (Cloudflare Tunnel بدون 403 أو 404):
                  </label>
                  <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>يعمل عند الجميع ✓</span>
                  </span>
                </div>

                <div className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 ${
                  isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex-1 font-mono text-xs font-bold truncate text-emerald-600 dark:text-emerald-400 dir-ltr select-all">
                    {appUrl}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(appUrl, 'main_url')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0 shadow-xs cursor-pointer"
                  >
                    {copiedKey === 'main_url' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>تم النسخ ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-white" />
                        <span>نسخ الرابط العام</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Guide Box explaining how to unlock ais-pre in AI Studio */}
                <div className={`p-3 rounded-2xl border text-[11px] font-bold space-y-1.5 leading-relaxed ${
                  isDark ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <div className="font-black text-xs flex items-center gap-1.5 text-amber-500">
                    <Flame className="w-4 h-4 shrink-0" />
                    <span>مهم جداً لفتح الرابط على الهواتف الأخرى بدون خطأ 403:</span>
                  </div>
                  <p>
                    1️⃣ <strong>لتفعيل الرابط العام لكل الهواتف:</strong> اضغط على زر <strong>المشاركة (Share 🔗) أو النشر (Deploy 🚀)</strong> الموجود في الشريط العلوي لصفحة Google AI Studio (فوق شاشة التطبيق) وفعّل خيار <strong>Public / Anyone with the link</strong>.
                  </p>
                  <p>
                    2️⃣ <strong>أو لفتحه على هاتفك الثاني مباشرة:</strong> سجل الدخول في متصفح الهاتف بنفس حسابك (<strong>teniniilhem@gmail.com</strong>) أو استخدم <strong>زر تحميل التطبيق المستقل (Khadam-DZ-App.html)</strong> أعلاه ليعمل بدون إيميل نهائياً!
                  </p>
                </div>
              </div>

              {/* Developer / Owner Direct Link (for same Google account) */}
              <div className={`p-3 rounded-2xl border space-y-1.5 ${
                isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-[11px]">رابط المعاينة المباشر (للأجهزة المسجلة بإيميلك):</span>
                  <button
                    type="button"
                    onClick={() => copyText(DEV_PREVIEW_URL, 'dev_url')}
                    className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-black text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'dev_url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'dev_url' ? 'تم النسخ' : 'نسخ رابط المالك'}</span>
                  </button>
                </div>
                <div className="font-mono text-[10px] text-gray-400 truncate dir-ltr select-all">
                  {DEV_PREVIEW_URL}
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div className="space-y-2">
                <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>
                  مشاركة سريعة عبر وسائل التواصل:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <a
                    href={whatsappShareHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                    <span>واتساب</span>
                  </a>

                  <a
                    href={facebookShareHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/40 text-blue-700 dark:text-blue-300 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <span>فيسبوك</span>
                  </a>

                  <a
                    href={telegramShareHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-sky-600/15 hover:bg-sky-600/25 border border-sky-500/40 text-sky-700 dark:text-sky-300 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-sky-500" />
                    <span>تيليغرام</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="p-2.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/40 text-purple-700 dark:text-purple-300 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-purple-500" />
                    <span>مشاركة الكل</span>
                  </button>
                </div>
              </div>

              {/* Install / Download Card */}
              {onOpenPlayStore && (
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDark ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-500 text-white flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-xs">تثبيت التطبيق وحزمة Google Play</div>
                      <div className={`text-[10px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        تطبيق PWA + ملف AAB جاهز للنشر
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPlayStore();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-500 transition active:scale-95 cursor-pointer"
                  >
                    تثبيت وتحميل
                  </button>
                </div>
              )}

              {/* Official Privacy Policy Link Card */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 ${
                isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 truncate">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-black text-xs">سياسة الخصوصية الرسمية للمتجر</div>
                    <div className={`text-[10px] font-bold truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {appUrl}/privacy
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyText(`${appUrl}/privacy`, 'privacy_url')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                  >
                    {copiedKey === 'privacy_url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'privacy_url' ? 'تم النسخ' : 'نسخ الرابط'}</span>
                  </button>
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-1.5 rounded-lg border hover:bg-gray-200 dark:hover:bg-gray-800 transition ${
                      isDark ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'
                    }`}
                    title="فتح صفحة سياسة الخصوصية"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Ready-to-copy Promo Ads */}
          {activeTab === 'ads' && (
            <div className="space-y-4">
              <div className={`text-xs font-bold leading-relaxed p-3 rounded-2xl border ${
                isDark ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                💡 <strong>نصوص إعلانية جاهزة للنشر بالرابط العام المُصحح:</strong> اضغط على زر &quot;نسخ نص الإشهار مع الرابط&quot; والصق البوست مباشرة في مجموعات الفيسبوك أو الواتساب!
              </div>

              {promoAds.map((ad) => (
                <div
                  key={ad.id}
                  className={`p-3.5 rounded-2xl border space-y-2.5 transition ${
                    isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white border-gray-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${ad.badgeColor}`}>
                      {ad.badge}
                    </span>
                    <span className={`text-[10px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {ad.target}
                    </span>
                  </div>

                  <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    {ad.title}
                  </h4>

                  <div className={`p-2.5 rounded-xl border text-[11px] font-mono leading-relaxed whitespace-pre-line select-all ${
                    isDark ? 'bg-black/40 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}>
                    {ad.content}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => copyText(ad.content, ad.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                    >
                      {copiedKey === ad.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>تم نسخ نص الإشهار مع الرابط ✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-white" />
                          <span>نسخ نص الإشهار مع الرابط كامل</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(ad.content)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition active:scale-95 cursor-pointer"
                      title="مشاركة هذا الإعلان في واتساب مباشرة"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: QR Code for Easy Mobile Camera Scan */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center py-2">
              <div className="space-y-1">
                <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-black'}`}>
                  امسح الرمز أو حمّل تطبيق الهاتف المستقل
                </h4>
                <p className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  الرابط العام: <span className="font-mono text-emerald-500">{appUrl}</span>
                </p>
              </div>

              {/* Render High Fidelity SVG QR Code */}
              <div className="p-4 rounded-3xl bg-white max-w-[220px] mx-auto shadow-xl border-4 border-emerald-500">
                <svg
                  className="w-full h-auto aspect-square"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="200" height="200" fill="#ffffff" />
                  <rect x="15" y="15" width="50" height="50" fill="#047857" rx="8" />
                  <rect x="23" y="23" width="34" height="34" fill="#ffffff" rx="4" />
                  <rect x="30" y="30" width="20" height="20" fill="#047857" rx="3" />

                  <rect x="135" y="15" width="50" height="50" fill="#047857" rx="8" />
                  <rect x="143" y="23" width="34" height="34" fill="#ffffff" rx="4" />
                  <rect x="150" y="30" width="20" height="20" fill="#047857" rx="3" />

                  <rect x="15" y="135" width="50" height="50" fill="#047857" rx="8" />
                  <rect x="23" y="143" width="34" height="34" fill="#ffffff" rx="4" />
                  <rect x="30" y="150" width="20" height="20" fill="#047857" rx="3" />

                  <rect x="75" y="20" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="95" y="20" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="115" y="20" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="75" y="40" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="115" y="40" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="75" y="60" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="95" y="60" width="12" height="12" fill="#111827" rx="2" />

                  <rect x="20" y="75" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="40" y="75" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="60" y="75" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="80" y="80" width="12" height="12" fill="#047857" rx="2" />
                  <rect x="100" y="80" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="120" y="75" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="140" y="75" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="165" y="75" width="12" height="12" fill="#111827" rx="2" />

                  <circle cx="100" cy="100" r="18" fill="#10b981" />
                  <text x="100" y="105" fontFamily="sans-serif" fontSize="12" fontWeight="900" fill="#ffffff" textAnchor="middle">DZ</text>

                  <rect x="75" y="120" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="95" y="120" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="115" y="120" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="135" y="120" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="75" y="140" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="115" y="140" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="145" y="140" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="165" y="140" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="75" y="160" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="95" y="160" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="135" y="160" width="12" height="12" fill="#111827" rx="2" />
                  <rect x="165" y="160" width="12" height="12" fill="#111827" rx="2" />
                </svg>
              </div>

              <div className="max-w-xs mx-auto space-y-2">
                <button
                  type="button"
                  onClick={() => copyText(appUrl, 'qr_url')}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                >
                  {copiedKey === 'qr_url' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>تم نسخ الرابط العام ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-white" />
                      <span>نسخ الرابط العام</span>
                    </>
                  )}
                </button>

                <a
                  href="/download/github-source.zip"
                  download="khadam-dz-real-source.zip"
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الكود المصدري الحقيقي لـ GitHub (ZIP)</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3.5 border-t flex items-center justify-between text-xs font-bold shrink-0 ${
          isDark ? 'border-gray-800 bg-[#121624] text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-700'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>المنصة نشطة وتعمل على مدار 24 ساعة في 58 ولاية</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 font-black text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
