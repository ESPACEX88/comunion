import {
  collectiveStreak,
  groupReadThreshold,
  groupThresholdMet,
} from './streaks';

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message);
}

assert(groupReadThreshold(0) === 1, 'vacío pide 1');
assert(groupReadThreshold(1) === 1, 'uno basta');
assert(groupReadThreshold(2) === 1, 'dos: la mitad hacia arriba es 1');
assert(groupReadThreshold(3) === 2, 'tres: 2');
assert(groupReadThreshold(10) === 5, 'diez: 5');
assert(groupReadThreshold(11) === 6, 'once: 6');

const four = ['a', 'b', 'c', 'd'];
const today = '2026-10-27';
const twoDays = {
  a: ['2026-10-27', '2026-10-26'],
  b: ['2026-10-27', '2026-10-26'],
  c: ['2026-10-26'],
  d: [],
};
assert(groupThresholdMet(four, twoDays, today) === true, 'hoy llegan a 2');
assert(collectiveStreak(four, twoDays, today) === 2, 'dos días seguidos con umbral');

const withGap = {
  a: ['2026-10-27', '2026-10-25'],
  b: ['2026-10-27', '2026-10-25'],
  c: [],
  d: [],
};
assert(collectiveStreak(four, withGap, today) === 2, 'un hueco de gracia no rompe');

const nobody = { a: [], b: [], c: [], d: [] };
assert(collectiveStreak(four, nobody, today) === 0, 'nadie leyó');
assert(collectiveStreak([], {}, today) === 0, 'sin miembros');
