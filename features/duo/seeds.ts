import { CHECK_IN_NOTE_MAX } from '@/features/duo/moods';
import type { CheckIn, HeartVerse, PrayerRequest } from '@/lib/types';

export const SPECIAL_FRIEND_ID = 'ana';
export const SPECIAL_FRIEND_NAME = 'Ana';

export function friendCheckInForToday(today: string): CheckIn {
  return {
    id: `seed-checkin-ana-${today}`,
    authorId: SPECIAL_FRIEND_ID,
    date: today,
    mood: 'paz',
    note: clipNote('El pasaje me dejó quieta. Pensé en vos al leer, como cuando hablamos despacio.'),
  };
}

export function seedPrayerRequests(): PrayerRequest[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'seed-prayer-ana-1',
      authorId: SPECIAL_FRIEND_ID,
      text: 'Por la conversación difícil con mi mamá esta semana. Que no se me endurezca el tono.',
      createdAt: now,
      prayedBy: [],
    },
    {
      id: 'seed-prayer-ana-2',
      authorId: SPECIAL_FRIEND_ID,
      text: 'Para no apurarme al leer, y que el texto se me quede cuando cierre el teléfono.',
      createdAt: now,
      prayedBy: [],
    },
  ];
}

export function seedHeartVerses(): HeartVerse[] {
  return [
    {
      id: 'seed-heart-ana-1',
      authorId: SPECIAL_FRIEND_ID,
      reference: 'Salmo 23:1',
      text: 'El Señor es mi pastor; nada me falta.',
      note: 'Esto me acordó de lo que hablamos: no estamos solas aunque el valle se vea largo.',
      createdAt: new Date().toISOString(),
    },
  ];
}

function clipNote(text: string): string {
  return text.length <= CHECK_IN_NOTE_MAX ? text : text.slice(0, CHECK_IN_NOTE_MAX);
}
