import { BibleWarm } from '@/components/bible/BibleWarm';
import { MissingBibleKey } from '@/components/bible/MissingBibleKey';
import { BackLink } from '@/components/ui/BackLink';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useBible } from '@/features/bible/BibleProvider';
import type { BibleChapterMeta } from '@/lib/bible/types';
import { radius, space, useTheme } from '@/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

export default function BibliaBookScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { missingKey, ready, books, bible, loadChapters } = useBible();
  const { colors } = useTheme();
  const book = books.find((item) => item.id === bookId);
  const [chapters, setChapters] = useState<BibleChapterMeta[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId || missingKey || !ready || !bible) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void loadChapters(bookId)
      .then((next) => {
        if (!cancelled) {
          setChapters(next);
          setError(null);
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'No se pudieron cargar los capítulos.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookId, missingKey, ready, bible, loadChapters]);

  return (
    <Screen>
      <BackLink label="Libros" />
      <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
        {bible?.abbreviation || 'Biblia'}
        {book?.abbreviation ? ` · ${book.abbreviation}` : ''}
      </AppText>
      <AppText variant="display" style={{ marginTop: 8 }}>
        {book?.name ?? 'Libro'}
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        Elegí un capítulo. La primera vez se pide; después queda acá.
      </AppText>

      {missingKey ? (
        <View style={{ marginTop: space.xl }}>
          <MissingBibleKey />
        </View>
      ) : loading ? (
        <BibleWarm title="Contando los capítulos…" body="Si ya los abriste, salen de este teléfono." />
      ) : error ? (
        <View style={{ marginTop: space.xl }}>
          <EmptyState
            kicker="Capítulos"
            title={error}
            body="Si ya lo leíste en esta versión, puede estar guardado."
          />
        </View>
      ) : (
        <View
          style={{
            marginTop: space.xl,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
          }}>
          {chapters.map((chapter) => (
            <Pressable
              key={chapter.id}
              onPress={() =>
                router.push({
                  pathname: '/biblia/leer',
                  params: { chapter: chapter.id, title: book?.name ?? '' },
                })
              }
              style={({ pressed }) => ({
                width: 56,
                height: 56,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.line,
                backgroundColor: pressed ? colors.creamDeep : colors.paper,
                alignItems: 'center',
                justifyContent: 'center',
              })}>
              <AppText variant="ui">{chapter.number}</AppText>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}
