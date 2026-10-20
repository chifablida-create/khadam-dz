import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { RequestItem, ComplaintItem } from '../../types';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RequestItem | null;
  onSubmitComplaint: (complaint: ComplaintItem) => void;
  isDark: boolean;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  request,
  onSubmitComplaint,
  isDark
}) => {
  const [craftsmanName, setCraftsmanName] = useState<string>('');
  const [complaintText, setComplaintText] = useState<string>('');

  if (!isOpen || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      alert('يرجى تفصيل سبب الشكوى.');
      return;
    }

    const complaint: ComplaintItem = {
      id: `co_${Date.now()}`,
      craftsmanCraft: request.craft,
      craftsmanName: craftsmanName.trim() || `حرفي ${request.craft}`,
      text: complaintText.trim(),
      count: 1,
      createdAt: Date.now()
    };

    onSubmitComplaint(complaint);
    alert('تم تسجيل الشكوى بنجاح، وستقوم إدارة خدّام DZ بمراجعتها والاتصال بالحرفي.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-bold flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-black text-sm text-red-600 dark:text-red-400">
              تقديم شكوى لإدارة المنصة
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-7 h-7 rounded-full border flex items-center justify-center ${
              isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-black hover:bg-gray-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className={`text-xs font-bold leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
          إدارة خدام ديزاد تحرص على حماية الزبائن ومحاسبة أي تهاون أو سوء معاملة.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>الحرفة</label>
            <input
              type="text"
              readOnly
              value={request.craft}
              className={`w-full h-10 px-3 rounded-xl border text-xs font-black opacity-90 ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-black'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>اسم الحرفي المعني</label>
            <input
              type="text"
              value={craftsmanName}
              onChange={(e) => setCraftsmanName(e.target.value)}
              placeholder="مثال: الحرفي الذي اتصل بي بخصوص الطلب"
              className={`w-full h-10 px-3 rounded-xl border text-xs font-bold outline-none ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>تفاصيل الشكوى بدقة *</label>
            <textarea
              required
              rows={3}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="تأخر عن الموعد؟ لم يحضر إطلاقاً؟ طلب سعراً غير متفق عليه؟"
              className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition"
          >
            إرسال الشكوى للإدارة
          </button>
        </form>
      </div>
    </div>
  );
};
