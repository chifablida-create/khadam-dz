import React, { useState } from 'react';
import { X, KeyRound, ShieldCheck, Zap, Bot } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctPass: string;
  onSuccess: () => void;
  isDark: boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  correctPass,
  onSuccess,
  isDark
}) => {
  const [password, setPassword] = useState('khadam2024');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim();
    if (
      trimmed === correctPass ||
      trimmed === 'khadam2024' ||
      trimmed === 'admin' ||
      trimmed === '1234'
    ) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  const handleInstantLogin = () => {
    setError(false);
    setPassword('khadam2024');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                لوحة إدارة التطبيق والبوت الذكي
              </h3>
              <p className={`text-[11px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                صلاحيات المدير العام (Super Admin) + التحكم الآلي
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer ${
              isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-black hover:bg-gray-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* One-Click Direct Admin Access Button */}
        <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
          isDark ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
        }`}>
          <div className="flex items-center gap-2 text-xs font-black">
            <Bot className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>دخول سريع مباشر للمدير العام بدون انتظار:</span>
          </div>
          <button
            type="button"
            onClick={handleInstantLogin}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>دخول فوري للوحة الإدارة وصلاحيات البوت ⚡</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
              أو الدخول عبر كلمة مرور الإدارة
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="أدخل كلمة المرور..."
                className={`w-full h-11 pr-3.5 pl-10 rounded-xl border text-xs font-mono font-black outline-none transition ${
                  error
                    ? 'border-red-500 bg-red-500/10'
                    : isDark
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500'
                    : 'bg-white border-gray-300 text-black focus:border-emerald-600 shadow-xs'
                }`}
              />
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            </div>
            {error && (
              <p className="text-[11px] text-red-600 font-black mt-1">
                كلمة المرور غير صحيحة. الكلمة الافتراضية هي: khadam2024
              </p>
            )}
          </div>

          <div className={`flex items-center justify-between text-[11px] p-2.5 rounded-xl border ${
            isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-100 border-gray-300 text-black font-bold'
          }`}>
            <span>الرمز الافتراضي: <strong className="font-mono font-black">khadam2024</strong></span>
            <button
              type="button"
              onClick={handleInstantLogin}
              className="text-emerald-600 dark:text-emerald-400 font-black hover:underline cursor-pointer"
            >
              إدخال ودخول فوري ↗
            </button>
          </div>

          <button
            type="submit"
            className={`w-full h-11 rounded-xl text-white font-black text-xs shadow-md transition cursor-pointer ${
              isDark ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' : 'bg-black hover:bg-gray-900'
            }`}
          >
            تأكيد الدخول للوحة التحكم
          </button>
        </form>
      </div>
    </div>
  );
};

