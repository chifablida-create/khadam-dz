import React, { useState } from 'react';
import {
  X,
  Bell,
  Sparkles,
  AlertTriangle,
  Zap,
  CheckCheck,
  Trash2,
  Eye,
  Coins,
  Briefcase,
  ExternalLink,
  PlusCircle,
  Clock
} from 'lucide-react';
import { AppNotification, RequestItem } from '../../types';
import { getCraftIcon, formatRelativeTime } from '../../data/constants';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectNotification: (notif: AppNotification) => void;
  onOpenRecharge: () => void;
  onTriggerSimulatedMatch: () => void;
  userCraft?: string;
  points: number;
  isDark: boolean;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onSelectNotification,
  onOpenRecharge,
  onTriggerSimulatedMatch,
  userCraft = 'سباك',
  points,
  isDark
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'matches' | 'points'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === 'matches') return n.type === 'matching_request';
    if (filterTab === 'points') return n.type === 'low_points';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md max-h-[88vh] rounded-t-3xl sm:rounded-3xl border flex flex-col shadow-2xl overflow-hidden transition-all ${
          isDark ? 'bg-[#0f121d] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-gray-800 bg-[#151928]' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-400 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-black'}`}>
                  مركز الإشعارات والتنبيهات
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <p className={`text-[11px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                تنبيهات فورية لطلبات تخصصك ({userCraft}) وتنبيهات الرصيد
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs transition ${
              isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-black hover:bg-gray-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Tabs & Actions Bar */}
        <div className={`p-2.5 border-b flex items-center justify-between gap-2 shrink-0 ${
          isDark ? 'border-gray-800 bg-[#121624]' : 'border-gray-200 bg-gray-100/70'
        }`}>
          {/* Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                filterTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('matches')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                filterTab === 'matches'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'
              }`}
            >
              <span>تخصصي 🎯</span>
              <span className="text-[10px] opacity-80">
                ({notifications.filter((n) => n.type === 'matching_request').length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('points')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                filterTab === 'points'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-black'
              }`}
            >
              <span>النقاط ⚠️</span>
              <span className="text-[10px] opacity-80">
                ({notifications.filter((n) => n.type === 'low_points').length})
              </span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="px-2 py-1 rounded-lg border border-emerald-500/40 text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition flex items-center gap-1"
                title="تحديد جميع التنبيهات كمقروءة"
              >
                <CheckCheck className="w-3 h-3" />
                <span>قراءة الكل</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className={`p-1.5 rounded-lg border text-xs transition ${
                  isDark ? 'border-gray-700 text-gray-400 hover:text-red-400' : 'border-gray-300 text-gray-700 hover:text-red-600'
                }`}
                title="مسح الكل"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Balance status pill in modal */}
        <div className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
          points < 25 
            ? isDark ? 'bg-amber-950/40 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-900'
            : isDark ? 'bg-[#151928] border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-800'
        }`}>
          <div className="flex items-center gap-1.5 font-bold">
            <Coins className={`w-3.5 h-3.5 ${points < 25 ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span>رصيدك الحالي:</span>
            <span className="font-black text-sm">{points} نقطة</span>
            {points < 25 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-600 text-white">
                منخفض (&lt;25)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRecharge();
            }}
            className="text-[11px] font-black text-amber-500 hover:underline flex items-center gap-0.5"
          >
            <span>شحن فوري بالبطاقة</span>
            <Zap className="w-3 h-3" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-transparent">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-2xl">
                🔕
              </div>
              <div>
                <p className={`text-xs font-black ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  لا توجد تنبيهات في هذا القسم
                </p>
                <p className={`text-[11px] font-bold mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  ستصلك تنبيهات تلقائية عند وصول أي طلب جديد في تخصصك ({userCraft}) أو عند انخفاض الرصيد
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isMatch = notif.type === 'matching_request';
              const isLow = notif.type === 'low_points';

              return (
                <div
                  key={notif.id}
                  onClick={() => onSelectNotification(notif)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                    !notif.read
                      ? isDark
                        ? isMatch
                          ? 'bg-emerald-950/30 border-emerald-500/50 shadow-sm'
                          : 'bg-amber-950/30 border-amber-500/50 shadow-sm'
                        : isMatch
                          ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                          : 'bg-amber-50/80 border-amber-300 shadow-sm'
                      : isDark
                        ? 'bg-gray-800/40 border-gray-800 opacity-80 hover:opacity-100'
                        : 'bg-gray-50 border-gray-200 opacity-90 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 shadow-xs ${
                        isMatch
                          ? 'bg-gradient-to-tr from-emerald-600 to-green-500 text-white'
                          : isLow
                            ? 'bg-gradient-to-tr from-amber-500 to-red-500 text-white'
                            : 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white'
                      }`}
                    >
                      {isMatch ? (
                        <span>{getCraftIcon(notif.relatedCraft || userCraft)}</span>
                      ) : isLow ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-black'}`}>
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-ping"></span>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className={`text-[11px] font-bold leading-relaxed line-clamp-2 ${
                        isDark ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {notif.message}
                      </p>

                      {/* Action buttons inside card */}
                      <div className="mt-2.5 flex items-center justify-between gap-2 pt-1.5 border-t border-black/5 dark:border-white/5">
                        <span className={`text-[10px] font-bold ${
                          isMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {isMatch ? `تطابق تام مع ملفك: ${notif.relatedCraft || userCraft}` : 'كشف أرقام الزبائن = 25ن'}
                        </span>

                        {isMatch ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectNotification(notif);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black shadow-xs flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>معاينة وكشف الرقم</span>
                          </button>
                        ) : isLow ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                              onOpenRecharge();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-[11px] shadow-xs flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3 fill-black" />
                            <span>شحن فوري</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with instant test simulation button */}
        <div className={`p-3 border-t flex items-center justify-between gap-2 shrink-0 ${
          isDark ? 'border-gray-800 bg-[#121624]' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 dark:text-gray-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>تجربة المنظومة:</span>
          </div>

          <button
            type="button"
            onClick={onTriggerSimulatedMatch}
            className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black transition active:scale-95 flex items-center gap-1.5"
            title="إرسال طلب تجريبي فوري يطابق تخصصك لفحص التنبيه"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>محاكاة وصول طلب ({userCraft})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
