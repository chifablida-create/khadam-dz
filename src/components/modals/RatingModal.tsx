import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { RequestItem, RatingItem } from '../../types';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RequestItem | null;
  onSubmitRating: (rating: RatingItem) => void;
  isDark: boolean;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  request,
  onSubmitRating,
  isDark
}) => {
  const [stars, setStars] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [craftsmanName, setCraftsmanName] = useState<string>('الحرفي المنفذ');

  if (!isOpen || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('يرجى كتابة تعليق تقييمي بسيط عن جودة العمل.');
      return;
    }

    const newRating: RatingItem = {
      id: `rt_${Date.now()}`,
      requestId: request.id,
      craft: request.craft,
      stars,
      comment: comment.trim(),
      createdAt: Date.now(),
      customerPhone: request.phone,
      craftsmanName: craftsmanName.trim() || `حرفي ${request.craft}`
    };

    onSubmitRating(newRating);
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
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center">
              <Star className="w-4 h-4 fill-black" />
            </div>
            <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>
              تقييم الحرفي بعد انتهاء العمل
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
          تقييمك يساعد الحرفيين المجتهدين في الحصول على فرص أكثر، ويحمي باقي الزبائن.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Star selector */}
          <div className={`flex flex-col items-center justify-center py-2.5 rounded-2xl border ${
            isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStars(s)}
                  className="p-1 transition transform active:scale-125"
                >
                  <Star
                    className={`w-7 h-7 ${
                      s <= stars ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-black text-amber-500">
              {stars === 5 ? 'ممتاز واحترافي 🌟' : stars === 4 ? 'جيد جداً 👍' : stars === 3 ? 'مقبول' : 'سيء'}
            </span>
          </div>

          <div>
            <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
              اسم الحرفي (اختياري)
            </label>
            <input
              type="text"
              value={craftsmanName}
              onChange={(e) => setCraftsmanName(e.target.value)}
              placeholder="مثال: يوسف، أحمد..."
              className={`w-full h-10 px-3 rounded-xl border text-xs font-bold outline-none ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
              رأيك وملاحظاتك عن العمل *
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="هل التزم بالموعد؟ هل كان العمل متقناً؟ هل السعر كان مناسباً؟"
              className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-xs shadow-md hover:from-emerald-700 hover:to-green-700 transition"
          >
            إرسال التقييم ✓
          </button>
        </form>
      </div>
    </div>
  );
};
