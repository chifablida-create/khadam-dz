/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Megaphone, ShieldCheck } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeFeed } from './components/HomeFeed';
import { OrdersView } from './components/OrdersView';
import { PointsView } from './components/PointsView';
import { AccountView } from './components/AccountView';
import { CreateRequestModal } from './components/modals/CreateRequestModal';
import { RequestDetailModal } from './components/modals/RequestDetailModal';
import { AdminChatModal } from './components/modals/AdminChatModal';
import { UploadReceiptModal } from './components/modals/UploadReceiptModal';
import { RatingModal } from './components/modals/RatingModal';
import { ComplaintModal } from './components/modals/ComplaintModal';
import { AdminLoginModal } from './components/modals/AdminLoginModal';
import { AdminDashboardModal } from './components/modals/AdminDashboardModal';
import { PlayStoreModal } from './components/modals/PlayStoreModal';
import { AppSharePromoModal } from './components/modals/AppSharePromoModal';
import { ChargilyCheckoutModal } from './components/modals/ChargilyCheckoutModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { TopAlertBanner } from './components/TopAlertBanner';
import { BotSyncBanner } from './components/BotSyncBanner';
import { PushNotificationToast, UnifiedNotification } from './components/PushNotificationToast';
import { OnlineKeepAliveStatus } from './components/OnlineKeepAliveStatus';
import { useKeepAlive } from './hooks/useKeepAlive';
import {
  RequestItem,
  CraftsmanUser,
  RatingItem,
  ComplaintItem,
  PendingRecharge,
  PointLog,
  ChatThread,
  ChatMessage,
  PlatformSettings,
  BroadcastNotification,
  AppNotification
} from './types';
import {
  INITIAL_REQUESTS,
  INITIAL_CRAFTSMEN,
  INITIAL_RATINGS,
  INITIAL_COMPLAINTS,
  INITIAL_PENDING_RECHARGES,
  INITIAL_CHATS,
  INITIAL_BROADCASTS,
  INITIAL_NOTIFICATIONS,
  STORAGE_KEYS
} from './data/constants';

import { fetchDemandesFromSupabase, fetchArtisansFromSupabase, saveDemandeToSupabase, saveArtisanToSupabase, savePointsToSupabase, runLiveSupabaseBotReply } from "./supabase.js";
import { playCraftsmanAlertSound } from "./utils/craftsmanNotifications";
import {
  resolveAgreementScheduledTimestamp,
  formatScheduledAppointmentAr,
  getAppointmentCountdownInfo,
  buildGoogleCalendarUrl,
  downloadAppointmentIcsFile
} from "./utils/appointmentScheduler";
const memoryStateStore = new Map<string, any>();
const SEED_REQ_TIME_MAP = new Map<string, number>(INITIAL_REQUESTS.map((r) => [String(r.id), Number(r.createdAt)]));
function sortRequestsDesc(list: RequestItem[]): RequestItem[] {
  if (!Array.isArray(list)) return [];
  return [...list]
    .map((item) => {
      const seedTs = item && item.id ? SEED_REQ_TIME_MAP.get(String(item.id)) : undefined;
      return seedTs !== undefined ? { ...item, createdAt: seedTs } : item;
    })
    .sort((a, b) => Number(b?.createdAt || 0) - Number(a?.createdAt || 0));
}
function getStoredJSON<T>(key: string, defaultValue: T): T {
  if (memoryStateStore.has(key)) return memoryStateStore.get(key) as T;
  return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

function setStoredJSON<T>(key: string, value: T): void {
  memoryStateStore.set(key, value);
  // Explicit saveDemandeToSupabase is called when creating or updating a request
  if (key === STORAGE_KEYS.users && Array.isArray(value) && value[0]) { saveArtisanToSupabase(value[0]).catch(() => {}); }
  if (key === STORAGE_KEYS.points_balance && typeof value === "number") { savePointsToSupabase("global_points", value).catch(() => {}); }
  return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return getStoredJSON(STORAGE_KEYS.theme, false);
  });

  // User Mode: craftsman or customer
  const [userMode, setUserMode] = useState<'craftsman' | 'customer'>(() => {
    return getStoredJSON(STORAGE_KEYS.user_mode, 'craftsman');
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'home' | 'orders' | 'points' | 'account'>('home');

  // Points Balance (defaults to 50 points gift)
  const [points, setPoints] = useState<number>(() => {
    return getStoredJSON(STORAGE_KEYS.points_balance, 50);
  });

  // Revealed Phone IDs set
  const [revealedSet, setRevealedSet] = useState<Set<string>>(() => {
    const storedArr = getStoredJSON<string[]>(STORAGE_KEYS.revealed_phones, []);
    return new Set(storedArr);
  });

  // Requests feed
  const [requests, setRequests] = useState<RequestItem[]>(() => {
    return sortRequestsDesc(getStoredJSON(STORAGE_KEYS.requests, INITIAL_REQUESTS));
  });

  // Current logged in Craftsman Profile
  const [currentUser, setCurrentUser] = useState<CraftsmanUser | null>(() => {
    return getStoredJSON(STORAGE_KEYS.current_user, null);
  });

  // Craftsmen directory
  const [craftsmen, setCraftsmen] = useState<CraftsmanUser[]>(() => {
    return getStoredJSON(STORAGE_KEYS.users, INITIAL_CRAFTSMEN);
  });

  // Ratings
  const [ratings, setRatings] = useState<RatingItem[]>(() => {
    return getStoredJSON(STORAGE_KEYS.ratings, INITIAL_RATINGS);
  });

  // Complaints
  const [complaints, setComplaints] = useState<ComplaintItem[]>(() => {
    return getStoredJSON(STORAGE_KEYS.complaints, INITIAL_COMPLAINTS);
  });

  // Pending Recharges
  const [pendingRecharges, setPendingRecharges] = useState<PendingRecharge[]>(() => {
    return getStoredJSON(STORAGE_KEYS.pending, INITIAL_PENDING_RECHARGES);
  });

  // Point Activity Log
  const [pointLogs, setPointLogs] = useState<PointLog[]>(() => {
    return getStoredJSON(STORAGE_KEYS.points_log, [
      {
        id: 'init_gift',
        type: 'bonus',
        pts: 50,
        description: 'هدية التسجيل والترحيب في خدّام DZ',
        createdAt: Date.now() - 86400000
      }
    ]);
  });

  // Chat threads between craftsmen and admin
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    return getStoredJSON(STORAGE_KEYS.chats, INITIAL_CHATS);
  });

  // Platform settings
  const [settings, setSettings] = useState<PlatformSettings>(() => {
    return getStoredJSON(STORAGE_KEYS.settings, {
      adminPhone: '00799999000122089353',
      adminPass: 'khadam2024',
      adminCode: 'khadam2024',
      botAutoApproveReceipts: true,
      botAutoReplyChat: true,
      botAutoVerifyRequests: true,
      botComplaintAutoWarn: true,
      botConfidenceThreshold: 0.8,
      revealCost: 25,
      welcomeBonus: 50,
      freeRevealPromo: false
    });
  });

  // Broadcast Notifications
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>(() => {
    return getStoredJSON(STORAGE_KEYS.broadcasts, INITIAL_BROADCASTS);
  });

  // Active simulated push notification popup
  const [activePushNotification, setActivePushNotification] = useState<UnifiedNotification | null>(null);

  // In-app Notifications & Alert Banners
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return getStoredJSON(STORAGE_KEYS.notifications, INITIAL_NOTIFICATIONS);
  });
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isLowPointsDismissed, setIsLowPointsDismissed] = useState(false);
  const [isMatchingDismissed, setIsMatchingDismissed] = useState(false);

  // 24/7 Live Stream, Keep-Alive, WakeLock & Un-throttled Web Worker Heartbeat
  const {
    isOnline,
    isLiveStreaming,
    isWakeLockActive,
    isAntiSleepActive,
    serverUptime,
    pulseCount,
    connectedClients,
    lastHeartbeat,
    toggleAntiSleep,
    sendHeartbeat,
    pushLiveRequest,
    pushLiveBroadcast
  } = useKeepAlive({
    onLiveRequest: (liveReq: RequestItem) => {
      setRequests((prev) => {
        const next = prev.some((r) => r.id === liveReq.id)
          ? prev.map((r) => (r.id === liveReq.id ? liveReq : r))
          : [liveReq, ...prev];
        return sortRequestsDesc(next);
      });
    },
    onFullStateSync: (state: any) => {
      if (Array.isArray(state?.requests) && state.requests.length > 0) {
        setRequests((prev) => {
          const byId = new Map<string, RequestItem>();
          for (const item of state.requests) { if (item && item.id) byId.set(String(item.id), item); }
          for (const item of prev) { if (item && item.id && !byId.has(String(item.id))) byId.set(String(item.id), item); }
          return sortRequestsDesc(Array.from(byId.values()));
        });
      }
      if (Array.isArray(state?.craftsmen) && state.craftsmen.length > 0) {
        setCraftsmen((prev) => {
          const byId = new Map<string, CraftsmanUser>();
          for (const item of state.craftsmen) { if (item && item.id) byId.set(String(item.id), item); }
          for (const item of prev) { if (item && item.id && !byId.has(String(item.id))) byId.set(String(item.id), item); }
          return Array.from(byId.values());
        });
      }
    },
    onLiveBroadcast: (liveBc: BroadcastNotification) => {
      setBroadcasts((prev) => {
        if (prev.some((b) => b.id === liveBc.id)) return prev;
        setActivePushNotification(liveBc);
        return [liveBc, ...prev];
      });
    }
  });

  // Toast banner
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [isAdminChatOpen, setIsAdminChatOpen] = useState(false);
  const [isUploadReceiptOpen, setIsUploadReceiptOpen] = useState(false);
  const [receiptInitialPkg, setReceiptInitialPkg] = useState<{ amount: number; pts: number } | null>(null);
  const [ratingTargetRequest, setRatingTargetRequest] = useState<RequestItem | null>(null);
  const [complaintTargetRequest, setComplaintTargetRequest] = useState<RequestItem | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isChargilyOpen, setIsChargilyOpen] = useState(false);
  const [chargilyInitialPkg, setChargilyInitialPkg] = useState<{ amount: number; pts: number } | null>(null);

  // Trigger sync notification
  const triggerSync = (msg: string) => {
    setSyncMessage(msg);
    setTimeout(() => {
      setSyncMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Sync state to localStorage
  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.theme, isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.user_mode, userMode);
  }, [userMode]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.points_balance, points);
  }, [points]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.revealed_phones, Array.from(revealedSet));
  }, [revealedSet]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.requests, requests);
  }, [requests]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.current_user, currentUser);
  }, [currentUser]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.users, craftsmen);
  }, [craftsmen]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.ratings, ratings);
  }, [ratings]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.complaints, complaints);
  }, [complaints]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.pending, pendingRecharges);
  }, [pendingRecharges]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.points_log, pointLogs);
  }, [pointLogs]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.chats, chatThreads);
  }, [chatThreads]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.settings, settings);
  }, [settings]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.broadcasts, broadcasts);
  }, [broadcasts]);

  useEffect(() => {
    setStoredJSON(STORAGE_KEYS.notifications, notifications);
  }, [notifications]);


  useEffect(() => {
    if (typeof window === "undefined") return;
    fetchDemandesFromSupabase().then((d) => { if (Array.isArray(d) && d.length > 0) setRequests((prev) => {
      const byId = new Map<string, RequestItem>();
      for (const item of d) { if (item && item.id) byId.set(String(item.id), item as RequestItem); }
      for (const item of prev) { if (item && item.id && !byId.has(String(item.id))) byId.set(String(item.id), item); }
      return sortRequestsDesc(Array.from(byId.values()));
    }); }).catch(() => {});
    fetchArtisansFromSupabase().then((a) => { if (Array.isArray(a) && a.length > 0) setCraftsmen((prev) => {
      const byId = new Map<string, CraftsmanUser>();
      for (const item of a) { if (item && item.id) byId.set(String(item.id), item as CraftsmanUser); }
      for (const item of prev) { if (item && item.id && !byId.has(String(item.id))) byId.set(String(item.id), item); }
      return Array.from(byId.values());
    }); }).catch(() => {});
    const onGuardianSync = (ev: Event) => {
      const detail = (ev as CustomEvent)?.detail;
      if (!detail) return;
      if (Array.isArray(detail.requests) && detail.requests.length > 0) {
        setRequests((prev) => {
          const byId = new Map<string, RequestItem>();
          for (const item of detail.requests) { if (item && item.id) byId.set(String(item.id), item); }
          for (const item of prev) { if (item && item.id && !byId.has(String(item.id))) byId.set(String(item.id), item); }
          return sortRequestsDesc(Array.from(byId.values()));
        });
      }
      if (Array.isArray(detail.craftsmen) && detail.craftsmen.length > 0) {
        setCraftsmen((prev) => {
          const byId = new Map<string, CraftsmanUser>();
          for (const item of detail.craftsmen) { if (item && item.id) byId.set(String(item.id), item); }
          for (const item of prev) { if (item && item.id && !byId.has(String(item.id))) byId.set(String(item.id), item); }
          return Array.from(byId.values());
        });
      }
      if (typeof detail.points === "number") {
        setPoints(detail.points);
      }
    };
    window.addEventListener("khadam:supabase-sync", onGuardianSync);
    return () => window.removeEventListener("khadam:supabase-sync", onGuardianSync);
  }, []);

  useEffect(() => {
    if (points >= 25) {
      setIsLowPointsDismissed(false);
    }
  }, [points]);

  // Craftsman specialty craft
  const craftsmanCraft = currentUser?.craft || 'سباك';

  // Handle phone reveal (respects dynamic revealCost and freeRevealPromo)
  const handleRevealPhone = (req: RequestItem) => {
    if (revealedSet.has(req.id)) {
      return;
    }

    const activeRevealCost = settings.freeRevealPromo ? 0 : (settings.revealCost ?? 25);

    if (points < activeRevealCost) {
      triggerSync(`⚠️ رصيدك الحالي (${points}ن) غير كافٍ لكشف الرقم (${activeRevealCost}ن) • اشحن الآن`);
      setCurrentTab('points');
      setReceiptInitialPkg({ amount: 2000, pts: 210 });
      setIsUploadReceiptOpen(true);
      return;
    }

    const newPoints = points - activeRevealCost;
    setPoints(newPoints);

    const newRevealed = new Set(revealedSet);
    newRevealed.add(req.id);
    setRevealedSet(newRevealed);

    const newLog: PointLog = {
      id: `log_${Date.now()}`,
      type: 'reveal',
      pts: -activeRevealCost,
      description:
        activeRevealCost === 0
          ? `كشف مجاني ترويجي لرقم زبون (${req.craft} - ${req.wilaya})`
          : `كشف رقم هاتف طلب (${req.craft} - ${req.wilaya})`,
      createdAt: Date.now()
    };
    setPointLogs((prev) => [newLog, ...prev]);

    triggerSync(
      activeRevealCost === 0
        ? '🎉 تم كشف رقم الهاتف مجاناً (عرض ترويجي من الإدارة) ✓'
        : `تم كشف رقم الهاتف وخصم ${activeRevealCost} نقطة ✓`
    );

    // Alert user when points balance falls below reveal cost
    if (newPoints < 25) {
      const lowNotif: AppNotification = {
        id: `notif_low_${Date.now()}`,
        type: 'low_points',
        title: '⚠️ تنبيه: رصيدك أقل من 25 نقطة!',
        message: `انخفض رصيدك إلى ${newPoints} نقطة. تحتاج إلى 25 نقطة لكشف أرقام الزبائن القادمة. اشحن رصيدك الآن فوراً لتواصل العمل دون انقطاع.`,
        createdAt: Date.now(),
        read: false,
        points: newPoints
      };
      setNotifications((prev) => [lowNotif, ...prev]);
      setActivePushNotification(lowNotif);
      setIsLowPointsDismissed(false);
    }
  };

  // Handle creating request & alert craftsman if craft matches (with Bot auto-verification)
  const handleCreateRequest = (newReq: RequestItem) => {
    const isUrgentKeyword =
      settings.botAutoVerifyRequests !== false &&
      /عاجل|طوارئ|تسرب|تسريب|انقطاع|فوري|اليوم/.test(`${newReq.title} ${newReq.desc}`);
    const verifiedReq: RequestItem = {
      ...newReq,
      priority: newReq.priority || isUrgentKeyword
    };
    setRequests((prev) => [verifiedReq, ...prev]);
    pushLiveRequest(verifiedReq);
    triggerSync('تم فحص وبث طلبك مباشرة عبر البث المباشر ✓ حرفيو منطقتك سيتصلون بك قريباً');
    setCurrentTab('home');

    // Expand notification system: alert when new request matches craftsman's registered specialty
    if (newReq.craft === craftsmanCraft) {
      const matchNotif: AppNotification = {
        id: `notif_match_${newReq.id}_${Date.now()}`,
        type: 'matching_request',
        title: `🎯 طلب جديد يطابق تخصصك (${newReq.craft})!`,
        message: `${newReq.title} في ${newReq.wilaya} • كن أول حرفي يكشف الرقم ويتصل بالزبون فوراً!`,
        createdAt: Date.now(),
        read: false,
        relatedRequestId: newReq.id,
        relatedCraft: newReq.craft
      };
      setNotifications((prev) => [matchNotif, ...prev]);
      setActivePushNotification(matchNotif);
      setIsMatchingDismissed(false);
    }
  };

  // Simulated matching request generator for instant testing
  const handleTriggerSimulatedMatch = () => {
    const wilayas = ["16 الجزائر", "31 وهران", "25 قسنطينة", "19 سطيف", "09 البليدة", "35 بومرداس"];
    const randomWilaya = wilayas[Math.floor(Math.random() * wilayas.length)];

    const titlesByCraft: Record<string, string[]> = {
      'سباك': [
        'تسريب مياه ساخنة في الحمام يحتاج إصلاح فوري',
        'تركيب سخان ماء جديد وشبكة أنابيب نحاسية',
        'انسداد في مجرى المطبخ يحتاج تسليك عاجل'
      ],
      'كهربائي': [
        'انقطاع كهرباء في المحل التجاري وقواطع تسقط باستمرار',
        'تركيب سبوتات ليد ولوحة كهربائية جديدة',
        'تشخيص شورت كهربائي منزلي وإصلاح القاطع'
      ],
      'نجار': [
        'إصلاح باب خشب صلب معلق وتغيير القفل الداخلي',
        'تفصيل وتركيب خزانة ملابس عصرية MDF',
        'تركيب مطبخ عصري مجهز بالدرارية'
      ],
      'تبريد': [
        'مكيف كوندور 18000 BTU ينقط ماء ولا يبرد الغرفة',
        'شحن غاز فريون R410 مع تنظيف الفلاتر بالكامل',
        'صيانة مكيف مركزي للصالون التجاري'
      ],
      'دهان': [
        'دهان صالون وشقة كاملة بلون ساتيني عاجي مع معالجة الرطوبة',
        'تجديد دهان فيلا خارجية مع عزل مائي'
      ]
    };

    const craftTitles = titlesByCraft[craftsmanCraft] || [
      `طلب خدمة عاجلة في ${craftsmanCraft} بأسرع وقت`,
      `صيانة وتجهيز في تخصص ${craftsmanCraft}`
    ];
    const randomTitle = craftTitles[Math.floor(Math.random() * craftTitles.length)];

    const simReq: RequestItem = {
      id: `r_sim_${Date.now()}`,
      craft: craftsmanCraft,
      wilaya: randomWilaya,
      title: randomTitle,
      desc: `زبون يبحث عن حرفي معتمد في ${craftsmanCraft} اليوم في ${randomWilaya}. الدفع فوري نقداً عند إتمام العمل.`,
      phone: `055${Math.floor(1000000 + Math.random() * 9000000)}`,
      createdAt: Date.now(),
      priority: true,
      status: 'open'
    };

    setRequests((prev) => [simReq, ...prev]);

    const matchNotif: AppNotification = {
      id: `notif_match_${simReq.id}`,
      type: 'matching_request',
      title: `🎯 طلب جديد يطابق تخصصك (${craftsmanCraft})!`,
      message: `${simReq.title} في ${simReq.wilaya} • اضغط هنا لكشف رقم الزبون والتواصل فوراً!`,
      createdAt: Date.now(),
      read: false,
      relatedRequestId: simReq.id,
      relatedCraft: craftsmanCraft
    };

    setNotifications((prev) => [matchNotif, ...prev]);
    setActivePushNotification(matchNotif);
    setIsMatchingDismissed(false);
    triggerSync(`🎯 وصل طلب جديد يطابق تخصصك (${craftsmanCraft})!`);
  };

  // Handle completing order
  const handleToggleCompleteOrder = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? { ...r, status: r.status === 'completed' ? 'open' : 'completed' }
          : r
      )
    );
    triggerSync('تم تحديث حالة الطلب ✓');
  };

  const syncSingleRequestToSupabase = (updatedReq: RequestItem) => {
    setRequests((prev) => prev.map((r) => (r.id === updatedReq.id ? updatedReq : r)));
    setSelectedRequest((prev) => (prev && prev.id === updatedReq.id ? updatedReq : prev));
    saveDemandeToSupabase(updatedReq).catch(() => {});
  };

  const remindedAppointmentKeysRef = useRef<Set<string>>(new Set());

  const triggerInAppAppointmentReminder = (req: RequestItem, isManual = false) => {
    const reminderMins = Number(req.agreementReminderMinutes) || 30;
    const resolvedTs =
      resolveAgreementScheduledTimestamp(req.agreementTimeNote || '', req.agreementScheduledAt) ||
      Date.now() + reminderMins * 60 * 1000;
    const formattedTime = formatScheduledAppointmentAr(resolvedTs);
    const countdown = getAppointmentCountdownInfo(resolvedTs, reminderMins);
    const badgeLabel = countdown ? countdown.badgeText : `🔔 تذكير موعد (قبل ${reminderMins} د)`;
    const craftsmanLabel =
      req.agreedByCraftsmanName || currentUser?.name || req.revealedByCraftsmanName || `حرفي ${req.craft}`;

    playCraftsmanAlertSound();
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([220, 100, 220]);
      }
    } catch {
      // ignore
    }

    const notifTitle = `⏰ تذكير موعد (${req.craft} - ${req.wilaya}) — قبل ${reminderMins} دقيقة من موعد الإتفاق`;
    const notifMsg = `${badgeLabel} • الزبون: "${req.title}"${
      req.agreementTimeNote ? ` — الموعد: ${req.agreementTimeNote}` : ''
    } (${formattedTime}) • الحرفي: ${craftsmanLabel}`;

    const newAppNotif: AppNotification = {
      id: `notif_appt_${req.id}_${Date.now()}`,
      type: 'appointment_reminder',
      title: notifTitle,
      message: notifMsg,
      createdAt: Date.now(),
      read: false,
      relatedRequestId: req.id,
      relatedCraft: req.craft,
      scheduledAt: resolvedTs
    };

    setNotifications((prev) => [newAppNotif, ...prev]);
    setActivePushNotification({
      id: newAppNotif.id,
      title: notifTitle,
      message: notifMsg,
      type: 'appointment_reminder',
      relatedRequestId: req.id,
      calendarUrl: buildGoogleCalendarUrl(req, {
        canShowPhone: revealedSet.has(req.id)
      })
    });

    if (isManual) {
      triggerSync('🔔 تم إظهار إشعار (تذكير موعد) داخل التطبيق وإضافته لمركز الإشعارات!');
    }
  };

  // Automatic 30-minute pre-appointment in-app notification watcher
  useEffect(() => {
    const checkApproachingAppointments = () => {
      for (const req of requests) {
        const isReqAgreed = Boolean(
          req.isAgreed || req.agreedByCraftsmanName || req.status === 'in_progress'
        );
        if (!isReqAgreed || req.status === 'completed') continue;
        if (!req.agreementScheduledAt && !req.agreementTimeNote) continue;

        const scheduledTs = resolveAgreementScheduledTimestamp(
          req.agreementTimeNote || '',
          req.agreementScheduledAt
        );
        if (!scheduledTs) continue;

        const reminderMins = Number(req.agreementReminderMinutes) || 30;
        const info = getAppointmentCountdownInfo(scheduledTs, reminderMins);
        const reminderKey = `${req.id}_${scheduledTs}_${reminderMins}`;

        if (
          info &&
          (info.isApproaching || info.isDueNow) &&
          !remindedAppointmentKeysRef.current.has(reminderKey)
        ) {
          remindedAppointmentKeysRef.current.add(reminderKey);
          triggerInAppAppointmentReminder(req, false);
          break;
        }
      }
    };

    checkApproachingAppointments();
    const timer = setInterval(checkApproachingAppointments, 10000);
    return () => clearInterval(timer);
  }, [requests, currentUser]);

  const handleToggleAgreeRequest = (req: RequestItem) => {
    const currentlyAgreed = Boolean(
      req.isAgreed || req.agreedByCraftsmanName || req.status === 'in_progress'
    );
    const activeCraftsmanName = (
      currentUser?.name ||
      req.agreedByCraftsmanName ||
      req.revealedByCraftsmanName ||
      `حرفي ${req.craft}`
    ).trim();
    const nextAgreed = !currentlyAgreed;
    const defaultScheduledAt = nextAgreed
      ? req.agreementScheduledAt && req.agreementScheduledAt > 1000000000000
        ? req.agreementScheduledAt
        : resolveAgreementScheduledTimestamp(req.agreementTimeNote || '')
      : undefined;
    const defaultReminderMinutes = Number(req.agreementReminderMinutes) || 30;
    const updatedReq: RequestItem = {
      ...req,
      isAgreed: nextAgreed,
      revealedByCraftsmanName: req.revealedByCraftsmanName || activeCraftsmanName,
      agreedByCraftsmanName: nextAgreed ? activeCraftsmanName : '',
      agreementScheduledAt: defaultScheduledAt,
      agreementReminderMinutes: defaultReminderMinutes,
      cancellationReason: nextAgreed ? '' : req.cancellationReason || '',
      status: nextAgreed
        ? req.status === 'completed'
          ? 'completed'
          : 'in_progress'
        : 'open'
    };
    syncSingleRequestToSupabase(updatedReq);
    triggerSync(
      nextAgreed
        ? `🤝 تم تسجيل الإتفاق مع الزبون باسم (${activeCraftsmanName}) وتفعيل (تذكير موعد) قبل ${defaultReminderMinutes} دقيقة!`
        : '✓ تم إلغاء حالة الإتفاق وإعادة الطلب كمفتوح'
    );
  };

  const handleUpdateAgreementDetails = (
    req: RequestItem,
    details: {
      isAgreed: boolean;
      agreementTimeNote?: string;
      cancellationReason?: string;
      agreementScheduledAt?: number;
      agreementReminderMinutes?: number;
    }
  ) => {
    const activeCraftsmanName = (
      currentUser?.name ||
      req.agreedByCraftsmanName ||
      req.revealedByCraftsmanName ||
      `حرفي ${req.craft}`
    ).trim();
    const nextAgreed = Boolean(details.isAgreed);
    const cleanTimeNote = String(
      details.agreementTimeNote !== undefined
        ? details.agreementTimeNote
        : req.agreementTimeNote || ''
    )
      .trim()
      .slice(0, 200);
    const cleanCancelReason = String(
      details.cancellationReason !== undefined
        ? details.cancellationReason
        : req.cancellationReason || ''
    )
      .trim()
      .slice(0, 200);

    const resolvedScheduledAt = nextAgreed
      ? resolveAgreementScheduledTimestamp(
          cleanTimeNote,
          details.agreementScheduledAt !== undefined
            ? details.agreementScheduledAt
            : req.agreementScheduledAt
        ) || undefined
      : undefined;

    const resolvedReminderMinutes =
      typeof details.agreementReminderMinutes === 'number' && details.agreementReminderMinutes > 0
        ? details.agreementReminderMinutes
        : req.agreementReminderMinutes || 30;

    const updatedReq: RequestItem = {
      ...req,
      isAgreed: nextAgreed,
      revealedByCraftsmanName: req.revealedByCraftsmanName || activeCraftsmanName,
      agreedByCraftsmanName: nextAgreed ? activeCraftsmanName : '',
      agreementTimeNote: cleanTimeNote,
      agreementScheduledAt: resolvedScheduledAt,
      agreementReminderMinutes: resolvedReminderMinutes,
      cancellationReason: nextAgreed ? '' : cleanCancelReason,
      status: nextAgreed
        ? req.status === 'completed'
          ? 'completed'
          : 'in_progress'
        : 'open'
    };
    syncSingleRequestToSupabase(updatedReq);

    if (nextAgreed && resolvedScheduledAt) {
      const reminderKey = `${updatedReq.id}_${resolvedScheduledAt}_${resolvedReminderMinutes}`;
      remindedAppointmentKeysRef.current.delete(reminderKey);
      const countdown = getAppointmentCountdownInfo(resolvedScheduledAt, resolvedReminderMinutes);
      if (countdown && (countdown.isApproaching || countdown.isDueNow)) {
        remindedAppointmentKeysRef.current.add(reminderKey);
        setTimeout(() => triggerInAppAppointmentReminder(updatedReq, false), 350);
      }
    }

    if (nextAgreed && (cleanTimeNote || resolvedScheduledAt)) {
      const displayTime = cleanTimeNote || (resolvedScheduledAt ? formatScheduledAppointmentAr(resolvedScheduledAt) : '');
      triggerSync(
        `⏰ تم حفظ موعد الإتفاق (${displayTime}) وتفعيل (تذكير موعد) داخل التطبيق قبل ${resolvedReminderMinutes} دقيقة!`
      );
    } else if (!nextAgreed && cleanCancelReason) {
      triggerSync(`⚠️ تم إلغاء الإتفاق وحفظ السبب (${cleanCancelReason})`);
    } else if (nextAgreed) {
      triggerSync(`🤝 تم تأكيد الإتفاق مع الزبون باسم (${activeCraftsmanName})!`);
    } else {
      triggerSync('✓ تم تحديث حالة الإتفاق بنجاح');
    }
  };

  // Handle craftsman registration
  const handleRegisterCraftsman = (user: CraftsmanUser) => {
    setCurrentUser(user);
    setCraftsmen((prev) => {
      const exists = prev.find((c) => c.id === user.id);
      if (exists) {
        return prev.map((c) => (c.id === user.id ? user : c));
      }
      return [user, ...prev];
    });

    // Ensure there is a chat thread with admin
    setChatThreads((prev) => {
      const exists = prev.find((t) => t.craftsmanId === user.id);
      if (exists) return prev;
      const newThread: ChatThread = {
        id: `adm_${user.id}`,
        craftsmanId: user.id,
        craftsmanName: user.name,
        craft: user.craft,
        phone: user.phone,
        messages: [
          {
            id: `m0_${user.id}`,
            sender: 'admin',
            text: `أهلاً بك يا ${user.name}! مرحباً بك في عائلة خدّام DZ. شات الدعم المباشر بينك وبين الإدارة جاهز دائماً لأي استفسار.`,
            ts: Date.now()
          }
        ]
      };
      return [newThread, ...prev];
    });

    triggerSync('تم تسجيل حسابك بنجاح وحفظه محلياً ✓');
  };

  // Handle craftsman logout without blocking window.confirm
  const handleLogout = () => {
    setCurrentUser(null);
    triggerSync('تم تسجيل الخروج من حساب الحرفي ✓');
  };

  // Handle submitting receipt with AI Bot auto-credit
  const handleSubmitReceipt = (recharge: PendingRecharge, autoCredit: boolean = false) => {
    if (autoCredit || recharge.autoApproved) {
      const approvedRecharge: PendingRecharge = {
        ...recharge,
        status: 'approved',
        autoApproved: true
      };
      setPendingRecharges((prev) => [approvedRecharge, ...prev]);

      // Credit points immediately to user's balance
      setPoints((prev) => prev + recharge.pts);

      // Record in point activity logs
      const serviceName = recharge.analysis?.serviceNameAr || 'وصل إلكتروني';
      const newLog: PointLog = {
        id: `log_rec_${Date.now()}`,
        type: 'recharge',
        pts: recharge.pts,
        description: `شحن فوري بالبوت (${serviceName} - ${recharge.amount.toLocaleString('fr-FR')} دج)`,
        createdAt: Date.now()
      };
      setPointLogs((prev) => [newLog, ...prev]);

      triggerSync(`تم التحقق من الوصل وشحن +${recharge.pts} نقطة إلى رصيدك بنجاح 🎉`);
    } else {
      setPendingRecharges((prev) => [recharge, ...prev]);

      // Add notification in notification center
      const newNotif: AppNotification = {
        id: `notif_rec_${Date.now()}`,
        type: 'system',
        title: '📄 تم إرسال وصل الشحن إلى الإدارة',
        message: `تم استلام وصل الشحن بمبلغ ${recharge.amount.toLocaleString('fr-FR')} دج (${recharge.receiptName}). الإدارة تفحصه الآن وستضاف +${recharge.pts} نقطة لرصيدك فوراً.`,
        createdAt: Date.now(),
        read: false
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Record in admin chat thread
      const userThreadId = currentUser ? `adm_${currentUser.id}` : (chatThreads[0]?.id || 'th_1');
      const craftMsg: ChatMessage = {
        id: `msg_rec_${Date.now()}`,
        sender: 'craftsman',
        text: `📄 أهلاً إدارة المنصة، أرسلت وصل تحويل بمبلغ ${recharge.amount.toLocaleString('fr-FR')} دج (${recharge.receiptName}) للمراجعة وتفعيل +${recharge.pts} نقطة.`,
        ts: Date.now()
      };
      const adminAck: ChatMessage = {
        id: `msg_ack_${Date.now() + 1}`,
        sender: 'admin',
        text: `✓ مرحباً بك! استلمنا وصل الشحن بمبلغ ${recharge.amount.toLocaleString('fr-FR')} دج، فريق الإدارة يفحصه وسنقوم باعتماده وتفعيل نقاطك مباشرة.`,
        ts: Date.now() + 500
      };
      setChatThreads((prev) =>
        prev.map((th) =>
          th.id === userThreadId
            ? { ...th, messages: [...th.messages, craftMsg, adminAck] }
            : th
        )
      );

      triggerSync('تم إرسال الوصل للإدارة بنجاح ✓ سيتم التحقق والشحن');
    }
  };

  // Handle successful electronic payment via Chargily Pay
  const handleChargilySuccess = (amount: number, pts: number, txnId: string, notes: string) => {
    // Credit points immediately and persist to Supabase
    setPoints((prev) => {
      const nextPts = prev + pts;
      const targetId = currentUser?.id || "cp1";
      savePointsToSupabase(targetId, nextPts).catch(() => {});
      if (currentUser) {
        const updatedCr = { ...currentUser, points: nextPts };
        setCurrentUser(updatedCr);
        saveArtisanToSupabase(updatedCr).catch(() => {});
      }
      return nextPts;
    });

    const approvedRecharge: PendingRecharge = {
      id: `rec_chg_${Date.now()}`,
      user: currentUser?.name || 'حرفي خدام',
      phone: currentUser?.phone || '0550 12 34 56',
      amount,
      pts,
      receiptName: `chargily_pay_${txnId}.png`,
      status: 'approved',
      autoApproved: true,
      createdAt: Date.now(),
      analysis: {
        paymentService: 'chargily',
        serviceNameAr: 'شارجيلي باي (Chargily Pay)',
        amount,
        calculatedPoints: pts,
        transactionId: txnId,
        senderName: currentUser?.name || 'حرفي معتمد',
        senderRipOrPhone: currentUser?.phone || '0550 12 34 56',
        recipientRip: 'KHADAM DZ CHARGILY GATEWAY',
        dateStr: new Date().toLocaleDateString('fr-DZ'),
        status: 'success',
        isValidReceipt: true,
        confidence: 1.0,
        botNotes: notes
      }
    };

    setPendingRecharges((prev) => [approvedRecharge, ...prev]);

    const newLog: PointLog = {
      id: `log_chg_${Date.now()}`,
      type: 'recharge',
      pts,
      description: `شحن فوري بالبطاقة الذهبية/CIB عبر Chargily Pay (${amount.toLocaleString('fr-FR')} دج)`,
      createdAt: Date.now()
    };
    setPointLogs((prev) => [newLog, ...prev]);

    // Add notification
    const newNotif: AppNotification = {
      id: `notif_chg_${Date.now()}`,
      type: 'system',
      title: '⚡ شحن فوري ناجح عبر Chargily Pay',
      message: `تم شحن +${pts} نقطة إلى رصيدك فوراً بمبلغ ${amount.toLocaleString('fr-FR')} دج عبر البطاقة الذهبية / CIB (معاملة #${txnId}).`,
      createdAt: Date.now(),
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);

    triggerSync(`تم الدفع عبر Chargily بنجاح وشحن +${pts} نقطة إلى رصيدك 🎉`);
  };

  // Direct Admin Points Grant or Deduct
  const handleAdminAdjustPoints = (delta: number, reason: string) => {
    setPoints((prev) => {
      const nextPts = Math.max(0, prev + delta);
      const targetId = currentUser?.id || "cp1";
      savePointsToSupabase(targetId, nextPts).catch(() => {});
      if (currentUser) {
        const updatedCr = { ...currentUser, points: nextPts };
        setCurrentUser(updatedCr);
        saveArtisanToSupabase(updatedCr).catch(() => {});
      }
      return nextPts;
    });
    const newLog: PointLog = {
      id: `log_adm_${Date.now()}`,
      type: delta >= 0 ? 'bonus' : 'reveal',
      pts: delta,
      description: reason,
      createdAt: Date.now()
    };
    setPointLogs((prev) => [newLog, ...prev]);
    triggerSync(`تم تعديل الرصيد (${delta > 0 ? `+${delta}` : delta} نقطة) من الإدارة ✓`);
  };

  // Handle Admin Approving Recharge
  const handleApproveRecharge = (id: string) => {
    const target = pendingRecharges.find((p) => p.id === id);
    if (!target || target.status === 'approved') return;

    setPendingRecharges((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p))
    );

    // Credit points and persist to Supabase
    setPoints((prev) => {
      const nextPts = prev + target.pts;
      const targetId = currentUser?.id || "cp1";
      savePointsToSupabase(targetId, nextPts).catch(() => {});
      if (currentUser) {
        const updatedCr = { ...currentUser, points: nextPts };
        setCurrentUser(updatedCr);
        saveArtisanToSupabase(updatedCr).catch(() => {});
      }
      return nextPts;
    });

    // Add to points log
    const newLog: PointLog = {
      id: `log_rec_${Date.now()}`,
      type: 'recharge',
      pts: target.pts,
      description: `شحن رصيد معتمد (${target.amount} دج)`,
      createdAt: Date.now()
    };
    setPointLogs((prev) => [newLog, ...prev]);

    triggerSync(`تم اعتماد الوصل وشحن +${target.pts} نقطة بنجاح ✓`);
  };

  // Continuous 24/7 Auto-Approve Receipt Bot Watcher
  useEffect(() => {
    if (settings.botAutoApproveReceipts === false) return;
    const autoBotInterval = setInterval(() => {
      setPendingRecharges((prev) => {
        const verifiedPending = prev.filter(
          (r) =>
            r.status === pending &&
            r.analysis?.isValidReceipt &&
            (r.analysis?.confidence ?? 0) >= 0.85 &&
            r.analysis?.transactionId
        );
        if (verifiedPending.length === 0) return prev;
        const addedPts = verifiedPending.reduce((acc, r) => acc + (r.pts || 0), 0);
        if (addedPts > 0) {
          setPoints((curPts) => {
            const nextPts = curPts + addedPts;
            const targetId = currentUser?.id || cp1;
            savePointsToSupabase(targetId, nextPts).catch(() => {});
            if (currentUser) {
              const updatedCr = { ...currentUser, points: nextPts };
              setCurrentUser(updatedCr);
              saveArtisanToSupabase(updatedCr).catch(() => {});
            }
            return nextPts;
          });
        }
        return prev.map((r) =>
          verifiedPending.some((vp) => vp.id === r.id)
            ? { ...r, status: approved, autoApproved: true }
            : r
        );
      });
    }, 8000);
    return () => clearInterval(autoBotInterval);
  }, [settings.botAutoApproveReceipts, currentUser]);

  // Approve all pending recharges via Bot / Admin
  const handleApproveAllRecharges = () => {
    const pendingList = pendingRecharges.filter((p) => p.status === 'pending');
    if (pendingList.length === 0) {
      triggerSync('جميع الوصولات معتمدة مسبقاً ✓');
      return;
    }
    const totalPts = pendingList.reduce((acc, item) => acc + item.pts, 0);
    setPendingRecharges((prev) =>
      prev.map((p) => (p.status === 'pending' ? { ...p, status: 'approved', autoApproved: true } : p))
    );
    setPoints((prev) => {
      const nextPts = prev + totalPts;
      const targetId = currentUser?.id || "cp1";
      savePointsToSupabase(targetId, nextPts).catch(() => {});
      if (currentUser) {
        const updatedCr = { ...currentUser, points: nextPts };
        setCurrentUser(updatedCr);
        saveArtisanToSupabase(updatedCr).catch(() => {});
      }
      return nextPts;
    });
    const newLog: PointLog = {
      id: `log_rec_all_${Date.now()}`,
      type: 'recharge',
      pts: totalPts,
      description: `اعتماد جماعي بالبوت لـ ${pendingList.length} وصولات شحن`,
      createdAt: Date.now()
    };
    setPointLogs((prev) => [newLog, ...prev]);
    triggerSync(`⚡ اعتمد البوت ${pendingList.length} وصولات وشحن +${totalPts} نقطة!`);
  };

  // Handle Admin Rejecting Recharge
  const handleRejectRecharge = (id: string) => {
    setPendingRecharges((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'rejected' } : p))
    );
    triggerSync('تم رفض طلب الشحن');
  };

  // Craftsman sending chat message to admin + Smart AI Bot Auto-Reply
  const handleCraftsmanSendMessage = async (text: string) => {
    const threadId = currentUser ? `adm_${currentUser.id}` : chatThreads[0]?.id;
    if (!threadId) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'craftsman',
      text,
      ts: Date.now()
    };

    setChatThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, newMsg] } : t
      )
    );
    triggerSync('تم إرسال الرسالة إلى إدارة خدام ديزاد ✓');

    // If Bot Auto-Reply is enabled, trigger intelligent response & actions
    if (settings.botAutoReplyChat !== false) {
      const pendingCount = pendingRecharges.filter((p) => p.status === 'pending').length;

      // If craftsman asks to verify pending receipt and Bot Auto-Approve is on, approve it!
      if (
        settings.botAutoApproveReceipts !== false &&
        pendingCount > 0 &&
        /وصل|تفعيل|معلق|شحن/.test(text)
      ) {
        handleApproveAllRecharges();
      }

      try {
        const liveBotRes = await runLiveSupabaseBotReply({
          message: text,
          craftsmanId: currentUser?.id || 'cp1',
          craftsmanName: currentUser?.name || chatThreads[0]?.craftsmanName || 'حرفي خدام',
          craftsmanCraft,
          craftsmanWilaya: currentUser?.wilaya || '09 البليدة',
          currentPoints: points,
          pendingRecharges
        });
        if (liveBotRes.pointsAwarded > 0) {
          setPendingRecharges((prev) =>
            prev.map((r) =>
              liveBotRes.approvedRechargeIds.includes(r.id)
                ? { ...r, status: 'approved', autoApproved: true }
                : r
            )
          );
          setPoints(liveBotRes.newBalance);
        }
        const botMsg: ChatMessage = {
          id: `m_bot_${Date.now()}`,
          sender: 'bot',
          text: liveBotRes.reply,
          ts: Date.now()
        };
        setChatThreads((prev) =>
          prev.map((t) =>
            t.id === threadId ? { ...t, messages: [...t.messages, botMsg] } : t
          )
        );
      } catch {
        const fallbackBotMsg: ChatMessage = {
          id: `m_bot_${Date.now()}`,
          sender: 'bot',
          text: `🤖 [بوت الإدارة الذكي]: تم استلام رسالتك بنجاح! رصيدك الحالي (${points} نقطة)، والبوت مفوض لخدمتك وتفعيل الوصولات على مدار الساعة ⚡.`,
          ts: Date.now()
        };
        setChatThreads((prev) =>
          prev.map((t) =>
            t.id === threadId ? { ...t, messages: [...t.messages, fallbackBotMsg] } : t
          )
        );
      }
    }
  };

  // Admin or Bot replying in chat
  const handleAdminReplyChat = (threadId: string, text: string, sender: 'admin' | 'bot' = 'admin') => {
    const newMsg: ChatMessage = {
      id: `m_${sender}_${Date.now()}`,
      sender,
      text,
      ts: Date.now()
    };

    setChatThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, newMsg] } : t
      )
    );
    triggerSync(sender === 'bot' ? '🤖 تم إرسال رد البوت الذكي ✓' : 'تم إرسال رد الإدارة ✓');
  };

  // Bot Auto-Reply to All Craftsman Chat Threads
  const handleBotReplyAllChats = () => {
    const now = Date.now();
    setChatThreads((prev) =>
      prev.map((t, idx) => ({
        ...t,
        messages: [
          ...t.messages,
          {
            id: `m_bot_all_${now}_${idx}`,
            sender: 'bot',
            text: `🤖 [بوت الإدارة الذكي]: مرحباً يا ${t.craftsmanName}! تم تحديث حالة حسابك في تخصص (${t.craft}) وتفعيل التنبيهات الفورية لطلبات ولايتك. نحن في خدمتك 24/7 ⚡.`,
            ts: now
          }
        ]
      }))
    );
    triggerSync('🤖 قام البوت بالرد التلقائي على جميع الحرفيين ✓');
  };

  // Handle Rating submission
  const handleSubmitRating = (rating: RatingItem) => {
    setRatings((prev) => [rating, ...prev]);
    triggerSync('شكراً لك، تم حفظ تقييمك للحرفي بنجاح ✓');
  };

  // Handle Complaint submission (with Bot Auto-Warn)
  const handleSubmitComplaint = (complaint: ComplaintItem) => {
    setComplaints((prev) => [complaint, ...prev]);
    if (settings.botComplaintAutoWarn !== false) {
      const warnMsg: ChatMessage = {
        id: `m_warn_${Date.now()}`,
        sender: 'bot',
        text: `⚠️ [تنبيه آلي من بوت المراقبة]: تم تسجيل ملاحظة/شكوى من زبون بخصوص (${complaint.craftsmanCraft}): "${complaint.text}". يرجى الالتزام بالمواعيد وجودة العمل لتفادي خصم النقاط.`,
        ts: Date.now()
      };
      setChatThreads((prev) =>
        prev.map((t, i) => (i === 0 ? { ...t, messages: [...t.messages, warnMsg] } : t))
      );
    }
    triggerSync('تم تسجيل الشكوى وفحصها عبر البوت للمتابعة الفورية');
  };

  // Admin / Bot Resolve Complaint
  const handleResolveComplaint = (id: string, action: 'resolve' | 'warn' | 'penalty') => {
    const target = complaints.find((c) => c.id === id);
    if (!target) return;

    if (action === 'resolve') {
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'resolved' } : c))
      );
    } else if (action === 'warn') {
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'warned' } : c))
      );
      const warnMsg: ChatMessage = {
        id: `m_adm_warn_${Date.now()}`,
        sender: 'bot',
        text: `🤖⚠️ [إنذار رسمي من الإدارة والبوت]: تنبيه للحرفي ${target.craftsmanName} بخصوص بلاغ الزبون: "${target.text}". يرجى تسوية الأمر فوراً.`,
        ts: Date.now()
      };
      setChatThreads((prev) =>
        prev.map((t, i) => (i === 0 ? { ...t, messages: [...t.messages, warnMsg] } : t))
      );
    } else if (action === 'penalty') {
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'warned' } : c))
      );
      handleAdminAdjustPoints(-25, `غرامة مخالفة إدارية (${target.craftsmanName})`);
    }
  };

  // Admin / Bot Request Controls
  const handleToggleRequestPriority = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, priority: !r.priority };
          saveDemandeToSupabase(updated).catch(() => {});
          return updated;
        }
        return r;
      })
    );
  };

  const handleChangeRequestStatus = (id: string, status: 'open' | 'in_progress' | 'completed') => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, status };
          saveDemandeToSupabase(updated).catch(() => {});
          return updated;
        }
        return r;
      })
    );
  };

  const handleAdminForceRevealRequest = (id: string) => {
    setRevealedSet((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    triggerSync('🔓 تم فتح رقم الزبون مجاناً بأمر الإدارة ✓');
  };

  const handleBotGenerateRequests = () => {
    const now = Date.now();
    const generated: RequestItem[] = [
      {
        id: `req_dz_1_${now}`,
        craft: craftsmanCraft,
        wilaya: '16 الجزائر',
        title: `طلب عاجل موثق بالبوت في تخصص ${craftsmanCraft}`,
        desc: `زبون موثق الهوية والرقم عبر البوت الذكي يحتاج تدخل سريع في ${craftsmanCraft} اليوم. الدفع نقداً فور الإنجاز.`,
        phone: `055${Math.floor(1000000 + Math.random() * 8999999)}`,
        createdAt: now,
        priority: true,
        status: 'open'
      },
      {
        id: `req_dz_2_${now}`,
        craft: 'كهربائي',
        wilaya: '31 وهران',
        title: 'تركيب لوحة قواطع كهربائية وإضاءة LED لفيلا جديدة',
        desc: 'الزبون يبحث عن كهربائي محترف لتركيب شبكة الإضاءة والقواطع مع الضمان.',
        phone: `066${Math.floor(1000000 + Math.random() * 8999999)}`,
        createdAt: now - 60000,
        priority: true,
        status: 'open'
      },
      {
        id: `req_dz_3_${now}`,
        craft: 'تبريد',
        wilaya: '25 قسنطينة',
        title: 'صيانة وشحن غاز مكيف هواء 18000 BTU',
        desc: 'المكيف يحتاج فحص تسريب وشحن غاز فريون R410 بشكل مستعجل.',
        phone: `077${Math.floor(1000000 + Math.random() * 8999999)}`,
        createdAt: now - 120000,
        priority: false,
        status: 'open'
      }
    ];
    setRequests((prev) => [...generated, ...prev]);
    generated.forEach((reqItem) => { saveDemandeToSupabase(reqItem).catch(() => {}); });
    triggerSync('🎯 قام البوت الذكي بنشر 3 طلبات زبائن موثقة وحفظها في Supabase!');
  };

  // Admin Craftsmen Controls
  const handleUpdateCraftsman = (updated: CraftsmanUser) => {
    setCraftsmen((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    saveArtisanToSupabase(updated).catch(() => {});
    if (typeof updated.points === 'number') {
      savePointsToSupabase(updated.id, updated.points).catch(() => {});
    }
    if (currentUser && currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const handleDeleteCraftsman = (id: string) => {
    setCraftsmen((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddCraftsman = (newC: CraftsmanUser) => {
    setCraftsmen((prev) => [newC, ...prev]);
  };

  // Handle Broadcast Notification
  const handleSendBroadcast = (newBroadcast: BroadcastNotification) => {
    setBroadcasts((prev) => [newBroadcast, ...prev]);
    pushLiveBroadcast(newBroadcast);

    // Append as broadcast message to all craftsmen chat threads
    const broadcastChatMsg: ChatMessage = {
      id: `bc_msg_${Date.now()}`,
      sender: 'admin',
      text: `📢 [إشعار عام - بث المنصة]: ${newBroadcast.title}\n${newBroadcast.message}`,
      ts: Date.now()
    };

    setChatThreads((prev) =>
      prev.map((thread) => ({
        ...thread,
        messages: [...thread.messages, broadcastChatMsg]
      }))
    );

    // Trigger the simulated Push Notification toast popup
    setActivePushNotification(newBroadcast);

    triggerSync(`تم بث الإشعار بنجاح لـ ${newBroadcast.recipientCount} حرفي ✓`);
  };

  const handleDeleteBroadcast = (id: string) => {
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
    triggerSync('تم حذف الإشعار من السجل');
  };

  // Reset demo data
  const handleResetDemoData = () => {
    const bonus = settings.welcomeBonus ?? 50;
    setPoints(bonus);
    setRevealedSet(new Set());
    setRequests(INITIAL_REQUESTS);
    setPendingRecharges(INITIAL_PENDING_RECHARGES);
    setComplaints(INITIAL_COMPLAINTS);
    setBroadcasts(INITIAL_BROADCASTS);
    setPointLogs([
      {
        id: 'init_gift_reset',
        type: 'bonus',
        pts: bonus,
        description: `تصفير الحساب - ${bonus} نقطة هدية تسجيل جديدة`,
        createdAt: Date.now()
      }
    ]);
    triggerSync(`تم تصفير البيانات ومنح ${bonus} نقطة هدية مجانية ✓`);
    setIsAdminDashboardOpen(false);
  };

  // Get active chat thread messages for current user
  const activeCraftsmanThread = currentUser
    ? chatThreads.find((t) => t.craftsmanId === currentUser.id) || chatThreads[0]
    : chatThreads[0];

  // Unread notifications count
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Latest matching unrevealed request for craftsman
  const latestMatchingUnrevealedRequest = requests.find(
    (r) => r.craft === craftsmanCraft && !revealedSet.has(r.id) && r.status !== 'completed'
  ) || null;

  return (
    <div
      dir="rtl"
      className={`min-h-screen flex justify-center transition-colors duration-200 select-none ${
        isDark ? 'bg-[#080a12] text-white' : 'bg-gray-200 text-black'
      }`}
    >
      {/* Mobile Shell / Responsive Container matching Khadam DZ */}
      <div
        className={`w-full max-w-[430px] min-h-screen relative flex flex-col pb-20 border-x transition-colors ${
          isDark ? 'bg-[#0e111c] border-gray-800 text-white' : 'bg-white border-gray-300 shadow-xl text-black'
        }`}
      >
        {/* 24/7 Online Keep-Alive & Live Broadcast Header with Wake Lock, Admin & PWA Install */}
        {null}

        {/* Top Navbar with Bell Notifications, Low Points warning & Direct Admin Button */}
        <Navbar
          userMode={userMode}
          setUserMode={setUserMode}
          points={points}
          isDark={isDark}
          toggleTheme={() => setIsDark(!isDark)}
          onOpenAdminLogin={() => { if (!isAdminDashboardOpen) setIsAdminLoginOpen(true); }}
          onNavigatePoints={() => setCurrentTab('points')}
          unreadCount={unreadNotificationsCount}
          onOpenNotifications={() => setIsNotificationsModalOpen(true)}
          onOpenPromo={() => setIsPromoModalOpen(true)}
          pendingAdminCount={
            pendingRecharges.filter((p) => p.status === 'pending').length +
            complaints.filter((c) => c.status !== 'resolved').length
          }
        />

        {/* Top Alert Banner for Low Points (<25) and Matching Craft Requests */}
        <TopAlertBanner
          points={points}
          craftsmanCraft={craftsmanCraft}
          matchingRequest={latestMatchingUnrevealedRequest}
          onOpenRecharge={() => {
            setReceiptInitialPkg({ amount: 2000, pts: 210 });
            setIsUploadReceiptOpen(true);
          }}
          onViewMatchingRequest={(req) => setSelectedRequest(req)}
          onDismissLowPoints={() => setIsLowPointsDismissed(true)}
          onDismissMatching={() => setIsMatchingDismissed(true)}
          isLowPointsDismissed={isLowPointsDismissed}
          isMatchingDismissed={isMatchingDismissed}
          isDark={isDark}
        />

        {/* View Switcher based on currentTab */}
        <main className="flex-1">
          {currentTab === 'home' && (
            <HomeFeed
              requests={requests}
              revealedSet={revealedSet}
              onRevealPhone={handleRevealPhone}
              onSelectRequest={(req) => setSelectedRequest(req)}
              onToggleAgreeRequest={handleToggleAgreeRequest}
              onUpdateAgreementDetails={handleUpdateAgreementDetails}
              onTriggerAppointmentReminderNow={(req) => triggerInAppAppointmentReminder(req, true)}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenPromoModal={() => setIsPromoModalOpen(true)}
              onOpenPlayStore={() => setIsPlayStoreModalOpen(true)}
              userMode={userMode}
              isDark={isDark}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersView
              userMode={userMode}
              requests={requests}
              revealedSet={revealedSet}
              ratings={ratings}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenRatingModal={(req) => setRatingTargetRequest(req)}
              onOpenComplaintModal={(req) => setComplaintTargetRequest(req)}
              onToggleCompleteOrder={handleToggleCompleteOrder}
              isDark={isDark}
            />
          )}

          {currentTab === 'points' && (
            <PointsView
              points={points}
              pendingRecharges={pendingRecharges}
              pointLogs={pointLogs}
              onOpenUploadReceipt={(pkg) => {
                setReceiptInitialPkg(pkg || null);
                setIsUploadReceiptOpen(true);
              }}
              onOpenChargilyCheckout={(pkg) => {
                setChargilyInitialPkg(pkg || null);
                setIsChargilyOpen(true);
              }}
              isDark={isDark}
            />
          )}

          {currentTab === 'account' && (
            <AccountView
              currentUser={currentUser}
              onRegisterCraftsman={handleRegisterCraftsman}
              onLogout={handleLogout}
              points={points}
              revealedCount={revealedSet.size}
              onOpenAdminChat={() => setIsAdminChatOpen(true)}
              onOpenAdminDashboard={() => { if (!isAdminDashboardOpen) setIsAdminLoginOpen(true); }}
              userMode={userMode}
              setUserMode={setUserMode}
              onOpenPlayStore={() => setIsPlayStoreModalOpen(true)}
              onOpenNotifications={() => setIsNotificationsModalOpen(true)}
              onOpenPromoModal={() => setIsPromoModalOpen(true)}
              onTriggerSimulatedMatch={handleTriggerSimulatedMatch}
              isDark={isDark}
            />
          )}
        </main>

        {/* Top Simulated Push Notification Toast */}
        <PushNotificationToast
          notification={activePushNotification}
          onDismiss={() => setActivePushNotification(null)}
          onActionClick={() => {
            if (activePushNotification) {
              const notifType = (activePushNotification as any).type;
              if (notifType === 'low_points') {
                setCurrentTab('points');
                setReceiptInitialPkg({ amount: 2000, pts: 210 });
                setIsUploadReceiptOpen(true);
              } else if ((notifType === 'matching_request' || notifType === 'appointment_reminder') && (activePushNotification as any).relatedRequestId) {
                const targetReq = requests.find((r) => r.id === (activePushNotification as any).relatedRequestId);
                if (targetReq) {
                  setSelectedRequest(targetReq);
                } else {
                  setCurrentTab('home');
                }
              } else {
                setCurrentTab('orders');
              }
            }
            setActivePushNotification(null);
          }}
          onAddToCalendarClick={() => {
            const targetReqId = (activePushNotification as any)?.relatedRequestId;
            if (targetReqId) {
              const found = requests.find((r) => r.id === targetReqId);
              if (found) {
                downloadAppointmentIcsFile(found);
                triggerSync('📅 تم تحميل ملف الموعد (.ics) لإضافته إلى تقويم الهاتف!');
              }
            }
          }}
          isDark={isDark}
        />

        {/* Bottom Floating Sync Banner */}
        <BotSyncBanner
          message={syncMessage}
          onDismiss={() => setSyncMessage(null)}
          isDark={isDark}
        />

        {/* Bottom Sticky Navigation */}
        <BottomNav
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isDark={isDark}
          ordersBadgeCount={userMode === 'craftsman' ? revealedSet.size : requests.filter((r) => r.isCustomerOwn).length}
          points={points}
        />

        {/* Modals */}
        <CreateRequestModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateRequest={handleCreateRequest}
          isDark={isDark}
        />

        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          isRevealed={selectedRequest ? revealedSet.has(selectedRequest.id) : false}
          isRegisteredCraftsman={Boolean(currentUser)}
          craftsmanName={currentUser?.name || ''}
          onRevealPhone={(req) => handleRevealPhone(req)}
          onToggleAgreeRequest={handleToggleAgreeRequest}
          onUpdateAgreementDetails={handleUpdateAgreementDetails}
          onTriggerAppointmentReminderNow={(req) => triggerInAppAppointmentReminder(req, true)}
          isDark={isDark}
        />

        <AdminChatModal
          isOpen={isAdminChatOpen}
          onClose={() => setIsAdminChatOpen(false)}
          currentUser={currentUser}
          messages={activeCraftsmanThread?.messages || []}
          onSendMessage={handleCraftsmanSendMessage}
          onOpenUploadReceipt={() => {
            setReceiptInitialPkg(null);
            setIsUploadReceiptOpen(true);
          }}
          onOpenAdminDashboard={() => { if (!isAdminDashboardOpen) setIsAdminLoginOpen(true); }}
          isDark={isDark}
        />

        <UploadReceiptModal
          isOpen={isUploadReceiptOpen}
          onClose={() => setIsUploadReceiptOpen(false)}
          initialPackage={receiptInitialPkg}
          userName={currentUser?.name || ''}
          userPhone={currentUser?.phone || ''}
          onSubmitReceipt={handleSubmitReceipt}
          isDark={isDark}
        />

        <RatingModal
          isOpen={Boolean(ratingTargetRequest)}
          onClose={() => setRatingTargetRequest(null)}
          request={ratingTargetRequest}
          onSubmitRating={handleSubmitRating}
          isDark={isDark}
        />

        <ComplaintModal
          isOpen={Boolean(complaintTargetRequest)}
          onClose={() => setComplaintTargetRequest(null)}
          request={complaintTargetRequest}
          onSubmitComplaint={handleSubmitComplaint}
          isDark={isDark}
        />

        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          correctPass={settings.adminPass}
          onSuccess={() => {
            setIsAdminLoginOpen(false);
            setIsAdminDashboardOpen(true);
          }}
          isDark={isDark}
        />

        <AdminDashboardModal
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
          points={points}
          onAdminAdjustPoints={handleAdminAdjustPoints}
          pendingRecharges={pendingRecharges}
          onApproveRecharge={handleApproveRecharge}
          onRejectRecharge={handleRejectRecharge}
          onApproveAllRecharges={handleApproveAllRecharges}
          chatThreads={chatThreads}
          onAdminReplyChat={handleAdminReplyChat}
          onBotReplyAllChats={handleBotReplyAllChats}
          complaints={complaints}
          onResolveComplaint={handleResolveComplaint}
          onDeleteComplaint={(id) => setComplaints((prev) => prev.filter((c) => c.id !== id))}
          requests={requests}
          onCreateAdminRequest={handleCreateRequest}
          onToggleRequestPriority={handleToggleRequestPriority}
          onChangeRequestStatus={handleChangeRequestStatus}
          onAdminForceRevealRequest={handleAdminForceRevealRequest}
          onDeleteRequest={(id) => setRequests((prev) => prev.filter((r) => r.id !== id))}
          onBotGenerateRequests={handleBotGenerateRequests}
          craftsmen={craftsmen}
          onUpdateCraftsman={handleUpdateCraftsman}
          onDeleteCraftsman={handleDeleteCraftsman}
          onAddCraftsman={handleAddCraftsman}
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings(newSettings)}
          onResetDemoData={handleResetDemoData}
          broadcasts={broadcasts}
          onSendBroadcast={handleSendBroadcast}
          onDeleteBroadcast={handleDeleteBroadcast}
          onOpenPlayStore={() => setIsPlayStoreModalOpen(true)}
          isDark={isDark}
        />

        <PlayStoreModal
          isOpen={isPlayStoreModalOpen}
          onClose={() => setIsPlayStoreModalOpen(false)}
          isDark={isDark}
        />

        {/* App Advertising, Ready Promo Posts & Official Link Share Modal */}
        <AppSharePromoModal
          isOpen={isPromoModalOpen}
          onClose={() => setIsPromoModalOpen(false)}
          onOpenPlayStore={() => setIsPlayStoreModalOpen(true)}
          isDark={isDark}
        />

        {/* Chargily Pay Gateway Checkout Modal (Edahabia & CIB) */}
        <ChargilyCheckoutModal
          isOpen={isChargilyOpen}
          onClose={() => setIsChargilyOpen(false)}
          initialPackage={chargilyInitialPkg}
          userName={currentUser?.name || ''}
          userPhone={currentUser?.phone || ''}
          onPaymentSuccess={handleChargilySuccess}
          isDark={isDark}
        />

        {/* Notifications & Low Balance Center Modal */}
        <NotificationsModal
          isOpen={isNotificationsModalOpen}
          onClose={() => setIsNotificationsModalOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
          onClearAll={() => setNotifications([])}
          onSelectNotification={(notif) => {
            setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
            if ((notif.type === 'matching_request' || notif.type === 'appointment_reminder') && notif.relatedRequestId) {
              const found = requests.find((r) => r.id === notif.relatedRequestId);
              if (found) {
                setSelectedRequest(found);
              } else {
                setCurrentTab('home');
              }
            } else if (notif.type === 'low_points') {
              setCurrentTab('points');
              setReceiptInitialPkg({ amount: 2000, pts: 200 });
              setIsUploadReceiptOpen(true);
            }
            setIsNotificationsModalOpen(false);
          }}
          onAddAppointmentToCalendar={(notif) => {
            if (notif.relatedRequestId) {
              const found = requests.find((r) => r.id === notif.relatedRequestId);
              if (found) {
                downloadAppointmentIcsFile(found);
                triggerSync('📅 تم تحميل ملف الموعد (.ics) لإضافته إلى تقويم الهاتف!');
              }
            }
          }}
          onOpenRecharge={() => {
            setReceiptInitialPkg({ amount: 2000, pts: 200 });
            setIsUploadReceiptOpen(true);
          }}
          onTriggerSimulatedMatch={handleTriggerSimulatedMatch}
          userCraft={craftsmanCraft}
          points={points}
          isDark={isDark}
        />
      </div>
    </div>
  );
}
