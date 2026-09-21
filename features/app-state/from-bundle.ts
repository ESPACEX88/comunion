import { asMood } from '@/features/duo/moods';
import { PSALMS_PLAN, PSALMS_PLAN_ID, SOLO_PSALMS_PLAN, getPlan } from '@/features/plans/content';
import type { DuoBundle, RemotePersonalDay, RemotePersonalPlan } from '@/lib/supabase-api';
import type { CheckIn, DuoAnswer, HeartVerse, PersistedState, Plan, PrayerRequest } from '@/lib/types';

export { asMood };

export function liveCompletions(bundle: DuoBundle): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const row of bundle.completions) {
    if (row.usedGrace) continue;
    map[row.userId] = map[row.userId] ? [...map[row.userId], row.completedOn] : [row.completedOn];
  }
  return map;
}

export function overlayPersonalPlan(plan: RemotePersonalPlan, days: RemotePersonalDay[]): Plan {
  const catalog = SOLO_PSALMS_PLAN;
  const byNumber = new Map(days.map((day) => [day.dayNumber, day]));
  return {
    ...catalog,
    title: plan.title || catalog.title,
    description: plan.description || catalog.description,
    days: catalog.days.map((day) => {
      const remote = byNumber.get(day.dayNumber);
      if (!remote) return day;
      return {
        ...day,
        reference: remote.scriptureRef || day.reference,
        prompt: remote.prompt ?? day.prompt,
      };
    }),
  };
}

export function overlayPlan(bundle: DuoBundle): Plan {
  const catalog = getPlan(PSALMS_PLAN_ID) ?? PSALMS_PLAN;
  if (!bundle.plan) return catalog;
  const byNumber = new Map(bundle.planDays.map((day) => [day.dayNumber, day]));
  return {
    ...catalog,
    id: catalog.id,
    title: bundle.plan.title || catalog.title,
    description: bundle.plan.description || catalog.description,
    days: catalog.days.map((day) => {
      const remote = byNumber.get(day.dayNumber);
      if (!remote) return day;
      return {
        ...day,
        reference: remote.scriptureRef || day.reference,
        prompt: remote.prompt ?? day.prompt,
      };
    }),
  };
}

export function bundleToState(prev: PersistedState, bundle: DuoBundle, userId: string): PersistedState {
  const self = bundle.members.find((member) => member.userId === userId);
  const myDates = bundle.completions
    .filter((row) => row.userId === userId && !row.usedGrace)
    .map((row) => row.completedOn)
    .sort();
  const graceDates = bundle.completions
    .filter((row) => row.userId === userId && row.usedGrace)
    .map((row) => row.completedOn);

  const checkIns: CheckIn[] = bundle.checkIns.map((row) => ({
    id: row.id,
    authorId: row.userId,
    date: row.checkedOn,
    mood: asMood(row.mood),
    note: row.note,
  }));

  const prayerRequests: PrayerRequest[] = bundle.prayers.map((row) => ({
    id: row.id,
    authorId: row.authorId,
    text: row.body,
    createdAt: row.createdAt,
    prayedBy: row.isAnswered
      ? bundle.members.filter((member) => member.userId !== row.authorId).map((member) => member.userId)
      : [],
  }));

  const heartVerses: HeartVerse[] = bundle.heartVerses.map((row) => ({
    id: row.id,
    authorId: row.authorId,
    reference: row.reference,
    text: row.text,
    note: row.note,
    createdAt: row.createdAt,
  }));

  const duoAnswers: DuoAnswer[] = bundle.answers.map((row) => {
    const catalogDay = (getPlan(PSALMS_PLAN_ID) ?? PSALMS_PLAN).days.find((day) => day.dayNumber === row.dayNumber);
    return {
      id: `${row.userId}-${row.dayNumber}`,
      authorId: row.userId,
      date: bundle.plan?.startsOn ?? prev.groupPlanStartDate,
      planDayId: catalogDay?.id ?? `day-${row.dayNumber}`,
      question: catalogDay?.prompt ?? '',
      text: row.answer,
    };
  });

  return {
    ...prev,
    version: 4,
    onboardingComplete: true,
    userId,
    userName: self?.displayName || prev.userName,
    remoteDuoId: bundle.duo.id,
    remotePlanId: bundle.plan?.id ?? null,
    group: {
      id: bundle.duo.id,
      name: bundle.duo.name,
      inviteCode: bundle.duo.inviteCode,
    },
    groupPlanId: PSALMS_PLAN_ID,
    groupPlanStartDate: bundle.plan?.startsOn ?? prev.groupPlanStartDate,
    userCompletedDates: myDates,
    graceDates,
    checkIns,
    prayerRequests,
    heartVerses,
    duoAnswers,
  };
}
