import {
  loadHighlights,
  saveHighlights,
  setVerseHighlight,
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
  const [selected, setSelected] = useState<BibleVerse | null>(null);
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
    setSelected(null);
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
      if (prev?.n === verse.n) {
        setPaletteOpen(false);
        return null;
      }
      return verse;
    });
  }, []);

  const onCopy = useCallback(async () => {
    if (!selected) return;
    const line = `${selected.n} ${selected.text}\n— ${reference}`;
    await Clipboard.setStringAsync(line);
    setCopied(true);
  }, [reference, selected]);

  const onTogglePalette = useCallback(() => {
    setPaletteOpen((open) => !open);
  }, []);

  const onPickColor = useCallback(
    (colorId: HighlightColorId) => {
      if (!selected) return;
      persist(setVerseHighlight(map, passageKey, selected.n, colorId));
    },
    [map, passageKey, persist, selected],
  );

  const clear = useCallback(() => {
    setSelected(null);
    setPaletteOpen(false);
    setCopied(false);
  }, []);

  const colorsByVerse = useMemo(() => map[passageKey] ?? {}, [map, passageKey]);

  return {
    selectedN: selected?.n ?? null,
    colorsByVerse,
    paletteOpen,
    copied,
    onSelect,
    onCopy,
    onTogglePalette,
    onPickColor,
    clear,
  };
}
