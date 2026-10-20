import React, { useState } from 'react';
import { Coins, Copy, Check, UploadCloud, ShieldAlert, Sparkles, CheckCircle2, Clock, AlertCircle, Send, Smartphone, CreditCard, ExternalLink, Lock } from 'lucide-react';
import { RECHARGE_PACKAGES, PAYMENT_METHODS } from '../data/constants';
import { PendingRecharge, PointLog } from '../types';

interface PointsViewProps {
  points: number;
  pendingRecharges: PendingRecharge[];
  pointLogs: PointLog[];
  onOpenUploadReceipt: (selectedPkg?: { amount: number; pts: number }) => void;
  onOpenChargilyCheckout?: (selectedPkg?: { amount: number; pts: number }) => void;
  isDark: boolean;
}

export const PointsView: React.FC<PointsViewProps> = ({
  points,
  pendingRecharges,
  pointLogs,
  onOpenUploadReceipt,
  onOpenChargilyCheckout,
  isDark
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className={`p-3.5 space-y-4 pb-12 ${isDark ? 'text-white' : 'text-black'}`}>
      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-black p-5 text-white shadow-xl border border-gray-800">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-lime-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Coins className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-gray-200 font-bold">رصيد النقاط الحالي</div>
              <div className="text-2xl font-black tracking-tight text-white flex items-baseline gap-1.5">
                <span>{points}</span>
                <span className="text-sm font-black text-amber-400">نقطة</span>
              </div>
            </div>
          </div>

          <div className="text-left">
            <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-500/30 text-white border border-emerald-500/50">
              <Sparkles className="w-3 h-3 text-lime-300" />
              <span>50ن هدية تسجيل</span>
            </span>
            <div className="text-[10px] text-gray-300 mt-1 font-mono font-bold">
              يكفي لكشف {Math.floor(points / 25)} زبائن
            </div>
          </div>
        </div>

        {/* Explain Rule */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3 text-xs leading-relaxed border border-white/15 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-emerald-300 mb-0.5">نظام كشف أرقام الزبائن (25 نقطة):</div>
            <div className="text-white text-[11px] font-medium">
              لا توجد عمولة على عملك! تكلفة كشف رقم هاتف أي زبون هي 25 نقطة فقط، لتتصل به مباشرة وتتفق على السعر والعمل بكامل الحرية.
            </div>
          </div>
        </div>

        {/* Low balance alert when points < 25 */}
        {points < 25 && (
          <div className="mt-3 rounded-2xl bg-gradient-to-r from-red-600/30 via-amber-600/20 to-red-600/30 border border-red-500/60 p-2.5 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <div className="font-black text-red-300 text-[11px]">رصيدك منخفض ({points} نقطة - أقل من 25ن)!</div>
                <div className="text-[10px] text-gray-200 font-bold">لا يمكنك كشف أرقام الزبائن حتى يتم شحن الرصيد. اختر باقة بالأسفل للشحن الفوري.</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenUploadReceipt()}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-black text-[11px] font-black shrink-0 shadow-xs active:scale-95 transition"
            >
              شحن الآن ⚡
            </button>
          </div>
        )}
      </div>

      {/* Packages Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-black'}`}>
            باقات شحن النقاط الرسمية
          </h3>
          <span className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
            تفعيل فوري بعد إرسال الوصل
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {RECHARGE_PACKAGES.map((pkg) => (
            <div
              key={pkg.amount}
              className={`relative rounded-2xl border p-3.5 space-y-2.5 transition-all shadow-xs hover:shadow-md ${
                pkg.popular
                  ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                  : isDark
                  ? 'bg-[#151928] border-gray-800'
                  : 'bg-white border-gray-300 shadow-xs'
              } ${isDark && pkg.popular ? 'bg-emerald-950/20' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-emerald-600 to-lime-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  الأكثر طلباً ⭐
                </div>
              )}

              <div>
                <div className={`text-xs font-black ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                  {pkg.reveals} أرقام زبائن
                </div>
                <div className={`text-lg font-black leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
                  {pkg.pts} <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">نقطة</span>
                </div>
                <div className={`text-xs font-black mt-0.5 ${isDark ? 'text-white' : 'text-black'}`}>
                  {pkg.amount.toLocaleString('fr-FR')} دج
                </div>
              </div>

              <div className="text-[10px] text-emerald-800 dark:text-emerald-200 font-black bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-500/30 inline-block">
                {pkg.bonus}
              </div>

              <button
                type="button"
                onClick={() => onOpenUploadReceipt(pkg)}
                className={`w-full py-2 rounded-xl font-black text-xs transition active:scale-95 ${
                  isDark 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                    : 'bg-black hover:bg-gray-900 text-white'
                }`}
              >
                شحن هذه الباقة
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Information */}
      <div className={`rounded-2xl border p-4 space-y-3.5 ${
        isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
      }`}>
        <div className="flex items-center justify-between">
          <h4 className={`font-black text-xs ${isDark ? 'text-white' : 'text-black'}`}>
            معلومات الدفع (BaridiMob & CCP)
          </h4>
          <span className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>تحويل رسمي للمنصة</span>
        </div>

        {/* BaridiMob Connection Card */}
        <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
          isDark ? 'bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-gray-800 border-emerald-500/40' : 'bg-emerald-50/80 border-emerald-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>
                  {PAYMENT_METHODS.baridimob.title}
                </div>
                <div className={`text-[10px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  تحويل مباشر عبر تطبيق بريدي موب 🇩🇿
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              متصل ⚡
            </span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 font-mono ${
            isDark ? 'bg-black/60 border-gray-700' : 'bg-white border-emerald-200'
          }`}>
            <div>
              <span className="text-[9px] font-sans block text-gray-500 font-bold">رقم الحساب (RIP):</span>
              <span className="font-mono font-black text-xs tracking-wider dir-ltr text-emerald-600 dark:text-emerald-400 select-all">
                {PAYMENT_METHODS.baridimob.rip}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(PAYMENT_METHODS.baridimob.rip, 'rip')}
              className={`h-8 px-3 rounded-lg border text-xs font-black flex items-center gap-1 transition active:scale-95 cursor-pointer ${
                isDark ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {copiedKey === 'rip' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'rip' ? 'تم النسخ' : 'نسخ RIP'}</span>
            </button>
          </div>

          {/* Action buttons for BaridiMob */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                handleCopy(PAYMENT_METHODS.baridimob.rip, 'rip');
                const isAndroid = /android/i.test(navigator.userAgent);
                if (isAndroid) {
                  window.location.href = 'intent://#Intent;package=dz.poste.baridimob;scheme=baridimob;end';
                  setTimeout(() => {
                    window.open('https://play.google.com/store/apps/details?id=dz.poste.baridimob', '_blank');
                  }, 1200);
                } else {
                  window.open('https://play.google.com/store/apps/details?id=dz.poste.baridimob', '_blank');
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer text-center"
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">فتح تطبيق BaridiMob 📲</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenUploadReceipt()}
              className={`py-2.5 px-3 rounded-xl border font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer text-center ${
                isDark ? 'bg-gray-800 border-gray-700 text-emerald-400 hover:bg-gray-700' : 'bg-white border-gray-300 text-emerald-800 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">فحص الوصل بالبوت 🤖</span>
            </button>
          </div>
        </div>

        {/* Chargily Pay Connection Card */}
        <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
          isDark ? 'bg-gradient-to-r from-teal-950/40 via-emerald-950/20 to-gray-800 border-teal-500/40' : 'bg-teal-50/80 border-teal-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-black flex items-center justify-center font-black shadow-xs shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>
                  {PAYMENT_METHODS.chargily.title}
                </div>
                <div className={`text-[10px] font-bold ${isDark ? 'text-teal-400' : 'text-teal-800'}`}>
                  البطاقة الذهبية (Edahabia) أو بطاقة CIB البنكية
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-600 text-white shrink-0">
              بوابة إلكترونية ⚡
            </span>
          </div>

          <p className={`text-[11px] font-bold leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {PAYMENT_METHODS.chargily.note} مع الشحن الفوري والتلقائي لنقاط حسابك في ثوانٍ.
          </p>

          {/* Action buttons for Chargily Pay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (onOpenChargilyCheckout) {
                  onOpenChargilyCheckout();
                } else {
                  onOpenUploadReceipt();
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer text-center"
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>دفع فوري بالبطاقة الذهبية / CIB</span>
            </button>

            <a
              href="https://pay.chargily.net"
              target="_blank"
              rel="noopener noreferrer"
              className={`py-2.5 px-3 rounded-xl border font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer text-center ${
                isDark ? 'bg-gray-800 border-gray-700 text-teal-400 hover:bg-gray-700' : 'bg-white border-gray-300 text-teal-800 hover:bg-gray-100'
              }`}
            >
              <span>بوابة Chargily الخارجية</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        </div>

        {/* CCP */}
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'
        }`}>
          <div>
            <div className={`text-[11px] font-black ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
              {PAYMENT_METHODS.ccp.title}
            </div>
            <div className={`font-mono font-black text-xs tracking-wider dir-ltr mt-0.5 ${
              isDark ? 'text-emerald-400' : 'text-black font-extrabold'
            }`}>
              CCP: {PAYMENT_METHODS.ccp.ccpNumber} / Clé: {PAYMENT_METHODS.ccp.cle}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(`${PAYMENT_METHODS.ccp.ccpNumber} clé ${PAYMENT_METHODS.ccp.cle}`, 'ccp')}
            className={`h-8 px-2.5 rounded-lg border text-xs font-black flex items-center gap-1 transition ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
            }`}
          >
            {copiedKey === 'ccp' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>نسخ</span>
          </button>
        </div>

        {/* Flexy Numbers */}
        <div className={`p-3 rounded-xl border space-y-1.5 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'
        }`}>
          <div className={`text-[11px] font-black ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
            {PAYMENT_METHODS.flexy.title}:
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono font-black text-[11px]">
            <div className={`p-1.5 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
            }`}>
              <span className={`text-[9px] block font-sans ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Mobilis</span>
              {PAYMENT_METHODS.flexy.mobilis}
            </div>
            <div className={`p-1.5 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
            }`}>
              <span className={`text-[9px] block font-sans ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Djezzy</span>
              {PAYMENT_METHODS.flexy.djezzy}
            </div>
            <div className={`p-1.5 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'
            }`}>
              <span className={`text-[9px] block font-sans ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Ooredoo</span>
              {PAYMENT_METHODS.flexy.ooredoo}
            </div>
          </div>
        </div>

        {/* AI Bot Notice */}
        <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold leading-relaxed ${
          isDark ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>
            <strong>بوت الفحص التلقائي الذكي مفعّل:</strong> ارفع وصل بريدي موب أو شارجيلي (صورة أو PDF)، وسيقرأ البوت رقم المعاملة والمبلغ ويضيف النقاط لحسابك فوراً.
          </span>
        </div>

        {/* Action Buttons for Upload / Send to Admin */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onOpenUploadReceipt()}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 hover:from-emerald-700 hover:to-green-700 transition active:scale-98"
          >
            <UploadCloud className="w-4 h-4 text-white" />
            <span>رفع وصل الدفع وفحص البوت الذكي</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenUploadReceipt()}
            className={`w-full h-10 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition active:scale-98 ${
              isDark
                ? 'border-gray-700 bg-gray-800/80 text-gray-200 hover:bg-gray-700'
                : 'border-gray-300 bg-gray-50 text-gray-900 hover:bg-gray-100 shadow-xs'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>إرسال وصل للإدارة للمراجعة اليدوية المباشرة</span>
          </button>
        </div>
      </div>

      {/* Pending Recharges Section */}
      {pendingRecharges.length > 0 && (
        <div className={`rounded-2xl border p-4 space-y-2.5 ${
          isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <h4 className={`font-black text-xs ${isDark ? 'text-white' : 'text-black'}`}>
              طلبات الشحن الخاصة بك
            </h4>
            <span className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
              {pendingRecharges.length} عمليات
            </span>
          </div>

          <div className="space-y-2">
            {pendingRecharges.map((pr) => (
              <div
                key={pr.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-black'
                }`}
              >
                <div>
                  <div className={`font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    {pr.amount.toLocaleString('fr-FR')} دج ({pr.pts} نقطة)
                  </div>
                  <div className={`text-[10px] mt-0.5 font-mono font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {pr.receiptName}
                  </div>
                </div>

                <div>
                  {pr.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-xs">
                      <Clock className="w-3 h-3" />
                      <span>قيد المراجعة</span>
                    </span>
                  )}
                  {pr.status === 'approved' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>تم الشحن ✓</span>
                    </span>
                  )}
                  {pr.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>مرفوض</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Point Activity History */}
      <div className={`rounded-2xl border p-4 space-y-2.5 ${
        isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
      }`}>
        <div className="flex items-center justify-between">
          <h4 className={`font-black text-xs ${isDark ? 'text-white' : 'text-black'}`}>
            سجل حركة النقاط
          </h4>
          <span className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>آخر العمليات</span>
        </div>

        {pointLogs.length === 0 ? (
          <div className={`text-center py-4 text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
            لم تسجل أي حركة نقاط بعد. كشف أول رقم زبون سيظهر هنا.
          </div>
        ) : (
          <div className="space-y-1.5">
            {pointLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-center justify-between text-xs py-1.5 border-b last:border-b-0 ${
                  isDark ? 'border-gray-800' : 'border-gray-200'
                }`}
              >
                <div>
                  <div className={`font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    {log.description}
                  </div>
                  <div className={`text-[10px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    {new Date(log.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span className={`font-mono font-black ${
                  log.pts > 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-700 font-extrabold') : 'text-red-600'
                }`}>
                  {log.pts > 0 ? `+${log.pts}` : log.pts} ن
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
