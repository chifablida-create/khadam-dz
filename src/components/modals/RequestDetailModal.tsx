import React from 'react';
import { X, MapPin, Clock, Flame, Phone, MessageSquare, Unlock, Check, Sparkles, Calendar, BellRing, Download, Star, CheckCircle2, Award } from 'lucide-react';
import { RequestItem, RatingItem } from '../../types';
import { getCraftIcon, formatRelativeTime } from '../../data/constants';
import {
  timestampToDatetimeLocalValue,
  resolveAgreementScheduledTimestamp,
  formatScheduledAppointmentAr,
  getAppointmentCountdownInfo,
  buildGoogleCalendarUrl,
  downloadAppointmentIcsFile
} from '../../utils/appointmentScheduler';

interface RequestDetailModalProps {
  request: RequestItem | null;
  onClose: () => void;
  isRevealed: boolean;
  isRegisteredCraftsman?: boolean;
  craftsmanName?: string;
  onRevealPhone: (request: RequestItem) => void;
  onToggleAgreeRequest?: (request: RequestItem) => void;
  onUpdateAgreementDetails?: (
    request: RequestItem,
    details: {
      isAgreed: boolean;
      agreementTimeNote?: string;
      agreementScheduledAt?: number;
      agreementReminderMinutes?: number;
      cancellationReason?: string;
    }
  ) => void;
  onTriggerAppointmentReminderNow?: (request: RequestItem) => void;
  existingRating?: RatingItem | null;
  onCompleteAndRate?: (request: RequestItem) => void;
  onOpenCraftsmanProfileByName?: (name: string, craft: string) => void;
  isDark: boolean;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  onClose,
  isRevealed,
  isRegisteredCraftsman = false,
  craftsmanName = '',
  onRevealPhone,
  onToggleAgreeRequest,
  onUpdateAgreementDetails,
  onTriggerAppointmentReminderNow,
  existingRating,
  onCompleteAndRate,
  onOpenCraftsmanProfileByName,
  isDark
}) => {
  const [copied, setCopied] = React.useState(false);
  const [agreementTimeInput, setAgreementTimeInput] = React.useState('');
  const [scheduledDatetimeInput, setScheduledDatetimeInput] = React.useState('');
  const [reminderMinutesInput, setReminderMinutesInput] = React.useState<number>(30);
  const [cancellationReasonInput, setCancellationReasonInput] = React.useState('');
  const [calendarSavedBanner, setCalendarSavedBanner] = React.useState(false);

  React.useEffect(() => {
    if (request) {
      setAgreementTimeInput(request.agreementTimeNote || '');
      const initialTs =
        request.agreementScheduledAt && request.agreementScheduledAt > 1000000000000
          ? request.agreementScheduledAt
          : resolveAgreementScheduledTimestamp(request.agreementTimeNote || '');
      setScheduledDatetimeInput(timestampToDatetimeLocalValue(initialTs));
      setReminderMinutesInput(Number(request.agreementReminderMinutes) || 30);
      setCancellationReasonInput(request.cancellationReason || '');
      setCalendarSavedBanner(false);
    }
  }, [request]);

  if (!request) return null;

  const icon = getCraftIcon(request.craft);
  const cleanPhone = request.phone.replace(/\s+/g, '');
  const canShowPhone = Boolean(isRegisteredCraftsman && isRevealed);
  const activeCraftsmanLabel = (
    request.agreedByCraftsmanName ||
    request.revealedByCraftsmanName ||
    craftsmanName ||
    ''
  ).trim();
  const isCustomerAgreed = Boolean(
    request.isAgreed ||
      request.agreedByCraftsmanName ||
      request.status === 'in_progress' ||
      request.status === 'completed'
  );

  const countdownInfo = isCustomerAgreed
    ? getAppointmentCountdownInfo(
        request.agreementScheduledAt || resolveAgreementScheduledTimestamp(request.agreementTimeNote || ''),
        request.agreementReminderMinutes || 30
      )
    : null;

  const googleCalendarUrl = buildGoogleCalendarUrl(request, { canShowPhone });

  const handleCopy = () => {
    if (!canShowPhone) return;
    navigator.clipboard?.writeText(request.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickPresetSelect = (presetLabel: string, offsetMinutes?: number) => {
    setAgreementTimeInput(presetLabel);
    const ts = offsetMinutes
      ? Date.now() + offsetMinutes * 60 * 1000
      : resolveAgreementScheduledTimestamp(presetLabel);
    setScheduledDatetimeInput(timestampToDatetimeLocalValue(ts));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200 ${
          isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'
        }`}
      >
        {/* Top Handle / Close */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-gray-800 bg-[#121624]' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <div>
              <span className={`text-xs font-black ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                طلب {request.craft}
              </span>
              <div className={`text-[11px] font-bold flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                <MapPin className="w-3 h-3 text-red-600" />
                <span>{request.wilaya}</span>
              </div>
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
        <div className="p-5 space-y-4 overflow-y-auto max-h-[78vh]">
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-bold flex items-center gap-1 ${
              isDark ? 'text-gray-300' : 'text-gray-900'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>نشر {formatRelativeTime(request.createdAt)}</span>
            </span>

            {request.priority && (
              <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-black text-black" />
                <span>طلب عاجل مستعجل</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className={`text-base font-black leading-snug ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            {request.title}
          </h2>

          {/* Agreement Banner + Live Countdown + Add to Calendar Buttons */}
          {isCustomerAgreed && (
            <div
              className={`p-3 rounded-2xl border text-[11px] font-black space-y-2.5 ${
                isDark
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                  : 'bg-amber-50 border-amber-400 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span>
                  🤝 تم الإتفاق مع هذا الزبون
                  {activeCraftsmanLabel ? ` — الحرفي: ${activeCraftsmanLabel}` : ''}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500 text-black font-black">
                  متفق معه ✓
                </span>
              </div>

              {(request.agreementTimeNote || request.agreementScheduledAt) && (
                <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] font-bold">
                  <div>
                    ⏰ وقت الإتفاق:{' '}
                    <span className="underline font-black">
                      {request.agreementTimeNote || formatScheduledAppointmentAr(request.agreementScheduledAt)}
                    </span>
                    {request.agreementScheduledAt && (
                      <span className="text-[10px] opacity-85 mr-1">
                        ({formatScheduledAppointmentAr(request.agreementScheduledAt)})
                      </span>
                    )}
                  </div>
                  {countdownInfo && (
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                        countdownInfo.isApproaching
                          ? 'bg-red-600 text-white animate-pulse'
                          : isDark
                          ? 'bg-gray-800 text-amber-300 border border-amber-500/40'
                          : 'bg-white text-amber-900 border border-amber-400'
                      }`}
                    >
                      {countdownInfo.badgeText}
                    </span>
                  )}
                </div>
              )}

              {/* Add to Calendar Action Bar */}
              <div className="pt-1.5 border-t border-amber-500/30 space-y-1.5">
                <div className="text-[10px] font-black flex items-center justify-between">
                  <span>📅 جدولة موعد العمل وإضافته إلى التقويم:</span>
                  <span className="text-[9px] opacity-80">
                    تنبيه تلقائي قبل {request.agreementReminderMinutes || 30} د
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition no-underline"
                  >
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>إضافة لتقويم Google</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      downloadAppointmentIcsFile(request, { canShowPhone });
                      setCalendarSavedBanner(true);
                    }}
                    className={`h-9 px-2.5 rounded-xl border font-black text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isDark
                        ? 'bg-gray-900 border-amber-400/60 text-amber-300 hover:bg-gray-800'
                        : 'bg-white border-amber-500 text-amber-950 hover:bg-amber-100'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>تقويم الهاتف (.ics)</span>
                  </button>
                </div>

                {onTriggerAppointmentReminderNow && (
                  <button
                    type="button"
                    onClick={() => onTriggerAppointmentReminderNow(request)}
                    className={`w-full h-8 px-2.5 rounded-xl border text-[10px] font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isDark
                        ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                        : 'bg-emerald-100 border-emerald-400 text-emerald-950 hover:bg-emerald-200'
                    }`}
                  >
                    <BellRing className="w-3.5 h-3.5 animate-bounce" />
                    <span>🔔 إظهار الإشعار التلقائي للموعد داخل التطبيق الآن</span>
                  </button>
                )}

                {calendarSavedBanner && (
                  <div className="p-2 rounded-xl bg-emerald-600 text-white text-[10px] font-black text-center">
                    ✅ تم تحميل ملف الموعد (.ics) مع منبّه تلقائي! افتحه لإضافته مباشرة إلى تقويم هاتفك.
                  </div>
                )}
              </div>
            </div>
          )}

          {!isCustomerAgreed && request.cancellationReason && (
            <div
              className={`px-3 py-2 rounded-xl border text-[11px] font-black flex items-center justify-between gap-2 ${
                isDark
                  ? 'bg-red-950/60 border-red-500/50 text-red-300'
                  : 'bg-red-50 border-red-300 text-red-950'
              }`}
            >
              <span>
                ⚠️ أُلغي الإتفاق سابقاً
                {activeCraftsmanLabel ? ` (${activeCraftsmanLabel})` : ''} — السبب: {request.cancellationReason}
              </span>
            </div>
          )}

          {/* Full Description */}
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
            isDark ? 'bg-gray-800/60 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-300 text-black font-bold'
          }`}>
            <div className={`font-black text-[11px] ${
              isDark ? 'text-emerald-400' : 'text-emerald-800'
            }`}>
              تفاصيل العمل المطلوب من الزبون:
            </div>
            <p className="whitespace-pre-wrap">{request.desc}</p>
          </div>

          {/* Post-Completion Customer Star Rating & Short Review Card */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2.5 ${
              isDark
                ? 'bg-gradient-to-r from-amber-950/40 via-[#161b2a] to-amber-950/30 border-amber-500/40 text-white'
                : 'bg-gradient-to-r from-amber-50 via-white to-amber-50/70 border-amber-300 text-black'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-black flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-black" />
                </div>
                <div>
                  <div className="text-xs font-black">
                    تقييم الزبون للحرفي بعد إتمام العمل
                  </div>
                  <div className="text-[10px] font-bold opacity-80">
                    يظهر التقييم بالنجوم والتعليق القصير مباشرة في ملف الحرفي
                  </div>
                </div>
              </div>

              {activeCraftsmanLabel && onOpenCraftsmanProfileByName && (
                <button
                  type="button"
                  onClick={() => onOpenCraftsmanProfileByName(activeCraftsmanLabel, request.craft)}
                  className={`px-2 py-1 rounded-xl border text-[10px] font-black flex items-center gap-1 cursor-pointer shrink-0 ${
                    isDark
                      ? 'bg-gray-800 border-amber-400/50 text-amber-300 hover:bg-gray-700'
                      : 'bg-white border-amber-400 text-amber-950 hover:bg-amber-100'
                  }`}
                >
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>ملف الحرفي</span>
                </button>
              )}
            </div>

            {existingRating || (request.customerRatingStars && request.customerRatingComment) ? (
              <div
                className={`p-3 rounded-xl border space-y-1.5 ${
                  isDark ? 'bg-gray-900/80 border-amber-500/40' : 'bg-white border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const st = existingRating?.stars || request.customerRatingStars || 5;
                      return (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < st ? 'fill-amber-400 text-amber-400' : 'text-gray-400 opacity-35'
                          }`}
                        />
                      );
                    })}
                    <span className="text-xs font-black text-amber-500 mr-1">
                      {(existingRating?.stars || request.customerRatingStars || 5).toFixed(1)} ★
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-500">
                    تم حفظ التقييم في ملف {existingRating?.craftsmanName || activeCraftsmanLabel || `حرفي ${request.craft}`} ✓
                  </span>
                </div>
                <p className="text-xs font-bold leading-relaxed">
                  &ldquo;{existingRating?.comment || request.customerRatingComment}&rdquo;
                </p>
                {onCompleteAndRate && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => onCompleteAndRate(request)}
                      className="text-[10px] font-black text-amber-500 hover:underline cursor-pointer"
                    >
                      تعديل التقييم والتعليق ✎
                    </button>
                  </div>
                )}
              </div>
            ) : (
              onCompleteAndRate && (
                <button
                  type="button"
                  onClick={() => onCompleteAndRate(request)}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {request.status === 'completed'
                      ? '⭐ وضع تقييم بالنجوم وتعليق قصير للحرفي الآن'
                      : '✅ إتمام العمل ووضع تقييم بالنجوم للحرفي مباشرة'}
                  </span>
                </button>
              )
            )}
          </div>

          {/* Phone section */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-100/80 border-gray-300'
          }`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className={`text-xs font-black ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                بيانات التواصل مع الزبون:
              </div>
              {activeCraftsmanLabel && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-amber-300'
                      : 'bg-white border-gray-300 text-emerald-900'
                  }`}
                >
                  (25ن) • 👷 {activeCraftsmanLabel}
                </span>
              )}
            </div>

            {canShowPhone ? (
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-xl border ${
                  isDark ? 'bg-emerald-950/60 border-emerald-500/40' : 'bg-white border-emerald-400 shadow-xs'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className={`font-mono font-black text-sm dir-ltr ${
                      isDark ? 'text-emerald-400' : 'text-black font-extrabold'
                    }`}>
                      {request.phone}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`h-7 px-2.5 rounded-lg border text-xs font-black flex items-center gap-1 ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-black border-gray-300'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : 'نسخ'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="h-11 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-xs transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>اتصال هاتفي مباشر</span>
                  </a>

                  <a
                    href={`https://wa.me/213${cleanPhone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 rounded-xl bg-[#25D366] text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-[#20ba59] shadow-xs transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>مراسلة عبر واتساب</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center py-2">
                  <span className={`font-mono font-black text-lg tracking-widest dir-ltr ${
                    isDark ? 'text-gray-400' : 'text-black'
                  }`}>
                    05•• ••• •••
                  </span>
                  <p className={`text-[11px] font-bold mt-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {!isRegisteredCraftsman
                      ? '🔒 الرقم محمي! يجب التسجيل كحرفي أولاً في قسم (حسابي) للحصول على 50 نقطة وكشف أرقام الزبائن.'
                      : '🔒 الرقم محمي! يتطلب كشف رقم الزبون خصم 25 نقطة من رصيدك.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onRevealPhone(request);
                  }}
                  className={`w-full h-12 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-98 cursor-pointer ${
                    !isRegisteredCraftsman
                      ? 'bg-amber-500 hover:bg-amber-600 text-black'
                      : isDark 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                      : 'bg-black hover:bg-gray-900 text-white'
                  }`}
                >
                  <Unlock className="w-4 h-4 text-[#D6FF4D]" />
                  <span>كشف الهاتف (25ن)</span>
                  {activeCraftsmanLabel && (
                    <span className="text-[11px] text-amber-300 font-extrabold">
                      • {activeCraftsmanLabel}
                    </span>
                  )}
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            )}

            {/* Agreement Time, Automatic Reminder & Add to Calendar Section */}
            {onUpdateAgreementDetails ? (
              <div className="pt-3 border-t border-gray-300 dark:border-gray-700 space-y-3">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black">
                    ⏰ تحديد وقت الإتفاق وجدولة التنبيه التلقائي داخل التطبيق:
                  </label>

                  {/* Quick Time Presets */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {[
                      { label: 'بعد 15 دقيقة', mins: 15 },
                      { label: 'بعد 30 دقيقة', mins: 30 },
                      { label: 'بعد ساعة', mins: 60 },
                      { label: 'اليوم على 15:00' },
                      { label: 'غداً صباحاً 09:00' }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleQuickPresetSelect(preset.label, preset.mins)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black border cursor-pointer transition ${
                          agreementTimeInput === preset.label
                            ? 'bg-amber-500 text-black border-amber-500'
                            : isDark
                            ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                            : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Exact Date & Time Picker + Lead Reminder Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] font-bold mb-1 opacity-85">
                        📅 تاريخ وساعة الموعد:
                      </span>
                      <input
                        type="datetime-local"
                        value={scheduledDatetimeInput}
                        onChange={(e) => {
                          setScheduledDatetimeInput(e.target.value);
                          const parsed = Date.parse(e.target.value);
                          if (!Number.isNaN(parsed)) {
                            setAgreementTimeInput(formatScheduledAppointmentAr(parsed));
                          }
                        }}
                        className={`w-full h-9 px-2.5 rounded-xl border text-[11px] font-mono font-bold outline-none ${
                          isDark
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-black'
                        }`}
                      />
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold mb-1 opacity-85">
                        🔔 إشعار تلقائي قبل الموعد بـ:
                      </span>
                      <select
                        value={reminderMinutesInput}
                        onChange={(e) => setReminderMinutesInput(Number(e.target.value) || 30)}
                        className={`w-full h-9 px-2.5 rounded-xl border text-[11px] font-black outline-none ${
                          isDark
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-black'
                        }`}
                      >
                        <option value={5}>قبل 5 دقائق</option>
                        <option value={15}>قبل 15 دقيقة</option>
                        <option value={30}>قبل 30 دقيقة (موصى به)</option>
                        <option value={60}>قبل ساعة كاملة</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={agreementTimeInput}
                      onChange={(e) => setAgreementTimeInput(e.target.value)}
                      placeholder="مثال: اليوم على الساعة 15:00 أو غداً صباحاً..."
                      className={`flex-1 h-9 px-2.5 rounded-xl border text-xs font-bold outline-none ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-black placeholder-gray-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const resolvedTs = resolveAgreementScheduledTimestamp(
                          agreementTimeInput,
                          scheduledDatetimeInput
                        );
                        const finalNote =
                          agreementTimeInput.trim() ||
                          formatScheduledAppointmentAr(resolvedTs) ||
                          'تم الإتفاق';
                        onUpdateAgreementDetails(request, {
                          isAgreed: true,
                          agreementTimeNote: finalNote,
                          agreementScheduledAt: resolvedTs,
                          agreementReminderMinutes: reminderMinutesInput,
                          cancellationReason: ''
                        });
                      }}
                      className="h-9 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black shrink-0 cursor-pointer shadow-xs"
                    >
                      🤝 حفظ وجدولة الموعد
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-red-600 dark:text-red-400">
                    ✕ أو كتابة سبب إلغاء الإتفاق:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={cancellationReasonInput}
                      onChange={(e) => setCancellationReasonInput(e.target.value)}
                      placeholder="مثال: الزبون أجّل الموعد / اختلفنا في السعر..."
                      className={`flex-1 h-9 px-2.5 rounded-xl border text-xs font-bold outline-none ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-black placeholder-gray-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateAgreementDetails(request, {
                          isAgreed: false,
                          agreementTimeNote: '',
                          agreementScheduledAt: 0,
                          cancellationReason: cancellationReasonInput.trim() || 'تم إلغاء الإتفاق'
                        })
                      }
                      className="h-9 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-black shrink-0 cursor-pointer"
                    >
                      إلغاء الإتفاق
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              onToggleAgreeRequest && (
                <button
                  type="button"
                  onClick={() => onToggleAgreeRequest(request)}
                  className={`w-full h-10 rounded-xl border text-[11px] font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isCustomerAgreed
                      ? 'bg-amber-500 text-black border-amber-500 shadow-xs'
                      : isDark
                      ? 'bg-gray-800 border-gray-700 text-amber-300 hover:bg-gray-700'
                      : 'bg-amber-50 border-amber-400 text-amber-950 hover:bg-amber-100'
                  }`}
                >
                  <span>
                    {isCustomerAgreed
                      ? `🤝 تم الإتفاق مع هذا الزبون ✓ (اضغط لإلغاء الإتفاق)`
                      : `🤝 تحديد أنه تم الإتفاق مع الزبون (يظهر للحرفيين بكتابة صغيرة)`}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

