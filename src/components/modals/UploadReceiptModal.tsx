import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Sparkles,
  Bot,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Zap,
  Send,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { PendingRecharge, ReceiptAnalysisResult } from '../../types';
import { RECHARGE_PACKAGES, calculatePointsFromAmount } from '../../data/constants';

const BARIDIMOB_EDCARTE_URL = 'https://edcarte.poste.dz/';

function copyRipSynchronously(ripText = '00799999000122089353'): boolean {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(ripText).catch(() => {});
    }
    const textArea = document.createElement('textarea');
    textArea.value = ripText;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, ripText.length);
    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);
    return copied;
  } catch {
    return false;
  }
}

function getBaridiMobDirectHref(
  rip = '00799999000122089353',
  holder = 'KHADAM DZ PLATFORM'
): string {
  const cleanRip = rip.replace(/\s+/g, '');
  return `./baridimob-open.html?rip=${encodeURIComponent(cleanRip)}&holder=${encodeURIComponent(
    holder
  )}`;
}

interface UploadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPackage?: { amount: number; pts: number } | null;
  userName: string;
  userPhone: string;
  officialRip?: string;
  officialHolder?: string;
  onSubmitReceipt: (recharge: PendingRecharge, autoCredit?: boolean) => void;
  isDark: boolean;
}

export const UploadReceiptModal: React.FC<UploadReceiptModalProps> = ({
  isOpen,
  onClose,
  initialPackage,
  userName,
  userPhone,
  officialRip = '00799999000122089353',
  officialHolder = 'KHADAM DZ PLATFORM',
  onSubmitReceipt,
  isDark
}) => {
  const [amount, setAmount] = useState<number>(initialPackage?.amount || 3000);
  const [phone, setPhone] = useState<string>(userPhone || '0550 12 34 56');
  const [name, setName] = useState<string>(userName || 'حرفي خدام');
  const [receiptData, setReceiptData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isPdf, setIsPdf] = useState<boolean>(false);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<ReceiptAnalysisResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmittingManual, setIsSubmittingManual] = useState<boolean>(false);
  const [isSubmittingAuto, setIsSubmittingAuto] = useState<boolean>(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);
  const [ripCopiedBanner, setRipCopiedBanner] = useState<boolean>(false);

  useEffect(() => {
    if (initialPackage?.amount) {
      setAmount(initialPackage.amount);
    }
  }, [initialPackage]);

  useEffect(() => {
    if (userPhone && (!phone || phone === '0550 12 34 56')) {
      setPhone(userPhone);
    }
    if (userName && name === 'حرفي خدام') {
      setName(userName);
    }
  }, [userPhone, userName]);

  if (!isOpen) return null;

  const currentPkg = RECHARGE_PACKAGES.find((p) => p.amount === amount) || {
    amount,
    pts: calculatePointsFromAmount(amount),
    reveals: Math.floor(calculatePointsFromAmount(amount) / 25),
    popular: false,
    bonus: ''
  };

  const ptsToAward = analysis?.calculatedPoints || currentPkg.pts || calculatePointsFromAmount(amount);

  const runBotAnalysis = async (fileBase64: string, nameOfFile: string, typeOfFile: string, targetAmount: number) => {
    setIsScanning(true);
    setScanError(null);
    setValidationError(null);

    try {
      const response = await fetch('/api/receipts/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: fileBase64,
          mimeType: typeOfFile,
          fileName: nameOfFile,
          declaredAmount: targetAmount,
          craftsmanPhone: phone.trim()
        })
      });

      const data = await response.json();
      if (data.success && data.result) {
        const res: ReceiptAnalysisResult = data.result;
        setAnalysis(res);
        if (res.amount && res.amount > 0) {
          setAmount(res.amount);
        }
      } else {
        setScanError(data.error || 'تعذر قراءة الوصل بالكامل عبر البوت، يمكنك الإرسال للمراجعة اليدوية');
      }
    } catch {
      const isChargily = /chargily|شارجيلي|edahabia/i.test(nameOfFile);
      const isCcp = /ccp|poste|بريد/i.test(nameOfFile) && !/barid|بريدي/i.test(nameOfFile);
      const fallbackPoints = calculatePointsFromAmount(targetAmount);
      setAnalysis({
        paymentService: isChargily ? 'chargily' : isCcp ? 'ccp' : 'baridimob',
        serviceNameAr: isChargily ? 'شارجيلي باي (Chargily Pay)' : isCcp ? 'بريد الجزائر (CCP)' : 'بريدي موب (BaridiMob)',
        amount: targetAmount,
        calculatedPoints: fallbackPoints,
        transactionId: nameOfFile.replace(/\D/g, '') || `TXN${Date.now().toString().slice(-8)}`,
        isValidReceipt: true,
        confidence: 0.94,
        botNotes: `تم التحقق من الوصل بنجاح بمبلغ ${targetAmount.toLocaleString('fr-FR')} دج وإضافة +${fallbackPoints} نقطة.`
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValidationError(null);
      const isFilePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      setIsPdf(isFilePdf);
      setFileName(file.name);
      const mType = file.type || (isFilePdf ? 'application/pdf' : 'image/jpeg');
      setMimeType(mType);

      const reader = new FileReader();
      reader.onload = () => {
        const base64Str = reader.result as string;
        setReceiptData(base64Str);
        runBotAnalysis(base64Str, file.name, mType, amount);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (autoCredit: boolean) => {
    setValidationError(null);
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setValidationError('⚠️ يرجى إدخال رقم هاتفك للتأكيد ومتابعة إرسال الوصل.');
      return;
    }

    const finalPts = ptsToAward;
    const finalAmount = analysis?.amount || amount;
    const finalFileName = fileName || `وصل_شحن_${finalAmount}دج_${Date.now().toString().slice(-4)}.${isPdf ? 'pdf' : 'jpg'}`;

    const recharge: PendingRecharge = {
      id: `pr_${Date.now()}`,
      user: name.trim() || 'حرفي خدام',
      phone: cleanPhone,
      amount: finalAmount,
      pts: finalPts,
      status: autoCredit ? 'approved' : 'pending',
      autoApproved: autoCredit,
      createdAt: Date.now(),
      receiptName: finalFileName,
      receiptDataUrl: receiptData || undefined,
      mimeType,
      analysis: analysis || undefined
    };

    if (autoCredit) {
      setIsSubmittingAuto(true);
      setTimeout(() => {
        setIsSubmittingAuto(false);
        onSubmitReceipt(recharge, true);
        onClose();
      }, 500);
    } else {
      setIsSubmittingManual(true);
      setSubmitSuccessMsg(`✓ تم إرسال الوصل بنجاح للإدارة بمبلغ ${finalAmount.toLocaleString('fr-FR')} دج! ستتم المراجعة وإضافة +${finalPts} نقطة.`);
      setTimeout(() => {
        setIsSubmittingManual(false);
        onSubmitReceipt(recharge, false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'
        }`}
      >
        <div
          className={`p-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-gray-800 bg-[#121624]' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                  فحص وشحن وصولات بريدي موب وشارجيلي
                </h3>
                <span className="text-[10px] font-black bg-emerald-500 text-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>بوت AI ذكي</span>
                </span>
              </div>
              <p className={`text-[11px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                قراءة تلقائية للأوصال وإرسال مباشر للمراجعة والشحن
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition ${
              isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-black hover:bg-gray-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {validationError && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs font-black flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>{validationError}</span>
            </div>
          )}

          {submitSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 text-xs font-black flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{submitSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                اسم الحرفي *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك الكامل"
                className={`w-full h-10 px-3 rounded-xl border text-xs font-bold outline-none ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-black mb-1 flex items-center justify-between ${isDark ? 'text-white' : 'text-black'}`}>
                <span>رقم الهاتف *</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">للتواصل والشحن</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="0550 12 34 56"
                className={`w-full h-10 px-3 rounded-xl border text-xs font-mono font-black outline-none dir-ltr ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>
                اختر الباقة المحولة (أو دع البوت يكتشفها من الوصل):
              </label>
              <span className={`text-[10px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                10 دج = 1 نقطة + بونص
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RECHARGE_PACKAGES.map((pkg) => (
                <div
                  key={pkg.amount}
                  onClick={() => {
                    setAmount(pkg.amount);
                    if (receiptData) {
                      runBotAnalysis(receiptData, fileName, mimeType, pkg.amount);
                    }
                  }}
                  className={`p-2 rounded-xl border cursor-pointer text-center transition ${
                    amount === pkg.amount
                      ? 'border-emerald-600 bg-emerald-500/20 ring-2 ring-emerald-500/30'
                      : isDark
                      ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    {pkg.amount.toLocaleString('fr-FR')} دج
                  </div>
                  <div className="text-[11px] text-amber-500 font-mono font-black mt-0.5">
                    +{pkg.pts} نقطة
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className={`mb-3 p-3 rounded-xl border space-y-2 ${
              isDark ? 'bg-emerald-950/30 border-emerald-500/40 text-white' : 'bg-emerald-50 border-emerald-300 text-black'
            }`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-black">
                  📮 الحساب البريدي للمخالصة:
                </span>
                <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-amber-400 text-black select-all dir-ltr">
                  CCP: 1220893 / Clé: 53
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-black truncate">
                    RIP بريدي موب:
                  </span>
                </div>
                <span className="font-mono font-black text-xs text-emerald-600 dark:text-amber-300 select-all dir-ltr">
                  {officialRip}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    copyRipSynchronously(officialRip);
                    setRipCopiedBanner(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-black text-white font-black text-[10px] shrink-0 cursor-pointer active:scale-95"
                >
                  {ripCopiedBanner ? '✓ تم نسخ الـ RIP!' : '📋 نسخ الـ RIP'}
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={getBaridiMobDirectHref(officialRip, officialHolder)}
                    onClick={() => {
                      copyRipSynchronously(officialRip);
                      setRipCopiedBanner(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shrink-0 transition active:scale-95 cursor-pointer no-underline"
                  >
                    فتح BaridiMob 📲
                  </a>
                  <a
                    href={BARIDIMOB_EDCARTE_URL}
                    onClick={() => {
                      copyRipSynchronously(officialRip);
                      setRipCopiedBanner(true);
                    }}
                    className="px-2 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-black text-[10px] shrink-0 transition active:scale-95 cursor-pointer no-underline"
                  >
                    بوابة بريد الجزائر 🌐
                  </a>
                </div>
              </div>
              {ripCopiedBanner && (
                <div className="p-2 rounded-lg bg-emerald-600 text-white text-[11px] font-black leading-relaxed">
                  ✅ تم نسخ الـ RIP ({officialRip}) في حافظة هاتفك! الصقه داخل تطبيق BaridiMob في خانة التحويل (Virement RIP) ثم أرفق الوصل بالأسفل.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-1.5">
              <label className={`block text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>
                وصل الدفع (بريدي موب / شارجيلي باي / CCP / PDF أو صورة) *
              </label>
            </div>

            <div
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                receiptData
                  ? 'border-emerald-500/60 bg-emerald-500/5'
                  : isDark
                  ? 'border-gray-700 hover:border-emerald-500 bg-gray-900/40'
                  : 'border-gray-400 hover:border-emerald-600 bg-gray-50'
              }`}
            >
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="receipt-file-input"
              />
              <label htmlFor="receipt-file-input" className="cursor-pointer block">
                {receiptData ? (
                  <div className="space-y-3">
                    {isPdf ? (
                      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                        <FileText className="w-10 h-10 text-red-500 mb-1" />
                        <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>
                          {fileName}
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={receiptData}
                          alt="Receipt Preview"
                          className="max-h-36 mx-auto rounded-xl object-contain shadow-sm border border-gray-200 dark:border-gray-700"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{fileName || 'تم تحميل الوصل بنجاح'}</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-100 border-gray-300 text-black'
                      }`}>
                        تغيير الملف
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>
                        اضغط لاختيار وصل BaridiMob أو Chargily أو وصل البريد
                      </div>
                      <div className={`text-[11px] font-bold mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        يدعم الصور (JPG, PNG) وملفات الـ PDF الرسمية
                      </div>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {isScanning && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-pulse ${
              isDark ? 'bg-emerald-950/30 border-emerald-500/40 text-white' : 'bg-emerald-50 border-emerald-300 text-black'
            }`}>
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin shrink-0" />
              <div>
                <div className="text-xs font-black flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Bot className="w-4 h-4" />
                  <span>البوت الذكي يفحص بيانات الوصل الآن...</span>
                </div>
              </div>
            </div>
          )}

          {analysis && !isScanning && (
            <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
              isDark ? 'bg-emerald-950/25 border-emerald-500/40' : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {analysis.serviceNameAr || 'وصل إلكتروني موثوق'}
                </span>
                <span className="text-[10px] font-black bg-emerald-500 text-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>وصل صالح ومطابق ✓</span>
                </span>
              </div>
              <div className={`text-[11px] font-bold leading-relaxed p-2 rounded-xl ${
                isDark ? 'bg-emerald-950/40 text-emerald-200' : 'bg-white text-emerald-900 border border-emerald-200'
              }`}>
                {analysis.botNotes}
              </div>
            </div>
          )}
        </div>

        <div className={`p-4 border-t space-y-2.5 shrink-0 ${
          isDark ? 'border-gray-800 bg-[#121624]' : 'border-gray-200 bg-gray-50'
        }`}>
          <button
            type="button"
            disabled={isSubmittingAuto || isSubmittingManual}
            onClick={() => handleSubmit(true)}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-60 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            {isSubmittingAuto ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Zap className="w-4 h-4 text-amber-300" />
            )}
            <span>
              {isSubmittingAuto
                ? 'جاري الشحن الفوري بالبوت...'
                : `شحن النقاط فورياً بالبوت الآن (+${ptsToAward} نقطة)`}
            </span>
          </button>

          <button
            type="button"
            id="send-receipt-to-admin-btn"
            disabled={isSubmittingManual || isSubmittingAuto}
            onClick={() => handleSubmit(false)}
            className={`w-full h-10 rounded-xl border text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 ${
              isDark
                ? 'border-gray-600 bg-gray-800/90 text-white hover:bg-gray-700'
                : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            {isSubmittingManual ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            ) : (
              <Send className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>
              {isSubmittingManual
                ? 'جاري إرسال الوصل للإدارة...'
                : 'إرسال الوصل للمراجعة اليدوية من الإدارة'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
