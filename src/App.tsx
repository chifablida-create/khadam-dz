import React, { useState, useEffect, useRef } from 'react';
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
import React, { useState, useEffect, useRef } from 'react';
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
