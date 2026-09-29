import type { PlanDay } from '@/lib/types';

function day(
  id: string,
  dayNumber: number,
  title: string,
  psalm: number,
  teaser: string,
  prompt: string,
  verses: { n: number; text: string }[],
  featuredN: number,
): PlanDay {
  const featured = verses.find((verse) => verse.n === featuredN) ?? verses[0];
  return {
    id,
    dayNumber,
    title,
    reference: `Salmo ${psalm}`,
    teaser,
    prompt,
    verses,
    featured: {
      reference: `Salmo ${psalm}:${featured.n}`,
      text: featured.text,
    },
  };
}

/** Semana 1 — el ciclo original. */
export const PSALMS_WEEK_1: PlanDay[] = [
  day(
    'salmos-1',
    1,
    'El camino de los justos',
    1,
    'Dichoso el que no sigue el consejo de los malos…',
    '¿En qué parte de este pasaje te sentiste más cerca de Dios?',
    [
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
      { n: 4, text: 'No así los malos: son como paja que se lleva el viento.' },
      {
        n: 6,
        text: 'Porque el Señor conoce el camino de los justos, y el camino de los malos se pierde.',
      },
    ],
    2,
  ),
  day(
    'salmos-23',
    2,
    'Nada me falta',
    23,
    'El Señor es mi pastor; nada me falta.',
    '¿Dónde sentís que el Pastor te está llevando esta semana, aunque sea un paso chiquito?',
    [
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
    1,
  ),
  day(
    'salmos-27',
    3,
    'El Señor es mi luz',
    27,
    'El Señor es mi luz y mi salvación: ¿de quién temeré?',
    '¿Qué miedo te gustaría dejarle a esta luz, sin apurarte a resolverlo?',
    [
      {
        n: 1,
        text: 'El Señor es mi luz y mi salvación: ¿de quién temeré? El Señor es la fortaleza de mi vida: ¿de quién he de atemorizarme?',
      },
      {
        n: 4,
        text: 'Una cosa he pedido al Señor, y esa buscaré: habitar en su casa todos los días de mi vida, para contemplar su hermosura y consultar en su templo.',
      },
      { n: 8, text: 'Mi corazón dice: «Buscad mi rostro.» Tu rostro buscaré, Señor.' },
      {
        n: 14,
        text: 'Espera en el Señor; esfuérzate y aliéntese tu corazón. Sí, espera en el Señor.',
      },
    ],
    1,
  ),
  day(
    'salmos-51',
    4,
    'Un corazón nuevo',
    51,
    'Crea en mí, Dios, un corazón limpio.',
    '¿Hay algo que te dé vergüenza nombrarle a Dios, y que igual podrías decirlo en voz baja conmigo?',
    [
      {
        n: 1,
        text: 'Ten misericordia de mí, oh Dios, conforme a tu amor; por tu gran compasión, borra mis rebeliones.',
      },
      {
        n: 10,
        text: 'Crea en mí, Dios, un corazón limpio, y renueva un espíritu firme dentro de mí.',
      },
      { n: 12, text: 'Vuélveme el gozo de tu salvación, y un espíritu noble me sostenga.' },
      {
        n: 17,
        text: 'Los sacrificios de Dios son el espíritu quebrantado; al corazón contrito y humillado no despreciarás tú, oh Dios.',
      },
    ],
    10,
  ),
  day(
    'salmos-91',
    5,
    'Al abrigo del Altísimo',
    91,
    'El que habita al abrigo del Altísimo morará bajo la sombra del Todopoderoso.',
    '¿Dónde necesitás abrigo hoy: en el cuerpo, en la cabeza, o en el corazón?',
    [
      {
        n: 1,
        text: 'El que habita al abrigo del Altísimo morará bajo la sombra del Todopoderoso.',
      },
      {
        n: 2,
        text: 'Diré yo al Señor: «Esperanza mía y castillo mío; mi Dios, en quien confiaré.»',
      },
      {
        n: 4,
        text: 'Con sus plumas te cubrirá, y debajo de sus alas estarás seguro; escudo y adarga es su verdad.',
      },
      {
        n: 11,
        text: 'Pues a sus ángeles mandará acerca de ti, que te guarden en todos tus caminos.',
      },
    ],
    1,
  ),
  day(
    'salmos-121',
    6,
    'Mi ayuda viene del Señor',
    121,
    'Alzaré mis ojos a los montes. ¿De dónde vendrá mi socorro?',
    '¿De dónde estás esperando ayuda, y qué pasaría si esa ayuda ya estuviera cerca?',
    [
      { n: 1, text: 'Alzaré mis ojos a los montes. ¿De dónde vendrá mi socorro?' },
      { n: 2, text: 'Mi socorro viene del Señor, que hizo los cielos y la tierra.' },
      { n: 3, text: 'No dará tu pie al resbaladero, ni se dormirá el que te guarda.' },
      { n: 8, text: 'El Señor guardará tu salida y tu entrada desde ahora y para siempre.' },
    ],
    2,
  ),
  day(
    'salmos-139',
    7,
    'Tú me conocés',
    139,
    'Señor, tú me has examinado y conocido.',
    '¿Qué parte de vos te gustaría que Dios conociera con más ternura esta semana?',
    [
      { n: 1, text: 'Señor, tú me has examinado y conocido.' },
      {
        n: 2,
        text: 'Tú has conocido mi sentarme y mi levantarme; has entendido desde lejos mis pensamientos.',
      },
      { n: 5, text: 'Detrás y delante me rodeaste, y sobre mí pusiste tu mano.' },
      {
        n: 14,
        text: 'Te alabo porque fui hecho de manera admirable; maravillosas son tus obras, y mi alma lo sabe muy bien.',
      },
      {
        n: 23,
        text: 'Examíname, oh Dios, y conoce mi corazón; pruébame y conoce mis pensamientos.',
      },
    ],
    14,
  ),
];

/** Semana 2 — nuevo ciclo, otros Salmos. */
export const PSALMS_WEEK_2: PlanDay[] = [
  day(
    'salmos-8',
    1,
    'Qué es el hombre',
    8,
    '¡Oh Señor, Señor nuestro, cuán glorioso es tu nombre en toda la tierra!',
    '¿Dónde viste hoy algo chiquito que igual habla de su gloria?',
    [
      { n: 1, text: '¡Oh Señor, Señor nuestro, cuán glorioso es tu nombre en toda la tierra!' },
      {
        n: 3,
        text: 'Cuando veo tus cielos, obra de tus dedos, la luna y las estrellas que tú formaste,',
      },
      {
        n: 4,
        text: 'digo: ¿Qué es el hombre, para que tengas de él memoria, y el hijo del hombre, para que lo visites?',
      },
      { n: 9, text: '¡Oh Señor, Señor nuestro, cuán grande es tu nombre en toda la tierra!' },
    ],
    4,
  ),
  day(
    'salmos-19',
    2,
    'Los cielos cuentan',
    19,
    'Los cielos cuentan la gloria de Dios.',
    '¿Qué palabra de hoy te gustaría guardar en la boca, no solo en la cabeza?',
    [
      { n: 1, text: 'Los cielos cuentan la gloria de Dios, y el firmamento anuncia la obra de sus manos.' },
      { n: 7, text: 'La ley del Señor es perfecta, que convierte el alma.' },
      { n: 10, text: 'Deseables son más que el oro, y más que mucho oro afinado; y dulces más que miel.' },
      { n: 14, text: 'Sean gratos los dichos de mi boca y la meditación de mi corazón delante de ti.' },
    ],
    1,
  ),
  day(
    'salmos-34',
    3,
    'Gustad y ved',
    34,
    'Gustad y ved que es bueno el Señor.',
    '¿Dónde necesitás probar, no solo hablar, que Él es bueno?',
    [
      { n: 1, text: 'Bendeciré al Señor en todo tiempo; su alabanza estará de continuo en mi boca.' },
      { n: 8, text: 'Gustad y ved que es bueno el Señor; dichoso el hombre que confía en él.' },
      { n: 18, text: 'Cercano está el Señor a los quebrantados de corazón, y salva a los contritos de espíritu.' },
    ],
    8,
  ),
  day(
    'salmos-42',
    4,
    'Como el ciervo',
    42,
    'Como el ciervo brama por las corrientes de las aguas, así clama por ti, oh Dios, el alma mía.',
    '¿De qué sed estás hablando hoy, sin disfrazarla?',
    [
      {
        n: 1,
        text: 'Como el ciervo brama por las corrientes de las aguas, así clama por ti, oh Dios, el alma mía.',
      },
      { n: 2, text: 'Mi alma tiene sed de Dios, del Dios vivo.' },
      { n: 5, text: '¿Por qué te abates, oh alma mía, y te turbas dentro de mí? Espera en Dios.' },
      { n: 11, text: 'Espera en Dios; porque aún he de alabarle, salvación mía y Dios mío.' },
    ],
    1,
  ),
  day(
    'salmos-46',
    5,
    'Dios es nuestro amparo',
    46,
    'Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.',
    '¿Qué ruido te gustaría que se detuviera un rato, para oírlo a Él?',
    [
      { n: 1, text: 'Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.' },
      { n: 2, text: 'Por tanto, no temeremos, aunque la tierra sea removida.' },
      { n: 10, text: 'Estad quietos, y conoced que yo soy Dios.' },
    ],
    1,
  ),
  day(
    'salmos-103',
    6,
    'Bendice, alma mía',
    103,
    'Bendice, alma mía, al Señor, y no olvides ninguno de sus beneficios.',
    '¿Qué beneficio de esta semana no querés que se te escurra?',
    [
      { n: 1, text: 'Bendice, alma mía, al Señor, y bendiga todo mi ser su santo nombre.' },
      { n: 2, text: 'Bendice, alma mía, al Señor, y no olvides ninguno de sus beneficios.' },
      { n: 8, text: 'El Señor es misericordioso y clemente; lento para la ira, y grande en misericordia.' },
      { n: 12, text: 'Como lejos está el oriente del occidente, hizo alejar de nosotros nuestras rebeliones.' },
    ],
    2,
  ),
  day(
    'salmos-131',
    7,
    'Como un niño destetado',
    131,
    'Señor, no se ha envanecido mi corazón.',
    '¿Qué podrías soltar hoy para quedarte quieto, como en brazos?',
    [
      { n: 1, text: 'Señor, no se ha envanecido mi corazón, ni mis ojos se enaltecieron.' },
      {
        n: 2,
        text: 'En verdad que me he comportado y he acallado mi alma como un niño destetado de su madre.',
      },
      { n: 3, text: 'Espera, oh Israel, en el Señor, desde ahora y para siempre.' },
    ],
    2,
  ),
];

/** Semana 3. */
export const PSALMS_WEEK_3: PlanDay[] = [
  day(
    'salmos-16',
    1,
    'Mi bien está en ti',
    16,
    'El Señor es la porción de mi herencia y de mi copa.',
    '¿Dónde sentís que Él es porción, no premio extra?',
    [
      { n: 1, text: 'Guárdame, oh Dios, porque en ti he confiado.' },
      { n: 2, text: 'Oh alma mía, dijiste al Señor: Tú eres mi Señor; no hay para mí bien fuera de ti.' },
      { n: 5, text: 'El Señor es la porción de mi herencia y de mi copa; tú sustentas mi suerte.' },
      { n: 11, text: 'Me mostrarás la senda de la vida; en tu presencia hay plenitud de gozo.' },
    ],
    11,
  ),
  day(
    'salmos-24',
    2,
    'Del Señor es la tierra',
    24,
    'Del Señor es la tierra y su plenitud.',
    '¿Qué puerta interior todavía no se abrió para el Rey de gloria?',
    [
      { n: 1, text: 'Del Señor es la tierra y su plenitud; el mundo, y los que en él habitan.' },
      { n: 3, text: '¿Quién subirá al monte del Señor? ¿Y quién estará en su lugar santo?' },
      { n: 7, text: 'Alzad, oh puertas, vuestras cabezas, y alzados vosotros, portales eternos, y entrará el Rey de gloria.' },
    ],
    1,
  ),
  day(
    'salmos-32',
    3,
    'Bienaventurado el perdonado',
    32,
    'Bienaventurado aquel cuya transgresión ha sido perdonada.',
    '¿Hay algo que todavía cargás y que ya podrías confesar en voz baja?',
    [
      { n: 1, text: 'Bienaventurado aquel cuya transgresión ha sido perdonada, y cubierto su pecado.' },
      { n: 5, text: 'Mi pecado te declaré, y no encubrí mi iniquidad.' },
      { n: 7, text: 'Tú eres mi refugio; me guardarás de la angustia.' },
    ],
    1,
  ),
  day(
    'salmos-63',
    4,
    'De madrugada te buscaré',
    63,
    'Dios, Dios mío eres tú; de madrugada te buscaré.',
    '¿En qué sequedad de hoy todavía podría haber alabanza?',
    [
      { n: 1, text: 'Dios, Dios mío eres tú; de madrugada te buscaré; mi alma tiene sed de ti.' },
      { n: 3, text: 'Porque mejor es tu misericordia que la vida; mis labios te alabarán.' },
      { n: 8, text: 'Mi alma está apegada a ti; tu diestra me sostiene.' },
    ],
    1,
  ),
  day(
    'salmos-84',
    5,
    'Anhela y aun arde',
    84,
    'Anhela y aun arde mi alma por los atrios del Señor.',
    '¿Qué umbral te gustaría cruzar esta semana, aunque sea de a un paso?',
    [
      { n: 1, text: '¡Cuán amables son tus moradas, oh Señor de los ejércitos!' },
      { n: 2, text: 'Anhela y aun arde mi alma por los atrios del Señor.' },
      { n: 10, text: 'Mejor es un día en tus atrios que mil fuera de ellos.' },
    ],
    2,
  ),
  day(
    'salmos-100',
    6,
    'Cantad con gozo',
    100,
    'Cantad alegres a Dios, habitantes de toda la tierra.',
    '¿Qué alabanza corta podrías decir hoy sin forzarla?',
    [
      { n: 1, text: 'Cantad alegres a Dios, habitantes de toda la tierra.' },
      { n: 3, text: 'Reconoced que el Señor es Dios; él nos hizo, y no nosotros a nosotros mismos.' },
      { n: 5, text: 'Porque el Señor es bueno; para siempre es su misericordia.' },
    ],
    5,
  ),
  day(
    'salmos-145',
    7,
    'Te exaltaré, mi Dios',
    145,
    'Grande es el Señor, y digno de suprema alabanza.',
    '¿A quién cercano le podrías contar hoy una sola bondad de Dios?',
    [
      { n: 1, text: 'Te exaltaré, mi Dios, mi Rey, y bendeciré tu nombre eternamente y para siempre.' },
      { n: 3, text: 'Grande es el Señor, y digno de suprema alabanza; y su grandeza es inescrutable.' },
      { n: 8, text: 'Clemente y misericordioso es el Señor, lento para la ira, y grande en misericordia.' },
      { n: 18, text: 'Cercano está el Señor a todos los que le invocan, a todos los que le invocan de veras.' },
    ],
    3,
  ),
];

/** Semana 4. */
export const PSALMS_WEEK_4: PlanDay[] = [
  day(
    'salmos-15',
    1,
    'Quién habitará',
    15,
    '¿Quién habitará en tu tabernáculo?',
    '¿Qué gesto honesto de hoy se parece más a habitar cerca de Él?',
    [
      { n: 1, text: 'Señor, ¿quién habitará en tu tabernáculo? ¿Quién morará en tu monte santo?' },
      { n: 2, text: 'El que anda en integridad y hace justicia, y habla verdad en su corazón.' },
    ],
    2,
  ),
  day(
    'salmos-25',
    2,
    'A ti, Señor, levantaré',
    25,
    'A ti, oh Señor, levantaré mi alma.',
    '¿Qué camino pedís que te muestre, sin apurarte a saber el mapa entero?',
    [
      { n: 1, text: 'A ti, oh Señor, levantaré mi alma.' },
      { n: 4, text: 'Muéstrame, oh Señor, tus caminos; enséñame tus sendas.' },
      { n: 5, text: 'Encamíname en tu verdad, y enséñame, porque tú eres el Dios de mi salvación.' },
    ],
    4,
  ),
  day(
    'salmos-40',
    3,
    'Puso un cántico nuevo',
    40,
    'Puso luego en mi boca cántico nuevo.',
    '¿Qué espera larga todavía podría volver a ser cántico?',
    [
      { n: 1, text: 'Pacientemente esperé al Señor, y se inclinó a mí, y oyó mi clamor.' },
      { n: 2, text: 'Y me hizo sacar del pozo de la desesperación, del lodo cenagoso.' },
      { n: 3, text: 'Puso luego en mi boca cántico nuevo, alabanza a nuestro Dios.' },
    ],
    3,
  ),
  day(
    'salmos-62',
    4,
    'En Dios está mi alma',
    62,
    'En Dios solamente está acallada mi alma.',
    '¿Dónde estás apoyando el peso, si no es en Él?',
    [
      { n: 1, text: 'En Dios solamente está acallada mi alma; de él viene mi salvación.' },
      { n: 2, text: 'Él solamente es mi roca y mi salvación; es mi refugio, no resbalaré mucho.' },
      { n: 8, text: 'Esperad en él en todo tiempo, oh pueblos; derramad delante de él vuestro corazón.' },
    ],
    1,
  ),
  day(
    'salmos-90',
    5,
    'Señor, tú nos has sido',
    90,
    'Señor, tú nos has sido refugio de generación en generación.',
    '¿Qué de tu día cabe mejor si lo mirás con sus años, no con tu prisa?',
    [
      { n: 1, text: 'Señor, tú nos has sido refugio de generación en generación.' },
      { n: 2, text: 'Antes que naciesen los montes y formases la tierra y el mundo, desde el siglo y hasta el siglo, tú eres Dios.' },
      { n: 12, text: 'Enséñanos de tal modo a contar nuestros días, que traigamos al corazón sabiduría.' },
    ],
    1,
  ),
  day(
    'salmos-96',
    6,
    'Cantad al Señor',
    96,
    'Cantad al Señor cántico nuevo.',
    '¿Qué cántico nuevo —aunque sea una frase— cabe en tu boca hoy?',
    [
      { n: 1, text: 'Cantad al Señor cántico nuevo; cantad al Señor, toda la tierra.' },
      { n: 2, text: 'Cantad al Señor, bendecid su nombre; anunciad de día en día su salvación.' },
      { n: 4, text: 'Porque grande es el Señor, y digno de suprema alabanza.' },
    ],
    1,
  ),
  day(
    'salmos-150',
    7,
    'Alabad a Dios',
    150,
    'Todo lo que respira alabe al Señor.',
    '¿Con qué aliento chiquito podrías alabar hoy, sin espectáculo?',
    [
      { n: 1, text: 'Alabad a Dios en su santuario; alabadle en la magnificencia de su firmamento.' },
      { n: 6, text: 'Todo lo que respira alabe al Señor. Aleluya.' },
    ],
    6,
  ),
];

export const PSALMS_WEEKS: PlanDay[][] = [PSALMS_WEEK_1, PSALMS_WEEK_2, PSALMS_WEEK_3, PSALMS_WEEK_4];

const SOLO_PROMPTS_BY_WEEK: string[][] = [
  [
    '¿En qué te está invitando el Señor a echar raíces?',
    '¿Dónde necesitás hoy que Él te pastoree?',
    '¿De qué miedo querés soltar la mano?',
    '¿Dónde necesitás recordar que Él es tu refugio?',
    '¿Qué querés poner delante de Él con honestidad?',
    '¿En qué área pedís cobijo y cuidado?',
    '¿Qué parte de vos querés que Él siga conociendo?',
  ],
  [
    '¿Qué gloria chiquita viste hoy sin buscarla?',
    '¿Qué palabra te gustaría que te acompañe de día y de noche?',
    '¿Dónde querés gustar, no solo saber, que Él es bueno?',
    '¿De qué tenés sed, si sos honesto?',
    '¿Qué ruido pedís que se calle un rato?',
    '¿Qué beneficio no querés olvidar esta semana?',
    '¿Qué podrías acallar para descansar en Él?',
  ],
  [
    '¿Dónde sentís que Él es tu porción de verdad?',
    '¿Qué puerta interior todavía está cerrada?',
    '¿Qué ya podrías confesar y dejar de cargar?',
    '¿A qué hora de hoy tu alma tiene sed?',
    '¿Qué umbral te da un poco de miedo y un poco de ganas?',
    '¿Qué alabanza corta te sale sin forzarla?',
    '¿A quién le contarías una sola bondad de Dios?',
  ],
  [
    '¿Qué gesto honesto se parece a habitar cerca de Él?',
    '¿Qué senda pedís, aunque no veas el mapa?',
    '¿Qué espera larga podría volver a ser cántico?',
    '¿Dónde estás apoyando el peso, si no es en Él?',
    '¿Cómo contarías este día si lo mirás despacio?',
    '¿Qué cántico nuevo cabe en tu boca hoy?',
    '¿Con qué aliento chiquito alabarías, sin espectáculo?',
  ],
];

export function soloPsalmsWeeks(): PlanDay[][] {
  return PSALMS_WEEKS.map((week, weekIndex) =>
    week.map((item, dayIndex) => ({
      ...item,
      id: `solo-${item.id}`,
      prompt: SOLO_PROMPTS_BY_WEEK[weekIndex]?.[dayIndex] ?? item.prompt,
    })),
  );
}
