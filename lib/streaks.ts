import { CURRENT_USER_ID } from '@/features/plans/content';
import { addDays, sameWeek, yesterday } from '@/lib/date';
import type { DayProgress, DayStatus } from '@/lib/types';

/**
 * Racha personal
 * -------------
 * Un día cuenta SOLO si la persona terminó la lectura asignada de ese día
 * (no basta un visto suelto). La racha es la cadena de fechas consecutivas
 * que terminan hoy (si ya leyó) o ayer (si hoy todavía está pendiente).
 *
 * Gracia (Fase 2)
 * --------------
 * 1 día de gracia por semana (lunes–domingo). El día de gracia PUENTEA un
 * hueco: la racha no se rompe, pero ese día NO suma al número. Hace falta
 * completar la lectura de un día normal para que cuente. Si ya usaste la
 * gracia de la semana, se ofrece «Retomar juntos» (hoy vale 1, sin culpa).
 *
 * Racha de grupo
 * --------------
 * El grupo suma el día únicamente cuando TODOS los miembros actuales
 * completaron la lectura de esa fecha. Hasta entonces se muestra
 * "X de Y leyeron hoy". La gracia del usuario también puentea el dúo/grupo.
 */

export const GRACE_PER_WEEK = 1;

export function consecutiveStreak(completedDays: string[], today: string): number {
  return consecutiveStreakWithGrace(completedDays, today, []);
}

export function consecutiveStreakWithGrace(
  completedDays: string[],
  today: string,
  graceDays: string[],
): number {
  const completed = new Set(completedDays);
  const grace = new Set(graceDays);
  let cursor = completed.has(today) ? today : yesterday(today);
  let count = 0;
  while (true) {
    if (completed.has(cursor)) {
      count += 1;
      cursor = yesterday(cursor);
      continue;
    }
    if (grace.has(cursor)) {
      cursor = yesterday(cursor);
      continue;
    }
    break;
  }
  return count;
}

export function groupDayProgress(
  memberIds: string[],
  completions: Record<string, string[]>,
  day: string,
): DayProgress {
  const completedIds = memberIds.filter((id) => (completions[id] ?? []).includes(day));
  return {
    done: completedIds.length,
    total: memberIds.length,
    completedIds,
    allDone: memberIds.length > 0 && completedIds.length === memberIds.length,
  };
}

export function groupStreak(
  memberIds: string[],
  completions: Record<string, string[]>,
  today: string,
): number {
  return groupStreakWithGrace(memberIds, completions, today, []);
}

export function groupStreakWithGrace(
  memberIds: string[],
  completions: Record<string, string[]>,
  today: string,
  userGraceDays: string[],
): number {
  const grace = new Set(userGraceDays);
  const everyoneRead = (day: string) =>
    memberIds.length > 0 && memberIds.every((id) => (completions[id] ?? []).includes(day));
  const everyoneOrUserGrace = (day: string) =>
    memberIds.length > 0 &&
    memberIds.every((id) => {
      if ((completions[id] ?? []).includes(day)) return true;
      return id === CURRENT_USER_ID && grace.has(day);
    });

  let cursor = everyoneRead(today) ? today : yesterday(today);
  let count = 0;
  while (true) {
    if (everyoneRead(cursor)) {
      count += 1;
      cursor = yesterday(cursor);
      continue;
    }
    if (everyoneOrUserGrace(cursor)) {
      cursor = yesterday(cursor);
      continue;
    }
    break;
  }
  return count;
}

export function dayStatus(
  completedDays: string[],
  inProgressDate: string | null,
  today: string,
): DayStatus {
  if (completedDays.includes(today)) return 'completado';
  if (inProgressDate === today) return 'en_curso';
  return 'pendiente';
}

export function withDate(dates: string[], day: string): string[] {
  if (dates.includes(day)) return dates;
  return [...dates, day].sort();
}

export function graceUsedThisWeek(graceDates: string[], today: string): string[] {
  return graceDates.filter((day) => sameWeek(day, today));
}

export function canUseGrace(graceDates: string[], _today: string, gapDay: string): boolean {
  if (graceDates.includes(gapDay)) return false;
  return graceUsedThisWeek(graceDates, gapDay).length < GRACE_PER_WEEK;
}

export function missedYesterday(
  completedDays: string[],
  today: string,
  graceDates: string[] = [],
): boolean {
  const y = yesterday(today);
  return !completedDays.includes(today) && !completedDays.includes(y) && !graceDates.includes(y);
}

export function hadStreakBeforeGap(completedDays: string[], today: string): boolean {
  const twoAgo = addDays(today, -2);
  return consecutiveStreak(completedDays, twoAgo) > 0;
}

export type GraceOffer =
  | { kind: 'offer'; gapDay: string }
  | { kind: 'retomar' }
  | { kind: 'none' };

export function graceOffer(
  completedDays: string[],
  graceDates: string[],
  today: string,
): GraceOffer {
  if (!missedYesterday(completedDays, today, graceDates)) return { kind: 'none' };
  const gapDay = yesterday(today);
  if (!hadStreakBeforeGap(completedDays, today) && consecutiveStreakWithGrace(completedDays, today, graceDates) === 0) {
    const anyPast = completedDays.some((day) => day < today && day !== gapDay);
    if (!anyPast) return { kind: 'none' };
  }
  if (hadStreakBeforeGap(completedDays, today) || completedDays.some((day) => day < gapDay)) {
    if (canUseGrace(graceDates, today, gapDay)) return { kind: 'offer', gapDay };
    return { kind: 'retomar' };
  }
  return { kind: 'none' };
}
