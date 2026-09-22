import type { BibleBook, ParsedRef } from './types';

const BOOK_ALIASES: Record<string, string> = {
  genesis: 'GEN',
  gn: 'GEN',
  gen: 'GEN',
  exodo: 'EXO',
  ex: 'EXO',
  exo: 'EXO',
  levitico: 'LEV',
  lev: 'LEV',
  lv: 'LEV',
  numeros: 'NUM',
  num: 'NUM',
  nm: 'NUM',
  deuteronomio: 'DEU',
  deut: 'DEU',
  dt: 'DEU',
  josue: 'JOS',
  jos: 'JOS',
  jueces: 'JDG',
  jc: 'JDG',
  jdc: 'JDG',
  rut: 'RUT',
  rt: 'RUT',
  '1samuel': '1SA',
  '1sam': '1SA',
  '1s': '1SA',
  '2samuel': '2SA',
  '2sam': '2SA',
  '2s': '2SA',
  '1reyes': '1KI',
  '1r': '1KI',
  '2reyes': '2KI',
  '2r': '2KI',
  '1cronicas': '1CH',
  '1cr': '1CH',
  '2cronicas': '2CH',
  '2cr': '2CH',
  esdras: 'EZR',
  esd: 'EZR',
  nehemias: 'NEH',
  neh: 'NEH',
  ester: 'EST',
  est: 'EST',
  job: 'JOB',
  salmo: 'PSA',
  salmos: 'PSA',
  sal: 'PSA',
  sl: 'PSA',
  psalm: 'PSA',
  psalms: 'PSA',
  ps: 'PSA',
  proverbios: 'PRO',
  prov: 'PRO',
  pr: 'PRO',
  eclesiastes: 'ECC',
  ec: 'ECC',
  cantares: 'SNG',
  cantar: 'SNG',
  cnt: 'SNG',
  isaias: 'ISA',
  is: 'ISA',
  jeremias: 'JER',
  jer: 'JER',
  lamentaciones: 'LAM',
  lam: 'LAM',
  ezequiel: 'EZK',
  ez: 'EZK',
  ezeq: 'EZK',
  daniel: 'DAN',
  dn: 'DAN',
  dan: 'DAN',
  oseas: 'HOS',
  os: 'HOS',
  joel: 'JOL',
  amos: 'AMO',
  am: 'AMO',
  abdias: 'OBA',
  jonas: 'JON',
  jon: 'JON',
  miqueas: 'MIC',
  miq: 'MIC',
  nahum: 'NAM',
  habacuc: 'HAB',
  hab: 'HAB',
  sofonias: 'ZEP',
  sof: 'ZEP',
  ageo: 'HAG',
  ag: 'HAG',
  zacarias: 'ZEC',
  zac: 'ZEC',
  malaquias: 'MAL',
  mal: 'MAL',
  mateo: 'MAT',
  mt: 'MAT',
  mat: 'MAT',
  marcos: 'MRK',
  mc: 'MRK',
  mr: 'MRK',
  lucas: 'LUK',
  lc: 'LUK',
  luk: 'LUK',
  juan: 'JHN',
  jn: 'JHN',
  jhn: 'JHN',
  john: 'JHN',
  hechos: 'ACT',
  hch: 'ACT',
  act: 'ACT',
  romanos: 'ROM',
  rom: 'ROM',
  rm: 'ROM',
  '1corintios': '1CO',
  '1cor': '1CO',
  '1co': '1CO',
  '2corintios': '2CO',
  '2cor': '2CO',
  '2co': '2CO',
  galatas: 'GAL',
  gal: 'GAL',
  efesios: 'EPH',
  ef: 'EPH',
  efe: 'EPH',
  filipenses: 'PHP',
  fil: 'PHP',
  flp: 'PHP',
  colosenses: 'COL',
  col: 'COL',
  '1tesalonicenses': '1TH',
  '1tes': '1TH',
  '1ts': '1TH',
  '2tesalonicenses': '2TH',
  '2tes': '2TH',
  '2ts': '2TH',
  '1timoteo': '1TI',
  '1tim': '1TI',
  '1ti': '1TI',
  '2timoteo': '2TI',
  '2tim': '2TI',
  '2ti': '2TI',
  tito: 'TIT',
  tit: 'TIT',
  filemon: 'PHM',
  flm: 'PHM',
  hebreos: 'HEB',
  heb: 'HEB',
  santiago: 'JAS',
  stg: 'JAS',
  sant: 'JAS',
  '1pedro': '1PE',
  '1p': '1PE',
  '1pe': '1PE',
  '2pedro': '2PE',
  '2p': '2PE',
  '2pe': '2PE',
  '1juan': '1JN',
  '1jn': '1JN',
  '2juan': '2JN',
  '2jn': '2JN',
  '3juan': '3JN',
  '3jn': '3JN',
  judas: 'JUD',
  jud: 'JUD',
  apocalipsis: 'REV',
  ap: 'REV',
  apoc: 'REV',
  revelacion: 'REV',
};

export function normalizeBookKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

export function resolveBookId(raw: string, books: BibleBook[] = []): string | null {
  const key = normalizeBookKey(raw);
  if (!key) return null;
  if (BOOK_ALIASES[key]) return BOOK_ALIASES[key];

  const match = books.find((book) => {
    const names = [book.id, book.abbreviation, book.name, book.nameLong ?? ''];
    return names.some((name) => normalizeBookKey(name) === key);
  });
  return match?.id ?? null;
}

const REF_RE =
  /^\s*([1-3]\s*[A-Za-zÁÉÍÓÚáéíóúñÑ.]+|[A-Za-zÁÉÍÓÚáéíóúñÑ.]+)\s+(\d+)(?:\s*[:.]\s*(\d+)(?:\s*[-–]\s*(\d+))?)?\s*$/;

export function parseScriptureRef(input: string, books: BibleBook[] = []): ParsedRef | null {
  const trimmed = input.trim().replace(/\s+/g, ' ');
  const match = trimmed.match(REF_RE);
  if (!match) return null;
  const bookQuery = match[1].replace(/\./g, '').trim();
  const chapter = Number(match[2]);
  if (!Number.isFinite(chapter) || chapter < 1) return null;
  const verseStart = match[3] ? Number(match[3]) : undefined;
  const verseEnd = match[4] ? Number(match[4]) : undefined;
  return {
    bookQuery,
    bookId: resolveBookId(bookQuery, books),
    chapter,
    verseStart,
    verseEnd: verseEnd && verseStart && verseEnd < verseStart ? verseStart : verseEnd,
  };
}

export function passageIdFromRef(ref: ParsedRef): string | null {
  if (!ref.bookId) return null;
  if (ref.verseStart && ref.verseEnd && ref.verseEnd !== ref.verseStart) {
    return `${ref.bookId}.${ref.chapter}.${ref.verseStart}-${ref.bookId}.${ref.chapter}.${ref.verseEnd}`;
  }
  if (ref.verseStart) {
    return `${ref.bookId}.${ref.chapter}.${ref.verseStart}`;
  }
  return `${ref.bookId}.${ref.chapter}`;
}

export function isWholeChapter(ref: ParsedRef): boolean {
  return !ref.verseStart;
}

export const OT_BOOK_IDS = new Set([
  'GEN',
  'EXO',
  'LEV',
  'NUM',
  'DEU',
  'JOS',
  'JDG',
  'RUT',
  '1SA',
  '2SA',
  '1KI',
  '2KI',
  '1CH',
  '2CH',
  'EZR',
  'NEH',
  'EST',
  'JOB',
  'PSA',
  'PRO',
  'ECC',
  'SNG',
  'ISA',
  'JER',
  'LAM',
  'EZK',
  'DAN',
  'HOS',
  'JOL',
  'AMO',
  'OBA',
  'JON',
  'MIC',
  'NAM',
  'HAB',
  'ZEP',
  'HAG',
  'ZEC',
  'MAL',
]);
