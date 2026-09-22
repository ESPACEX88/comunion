import { dayOfYearIndex } from '@/lib/date';
import { VERSE_OF_DAY_REFS, type VerseOfDayRef } from './verseCalendar';

export function verseOfDayIndex(dayKey: string): number {
  const length = VERSE_OF_DAY_REFS.length;
  const raw = dayOfYearIndex(dayKey) % length;
  return raw < 0 ? raw + length : raw;
}

export function verseOfDayRef(dayKey: string): VerseOfDayRef {
  return VERSE_OF_DAY_REFS[verseOfDayIndex(dayKey)];
}
