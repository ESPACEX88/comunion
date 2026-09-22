import { bibleGetJson } from './http';
import {
  loadBibleCatalog,
  loadBooks,
  loadChapterList,
  loadPassage,
  loadSelectedBible,
  saveBibleCatalog,
  saveBooks,
  saveChapterList,
  savePassage,
  saveSelectedBible,
} from './cache';
import { BibleApiError, MissingBibleKeyError } from './errors';
import { versesFromContent, sliceVerses } from './parseContent';
import { isWholeChapter, parseScriptureRef, passageIdFromRef } from './parseRef';
import { friendlyBibleName, pickPreferredSpanishBible, rankSpanishBibles } from './pickBible';
import type { BibleBook, BibleChapterMeta, BiblePassage, BibleSummary, SelectedBible } from './types';

export { BibleApiError, MissingBibleKeyError } from './errors';

export function apiBibleKey(): string {
  return (process.env.EXPO_PUBLIC_API_BIBLE_KEY ?? '').trim();
}

export function hasApiBibleKey(): boolean {
  return apiBibleKey().length > 0;
}

async function bibleGet<T>(path: string, query?: Record<string, string>): Promise<T> {
  return bibleGetJson<T>(path, query);
}

const CONTENT_QUERY = {
  'content-type': 'html',
  'include-notes': 'false',
  'include-titles': 'false',
  'include-chapter-numbers': 'false',
  'include-verse-numbers': 'true',
  'include-verse-spans': 'true',
};

export async function listBibles(language?: string): Promise<BibleSummary[]> {
  return bibleGet<BibleSummary[]>('/bibles', language ? { language } : undefined);
}

export function toSelectedBible(picked: BibleSummary): SelectedBible {
  return {
    id: picked.id,
    name: friendlyBibleName(picked),
    abbreviation: picked.abbreviationLocal || picked.abbreviation || '',
    copyright: picked.copyright,
  };
}

export async function listSpanishBibles(): Promise<BibleSummary[]> {
  const cached = await loadBibleCatalog();
  if (cached && cached.length > 0) return cached;
  let list: BibleSummary[] = [];
  try {
    list = await listBibles('spa');
  } catch {
    list = [];
  }
  if (list.length === 0) {
    try {
      list = await listBibles();
    } catch {
      list = [];
    }
  }
  const ranked = rankSpanishBibles(list);
  if (ranked.length > 0) {
    await saveBibleCatalog(ranked);
  }
  return ranked;
}

export async function ensurePreferredBible(): Promise<SelectedBible> {
  const cached = await loadSelectedBible();
  if (cached) return cached;
  const list = await listSpanishBibles();
  const picked = pickPreferredSpanishBible(list);
  if (!picked) {
    throw new BibleApiError('No encontré una Biblia en español en tu cuenta de API.Bible.');
  }
  const selected = toSelectedBible(picked);
  await saveSelectedBible(selected);
  return selected;
}

export async function selectBibleEdition(edition: BibleSummary): Promise<SelectedBible> {
  const selected = toSelectedBible(edition);
  await saveSelectedBible(selected);
  return selected;
}

export async function listBooks(bibleId: string): Promise<BibleBook[]> {
  const cached = await loadBooks(bibleId);
  if (cached && cached.length > 0) return cached;
  const books = await bibleGet<BibleBook[]>(`/bibles/${bibleId}/books`);
  await saveBooks(bibleId, books);
  return books;
}

export async function listChapters(bibleId: string, bookId: string): Promise<BibleChapterMeta[]> {
  const cached = await loadChapterList(bibleId, bookId);
  if (cached && cached.length > 0) return cached;
  const chapters = (await bibleGet<BibleChapterMeta[]>(`/bibles/${bibleId}/books/${bookId}/chapters`)).filter(
    (chapter) => chapter.number !== 'intro' && /^\d+$/.test(chapter.number),
  );
  await saveChapterList(bibleId, bookId, chapters);
  return chapters;
}

type ContentPayload = {
  id: string;
  bibleId: string;
  bookId?: string;
  reference?: string;
  content?: unknown;
  copyright?: string;
};

async function fetchContent(bibleId: string, kind: 'chapters' | 'passages', id: string): Promise<BiblePassage> {
  const cached = await loadPassage(bibleId, id);
  if (cached && cached.verses.length > 0) return cached;
  const data = await bibleGet<ContentPayload>(`/bibles/${bibleId}/${kind}/${encodeURIComponent(id)}`, CONTENT_QUERY);
  let verses = versesFromContent(data.content);
  if (verses.length === 0) {
    const json = await bibleGet<ContentPayload>(`/bibles/${bibleId}/${kind}/${encodeURIComponent(id)}`, {
      'content-type': 'json',
      'include-verse-numbers': 'true',
    });
    verses = versesFromContent(json.content);
  }
  const passage: BiblePassage = {
    id,
    bibleId,
    bookId: data.bookId,
    reference: data.reference || id,
    verses,
    copyright: data.copyright,
  };
  if (passage.verses.length > 0) {
    await savePassage(passage);
  }
  return passage;
}

export async function getChapter(bibleId: string, chapterId: string): Promise<BiblePassage> {
  return fetchContent(bibleId, 'chapters', chapterId);
}

export async function getPassage(bibleId: string, passageId: string): Promise<BiblePassage> {
  if (!passageId.includes('-') && passageId.split('.').length === 2) {
    return getChapter(bibleId, passageId);
  }
  return fetchContent(bibleId, 'passages', passageId);
}

export async function getPassageByRef(
  bibleId: string,
  reference: string,
  books: BibleBook[] = [],
): Promise<BiblePassage> {
  const parsed = parseScriptureRef(reference, books);
  if (!parsed) {
    throw new BibleApiError(`No pude leer la referencia «${reference}».`);
  }
  if (!parsed.bookId) {
    throw new BibleApiError(`No reconocí el libro de «${reference}».`);
  }
  const id = passageIdFromRef(parsed);
  if (!id) {
    throw new BibleApiError(`No pude armar el pasaje de «${reference}».`);
  }
  if (isWholeChapter(parsed)) {
    return getChapter(bibleId, id);
  }
  try {
    const passage = await getPassage(bibleId, id);
    if (passage.verses.length > 0) return passage;
  } catch {
    /* caemos al capítulo y recortamos */
  }
  const chapter = await getChapter(bibleId, `${parsed.bookId}.${parsed.chapter}`);
  return {
    ...chapter,
    id,
    reference,
    verses: sliceVerses(chapter.verses, parsed.verseStart, parsed.verseEnd),
  };
}
