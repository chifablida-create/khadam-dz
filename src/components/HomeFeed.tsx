import React, { useMemo, useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Phone,
  MessageSquare,
  Check,
  Plus,
  Star,
  Calendar,
  Download,
  BellRing,
  Volume2,
  VolumeX,
  ShieldCheck,
  Users,
  ClipboardList,
  Award,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Hand,
  SlidersHorizontal,
  User,
  PhoneOff,
  FileText,
  X
} from 'lucide-react';
import { RequestItem, CraftsmanUser, RatingItem } from '../types';
import {
  CRAFTS_LIST,
  WILAYAS_DZ,
  getCraftIcon,
  formatRelativeTime,
  formatExactPostedTime
} from '../data/constants';
import {
  resolveAgreementScheduledTimestamp,
  formatScheduledAppointmentAr,
  getAppointmentCountdownInfo,
  buildGoogleCalendarUrl,
  downloadAppointmentIcsFile
} from '../utils/appointmentScheduler';
import {
  isNotificationSoundEnabled,
  setNotificationSoundEnabled,
  isBackgroundNotificationEnabled,
  setBackgroundNotificationEnabled,
  getBrowserNotificationPermission,
  requestLocalNotificationPermission
} from '../utils/craftsmanNotifications';
import { isCraftsmanAdInCustomerFeed } from '../supabase.js';

function getLocalCraftsmanReviews(
  craftsman: CraftsmanUser,
  ratings: RatingItem[],
  requests: RequestItem[]
): { stars: number }[] {
  const normName = String(craftsman.name || '').trim();
  const seenIds = new Set<string>();
  const matched: { stars: number }[] = [];

  for (const rt of ratings) {
    if (!rt) continue;
    const isIdMatch = Boolean(rt.craftsmanId && rt.craftsmanId === craftsman.id);
    const isNameMatch =
      Boolean(rt.craftsmanName) &&
      (rt.craftsmanName.trim() === normName ||
        normName.includes(rt.craftsmanName.trim()) ||
        rt.craftsmanName.trim().includes(normName));
    if (isIdMatch || isNameMatch) {
      seenIds.add(rt.id);
      if (rt.requestId) seenIds.add(`req_${rt.requestId}`);
      matched.push({ stars: rt.stars });
    }
  }
  for (const req of requests) {
    if (!req || !req.customerRatingStars || !req.customerRatingComment) continue;
    if (seenIds.has(`req_${req.id}`)) continue;
    const reqCrName = (req.agreedByCraftsmanName || req.revealedByCraftsmanName || '').trim();
    if (
      reqCrName &&
      (reqCrName === normName || normName.includes(reqCrName) || reqCrName.includes(normName))
    ) {
      seenIds.add(`req_${req.id}`);
      matched.push({ stars: req.customerRatingStars });
    }
  }
  return matched;
}

function timestampToDatetimeLocalValue(ts: number): string {
  try {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

interface HomeFeedProps {
  requests: RequestItem[];
  craftsmen?: CraftsmanUser[];
  isLoadingLiveDb?: boolean;
  lastSyncedAt?: number | null;
  onRefreshLiveDb?: () => void;
  revealedSet: Set<string>;
  isRegisteredCraftsman?: boolean;
  onRevealPhone: (req: RequestItem) => void;
  onSelectRequest: (req: RequestItem) => void;
  onOpenCreateModal: () => void;
  onOpenPromoModal?: () => void;
  onOpenPlayStore?: () => void;
  onOpenUploadReceipt?: () => void;
  onOpenChargilyCheckout?: () => void;
  onOpenAdminChat?: () => void;
  onNavigatePoints?: () => void;
  points?: number;
  officialRip?: string;
  officialHolder?: string;
  craftsmanCraft?: string;
  craftsmanName?: string;
  onToggleAgreeRequest?: (req: RequestItem) => void;
  onUpdateAgreementDetails?: (
    req: RequestItem,
    details: {
      isAgreed: boolean;
      agreementTimeNote: string;
      agreementScheduledAt?: number;
      agreementReminderMinutes?: number;
      cancellationReason: string;
    }
  ) => void;
  onTriggerAppointmentReminderNow?: (req: RequestItem) => void;
  ratings?: RatingItem[];
  onCompleteAndRateRequest?: (req: RequestItem) => void;
  onOpenCraftsmanProfile?: (craftsman: CraftsmanUser) => void;
  onOpenCraftsmanProfileByName?: (name: string, craft: string) => void;
  onRateCraftsmanDirect?: (craftsman: CraftsmanUser) => void;
  onTestSpecialtyNotification?: () => void;
  onScheduleBackgroundTestNotification?: () => void;
  userMode: 'craftsman' | 'customer';
  isDark: boolean;
}

type FeedFilterTab = 'recommended' | 'all' | 'reviews' | 'no_offer';

export const HomeFeed: React.FC<HomeFeedProps> = ({
  requests,
  craftsmen = [],
  isLoadingLiveDb = false,
  lastSyncedAt = null,
  onRefreshLiveDb,
  revealedSet,
  isRegisteredCraftsman = true,
  onRevealPhone,
  onSelectRequest,
  onOpenCreateModal,
  craftsmanCraft = 'بلومبي',
  craftsmanName = '',
  onToggleAgreeRequest,
  onUpdateAgreementDetails,
  onTriggerAppointmentReminderNow,
  ratings = [],
  onCompleteAndRateRequest,
  onOpenCraftsmanProfile,
  onOpenCraftsmanProfileByName,
  onRateCraftsmanDirect,
  userMode,
  isDark
}) => {
  const [feedSection, setFeedSection] = useState<'requests' | 'craftsmen'>('requests');
  const [activeTab, setActiveTab] = useState<FeedFilterTab>('all');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState<boolean>(false);
  const [selectedCraft, setSelectedCraft] = useState<string>('الكل');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingCardMode, setEditingCardMode] = useState<'agree' | 'cancel'>('agree');
  const [cardTimeNote, setCardTimeNote] = useState<string>('');
  const [cardScheduledDatetime, setCardScheduledDatetime] = useState<string>('');
  const [cardReminderMins, setCardReminderMins] = useState<number>(30);
  const [cardCancelReason, setCardCancelReason] = useState<string>('');
  const [cardCancelError, setCardCancelError] = useState<string | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => isNotificationSoundEnabled());
  const [bgNotifEnabled, setBgNotifEnabled] = useState<boolean>(() =>
    isBackgroundNotificationEnabled()
  );
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    () => getBrowserNotificationPermission()
  );
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = async () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setNotificationSoundEnabled(next);
    if (next) {
      const perm = await requestLocalNotificationPermission();
      setNotifPermission(perm);
    }
  };

  const handleToggleBgNotification = async () => {
    if (notifPermission !== 'granted') {
      const perm = await requestLocalNotificationPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        setBgNotifEnabled(true);
        setBackgroundNotificationEnabled(true);
      }
      return;
    }
    const next = !bgNotifEnabled;
    setBgNotifEnabled(next);
    setBackgroundNotificationEnabled(next);
  };

  // Strictly customer requests only (exclude craftsman self-ads and seed craftsman availability cards)
  const customerOnlyRequests = useMemo(() => {
    const seedCraftsmanCardIds = new Set([
      'req_cr_cp1',
      'req_cr_cp2',
      'req_cr_cp3',
      'req_cr_cp4',
      'req_cr_cp5',
      'req_cr_cp6',
      'r_1794865802107',
      'r_1794843332786'
    ]);
    return requests.filter(
      (r) =>
        r &&
        !seedCraftsmanCardIds.has(String(r.id || '')) &&
        !String(r.title || '').includes('حرفي معتمد متاح') &&
        !isCraftsmanAdInCustomerFeed(r)
    );
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return customerOnlyRequests
      .filter((req) => {
        if (selectedCraft !== 'الكل' && req.craft !== selectedCraft) {
          return false;
        }
        if (
          selectedWilaya !== 'الكل' &&
          !req.wilaya.includes(selectedWilaya.replace(/^\d+\s*/, ''))
        ) {
          return false;
        }
        if (activeTab === 'recommended') {
          const matchesCraft = !craftsmanCraft || req.craft === craftsmanCraft;
          if (!matchesCraft && !req.priority) return false;
        } else if (activeTab === 'reviews') {
          const hasRating =
            Boolean(req.customerRatingStars && req.customerRatingStars > 0) ||
            ratings.some((rt) => rt.requestId === req.id);
          if (!hasRating && req.status !== 'completed') return false;
        } else if (activeTab === 'no_offer') {
          const hasOffer = Boolean(
            req.isAgreed ||
              req.agreedByCraftsmanName ||
              req.revealedByCraftsmanName ||
              req.status === 'in_progress' ||
              req.status === 'completed'
          );
          if (hasOffer) return false;
        }

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
      })
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }, [
    customerOnlyRequests,
    selectedCraft,
    selectedWilaya,
    activeTab,
    craftsmanCraft,
    ratings,
    searchQuery
  ]);

  const filteredCraftsmen = useMemo(() => {
    return craftsmen.filter((c) => {
      if (c.status === 'suspended') return false;
      if (selectedCraft !== 'الكل' && c.craft !== selectedCraft) {
        return false;
      }
      if (
        selectedWilaya !== 'الكل' &&
        !(c.wilaya || '').includes(selectedWilaya.replace(/^\d+\s*/, ''))
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesCraft = c.craft.toLowerCase().includes(q);
        const matchesWilaya = (c.wilaya || '').toLowerCase().includes(q);
        const matchesBio = (c.bio || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCraft && !matchesWilaya && !matchesBio) {
          return false;
        }
      }
      return true;
    });
  }, [craftsmen, selectedCraft, selectedWilaya, searchQuery]);

  const handleCopyPhone = (id: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getWilayaShortName = (wilayaStr: string) => {
    return String(wilayaStr || '')
      .replace(/^\d+\s*/, '')
      .trim() || wilayaStr;
  };

  const hasActiveSubFilters =
    selectedCraft !== 'الكل' || selectedWilaya !== 'الكل' || searchQuery.trim().length > 0;

  return (
    <div
      className={`w-full max-w-full overflow-x-hidden pb-24 min-h-screen ${
        isDark ? 'bg-[#0f121d] text-white' : 'bg-white text-slate-900'
      }`}
    >
      {/* Top Minimalist Filter Pill Strip (Recommandée | Tout | Avis | Sans offre) */}
      <div
        className={`sticky top-0 z-20 px-3 pt-2.5 pb-2 border-b backdrop-blur-md ${
          isDark
            ? 'bg-[#0f121d]/95 border-gray-800'
            : 'bg-white/95 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'recommended' as FeedFilterTab, label: 'مقترحة' },
            { id: 'all' as FeedFilterTab, label: 'الكل' },
            { id: 'reviews' as FeedFilterTab, label: 'تقييمات' },
            { id: 'no_offer' as FeedFilterTab, label: 'بدون عروض' }
          ].map((tab) => {
            const isSelected = feedSection === 'requests' && activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFeedSection('requests');
                  setActiveTab(tab.id);
                }}
                className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-slate-700 border-slate-500 text-white shadow-2xs'
                      : 'bg-slate-200/80 border-slate-300 text-slate-900 shadow-2xs'
                    : isDark
                    ? 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          {craftsmen.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setFeedSection((prev) => (prev === 'craftsmen' ? 'requests' : 'craftsmen'))
              }
              className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                feedSection === 'craftsmen'
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : isDark
                  ? 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>الحرفيون ({craftsmen.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowFiltersDrawer((prev) => !prev)}
            className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-bold border flex items-center gap-1 transition cursor-pointer ${
              showFiltersDrawer || hasActiveSubFilters
                ? 'bg-sky-500/15 border-sky-500/50 text-sky-700 dark:text-sky-300'
                : isDark
                ? 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="تصفية حسب الولاية، المهنة أو البحث"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>تصفية</span>
          </button>
        </div>

        {/* Collapsible Filter Drawer (Wilaya, Craft, Search, Sound/Refresh) */}
        {showFiltersDrawer && (
          <div
            className={`mt-2.5 pt-2.5 border-t space-y-2 ${
              isDark ? 'border-gray-800' : 'border-slate-200'
            }`}
          >
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedWilaya}
                onChange={(e) => setSelectedWilaya(e.target.value)}
                className={`w-full h-9 px-2.5 rounded-xl border text-xs font-bold outline-none ${
                  isDark
                    ? 'bg-gray-900 border-gray-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="الكل">كل الولايات (58)</option>
                {WILAYAS_DZ.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>

              <select
                value={selectedCraft}
                onChange={(e) => setSelectedCraft(e.target.value)}
                className={`w-full h-9 px-2.5 rounded-xl border text-xs font-bold outline-none ${
                  isDark
                    ? 'bg-gray-900 border-gray-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="الكل">كل الحرف ({CRAFTS_LIST.length})</option>
                {CRAFTS_LIST.map((c) => (
                  <option key={c} value={c}>
                    {getCraftIcon(c)} {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن طلب، بلدية، عطل..."
                  className={`w-full h-9 pr-8 pl-3 rounded-xl border text-xs font-semibold outline-none ${
                    isDark
                      ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'
                  }`}
                />
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>

              {onRefreshLiveDb && (
                <button
                  type="button"
                  onClick={onRefreshLiveDb}
                  disabled={isLoadingLiveDb}
                  className={`h-9 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 ${
                    isDark
                      ? 'bg-gray-900 border-gray-700 text-emerald-400'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                  title={
                    lastSyncedAt
                      ? `آخر تحديث: ${new Date(lastSyncedAt).toLocaleTimeString('fr-FR')}`
                      : 'تحديث القائمة'
                  }
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLiveDb ? 'animate-spin' : ''}`} />
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleSound}
                className={`h-9 w-9 rounded-xl border flex items-center justify-center cursor-pointer shrink-0 ${
                  soundEnabled
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    : isDark
                    ? 'bg-gray-900 border-gray-700 text-gray-400'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
                title={soundEnabled ? 'صوت الإشعارات مفعل' : 'صوت الإشعارات صامت'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleToggleBgNotification}
                className={`h-9 w-9 rounded-xl border flex items-center justify-center cursor-pointer shrink-0 ${
                  bgNotifEnabled && notifPermission === 'granted'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    : isDark
                    ? 'bg-gray-900 border-gray-700 text-gray-400'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
                title="تفعيل إشعارات المتصفح في الخلفية"
              >
                <BellRing className="w-4 h-4" />
              </button>

              {hasActiveSubFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCraft('الكل');
                    setSelectedWilaya('الكل');
                    setSearchQuery('');
                  }}
                  className="h-9 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-bold cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {feedSection === 'craftsmen' ? (
        <div className="divide-y divide-slate-200 dark:divide-gray-800">
          {filteredCraftsmen.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="text-3xl">👷</div>
              <div className="font-bold text-sm">لا يوجد حرفيون مطابقون للبحث</div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCraft('الكل');
                  setSelectedWilaya('الكل');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                عرض جميع الحرفيين ({craftsmen.length})
              </button>
            </div>
          ) : (
            filteredCraftsmen.map((craftsman) => {
              const displayCraft = !craftsman.craft || craftsman.craft === 'سباك' ? 'بلومبي' : craftsman.craft;
              const displayName = String(craftsman.name || '').replace(/سباك/g, 'بلومبي');
              const displayBio = String(craftsman.bio || '').replace(/سباك/g, 'بلومبي');
              const icon = getCraftIcon(displayCraft);
              const crReviews = getLocalCraftsmanReviews(craftsman, ratings, requests);
              const displayAvg =
                crReviews.length > 0
                  ? Number(
                      (
                        ((craftsman.baseAvg || 4.8) *
                          Math.max(1, (craftsman.baseCount || 1) - crReviews.length) +
                          crReviews.reduce((acc, r) => acc + r.stars, 0)) /
                        Math.max(1, craftsman.baseCount || 1, crReviews.length)
                      ).toFixed(1)
                    )
                  : Number((craftsman.baseAvg || 4.8).toFixed(1));
              const displayCount = Math.max(craftsman.baseCount || 1, crReviews.length);

              return (
                <div
                  key={craftsman.id}
                  onClick={() => onOpenCraftsmanProfile?.(craftsman)}
                  className={`px-4 py-3.5 transition cursor-pointer ${
                    isDark ? 'hover:bg-gray-900/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg shrink-0">
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-sm text-sky-700 dark:text-sky-400 truncate">
                            {displayName}
                          </h3>
                          {craftsman.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 mt-0.5 flex-wrap">
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {displayAvg.toFixed(1)} ★ ({displayCount})
                          </span>
                          <span>·</span>
                          <span>{displayCraft}</span>
                          <span>·</span>
                          <span>{getWilayaShortName(craftsman.wilaya || '')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {displayBio && (
                    <p className="text-xs text-slate-600 dark:text-gray-300 mt-2 line-clamp-2">
                      {displayBio}
                    </p>
                  )}

                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2.5 flex items-center gap-2 flex-wrap"
                  >
                    <button
                      type="button"
                      onClick={onOpenCreateModal}
                      className="h-8 px-3 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>أضف طلبك ليتصل بك</span>
                    </button>
                    {onRateCraftsmanDirect && (
                      <button
                        type="button"
                        onClick={() => onRateCraftsmanDirect(craftsman)}
                        className="h-8 px-3 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-800 dark:text-gray-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>تقييم</span>
                      </button>
                    )}
                    {onOpenCraftsmanProfile && (
                      <button
                        type="button"
                        onClick={() => onOpenCraftsmanProfile(craftsman)}
                        className="h-8 px-3 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>الملف</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Clean Minimalist Requests Feed matching User's Reference Screenshots */
        <div className="divide-y divide-slate-200 dark:divide-gray-800">
          {filteredRequests.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="text-3xl">🔍</div>
              <div className="font-bold text-sm">لا توجد طلبات مطابقة</div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCraft('الكل');
                  setSelectedWilaya('الكل');
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                عرض جميع الطلبات
              </button>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isExpanded = expandedRequestId === req.id;
              const isRevealed = Boolean(isRegisteredCraftsman && revealedSet.has(req.id));
              const icon = getCraftIcon(req.craft);
              const cleanPhone = req.phone.replace(/\s+/g, '');
              const relativeText = formatRelativeTime(req.createdAt, now);
              const exactTime = formatExactPostedTime(req.createdAt);
              const activeCraftsmanLabel = (
                req.agreedByCraftsmanName ||
                req.revealedByCraftsmanName ||
                (isRevealed ? craftsmanName : '') ||
                ''
              ).trim();
              const isCustomerAgreed = Boolean(
                req.isAgreed ||
                  req.agreedByCraftsmanName ||
                  req.status === 'in_progress' ||
                  req.status === 'completed'
              );
              const hasCancellation = Boolean(!isCustomerAgreed && req.cancellationReason);
              const hasOfferOrInteraction = Boolean(
                activeCraftsmanLabel || isCustomerAgreed || hasCancellation || isRevealed
              );
              const offersCount = hasOfferOrInteraction ? 1 : 0;

              const matchedCraftsman = activeCraftsmanLabel
                ? craftsmen.find((c) => c.name === activeCraftsmanLabel)
                : undefined;
              const matchedRating = ratings.find((rt) => rt.requestId === req.id);
              const starsVal = matchedRating?.stars || req.customerRatingStars || 0;
              const commentVal = matchedRating?.comment || req.customerRatingComment || '';

              const wilayaShort = getWilayaShortName(req.wilaya);
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${wilayaShort}, Algeria`
              )}`;

              return (
                <div
                  key={req.id}
                  className={`transition-colors ${
                    isExpanded
                      ? isDark
                        ? 'bg-[#141926]'
                        : 'bg-slate-50/90'
                      : isDark
                      ? 'bg-[#0f121d] hover:bg-gray-900/50'
                      : 'bg-white hover:bg-slate-50/70'
                  }`}
                >
                  {/* Collapsed / Header Summary Row */}
                  <div
                    onClick={() =>
                      setExpandedRequestId((prev) => (prev === req.id ? null : req.id))
                    }
                    className="px-4 py-3.5 cursor-pointer select-none"
                  >
                    {/* Metadata Line: time · wilaya · craft · offers · 25ن · chevron */}
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="font-medium whitespace-nowrap">{relativeText}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium truncate">{wilayaShort}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium whitespace-nowrap">
                          {icon} {req.craft}
                        </span>
                        {offersCount > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-slate-700 dark:text-gray-300 whitespace-nowrap">
                              {offersCount} عرض
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {userMode === 'craftsman' && !isRevealed && (
                          <span className="bg-amber-400 text-amber-950 font-black text-[11px] px-2 py-0.5 rounded-full leading-none tabular-nums">
                            25ن
                          </span>
                        )}
                        {isRevealed && (
                          <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full">
                            مكشوف ✓
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Clean Bold Title */}
                    <h3
                      className={`mt-1 text-[16px] font-bold leading-snug ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {req.priority ? 'مستعجل: ' : ''}
                      {req.title}
                    </h3>

                    {/* Circular Craftsman Avatar Row (only when not expanded, matching screenshots 1,2,4,6) */}
                    {!isExpanded && hasOfferOrInteraction && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeCraftsmanLabel && onOpenCraftsmanProfileByName) {
                              onOpenCraftsmanProfileByName(activeCraftsmanLabel, req.craft);
                            } else {
                              setExpandedRequestId(req.id);
                            }
                          }}
                          title={activeCraftsmanLabel || `حرفي ${req.craft}`}
                          className={`relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 cursor-pointer ${
                            isCustomerAgreed
                              ? 'ring-2 ring-emerald-500 bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                              : hasCancellation
                              ? 'ring-2 ring-rose-500 bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200'
                              : 'ring-2 ring-sky-500 bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200'
                          }`}
                        >
                          <span>
                            {(activeCraftsmanLabel || req.craft || 'ح').trim().charAt(0)}
                          </span>
                          <span
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white border border-white dark:border-gray-900 ${
                              isCustomerAgreed
                                ? 'bg-emerald-500'
                                : hasCancellation
                                ? 'bg-rose-500'
                                : 'bg-sky-500'
                            }`}
                          >
                            {isCustomerAgreed ? (
                              <Calendar className="w-2.5 h-2.5" />
                            ) : hasCancellation ? (
                              <PhoneOff className="w-2.5 h-2.5" />
                            ) : (
                              <FileText className="w-2.5 h-2.5" />
                            )}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Inline Details View (matching Screenshots 3, 5, 6) */}
                  {isExpanded && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`px-4 pb-5 pt-1 space-y-4 border-t ${
                        isDark ? 'border-gray-800/80' : 'border-slate-200/70'
                      }`}
                    >
                      {/* Client Row */}
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-800 text-slate-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 dark:text-gray-400">
                              الزبون
                            </div>
                            <div className="text-sm font-bold">
                              {req.isCustomerOwn ? 'زبون مباشر' : 'زبون موثق'}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-gray-400">
                          {relativeText}
                        </span>
                      </div>

                      {/* Address / Wilaya Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center text-slate-400 shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 dark:text-gray-400 mb-1">
                              العنوان
                            </div>
                            <span className="inline-block bg-slate-200/80 dark:bg-gray-800 text-slate-800 dark:text-gray-200 text-xs font-bold px-3 py-1 rounded-lg">
                              {req.wilaya}
                            </span>
                          </div>
                        </div>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 dark:text-sky-400 text-xs font-bold hover:underline shrink-0"
                        >
                          عرض على الخريطة
                        </a>
                      </div>

                      {/* Phone Row */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center text-slate-400 shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-500 dark:text-gray-400 mb-1">
                            الهاتف
                          </div>
                          {isRevealed || (userMode === 'customer' && req.isCustomerOwn) ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400"
                                dir="ltr"
                              >
                                {req.phone}
                              </span>
                              <a
                                href={`tel:${cleanPhone}`}
                                className="h-8 px-3 rounded-lg bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>اتصال</span>
                              </a>
                              <a
                                href={`https://wa.me/213${cleanPhone.replace(/^0/, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="h-8 px-3 rounded-lg bg-[#25D366] text-white text-xs font-bold inline-flex items-center gap-1"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>واتساب</span>
                              </a>
                              <button
                                type="button"
                                onClick={(e) => handleCopyPhone(req.id, req.phone, e)}
                                className="h-8 px-2.5 rounded-lg bg-slate-200 dark:bg-gray-800 text-xs font-bold cursor-pointer"
                              >
                                {copiedId === req.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  'نسخ'
                                )}
                              </button>
                            </div>
                          ) : userMode === 'customer' ? (
                            <span className="inline-block bg-slate-200/80 dark:bg-gray-800 text-slate-700 dark:text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg">
                              🔒 خاص بطلبات الزبون (يظهر للحرفيين المسجلين)
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onRevealPhone(req)}
                              className="bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-900 dark:text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              رؤية الرقم (25ن)
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="pt-1 space-y-1">
                        <div className="text-[11px] font-bold tracking-wide text-slate-500 dark:text-gray-400">
                          التفاصيل
                        </div>
                        <p className="text-sm leading-relaxed text-slate-800 dark:text-gray-200">
                          {req.desc}
                        </p>
                      </div>

                      {/* Centered Primary Green Pill CTA + More Menu (like Screenshot 3 & 5) */}
                      <div className="flex items-center justify-center gap-3 pt-1">
                        {userMode === 'craftsman' && !isRevealed ? (
                          <button
                            type="button"
                            onClick={() => onRevealPhone(req)}
                            className="h-11 px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
                          >
                            <Hand className="w-4 h-4" />
                            <span>كشف الهاتف وتقديم عرض</span>
                            <span className="bg-amber-400 text-amber-950 font-black text-[11px] px-2 py-0.5 rounded-full">
                              25ن
                            </span>
                          </button>
                        ) : userMode === 'craftsman' && isRevealed ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (editingCardId === req.id && editingCardMode === 'agree') {
                                setEditingCardId(null);
                              } else {
                                setEditingCardId(req.id);
                                setEditingCardMode('agree');
                                setCardTimeNote(req.agreementTimeNote || '');
                                const initTs =
                                  req.agreementScheduledAt && req.agreementScheduledAt > 1000000000000
                                    ? req.agreementScheduledAt
                                    : resolveAgreementScheduledTimestamp(req.agreementTimeNote || '');
                                setCardScheduledDatetime(timestampToDatetimeLocalValue(initTs));
                                setCardReminderMins(Number(req.agreementReminderMinutes) || 30);
                              }
                            }}
                            className="h-11 px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>
                              {isCustomerAgreed ? 'تعديل موعد الإتفاق' : 'تحديد موعد الإتفاق'}
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectRequest(req)}
                            className="h-11 px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
                          >
                            <ClipboardList className="w-4 h-4" />
                            <span>عرض التفاصيل والخيارات</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectRequest(req)}
                          className="w-11 h-11 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 flex items-center justify-center transition cursor-pointer shrink-0"
                          title="المزيد من الخيارات (تقييم، بلاغ...)"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Offers / Craftsman Timeline inside Expanded Card (Screenshot 5) */}
                      {(hasOfferOrInteraction || (isRevealed && userMode === 'craftsman')) && (
                        <div className="pt-2 space-y-2.5">
                          <div className="text-xs font-bold text-slate-500 dark:text-gray-400">
                            العروض ({offersCount})
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-gray-400 -mt-1.5">
                            اضغط على الحرفي لعرض ملفه وتقييماته
                          </div>

                          <div
                            className={`rounded-2xl p-3.5 border space-y-2.5 ${
                              isDark
                                ? 'bg-[#1a1f30] border-gray-800'
                                : 'bg-white border-slate-200/80 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  if (activeCraftsmanLabel && onOpenCraftsmanProfileByName) {
                                    onOpenCraftsmanProfileByName(activeCraftsmanLabel, req.craft);
                                  }
                                }}
                                className={`relative w-11 h-11 rounded-full flex items-center justify-center text-sm font-black shrink-0 cursor-pointer ${
                                  isCustomerAgreed
                                    ? 'ring-2 ring-emerald-500 bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                                    : hasCancellation
                                    ? 'ring-2 ring-rose-500 bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200'
                                    : 'ring-2 ring-sky-500 bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200'
                                }`}
                              >
                                <span>
                                  {(activeCraftsmanLabel || req.craft || 'ح').trim().charAt(0)}
                                </span>
                                <span
                                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white border border-white dark:border-gray-900 ${
                                    isCustomerAgreed
                                      ? 'bg-emerald-500'
                                      : hasCancellation
                                      ? 'bg-rose-500'
                                      : 'bg-sky-500'
                                  }`}
                                >
                                  {isCustomerAgreed ? (
                                    <Calendar className="w-2.5 h-2.5" />
                                  ) : hasCancellation ? (
                                    <PhoneOff className="w-2.5 h-2.5" />
                                  ) : (
                                    <FileText className="w-2.5 h-2.5" />
                                  )}
                                </span>
                              </button>

                              <div className="flex-1 min-w-0 space-y-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (activeCraftsmanLabel && onOpenCraftsmanProfileByName) {
                                      onOpenCraftsmanProfileByName(activeCraftsmanLabel, req.craft);
                                    }
                                  }}
                                  className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline text-right cursor-pointer"
                                >
                                  {activeCraftsmanLabel || `حرفي ${req.craft}`}
                                </button>

                                <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
                                  <span className="inline-flex items-center gap-0.5 text-slate-800 dark:text-gray-200">
                                    {(matchedCraftsman?.baseAvg ?? 4.8).toFixed(1)}
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                                    <span className="text-slate-500 font-normal">
                                      ({matchedCraftsman?.baseCount ?? 6} تقييمات)
                                    </span>
                                  </span>
                                  <span className="bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-[11px]">
                                    {matchedCraftsman?.wilaya || req.wilaya}
                                  </span>
                                </div>

                                <div className="inline-block bg-slate-100 dark:bg-gray-800/80 text-slate-800 dark:text-gray-200 text-xs px-3 py-2 rounded-xl">
                                  متوفر الآن. في خدمتكم.
                                </div>
                                {exactTime && (
                                  <div className="text-[11px] text-slate-400">{exactTime}</div>
                                )}

                                {isCustomerAgreed && (() => {
                                  const cardCountdown = getAppointmentCountdownInfo(
                                    req.agreementScheduledAt ||
                                      resolveAgreementScheduledTimestamp(req.agreementTimeNote || ''),
                                    req.agreementReminderMinutes || 30,
                                    now
                                  );
                                  const cardGoogleCalUrl = buildGoogleCalendarUrl(req, {
                                    canShowPhone: isRevealed
                                  });

                                  return (
                                    <div className="space-y-1.5 pt-1">
                                      <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-2 rounded-xl">
                                        خلاص، تفاهمت مع الزبون. الموعد:{' '}
                                        {req.agreementTimeNote ||
                                          formatScheduledAppointmentAr(req.agreementScheduledAt) ||
                                          'محدد'}
                                      </div>

                                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                                        {cardCountdown && (
                                          <span className="font-bold text-amber-600 dark:text-amber-400">
                                            {cardCountdown.badgeText}
                                          </span>
                                        )}
                                        <a
                                          href={cardGoogleCalUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sky-600 dark:text-sky-400 font-bold hover:underline inline-flex items-center gap-1"
                                        >
                                          <Calendar className="w-3 h-3" />
                                          <span>تقويم Google</span>
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            downloadAppointmentIcsFile(req, {
                                              canShowPhone: isRevealed
                                            })
                                          }
                                          className="text-slate-600 dark:text-gray-300 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          <Download className="w-3 h-3" />
                                          <span>ملف .ics</span>
                                        </button>
                                        {onTriggerAppointmentReminderNow && (
                                          <button
                                            type="button"
                                            onClick={() => onTriggerAppointmentReminderNow(req)}
                                            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                                          >
                                            🔔 تذكير
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {hasCancellation && (
                                  <div className="bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold px-3 py-2 rounded-xl">
                                    ما تفاهمناش — السبب: {req.cancellationReason}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Inline Craftsman Agreement / Cancel Editor */}
                            {userMode === 'craftsman' &&
                              (isRevealed || activeCraftsmanLabel) &&
                              (onUpdateAgreementDetails || onToggleAgreeRequest) && (
                                <div className="pt-2 border-t border-slate-100 dark:border-gray-800 space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (
                                          editingCardId === req.id &&
                                          editingCardMode === 'agree'
                                        ) {
                                          setEditingCardId(null);
                                        } else {
                                          setEditingCardId(req.id);
                                          setEditingCardMode('agree');
                                          setCardTimeNote(req.agreementTimeNote || '');
                                          const initTs =
                                            req.agreementScheduledAt &&
                                            req.agreementScheduledAt > 1000000000000
                                              ? req.agreementScheduledAt
                                              : resolveAgreementScheduledTimestamp(
                                                  req.agreementTimeNote || ''
                                                );
                                          setCardScheduledDatetime(
                                            timestampToDatetimeLocalValue(initTs)
                                          );
                                          setCardReminderMins(
                                            Number(req.agreementReminderMinutes) || 30
                                          );
                                        }
                                      }}
                                      className="h-8 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer"
                                    >
                                      🤝 تفاهمت + موعد
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (
                                          editingCardId === req.id &&
                                          editingCardMode === 'cancel'
                                        ) {
                                          setEditingCardId(null);
                                          setCardCancelError(null);
                                        } else {
                                          setEditingCardId(req.id);
                                          setEditingCardMode('cancel');
                                          setCardCancelReason(req.cancellationReason || '');
                                          setCardCancelError(null);
                                        }
                                      }}
                                      className="h-8 px-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold cursor-pointer"
                                    >
                                      ✕ ما تفاهمناش (السبب)
                                    </button>
                                  </div>

                                  {editingCardId === req.id && editingCardMode === 'agree' && (
                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 space-y-2">
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {[
                                          { label: 'بعد 15 دقيقة', mins: 15 },
                                          { label: 'بعد 30 دقيقة', mins: 30 },
                                          { label: 'بعد ساعة', mins: 60 },
                                          { label: 'اليوم على 15:00' },
                                          { label: 'غداً صباحاً 09:00' }
                                        ].map((preset) => (
                                          <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => {
                                              setCardTimeNote(preset.label);
                                              const ts = preset.mins
                                                ? Date.now() + preset.mins * 60 * 1000
                                                : resolveAgreementScheduledTimestamp(preset.label);
                                              setCardScheduledDatetime(
                                                timestampToDatetimeLocalValue(ts)
                                              );
                                            }}
                                            className={`px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer ${
                                              cardTimeNote === preset.label
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700'
                                            }`}
                                          >
                                            {preset.label}
                                          </button>
                                        ))}
                                      </div>

                                      <div className="grid grid-cols-2 gap-1.5">
                                        <input
                                          type="datetime-local"
                                          value={cardScheduledDatetime}
                                          onChange={(e) => {
                                            setCardScheduledDatetime(e.target.value);
                                            const p = Date.parse(e.target.value);
                                            if (!Number.isNaN(p)) {
                                              setCardTimeNote(formatScheduledAppointmentAr(p));
                                            }
                                          }}
                                          className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[10px] font-mono outline-none"
                                        />
                                        <select
                                          value={cardReminderMins}
                                          onChange={(e) =>
                                            setCardReminderMins(Number(e.target.value) || 30)
                                          }
                                          className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[10px] font-bold outline-none"
                                        >
                                          <option value={5}>تذكير قبل 5 دقائق</option>
                                          <option value={15}>تذكير قبل 15 دقيقة</option>
                                          <option value={30}>تذكير قبل 30 دقيقة</option>
                                          <option value={60}>تذكير قبل ساعة</option>
                                        </select>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="text"
                                          value={cardTimeNote}
                                          onChange={(e) => setCardTimeNote(e.target.value)}
                                          placeholder="وقت الموعد (مثال: اليوم 14:30)..."
                                          className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const resolvedTs = resolveAgreementScheduledTimestamp(
                                              cardTimeNote,
                                              cardScheduledDatetime
                                            );
                                            const finalNote =
                                              cardTimeNote.trim() ||
                                              formatScheduledAppointmentAr(resolvedTs) ||
                                              'تم الإتفاق';
                                            if (onUpdateAgreementDetails) {
                                              onUpdateAgreementDetails(req, {
                                                isAgreed: true,
                                                agreementTimeNote: finalNote,
                                                agreementScheduledAt: resolvedTs,
                                                agreementReminderMinutes: cardReminderMins,
                                                cancellationReason: ''
                                              });
                                            } else if (onToggleAgreeRequest) {
                                              onToggleAgreeRequest(req);
                                            }
                                            setEditingCardId(null);
                                          }}
                                          className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                                        >
                                          حفظ ✓
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {editingCardId === req.id && editingCardMode === 'cancel' && (
                                    <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {[
                                          'الزبون لم يرد',
                                          'اختلفنا في السعر',
                                          'الزبون أجّل الموعد',
                                          'الموقع بعيد'
                                        ].map((reason) => (
                                          <button
                                            key={reason}
                                            type="button"
                                            onClick={() => {
                                              setCardCancelReason(reason);
                                              setCardCancelError(null);
                                            }}
                                            className={`px-2 py-1 rounded-md text-[10px] font-bold border cursor-pointer ${
                                              cardCancelReason === reason
                                                ? 'bg-rose-600 text-white border-rose-600'
                                                : 'bg-white dark:bg-gray-800 border-rose-200 dark:border-gray-700'
                                            }`}
                                          >
                                            {reason}
                                          </button>
                                        ))}
                                      </div>
                                      {cardCancelError && (
                                        <div className="text-[11px] font-bold text-rose-600">
                                          {cardCancelError}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="text"
                                          value={cardCancelReason}
                                          onChange={(e) => {
                                            setCardCancelReason(e.target.value);
                                            if (cardCancelError) setCardCancelError(null);
                                          }}
                                          placeholder="اكتب السبب..."
                                          className="flex-1 h-8 px-2.5 rounded-lg border border-rose-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const trimmed = cardCancelReason.trim();
                                            if (!trimmed) {
                                              setCardCancelError('يرجى كتابة السبب أولاً.');
                                              return;
                                            }
                                            if (onUpdateAgreementDetails) {
                                              onUpdateAgreementDetails(req, {
                                                isAgreed: false,
                                                agreementTimeNote: '',
                                                agreementScheduledAt: 0,
                                                cancellationReason: trimmed
                                              });
                                            }
                                            setCardCancelError(null);
                                            setEditingCardId(null);
                                          }}
                                          className="h-8 px-3 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                                        >
                                          تأكيد
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                      {/* Customer Review Display or Rate Button inside Expanded View */}
                      {starsVal > 0 && commentVal ? (
                        <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
                          <div className="flex items-center gap-1 text-xs font-bold">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                className={`w-3.5 h-3.5 ${
                                  idx < starsVal
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-400 opacity-35'
                                }`}
                              />
                            ))}
                            <span className="mr-1">تقييم الزبون</span>
                          </div>
                          <p className="text-xs font-medium">&ldquo;{commentVal}&rdquo;</p>
                        </div>
                      ) : (
                        (isCustomerAgreed || req.status === 'completed') &&
                        onCompleteAndRateRequest && (
                          <button
                            type="button"
                            onClick={() => onCompleteAndRateRequest(req)}
                            className="w-full h-9 rounded-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-950" />
                            <span>إتمام العمل وتقييم الحرفي بالنجوم</span>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Floating Blue Pill Action Button ("+ أضف طلبك") above Bottom Nav matching Screenshots */}
      <button
        type="button"
        onClick={onOpenCreateModal}
        className="fixed bottom-20 left-4 z-30 h-12 px-5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm shadow-lg shadow-sky-500/30 flex items-center gap-2 transition active:scale-95 cursor-pointer"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>أضف طلبك</span>
      </button>
    </div>
  );
};
