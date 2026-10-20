import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface BotSyncBannerProps {
  message: string | null;
  onDismiss: () => void;
  isDark: boolean;
}

export const BotSyncBanner: React.FC<BotSyncBannerProps> = ({
  message,
  onDismiss,
  isDark
}) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
      <div
        className={`rounded-2xl border px-3.5 py-2.5 shadow-xl flex items-center justify-between gap-3 ${
          isDark
            ? 'bg-gray-900 border-emerald-500/50 text-white'
            : 'bg-white border-emerald-500 text-black shadow-emerald-500/20'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-black'}`}>
              {message}
            </div>
            <div className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
              تخزين محلي فوري وآمن (LocalStorage)
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 ${
            isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-black hover:bg-gray-100'
          }`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
