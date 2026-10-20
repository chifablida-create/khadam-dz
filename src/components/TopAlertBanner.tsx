import React from 'react';
import { AlertTriangle, Sparkles, Coins, Zap, ArrowLeft, X, Eye, BellRing } from 'lucide-react';
import { RequestItem } from '../types';
import { getCraftIcon } from '../data/constants';

interface TopAlertBannerProps {
  points: number;
  craftsmanCraft?: string;
  matchingRequest: RequestItem | null;
  onOpenRecharge: () => void;
  onViewMatchingRequest: (req: RequestItem) => void;
  onDismissLowPoints?: () => void;
  onDismissMatching?: () => void;
  isLowPointsDismissed?: boolean;
  isMatchingDismissed?: boolean;
  isDark: boolean;
}

export const TopAlertBanner: React.FC<TopAlertBannerProps> = ({
  points,
  craftsmanCraft,
  matchingRequest,
  onOpenRecharge,
  onViewMatchingRequest,
  onDismissLowPoints,
  onDismissMatching,
  isLowPointsDismissed = false,
  isMatchingDismissed = false,
  isDark
}) => {
  const isLowPoints = points < 25;

  // If matching request is present and not dismissed, prioritize or show matching request
  const showMatching = matchingRequest && !isMatchingDismissed;
  const showLowPoints = isLowPoints && !isLowPointsDismissed;

  if (!showMatching && !showLowPoints) {
    return null;
  }

  return (
    <div className="w-full px-3 py-1.5 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* 1. Matching Craft Alert Banner */}
      {showMatching && matchingRequest && (
        <div
          className={`relative overflow-hidden rounded-2xl border p-2.5 shadow-sm transition-all ${
            isDark
              ? 'bg-gradient-to-r from-emerald-950/90 via-teal-900/60 to-emerald-950/90 border-emerald-500/50 text-white'
              : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-emerald-400 text-black shadow-emerald-500/10'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            {/* Right side: Icon & Text */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center text-lg shadow-sm shrink-0 relative">
                <span>{getCraftIcon(matchingRequest.craft)}</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-lime-400 border-2 border-white dark:border-black animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-lime-400 border-2 border-white dark:border-black"></span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-emerald-600 text-white">
                    🎯 طلب جديد في تخصصك
                  </span>
                  <span className={`text-[11px] font-black truncate ${isDark ? 'text-white' : 'text-emerald-950'}`}>
                    ({matchingRequest.craft})
                  </span>
                  <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200">
                    • {matchingRequest.wilaya}
                  </span>
                </div>
                <p className={`text-xs font-bold truncate mt-0.5 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                  {matchingRequest.title}
                </p>
              </div>
            </div>

            {/* Left side: Action Button & Close */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onViewMatchingRequest(matchingRequest)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black shadow-xs transition active:scale-95 flex items-center gap-1"
                title="معاينة الطلب وكشف رقم الزبون"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة</span>
              </button>
              {onDismissMatching && (
                <button
                  type="button"
                  onClick={onDismissMatching}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition ${
                    isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-black hover:bg-black/10'
                  }`}
                  title="إغلاق التنبيه"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Low Points Alert Banner */}
      {showLowPoints && (
        <div
          className={`relative overflow-hidden rounded-2xl border p-2.5 shadow-sm transition-all ${
            isDark
              ? 'bg-gradient-to-r from-amber-950/90 via-red-950/50 to-amber-950/90 border-amber-500/50 text-white'
              : 'bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-amber-400 text-black shadow-amber-500/10'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            {/* Right side: Alert Icon & Text */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 text-white flex items-center justify-center shadow-sm shrink-0 relative animate-pulse">
                <AlertTriangle className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600 border border-white"></span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-red-600 text-white">
                    ⚠️ تنبيه الرصيد
                  </span>
                  <span className={`text-[11px] font-black ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                    رصيدك الحالي: {points} نقطة
                  </span>
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
                    (أقل من 25ن)
                  </span>
                </div>
                <p className={`text-[11px] font-bold truncate mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  تحتاج 25ن لكشف أرقام الزبائن • اشحن فوراً لمواصلة العمل
                </p>
              </div>
            </div>

            {/* Left side: Recharge Button & Close */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onOpenRecharge}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-black text-[11px] shadow-xs transition active:scale-95 flex items-center gap-1"
                title="شحن النقاط فوراً بالبطاقة الذهبية أو بريدي موب"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>شحن فوراً</span>
              </button>
              {onDismissLowPoints && (
                <button
                  type="button"
                  onClick={onDismissLowPoints}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition ${
                    isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-black hover:bg-black/10'
                  }`}
                  title="إغلاق التنبيه"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
