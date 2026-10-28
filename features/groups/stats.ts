import { PSALMS_PLAN, planProgress } from '@/features/plans/content';
import type { GroupBundle } from '@/lib/groups';
import { collectiveStreak, groupDayProgress, groupReadThreshold } from '@/lib/streaks';

export function groupTodayStats(bundle: GroupBundle, selfId: string, today: string) {
  const memberIds = bundle.members.map((member) => member.userId);
  const byUser: Record<string, string[]> = {};
  for (const row of bundle.completions) {
    byUser[row.userId] = [...(byUser[row.userId] ?? []), row.completedOn];
  }
  const progress = groupDayProgress(memberIds, byUser, today);
  const streak = collectiveStreak(memberIds, byUser, today);
  const needed = groupReadThreshold(memberIds.length);
  const selfDone = (byUser[selfId] ?? []).includes(today);
  const reading = bundle.plan ? planProgress(PSALMS_PLAN, bundle.plan.startsOn, today) : null;
  return { progress, streak, needed, selfDone, reading, byUser, memberIds };
}
