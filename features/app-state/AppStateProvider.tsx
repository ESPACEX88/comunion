import { bundleToState, liveCompletions, overlayPlan } from '@/features/app-state/from-bundle';
import { useAuth } from '@/features/auth/AuthProvider';
import { CHECK_IN_NOTE_MAX, DUO_ANSWER_MAX, HEART_NOTE_MAX, PRAYER_MAX } from '@/features/duo/moods';
import { SPECIAL_FRIEND_ID, friendCheckInForToday, friendDuoAnswerForToday, seedHeartVerses, seedPrayerRequests } from '@/features/duo/seeds';
import { friendReadingDates, membersWithSelf, mockFriendCompletions } from '@/features/group/mock-members';
import {
  CURRENT_USER_ID,
  EXAMPLE_GROUP_NAME,
  EXAMPLE_INVITE_CODE,
  PSALMS_PLAN_ID,
  getPlan,
  isDuoPlan,
  makeInviteCode,
  newId,
  planDayForDate,
} from '@/features/plans/content';
import { dataSource } from '@/lib/data-source';
import { addDays, todayKey, weekStartMonday, yesterday } from '@/lib/date';
import {
  consecutiveStreakWithGrace,
  dayStatus,
  graceOffer,
  graceUsedThisWeek,
  groupDayProgress,
  groupStreakWithGrace,
  withDate,
  type GraceOffer,
} from '@/lib/streaks';
import {
  createDuo,
  insertHeartVerse,
  insertPrayer,
  joinDuo,
  loadDuoBundle,
  markPrayerAnswered,
  updateDisplayName,
  upsertCheckIn,
  upsertCompletion,
  upsertPlanAnswer,
} from '@/lib/supabase-api';
import type {
  CheckIn,
  DayStatus,
  DuoAnswer,
  HeartVerse,
  Member,
  MoodId,
  OnboardingDraft,
  PersistedState,
  Plan,
  PlanDay,
  PlanKind,
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
    userName: '',
    userId: null,
    remoteDuoId: null,
    remotePlanId: null,
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
    checkIns: [],
    prayerRequests: [],
    heartVerses: [],
    duoAnswers: [],
    graceDates: [],
  };
}

type AppContextValue = {
  hydrated: boolean;
  live: boolean;
  selfId: string;
  syncError: string | null;
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
  isDuoActive: boolean;
  grace: GraceOffer;
  myDuoAnswerToday: DuoAnswer | null;
  friendDuoAnswerToday: DuoAnswer | null;
  saveDuoAnswer: (text: string) => void;
  useGraceDay: () => void;
  simulateMissedDay: () => void;
  completeOnboarding: () => Promise<void>;
  openReading: () => void;
  completeToday: () => {
    personalStreak: number;
    groupStreak: number;
    groupJustUnlocked: boolean;
  };
  shareVerse: (reference: string, text: string, note?: string) => void;
  postNote: (text: string) => void;
  saveCheckIn: (mood: MoodId, note: string) => void;
  saveHeartVerse: (reference: string, text: string, note: string) => void;
  addPrayerRequest: (text: string) => void;
  markPrayed: (requestId: string) => void;
  specialFriend: Member;
  myCheckInToday: CheckIn | null;
  friendCheckInToday: CheckIn | null;
  prayerRequests: PrayerRequest[];
  heartVerses: HeartVerse[];
  setNotifications: (value: boolean) => void;
  setUserName: (name: string) => void;
  startPersonalPlan: (planId: string) => void;
  clearPersonalPlan: () => void;
  switchGroupPlan: (planId: string) => void;
  resetLocalData: () => Promise<void>;
  refreshLive: () => Promise<void>;
};

const AppStateContext = createContext<AppContextValue | null>(null);

const pendingFriend: Member = {
  id: 'pending',
  name: 'Tu dúo',
  hue: 'olive',
  isSpecialFriend: true,
};

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { user, configured } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<PersistedState>(emptyState);
  const [draft, setDraftState] = useState<OnboardingDraft>(defaultDraft);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [liveBundleCompletions, setLiveBundleCompletions] = useState<Record<string, string[]> | null>(
    null,
  );
  const [livePlan, setLivePlan] = useState<Plan | null>(null);
  const [liveMembersList, setLiveMembersList] = useState<Member[] | null>(null);
  const today = todayKey();
  const selfId = user?.id ?? CURRENT_USER_ID;
  const live = Boolean(user && state.remoteDuoId);

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

  const refreshLive = useCallback(async () => {
    if (!user) return;
    try {
      const bundle = await loadDuoBundle(user.id);
      if (!bundle) {
        setLiveBundleCompletions(null);
        setLivePlan(null);
        setLiveMembersList(null);
        setState((prev) => ({
          ...emptyState(),
          userId: user.id,
          userName:
            prev.userName ||
            (typeof user.user_metadata?.display_name === 'string'
              ? user.user_metadata.display_name
              : ''),
          notificationsEnabled: prev.notificationsEnabled,
        }));
        return;
      }
      const next = bundleToState(emptyState(), bundle, user.id);
      setLiveBundleCompletions(liveCompletions(bundle));
      setLivePlan(overlayPlan(bundle));
      setLiveMembersList(
        bundle.members.map((member) => ({
          id: member.userId,
          name: member.displayName,
          hue: member.userId === user.id ? 'amber' : 'olive',
          isSelf: member.userId === user.id,
          isSpecialFriend: member.userId !== user.id,
        })),
      );
      setState((prev) => ({
        ...next,
        notificationsEnabled: prev.notificationsEnabled,
        personalPlanId: prev.personalPlanId,
        personalPlanStartDate: prev.personalPlanStartDate,
        inProgressDate: prev.inProgressDate,
        userName: next.userName || prev.userName,
      }));
      setSyncError(null);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'No se pudo hablar con el servidor.');
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLiveBundleCompletions(null);
      setLivePlan(null);
      setLiveMembersList(null);
      return;
    }
    void refreshLive();
  }, [user, refreshLive]);

  useEffect(() => {
    if (!live) return;
    const sub = RNAppState.addEventListener('change', (status) => {
      if (status === 'active') void refreshLive();
    });
    return () => sub.remove();
  }, [live, refreshLive]);

  const setDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  }, []);

  const members = useMemo(() => {
    if (live && liveMembersList) {
      return liveMembersList.map((member) =>
        member.isSelf ? { ...member, name: state.userName || member.name } : member,
      );
    }
    return membersWithSelf(state.userName);
  }, [live, liveMembersList, state.userName]);

  const friendDates = useMemo(
    () => friendReadingDates(state.userCompletedDates, today),
    [state.userCompletedDates, today],
  );

  const completions = useMemo(() => {
    if (live) {
      return {
        ...(liveBundleCompletions ?? {}),
        [selfId]: state.userCompletedDates,
      };
    }
    return {
      ...mockFriendCompletions(friendDates),
      [CURRENT_USER_ID]: state.userCompletedDates,
    };
  }, [friendDates, live, liveBundleCompletions, selfId, state.userCompletedDates]);

  const memberIds = useMemo(() => members.map((m) => m.id), [members]);
  const personalStreak = consecutiveStreakWithGrace(
    state.userCompletedDates,
    today,
    state.graceDates,
  );
  const groupStreakCount = groupStreakWithGrace(memberIds, completions, today, state.graceDates);
  const todayStatus = dayStatus(state.userCompletedDates, state.inProgressDate, today);
  const groupToday = groupDayProgress(memberIds, completions, today);
  const grace = graceOffer(state.userCompletedDates, state.graceDates, today);

  const groupPlan = livePlan ?? getPlan(state.groupPlanId) ?? getPlan(PSALMS_PLAN_ID)!;
  const personalPlan = state.personalPlanId ? (getPlan(state.personalPlanId) ?? null) : null;
  const todayGroupReading = planDayForDate(groupPlan, state.groupPlanStartDate, today);
  const todayPersonalReading =
    personalPlan && state.personalPlanStartDate
      ? planDayForDate(personalPlan, state.personalPlanStartDate, today)
      : null;

  const specialFriend = members.find((member) => member.isSpecialFriend) ?? pendingFriend;

  const myCheckInToday =
    state.checkIns.find((item) => item.authorId === selfId && item.date === today) ?? null;
  const friendCheckInToday = live
    ? (state.checkIns.find((item) => item.authorId === specialFriend.id && item.date === today) ??
      null)
    : (state.checkIns.find((item) => item.authorId === SPECIAL_FRIEND_ID && item.date === today) ??
      friendCheckInForToday(today));

  const isDuoActive = isDuoPlan(groupPlan) || Boolean(todayGroupReading.prompt);
  const myDuoAnswerToday =
    state.duoAnswers.find(
      (item) => item.authorId === selfId && item.planDayId === todayGroupReading.id,
    ) ?? null;
  const friendDuoAnswerToday = live
    ? (state.duoAnswers.find(
        (item) => item.authorId === specialFriend.id && item.planDayId === todayGroupReading.id,
      ) ?? null)
    : todayStatus === 'completado' && todayGroupReading.prompt
      ? (state.duoAnswers.find(
          (item) => item.authorId === SPECIAL_FRIEND_ID && item.planDayId === todayGroupReading.id,
        ) ?? friendDuoAnswerForToday(today, todayGroupReading.id, todayGroupReading.prompt))
      : null;

  const completeOnboarding = useCallback(async () => {
    const name = draft.name.trim() || 'Amiga';
    if (user) {
      try {
        if (draft.mode === 'join') {
          await joinDuo(draft.inviteCode);
        } else {
          await createDuo(draft.groupName.trim() || name);
        }
        await updateDisplayName(user.id, name).catch(() => undefined);
        await refreshLive();
        setSyncError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo guardar el dúo.';
        setSyncError(message);
        throw error;
      }
      return;
    }

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
      prayerRequests: seedPrayerRequests(),
      heartVerses: seedHeartVerses(),
    };
    setState(next);
    await dataSource.save(next);
  }, [draft, refreshLive, user]);

  const openReading = useCallback(() => {
    setState((prev) => {
      if (prev.userCompletedDates.includes(today)) return prev;
      return { ...prev, inProgressDate: today };
    });
  }, [today]);

  const completeToday = useCallback(() => {
    const dates = withDate(state.userCompletedDates, today);
    const nextCompletions = live
      ? { ...(liveBundleCompletions ?? {}), [selfId]: dates }
      : { ...mockFriendCompletions(dates), [CURRENT_USER_ID]: dates };
    const ids = live ? Object.keys({ ...nextCompletions, [selfId]: dates }) : memberIds;
    const nextPersonal = consecutiveStreakWithGrace(dates, today, state.graceDates);
    const nextGroup = groupStreakWithGrace(ids, nextCompletions, today, state.graceDates);
    const result = {
      personalStreak: nextPersonal,
      groupStreak: nextGroup,
      groupJustUnlocked: nextGroup > groupStreakCount,
    };

    setState((prev) => ({
      ...prev,
      userCompletedDates: withDate(prev.userCompletedDates, today),
      inProgressDate: null,
      personalBest: Math.max(prev.personalBest, nextPersonal),
      groupBest: Math.max(prev.groupBest, nextGroup),
    }));

    if (user && state.remotePlanId) {
      void upsertCompletion({
        planId: state.remotePlanId,
        userId: user.id,
        dayNumber: todayGroupReading.dayNumber,
        completedOn: today,
        usedGrace: false,
      })
        .then(() => refreshLive())
        .catch((error: unknown) => {
          setSyncError(error instanceof Error ? error.message : 'No se pudo guardar el día.');
        });
    }

    return result;
  }, [
    groupStreakCount,
    live,
    liveBundleCompletions,
    memberIds,
    refreshLive,
    selfId,
    state.graceDates,
    state.remotePlanId,
    state.userCompletedDates,
    today,
    todayGroupReading.dayNumber,
    user,
  ]);

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
      if (user && state.remoteDuoId) {
        void insertHeartVerse({
          duoId: state.remoteDuoId,
          authorId: user.id,
          reference,
          text,
          note: trimmedNote.slice(0, HEART_NOTE_MAX),
        })
          .then(() => refreshLive())
          .catch((error: unknown) => {
            setSyncError(error instanceof Error ? error.message : 'No se pudo guardar el versículo.');
          });
      }
    },
    [refreshLive, selfId, state.remoteDuoId, user],
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
      if (user && state.remoteDuoId) {
        void upsertCheckIn({
          userId: user.id,
          duoId: state.remoteDuoId,
          mood,
          note: clipped,
          checkedOn: today,
        })
          .then(() => refreshLive())
          .catch((error: unknown) => {
            setSyncError(error instanceof Error ? error.message : 'No se pudo guardar el check-in.');
          });
      }
    },
    [refreshLive, selfId, state.remoteDuoId, today, user],
  );

  const saveHeartVerse = useCallback(
    (reference: string, text: string, note: string) => {
      shareVerse(reference, text, note);
    },
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
      if (user && state.remoteDuoId) {
        void insertPrayer({ duoId: state.remoteDuoId, authorId: user.id, body: clipped })
          .then(() => refreshLive())
          .catch((error: unknown) => {
            setSyncError(error instanceof Error ? error.message : 'No se pudo dejar el pedido.');
          });
      }
    },
    [refreshLive, selfId, state.remoteDuoId, user],
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
      if (user && state.remoteDuoId) {
        void markPrayerAnswered(requestId)
          .then(() => refreshLive())
          .catch((error: unknown) => {
            setSyncError(error instanceof Error ? error.message : 'No se pudo marcar la oración.');
          });
      }
    },
    [refreshLive, selfId, state.remoteDuoId, user],
  );

  const saveDuoAnswer = useCallback(
    (text: string) => {
      const clipped = text.trim().slice(0, DUO_ANSWER_MAX);
      if (!clipped || !todayGroupReading.prompt) return;
      setState((prev) => {
        const withoutMine = prev.duoAnswers.filter(
          (item) => !(item.authorId === selfId && item.planDayId === todayGroupReading.id),
        );
        return {
          ...prev,
          duoAnswers: [
            ...withoutMine,
            {
              id: newId('duo'),
              authorId: selfId,
              date: today,
              planDayId: todayGroupReading.id,
              question: todayGroupReading.prompt ?? '',
              text: clipped,
            },
          ],
        };
      });
      if (user && state.remotePlanId) {
        void upsertPlanAnswer({
          planId: state.remotePlanId,
          userId: user.id,
          dayNumber: todayGroupReading.dayNumber,
          answer: clipped,
        })
          .then(() => refreshLive())
          .catch((error: unknown) => {
            setSyncError(error instanceof Error ? error.message : 'No se pudo guardar la respuesta.');
          });
      }
    },
    [
      refreshLive,
      selfId,
      state.remotePlanId,
      today,
      todayGroupReading.dayNumber,
      todayGroupReading.id,
      todayGroupReading.prompt,
      user,
    ],
  );

  const useGraceDay = useCallback(() => {
    const gap = yesterday(today);
    setState((prev) => {
      if (prev.graceDates.includes(gap)) return prev;
      return { ...prev, graceDates: [...prev.graceDates, gap] };
    });
    if (user && state.remotePlanId) {
      const gapDay = planDayForDate(groupPlan, state.groupPlanStartDate, gap);
      void upsertCompletion({
        planId: state.remotePlanId,
        userId: user.id,
        dayNumber: gapDay.dayNumber,
        completedOn: gap,
        usedGrace: true,
      })
        .then(() => refreshLive())
        .catch((error: unknown) => {
          setSyncError(error instanceof Error ? error.message : 'No se pudo guardar la gracia.');
        });
    }
  }, [groupPlan, refreshLive, state.groupPlanStartDate, state.remotePlanId, today, user]);

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
    selfId,
    syncError,
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
    isDuoActive,
    grace,
    myDuoAnswerToday,
    friendDuoAnswerToday,
    saveDuoAnswer,
    useGraceDay,
    simulateMissedDay,
    completeOnboarding,
    openReading,
    completeToday,
    shareVerse,
    postNote,
    saveCheckIn,
    saveHeartVerse,
    addPrayerRequest,
    markPrayed,
    specialFriend,
    myCheckInToday,
    friendCheckInToday,
    prayerRequests: state.prayerRequests,
    heartVerses: state.heartVerses,
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

export type { PlanKind };
