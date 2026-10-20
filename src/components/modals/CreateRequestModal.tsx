import React, { useState } from 'react';
import { X, PlusCircle, Flame, Check } from 'lucide-react';
import { RequestItem } from '../../types';
import { CRAFTS_LIST, WILAYAS_DZ, getCraftIcon } from '../../data/constants';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRequest: (req: RequestItem) => void;
  isDark: boolean;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  onCreateRequest,
  isDark
}) => {
  const [craft, setCraft] = useState<string>('سباك');
  const [wilaya, setWilaya] = useState<string>('16 الجزائر');
  const [title, setTitle] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [priority, setPriority] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !phone.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة ورقم الهاتف.');
      return;
    }

    const newReq: RequestItem = {
      id: `r_${Date.now()}`,
      craft,
      wilaya,
      title: title.trim(),
      desc: desc.trim(),
      phone: phone.trim(),
      createdAt: Date.now(),
      priority,
      status: 'open',
      isCustomerOwn: true
    };

    onCreateRequest(newReq);
    setTitle('');
    setDesc('');
    setPhone('');
    setPriority(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200 ${
          isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-gray-800 bg-[#121624]' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-black text-sm leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
                إضافة طلب جديد (Ajoute Demande)
              </h3>
              <p className={`text-[11px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                مجاناً وبدون أي وسيط، حرفيو منطقتك سيتصلون بك
              </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Craft & Wilaya */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                الحرفة المطلوبة *
              </label>
              <select
                value={craft}
                onChange={(e) => setCraft(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-xs font-black appearance-none outline-none ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
                }`}
              >
                {CRAFTS_LIST.map((c) => (
                  <option key={c} value={c} className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
                    {getCraftIcon(c)} {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                الولاية *
              </label>
              <select
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-xs font-black appearance-none outline-none ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
                }`}
              >
                {WILAYAS_DZ.map((w) => (
                  <option key={w} value={w} className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
              عنوان الطلب باختصار *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تصليح تسريب ماء في المطبخ، صيانة مكيف كوندور..."
              className={`w-full h-10 px-3.5 rounded-xl border text-xs font-bold outline-none ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
              }`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
              شرح المشكل أو العمل المطلوب *
            </label>
            <textarea
              required
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="صف المشكل بالتفصيل، العنوان بالتحديد (الحي/البلدية)، والوقت المناسب لك..."
              className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
              }`}
            />
          </div>

          {/* Phone */}
          <div>
            <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
              رقم الهاتف للتواصل *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0550 12 34 56 أو 0661..."
              className={`w-full h-10 px-3.5 rounded-xl border text-xs font-mono font-black outline-none dir-ltr ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
              }`}
            />
            <span className={`text-[10px] font-bold mt-1 block ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
              سيظهر رقمك فقط للحرفيين المعتمدين الراغبين في أداء الخدمة.
            </span>
          </div>

          {/* Priority Checkbox */}
          <div
            onClick={() => setPriority(!priority)}
            className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
              priority
                ? 'bg-amber-500 text-black border-amber-500 font-black'
                : isDark
                ? 'bg-gray-800/80 border-gray-700 text-white'
                : 'bg-gray-50 border-gray-300 text-black'
            }`}
          >
            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${priority ? 'fill-black text-black' : 'text-amber-500'}`} />
              <div>
                <div className="font-black text-xs">طلب عاجل ومستعجل 🔥</div>
                <div className={`text-[10px] font-bold ${priority ? 'text-black' : isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                  تمييز الطلب بلون برتقالي لجذب الحرفيين في أسرع وقت
                </div>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
              priority ? 'bg-black border-black text-white' : 'border-gray-500'
            }`}>
              {priority && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-xs shadow-md hover:from-emerald-700 hover:to-green-700 transition"
            >
              نشر الطلب الآن مجاناً ✓
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
