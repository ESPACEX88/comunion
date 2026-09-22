import { dayOfYearIndex } from '@/lib/date';
import { VERSE_OF_DAY_REFS, type VerseOfDayRef } from './verseCalendar';

/** FNV-1a 32-bit. Estable entre sesiones; no es crypto. */
export function stableSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Semilla personal: cuenta (uuid) o, en local, id persistido / nombre. */
export function verseSeedForPerson(input: { userId?: string | null; name?: string | null }): string {
  const id = input.userId?.trim();
  if (id && id !== 'yo') return id;
  const name = input.name?.trim().toLowerCase();
  if (name) return `name:${name}`;
  return 'yo';
}

export function verseOfDayIndex(dayKey: string, seed?: string | null): number {
  const length = VERSE_OF_DAY_REFS.length;
  const mixed = seed ? `${dayKey}|${seed}` : dayKey;
  const raw = (dayOfYearIndex(dayKey) + stableSeed(mixed)) % length;
  return raw < 0 ? raw + length : raw;
}

export function verseOfDayRef(dayKey: string, seed?: string | null): VerseOfDayRef {
  return VERSE_OF_DAY_REFS[verseOfDayIndex(dayKey, seed)];
}

export function personalVerseOfDayRef(
  dayKey: string,
  person: { userId?: string | null; name?: string | null },
): VerseOfDayRef {
  return verseOfDayRef(dayKey, verseSeedForPerson(person));
}

export function sharedVerseOfDayRef(dayKey: string): VerseOfDayRef {
  return verseOfDayRef(dayKey);
}
