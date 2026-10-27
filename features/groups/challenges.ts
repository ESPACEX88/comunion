export type ChallengeKind = 'count' | 'once';

export type GroupChallengeDef = {
  id: string;
  title: string;
  body: string;
  target: number;
  kind: ChallengeKind;
};

export const GROUP_CHALLENGES: GroupChallengeDef[] = [
  {
    id: 'leer-5',
    title: 'Cinco días de lectura',
    body: 'Marcá cinco días esta semana. No hace falta que sean seguidos.',
    target: 5,
    kind: 'count',
  },
  {
    id: 'memoriza',
    title: 'Un versículo de memoria',
    body: 'Elegí un versículo y llevátelo a la calle, sin apuro.',
    target: 1,
    kind: 'once',
  },
  {
    id: 'ora-por',
    title: 'Orá por alguien del grupo',
    body: 'Un nombre, una oración. Después marcás acá.',
    target: 1,
    kind: 'once',
  },
  {
    id: 'silencio',
    title: 'Diez minutos con un salmo',
    body: 'Sin prisa. Un salmo, en silencio, esta semana.',
    target: 1,
    kind: 'once',
  },
  {
    id: 'comparte',
    title: 'Compartí un versículo',
    body: 'Mandáselo a alguien fuera del grupo. Después lo marcás.',
    target: 1,
    kind: 'once',
  },
];

export const GROUP_EMOJIS = ['✦', '✝', '🕊', '🌿', '🔥', '☀️', '🌙', '💧'] as const;

export const GROUP_COLOR_IDS = ['amber', 'olive', 'terracotta', 'gold', 'dusk'] as const;
export type GroupColorId = (typeof GROUP_COLOR_IDS)[number];

export const GROUP_COLOR_HEX: Record<GroupColorId, string> = {
  amber: '#C47B2A',
  olive: '#5C6844',
  terracotta: '#A65D46',
  gold: '#D4923F',
  dusk: '#6B547C',
};

export function challengeById(id: string): GroupChallengeDef {
  return GROUP_CHALLENGES.find((item) => item.id === id) ?? GROUP_CHALLENGES[0];
}

export function rotatingChallenge(weekStart: string): GroupChallengeDef {
  const n = Number(weekStart.replace(/-/g, '')) || 0;
  return GROUP_CHALLENGES[n % GROUP_CHALLENGES.length];
}
