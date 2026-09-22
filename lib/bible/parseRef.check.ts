import { bookMatchesQuery } from './filterBooks';
import { versesFromContent } from './parseContent';
import { parseScriptureRef, passageIdFromRef } from './parseRef';
import { VERSE_OF_DAY_REFS } from './verseCalendar';
import { personalVerseOfDayRef, sharedVerseOfDayRef, verseOfDayRef } from './verseOfDay';
import { SOLO_PSALMS_PLAN, planDayForDate } from '@/features/plans/content';

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message);
}

const salmo = parseScriptureRef('Salmo 23');
assert(salmo?.bookId === 'PSA' && salmo.chapter === 23 && !salmo.verseStart, 'Salmo 23');
assert(passageIdFromRef(salmo!) === 'PSA.23', 'id Salmo 23');

const salmos = parseScriptureRef('Salmos 1');
assert(salmos?.bookId === 'PSA' && salmos.chapter === 1, 'Salmos 1');

const jn = parseScriptureRef('Jn 3:16');
assert(jn?.bookId === 'JHN' && jn.chapter === 3 && jn.verseStart === 16, 'Jn 3:16');
assert(passageIdFromRef(jn!) === 'JHN.3.16', 'id Jn 3:16');

const juan = parseScriptureRef('Juan 1:1-14');
assert(juan?.bookId === 'JHN' && juan.verseStart === 1 && juan.verseEnd === 14, 'Juan 1:1-14');
assert(passageIdFromRef(juan!) === 'JHN.1.1-JHN.1.14', 'id Juan 1:1-14');

const html = versesFromContent(
  '<p><span data-number="1" class="v">1</span>Jehová es mi pastor; nada me faltará. <span data-number="2" class="v">2</span>En lugares de delicados pastos me hará descansar.</p>',
);
assert(html.length === 2 && html[0].n === 1 && html[0].text.includes('pastor'), 'html verses');

const psalms = { id: 'PSA', bibleId: 'x', abbreviation: 'Sal', name: 'Salmos', nameLong: 'Libro de los Salmos' };
assert(bookMatchesQuery(psalms, 'sal'), 'busca sal');
assert(bookMatchesQuery(psalms, 'Jn') === false, 'sal no es jn');
assert(bookMatchesQuery(psalms, ''), 'vacío muestra todos');

for (const ref of VERSE_OF_DAY_REFS) {
  const parsed = parseScriptureRef(ref);
  assert(parsed?.bookId, `calendario parsea ${ref}`);
  assert(passageIdFromRef(parsed!), `calendario id ${ref}`);
}
assert(VERSE_OF_DAY_REFS.length >= 60, 'al menos 60 pasajes');
assert(verseOfDayRef('2026-01-01') !== verseOfDayRef('2026-01-02'), 'dos dayKeys distintos');
assert(verseOfDayRef('2026-03-15') === verseOfDayRef('2026-03-15'), 'mismo dayKey estable');
assert(
  verseOfDayRef('2026-09-22', 'user-ana') !== verseOfDayRef('2026-09-22', 'user-jose'),
  'mismo día, dos cuentas',
);
assert(
  verseOfDayRef('2026-09-22', 'user-ana') === verseOfDayRef('2026-09-22', 'user-ana'),
  'misma cuenta estable',
);
assert(
  verseOfDayRef('2026-09-22') === verseOfDayRef('2026-09-22'),
  'versículo de los dos estable',
);
assert(
  personalVerseOfDayRef('2026-09-22', { userId: 'aaa', name: 'Ana' }) !==
    personalVerseOfDayRef('2026-09-22', { userId: 'bbb', name: 'José' }),
  'personal por userId',
);
assert(
  sharedVerseOfDayRef('2026-09-22') === verseOfDayRef('2026-09-22'),
  'compartido sin seed',
);

const startToday = planDayForDate(SOLO_PSALMS_PLAN, '2026-09-22', '2026-09-22');
assert(startToday.dayNumber === 1 && startToday.reference === 'Salmo 1', 'lectura de hoy es día 1');
const startIso = planDayForDate(SOLO_PSALMS_PLAN, '2026-09-22T00:00:00.000Z', '2026-09-22');
assert(startIso.dayNumber === 1, 'starts_on ISO no se atrasa');
const dayTwo = planDayForDate(SOLO_PSALMS_PLAN, '2026-09-21', '2026-09-22');
assert(dayTwo.dayNumber === 2, 'ayer empezó, hoy es día 2');

console.log('bible refs ok');
