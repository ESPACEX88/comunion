import {
  CURRENT_USER_ID,
  EXAMPLE_GROUP_NAME,
  EXAMPLE_INVITE_CODE,
  PSALMS_PLAN_ID,
  getPlan,
  makeInviteCode,
  newId,
  planDayForDate,
} from '@/features/plans/content';
import { membersWithSelf, mockFriendCompletions } from '@/features/group/mock-members';
import { dataSource } from '@/lib/data-source';
import { todayKey } from '@/lib/date';
import {
  consecutiveStreak,
  dayStatus,
  groupDayProgress,
  groupStreak,
  withDate,
} from '@/lib/streaks';
import type {
  DayStatus,
  Member,
  OnboardingDraft,
  PersistedState,
  Plan,
  PlanDay,
  PlanKind,
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
    version: 1,
    onboardingComplete: false,
    userName: '',
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
    inProgressDate: null,
    personalBest: 0,
    groupBest: 0,
    thread: [],
  };
}

type AppContextValue = {
  hydrated: boolean;
  today: string;
  state: PersistedState;
  draft: OnboardingDraft;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  members: Member[];
  completions: Record<string, string[]>;
  personalStreak: number;
  groupStreakCount: number;
  todayStatus: DayStatus;
  groupToday: { done: number; total: number; allDone: boolean; completedIds: string[] };
  groupPlan: Plan;
  personalPlan: Plan | null;
  todayGroupReading: PlanDay;
  todayPersonalReading: PlanDay | null;
  completeOnboarding: () => Promise<void>;
  openReading: () => void;
  completeToday: () => {
    personalStreak: number;
    groupStreak: number;
    groupJustUnlocked: boolean;
  };
  shareVerse: (reference: string, text: string) => void;
  postNote: (text: string) => void;
  setNotifications: (value: boolean) => void;
  setUserName: (name: string) => void;
  startPersonalPlan: (planId: string) => void;
  clearPersonalPlan: () => void;
  switchGroupPlan: (planId: string) => void;
  resetLocalData: () => Promise<void>;
};

const AppStateContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<PersistedState>(emptyState);
  const [draft, setDraftState] = useState<OnboardingDraft>(defaultDraft);
  const today = todayKey();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await dataSource.load();
      if (cancelled) return;
      if (loaded) setState(loaded);
      setHydrated(true);
    })().catch(() => {
      if (!cancelled) setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void dataSource.save(state);
  }, [hydrated, state]);

  const setDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  }, []);

  const members = useMemo(() => membersWithSelf(state.userName), [state.userName]);

  const friendDates = useMemo(
    () => withDate(state.userCompletedDates, today),
    [state.userCompletedDates, today],
  );

  const completions = useMemo(() => {
    return {
      ...mockFriendCompletions(friendDates),
      [CURRENT_USER_ID]: state.userCompletedDates,
    };
  }, [friendDates, state.userCompletedDates]);

  const memberIds = useMemo(() => members.map((m) => m.id), [members]);
  const personalStreak = consecutiveStreak(state.userCompletedDates, today);
  const groupStreakCount = groupStreak(memberIds, completions, today);
  const todayStatus = dayStatus(state.userCompletedDates, state.inProgressDate, today);
  const groupToday = groupDayProgress(memberIds, completions, today);

  const groupPlan = getPlan(state.groupPlanId) ?? getPlan(PSALMS_PLAN_ID)!;
  const personalPlan = state.personalPlanId ? (getPlan(state.personalPlanId) ?? null) : null;
  const todayGroupReading = planDayForDate(groupPlan, state.groupPlanStartDate, today);
  const todayPersonalReading =
    personalPlan && state.personalPlanStartDate
      ? planDayForDate(personalPlan, state.personalPlanStartDate, today)
      : null;

  const completeOnboarding = useCallback(async () => {
    const name = draft.name.trim() || 'Amiga';
    const joined =
      draft.mode === 'join' &&
      draft.inviteCode.trim().toUpperCase().replace(/\s/g, '') === EXAMPLE_INVITE_CODE;
    const groupName =
      draft.mode === 'join'
        ? joined
          ? EXAMPLE_GROUP_NAME
          : `Grupo ${draft.inviteCode.trim().toUpperCase() || 'nuevo'}`
        : draft.groupName.trim() || EXAMPLE_GROUP_NAME;
    const inviteCode =
      draft.mode === 'join'
        ? draft.inviteCode.trim().toUpperCase().replace(/\s/g, '') || EXAMPLE_INVITE_CODE
        : makeInviteCode(groupName);

    const next: PersistedState = {
      ...emptyState(),
      onboardingComplete: true,
      userName: name,
      group: {
        id: 'grupo-local',
        name: groupName,
        inviteCode,
      },
      groupPlanId: draft.planId || PSALMS_PLAN_ID,
      groupPlanStartDate: todayKey(),
      personalPlanId: null,
      personalPlanStartDate: null,
    };

    setState(next);
    await dataSource.save(next);
  }, [draft]);

  const openReading = useCallback(() => {
    setState((prev) => {
      if (prev.userCompletedDates.includes(today)) return prev;
      return { ...prev, inProgressDate: today };
    });
  }, [today]);

  const completeToday = useCallback(() => {
    const dates = withDate(state.userCompletedDates, today);
    const nextCompletions = { ...mockFriendCompletions(dates), [CURRENT_USER_ID]: dates };
    const nextPersonal = consecutiveStreak(dates, today);
    const nextGroup = groupStreak(memberIds, nextCompletions, today);
    const result = {
      personalStreak: nextPersonal,
      groupStreak: nextGroup,
      groupJustUnlocked: nextGroup > groupStreakCount,
    };

    setState((prev) => {
      const nextDates = withDate(prev.userCompletedDates, today);
      const personal = consecutiveStreak(nextDates, today);
      const group = groupStreak(
        memberIds,
        { ...mockFriendCompletions(nextDates), [CURRENT_USER_ID]: nextDates },
        today,
      );
      return {
        ...prev,
        userCompletedDates: nextDates,
        inProgressDate: null,
        personalBest: Math.max(prev.personalBest, personal),
        groupBest: Math.max(prev.groupBest, group),
      };
    });

    return result;
  }, [groupStreakCount, memberIds, state.userCompletedDates, today]);

  const shareVerse = useCallback((reference: string, text: string) => {
    setState((prev) => ({
      ...prev,
      thread: [
        ...prev.thread,
        {
          id: newId('msg'),
          authorId: CURRENT_USER_ID,
          text: `${text}\n— ${reference}`,
          verseRef: reference,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  const postNote = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      thread: [
        ...prev.thread,
        {
          id: newId('msg'),
          authorId: CURRENT_USER_ID,
          text: trimmed,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  const setNotifications = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, notificationsEnabled: value }));
  }, []);

  const setUserName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, userName: name }));
  }, []);

  const startPersonalPlan = useCallback((planId: string) => {
    setState((prev) => ({
      ...prev,
      personalPlanId: planId,
      personalPlanStartDate: todayKey(),
    }));
  }, []);

  const clearPersonalPlan = useCallback(() => {
    setState((prev) => ({
      ...prev,
      personalPlanId: null,
      personalPlanStartDate: null,
    }));
  }, []);

  const switchGroupPlan = useCallback((planId: string) => {
    setState((prev) => ({
      ...prev,
      groupPlanId: planId,
      groupPlanStartDate: todayKey(),
    }));
  }, []);

  const resetLocalData = useCallback(async () => {
    await dataSource.clear();
    setDraftState(defaultDraft);
    setState(emptyState());
  }, []);

  const value: AppContextValue = {
    hydrated,
    today,
    state,
    draft,
    setDraft,
    members,
    completions,
    personalStreak,
    groupStreakCount,
    todayStatus,
    groupToday,
    groupPlan,
    personalPlan,
    todayGroupReading,
    todayPersonalReading,
    completeOnboarding,
    openReading,
    completeToday,
    shareVerse,
    postNote,
    setNotifications,
    setUserName,
    startPersonalPlan,
    clearPersonalPlan,
    switchGroupPlan,
    resetLocalData,
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

export type { PlanKind };
