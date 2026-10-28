import { overlayPersonalPlan } from '@/features/app-state/from-bundle';
import { useAuth } from '@/features/auth/AuthProvider';
import { asMood, CHECK_IN_NOTE_MAX, HEART_NOTE_MAX, JOURNAL_BODY_MAX, JOURNAL_TITLE_MAX, PERSONAL_NOTE_MAX, PRAYER_MAX } from '@/features/duo/moods';
import {
  CURRENT_USER_ID,
  EXAMPLE_GROUP_NAME,
  EXAMPLE_INVITE_CODE,
  PSALMS_PLAN_ID,
  SOLO_PSALMS_PLAN,
  SOLO_PSALMS_PLAN_ID,
  getPlan,
  newId,
  planProgress,
  type PlanProgress,
} from '@/features/plans/content';
import { dataSource } from '@/lib/data-source';
import { addDays, asDayKey, todayKey, weekStartMonday, yesterday } from '@/lib/date';
import {
  consecutiveStreakWithGrace,
  dayStatus,
  graceOffer,
  graceUsedThisWeek,
  groupDayProgress,
  withDate,
  type GraceOffer,
} from '@/lib/streaks';
import {
  ensurePersonalSalmosPlan,
  insertJournalEntry,
  loadJournalEntries,
  loadOwnCheckIns,
  loadPersonalCompletions,
  loadPersonalDays,
  updateDisplayName,
  upsertCheckIn,
  upsertPersonalCompletion,
} from '@/lib/supabase-api';
import type {
  CheckIn,
  DayStatus,
  HeartVerse,
  JournalEntry,
  Member,
  MoodId,
  OnboardingDraft,
  PersistedState,
  Plan,
  PlanDay,
  PrayerRequest,
} from '@/lib/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState as RNAppState } from 'react-native';

const defaultDraft: OnboardingDraft = {
  name: '',
  mode: 'create',
  groupName: EXAMPLE_GROUP_NAME,
  inviteCode: '',
  planId: PSALMS_PLAN_ID,
};

function emptyState(): PersistedState {
  const today = todayKey();
  return {
    version: 4,
    onboardingComplete: false,
    duoEnabled: false,
    userName: '',
    userId: null,
    remoteDuoId: null,
    remotePlanId: null,
    remotePersonalPlanId: null,
    notificationsEnabled: true,
    group: {
      id: 'grupo-local',
      name: EXAMPLE_GROUP_NAME,
      inviteCode: EXAMPLE_INVITE_CODE,
    },
    groupPlanId: PSALMS_PLAN_ID,
    personalPlanId: null,
    groupPlanStartDate: today,
    personalPlanStartDate: null,
    userCompletedDates: [],
    personalCompletedDates: [],
    inProgressDate: null,
    personalInProgressDate: null,
    personalBest: 0,
    groupBest: 0,
    thread: [],
    checkIns: [],
    prayerRequests: [],
    heartVerses: [],
    duoAnswers: [],
    journalEntries: [],
    graceDates: [],
  };
}

let liveWriteChain: Promise<void> = Promise.resolve();
let lastLiveRefreshAt = 0;
const REFRESH_GAP_MS = 1200;

function enqueueLiveWrite(task: () => Promise<void>): Promise<void> {
  const run = liveWriteChain.then(task, task);
  liveWriteChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

type AppContextValue = {
  hydrated: boolean;
  live: boolean;
  signedIn: boolean;
  selfId: string;
  syncError: string | null;
  today: string;
  state: PersistedState;
  draft: OnboardingDraft;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  members: Member[];
  completions: Record<string, string[]>;
  personalStreak: number;
  soloStreak: number;
  groupStreakCount: number;
  todayStatus: DayStatus;
  personalTodayStatus: DayStatus;
  groupToday: { done: number; total: number; allDone: boolean; completedIds: string[] };
  groupPlan: Plan;
  personalPlan: Plan | null;
  todayGroupReading: PlanDay;
  todayPersonalReading: PlanDay | null;
  groupProgress: PlanProgress;
  personalProgress: PlanProgress | null;
  grace: GraceOffer;
  useGraceDay: () => void;
  simulateMissedDay: () => void;
  completeOnboarding: () => Promise<void>;
  enterSolo: () => Promise<void>;
  ensureSoloPlan: () => Promise<void>;
  openReading: () => void;
  openPersonalReading: () => void;
  completeToday: () => Promise<{
    personalStreak: number;
    groupStreak: number;
    groupJustUnlocked: boolean;
  }>;
  completePersonalToday: (note?: string) => Promise<{ soloStreak: number }>;
  shareVerse: (reference: string, text: string, note?: string) => Promise<void>;
  postNote: (text: string) => void;
  saveCheckIn: (mood: MoodId, note: string) => Promise<void>;
  saveHeartVerse: (reference: string, text: string, note: string) => Promise<void>;
  addPrayerRequest: (text: string) => void;
  markPrayed: (requestId: string) => void;
  saveJournalEntry: (input: { title: string; body: string; mood: MoodId | null; date?: string }) => Promise<void>;
  myCheckInToday: CheckIn | null;
  prayerRequests: PrayerRequest[];
  heartVerses: HeartVerse[];
  journalEntries: JournalEntry[];
  setNotifications: (value: boolean) => void;
  setUserName: (name: string) => void;
  startPersonalPlan: (planId: string) => void;
  clearPersonalPlan: () => void;
  switchGroupPlan: (planId: string) => void;
  resetLocalData: () => Promise<void>;
  refreshLive: (opts?: { force?: boolean }) => Promise<void>;
};

const AppStateContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { user, configured } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<PersistedState>(emptyState);
  const [draft, setDraftState] = useState<OnboardingDraft>(defaultDraft);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [livePersonalPlan, setLivePersonalPlan] = useState<Plan | null>(null);
  const today = todayKey();
  const selfId = user?.id ?? CURRENT_USER_ID;
  const signedIn = Boolean(user);
  const live = Boolean(user);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await dataSource.load();
      if (cancelled) return;
      if (loaded && !user) setState(loaded);
      setHydrated(true);
    })().catch(() => {
      if (!cancelled) setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;
    void dataSource.save(state);
  }, [hydrated, state]);

  const refreshLiveNow = useCallback(async () => {
    if (!user) return;
    const metaName =
      typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : '';
    try {
      let personalRow: Awaited<ReturnType<typeof ensurePersonalSalmosPlan>> | null = null;
      try {
        personalRow = await ensurePersonalSalmosPlan();
      } catch {
        personalRow = null;
      }

      const [journal, ownCheckIns, personalDays, personalCompletions] = await Promise.all([
        loadJournalEntries().catch(() => [] as JournalEntry[]),
        loadOwnCheckIns(user.id).catch(() => []),
        personalRow ? loadPersonalDays(personalRow.id).catch(() => []) : Promise.resolve([]),
        personalRow ? loadPersonalCompletions(personalRow.id).catch(() => []) : Promise.resolve([]),
      ]);

      if (personalRow) {
        setLivePersonalPlan(overlayPersonalPlan(personalRow, personalDays));
      }

      setState((prev) => ({
        ...prev,
        remotePersonalPlanId: personalRow?.id ?? null,
        personalPlanId: SOLO_PSALMS_PLAN_ID,
        personalPlanStartDate: asDayKey(personalRow?.startsOn ?? todayKey()),
        personalCompletedDates: personalCompletions.map((row) => row.completedOn),
        journalEntries: journal,
        userId: user.id,
        userName: prev.userName || metaName,
        remoteDuoId: null,
        remotePlanId: null,
        duoEnabled: false,
        notificationsEnabled: prev.notificationsEnabled,
        checkIns: ownCheckIns.map((row) => ({
          id: row.id,
          authorId: row.userId,
          date: row.checkedOn,
          mood: asMood(row.mood),
          note: row.note,
        })),
      }));
      setSyncError(null);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'No se pudo hablar con el servidor.');
    }
  }, [user]);

  const refreshLive = useCallback(
    (opts?: { force?: boolean }) => {
      if (!opts?.force && Date.now() - lastLiveRefreshAt < REFRESH_GAP_MS) {
        return Promise.resolve();
      }
      lastLiveRefreshAt = Date.now();
      return enqueueLiveWrite(() => refreshLiveNow());
    },
    [refreshLiveNow],
  );

  useEffect(() => {
    if (!user) return;
    void refreshLive({ force: true });
  }, [user, refreshLive]);

  useEffect(() => {
    if (!live) return;
    const sub = RNAppState.addEventListener('change', (status) => {
      if (status === 'active') void refreshLive({ force: true });
    });
    return () => sub.remove();
  }, [live, refreshLive]);

  const setDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  }, []);

  const members = useMemo<Member[]>(
    () => [
      {
        id: selfId,
        name: state.userName || 'Vos',
        hue: 'amber',
        isSelf: true,
      },
    ],
    [selfId, state.userName],
  );

  const completions = useMemo(
    () => ({ [selfId]: state.personalCompletedDates }),
    [selfId, state.personalCompletedDates],
  );

  const memberIds = useMemo(() => members.map((m) => m.id), [members]);
  const personalStreak = consecutiveStreakWithGrace(
    state.userCompletedDates,
    today,
    state.graceDates,
  );
  const soloStreak = consecutiveStreakWithGrace(state.personalCompletedDates, today, []);
  const groupStreakCount = 0;
  const todayStatus = dayStatus(state.userCompletedDates, state.inProgressDate, today);
  const personalTodayStatus = dayStatus(
    state.personalCompletedDates,
    state.personalInProgressDate,
    today,
  );
  const groupToday = groupDayProgress(memberIds, completions, today);
  const grace = graceOffer(state.userCompletedDates, state.graceDates, today);

  const groupPlan = getPlan(state.groupPlanId) ?? getPlan(PSALMS_PLAN_ID)!;
  const personalPlan =
    livePersonalPlan ??
    (state.personalPlanId ? (getPlan(state.personalPlanId) ?? SOLO_PSALMS_PLAN) : null);
  const groupProgress = planProgress(groupPlan, state.groupPlanStartDate, today);
  const todayGroupReading = groupProgress.day;
  const personalProgress =
    personalPlan && state.personalPlanStartDate
      ? planProgress(personalPlan, state.personalPlanStartDate, today)
      : null;
  const todayPersonalReading = personalProgress?.day ?? null;

  const myCheckInToday =
    state.checkIns.find((item) => item.authorId === selfId && item.date === today) ?? null;

  const enterSolo = useCallback(async () => {
    const name = draft.name.trim() || 'Amiga';
    if (user) {
      try {
        await updateDisplayName(user.id, name).catch(() => undefined);
        await ensurePersonalSalmosPlan();
        setState((prev) => ({
          ...prev,
          onboardingComplete: true,
          duoEnabled: false,
          userName: name,
          userId: user.id,
          remoteDuoId: null,
          remotePlanId: null,
          personalPlanId: SOLO_PSALMS_PLAN_ID,
        }));
        await refreshLiveNow();
        setSyncError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo abrir tu espacio.';
        setSyncError(message);
        throw error;
      }
      return;
    }

    const next: PersistedState = {
      ...emptyState(),
      onboardingComplete: true,
      duoEnabled: false,
      userName: name,
      userId: `local-${newId()}`,
      personalPlanId: SOLO_PSALMS_PLAN_ID,
      personalPlanStartDate: todayKey(),
    };
    setState(next);
    await dataSource.save(next);
  }, [draft.name, refreshLiveNow, user]);

  const completeOnboarding = enterSolo;

  const ensureSoloPlan = useCallback(async () => {
    if (user) {
      try {
        await ensurePersonalSalmosPlan();
        await refreshLiveNow();
      } catch (error) {
        setSyncError(error instanceof Error ? error.message : 'No se pudo empezar el plan.');
        throw error;
      }
      return;
    }
    setState((prev) => ({
      ...prev,
      personalPlanId: prev.personalPlanId ?? SOLO_PSALMS_PLAN_ID,
      personalPlanStartDate: asDayKey(prev.personalPlanStartDate ?? todayKey()),
    }));
  }, [refreshLiveNow, user]);

  const openReading = useCallback(() => {
    setState((prev) => {
      if (prev.userCompletedDates.includes(today)) return prev;
      return { ...prev, inProgressDate: today };
    });
  }, [today]);

  const openPersonalReading = useCallback(() => {
    setState((prev) => {
      if (prev.personalCompletedDates.includes(today)) return prev;
      return { ...prev, personalInProgressDate: today };
    });
  }, [today]);

  const completeToday = useCallback(async () => {
    const dates = withDate(state.userCompletedDates, today);
    const nextPersonal = consecutiveStreakWithGrace(dates, today, state.graceDates);
    const result = {
      personalStreak: nextPersonal,
      groupStreak: 0,
      groupJustUnlocked: false,
    };

    setState((prev) => ({
      ...prev,
      userCompletedDates: withDate(prev.userCompletedDates, today),
      inProgressDate: null,
      personalBest: Math.max(prev.personalBest, nextPersonal),
    }));

    return result;
  }, [state.graceDates, state.userCompletedDates, today]);

  const completePersonalToday = useCallback(
    async (note?: string) => {
      const dates = withDate(state.personalCompletedDates, today);
      const nextSolo = consecutiveStreakWithGrace(dates, today, []);
      const clipped = (note ?? '').trim().slice(0, PERSONAL_NOTE_MAX);
      const dayNumber = personalProgress?.absoluteDay ?? 1;

      setState((prev) => ({
        ...prev,
        personalCompletedDates: withDate(prev.personalCompletedDates, today),
        personalInProgressDate: null,
        personalBest: Math.max(prev.personalBest, nextSolo),
      }));

      if (user) {
        await enqueueLiveWrite(async () => {
          try {
            const planId = state.remotePersonalPlanId ?? (await ensurePersonalSalmosPlan()).id;
            await upsertPersonalCompletion({
              planId,
              userId: user.id,
              dayNumber,
              completedOn: today,
              note: clipped,
            });
            await refreshLiveNow();
          } catch (error: unknown) {
            setSyncError(error instanceof Error ? error.message : 'No se pudo guardar tu día.');
          }
        });
      }

      return { soloStreak: nextSolo };
    },
    [
      refreshLiveNow,
      state.personalCompletedDates,
      state.remotePersonalPlanId,
      today,
      personalProgress?.absoluteDay,
      user,
    ],
  );

  const shareVerse = useCallback(
    (reference: string, text: string, note?: string) => {
      const trimmedNote = (note ?? '').trim();
      setState((prev) => ({
        ...prev,
        heartVerses: [
          ...prev.heartVerses,
          {
            id: newId('heart'),
            authorId: selfId,
            reference,
            text,
            note: trimmedNote.slice(0, HEART_NOTE_MAX),
            createdAt: new Date().toISOString(),
          },
        ],
        thread: [
          ...prev.thread,
          {
            id: newId('msg'),
            authorId: selfId,
            text: trimmedNote ? `${text}\n— ${reference}\n${trimmedNote}` : `${text}\n— ${reference}`,
            verseRef: reference,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
      return Promise.resolve();
    },
    [selfId],
  );

  const saveCheckIn = useCallback(
    (mood: MoodId, note: string) => {
      const clipped = note.trim().slice(0, CHECK_IN_NOTE_MAX);
      setState((prev) => {
        const withoutMine = prev.checkIns.filter(
          (item) => !(item.authorId === selfId && item.date === today),
        );
        return {
          ...prev,
          checkIns: [
            ...withoutMine,
            {
              id: newId('checkin'),
              authorId: selfId,
              date: today,
              mood,
              note: clipped,
            },
          ],
        };
      });
      if (user) {
        return enqueueLiveWrite(async () => {
          try {
            await upsertCheckIn({
              userId: user.id,
              duoId: null,
              mood,
              note: clipped,
              checkedOn: today,
            });
            await refreshLiveNow();
          } catch (error: unknown) {
            setSyncError(error instanceof Error ? error.message : 'No se pudo guardar el check-in.');
          }
        });
      }
      return Promise.resolve();
    },
    [refreshLiveNow, selfId, today, user],
  );

  const saveJournalEntry = useCallback(
    async (input: { title: string; body: string; mood: MoodId | null; date?: string }) => {
      const body = input.body.trim().slice(0, JOURNAL_BODY_MAX);
      if (!body) return;
      const title = input.title.trim().slice(0, JOURNAL_TITLE_MAX);
      const date = input.date ?? today;
      const local: JournalEntry = {
        id: newId('journal'),
        date,
        title,
        body,
        mood: input.mood,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        journalEntries: [local, ...prev.journalEntries],
      }));
      if (user) {
        await enqueueLiveWrite(async () => {
          try {
            const saved = await insertJournalEntry({
              userId: user.id,
              date,
              title,
              body,
              mood: input.mood,
            });
            setState((prev) => ({
              ...prev,
              journalEntries: prev.journalEntries.map((entry) =>
                entry.id === local.id ? saved : entry,
              ),
            }));
          } catch (error: unknown) {
            setSyncError(error instanceof Error ? error.message : 'No se pudo guardar el diario.');
          }
        });
      }
    },
    [today, user],
  );

  const saveHeartVerse = useCallback(
    (reference: string, text: string, note: string) => shareVerse(reference, text, note),
    [shareVerse],
  );

  const addPrayerRequest = useCallback(
    (text: string) => {
      const clipped = text.trim().slice(0, PRAYER_MAX);
      if (!clipped) return;
      setState((prev) => ({
        ...prev,
        prayerRequests: [
          {
            id: newId('prayer'),
            authorId: selfId,
            text: clipped,
            createdAt: new Date().toISOString(),
            prayedBy: [],
          },
          ...prev.prayerRequests,
        ],
      }));
    },
    [selfId],
  );

  const markPrayed = useCallback(
    (requestId: string) => {
      setState((prev) => ({
        ...prev,
        prayerRequests: prev.prayerRequests.map((request) =>
          request.id === requestId && !request.prayedBy.includes(selfId)
            ? { ...request, prayedBy: [...request.prayedBy, selfId] }
            : request,
        ),
      }));
    },
    [selfId],
  );

  const useGraceDay = useCallback(() => {
    const gap = yesterday(today);
    setState((prev) => {
      if (prev.graceDates.includes(gap)) return prev;
      return { ...prev, graceDates: [...prev.graceDates, gap] };
    });
  }, [today]);

  const simulateMissedDay = useCallback(() => {
    const y = yesterday(today);
    const two = addDays(today, -2);
    const three = addDays(today, -3);
    const monday = weekStartMonday(y);
    setState((prev) => {
      const kept = prev.userCompletedDates.filter((day) => day !== y && day !== today);
      const usedGraceAlready =
        prev.graceDates.includes(y) || graceUsedThisWeek(prev.graceDates, y).length > 0;
      let graceDates = prev.graceDates.filter((day) => day !== y);
      if (usedGraceAlready && monday !== y && !graceDates.includes(monday)) {
        graceDates = [...graceDates, monday];
      }
      return {
        ...prev,
        userCompletedDates: withDate(withDate(kept, two), three),
        inProgressDate: null,
        graceDates,
      };
    });
  }, [today]);

  const postNote = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      thread: [
        ...prev.thread,
        {
          id: newId('msg'),
          authorId: selfId,
          text: trimmed,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }, [selfId]);

  const setNotifications = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, notificationsEnabled: value }));
  }, []);

  const setUserName = useCallback(
    (name: string) => {
      setState((prev) => ({ ...prev, userName: name }));
      if (user && name.trim().length >= 2) {
        void updateDisplayName(user.id, name.trim()).catch(() => undefined);
      }
    },
    [user],
  );

  const startPersonalPlan = useCallback((planId: string) => {
    setState((prev) => ({
      ...prev,
      personalPlanId: planId || SOLO_PSALMS_PLAN_ID,
      personalPlanStartDate: todayKey(),
    }));
    if (user) {
      void enqueueLiveWrite(async () => {
        try {
          await ensurePersonalSalmosPlan();
          await refreshLiveNow();
        } catch (error: unknown) {
          setSyncError(error instanceof Error ? error.message : 'No se pudo empezar el plan.');
        }
      });
    }
  }, [refreshLiveNow, user]);

  const clearPersonalPlan = useCallback(() => {
    setState((prev) => ({
      ...prev,
      personalPlanId: null,
      personalPlanStartDate: null,
    }));
  }, []);

  const switchGroupPlan = useCallback(
    (planId: string) => {
      if (live) return;
      setState((prev) => ({
        ...prev,
        groupPlanId: planId,
        groupPlanStartDate: todayKey(),
      }));
    },
    [live],
  );

  const resetLocalData = useCallback(async () => {
    await dataSource.clear();
    setDraftState(defaultDraft);
    setState(emptyState());
  }, []);

  const value: AppContextValue = {
    hydrated: hydrated && (configured ? true : true),
    live,
    signedIn,
    selfId,
    syncError,
    today,
    state,
    draft,
    setDraft,
    members,
    completions,
    personalStreak,
    soloStreak,
    groupStreakCount,
    todayStatus,
    personalTodayStatus,
    groupToday,
    groupPlan,
    personalPlan,
    todayGroupReading,
    todayPersonalReading,
    groupProgress,
    personalProgress,
    grace,
    useGraceDay,
    simulateMissedDay,
    completeOnboarding,
    enterSolo,
    ensureSoloPlan,
    openReading,
    openPersonalReading,
    completeToday,
    completePersonalToday,
    shareVerse,
    postNote,
    saveCheckIn,
    saveHeartVerse,
    addPrayerRequest,
    markPrayed,
    saveJournalEntry,
    myCheckInToday,
    prayerRequests: state.prayerRequests,
    heartVerses: state.heartVerses,
    journalEntries: state.journalEntries,
    setNotifications,
    setUserName,
    startPersonalPlan,
    clearPersonalPlan,
    switchGroupPlan,
    resetLocalData,
    refreshLive,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState debe usarse dentro de AppStateProvider');
  }
  return ctx;
}

