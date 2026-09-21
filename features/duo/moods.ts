import type { MoodId } from '@/lib/types';

export const CHECK_IN_NOTE_MAX = 140;
export const HEART_NOTE_MAX = 160;
export const PRAYER_MAX = 160;
export const DUO_ANSWER_MAX = 180;
export const JOURNAL_BODY_MAX = 800;
export const JOURNAL_TITLE_MAX = 80;
export const PERSONAL_NOTE_MAX = 180;

export const MOODS: { id: MoodId; label: string; hint: string }[] = [
  { id: 'paz', label: 'Paz', hint: 'El texto te sosegó' },
  { id: 'lucha', label: 'Lucha', hint: 'Hoy pesa, y está bien decirlo' },
  { id: 'gratitud', label: 'Gratitud', hint: 'Algo pequeño se volvió gracias' },
  { id: 'duda', label: 'Duda', hint: 'Preguntas honestas también son oración' },
  { id: 'esperanza', label: 'Esperanza', hint: 'Se abrió una rendija de luz' },
];

export function moodLabel(id: MoodId): string {
  return MOODS.find((mood) => mood.id === id)?.label ?? id;
}

export function asMood(value: string): MoodId {
  return MOODS.some((mood) => mood.id === value) ? (value as MoodId) : 'paz';
}
