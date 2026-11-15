import React from 'react';
import { Bell, X, Sparkles, ExternalLink, AlertTriangle, Zap, Eye, Target, Calendar, Clock } from 'lucide-react';
import { BroadcastNotification, AppNotification } from '../types';
import { getCraftIcon } from '../data/constants';

export type UnifiedNotification = 
  | (BroadcastNotification & { notifType?: 'broadcast' })
  | (AppNotification & { notifType?: 'app' })
  | {
      id: string;
      title: string;
      message: string;
      type?: string;
      recipientCount?: number;
      relatedCraft?: string;
      relatedRequestId?: string;
      scheduledAt?: number;
      calendarUrl?: string;
    };

interface PushNotificationToastProps {
  notification: UnifiedNotification | null;
  onDismiss: () => void;
  onActionClick?: () => void;
  onAddToCalendarClick?: () => void;
  isDark: boolean;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onDismiss,
  onActionClick,
  onAddToCalendarClick,
  isDark
}) => {
  if (!notification) return null;

  const type = (notification as any).type || 'system';
  const isMatch = type === 'matching_request';
  const isLowPoints = type === 'low_points';
  const isAppointment = type === 'appointment_reminder';
  const craft = (notification as any).relatedCraft || (notification as any).targetCraft;
  const recipientCount = (notification as any).recipientCount;
  const calendarUrl = (notification as any).calendarUrl as string | undefined;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] w-[94%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div
        className={`rounded-2xl border p-3.5 shadow-2xl backdrop-blur-md transition-all ${
          isAppointment
            ? isDark
              ? 'bg-[#1f1708]/95 border-amber-400 text-white shadow-amber-950/70 ring-2 ring-amber-400/50'
              : 'bg-amber-50/98 border-amber-500 text-black shadow-amber-500/30 ring-2 ring-amber-400/60'
            : isLowPoints
            ? isDark
              ? 'bg-[#1b1215]/95 border-amber-500/80 text-white shadow-amber-950/60'
              : 'bg-white/95 border-amber-500 text-black shadow-amber-500/20'
            : isMatch
              ? isDark
                ? 'bg-[#0f1f1a]/95 border-emerald-500/80 text-white shadow-emerald-950/60'
                : 'bg-white/95 border-emerald-500 text-black shadow-emerald-500/20'
              : isDark
                ? 'bg-[#151928]/95 border-emerald-500/50 text-white shadow-emerald-950/50'
                : 'bg-white/95 border-emerald-500/50 text-black shadow-emerald-500/20'
        }`}
      >
        {/* App metadata header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-md font-black text-[10px] flex items-center justify-center text-white shadow-xs ${
              isAppointment
                ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-black'
                : isLowPoints
                ? 'bg-gradient-to-tr from-amber-600 to-red-500'
                : isMatch
                  ? 'bg-gradient-to-tr from-emerald-600 to-lime-400'
                  : 'bg-gradient-to-tr from-emerald-600 to-lime-400'
            }`}>
              {isAppointment ? (
                <span>⏰</span>
              ) : isMatch && craft ? (
                <span>{getCraftIcon(craft)}</span>
              ) : isLowPoints ? (
                <span>⚠️</span>
              ) : (
                'DZ'
              )}
            </div>
            <span className={`text-[11px] font-black tracking-wide ${isDark ? 'text-white' : 'text-black'}`}>
              {isAppointment
                ? 'خدّام DZ • تذكير موعد الإتفاق ⏰'
                : isMatch
                ? 'خدّام DZ • طلب مطابق لتخصصك 🎯'
                : isLowPoints
                  ? 'خدّام DZ • تنبيه رصيد النقاط ⚠️'
                  : 'خدّام DZ • إشعار فوري 📢'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full animate-ping ${
              isAppointment ? 'bg-amber-400' : isLowPoints ? 'bg-red-500' : 'bg-emerald-500'
            }`}></span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              الآن
            </span>
            <button
              type="button"
              onClick={onDismiss}
              className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-black hover:bg-gray-100'
              }`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Notification Title & Body */}
        <div className="space-y-1 pr-1 cursor-pointer" onClick={onActionClick}>
          <h4 className={`text-xs font-black leading-tight flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-black'}`}>
            {notification.title}
          </h4>
          <p className={`text-[11px] font-bold leading-relaxed line-clamp-2 ${
            isDark ? 'text-gray-200' : 'text-gray-900'
          }`}>
            {notification.message}
          </p>
        </div>

        {/* Footer info badge */}
        <div className={`mt-2.5 pt-2 border-t flex items-center justify-between gap-1.5 flex-wrap text-[10px] font-bold ${
          isAppointment
            ? isDark ? 'border-amber-800/60 text-amber-300' : 'border-amber-300 text-amber-950'
            : isLowPoints
            ? isDark ? 'border-amber-900/50 text-amber-400' : 'border-amber-200 text-amber-800'
            : isDark ? 'border-gray-800 text-emerald-400' : 'border-gray-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-1">
            {isAppointment ? (
              <>
                <Clock className="w-3 h-3 text-amber-500" />
                <span>موعد عمل متفق عليه مع الزبون</span>
              </>
            ) : isLowPoints ? (
              <>
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>الشحن الفوري بالبطاقة الذهبية أو بريدي موب</span>
              </>
            ) : isMatch ? (
              <>
                <Target className="w-3 h-3 text-emerald-500" />
                <span>كن أول من يكشف الرقم ويتصل بالزبون</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>مرسل لـ {recipientCount || 6} حرفي مسجل</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {isAppointment && (onAddToCalendarClick || calendarUrl) && (
              calendarUrl ? (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (onAddToCalendarClick) onAddToCalendarClick();
                  }}
                  className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black flex items-center gap-1 shadow-xs no-underline"
                >
                  <Calendar className="w-3 h-3" />
                  <span>إضافة إلى التقويم</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onAddToCalendarClick}
                  className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Calendar className="w-3 h-3" />
                  <span>إضافة إلى التقويم</span>
                </button>
              )
            )}
            <button
              type="button"
              onClick={onActionClick || onDismiss}
              className={`font-black hover:underline flex items-center gap-0.5 cursor-pointer ${
                isAppointment
                  ? 'text-amber-600 dark:text-amber-300'
                  : isLowPoints
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isAppointment ? (
                <>
                  <span>فتح الموعد</span>
                  <Eye className="w-3 h-3" />
                </>
              ) : isLowPoints ? (
                <>
                  <span>شحن فوراً</span>
                  <Zap className="w-3 h-3 fill-current" />
                </>
              ) : isMatch ? (
                <>
                  <span>معاينة وكشف</span>
                  <Eye className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span>عرض في التطبيق</span>
                  <ExternalLink className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

