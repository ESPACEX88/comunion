import { parseScriptureRef, passageIdFromRef } from './parseRef';
import { versesFromContent } from './parseContent';

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

console.log('bible refs ok');
