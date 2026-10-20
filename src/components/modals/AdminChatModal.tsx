import React, { useState, useRef, useEffect } from 'react';
import { X, Send, ShieldCheck, FileCheck2, UploadCloud, Bot, Sparkles } from 'lucide-react';
import { ChatMessage, CraftsmanUser } from '../../types';

interface AdminChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CraftsmanUser | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onOpenUploadReceipt?: () => void;
  onOpenAdminDashboard?: () => void;
  isDark: boolean;
}

export const AdminChatModal: React.FC<AdminChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  messages,
  onSendMessage,
  onOpenUploadReceipt,
  onOpenAdminDashboard,
  isDark
}) => {
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  const quickBotCommands = [
    '🤖 فحص حالة وصلي المعلق وتفعيل النقاط',
    '💰 كم رصيدي الحالي وكم يكفي لكشف زبون؟',
    '⚡ أريد شحن رصيدي عبر بريدي موب أو شارجيلي',
    '📞 الزبون لم يرد على الاتصال، أطلب تعويض النقاط'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`w-full max-w-md h-[92vh] sm:h-[650px] rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 ${
          isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'
        }`}
      >
        {/* Header */}
        <div className={`p-3.5 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-gray-800 bg-[#121624] text-white' : 'border-gray-200 bg-gray-50 text-black'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className={`font-black text-xs flex items-center gap-1.5 leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
                <span>إدارة خدّام DZ + البوت الذكي 🤖</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className={`text-[10px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                ردود فورية بالبوت الآلي 24/7 • تفعيل النقاط والدعم
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenAdminDashboard && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminDashboard();
                }}
                className="text-[10px] font-black px-2 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-black flex items-center gap-1 shadow-xs transition cursor-pointer"
                title="فتح لوحة تحكم الإدارة"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>لوحة الإدارة</span>
              </button>
            )}

            {onOpenUploadReceipt && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUploadReceipt();
                }}
                className="text-[10px] font-black px-2 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-xs transition cursor-pointer"
                title="إرسال وصل شحن للإدارة"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>إرسال وصل</span>
              </button>
            )}

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
        </div>

        {/* Informational Notice */}
        <div className={`px-3.5 py-2 border-b text-[11px] font-bold flex items-center justify-between shrink-0 ${
          isDark ? 'bg-emerald-950/60 border-emerald-500/30 text-white' : 'bg-emerald-50 border-emerald-300 text-black'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>البوت الذكي مفوّض من الإدارة للرد الفوري وفحص الوصولات وتعويض النقاط على مدار الساعة.</span>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isAdminOrBot = msg.sender === 'admin' || msg.sender === 'bot';
            const isBot = msg.sender === 'bot' || msg.text.startsWith('🤖');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAdminOrBot ? 'items-start' : 'items-end'}`}
              >
                <div className={`flex items-center gap-1 text-[10px] font-bold mb-1 px-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-800'
                }`}>
                  <span>
                    {isBot
                      ? '🤖 بوت الإدارة الذكي'
                      : isAdminOrBot
                      ? '🛡️ إدارة خدام DZ'
                      : currentUser?.name || 'أنت (الحرفي)'}
                  </span>
                  <span>•</span>
                  <span>{new Date(msg.ts).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs font-bold leading-relaxed whitespace-pre-line ${
                    isBot
                      ? isDark
                        ? 'bg-gradient-to-br from-emerald-950/90 to-teal-950/80 text-white rounded-tr-xs border border-emerald-500/40 shadow-xs'
                        : 'bg-gradient-to-br from-emerald-50 to-teal-50 text-black rounded-tr-xs border border-emerald-300 shadow-xs'
                      : isAdminOrBot
                      ? isDark
                        ? 'bg-gray-800 text-white rounded-tr-xs border border-gray-700'
                        : 'bg-gray-100 text-black rounded-tr-xs border border-gray-300 shadow-xs'
                      : 'bg-[#D6FF4D] text-black font-extrabold rounded-tl-xs shadow-xs border border-lime-400'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Bot Command Pills */}
        <div className={`px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 border-t shrink-0 ${
          isDark ? 'border-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          {onOpenUploadReceipt && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUploadReceipt();
              }}
              className="shrink-0 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white flex items-center gap-1 hover:bg-emerald-500 shadow-xs cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>إرسال وصل للإدارة 📄</span>
            </button>
          )}

          {quickBotCommands.map((cmd, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSendMessage(cmd)}
              className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                isDark 
                  ? 'border-gray-700 text-white hover:bg-gray-800' 
                  : 'border-gray-300 text-black bg-white hover:bg-gray-100'
              }`}
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className={`p-3 border-t flex items-center gap-2 shrink-0 ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          {onOpenUploadReceipt && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUploadReceipt();
              }}
              title="إرفاق وإرسال وصل شحن للإدارة"
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition shrink-0 cursor-pointer ${
                isDark
                  ? 'border-gray-700 hover:bg-gray-800 text-emerald-400'
                  : 'border-gray-300 hover:bg-gray-100 text-emerald-700'
              }`}
            >
              <UploadCloud className="w-5 h-5" />
            </button>
          )}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب رسالتك للإدارة أو البوت الذكي..."
            className={`flex-1 h-10 px-3.5 rounded-xl border text-xs font-bold outline-none transition ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500'
                : 'bg-white border-gray-300 text-black focus:border-emerald-600 shadow-xs'
            }`}
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4 rtl:rotate-180 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
