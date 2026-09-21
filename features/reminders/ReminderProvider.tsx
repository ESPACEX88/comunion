import { useAppState } from '@/features/app-state/AppStateProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  cachePrefs,
  cancelAppReminders,
  clearCachedPrefs,
  defaultReminderPrefs,
  getPermissionStatus,
  loadCachedPrefs,
  maybeExpoPushToken,
  previewReminder,
  remindersSupported,
  requestReminderPermission,
  scheduleAppReminders,
  type ReminderPrefs,
} from '@/lib/reminders';
import { ensureReminderPrefs, saveReminderPrefs } from '@/lib/supabase-api';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type Permission = 'granted' | 'denied' | 'undetermined' | 'unavailable';

type ReminderContextValue = {
  prefs: ReminderPrefs;
  ready: boolean;
  permission: Permission;
  updatePrefs: (patch: Partial<ReminderPrefs>) => Promise<boolean>;
  requestAccess: () => Promise<boolean>;
  preview: (kind: 'solo' | 'duo') => Promise<boolean>;
  cancelAll: () => Promise<void>;
};

const ReminderContext = createContext<ReminderContextValue | null>(null);

export function ReminderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { hasDuo, state } = useAppState();
  const [prefs, setPrefs] = useState<ReminderPrefs>(defaultReminderPrefs);
  const [ready, setReady] = useState(false);
  const [armed, setArmed] = useState(true);
  const [permission, setPermission] = useState<Permission>('undetermined');

  const refreshPermission = useCallback(async () => {
    setPermission(await getPermissionStatus());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await loadCachedPrefs();
      if (!cancelled) setPrefs(cached);
      await refreshPermission();
      if (user) {
        try {
          const remote = await ensureReminderPrefs(user.id);
          if (!cancelled) {
            setPrefs(remote);
            await cachePrefs(remote);
          }
        } catch {
          /* offline: usamos caché */
        }
      }
      if (!cancelled) setReady(true);
    })().catch(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshPermission, user]);

  useEffect(() => {
    if (user || state.onboardingComplete) setArmed(true);
  }, [state.onboardingComplete, user]);

  useEffect(() => {
    if (!ready) return;
    if (!armed || (!user && !state.onboardingComplete)) {
      void cancelAppReminders();
      return;
    }
    void scheduleAppReminders(prefs, hasDuo);
  }, [armed, hasDuo, prefs, ready, state.onboardingComplete, user]);

  const requestAccess = useCallback(async () => {
    const granted = await requestReminderPermission();
    await refreshPermission();
    if (granted) {
      const token = await maybeExpoPushToken();
      if (token) {
        setPrefs((prev) => {
          const next = { ...prev, expoPushToken: token };
          void cachePrefs(next);
          if (user) void saveReminderPrefs(user.id, next).catch(() => undefined);
          return next;
        });
      }
    }
    return granted;
  }, [refreshPermission, user]);

  const updatePrefs = useCallback(
    async (patch: Partial<ReminderPrefs>) => {
      const turningOn = Boolean(
        (patch.soloEnabled === true && !prefs.soloEnabled) ||
          (patch.duoEnabled === true && !prefs.duoEnabled),
      );
      if (turningOn && remindersSupported()) {
        const granted = await requestAccess();
        if (!granted) return false;
      }
      const next = { ...prefs, ...patch };
      setPrefs(next);
      await cachePrefs(next);
      if (user) {
        try {
          await saveReminderPrefs(user.id, next);
        } catch {
          /* el horario local igual se reprograma */
        }
      }
      return true;
    },
    [prefs, requestAccess, user],
  );

  const preview = useCallback(async (kind: 'solo' | 'duo') => {
    const ok = await previewReminder(kind);
    await refreshPermission();
    return ok;
  }, [refreshPermission]);

  const cancelAll = useCallback(async () => {
    setArmed(false);
    await cancelAppReminders();
    await clearCachedPrefs();
    setPrefs(defaultReminderPrefs);
  }, []);

  const value = useMemo(
    () => ({ prefs, ready, permission, updatePrefs, requestAccess, preview, cancelAll }),
    [cancelAll, permission, prefs, preview, ready, requestAccess, updatePrefs],
  );

  return <ReminderContext.Provider value={value}>{children}</ReminderContext.Provider>;
}

export function useReminders(): ReminderContextValue {
  const ctx = useContext(ReminderContext);
  if (!ctx) throw new Error('useReminders debe usarse dentro de ReminderProvider');
  return ctx;
}
