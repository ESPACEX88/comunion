import { MissingBibleKey } from '@/components/bible/MissingBibleKey';
import { VerseList } from '@/components/bible/VerseList';
import { BackLink } from '@/components/ui/BackLink';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { useBible } from '@/features/bible/BibleProvider';
import { useBiblePassage } from '@/features/bible/useBiblePassage';
import type { BiblePassage } from '@/lib/bible/types';
import { space } from '@/theme';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function BibliaLeerScreen() {
  const params = useLocalSearchParams<{ chapter?: string; ref?: string; title?: string }>();
  const { missingKey, ready, bible, loadChapter } = useBible();
  const fromRef = useBiblePassage(params.ref);
  const [fromChapter, setFromChapter] = useState<BiblePassage | null>(null);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [chapterLoading, setChapterLoading] = useState(false);

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
          setChapterError(caught instanceof Error ? caught.message : 'No se pudo abrir el capítulo.');
          setFromChapter(null);
        }
      })
      .finally(() => {
        if (!cancelled) setChapterLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.chapter, params.ref, missingKey, ready, loadChapter]);

  const passage = params.ref ? fromRef.passage : fromChapter;
  const loading = params.ref ? fromRef.loading : chapterLoading;
  const error = params.ref ? fromRef.error : chapterError;
  const heading = passage?.reference || params.ref || params.title || 'Pasaje';

  return (
    <Screen>
      <BackLink />
      <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
        {bible?.abbreviation || 'Biblia'}
      </AppText>
      <AppText variant="display" style={{ marginTop: 4 }}>
        {heading}
      </AppText>
      {bible ? (
        <AppText variant="caption" tone="soft" style={{ marginTop: 6 }}>
          {bible.name}
        </AppText>
      ) : null}

      {missingKey ? (
        <View style={{ marginTop: space.xl }}>
          <MissingBibleKey />
        </View>
      ) : loading ? (
        <AppText variant="ui" tone="soft" style={{ marginTop: space.xl }}>
          Trayendo el texto…
        </AppText>
      ) : error ? (
        <View style={{ marginTop: space.xl }}>
          <EmptyState kicker="Pasaje" title={error} body="Si ya lo leíste, puede estar guardado en este teléfono." />
        </View>
      ) : passage && passage.verses.length > 0 ? (
        <View style={{ marginTop: space.xl }}>
          <VerseList verses={passage.verses} />
          {passage.copyright || bible?.copyright ? (
            <AppText variant="caption" tone="soft" style={{ marginTop: space.md }}>
              {passage.copyright || bible?.copyright}
            </AppText>
          ) : (
            <AppText variant="caption" tone="soft" style={{ marginTop: space.md }}>
              Texto vía API.Bible. Uso no comercial.
            </AppText>
          )}
        </View>
      ) : (
        <View style={{ marginTop: space.xl }}>
          <EmptyState kicker="Vacío" title="Este pasaje no trajo versículos." body="Probá otro capítulo o revisá la clave." />
        </View>
      )}
    </Screen>
  );
}
