import { asDayKey, calendarDiff } from '@/lib/date';
import type { Plan, PlanDay } from '@/lib/types';
import { PSALMS_WEEK_1, PSALMS_WEEKS, soloPsalmsWeeks } from '@/features/plans/psalms-weeks';

export const PSALMS_PLAN_ID = 'salmos-camino';
export const SOLO_PSALMS_PLAN_ID = 'salmos-solitario';
export const JOHN_PLAN_ID = 'juan-primeros-pasos';
export const EXAMPLE_INVITE_CODE = 'MESA-7';
export const EXAMPLE_GROUP_NAME = 'Mesa de Emaús';
export const CURRENT_USER_ID = 'yo';

const johnDays: PlanDay[] = [
  {
    id: 'juan-1',
    dayNumber: 1,
    title: 'El Verbo se hizo carne',
    reference: 'Juan 1:1-14',
    teaser: 'En el principio era el Verbo, y el Verbo era con Dios…',
    prompt: '¿Qué significa para vos que Dios se haya hecho cercano, no lejano?',
    verses: [
      { n: 1, text: 'En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.' },
      { n: 4, text: 'En él estaba la vida, y la vida era la luz de los hombres.' },
      { n: 5, text: 'La luz en las tinieblas resplandece, y las tinieblas no la comprendieron.' },
      {
        n: 14,
        text: 'Y el Verbo se hizo carne, y habitó entre nosotros, y vimos su gloria, gloria como del unigénito del Padre, lleno de gracia y de verdad.',
      },
    ],
    featured: {
      reference: 'Juan 1:14',
      text: 'Y el Verbo se hizo carne, y habitó entre nosotros.',
    },
  },
  {
    id: 'juan-1b',
    dayNumber: 2,
    title: 'Venid y ved',
    reference: 'Juan 1:35-39',
    teaser: 'Jesús se volvió y les dijo: «¿Qué buscáis?»',
    prompt: 'Si Jesús te preguntara «¿qué buscás?», qué le dirías hoy, sin ensayar.',
    verses: [
      { n: 35, text: 'El siguiente día estaba Juan otra vez, y dos de sus discípulos.' },
      { n: 36, text: 'Y mirando a Jesús que andaba, dijo: «Este es el Cordero de Dios.»' },
      {
        n: 38,
        text: 'Jesús se volvió, y viendo que le seguían, les dijo: «¿Qué buscáis?» Ellos le dijeron: «Rabí —que significa Maestro—, ¿dónde moras?»',
      },
      { n: 39, text: 'Les dijo: «Venid y ved.» Fueron, y vieron dónde moraba, y se quedaron con él aquel día.' },
    ],
    featured: {
      reference: 'Juan 1:39',
      text: 'Les dijo: «Venid y ved.»',
    },
  },
  {
    id: 'juan-2',
    dayNumber: 3,
    title: 'Las tinajas de Caná',
    reference: 'Juan 2:1-11',
    teaser: 'Haced todo lo que os dijere.',
    prompt: '¿Dónde hay una tinaja vacía en tu vida que todavía podría llenarse?',
    verses: [
      { n: 1, text: 'Al tercer día se hicieron unas bodas en Caná de Galilea; y estaba allí la madre de Jesús.' },
      { n: 5, text: 'Su madre dijo a los que servían: «Haced todo lo que os dijere.»' },
      { n: 7, text: 'Jesús les dijo: «Llenad estas tinajas de agua.» Y las llenaron hasta arriba.' },
      {
        n: 11,
        text: 'Este principio de señales hizo Jesús en Caná de Galilea, y manifestó su gloria; y sus discípulos creyeron en él.',
      },
    ],
    featured: {
      reference: 'Juan 2:5',
      text: 'Haced todo lo que os dijere.',
    },
  },
];

export const PSALMS_PLAN: Plan = {
  id: PSALMS_PLAN_ID,
  title: 'Salmos de a dos',
  subtitle: 'Siete días, y el salterio sigue',
  description:
    'El salterio para leerlo con alguien cercano. Cada semana de siete se cierra y abre otra, con otros Salmos. Cada día cierra con una pregunta suave.',
  durationLabel: '7 días por ciclo',
  recommendedFor: 'duo',
  days: PSALMS_WEEK_1,
};

export const SOLO_PSALMS_PLAN: Plan = {
  id: SOLO_PSALMS_PLAN_ID,
  title: 'Salmos en solitario',
  subtitle: 'Siete días, y otro ciclo',
  description: 'Siete días para leer y anotar lo que Dios te habla. Al terminar, empieza un ciclo nuevo con otros Salmos.',
  durationLabel: '7 días por ciclo',
  recommendedFor: 'personal',
  days: soloPsalmsWeeks()[0],
};

export const JOHN_PLAN: Plan = {
  id: JOHN_PLAN_ID,
  title: 'El evangelio empieza',
  subtitle: 'Primeros pasos en Juan',
  description:
    'Tres encuentros con Jesús al inicio de Juan. Sirve como plan personal, o como alternativa corta para un grupo nuevo.',
  durationLabel: '3 días',
  recommendedFor: 'personal',
  days: johnDays,
};

export const ALL_PLANS: Plan[] = [PSALMS_PLAN, SOLO_PSALMS_PLAN, JOHN_PLAN];

export function getPlan(id: string): Plan | undefined {
  return ALL_PLANS.find((plan) => plan.id === id);
}

export function isDuoPlan(plan: Plan): boolean {
  return plan.recommendedFor === 'duo';
}

export function planAudienceLabel(plan: Plan): string {
  if (plan.recommendedFor === 'duo') return 'Plan de a dos';
  if (plan.recommendedFor === 'group') return 'Plan del grupo';
  return 'Plan personal';
}

export type PlanProgress = {
  day: PlanDay;
  weekNumber: number;
  cycleIndex: number;
  dayNumber: number;
  cycleLen: number;
  /** Día absoluto 1, 2, … para persistir sin chocar el unique de la semana 1. */
  absoluteDay: number;
  isNewCycle: boolean;
};

function cyclesFor(plan: Plan): PlanDay[][] {
  if (plan.id === PSALMS_PLAN_ID) return PSALMS_WEEKS;
  if (plan.id === SOLO_PSALMS_PLAN_ID) return soloPsalmsWeeks();
  return [plan.days];
}

function dayFromDiff(plan: Plan, diff: number): PlanProgress {
  const cycleLen = Math.max(plan.days.length, 1);
  const safeDiff = Math.max(diff, 0);
  const cycles = cyclesFor(plan);
  const weekIndex = Math.floor(safeDiff / cycleLen);
  const cycleIndex = weekIndex % cycles.length;
  const dayIndex = safeDiff % cycleLen;
  const template = cycles[cycleIndex]?.[dayIndex] ?? plan.days[Math.min(dayIndex, plan.days.length - 1)];
  const day: PlanDay = { ...template, dayNumber: dayIndex + 1 };
  return {
    day,
    weekNumber: weekIndex + 1,
    cycleIndex,
    dayNumber: dayIndex + 1,
    cycleLen,
    absoluteDay: safeDiff + 1,
    isNewCycle: weekIndex > 0,
  };
}

export function planProgress(plan: Plan, startDate: string, today: string): PlanProgress {
  const start = asDayKey(startDate);
  const day = asDayKey(today);
  return dayFromDiff(plan, calendarDiff(start, day));
}

export function planDayForDate(plan: Plan, startDate: string, today: string): PlanDay {
  return planProgress(plan, startDate, today).day;
}

export function planDayAtAbsolute(plan: Plan, absoluteDay: number): PlanDay {
  return dayFromDiff(plan, Math.max(absoluteDay, 1) - 1).day;
}

export function planCaption(progress: PlanProgress): string {
  const base = `Día ${progress.dayNumber} de ${progress.cycleLen}`;
  if (!progress.isNewCycle) return base;
  return `${base} · semana ${progress.weekNumber} · ciclo nuevo`;
}

/** El primer ciclo de 7 ya se recorrió en el calendario (no congela la lectura). */
export function isPlanFinished(plan: Plan, startDate: string, today: string): boolean {
  return calendarDiff(asDayKey(startDate), asDayKey(today)) >= plan.days.length;
}

export function makeInviteCode(name: string): string {
  const slug =
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 4)
      .toUpperCase() || 'MESA';
  return `${slug}-7`;
}

export function newId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
