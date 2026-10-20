import React, { useState } from 'react';
import { User, MessageCircle, Star, Phone, MapPin, Award, CheckCircle2, Sparkles, LogOut, Edit3, ShieldCheck, Bell, Zap, Target, AlertTriangle, Megaphone, Download, Bot } from 'lucide-react';
import { CraftsmanUser } from '../types';
import { CRAFTS_LIST, WILAYAS_DZ, getCraftIcon, INITIAL_CRAFTSMEN } from '../data/constants';

interface AccountViewProps {
  currentUser: CraftsmanUser | null;
  onRegisterCraftsman: (user: CraftsmanUser) => void;
  onLogout: () => void;
  points: number;
  revealedCount: number;
  onOpenAdminChat: () => void;
  onOpenAdminDashboard?: () => void;
  userMode: 'craftsman' | 'customer';
  setUserMode: (mode: 'craftsman' | 'customer') => void;
  onOpenPlayStore?: () => void;
  onOpenNotifications?: () => void;
  onOpenPromoModal?: () => void;
  onTriggerSimulatedMatch?: () => void;
  isDark: boolean;
}

export const AccountView: React.FC<AccountViewProps> = ({
  currentUser,
  onRegisterCraftsman,
  onLogout,
  points,
  revealedCount,
  onOpenAdminChat,
  onOpenAdminDashboard,
  userMode,
  setUserMode,
  onOpenPlayStore,
  onOpenNotifications,
  onOpenPromoModal,
  onTriggerSimulatedMatch,
  isDark
}) => {
  const [name, setName] = useState('');
  const [craft, setCraft] = useState('سباك');
  const [wilaya, setWilaya] = useState('16 الجزائر');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('3 سنوات');
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setFormError('يرجى كتابة الاسم ورقم الهاتف على الأقل');
      return;
    }
    setFormError(null);

    const newUser: CraftsmanUser = {
      id: currentUser ? currentUser.id : `cp_${Date.now()}`,
      name: name.trim(),
      craft,
      wilaya,
      phone: phone.trim(),
      experience,
      bio: bio.trim() || 'حرفي معتمد في منصة خدّام ديزاد',
      baseAvg: currentUser?.baseAvg || 5.0,
      baseCount: currentUser?.baseCount || 1,
      complaints: currentUser?.complaints || 0
    };

    onRegisterCraftsman(newUser);
    setIsEditing(false);
  };

  const startEdit = () => {
    if (currentUser) {
      setName(currentUser.name);
      setCraft(currentUser.craft);
      setWilaya(currentUser.wilaya || '16 الجزائر');
      setPhone(currentUser.phone);
      setExperience(currentUser.experience || '3 سنوات');
      setBio(currentUser.bio || '');
      setIsEditing(true);
    }
  };

  return (
    <div className={`p-3.5 space-y-4 pb-12 ${isDark ? 'text-white' : 'text-black'}`}>
      {/* Executive Admin & Smart Bot Control Banner (Always Accessible) */}
      {onOpenAdminDashboard && (
        <div className="rounded-3xl bg-gradient-to-r from-gray-950 via-emerald-950 to-gray-900 p-4 text-white shadow-lg border border-emerald-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-black flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-xs sm:text-sm leading-snug text-white flex items-center gap-1.5">
                <span>لوحة إدارة التطبيق وصلاحيات البوت</span>
                <span className="text-[9px] bg-emerald-500 text-black px-1.5 py-0.5 rounded-full font-black">
                  Super Admin 🤖
                </span>
              </div>
              <div className="text-[10px] text-emerald-200 mt-0.5 font-bold">
                التحكم في النقاط، اعتماد الوصولات، إدارة الحرفيين، وأوامر البوت الذكي
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAdminDashboard}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black text-xs transition active:scale-95 shrink-0 shadow-md cursor-pointer flex items-center gap-1"
          >
            <Bot className="w-4 h-4" />
            <span>فتح الإدارة</span>
          </button>
        </div>
      )}

      {formError && (
        <div className="p-3 rounded-xl bg-red-600 text-white text-xs font-black">
          {formError}
        </div>
      )}

      {/* If not registered yet or in editing mode */}
      {!currentUser || isEditing ? (
        <div className={`rounded-3xl border p-5 shadow-sm space-y-4 ${
          isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
        }`}>
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-400 text-white flex items-center justify-center text-2xl font-black shadow-xs">
              🛠️
            </div>
            <div>
              <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-black'}`}>
                {isEditing ? 'تعديل بيانات الحساب' : 'تسجيل حساب الحرفي'}
              </h2>
              <p className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                {isEditing ? 'تحديث معلومات ملفك المهني' : 'املأ بياناتك لتظهر للمنصة وتحصل على 50 نقطة هدية مجانية'}
              </p>
            </div>
          </div>

          {/* Welcome Bonus Notice */}
          {!currentUser && (
            <div className={`rounded-2xl border p-3 flex items-center gap-2.5 ${
              isDark 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-white' 
                : 'bg-emerald-50 border-emerald-300 text-black'
            }`}>
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs font-bold leading-relaxed">
                <strong className="font-black text-emerald-700 dark:text-emerald-300">هدية التسجيل:</strong> رصيد مجاني 50 نقطة فور إنشاء الحساب، يتيح لك كشف أول رقمي زبائن مجاناً!
              </div>
            </div>
          )}

          {!currentUser && (
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 text-xs font-bold">
              <span>أو تفعيل حساب الحرفي التجريبي مباشرة:</span>
              <button
                type="button"
                onClick={() => onRegisterCraftsman(INITIAL_CRAFTSMEN[0])}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shadow-xs transition active:scale-95 flex items-center gap-1"
              >
                <span>دخول كـ (أحمد - سباك)</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                الاسم الكامل أو اسم الورشة *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: يوسف السباك، ورشة النرجس للنجارة..."
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold outline-none transition ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500'
                    : 'bg-white border-gray-300 text-black focus:border-emerald-600 shadow-xs'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                  الحرفة / المهنة *
                </label>
                <select
                  value={craft}
                  onChange={(e) => setCraft(e.target.value)}
                  className={`w-full h-11 px-3 rounded-xl border text-xs font-black appearance-none outline-none ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500'
                      : 'bg-white border-gray-300 text-black focus:border-emerald-600 shadow-xs'
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
                  className={`w-full h-11 px-3 rounded-xl border text-xs font-black appearance-none outline-none ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500'
                      : 'bg-white border-gray-300 text-black focus:border-emerald-600 shadow-xs'
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

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                  رقم الهاتف للتواصل *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0550 12 34 56"
                  className={`w-full h-11 px-3.5 rounded-xl border text-xs font-mono font-black outline-none dir-ltr transition ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500'
                      : 'bg-white border-gray-300 text-black focus:border-emerald-600 shadow-xs'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                  سنوات الخبرة
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className={`w-full h-11 px-3 rounded-xl border text-xs font-black appearance-none outline-none ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500'
                      : 'bg-white border-gray-300 text-black focus:border-emerald-600 shadow-xs'
                  }`}
                >
                  <option value="سنة واحدة" className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>سنة واحدة</option>
                  <option value="3 سنوات" className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>3 سنوات</option>
                  <option value="5 سنوات" className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>5 سنوات</option>
                  <option value="10 سنوات فأكثر" className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>10 سنوات فأكثر</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                نبذة عن خدماتك وخبرتك
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="أذكر تخصصك، المعدات التي تمتلكها، أوقات العمل..."
                className={`w-full p-3 rounded-xl border text-xs font-bold outline-none transition ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500'
                    : 'bg-white border-gray-300 text-black focus:border-emerald-600 shadow-xs'
                }`}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-xs shadow-md hover:from-emerald-700 hover:to-green-700 transition"
              >
                {isEditing ? 'حفظ التعديلات' : 'تسجيل الحساب والحصول على 50ن'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={`px-4 h-11 rounded-xl border text-xs font-black ${
                    isDark ? 'border-gray-700 text-white' : 'border-gray-300 text-black'
                  }`}
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        /* Registered Craftsman Profile View */
        <div className="space-y-4">
          {/* Main Profile Card */}
          <div className={`relative overflow-hidden rounded-3xl border p-5 shadow-xs ${
            isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-lime-400 text-white flex items-center justify-center text-3xl font-black shadow-md shrink-0">
                  {getCraftIcon(currentUser.craft)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-black'}`}>
                      {currentUser.name}
                    </h2>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                      <ShieldCheck className="w-3 h-3 text-white" />
                      <span>موثق DZ</span>
                    </span>
                  </div>

                  <div className={`text-xs font-black mt-0.5 flex items-center gap-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    <span>{currentUser.craft}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-red-600" />
                      {currentUser.wilaya}
                    </span>
                  </div>

                  <div className={`font-mono text-xs mt-1 dir-ltr flex items-center gap-1 font-black ${
                    isDark ? 'text-emerald-400' : 'text-black font-extrabold'
                  }`}>
                    <Phone className="w-3 h-3" />
                    <span>{currentUser.phone}</span>
                  </div>
                </div>
              </div>

              {/* Edit button */}
              <button
                type="button"
                onClick={startEdit}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-black hover:bg-gray-200'
                }`}
                title="تعديل الحساب"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* Bio */}
            {currentUser.bio && (
              <p className={`mt-3 text-xs font-bold p-3 rounded-2xl border leading-relaxed ${
                isDark 
                  ? 'bg-gray-800/60 border-gray-700 text-gray-100' 
                  : 'bg-gray-50 border-gray-200 text-black'
              }`}>
                {currentUser.bio}
              </p>
            )}

            {/* Quick Stats Grid */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className={`p-2.5 rounded-2xl border ${
                isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-300'
              }`}>
                <div className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>الرصيد</div>
                <div className="text-sm font-black text-amber-500 mt-0.5">{points} ن</div>
              </div>
              <div className={`p-2.5 rounded-2xl border ${
                isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-300'
              }`}>
                <div className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>طلبات كشفتها</div>
                <div className={`text-sm font-black mt-0.5 ${isDark ? 'text-emerald-400' : 'text-black'}`}>{revealedCount}</div>
              </div>
              <div className={`p-2.5 rounded-2xl border ${
                isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-300'
              }`}>
                <div className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>التقييم</div>
                <div className={`text-sm font-black mt-0.5 flex items-center justify-center gap-0.5 ${isDark ? 'text-white' : 'text-black'}`}>
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{currentUser.baseAvg}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Alerts & Specialty Matching Feature Card */}
          <div className={`rounded-3xl border p-4 shadow-sm transition-all ${
            isDark
              ? 'bg-gradient-to-r from-emerald-950/40 via-[#131b26] to-[#111624] border-emerald-500/30 text-white'
              : 'bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 border-emerald-300 text-black shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-400 text-white flex items-center justify-center text-sm shadow-xs">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>
                    منظومة التنبيهات الفورية الذكية
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      مفعّلة ونشطة على مدار الساعة
                    </span>
                  </div>
                </div>
              </div>

              {onOpenNotifications && (
                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[11px] font-black shadow-xs hover:bg-emerald-700 transition"
                >
                  مركز الإشعارات
                </button>
              )}
            </div>

            <div className={`p-2.5 rounded-2xl border text-[11px] font-bold space-y-1.5 mb-3 ${
              isDark ? 'bg-black/30 border-white/5 text-gray-200' : 'bg-white/80 border-black/5 text-gray-900'
            }`}>
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  <strong>تطابق التخصص:</strong> تنبيه فوري في الشريط العلوي عند نشر أي طلب جديد في <span className="text-emerald-600 dark:text-emerald-400 font-black">({currentUser.craft})</span>.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  <strong>تنبيه الرصيد:</strong> إشعار فوري عند انخفاض رصيدك عن 25 نقطة لتتمكن من الشحن مباشرة.
                </span>
              </div>
            </div>

            {onTriggerSimulatedMatch && (
              <button
                type="button"
                onClick={onTriggerSimulatedMatch}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-black transition flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>تجربة وصول طلب جديد يطابق تخصص ({currentUser.craft})</span>
              </button>
            )}
          </div>

          {/* Direct 1-on-1 Admin Chat Action Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-black p-4 text-white shadow-md border border-gray-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="font-black text-sm leading-snug text-white">
                  مراسلة إدارة خدام ديزاد
                </div>
                <div className="text-[11px] text-gray-200 mt-0.5 font-bold">
                  شات مباشر خاص بالحرفي لمتابعة الطلبات، الشحن والدعم
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAdminChat}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition active:scale-95 shrink-0 shadow-xs"
            >
              فتح الشات
            </button>
          </div>

          {/* App Advertising & Link Share Card */}
          {onOpenPromoModal && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              isDark
                ? 'bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-gray-900 border-emerald-500/40 text-white'
                : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-emerald-300 text-black shadow-xs'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-500 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                  <Megaphone className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-black text-xs ${isDark ? 'text-white' : 'text-black'}`}>
                      إشهارات التطبيق والرابط الرسمي
                    </span>
                    <span className="text-[9px] font-black bg-emerald-500 text-black px-1.5 py-0.5 rounded-full">
                      شارك
                    </span>
                  </div>
                  <div className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    انسخ رابط التطبيق وبوستات الإعلانات الجاهزة للنشر
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenPromoModal}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition active:scale-95 shrink-0 shadow-xs cursor-pointer"
              >
                فتح المركز
              </button>
            </div>
          )}

          {/* Google Play Store Card */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark ? 'bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-gray-900 border-emerald-500/30 text-white' : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-black shadow-xs'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a2.03 2.03 0 0 1-.61-1.465V3.279c0-.573.228-1.096.61-1.465zm11.602 11.603l2.678 2.679-11.83 6.83 9.152-9.51zm2.678-2.834L5.059 3.073l12.83 7.51zm1.246 1.417l2.87 1.677c.806.471.806 1.238 0 1.709l-2.87 1.677-2.316-2.531 2.316-2.532z" />
                </svg>
              </div>
              <div>
                <div className={`font-black text-xs ${isDark ? 'text-white' : 'text-black'}`}>
                  تطبيق متجر Google Play للأندرويد
                </div>
                <div className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                  تثبيت فوري على شاشة الهاتف أو تنزيل ملف AAB للرفع
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <a
                href="/download/aab"
                download="khadam-dz-release.aab"
                className="px-3 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-black text-xs transition active:scale-95 flex items-center gap-1.5 border border-gray-700 cursor-pointer shadow-xs"
                title="تحميل ملف Android App Bundle"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>تحميل AAB</span>
              </a>

              {onOpenPlayStore && (
                <button
                  type="button"
                  onClick={onOpenPlayStore}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition active:scale-95 shadow-xs cursor-pointer"
                >
                  فتح المتجر
                </button>
              )}
            </div>
          </div>

          {/* Quick Platform Note */}
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
            isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-black'
          }`}>
            <div className={`font-black flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-black'}`}>
              <span>قوانين العمل في خدّام DZ:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] font-bold">
              <li>الحرفي يتواصل مع الزبون هاتفياً أو عبر واتساب مباشرة فور كشف الرقم.</li>
              <li>الالتزام بالمواعيد والأسعار المتفق عليها لتفادي الشكاوى.</li>
              <li>كل كشف يكلف 25 نقطة بدون أي رسوم لاحقة على إنجاز العمل.</li>
            </ul>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-[11px]">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>الخصوصية والشروط:</span>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                سياسة الخصوصية وحماية البيانات (Privacy Policy) ↗
              </a>
            </div>
          </div>

          {/* Switch Mode / Logout */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setUserMode(userMode === 'craftsman' ? 'customer' : 'craftsman')}
              className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              التبديل إلى {userMode === 'craftsman' ? 'وضع الزبون' : 'وضع الحرفي'}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="text-xs font-black text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
