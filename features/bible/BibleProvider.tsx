import {
  MissingBibleKeyError,
  ensurePreferredBible,
  getChapter,
  getPassageByRef,
  hasApiBibleKey,
  listBooks,
  listChapters,
  listSpanishBibles,
  selectBibleEdition,
} from '@/lib/bible/apiBible';
import { friendlyBibleLoadError } from '@/lib/bible/errors';
import type { BibleBook, BibleChapterMeta, BiblePassage, BibleSummary, SelectedBible } from '@/lib/bible/types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type BibleContextValue = {
  missingKey: boolean;
  ready: boolean;
  bible: SelectedBible | null;
  books: BibleBook[];
  editions: BibleSummary[];
  error: string | null;
  switching: boolean;
  ensureReady: () => Promise<void>;
  selectEdition: (edition: BibleSummary) => Promise<void>;
  loadChapters: (bookId: string) => Promise<BibleChapterMeta[]>;
  loadChapter: (chapterId: string) => Promise<BiblePassage>;
  loadRef: (reference: string) => Promise<BiblePassage>;
};

const BibleContext = createContext<BibleContextValue | null>(null);

function friendlyError(error: unknown): string {
  return friendlyBibleLoadError(error);
}

export function BibleProvider({ children }: { children: ReactNode }) {
  const missingKey = !hasApiBibleKey();
  const [ready, setReady] = useState(missingKey);
  const [bible, setBible] = useState<SelectedBible | null>(null);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [editions, setEditions] = useState<BibleSummary[]>([]);
  const [error, setError] = useState<string | null>(missingKey ? 'Falta configurar API.Bible' : null);
  const [switching, setSwitching] = useState(false);

  const ensureReady = useCallback(async () => {
    if (!hasApiBibleKey()) {
      setError('Falta configurar API.Bible');
      setReady(true);
      return;
    }
    try {
      const selected = await ensurePreferredBible();
      setBible(selected);
      const catalog = await listSpanishBibles().catch(() => [] as BibleSummary[]);
      if (catalog.length > 0) setEditions(catalog);
      const nextBooks = await listBooks(selected.id).catch(() => [] as BibleBook[]);
      if (nextBooks.length > 0) setBooks(nextBooks);
      setError(null);
    } catch (caught) {
      setError(friendlyError(caught));
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void ensureReady();
  }, [ensureReady]);

  const selectEdition = useCallback(async (edition: BibleSummary) => {
    if (!hasApiBibleKey()) {
      setError('Falta configurar API.Bible');
      return;
    }
    setSwitching(true);
    try {
      const selected = await selectBibleEdition(edition);
      const nextBooks = await listBooks(selected.id);
      setBible(selected);
      setBooks(nextBooks);
      setError(null);
    } catch (caught) {
      setError(friendlyError(caught));
    } finally {
      setSwitching(false);
    }
  }, []);

  const loadChapters = useCallback(
    async (bookId: string) => {
      if (!bible) throw new MissingBibleKeyError();
      return listChapters(bible.id, bookId);
    },
    [bible],
  );

  const loadChapter = useCallback(
    async (chapterId: string) => {
      if (!bible) throw new MissingBibleKeyError();
      return getChapter(bible.id, chapterId);
    },
    [bible],
  );

  const loadRef = useCallback(
    async (reference: string) => {
      if (!bible) throw new MissingBibleKeyError();
      return getPassageByRef(bible.id, reference, books);
    },
    [bible, books],
  );

  const value = useMemo(
    () => ({
      missingKey,
      ready,
      bible,
      books,
      editions,
      error,
      switching,
      ensureReady,
      selectEdition,
      loadChapters,
      loadChapter,
      loadRef,
    }),
    [
      missingKey,
      ready,
      bible,
      books,
      editions,
      error,
      switching,
      ensureReady,
      selectEdition,
      loadChapters,
      loadChapter,
      loadRef,
    ],
  );

  return <BibleContext.Provider value={value}>{children}</BibleContext.Provider>;
}

export function useBible() {
  const ctx = useContext(BibleContext);
  if (!ctx) {
    throw new Error('useBible tiene que usarse dentro de BibleProvider');
  }
  return ctx;
}
