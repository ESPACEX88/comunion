import { yesterday } from '@/lib/date';
import type { DayProgress, DayStatus } from '@/lib/types';

/**
 * Racha personal
 * -------------
 * Un día cuenta SOLO si la persona terminó la lectura asignada de ese día
 * (no basta un visto suelto). La racha es la cadena de fechas consecutivas
 * que terminan hoy (si ya leyó) o ayer (si hoy todavía está pendiente).
 *
 * Racha de grupo
 * --------------
 * El grupo suma el día únicamente cuando TODOS los miembros actuales
 * completaron la lectura de esa fecha. Hasta entonces se muestra
 * "X de Y leyeron hoy".
 */

export function consecutiveStreak(completedDays: string[], today: string): number {
  const set = new Set(completedDays);
  let cursor = set.has(today) ? today : yesterday(today);
  if (!set.has(cursor)) return 0;
  let count = 0;
  while (set.has(cursor)) {
    count += 1;
    cursor = yesterday(cursor);
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
  const everyoneHas = (day: string) =>
    memberIds.length > 0 && memberIds.every((id) => (completions[id] ?? []).includes(day));

  let cursor = everyoneHas(today) ? today : yesterday(today);
  if (!everyoneHas(cursor)) return 0;
  let count = 0;
  while (everyoneHas(cursor)) {
    count += 1;
    cursor = yesterday(cursor);
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
