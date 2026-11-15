import { RequestItem } from '../types';
import { getCraftIcon } from '../data/constants';

let soundEnabledState = true;

export function isNotificationSoundEnabled(): boolean {
  return soundEnabledState;
}

export function setNotificationSoundEnabled(enabled: boolean): void {
  soundEnabledState = Boolean(enabled);
}

/**
 * Plays a clear, high-attention 3-tone alert chime using the Web Audio API
 * when a new request matching the craftsman's specialty is posted.
 */
export function playCraftsmanAlertSound(): void {
  if (!isNotificationSoundEnabled()) return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // 3-note ascending chime (C5 -> E5 -> G5 -> C6) for unmistakable craftsman alert
    const notes = [
      { freq: 587.33, start: 0, duration: 0.14 },    // D5
      { freq: 880.0, start: 0.15, duration: 0.14 },  // A5
      { freq: 1174.66, start: 0.30, duration: 0.28 } // D6
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.start);

      gain.gain.setValueAtTime(0.001, now + n.start);
      gain.gain.exponentialRampToValueAtTime(0.32, now + n.start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.start);
      osc.stop(now + n.start + n.duration + 0.02);
    });

    // Close context after chime finishes to free audio hardware
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 900);
  } catch {
    // Ignore if browser blocked autoplay before user gesture
  }
}

let bgNotifEnabledState = true;

export function isBackgroundNotificationEnabled(): boolean {
  return bgNotifEnabledState;
}

export function setBackgroundNotificationEnabled(enabled: boolean): void {
  bgNotifEnabledState = Boolean(enabled);
}

export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Requests browser/device local notification permission if not yet granted.
 */
export async function requestLocalNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      setBackgroundNotificationEnabled(true);
    }
    return result;
  } catch {
    return Notification.permission;
  }
}

/**
 * Updates the browser tab title when a matching request arrives while the tab is in the background,
 * and restores it automatically once the user focuses the tab.
 */
function flashBackgroundTabTitle(craft: string): void {
  if (typeof document === 'undefined') return;
  if (document.visibilityState === 'hidden') {
    document.title = `🔔 (1) طلب جديد في تخصص ${craft} — خدّام ديزاد`;
    const restoreTitle = () => {
      if (document.visibilityState === 'visible') {
        document.title = 'خدّام ديزاد - Khadam DZ';
        document.removeEventListener('visibilitychange', restoreTitle);
      }
    };
    document.addEventListener('visibilitychange', restoreTitle);
  }
}

/**
 * Triggers a native Browser / OS Notification (via ServiceWorker or Notification API)
 * even when the app is in the background, plus device vibration and alert chime
 * when a new request matches the craftsman's specific craft.
 */
export async function triggerLocalCraftsmanNotification(
  request: RequestItem,
  craftsmanCraft?: string
): Promise<boolean> {
  const targetCraft = craftsmanCraft || request.craft;

  // Verify the request matches the user's specific craft if craftsmanCraft is provided
  if (craftsmanCraft && request.craft !== craftsmanCraft) {
    return false;
  }

  // Always play the notification sound first
  playCraftsmanAlertSound();

  // Flash browser tab title if the app is in the background
  flashBackgroundTabTitle(targetCraft);

  // Trigger mobile vibration if supported
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([240, 100, 240, 100, 320]);
    }
  } catch {
    // ignore
  }

  if (!isBackgroundNotificationEnabled()) {
    return false;
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch {
      // ignore
    }
  }

  if (permission !== 'granted') {
    return false;
  }

  const iconEmoji = getCraftIcon(request.craft);
  const isBackground = typeof document !== 'undefined' && document.visibilityState === 'hidden';
  const title = `${iconEmoji} طلب جديد في تخصصك (${targetCraft})!`;
  const body = `${request.title} — 📍 ${request.wilaya}\n${request.desc}`;
  const tag = `khadam-match-${request.id}`;

  // 1. Prefer ServiceWorker notification (works reliably in background on mobile & desktop)
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag,
          dir: 'rtl',
          lang: 'ar-DZ',
          requireInteraction: isBackground,
          data: {
            requestId: request.id,
            craft: request.craft,
            wilaya: request.wilaya,
            url: '/'
          }
        });
        return true;
      }

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_CRAFT_NOTIFICATION',
          payload: {
            requestId: request.id,
            craft: request.craft,
            wilaya: request.wilaya,
            title,
            body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            tag,
            requireInteraction: isBackground,
            url: '/'
          }
        });
        return true;
      }
    }
  } catch {
    // Fallback to standard Notification constructor below
  }

  // 2. Fallback to standard Web Notification API
  try {
    const notif = new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      tag,
      dir: 'rtl',
      lang: 'ar-DZ',
      requireInteraction: isBackground
    });

    notif.onclick = () => {
      try {
        window.focus();
        window.dispatchEvent(
          new CustomEvent('khadam:open-request', {
            detail: { requestId: request.id }
          })
        );
        notif.close();
      } catch {
        // ignore
      }
    };
    return true;
  } catch {
    return false;
  }
}

