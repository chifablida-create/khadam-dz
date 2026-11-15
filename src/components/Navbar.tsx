import React, { useRef } from 'react';
import { Lock, Moon, Sun, Coins, UserCheck, Briefcase, Bell, Megaphone } from 'lucide-react';

interface NavbarProps {
  userMode: 'craftsman' | 'customer';
  setUserMode: (mode: 'craftsman' | 'customer') => void;
  points: number;
  isRegisteredCraftsman?: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenAdminLogin: () => void;
  onNavigatePoints: () => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onOpenPromo?: () => void;
  onOpenFacebookBot?: () => void;
  pendingAdminCount?: number;
  onOpenGithubVercel?: () => void;
  onOpenPlayStore?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userMode,
  setUserMode,
  points,
  isRegisteredCraftsman = false,
  isDark,
  toggleTheme,
  onOpenAdminLogin,
  onNavigatePoints,
  unreadCount = 0,
  onOpenNotifications,
  onOpenFacebookBot,
  pendingAdminCount = 0
}) => {
  const displayPoints = isRegisteredCraftsman ? points : 0;
  const isLowPoints = isRegisteredCraftsman && displayPoints < 25;
  const tapCountRef = useRef<number>(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastOpenTsRef = useRef<number>(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__KDZ_OPEN_ADMIN_LOGIN__ = () => {
        const now = Date.now();
        if (now - lastOpenTsRef.current < 600) return;
        lastOpenTsRef.current = now;
        onOpenAdminLogin();
      };
    }
  }, [onOpenAdminLogin]);

  const handleLogoTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      const now = Date.now();
      if (now - lastOpenTsRef.current >= 600) {
        lastOpenTsRef.current = now;
        onOpenAdminLogin();
      }
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 3500);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full max-w-full overflow-hidden border-b backdrop-blur-md transition-colors ${
        isDark ? 'bg-[#0f121d]/95 border-gray-800 text-white' : 'bg-white/95 border-gray-300 text-black shadow-xs'
      }`}
    >
      <div className="max-w-md mx-auto w-full px-2 h-14 flex items-center justify-between gap-1">
        {/* Brand Logo (Tap 5 times to open password-protected Admin Login) */}
        <div
          onClick={handleLogoTap}
          className="flex items-center gap-1.5 min-w-0 select-none cursor-pointer"
        >
          <img
            src="/icon-512x512.png"
            alt="خدّام ديزاد"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-xl border border-amber-400/70 shadow-sm shrink-0 object-contain bg-[#042f24]"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1 leading-none">
              <span className={`font-black text-sm tracking-tight truncate ${isDark ? 'text-white' : 'text-black'}`}>
                خدّام
              </span>
              <span className="text-[9px] font-black px-1 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs shrink-0">
                ديزاد
              </span>
            </div>
            <span
              className={`text-[8px] font-extrabold flex items-center gap-0.5 mt-0.5 truncate ${
                isDark ? 'text-gray-300' : 'text-gray-800'
              }`}
            >
              <span>58 ولاية 🇩🇿</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Mode Switcher */}
          <div
            className={`p-0.5 rounded-xl border flex items-center shrink-0 ${
              isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-100 border-gray-300'
            }`}
          >
            <button
              type="button"
              onClick={() => setUserMode('craftsman')}
              className={`flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                userMode === 'craftsman'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-black hover:text-emerald-700'
              }`}
              title="وضع الحرفي: تصفح وكشف أرقام الزبائن"
            >
              <Briefcase className="w-2.5 h-2.5" />
              <span>حرفي</span>
            </button>
            <button
              type="button"
              onClick={() => setUserMode('customer')}
              className={`flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                userMode === 'customer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-black hover:text-emerald-700'
              }`}
              title="وضع الزبون: نشر طلب وتقييم العمل"
            >
              <UserCheck className="w-2.5 h-2.5" />
              <span>زبون</span>
            </button>
          </div>

          {/* Points Pill / Register Prompt */}
          <button
            type="button"
            onClick={onNavigatePoints}
            className={`relative flex items-center gap-0.5 px-1.5 py-1 rounded-xl border text-[11px] font-black transition active:scale-95 cursor-pointer shrink-0 ${
              !isRegisteredCraftsman
                ? isDark
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200'
                : isLowPoints
                ? isDark
                  ? 'bg-red-950/60 border-red-500/70 text-red-300 shadow-xs shadow-red-900/40 animate-pulse'
                  : 'bg-red-50 border-red-400 text-red-700 shadow-xs animate-pulse'
                : isDark
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-950/60'
                : 'bg-amber-100 border-amber-300 text-black hover:bg-amber-200'
            }`}
            title={
              isRegisteredCraftsman
                ? `رصيد النقاط (${displayPoints} نقطة)`
                : 'غير مسجل (0 نقطة) — اضغط للتسجيل كحرفي والحصول على 50 نقطة'
            }
          >
            <Coins
              className={`w-3 h-3 ${
                !isRegisteredCraftsman
                  ? 'text-gray-400'
                  : isLowPoints
                  ? 'text-red-500 fill-red-500'
                  : 'text-amber-500 fill-amber-500'
              }`}
            />
            <span
              className={
                isLowPoints
                  ? 'text-red-600 dark:text-red-300 font-extrabold'
                  : isDark
                  ? 'text-white'
                  : 'text-black'
              }
            >
              {displayPoints}
            </span>
            <span className="text-[8px] font-bold">ن</span>

            {isLowPoints && (
              <span className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-red-600 text-white text-[8px] font-black flex items-center justify-center border border-white dark:border-black">
                !
              </span>
            )}
          </button>

          {/* Notification Bell Button */}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className={`relative w-7 h-7 rounded-xl border flex items-center justify-center text-xs transition cursor-pointer shrink-0 ${
                unreadCount > 0
                  ? isDark
                    ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-400'
                    : 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : isDark
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
                  : 'bg-gray-100 border-gray-300 text-black hover:bg-gray-200'
              }`}
              title={`التنبيهات والإشعارات (${unreadCount} غير مقروء)`}
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px] font-black flex items-center justify-center border border-white dark:border-black shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs transition cursor-pointer shrink-0 ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-yellow-400'
                : 'bg-gray-100 border-gray-300 text-black hover:bg-gray-200'
            }`}
            title={isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-black" />}
          </button>
        </div>
      </div>
    </header>
  );
};

