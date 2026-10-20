import React, { useState, useMemo } from 'react';
import { Plus, Search, MapPin, Clock, Phone, MessageSquare, Flame, Check, Unlock, Sparkles, Filter } from 'lucide-react';
import { RequestItem } from '../types';
import { CRAFTS_LIST, WILAYAS_DZ, getCraftIcon, formatRelativeTime } from '../data/constants';
import { AppPromoBanner } from './AppPromoBanner';

interface HomeFeedProps {
  requests: RequestItem[];
  revealedSet: Set<string>;
  onRevealPhone: (request: RequestItem) => void;
  onSelectRequest: (request: RequestItem) => void;
  onOpenCreateModal: () => void;
  onOpenPromoModal?: () => void;
  onOpenPlayStore?: () => void;
  userMode: 'craftsman' | 'customer';
  isDark: boolean;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  requests,
  revealedSet,
  onRevealPhone,
  onSelectRequest,
  onOpenCreateModal,
  onOpenPromoModal,
  onOpenPlayStore,
  userMode,
  isDark
}) => {
  const [selectedCraft, setSelectedCraft] = useState<string>('الكل');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyPriority, setOnlyPriority] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Popular crafts to display first in quick pills
  const quickCrafts = ['الكل', 'سباك', 'كهربائي', 'نجار', 'دهان', 'بناء', 'حداد', 'زجاج', 'تبريد', 'خياط', 'ميكانيكي', 'إصلاح هواتف', 'نقل أثاث'];

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Craft filter
      if (selectedCraft !== 'الكل' && req.craft !== selectedCraft) {
        return false;
      }
      // Wilaya filter
      if (selectedWilaya !== 'الكل' && !req.wilaya.includes(selectedWilaya.replace(/^\d+\s*/, ''))) {
        return false;
      }
      // Priority filter
      if (onlyPriority && !req.priority) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = req.title.toLowerCase().includes(q);
        const matchesDesc = req.desc.toLowerCase().includes(q);
        const matchesCraft = req.craft.toLowerCase().includes(q);
        const matchesWilaya = req.wilaya.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCraft && !matchesWilaya) {
          return false;
        }
      }
      return true;
    });
  }, [requests, selectedCraft, selectedWilaya, onlyPriority, searchQuery]);

  const handleCopyPhone = (id: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`space-y-3.5 pb-6 ${isDark ? 'text-white' : 'text-black'}`}>
      {/* Big Customer Request Button */}
      <div className="px-3 pt-2">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 p-4 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-between text-right"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-2xl font-black group-hover:scale-110 transition-transform">
              <Plus className="w-7 h-7 stroke-[2.8]" />
            </div>
            <div>
              <div className="font-extrabold text-base leading-tight flex items-center gap-1.5 text-white">
                <span>أضف طلبك الآن</span>
                <span className="text-[11px] bg-white text-emerald-800 px-2 py-0.5 rounded-full font-black">
                  مجانـاً
                </span>
              </div>
              <div className="text-xs text-white mt-0.5 font-bold">
                سباك، كهربائي، دهان... حرفيو 58 ولاية بانتظارك
              </div>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-lime-300 animate-pulse hidden sm:block" />
        </button>
      </div>

      {/* Official Application Advertising & Promotion Banner */}
      {onOpenPromoModal && (
        <AppPromoBanner
          onOpenPromoModal={onOpenPromoModal}
          onOpenPlayStore={onOpenPlayStore}
          isDark={isDark}
        />
      )}

      {/* Craft Horizontal Filter Scroll */}
      <div className="px-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {quickCrafts.map((craft) => {
            const isSelected = selectedCraft === craft;
            const icon = craft === 'الكل' ? '🌟' : getCraftIcon(craft);

            return (
              <button
                key={craft}
                type="button"
                onClick={() => setSelectedCraft(craft)}
                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : isDark
                    ? 'bg-gray-800/90 border-gray-700 text-white hover:bg-gray-700'
                    : 'bg-white border-gray-300 text-black hover:bg-gray-100 shadow-xs'
                }`}
              >
                <span>{icon}</span>
                <span className={isSelected ? 'text-white' : isDark ? 'text-white' : 'text-black'}>{craft}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="px-3 space-y-2">
        <div className="flex gap-2">
          {/* Wilaya Filter */}
          <div className="relative flex-1">
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className={`w-full h-10 px-3 pr-8 rounded-xl border text-xs font-black appearance-none outline-none transition ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500'
                  : 'bg-white border-gray-300 text-black focus:border-emerald-600 shadow-xs'
              }`}
            >
              <option value="الكل" className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
                🇩🇿 كل الولايات (58)
              </option>
              {WILAYAS_DZ.map((w) => (
                <option key={w} value={w} className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
                  {w}
                </option>
              ))}
            </select>
            <MapPin className={`w-4 h-4 absolute left-2.5 top-3 pointer-events-none ${isDark ? 'text-gray-300' : 'text-black'}`} />
          </div>

          {/* All Crafts dropdown */}
          <div className="relative flex-1">
            <select
              value={selectedCraft}
              onChange={(e) => setSelectedCraft(e.target.value)}
              className={`w-full h-10 px-3 pr-8 rounded-xl border text-xs font-black appearance-none outline-none transition ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500'
                  : 'bg-white border-gray-300 text-black focus:border-emerald-600 shadow-xs'
              }`}
            >
              <option value="الكل" className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
                كل المهن والحرف ({CRAFTS_LIST.length})
              </option>
              {CRAFTS_LIST.map((c) => (
                <option key={c} value={c} className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
                  {getCraftIcon(c)} {c}
                </option>
              ))}
            </select>
            <Filter className={`w-3.5 h-3.5 absolute left-2.5 top-3 pointer-events-none ${isDark ? 'text-gray-300' : 'text-black'}`} />
          </div>
        </div>

        {/* Search Bar + Priority Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن طلب، حي، عطل..."
              className={`w-full h-10 pr-9 pl-3 rounded-xl border text-xs font-bold outline-none transition ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-emerald-500'
                  : 'bg-white border-gray-300 text-black placeholder-gray-600 focus:border-emerald-600 shadow-xs'
              }`}
            />
            <Search className={`w-4 h-4 absolute right-3 top-3 pointer-events-none ${isDark ? 'text-gray-300' : 'text-black'}`} />
          </div>

          {/* Priority Toggle */}
          <button
            type="button"
            onClick={() => setOnlyPriority(!onlyPriority)}
            className={`h-10 px-3 rounded-xl border flex items-center gap-1 text-xs font-black transition ${
              onlyPriority
                ? 'bg-amber-500 text-black border-amber-500 shadow-xs'
                : isDark
                ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                : 'bg-white border-gray-300 text-black hover:bg-gray-100 shadow-xs'
            }`}
            title="إظهار الطلبات العاجلة فقط"
          >
            <Flame className={`w-3.5 h-3.5 ${onlyPriority ? 'fill-black text-black' : 'text-amber-500'}`} />
            <span>عاجل</span>
          </button>
        </div>
      </div>

      {/* Feed Status Header */}
      <div className={`px-3 flex items-center justify-between text-xs font-black ${
        isDark ? 'text-white' : 'text-black'
      }`}>
        <span>الطلبات المتاحة ({filteredRequests.length})</span>
        {userMode === 'craftsman' && (
          <span className="text-[11px] font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
            كشف الرقم = 25 نقطة
          </span>
        )}
      </div>

      {/* Requests Feed Cards */}
      <div className="px-3 space-y-2.5">
        {filteredRequests.length === 0 ? (
          <div className={`p-8 rounded-2xl border text-center space-y-2 ${
            isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
          }`}>
            <div className="text-3xl">🔍</div>
            <div className="font-black text-sm">لا توجد طلبات مطابقة للبحث</div>
            <div className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
              جرب تغيير الحرفة أو الولاية لرؤية المزيد من العروض
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCraft('الكل');
                setSelectedWilaya('الكل');
                setSearchQuery('');
                setOnlyPriority(false);
              }}
              className="mt-2 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline inline-block"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isRevealed = revealedSet.has(req.id);
            const icon = getCraftIcon(req.craft);
            const cleanPhone = req.phone.replace(/\s+/g, '');

            return (
              <div
                key={req.id}
                onClick={() => onSelectRequest(req)}
                className={`relative rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
                  isDark
                    ? 'bg-[#151928] border-gray-800 hover:border-gray-700 text-white'
                    : 'bg-white border-gray-300 hover:border-gray-400 text-black'
                } ${req.priority ? 'ring-2 ring-amber-500/50' : ''}`}
              >
                {/* Top Row: Tags & Time */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Craft Badge */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                      <span>{icon}</span>
                      <span>{req.craft}</span>
                    </span>

                    {/* Wilaya Badge */}
                    <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-gray-100 border-gray-300 text-black'
                    }`}>
                      <MapPin className="w-3 h-3 text-red-600" />
                      <span>{req.wilaya}</span>
                    </span>

                    {/* Priority Badge */}
                    {req.priority && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-black shadow-xs">
                        <Flame className="w-3 h-3 fill-black text-black" />
                        <span>عاجل</span>
                      </span>
                    )}
                  </div>

                  {/* Relative Timestamp */}
                  <span className={`text-[10px] font-black flex items-center gap-1 shrink-0 ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(req.createdAt)}
                  </span>
                </div>

                {/* Title - Pitch Black in bright mode, Pure White in dark mode */}
                <h3 className={`font-black text-[15px] leading-snug mb-1.5 ${
                  isDark ? 'text-white' : 'text-black'
                }`}>
                  {req.title}
                </h3>

                {/* Description Snippet */}
                <p className={`text-xs font-bold line-clamp-2 mb-3 leading-relaxed ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {req.desc}
                </p>

                {/* Bottom Row: Phone Number & Action */}
                <div
                  className={`pt-2.5 border-t flex items-center justify-between gap-2 ${
                    isDark ? 'border-gray-800' : 'border-gray-200'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isRevealed ? (
                    /* Revealed State */
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className={`font-mono font-black text-xs dir-ltr ${
                          isDark ? 'text-emerald-400' : 'text-black font-extrabold'
                        }`}>
                          {req.phone}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Call Button */}
                        <a
                          href={`tel:${cleanPhone}`}
                          className="h-8 px-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1 hover:bg-emerald-700 transition shadow-xs"
                          title="اتصال هاتفي مباشر"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>اتصال</span>
                        </a>

                        {/* WhatsApp Button */}
                        <a
                          href={`https://wa.me/213${cleanPhone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 px-2.5 rounded-xl bg-[#25D366] text-white font-black text-xs flex items-center gap-1 hover:bg-[#20ba59] transition shadow-xs"
                          title="محادثة واتساب"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>واتساب</span>
                        </a>

                        {/* Copy Button */}
                        <button
                          type="button"
                          onClick={(e) => handleCopyPhone(req.id, req.phone, e)}
                          className={`h-8 w-8 rounded-xl border flex items-center justify-center text-xs font-bold transition ${
                            copiedId === req.id
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : isDark
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-gray-100 border-gray-300 text-black hover:bg-gray-200'
                          }`}
                          title="نسخ الرقم"
                        >
                          {copiedId === req.id ? <Check className="w-3.5 h-3.5 text-white" /> : "📋"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Hidden State: 05XX XX XX •• & Reveal Button */
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <div className={`text-xs font-mono font-black flex items-center gap-1.5 ${
                        isDark ? 'text-gray-400' : 'text-gray-800'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-gray-500' : 'bg-black'}`}></span>
                        <span className="dir-ltr font-black">05•• ••• •••</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRevealPhone(req)}
                        className={`h-8 px-3 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95 transition ${
                          isDark
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                            : 'bg-black text-white hover:bg-gray-900'
                        }`}
                      >
                        <Unlock className="w-3.5 h-3.5 text-[#D6FF4D]" />
                        <span>كشف الهاتف</span>
                        <span className="text-[10px] text-[#D6FF4D] font-mono">
                          (25ن)
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
