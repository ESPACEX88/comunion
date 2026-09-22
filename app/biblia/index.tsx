import { BibleWarm } from '@/components/bible/BibleWarm';
import { MissingBibleKey } from '@/components/bible/MissingBibleKey';
import { VersionCard } from '@/components/bible/VersionCard';
import { BackLink } from '@/components/ui/BackLink';
import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useBible } from '@/features/bible/BibleProvider';
import { bookMatchesQuery } from '@/lib/bible/filterBooks';
import { OT_BOOK_IDS } from '@/lib/bible/parseRef';
import type { BibleBook } from '@/lib/bible/types';
import { space, useTheme } from '@/theme';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

function BookRow({ book }: { book: BibleBook }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/biblia/[bookId]', params: { bookId: book.id } })}
      style={({ pressed }) => ({
        paddingVertical: space.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        opacity: pressed ? 0.7 : 1,
      })}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.md }}>
        <AppText variant="subtitle" style={{ flex: 1 }}>
          {book.name}
        </AppText>
        <AppText variant="caption" tone="amber">
          {book.abbreviation}
        </AppText>
      </View>
    </Pressable>
  );
}

function BookSection({ title, books }: { title: string; books: BibleBook[] }) {
  if (books.length === 0) return null;
  return (
    <View style={{ marginTop: space.xl }}>
      <AppText variant="label" tone="amber">
        {title}
      </AppText>
      <View style={{ marginTop: space.sm }}>
        {books.map((book) => (
          <BookRow key={book.id} book={book} />
        ))}
      </View>
    </View>
  );
}

export default function BibliaIndex() {
  const { missingKey, ready, bible, books, error, ensureReady } = useBible();
  const [query, setQuery] = useState('');
  const { colors } = useTheme();

  const filtered = useMemo(() => books.filter((book) => bookMatchesQuery(book, query)), [books, query]);
  const oldBooks = filtered.filter((book) => OT_BOOK_IDS.has(book.id));
  const newBooks = filtered.filter((book) => !OT_BOOK_IDS.has(book.id));
  const searching = query.trim().length > 0;

  return (
    <Screen>
      <BackLink label="Yo" />
      <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
        Biblia
      </AppText>
      <AppText variant="display" style={{ marginTop: 8 }}>
        Leer despacio
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        Un libro, un capítulo. La edición que elijas se queda; el texto que abras también.
      </AppText>

      <VersionCard bible={bible} onPress={() => router.push('/biblia/versiones')} />

      <View style={{ marginTop: space.xl }}>
        <AppText variant="label" tone="amber">
          Buscar un libro
        </AppText>
        <Field
          value={query}
          onChangeText={setQuery}
          placeholder="Salmos, Jn, Génesis…"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Buscar un libro"
        />
      </View>

      {missingKey ? (
        <View style={{ marginTop: space.xl }}>
          <MissingBibleKey />
        </View>
      ) : !ready ? (
        <BibleWarm title="Un segundo…" body="Estamos abriendo la edición en español." />
      ) : error && books.length === 0 ? (
        <View style={{ marginTop: space.xl }}>
          <EmptyState
            kicker="Sin red, por ahora"
            title={error}
            body="Cuando vuelva la conexión, reintentá. Si ya leíste un capítulo, puede seguir en este teléfono."
            actionLabel="Reintentar"
            onAction={() => void ensureReady()}
          />
        </View>
      ) : searching && filtered.length === 0 ? (
        <View style={{ marginTop: space.xl }}>
          <EmptyState
            kicker="Nada por acá"
            title={`No hay un libro que se parezca a «${query.trim()}».`}
            body="Probá el nombre largo, la abreviatura o unas pocas letras."
          />
        </View>
      ) : (
        <View>
          <BookSection title="Antiguo Testamento" books={oldBooks} />
          <BookSection title="Nuevo Testamento" books={newBooks} />
        </View>
      )}

      {!missingKey && ready && books.length > 0 ? (
        <AppText variant="caption" tone="soft" style={{ marginTop: space.xxl, color: colors.charcoalSoft }}>
          Los capítulos que abras quedan en este teléfono, en esta versión.
        </AppText>
      ) : null}
    </Screen>
  );
}
