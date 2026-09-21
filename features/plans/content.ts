import { calendarDiff } from '@/lib/date';
import type { Plan, PlanDay } from '@/lib/types';

export const PSALMS_PLAN_ID = 'salmos-camino';
export const SOLO_PSALMS_PLAN_ID = 'salmos-solitario';
export const JOHN_PLAN_ID = 'juan-primeros-pasos';
export const EXAMPLE_INVITE_CODE = 'MESA-7';
export const EXAMPLE_GROUP_NAME = 'Mesa de Emaús';
export const CURRENT_USER_ID = 'yo';

const psalmsDays: PlanDay[] = [
  {
    id: 'salmos-1',
    dayNumber: 1,
    title: 'El camino de los justos',
    reference: 'Salmo 1',
    teaser: 'Dichoso el que no sigue el consejo de los malos…',
    prompt: '¿En qué parte de este pasaje te sentiste más cerca de Dios?',
    verses: [
      {
        n: 1,
        text: 'Dichoso el que no sigue el consejo de los malos, ni se detiene en la senda de los pecadores, ni se sienta en la rueda de los burlones.',
      },
      {
        n: 2,
        text: 'En la ley del Señor está su alegría: medita en ella de día y de noche.',
      },
      {
        n: 3,
        text: 'Será como árbol plantado junto a corrientes de agua, que da su fruto a su tiempo, y su hoja no cae. En todo lo que hace, prospera.',
      },
      {
        n: 4,
        text: 'No así los malos: son como paja que se lleva el viento.',
      },
      {
        n: 6,
        text: 'Porque el Señor conoce el camino de los justos, y el camino de los malos se pierde.',
      },
    ],
    featured: {
      reference: 'Salmo 1:2',
      text: 'En la ley del Señor está su alegría: medita en ella de día y de noche.',
    },
  },
  {
    id: 'salmos-23',
    dayNumber: 2,
    title: 'Nada me falta',
    reference: 'Salmo 23',
    teaser: 'El Señor es mi pastor; nada me falta.',
    prompt: '¿Dónde sentís que el Pastor te está llevando esta semana, aunque sea un paso chiquito?',
    verses: [
      { n: 1, text: 'El Señor es mi pastor; nada me falta.' },
      {
        n: 2,
        text: 'En verdes praderas me hace descansar, junto a aguas tranquilas me conduce;',
      },
      { n: 3, text: 'recobra mi alma. Me guía por sendas justas por amor de su nombre.' },
      {
        n: 4,
        text: 'Aunque camine por valle de sombra, no temeré mal alguno, porque tú estás conmigo: tu vara y tu cayado me sosiegan.',
      },
      {
        n: 6,
        text: 'Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa del Señor habitaré para siempre.',
      },
    ],
    featured: {
      reference: 'Salmo 23:1',
      text: 'El Señor es mi pastor; nada me falta.',
    },
  },
  {
    id: 'salmos-27',
    dayNumber: 3,
    title: 'El Señor es mi luz',
    reference: 'Salmo 27',
    teaser: 'El Señor es mi luz y mi salvación: ¿de quién temeré?',
    prompt: '¿Qué miedo te gustaría dejarle a esta luz, sin apurarte a resolverlo?',
    verses: [
      { n: 1, text: 'El Señor es mi luz y mi salvación: ¿de quién temeré? El Señor es la fortaleza de mi vida: ¿de quién he de atemorizarme?' },
      { n: 4, text: 'Una cosa he pedido al Señor, y esa buscaré: habitar en su casa todos los días de mi vida, para contemplar su hermosura y consultar en su templo.' },
      { n: 8, text: 'Mi corazón dice: «Buscad mi rostro.» Tu rostro buscaré, Señor.' },
      { n: 14, text: 'Espera en el Señor; esfuérzate y aliéntese tu corazón. Sí, espera en el Señor.' },
    ],
    featured: {
      reference: 'Salmo 27:1',
      text: 'El Señor es mi luz y mi salvación: ¿de quién temeré?',
    },
  },
  {
    id: 'salmos-51',
    dayNumber: 4,
    title: 'Un corazón nuevo',
    reference: 'Salmo 51',
    teaser: 'Crea en mí, Dios, un corazón limpio.',
    prompt: '¿Hay algo que te dé vergüenza nombrarle a Dios, y que igual podrías decirlo en voz baja conmigo?',
    verses: [
      { n: 1, text: 'Ten misericordia de mí, oh Dios, conforme a tu amor; por tu gran compasión, borra mis rebeliones.' },
      { n: 10, text: 'Crea en mí, Dios, un corazón limpio, y renueva un espíritu firme dentro de mí.' },
      { n: 12, text: 'Vuélveme el gozo de tu salvación, y un espíritu noble me sostenga.' },
      { n: 17, text: 'Los sacrificios de Dios son el espíritu quebrantado; al corazón contrito y humillado no despreciarás tú, oh Dios.' },
    ],
    featured: {
      reference: 'Salmo 51:10',
      text: 'Crea en mí, Dios, un corazón limpio, y renueva un espíritu firme dentro de mí.',
    },
  },
  {
    id: 'salmos-91',
    dayNumber: 5,
    title: 'Al abrigo del Altísimo',
    reference: 'Salmo 91',
    teaser: 'El que habita al abrigo del Altísimo morará bajo la sombra del Todopoderoso.',
    prompt: '¿Dónde necesitás abrigo hoy: en el cuerpo, en la cabeza, o en el corazón?',
    verses: [
      { n: 1, text: 'El que habita al abrigo del Altísimo morará bajo la sombra del Todopoderoso.' },
      { n: 2, text: 'Diré yo al Señor: «Esperanza mía y castillo mío; mi Dios, en quien confiaré.»' },
      { n: 4, text: 'Con sus plumas te cubrirá, y debajo de sus alas estarás seguro; escudo y adarga es su verdad.' },
      { n: 11, text: 'Pues a sus ángeles mandará acerca de ti, que te guarden en todos tus caminos.' },
    ],
    featured: {
      reference: 'Salmo 91:1',
      text: 'El que habita al abrigo del Altísimo morará bajo la sombra del Todopoderoso.',
    },
  },
  {
    id: 'salmos-121',
    dayNumber: 6,
    title: 'Mi ayuda viene del Señor',
    reference: 'Salmo 121',
    teaser: 'Alzaré mis ojos a los montes. ¿De dónde vendrá mi socorro?',
    prompt: '¿De dónde estás esperando ayuda, y qué pasaría si esa ayuda ya estuviera cerca?',
    verses: [
      { n: 1, text: 'Alzaré mis ojos a los montes. ¿De dónde vendrá mi socorro?' },
      { n: 2, text: 'Mi socorro viene del Señor, que hizo los cielos y la tierra.' },
      { n: 3, text: 'No dará tu pie al resbaladero, ni se dormirá el que te guarda.' },
      { n: 8, text: 'El Señor guardará tu salida y tu entrada desde ahora y para siempre.' },
    ],
    featured: {
      reference: 'Salmo 121:2',
      text: 'Mi socorro viene del Señor, que hizo los cielos y la tierra.',
    },
  },
  {
    id: 'salmos-139',
    dayNumber: 7,
    title: 'Tú me conocés',
    reference: 'Salmo 139',
    teaser: 'Señor, tú me has examinado y conocido.',
    prompt: '¿Qué parte de vos te gustaría que Dios conociera con más ternura esta semana?',
    verses: [
      { n: 1, text: 'Señor, tú me has examinado y conocido.' },
      { n: 2, text: 'Tú has conocido mi sentarme y mi levantarme; has entendido desde lejos mis pensamientos.' },
      { n: 5, text: 'Detrás y delante me rodeaste, y sobre mí pusiste tu mano.' },
      { n: 14, text: 'Te alabo porque fui hecho de manera admirable; maravillosas son tus obras, y mi alma lo sabe muy bien.' },
      { n: 23, text: 'Examíname, oh Dios, y conoce mi corazón; pruébame y conoce mis pensamientos.' },
    ],
    featured: {
      reference: 'Salmo 139:14',
      text: 'Te alabo porque fui hecho de manera admirable; maravillosas son tus obras.',
    },
  },
];

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
      { n: 14, text: 'Y el Verbo se hizo carne, y habitó entre nosotros, y vimos su gloria, gloria como del unigénito del Padre, lleno de gracia y de verdad.' },
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
      { n: 38, text: 'Jesús se volvió, y viendo que le seguían, les dijo: «¿Qué buscáis?» Ellos le dijeron: «Rabí —que significa Maestro—, ¿dónde moras?»' },
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
      { n: 11, text: 'Este principio de señales hizo Jesús en Caná de Galilea, y manifestó su gloria; y sus discípulos creyeron en él.' },
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
  subtitle: 'Siete días, una pregunta cada tarde',
  description:
    'El salterio para leerlo con alguien cercano. Cada día cierra con una pregunta suave —no un examen— para hablar despacio.',
  durationLabel: '7 días',
  recommendedFor: 'duo',
  days: psalmsDays,
};

const soloPrompts = [
  '¿En qué te está invitando el Señor a echar raíces?',
  '¿Dónde necesitás hoy que Él te pastoree?',
  '¿De qué miedo querés soltar la mano?',
  '¿Dónde necesitás recordar que Él es tu refugio?',
  '¿Qué querés poner delante de Él con honestidad?',
  '¿En qué área pedís cobijo y cuidado?',
  '¿Qué parte de vos querés que Él siga conociendo?',
];

export const SOLO_PSALMS_PLAN: Plan = {
  id: SOLO_PSALMS_PLAN_ID,
  title: 'Salmos en solitario',
  subtitle: 'Siete días, vos y el Señor',
  description: 'Siete días para leer y anotar lo que Dios te habla a vos.',
  durationLabel: '7 días',
  recommendedFor: 'personal',
  days: psalmsDays.map((day, index) => ({
    ...day,
    id: `solo-${day.id}`,
    prompt: soloPrompts[index],
  })),
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

export function planDayForDate(plan: Plan, startDate: string, today: string): PlanDay {
  const diff = calendarDiff(startDate, today);
  const index = Math.min(Math.max(diff, 0), plan.days.length - 1);
  return plan.days[index];
}

export function isPlanFinished(plan: Plan, startDate: string, today: string): boolean {
  return calendarDiff(startDate, today) >= plan.days.length;
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
