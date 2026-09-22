import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BibleBook, BibleChapterMeta, BiblePassage, SelectedBible } from './types';

const META_KEY = '@comunion/bible/meta';
const BOOKS_PREFIX = '@comunion/bible/books/';
const CHAPTERS_PREFIX = '@comunion/bible/chapters/';
const TEXT_PREFIX = '@comunion/bible/text/';
const LRU_KEY = '@comunion/bible/lru';
const MAX_CACHED_TEXTS = 120;

export async function loadSelectedBible(): Promise<SelectedBible | null> {
  const raw = await AsyncStorage.getItem(META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SelectedBible;
  } catch {
    return null;
  }
}

export async function saveSelectedBible(bible: SelectedBible): Promise<void> {
  await AsyncStorage.setItem(META_KEY, JSON.stringify(bible));
}

export async function loadBooks(bibleId: string): Promise<BibleBook[] | null> {
  const raw = await AsyncStorage.getItem(`${BOOKS_PREFIX}${bibleId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BibleBook[];
  } catch {
    return null;
  }
}

export async function saveBooks(bibleId: string, books: BibleBook[]): Promise<void> {
  await AsyncStorage.setItem(`${BOOKS_PREFIX}${bibleId}`, JSON.stringify(books));
}

export async function loadChapterList(bibleId: string, bookId: string): Promise<BibleChapterMeta[] | null> {
  const raw = await AsyncStorage.getItem(`${CHAPTERS_PREFIX}${bibleId}/${bookId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BibleChapterMeta[];
  } catch {
    return null;
  }
}

export async function saveChapterList(
  bibleId: string,
  bookId: string,
  chapters: BibleChapterMeta[],
): Promise<void> {
  await AsyncStorage.setItem(`${CHAPTERS_PREFIX}${bibleId}/${bookId}`, JSON.stringify(chapters));
}

export async function loadPassage(bibleId: string, passageId: string): Promise<BiblePassage | null> {
  const raw = await AsyncStorage.getItem(`${TEXT_PREFIX}${bibleId}/${passageId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BiblePassage;
  } catch {
    return null;
  }
}

export async function savePassage(passage: BiblePassage): Promise<void> {
  const key = `${TEXT_PREFIX}${passage.bibleId}/${passage.id}`;
  await AsyncStorage.setItem(key, JSON.stringify(passage));
  await touchLru(key);
}

async function touchLru(key: string): Promise<void> {
  let list: string[] = [];
  try {
    const raw = await AsyncStorage.getItem(LRU_KEY);
    list = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    list = [];
  }
  list = [key, ...list.filter((item) => item !== key)];
  const evict = list.slice(MAX_CACHED_TEXTS);
  list = list.slice(0, MAX_CACHED_TEXTS);
  await AsyncStorage.setItem(LRU_KEY, JSON.stringify(list));
  await Promise.all(evict.map((item) => AsyncStorage.removeItem(item)));
}
