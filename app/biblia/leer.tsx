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
import { space, useTheme } from '@/theme';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

const GENESIS_SHOT: BiblePassage = {
  id: 'shot-genesis-1',
  bibleId: 'shot',
  reference: 'Génesis 1',
  copyright: 'Texto de demostración.',
  verses: [
    { n: 1, text: 'Al principio Dios hizo el cielo y la tierra.' },
    {
      n: 2,
      text: 'Y la tierra estaba desordenada y sin forma; y estaba oscuro sobre la faz del abismo: y el Espíritu de Dios se movía sobre la faz de las aguas.',
    },
    { n: 3, text: 'Y dijo Dios: Hágase la luz, y fué la luz.' },
    {
      n: 4,
      text: 'Y mirando Dios a la luz, vio que era buena; y Dios hizo una división entre la luz y la oscuridad,',
    },
    {
      n: 5,
      text: 'Nombrando la luz, el día y la oscuridad, la noche. Y hubo tarde y hubo mañana, el primer día.',
    },
    {
      n: 6,
      text: 'Y dijo Dios: Haya un arco visible del cielo que se extiende sobre las aguas, separando las aguas de las aguas.',
    },
  ],
};

export default function BibliaLeerScreen() {
  const params = useLocalSearchParams<{ chapter?: string; ref?: string; title?: string; shot?: string }>();
  const { selfId } = useAppState();
  const { setPreference } = useTheme();
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

  const passage =
    params.shot === 'select' ? GENESIS_SHOT : params.ref ? fromRef.passage : fromChapter;
  const loading = params.shot === 'select' ? false : params.ref ? fromRef.loading : chapterLoading;
  const error = params.shot === 'select' ? null : params.ref ? fromRef.error : chapterError;
  const heading = passage?.reference || params.ref || params.title || 'Pasaje';
  const passageKey = passage?.id || params.chapter || params.ref || heading;
  const verseActions = useVerseActions({
    userId: selfId,
    bibleId: passage?.bibleId || bible?.id || 'plan',
    passageKey,
    reference: heading,
  });

  useEffect(() => {
    if (params.shot !== 'select') return;
    setPreference('dark');
    verseActions.selectNs(GENESIS_SHOT.verses.filter((verse) => verse.n === 2 || verse.n === 4));
    verseActions.openPalette();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shot snapshot
  }, [params.shot]);

  return (
    <Screen
      footer={
        verseActions.selectedCount > 0 ? (
          <VerseActionBar
            selectedCount={verseActions.selectedCount}
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

      {params.shot === 'select' && passage ? (
        <View>
          <VerseList
            verses={passage.verses}
            selectedNs={verseActions.selectedNs}
            colorsByVerse={{ ...verseActions.colorsByVerse, '2': 'gold', '4': 'gold' }}
            onSelect={verseActions.onSelect}
          />
        </View>
      ) : missingKey ? (
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
            selectedNs={verseActions.selectedNs}
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
