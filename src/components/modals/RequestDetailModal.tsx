import React from 'react';
import { X, MapPin, Clock, Flame, Phone, MessageSquare, Unlock, Check, Sparkles } from 'lucide-react';
import { RequestItem } from '../../types';
import { getCraftIcon, formatRelativeTime } from '../../data/constants';

interface RequestDetailModalProps {
  request: RequestItem | null;
  onClose: () => void;
  isRevealed: boolean;
  onRevealPhone: (request: RequestItem) => void;
  isDark: boolean;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  onClose,
  isRevealed,
  onRevealPhone,
  isDark
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!request) return null;

  const icon = getCraftIcon(request.craft);
  const cleanPhone = request.phone.replace(/\s+/g, '');

  const handleCopy = () => {
    navigator.clipboard?.writeText(request.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
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

          {/* Phone section */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-100/80 border-gray-300'
          }`}>
            <div className={`text-xs font-black ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
              بيانات التواصل مع الزبون:
            </div>

            {isRevealed ? (
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
                    الرقم محمي للحرفيين المشتركين. اكشف الرقم لبدء الاتفاق فوراً بدون أي وسيط.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onRevealPhone(request);
                  }}
                  className={`w-full h-12 rounded-xl text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-98 ${
                    isDark 
                      ? 'bg-emerald-600 hover:bg-emerald-500' 
                      : 'bg-black hover:bg-gray-900'
                  }`}
                >
                  <Unlock className="w-4 h-4 text-[#D6FF4D]" />
                  <span>كشف رقم الهاتف الآن (25 نقطة)</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
