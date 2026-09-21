/** Fechas locales YYYY-MM-DD. Evitamos ISO UTC para que el día no salte con el huso. */

export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(now = new Date()): string {
  return toDayKey(now);
}

export function parseDayKey(dayKey: string): Date {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dayKey: string, delta: number): string {
  const date = parseDayKey(dayKey);
  date.setDate(date.getDate() + delta);
  return toDayKey(date);
}

export function yesterday(dayKey: string): string {
  return addDays(dayKey, -1);
}

export function calendarDiff(start: string, end: string): number {
  const a = parseDayKey(start).getTime();
  const b = parseDayKey(end).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function lastNDays(today: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, -(n - 1 - i)));
}

export function formatLongDate(dayKey: string): string {
  return new Intl.DateTimeFormat('es-GT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseDayKey(dayKey));
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('es-GT', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}
