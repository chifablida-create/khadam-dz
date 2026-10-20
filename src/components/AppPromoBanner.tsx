import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Share2,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Gift,
  Zap,
  Smartphone,
  Download
} from 'lucide-react';
import { getPublicAppUrl, subscribePublicAppUrl } from '../utils/appUrl';

interface AppPromoBannerProps {
  onOpenPromoModal: () => void;
  onOpenPlayStore?: () => void;
  isDark: boolean;
}

export const AppPromoBanner: React.FC<AppPromoBannerProps> = ({
  onOpenPromoModal,
  onOpenPlayStore,
  isDark
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [appUrl, setAppUrl] = useState<string>(() => getPublicAppUrl());

  useEffect(() => {
    setAppUrl(getPublicAppUrl());
    return subscribePublicAppUrl((newUrl) => setAppUrl(newUrl));
  }, []);

  const slides = [
    {
      id: 'general',
      badge: 'الرابط العام وتطبيق الهاتف 🇩🇿',
      badgeColor: 'bg-emerald-500 text-black',
      title: 'افتح التطبيق على أي هاتف آخر بدون خطأ 403',
      desc: 'تم إصلاح الرابط العام + توفير نسخة الهاتف المستقلة (Khadam-DZ-App.html) التي تعمل فوراً عبر واتساب والمتصفح!',
      icon: Megaphone,
      bgGradient: 'from-emerald-950/80 via-teal-950/60 to-gray-900 border-emerald-500/40',
      actionLabel: 'الرابط وحل خطأ 403',
      actionType: 'promo'
    },
    {
      id: 'bonus',
      badge: 'عرض حصري للحرفيين 🎁',
      badgeColor: 'bg-amber-400 text-black',
      title: 'سجل حسابك كحرفي واحصل على 50 نقطة هدية',
      desc: 'اكشف أرقام الزبائن في ولايتك وتواصل معهم هاتفياً وعبر واتساب فوراً.',
      icon: Gift,
      bgGradient: 'from-amber-950/80 via-yellow-950/50 to-gray-900 border-amber-500/40',
      actionLabel: 'انسخ الرابط العام',
      actionType: 'copy'
    },
    {
      id: 'recharge',
      badge: 'شحن فوري بالذكاء الاصطناعي ⚡',
      badgeColor: 'bg-blue-500 text-white',
      title: 'شحن الرصيد 24/7 ببريدي موب وشارجيلي',
      desc: 'ارفع صورة أو PDF الوصل، والبوت الذكي يفحص المعاملة ويشحن نقاطك تلقائياً.',
      icon: Zap,
      bgGradient: 'from-blue-950/80 via-indigo-950/50 to-gray-900 border-blue-500/40',
      actionLabel: 'رابط الشحن والإشهار',
      actionType: 'promo'
    },
    {
      id: 'app_install',
      badge: 'تطبيق الأندرويد متاح 📲',
      badgeColor: 'bg-purple-500 text-white',
      title: 'ثبّت التطبيق على شاشة هاتفك الرئيسية',
      desc: 'تصفح أسرع، استهلاك خفيف للبيانات، وتنبيهات فورية لكل طلب جديد في تخصصك.',
      icon: Smartphone,
      bgGradient: 'from-purple-950/80 via-pink-950/50 to-gray-900 border-purple-500/40',
      actionLabel: 'تثبيت التطبيق',
      actionType: 'install'
    }
  ];

  // Auto-advance banner every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (isDismissed) {
    return (
      <div className="px-3 pt-2">
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className={`w-full py-1.5 px-3 rounded-xl border text-[11px] font-bold flex items-center justify-between transition ${
            isDark
              ? 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:text-black'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-emerald-500" />
            <span>الرابط العام وتطبيق الهاتف (بدون خطأ 403) 📢</span>
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black">إظهار</span>
        </button>
      </div>
    );
  }

  const slide = slides[currentSlide];
  const IconComp = slide.icon;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAction = () => {
    if (slide.actionType === 'install' && onOpenPlayStore) {
      onOpenPlayStore();
    } else {
      onOpenPromoModal();
    }
  };

  return (
    <div className="px-3 pt-2">
      <div
        className={`relative rounded-2xl border p-3.5 shadow-sm transition-all duration-300 overflow-hidden ${
          isDark
            ? `bg-gradient-to-r ${slide.bgGradient} text-white`
            : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-emerald-300 text-black shadow-xs'
        }`}
      >
        {/* Subtle decorative background circle */}
        <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none blur-xl"></div>

        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-black/20 dark:bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-xs">
              <IconComp className="w-5 h-5 text-emerald-400 dark:text-emerald-300" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs ${slide.badgeColor}`}>
                  {slide.badge}
                </span>
                <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentSlide + 1}/{slides.length}
                </span>
              </div>

              <h4 className={`text-xs font-black leading-snug ${isDark ? 'text-white' : 'text-black'}`}>
                {slide.title}
              </h4>

              <p className={`text-[11px] font-bold leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {slide.desc}
              </p>
            </div>
          </div>

          {/* Quick Slide Navigation Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition ${
                isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
              title="الإشهار السابق"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition ${
                isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
              title="الإشهار التالي"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="mt-3 pt-2.5 border-t border-white/10 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {/* Direct Copy Public Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-black flex items-center gap-1 transition active:scale-95 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isDark
                  ? 'bg-gray-800/80 border-gray-700 text-emerald-400 hover:bg-gray-700'
                  : 'bg-white border-gray-300 text-emerald-800 hover:bg-gray-100 shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>تم نسخ الرابط العام ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الرابط العام</span>
                </>
              )}
            </button>

            {/* Direct Download Standalone Phone App (No 403) */}
            <a
              href="/download/standalone-app"
              download="Khadam-DZ-App.html"
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
              title="ملف تطبيق مستقل يعمل على أي هاتف بدون خطأ 403"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تطبيق الهاتف (بدون 403)</span>
            </a>
          </div>

          {/* Open Full Promo Center Button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAction}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{slide.actionLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className={`text-[10px] font-bold px-1.5 py-1 rounded-lg hover:underline ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
              title="إخفاء الإشهار مؤقتاً"
            >
              إخفاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
