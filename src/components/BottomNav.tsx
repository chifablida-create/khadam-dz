import React from 'react';
import { Home, ClipboardList, Coins, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'orders' | 'points' | 'account';
  setCurrentTab: (tab: 'home' | 'orders' | 'points' | 'account') => void;
  isDark: boolean;
  ordersBadgeCount?: number;
  points: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  isDark,
  ordersBadgeCount = 0,
  points
}) => {
  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'orders', label: 'الطلبات', icon: ClipboardList, badge: ordersBadgeCount },
    { id: 'points', label: 'النقاط', icon: Coins, pillText: `${points}ن` },
    { id: 'account', label: 'حسابي', icon: User }
  ] as const;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md transition-colors ${
      isDark ? 'bg-[#0f121d]/95 border-gray-800 text-white' : 'bg-white/95 border-gray-300 shadow-xl text-black'
    }`}>
      <div className="max-w-md mx-auto h-16 px-3 flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentTab(tab.id)}
              className={`relative flex-1 py-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-black scale-105'
                  : isDark
                  ? 'text-gray-300 hover:text-white font-bold'
                  : 'text-black hover:text-emerald-700 font-bold'
              }`}
            >
              <div className="relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-transparent'
                }`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>

                {/* Badge for orders */}
                {'badge' in tab && tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                ) : null}

                {/* Badge for points pill */}
                {'pillText' in tab && (
                  <span className={`absolute -bottom-1 -right-2 text-[9px] font-black px-1 rounded-full border ${
                    isDark 
                      ? 'bg-amber-950/90 border-amber-500 text-white' 
                      : 'bg-amber-100 border-amber-400 text-black'
                  }`}>
                    {tab.pillText}
                  </span>
                )}
              </div>

              <span className={`text-[11px] leading-none ${
                isActive
                  ? 'font-black'
                  : isDark
                  ? 'text-white'
                  : 'text-black font-extrabold'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
