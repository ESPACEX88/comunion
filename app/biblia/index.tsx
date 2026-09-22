import { MissingBibleKey } from '@/components/bible/MissingBibleKey';
import { BackLink } from '@/components/ui/BackLink';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useBible } from '@/features/bible/BibleProvider';
import { OT_BOOK_IDS } from '@/lib/bible/parseRef';
import type { BibleBook } from '@/lib/bible/types';
import { space, useTheme } from '@/theme';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

function BookRow({ book }: { book: BibleBook }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/biblia/[bookId]', params: { bookId: book.id } })}
      style={({ pressed }) => ({
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        opacity: pressed ? 0.7 : 1,
      })}>
      <AppText variant="subtitle">{book.name}</AppText>
      <AppText variant="caption" tone="soft" style={{ marginTop: 4 }}>
        {book.abbreviation}
      </AppText>
    </Pressable>
  );
}

export default function BibliaIndex() {
  const { missingKey, ready, bible, books, error, ensureReady } = useBible();
  const oldBooks = books.filter((book) => OT_BOOK_IDS.has(book.id));
  const newBooks = books.filter((book) => !OT_BOOK_IDS.has(book.id));

  return (
    <Screen>
      <BackLink label="Yo" />
      <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
        Biblia
      </AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        Leer la Biblia
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        {bible
          ? `${bible.name}${bible.abbreviation ? ` · ${bible.abbreviation}` : ''}. Los capítulos que abras quedan en este teléfono.`
          : 'Texto completo vía API.Bible. Uso no comercial, plan Starter.'}
      </AppText>

      {missingKey ? (
        <View style={{ marginTop: space.xl }}>
          <MissingBibleKey />
        </View>
      ) : !ready ? (
        <AppText variant="ui" tone="soft" style={{ marginTop: space.xl }}>
          Abriendo la edición en español…
        </AppText>
      ) : error && books.length === 0 ? (
        <View style={{ marginTop: space.xl }}>
          <EmptyState
            kicker="No se pudo abrir"
            title={error}
            body="Probá de nuevo cuando haya red. Si ya leíste un capítulo, puede seguir en la caché."
            actionLabel="Reintentar"
            onAction={() => void ensureReady()}
          />
        </View>
      ) : (
        <View style={{ marginTop: space.xl }}>
          {oldBooks.length > 0 ? (
            <View>
              <AppText variant="label" tone="amber">
                Antiguo Testamento
              </AppText>
              {oldBooks.map((book) => (
                <BookRow key={book.id} book={book} />
              ))}
            </View>
          ) : null}
          {newBooks.length > 0 ? (
            <View style={{ marginTop: space.xl }}>
              <AppText variant="label" tone="amber">
                Nuevo Testamento
              </AppText>
              {newBooks.map((book) => (
                <BookRow key={book.id} book={book} />
              ))}
            </View>
          ) : null}
        </View>
      )}
    </Screen>
  );
}
