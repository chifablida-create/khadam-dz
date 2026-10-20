import React, { useState } from 'react';
import { X, ExternalLink, Check, Copy, Smartphone, ShieldCheck, Download, Sparkles, HelpCircle } from 'lucide-react';

interface PlayStorePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
  isDark: boolean;
}

export const PlayStorePublishModal: React.FC<PlayStorePublishModalProps> = ({
  isOpen,
  onClose,
  appUrl,
  isDark
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : appUrl;

  const playStoreDescription = `خدّام ديزاد (Khadam DZ) - المنصة الجزائرية الأولى لربط الحرفيين وأصحاب المهن مع الزبائن عبر كامل ولايات الوطن (58 ولاية).

مميزات التطبيق:
• أكثر من 70 حرفة ومهنة: سباكة، كهرباء، نجارة، دهان، تبريد وتكييف، بناء، تصليح هواتف وأجهزة كهرومنزلية.
• كشف أرقام الزبائن مباشرة بدون عمولات على العمل.
• اتصال هاتفي ومحادثة واتساب سريعة بلمسة واحدة.
• 50 نقطة هدية مجانية لكل حرفي مسجل.
• نظام شحن رصيد سهل عبر بريدي موب (BaridiMob) والحساب البريدي الجاري (CCP).
• يعمل أونلاين 24/7 مع حماية الشاشة وتنبيهات فورية بالطلبات الجديدة.`;

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className={`w-full max-w-lg max-h-[90vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-gray-800 bg-[#121624]' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-400 text-white flex items-center justify-center text-xl font-black shadow-xs shrink-0">
              📱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                  دليل نشر تطبيق خدام DZ على Google Play Store
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                  جاهز 100%
                </span>
              </div>
              <p className={`text-[11px] font-bold mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                خطوات تحويل المنصة إلى حزمة أندرويد (.aab) ورفعها على متجر بلاي
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-full border flex items-center justify-center ${
              isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-black hover:bg-gray-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {/* Status Verification Card */}
          <div className={`p-3.5 rounded-2xl border space-y-2 ${
            isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-white' : 'bg-emerald-50 border-emerald-300 text-black'
          }`}>
            <div className="flex items-center gap-2 font-black text-xs text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>تم تجهيز كافة ملفات ومتطلبات Google Play الرسمية في الكود:</span>
            </div>
            <ul className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span>
                <span>ملف الـ Manifest (manifest.json)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span>
                <span>محرك العمل 24/7 (sw.js)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span>
                <span>أيقونة المتجر عالية الدقة (icon.svg)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span>
                <span>التحقق الرقمي (assetlinks.json)</span>
              </li>
            </ul>
          </div>

          {/* STEP 1: PWABuilder 1-Click Generation */}
          <div className={`p-4 rounded-2xl border space-y-2.5 ${
            isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                الخطوة 1: توليد حزمة أندرويد (.aab) مجاناً بنقرة واحدة
              </span>
              <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                موصى به رسمياً
              </span>
            </div>
            <p className={`text-[11px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
              باستخدام أداة <strong>PWABuilder</strong> المدعومة من Google و Microsoft، يمكنك إدخال رابط تطبيقك وتحميل حزمة Google Play (.aab) الموقعة مباشرة:
            </p>

            <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 font-mono text-[11px] ${
              isDark ? 'bg-gray-900 border-gray-700 text-emerald-400' : 'bg-white border-gray-300 text-black'
            }`}>
              <span className="truncate dir-ltr">{currentOrigin}</span>
              <button
                type="button"
                onClick={() => handleCopy(currentOrigin, 'url')}
                className={`px-2 py-1 rounded-lg border text-[10px] font-sans font-bold flex items-center gap-1 ${
                  isDark ? 'border-gray-700 text-white' : 'border-gray-300 text-black'
                }`}
              >
                {copiedSection === 'url' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>نسخ الرابط</span>
              </button>
            </div>

            <a
              href={`https://www.pwabuilder.com/?url=${encodeURIComponent(currentOrigin)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs hover:from-emerald-700 hover:to-green-700 transition"
            >
              <Download className="w-4 h-4" />
              <span>فتح PWABuilder وتنزيل حزمة Google Play (.aab)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* STEP 2: Google Play Console Account */}
          <div className={`p-4 rounded-2xl border space-y-2.5 ${
            isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-300'
          }`}>
            <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
              الخطوة 2: الدخول لحساب مطور Google Play Console
            </span>
            <p className={`text-[11px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
              افتح لوحة تحكم مطوري جوجل بلاي ثم اضغط على <strong>"إنشاء تطبيق" (Create app)</strong> واختر اسم "خدّام ديزاد - Khadam DZ":
            </p>

            <a
              href="https://play.google.com/console"
              target="_blank"
              rel="noreferrer"
              className={`w-full h-10 rounded-xl border font-black text-xs flex items-center justify-center gap-2 transition ${
                isDark ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-black hover:bg-gray-100'
              }`}
            >
              <span>فتح Google Play Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* STEP 3: Store Listing Copy */}
          <div className={`p-4 rounded-2xl border space-y-2.5 ${
            isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                الخطوة 3: وصف التطبيق الجاهز لمتجر بلاي ستور
              </span>
              <button
                type="button"
                onClick={() => handleCopy(playStoreDescription, 'desc')}
                className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
              >
                {copiedSection === 'desc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>نسخ النص كاملاً</span>
              </button>
            </div>

            <textarea
              readOnly
              rows={4}
              value={playStoreDescription}
              className={`w-full p-2.5 rounded-xl border text-[11px] font-bold outline-none leading-relaxed ${
                isDark ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-black'
              }`}
            />
          </div>

          {/* STEP 4: Bubblewrap CLI Alternative for Advanced Developers */}
          <div className={`p-3 rounded-2xl border space-y-1.5 ${
            isDark ? 'bg-gray-900/40 border-gray-800 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-800'
          }`}>
            <div className="font-black text-[11px] flex items-center gap-1 text-gray-400">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>طريقة متقدمة بديلة (سطر الأوامر Bubblewrap):</span>
            </div>
            <code className="block p-2 rounded-lg bg-black text-emerald-400 font-mono text-[10px] dir-ltr select-all">
              npx @bubblewrap/cli init --manifest={currentOrigin}/manifest.json
            </code>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-3.5 border-t flex items-center justify-between shrink-0 ${
          isDark ? 'border-gray-800 bg-[#121624]' : 'border-gray-200 bg-gray-50'
        }`}>
          <span className={`text-[11px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
            بعد رفع الملف، سيتم قبول ونشر التطبيق رسمياً في غضون 24-48 ساعة.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-black text-white font-black text-xs hover:bg-gray-900"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
