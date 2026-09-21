import { CHECK_IN_NOTE_MAX } from '@/features/duo/moods';
import type { CheckIn, DuoAnswer, HeartVerse, PrayerRequest } from '@/lib/types';

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

export function friendDuoAnswerForToday(
  today: string,
  planDayId: string,
  question: string,
): DuoAnswer {
  const answers: Record<string, string> = {
    'salmos-1': 'En el árbol junto al agua. Me imaginé leyéndolo con vos, sin prisa.',
    'salmos-23': 'En el valle. No porque esté oscuro, sino porque ahí se nota que no vamos solas.',
    'salmos-27': 'Cuando dice «buscad mi rostro». Hoy eso me sonó a quedarme un rato más.',
    'salmos-51': 'El corazón limpio. No como exigencia: como un lugar al que todavía se puede volver.',
    'salmos-91': 'En el abrigo. Me acordé de cuando hablamos de no tener que poder con todo.',
    'salmos-121': 'En el socorro que no viene del monte, sino de quien hizo el monte.',
    'salmos-139': 'Que me conoce y no se espanta. Eso me da ganas de ser más honesta con vos también.',
    'juan-1': 'Que se hizo carne: que Dios no se quedó en una idea. Me gusta leer eso a tu lado.',
    'juan-1b': '«Venid y ved.» Hoy eso me suena a no tener la respuesta lista.',
    'juan-2': 'Las tinajas. Hay cosas mías que todavía están vacías, y está bien decirlo.',
  };
  return {
    id: `seed-duo-ana-${today}-${planDayId}`,
    authorId: SPECIAL_FRIEND_ID,
    date: today,
    planDayId,
    question,
    text: answers[planDayId] ?? 'Hoy me quedé en silencio un rato. Después te cuento con más calma.',
  };
}

function clipNote(text: string): string {
  return text.length <= CHECK_IN_NOTE_MAX ? text : text.slice(0, CHECK_IN_NOTE_MAX);
}
