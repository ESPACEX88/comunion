export type BibleLanguage = {
  id: string;
  name: string;
  nameLocal?: string;
};

export type BibleSummary = {
  id: string;
  dblId?: string;
  name: string;
  nameLocal?: string;
  abbreviation?: string;
  abbreviationLocal?: string;
  description?: string;
  copyright?: string;
  language?: BibleLanguage;
};

export type BibleBook = {
  id: string;
  bibleId: string;
  abbreviation: string;
  name: string;
  nameLong?: string;
};

export type BibleChapterMeta = {
  id: string;
  bibleId: string;
  bookId: string;
  number: string;
  reference?: string;
};

export type BibleVerse = {
  n: number;
  text: string;
};

export type BiblePassage = {
  id: string;
  bibleId: string;
  bookId?: string;
  reference: string;
  verses: BibleVerse[];
  copyright?: string;
};

export type ParsedRef = {
  bookQuery: string;
  bookId: string | null;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
};

export type SelectedBible = {
  id: string;
  name: string;
  abbreviation: string;
  copyright?: string;
};
