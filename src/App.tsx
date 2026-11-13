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
    if (typeof window === 'undefined') return;

    const handleSupabaseSync = (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string; payload?: any }>).detail;
      const table = detail?.table;
      const payload = detail?.payload;

      if (table === 'artisans') {
        const nextRows = payload?.new ? [payload.new] : Array.isArray(payload) ? payload : [];
        if (nextRows.length === 0) return;
        setCraftsmen((prev) => {
          const map = new Map<string, CraftsmanUser>();
          prev.forEach((item) => map.set(String(item.id), item));
          nextRows.forEach((row) => {
            if (row && row.id) {
              map.set(String(row.id), row as CraftsmanUser);
            }
          });
          return Array.from(map.values());
        });
      }

      if (table === 'demandes') {
        const nextRows = payload?.new ? [payload.new] : Array.isArray(payload) ? payload : [];
        if (nextRows.length === 0) return;
        setRequests((prev) => {
          const map = new Map<string, RequestItem>();
          prev.forEach((item) => map.set(String(item.id), item));
          nextRows.forEach((row) => {
            if (row && row.id) {
              map.set(String(row.id), row as RequestItem);
            }
          });
          return Array.from(map.values());
        });
      }
    };

    window.addEventListener('khadam:supabase:sync', handleSupabaseSync);
    return () => window.removeEventListener('khadam:supabase:sync', handleSupabaseSync);
  }, []);

  useEffect(() => {
    if (points >= 25) {
      setIsLowPointsDismissed(false);
    }
  }, [points]);
