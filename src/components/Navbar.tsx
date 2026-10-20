import React from 'react';
import { ShieldCheck, Moon, Sun, Coins, UserCheck, Briefcase, Bell, Megaphone } from 'lucide-react';

interface NavbarProps {
  userMode: 'craftsman' | 'customer';
  setUserMode: (mode: 'craftsman' | 'customer') => void;
  points: number;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenAdminLogin: () => void;
  onNavigatePoints: () => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onOpenPromo?: () => void;
  pendingAdminCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  userMode,
  setUserMode,
  points,
  isDark,
  toggleTheme,
  onOpenAdminLogin,
  onNavigatePoints,
  unreadCount = 0,
  onOpenNotifications,
  onOpenPromo,
  pendingAdminCount = 0
}) => {
  const isLowPoints = points < 25;

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
      isDark ? 'bg-[#0f121d]/95 border-gray-800 text-white' : 'bg-white/95 border-gray-300 text-black shadow-xs'
    }`}>
      <div className="max-w-md mx-auto px-2.5 h-15 flex items-center justify-between gap-1">
        {/* Brand Logo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-lime-400 flex items-center justify-center text-white font-black text-base shadow-sm shrink-0">
            DZ
          </div>
          <div>
            <div className="flex items-center gap-1 leading-none">
              <span className={`font-black text-[15px] tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
                خدّام
              </span>
              <span className="text-[10px] font-black px-1 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
                ديزاد
              </span>
            </div>
            <span className={`text-[9px] font-extrabold block mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
              58 ولاية 🇩🇿
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Mode Switcher */}
          <div className={`p-0.5 rounded-xl border flex items-center shrink-0 ${
            isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-100 border-gray-300'
          }`}>
            <button
              type="button"
              onClick={() => setUserMode('craftsman')}
              className={`flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                userMode === 'craftsman'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isDark ? 'text-gray-300 hover:text-white' : 'text-black hover:text-emerald-700'
              }`}
              title="وضع الحرفي: تصفح وكشف أرقام الزبائن"
            >
              <Briefcase className="w-3 h-3" />
              <span>حرفي</span>
            </button>
            <button
              type="button"
              onClick={() => setUserMode('customer')}
              className={`flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                userMode === 'customer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isDark ? 'text-gray-300 hover:text-white' : 'text-black hover:text-emerald-700'
              }`}
              title="وضع الزبون: نشر طلب وتقييم العمل"
            >
              <UserCheck className="w-3 h-3" />
              <span>زبون</span>
            </button>
          </div>

          {/* Points Pill */}
          <button
            type="button"
            onClick={onNavigatePoints}
            className={`relative flex items-center gap-0.5 px-2 py-1.5 rounded-xl border text-xs font-black transition active:scale-95 cursor-pointer shrink-0 ${
              isLowPoints
                ? isDark
                  ? 'bg-red-950/60 border-red-500/70 text-red-300 shadow-xs shadow-red-900/40 animate-pulse'
                  : 'bg-red-50 border-red-400 text-red-700 shadow-xs animate-pulse'
                : isDark 
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-950/60' 
                  : 'bg-amber-100 border-amber-300 text-black hover:bg-amber-200'
            }`}
            title={`رصيد النقاط (${points} نقطة)`}
          >
            <Coins className={`w-3.5 h-3.5 ${isLowPoints ? 'text-red-500 fill-red-500' : 'text-amber-500 fill-amber-500'}`} />
            <span className={isLowPoints ? 'text-red-600 dark:text-red-300 font-extrabold' : isDark ? 'text-white' : 'text-black'}>
              {points}
            </span>
            <span className="text-[9px] font-bold">ن</span>

            {isLowPoints && (
              <span className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px] font-black flex items-center justify-center border border-white dark:border-black">
                !
              </span>
            )}
          </button>

          {/* Notification Bell Button */}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className={`relative w-8 h-8 rounded-xl border flex items-center justify-center text-xs transition cursor-pointer shrink-0 ${
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
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center border border-white dark:border-black shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs transition cursor-pointer shrink-0 ${
              isDark ? 'bg-gray-800 border-gray-700 text-yellow-400' : 'bg-gray-100 border-gray-300 text-black hover:bg-gray-200'
            }`}
            title={isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-black" />}
          </button>

          {/* Prominent Admin Dashboard & Bot Button */}
          <button
            type="button"
            onClick={onOpenAdminLogin}
            className={`relative h-8 px-2.5 rounded-xl border flex items-center gap-1 text-[11px] font-black transition active:scale-95 cursor-pointer shrink-0 shadow-xs ${
              isDark
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white hover:from-emerald-500 hover:to-teal-500'
                : 'bg-gradient-to-r from-gray-900 to-black border-gray-800 text-white hover:bg-gray-800'
            }`}
            title="فتح لوحة إدارة التطبيق وصلاحيات البوت الذكي"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>الإدارة</span>
            {pendingAdminCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow-xs">
                {pendingAdminCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

