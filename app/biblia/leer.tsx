import { BibleWarm } from '@/components/bible/BibleWarm';
import { MissingBibleKey } from '@/components/bible/MissingBibleKey';
import { VerseList, VerseActionBar } from '@/components/bible/VerseList';
import { BackLink } from '@/components/ui/BackLink';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useBible } from '@/features/bible/BibleProvider';
import { useBiblePassage } from '@/features/bible/useBiblePassage';
import { useVerseActions } from '@/features/bible/useVerseActions';
import type { BiblePassage } from '@/lib/bible/types';
import { friendlyBibleLoadError } from '@/lib/bible/errors';
import { space } from '@/theme';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function BibliaLeerScreen() {
  const params = useLocalSearchParams<{ chapter?: string; ref?: string; title?: string }>();
  const { selfId } = useAppState();
  const { missingKey, ready, bible, loadChapter } = useBible();
  const fromRef = useBiblePassage(params.ref);
  const [fromChapter, setFromChapter] = useState<BiblePassage | null>(null);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterTick, setChapterTick] = useState(0);

  useEffect(() => {
    if (params.ref || !params.chapter || missingKey || !ready) return;
    let cancelled = false;
    setChapterLoading(true);
    void loadChapter(params.chapter)
      .then((next) => {
        if (!cancelled) {
          setFromChapter(next);
          setChapterError(null);
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setChapterError(friendlyBibleLoadError(caught));
          setFromChapter(null);
        }
      })
      .finally(() => {
        if (!cancelled) setChapterLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.chapter, params.ref, missingKey, ready, loadChapter, chapterTick]);

  const passage = params.ref ? fromRef.passage : fromChapter;
  const loading = params.ref ? fromRef.loading : chapterLoading;
  const error = params.ref ? fromRef.error : chapterError;
  const heading = passage?.reference || params.ref || params.title || 'Pasaje';
  const passageKey = passage?.id || params.chapter || params.ref || heading;
  const verseActions = useVerseActions({
    userId: selfId,
    bibleId: passage?.bibleId || bible?.id || 'plan',
    passageKey,
    reference: heading,
  });

  return (
    <Screen
      footer={
        verseActions.selectedN != null ? (
          <VerseActionBar
            selectedN={verseActions.selectedN}
            paletteOpen={verseActions.paletteOpen}
            copied={verseActions.copied}
            onCopy={() => void verseActions.onCopy()}
            onTogglePalette={verseActions.onTogglePalette}
            onPickColor={verseActions.onPickColor}
            onClose={verseActions.clear}
          />
        ) : null
      }>
      <BackLink />
      <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
        {bible?.abbreviation || 'Biblia'}
      </AppText>
      <AppText variant="display" style={{ marginTop: 8 }}>
        {heading}
      </AppText>
      {bible ? (
        <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
          {bible.name}
        </AppText>
      ) : null}
      <Ornament />

      {missingKey ? (
        <MissingBibleKey />
      ) : loading ? (
        <BibleWarm title="Trayendo el texto…" body="La primera vez viaja. Después queda en este teléfono." />
      ) : error ? (
        <EmptyState
          kicker="Pasaje"
          title={error}
          body="La referencia se queda. Probá de nuevo cuando la red responda."
          actionLabel="Reintentar"
          onAction={() => {
            if (params.ref) fromRef.retry();
            else setChapterTick((value) => value + 1);
          }}
        />
      ) : passage && passage.verses.length > 0 ? (
        <View>
          <VerseList
            verses={passage.verses}
            selectedN={verseActions.selectedN}
            colorsByVerse={verseActions.colorsByVerse}
            onSelect={verseActions.onSelect}
          />
          <AppText variant="caption" tone="soft" style={{ marginTop: space.lg }}>
            {passage.copyright || bible?.copyright || 'Texto vía API.Bible. Uso no comercial.'}
          </AppText>
          <AppText variant="caption" tone="soft" style={{ marginTop: space.sm }}>
            Este capítulo queda en el teléfono, en esta edición.
          </AppText>
        </View>
      ) : (
        <EmptyState kicker="Vacío" title="Este pasaje no trajo versículos." body="Probá otro capítulo o revisá la clave." />
      )}
    </Screen>
  );
}
