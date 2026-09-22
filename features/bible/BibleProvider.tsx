import {
  BibleApiError,
  MissingBibleKeyError,
  ensurePreferredBible,
  getChapter,
  getPassageByRef,
  hasApiBibleKey,
  listBooks,
  listChapters,
} from '@/lib/bible/apiBible';
import type { BibleBook, BibleChapterMeta, BiblePassage, SelectedBible } from '@/lib/bible/types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type BibleContextValue = {
  missingKey: boolean;
  ready: boolean;
  bible: SelectedBible | null;
  books: BibleBook[];
  error: string | null;
  ensureReady: () => Promise<void>;
  loadChapters: (bookId: string) => Promise<BibleChapterMeta[]>;
  loadChapter: (chapterId: string) => Promise<BiblePassage>;
  loadRef: (reference: string) => Promise<BiblePassage>;
};

const BibleContext = createContext<BibleContextValue | null>(null);

function friendlyError(error: unknown): string {
  if (error instanceof MissingBibleKeyError) {
    return 'Falta configurar API.Bible';
  }
  if (error instanceof BibleApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'No se pudo abrir la Biblia ahora.';
}

export function BibleProvider({ children }: { children: ReactNode }) {
  const missingKey = !hasApiBibleKey();
  const [ready, setReady] = useState(missingKey);
  const [bible, setBible] = useState<SelectedBible | null>(null);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [error, setError] = useState<string | null>(missingKey ? 'Falta configurar API.Bible' : null);

  const ensureReady = useCallback(async () => {
    if (!hasApiBibleKey()) {
      setError('Falta configurar API.Bible');
      setReady(true);
      return;
    }
    try {
      const selected = await ensurePreferredBible();
      const nextBooks = await listBooks(selected.id);
      setBible(selected);
      setBooks(nextBooks);
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
      error,
      ensureReady,
      loadChapters,
      loadChapter,
      loadRef,
    }),
    [missingKey, ready, bible, books, error, ensureReady, loadChapters, loadChapter, loadRef],
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
