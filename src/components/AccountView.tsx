import React, { useState } from 'react';
import {
  MessageCircle,
  Star,
  Phone,
  MapPin,
  Sparkles,
  LogOut,
  Edit3,
  ShieldCheck,
  Bell,
  Zap,
  Target,
  AlertTriangle,
  Megaphone,
  Download
} from 'lucide-react';
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
  onOpenUploadReceipt?: (pkg?: { amount: number; pts: number }) => void;
  onOpenChargilyCheckout?: (pkg?: { amount: number; pts: number }) => void;
  officialRip?: string;
  officialHolder?: string;
  officialCcp?: string;
  officialCle?: string;
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
  userMode,
  setUserMode,
  onOpenPlayStore,
  onOpenNotifications,
  onOpenPromoModal,
  onTriggerSimulatedMatch,
  isDark
}) => {
  const SINGLE_CRAFTSMAN_STORAGE_KEY = 'kdz_bound_single_craftsman_v1';

  const normalizeDzPhone = (raw: string): string => {
    return (raw || '')
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/\D/g, '')
      .replace(/^(213|00213)/, '0')
      .trim();
  };

  const getBoundSingleCraftsman = (): CraftsmanUser | null => {
    try {
      const raw = localStorage.getItem(SINGLE_CRAFTSMAN_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.phone && parsed.id && parsed.id !== 'cp1') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    if (currentUser && currentUser.id !== 'cp1' && currentUser.name !== 'أحمد - سباك محترف') {
      return currentUser;
    }
    return null;
  };

  const boundSingleAccount = getBoundSingleCraftsman();

  const [name, setName] = useState(() => boundSingleAccount?.name || '');
  const [craft, setCraft] = useState(() => boundSingleAccount?.craft || 'سباك');
  const [wilaya, setWilaya] = useState(() => boundSingleAccount?.wilaya || '16 الجزائر');
  const [phone, setPhone] = useState(() => boundSingleAccount?.phone || '');
  const [experience, setExperience] = useState(() => boundSingleAccount?.experience || '3 سنوات');
  const [bio, setBio] = useState(() => boundSingleAccount?.bio || '');
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePhone = (boundSingleAccount ? boundSingleAccount.phone : phone).trim();
    if (!name.trim() || !effectivePhone) {
      setFormError('يرجى كتابة الاسم ورقم الهاتف على الأقل');
      return;
    }

    const cleanDigits = normalizeDzPhone(effectivePhone);
    if (cleanDigits.length < 9) {
      setFormError('يرجى إدخال رقم هاتف جزائري صحيح (10 أرقام)');
      return;
    }

    const existingBound = getBoundSingleCraftsman();
    if (existingBound) {
      const boundDigits = normalizeDzPhone(existingBound.phone);
      if (boundDigits.length >= 8 && cleanDigits !== boundDigits) {
        setFormError(
          `⚠️ لا يمكن التسجيل بأكثر من حساب واحد! لديك حساب مسجل بالفعل برقم الهاتف (${existingBound.phone}). يُسمح لكل حرفي بحساب واحد فقط.`
        );
        setPhone(existingBound.phone);
        return;
      }
    }

    setFormError(null);

    const uniqueId =
      existingBound && existingBound.id && existingBound.id !== 'cp1'
        ? existingBound.id
        : `cr_${cleanDigits}`;

    const newUser: CraftsmanUser = {
      id: uniqueId,
      name: name.trim(),
      craft,
      wilaya,
      phone: existingBound?.phone || effectivePhone,
      experience,
      bio: bio.trim() || 'حرفي معتمد في منصة خدّام ديزاد',
      baseAvg: currentUser?.baseAvg || existingBound?.baseAvg || 5.0,
      baseCount: currentUser?.baseCount || existingBound?.baseCount || 1,
      complaints: currentUser?.complaints || existingBound?.complaints || 0
    };

    try {
      localStorage.setItem(SINGLE_CRAFTSMAN_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // ignore
    }

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
      {formError && (
        <div className="p-3 rounded-xl bg-red-600 text-white text-xs font-black">
          {formError}
        </div>
      )}

      {/* If not registered yet or in editing mode */}
      {!currentUser || isEditing ? (
        <div
          className={`rounded-3xl border p-5 shadow-sm space-y-4 ${
            isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-400 text-white flex items-center justify-center text-2xl font-black shadow-xs">
              🛠️
            </div>
            <div>
              <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-black'}`}>
                {isEditing ? 'تعديل بيانات حسابك الوحيد' : boundSingleAccount ? 'الدخول إلى حسابك الوحيد المسجل' : 'تسجيل حساب الحرفي (حساب واحد فقط)'}
              </h2>
              <p className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                {isEditing
                  ? 'تحديث معلومات ملفك المهني'
                  : 'املأ بياناتك لتظهر للمنصة وتحصل على 50 نقطة هدية مجانية'}
              </p>
            </div>
          </div>

          {/* Welcome Bonus Notice */}
          {!currentUser && (
            <div
              className={`rounded-2xl border p-3 flex items-center gap-2.5 ${
                isDark
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-white'
                  : 'bg-emerald-50 border-emerald-300 text-black'
              }`}
            >
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs font-bold leading-relaxed">
                <strong className="font-black text-emerald-700 dark:text-emerald-300">حساب واحد لكل حرفي (هدية 50 نقطة لمرة واحدة):</strong> يُسمح لكل حرفي بالتسجيل بحساب واحد فقط مرتبط برقم هاتفه، ولا يمكن إنشاء حسابات متعددة.
              </div>
            </div>
          )}

          {null}

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
                  readOnly={Boolean(boundSingleAccount)}
                  value={boundSingleAccount ? boundSingleAccount.phone : phone}
                  onChange={(e) => { if (!boundSingleAccount) setPhone(e.target.value); }}
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
                  <option value="سنة واحدة" className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
                    سنة واحدة
                  </option>
                  <option value="3 سنوات" className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
                    3 سنوات
                  </option>
                  <option value="5 سنوات" className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
                    5 سنوات
                  </option>
                  <option value="10 سنوات فأكثر" className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
                    10 سنوات فأكثر
                  </option>
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
        /* Registered Craftsman Profile View (No Admin Button) */
        <div className="space-y-4">
          {/* Main Profile Card */}
          <div
            className={`relative overflow-hidden rounded-3xl border p-5 shadow-xs ${
              isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'
            }`}
          >
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

                  <div
                    className={`text-xs font-black mt-0.5 flex items-center gap-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}
                  >
                    <span>{currentUser.craft}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-red-600" />
                      {currentUser.wilaya}
                    </span>
                  </div>

                  <div
                    className={`font-mono text-xs mt-1 dir-ltr flex items-center gap-1 font-black ${
                      isDark ? 'text-emerald-400' : 'text-black font-extrabold'
                    }`}
                  >
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
              <p
                className={`mt-3 text-xs font-bold p-3 rounded-2xl border leading-relaxed ${
                  isDark
                    ? 'bg-gray-800/60 border-gray-700 text-gray-100'
                    : 'bg-gray-50 border-gray-200 text-black'
                }`}
              >
                {currentUser.bio}
              </p>
            )}

            {/* Quick Stats Grid */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div
                className={`p-2.5 rounded-2xl border ${
                  isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>الرصيد</div>
                <div className="text-sm font-black text-amber-500 mt-0.5">{points} ن</div>
              </div>
              <div
                className={`p-2.5 rounded-2xl border ${
                  isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>طلبات كشفتها</div>
                <div className={`text-sm font-black mt-0.5 ${isDark ? 'text-emerald-400' : 'text-black'}`}>
                  {revealedCount}
                </div>
              </div>
              <div
                className={`p-2.5 rounded-2xl border ${
                  isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>التقييم</div>
                <div
                  className={`text-sm font-black mt-0.5 flex items-center justify-center gap-0.5 ${
                    isDark ? 'text-white' : 'text-black'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{currentUser.baseAvg}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Alerts & Specialty Matching Feature Card */}
          <div
            className={`rounded-3xl border p-4 shadow-sm transition-all ${
              isDark
                ? 'bg-gradient-to-r from-emerald-950/40 via-[#131b26] to-[#111624] border-emerald-500/30 text-white'
                : 'bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 border-emerald-300 text-black shadow-xs'
            }`}
          >
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

            <div
              className={`p-2.5 rounded-2xl border text-[11px] font-bold space-y-1.5 mb-3 ${
                isDark ? 'bg-black/30 border-white/5 text-gray-200' : 'bg-white/80 border-black/5 text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  <strong>تطابق التخصص:</strong> تنبيه فوري في الشريط العلوي عند نشر أي طلب جديد في{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">({currentUser.craft})</span>.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  <strong>تنبيه الرصيد:</strong> إشعار فوري عند انخفاض رصيدك عن 25 نقطة لتتمكن من الشحن مباشرة.
                </span>
              </div>
            </div>

            {null}
          </div>

          {/* Direct Support Chat Action Banner (Renamed from Admin Chat) */}
          <div className="rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-black p-4 text-white shadow-md border border-gray-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="font-black text-sm leading-snug text-white">
                  الدعم الفني ومراسلة المنصة
                </div>
                <div className="text-[11px] text-gray-200 mt-0.5 font-bold">
                  محادثة مباشرة خاصة بالحرفي لمتابعة الطلبات، الشحن والدعم الفني
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAdminChat}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition active:scale-95 shrink-0 shadow-xs"
            >
              فتح المحادثة
            </button>
          </div>

          {/* Quick Platform Note */}
          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
              isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-black'
            }`}
          >
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
