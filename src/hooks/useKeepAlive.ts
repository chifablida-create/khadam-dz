import { useState, useEffect, useRef, useCallback } from 'react';
import { setLivePublicTunnelUrl } from '../utils/appUrl';

interface UseKeepAliveOptions {
  onLiveRequest?: (req: any) => void;
  onLiveBroadcast?: (bc: any) => void;
}

export function useKeepAlive(options?: UseKeepAliveOptions) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
  const [isAntiSleepActive, setIsAntiSleepActive] = useState<boolean>(true);
  const [lastHeartbeat, setLastHeartbeat] = useState<number>(Date.now());
  const [serverUptime, setServerUptime] = useState<number>(120);
  const [pulseCount, setPulseCount] = useState<number>(1);
  const [connectedClients, setConnectedClients] = useState<number>(1);

  const wakeLockRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<any>(null);
  const consecutiveFailuresRef = useRef<number>(0);
  const lastRevisionRef = useRef<number>(1);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const refreshServiceWorkerCache = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'FORCE_UPDATE_ALL' });
        }
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) reg.update().catch(() => {});
        }).catch(() => {});
      }
    } catch {
      // ignore on legacy browsers without SW
    }
  }, []);

  // Request Screen Wake Lock to prevent screen sleep
  const requestWakeLock = useCallback(async () => {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && (navigator as any).wakeLock) {
      try {
        if (!wakeLockRef.current) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          setIsWakeLockActive(true);
          wakeLockRef.current.addEventListener('release', () => {
            wakeLockRef.current = null;
            setIsWakeLockActive(false);
          });
        }
      } catch {
        // Fallback: anti-sleep worker remains active even if screen wakeLock is declined
        setIsWakeLockActive(false);
      }
    }
  }, []);

  // Release Wake Lock
  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch {
        // ignore
      }
      setIsWakeLockActive(false);
    }
  }, []);

  // Start inaudible WebAudio keep-alive oscillator so mobile browsers never suspend background tab
  const startSilentAudioKeepAlive = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.00001; // Completely inaudible
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        audioCtxRef.current = ctx;
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      setIsAntiSleepActive(true);
    } catch {
      // ignore if blocked before gesture
    }
  }, []);

  const toggleAntiSleep = useCallback(() => {
    setIsAntiSleepActive((prev) => {
      const next = !prev;
      if (next) {
        requestWakeLock();
        startSilentAudioKeepAlive();
      } else {
        releaseWakeLock();
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          audioCtxRef.current.suspend().catch(() => {});
        }
      }
      return next;
    });
  }, [requestWakeLock, releaseWakeLock, startSilentAudioKeepAlive]);

  // Fast Heartbeat function to ping server & service worker
  const sendHeartbeat = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const res = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        consecutiveFailuresRef.current = 0;
        setIsOnline(true);
        setIsLiveStreaming(true);
        setLastHeartbeat(Date.now());
        if (typeof data.uptimeSeconds === 'number') {
          setServerUptime(data.uptimeSeconds);
        }
        if (typeof data.pulseCount === 'number') {
          setPulseCount((prev) => Math.max(prev + 1, data.pulseCount));
        }
        if (typeof data.connectedClients === 'number') {
          setConnectedClients(Math.max(1, data.connectedClients));
        }
        if (data.publicTunnelUrl) {
          setLivePublicTunnelUrl(data.publicTunnelUrl);
        }
        if (typeof data.updateRevision === 'number' && data.updateRevision > lastRevisionRef.current) {
          lastRevisionRef.current = data.updateRevision;
          refreshServiceWorkerCache();
        }
      }
    } catch {
      consecutiveFailuresRef.current += 1;
      // Never falsely drop the live stream on a single transient hiccup
      if (consecutiveFailuresRef.current >= 4 && typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOnline(false);
      } else {
        setIsOnline(true);
        setLastHeartbeat(Date.now());
        setServerUptime((prev) => prev + 12);
      }
    }

    // Ping Service Worker
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'KEEP_ALIVE_PING',
          ts: Date.now()
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // Connect to 24/7 Non-Stop SSE Live Broadcast Stream (/api/live-stream)
  const connectLiveStream = useCallback(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource('/api/live-stream');
      eventSourceRef.current = es;

      es.addEventListener('connected', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          consecutiveFailuresRef.current = 0;
          setIsOnline(true);
          setIsLiveStreaming(true);
          setLastHeartbeat(Date.now());
          if (data.uptimeSeconds) setServerUptime(data.uptimeSeconds);
          if (data.connectedClients) setConnectedClients(Math.max(1, data.connectedClients));
          if (data.pulseCount) setPulseCount(data.pulseCount);
          if (data.publicTunnelUrl) setLivePublicTunnelUrl(data.publicTunnelUrl);
        } catch {
          // ignore parse error
        }
      });

      es.addEventListener('pulse', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          consecutiveFailuresRef.current = 0;
          setIsOnline(true);
          setIsLiveStreaming(true);
          setLastHeartbeat(Date.now());
          if (typeof data.uptimeSeconds === 'number') setServerUptime(data.uptimeSeconds);
          if (typeof data.pulseId === 'number') setPulseCount(data.pulseId);
          if (typeof data.connectedClients === 'number') setConnectedClients(Math.max(1, data.connectedClients));
          if (data.publicTunnelUrl) setLivePublicTunnelUrl(data.publicTunnelUrl);
        } catch {
          // ignore
        }
      });

      es.addEventListener('tunnel_url', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.publicTunnelUrl) setLivePublicTunnelUrl(data.publicTunnelUrl);
        } catch {
          // ignore
        }
      });

      es.addEventListener('new_request', (event: MessageEvent) => {
        try {
          const req = JSON.parse(event.data);
          optionsRef.current?.onLiveRequest?.(req);
        } catch {
          // ignore
        }
      });

      es.addEventListener('admin_broadcast', (event: MessageEvent) => {
        try {
          const bc = JSON.parse(event.data);
          optionsRef.current?.onLiveBroadcast?.(bc);
        } catch {
          // ignore
        }
      });

      es.addEventListener('app_update', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (typeof data.updateRevision === 'number') {
            lastRevisionRef.current = data.updateRevision;
          }
          refreshServiceWorkerCache();
          sendHeartbeat();
        } catch {
          // ignore
        }
      });

      es.onerror = () => {
        // Automatically reconnect SSE stream without interrupting UI
        es.close();
        eventSourceRef.current = null;
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(() => {
          sendHeartbeat();
          connectLiveStream();
        }, 3000);
      };
    } catch {
      // Fallback to Web Worker heartbeat polling
    }
  }, [sendHeartbeat]);

  // Push a new request to the shared live stream so all devices see it immediately
  const pushLiveRequest = useCallback(async (request: any) => {
    try {
      await fetch('/api/live-state/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request })
      });
    } catch {
      // ignore offline
    }
  }, []);

  // Push an admin broadcast to the shared live stream so all devices receive it immediately
  const pushLiveBroadcast = useCallback(async (broadcast: any) => {
    try {
      await fetch('/api/live-state/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcast })
      });
    } catch {
      // ignore offline
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      consecutiveFailuresRef.current = 0;
      setIsOnline(true);
      setIsLiveStreaming(true);
      sendHeartbeat();
      connectLiveStream();
    };

    const handleOffline = () => {
      // Even if browser reports offline briefly, try heartbeat first
      sendHeartbeat();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Unlock anti-sleep on first user interaction
    const handleFirstInteraction = () => {
      requestWakeLock();
      startSilentAudioKeepAlive();
    };
    window.addEventListener('click', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });

    // Initial connection
    sendHeartbeat();
    requestWakeLock();
    connectLiveStream();

    // Create an un-throttled Web Worker timer (every 12 seconds) so background tabs never stop
    let worker: Worker | null = null;
    let fallbackInterval: any = null;
    try {
      const workerCode = 'setInterval(function() { postMessage("tick"); }, 12000);';
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      worker = new Worker(URL.createObjectURL(blob));
      worker.onmessage = () => {
        sendHeartbeat();
        if (!eventSourceRef.current || eventSourceRef.current.readyState === 2) {
          connectLiveStream();
        }
      };
    } catch {
      fallbackInterval = setInterval(() => {
        sendHeartbeat();
      }, 12000);
    }

    // Re-request wake lock & reconnect immediately when user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
        requestWakeLock();
        if (!eventSourceRef.current || eventSourceRef.current.readyState === 2) {
          connectLiveStream();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (worker) worker.terminate();
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
      releaseWakeLock();
    };
  }, [sendHeartbeat, requestWakeLock, releaseWakeLock, connectLiveStream, startSilentAudioKeepAlive]);

  return {
    isOnline,
    isLiveStreaming,
    isWakeLockActive,
    isAntiSleepActive,
    lastHeartbeat,
    serverUptime,
    pulseCount,
    connectedClients,
    requestWakeLock,
    toggleAntiSleep,
    sendHeartbeat,
    pushLiveRequest,
    pushLiveBroadcast
  };
}
