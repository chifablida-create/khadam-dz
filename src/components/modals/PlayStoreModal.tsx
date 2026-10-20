import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  FileCode,
  Package,
  Layers,
  FileText
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { getPublicAppUrl } from '../../utils/appUrl';

interface PlayStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const PlayStoreModal: React.FC<PlayStoreModalProps> = ({
  isOpen,
  onClose,
  isDark
}) => {
  const [activeTab, setActiveTab] = useState<'install' | 'publish' | 'guide'>('install');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const currentOrigin = getPublicAppUrl();
  const manifestUrl = `${currentOrigin}/manifest.json`;
  const assetLinksUrl = `${currentOrigin}/.well-known/assetlinks.json`;
  const privacyUrl = `${currentOrigin}/privacy`;
  const packageName = 'dz.khadam.app';

  const bubblewrapCommand = `npx @bubblewrap/cli init --manifest=${manifestUrl}
npx @bubblewrap/cli build`;

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField(null);
    }, 2500);
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPublishPackage = () => {
    const twaManifest = {
      packageId: packageName,
      host: currentOrigin.replace(/^https?:\/\//, ''),
      name: 'خدّام ديزاد - Khadam DZ',
      launcherName: 'خدّام DZ',
      themeColor: '#16a34a',
      navigationColor: '#080a12',
      backgroundColor: '#080a12',
      startUrl: '/',
      iconUrl: `${currentOrigin}/icon.svg`,
      maskableIconUrl: `${currentOrigin}/icon.svg`,
      appVersionName: '1.0.0',
      appVersionCode: 1,
      shortcuts: [],
      generatorApp: 'bubblewrap-cli',
      webManifestUrl: manifestUrl,
      fallbackType: 'customtabs',
      enableNotifications: true
    };

    downloadFile('twa-manifest.json', JSON.stringify(twaManifest, null, 2), 'application/json');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
          isDark ? 'bg-[#0f121d] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'
        }`}
      >
        {/* Top Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-gray-800 bg-[#161b2c]' : 'border-gray-200 bg-emerald-50'
        }`}>
          <div className="flex items-center gap-2.5">
            {/* Google Play Styled Icon Badge */}
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 flex items-center justify-center text-white shadow-md">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a2.03 2.03 0 0 1-.61-1.465V3.279c0-.573.228-1.096.61-1.465zm11.602 11.603l2.678 2.679-11.83 6.83 9.152-9.51zm2.678-2.834L5.059 3.073l12.83 7.51zm1.246 1.417l2.87 1.677c.806.471.806 1.238 0 1.709l-2.87 1.677-2.316-2.531 2.316-2.532z" />
              </svg>
            </div>
            <div>
              <h2 className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                متجر Google Play Store
              </h2>
              <p className={`text-[11px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                تطبيق خدّام ديزاد لأجهزة الأندرويد 🇩🇿
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition active:scale-95 ${
              isDark
                ? 'border-gray-700 text-white hover:bg-gray-800'
                : 'border-gray-300 text-black hover:bg-gray-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`grid grid-cols-3 border-b text-xs font-black p-1.5 gap-1 ${
          isDark ? 'border-gray-800 bg-[#121624]' : 'border-gray-200 bg-gray-100'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('install')}
            className={`py-2 px-1 rounded-xl text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'install'
                ? isDark
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-800 hover:text-black'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>التثبيت الفوري</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('publish')}
            className={`py-2 px-1 rounded-xl text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'publish'
                ? isDark
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-800 hover:text-black'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>حزمة الرفع (AAB)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`py-2 px-1 rounded-xl text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'guide'
                ? isDark
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-800 hover:text-black'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>خطوات النشر</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: Instant Install */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              {/* Official Google Play Badge Banner */}
              <div className={`p-4 rounded-2xl border text-center space-y-3 ${
                isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-emerald-50/70 border-emerald-200'
              }`}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[11px] border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>تطبيق معتمد متوافق مع Android 14+ وجميع الأنظمة</span>
                </div>

                <div className="space-y-1">
                  <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-black'}`}>
                    ثبّت خدّام DZ على هاتفك الآن
                  </h3>
                  <p className={`text-xs font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    يعمل كتطبيق أصلي (APK / Standalone) مباشرة على هاتفك وبدون الحاجة لفتح المتصفح!
                  </p>
                </div>

                {/* Primary Action Button */}
                {isInstalled ? (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>التطبيق مثبت حالياً على جهازك وهو يعمل بأحدث إصدار ✓</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    type="button"
                    onClick={install}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>تثبيت التطبيق على جهازي الآن (بنقرة واحدة)</span>
                  </button>
                ) : isIOS ? (
                  <div className={`p-3 rounded-xl border text-right space-y-1.5 ${
                    isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'
                  }`}>
                    <p className="font-black text-xs">طريقة التثبيت على آيفون (Safari):</p>
                    <p className={`font-bold text-[11px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      1. اضغط على زر <strong>المشاركة (Share)</strong> أسفل سفاري.
                      <br />
                      2. اختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        const hint = document.getElementById('pwa-manual-install-hint');
                        if (hint) {
                          hint.classList.toggle('hidden');
                        }
                      }}
                      className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>إضافة إلى الشاشة الرئيسية (Install App)</span>
                    </button>
                    <div id="pwa-manual-install-hint" className={`hidden p-2.5 rounded-xl border text-[11px] font-bold text-center ${
                      isDark ? 'bg-gray-900 border-gray-700 text-emerald-400' : 'bg-white border-emerald-300 text-emerald-800'
                    }`}>
                      لتثبيت التطبيق: افتح قائمة المتصفح (⋮) ثم اضغط &quot;تثبيت التطبيق&quot; أو &quot;إضافة إلى الشاشة الرئيسية&quot;.
                    </div>

                    <a
                      href="/download/github-source.zip"
                      download="khadam-dz-real-source.zip"
                      className="w-full h-11 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <Package className="w-4 h-4" />
                      <span>تحميل أرشيف الكود المصدري الحقيقي كاملاً (GitHub Source ZIP)</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Benefits list */}
              <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                isDark ? 'bg-[#151928] border-gray-800' : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-black text-xs ${isDark ? 'text-white' : 'text-black'}`}>
                  مميزات التثبيت المباشر:
                </h4>
                <div className="space-y-2 font-bold text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">✓</span>
                    <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>أيقونة رسمية على شاشة الهاتف تفتح بلمسة واحدة.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">✓</span>
                    <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>شاشة كاملة بدون شريط عنوان أو تشتيت.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">✓</span>
                    <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>استقبال الإشعارات والطلبات الجديدة في ولايتك فورياً.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">✓</span>
                    <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>يعمل أونلاين 24/7 دون توقف حتى مع ضعف الشبكة.</span>
                  </div>
                </div>
              </div>

              {/* Store Link fallback */}
              <div className="text-center pt-1">
                <a
                  href={`https://play.google.com/store/apps/details?id=${packageName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-xs font-black hover:underline ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  <span>صفحة التطبيق في Google Play Store</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: Package (AAB / Bubblewrap) */}
          {activeTab === 'publish' && (
            <div className="space-y-4">
              <div className={`p-3.5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-emerald-50/70 border-emerald-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs">معلومات الحزمة الرسمية (TWA):</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold">
                    جاهزة 100%
                  </span>
                </div>
                <div className="space-y-1.5 font-bold text-[11px]">
                  <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Package Name:</span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{packageName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Digital Asset Links:</span>
                    <span className="font-mono font-bold text-[10px] text-emerald-600 dark:text-emerald-400 truncate max-w-[190px]">
                      /.well-known/assetlinks.json
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Web Manifest:</span>
                    <span className="font-mono font-bold text-[10px] text-emerald-600 dark:text-emerald-400">
                      /manifest.json (Standalone)
                    </span>
                  </div>
                </div>
              </div>

              {/* Official Privacy Policy Box for Google Play Console */}
              <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                isDark ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className={`font-black text-xs ${isDark ? 'text-white' : 'text-black'}`}>
                      عنوان URL سياسة الخصوصية (Privacy Policy):
                    </span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    مطلوب للمتجر
                  </span>
                </div>

                <p className={`text-[11px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  انسخ هذا الرابط وضعه في Google Play Console في قسم <strong>محتوى التطبيق (App Content) &gt; سياسة الخصوصية (Privacy Policy)</strong>:
                </p>

                <div className={`p-2 rounded-xl border flex items-center justify-between gap-2 font-mono text-xs ${
                  isDark ? 'bg-black/60 border-gray-700' : 'bg-white border-gray-300'
                }`}>
                  <span className="truncate text-emerald-600 dark:text-emerald-400 font-bold dir-ltr select-all">
                    {privacyUrl}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(privacyUrl, 'privacy_url')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                    >
                      {copiedField === 'privacy_url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'privacy_url' ? 'تم النسخ' : 'نسخ الرابط'}</span>
                    </button>
                    <a
                      href={privacyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1 rounded-lg border hover:bg-gray-200 dark:hover:bg-gray-800 transition ${
                        isDark ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'
                      }`}
                      title="فتح وتصفح صفحة سياسة الخصوصية"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Real Source Code & Official PWABuilder Box */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-gray-900 border-emerald-500/40 text-white' : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border-emerald-300 text-black'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-black text-xs">ملفات المشروع الحقيقية لـ GitHub و PWABuilder:</div>
                      <div className={`text-[10px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        كود مصدري حقيقي 100% بدون أي ملفات وهمية
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href="/download/github-source.zip"
                  download="khadam-dz-real-source.zip"
                  className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل ملفات المشروع الحقيقية كاملة (khadam-dz-real-source.zip)</span>
                </a>

                <a
                  href={`https://www.pwabuilder.com/?url=${encodeURIComponent(currentOrigin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full h-10 rounded-xl border font-black text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer ${
                    isDark
                      ? 'bg-gray-900/90 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white'
                      : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                  <span>بناء حزمة المتجر الرسمية عبر PWABuilder.com</span>
                </a>
              </div>

              {/* Bubblewrap CLI command block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`font-black text-xs flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-black'}`}>
                    <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                    <span>أمر توليد وتعديل ملف AAB محلياً (مطورين):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bubblewrapCommand, 'cmd')}
                    className={`text-[10px] font-black px-2 py-1 rounded-lg border flex items-center gap-1 ${
                      isDark
                        ? 'border-gray-700 bg-gray-800 text-white hover:bg-gray-700'
                        : 'border-gray-300 bg-gray-100 text-black hover:bg-gray-200'
                    }`}
                  >
                    {copiedField === 'cmd' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'cmd' ? 'تم النسخ' : 'نسخ الأمر'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-black text-emerald-400 font-mono text-[11px] dir-ltr text-left overflow-x-auto leading-relaxed border border-gray-800">
                  <p># 1. تهيئة حزمة أندرويد عبر أداة Google الرسمية</p>
                  <p className="text-white">npx @bubblewrap/cli init --manifest={manifestUrl}</p>
                  <p className="mt-2"># 2. بناء ملف AAB الموقّع للرفع للمتجر</p>
                  <p className="text-white">npx @bubblewrap/cli build</p>
                </div>
              </div>

              {/* Download Package Files */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={downloadPublishPackage}
                  className="w-full h-10 rounded-xl bg-gray-900 hover:bg-black text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تنزيل ملف إعدادات النشر المخصص (twa-manifest.json)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Publishing Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-3.5">
              <div className={`p-3 rounded-2xl border space-y-2.5 ${
                isDark ? 'bg-[#151928] border-gray-800' : 'bg-gray-50 border-gray-300'
              }`}>
                <h4 className={`font-black text-xs ${isDark ? 'text-white' : 'text-black'}`}>
                  خطوات نشر التطبيق على Google Play Console:
                </h4>

                <div className="space-y-3 font-bold text-[11px]">
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 font-black">
                      1
                    </span>
                    <div>
                      <p className={`font-black ${isDark ? 'text-white' : 'text-black'}`}>
                        فتح حساب مطور Google Play:
                      </p>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        سجل الدخول في play.google.com/console واضغط على &quot;إنشاء تطبيق جديد&quot; باسم &quot;خدّام ديزاد&quot;.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 font-black">
                      2
                    </span>
                    <div>
                      <p className={`font-black ${isDark ? 'text-white' : 'text-black'}`}>
                        توليد حزمة App Bundle (.aab):
                      </p>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        شغل أمر Bubblewrap أو استخدم موقع PWABuilder.com لإدخال رابط التطبيق وتنزيل ملف APK/AAB بضغطة زر.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 font-black">
                      3
                    </span>
                    <div>
                      <p className={`font-black ${isDark ? 'text-white' : 'text-black'}`}>
                        رفع الحزمة وضبط صفحة المتجر وسياسة الخصوصية:
                      </p>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        ارفع ملف `.aab` في قسم الإنتاج، وضع رابط سياسة الخصوصية (<span className="text-emerald-500 font-mono">/privacy</span>) في قسم محتوى التطبيق، وأضف صور الشاشة ووصف المنصة.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 font-black">
                      4
                    </span>
                    <div>
                      <p className={`font-black ${isDark ? 'text-white' : 'text-black'}`}>
                        الإرسال للمراجعة والنشر:
                      </p>
                      <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        اضغط على &quot;إرسال للتطبيق&quot;؛ سيقوم فريق Google بمراجعته وسيكون متاحاً لجميع مستخدمي الجزائر والعالم!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Console quick link */}
              <a
                href="https://play.google.com/console"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>الانتقال إلى Google Play Console</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-3.5 border-t flex items-center justify-between ${
          isDark ? 'border-gray-800 bg-[#121624]' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              الحزمة متوافقة وموثقة تلقائياً
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-black transition active:scale-95 ${
              isDark
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
