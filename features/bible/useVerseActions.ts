import {
  applyVerseHighlights,
  loadHighlights,
  saveHighlights,
  type HighlightColorId,
  type HighlightMap,
} from '@/lib/highlights';
import type { BibleVerse } from '@/lib/bible/types';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useVerseActions(opts: {
  userId: string;
  bibleId: string;
  passageKey: string;
  reference: string;
}) {
  const { userId, bibleId, passageKey, reference } = opts;
  const [map, setMap] = useState<HighlightMap>({});
  const [selected, setSelected] = useState<BibleVerse[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadHighlights(userId, bibleId).then((next) => {
      if (!cancelled) setMap(next);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, bibleId]);

  useEffect(() => {
    setSelected([]);
    setPaletteOpen(false);
    setCopied(false);
  }, [passageKey]);

  const persist = useCallback(
    (next: HighlightMap) => {
      setMap(next);
      void saveHighlights(userId, bibleId, next);
    },
    [userId, bibleId],
  );

  const onSelect = useCallback((verse: BibleVerse) => {
    setCopied(false);
    setSelected((prev) => {
      const exists = prev.some((item) => item.n === verse.n);
      if (exists) {
        const next = prev.filter((item) => item.n !== verse.n);
        if (next.length === 0) setPaletteOpen(false);
        return next;
      }
      return [...prev, verse].sort((a, b) => a.n - b.n);
    });
  }, []);

  const selectNs = useCallback((verses: BibleVerse[]) => {
    setCopied(false);
    setSelected([...verses].sort((a, b) => a.n - b.n));
  }, []);

  const onCopy = useCallback(async () => {
    if (selected.length === 0) return;
    const body = selected.map((verse) => `${verse.n} ${verse.text}`).join('\n');
    await Clipboard.setStringAsync(`${body}\n— ${reference}`);
    setCopied(true);
  }, [reference, selected]);

  const onTogglePalette = useCallback(() => {
    setPaletteOpen((open) => !open);
  }, []);

  const openPalette = useCallback(() => {
    setPaletteOpen(true);
  }, []);

  const onPickColor = useCallback(
    (colorId: HighlightColorId) => {
      if (selected.length === 0) return;
      persist(
        applyVerseHighlights(
          map,
          passageKey,
          selected.map((verse) => verse.n),
          colorId,
          'set',
        ),
      );
    },
    [map, passageKey, persist, selected],
  );

  const clear = useCallback(() => {
    setSelected([]);
    setPaletteOpen(false);
    setCopied(false);
  }, []);

  const colorsByVerse = useMemo(() => map[passageKey] ?? {}, [map, passageKey]);
  const selectedNs = useMemo(() => selected.map((verse) => verse.n), [selected]);

  return {
    selectedNs,
    selectedCount: selected.length,
    colorsByVerse,
    paletteOpen,
    copied,
    onSelect,
    selectNs,
    onCopy,
    onTogglePalette,
    openPalette,
    onPickColor,
    clear,
  };
}
