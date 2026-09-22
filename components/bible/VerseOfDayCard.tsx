import { AppText } from '@/components/ui/AppText';
import { useBible } from '@/features/bible/BibleProvider';
import { useBiblePassage } from '@/features/bible/useBiblePassage';
import { BIBLE_RETRY_COPY } from '@/lib/bible/errors';
import { radius, space, useTheme } from '@/theme';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

type Props = {
  reference: string;
  kicker: string;
  compact?: boolean;
};

export function VerseOfDayCard({ reference, kicker, compact }: Props) {
  const { colors } = useTheme();
  const { bible } = useBible();
  const { passage, loading, error, missingKey, retry } = useBiblePassage(reference);
  const text = passage?.verses.map((verse) => verse.text).join(' ').trim();

  return (
    <View
      style={{
        backgroundColor: colors.paper,
        borderColor: colors.line,
        borderWidth: 1,
        borderLeftWidth: 3,
        borderLeftColor: colors.amber,
        borderRadius: radius.lg,
        padding: compact ? space.lg : 28,
      }}>
      <AppText variant="label" tone="amber">
        {kicker}
      </AppText>

      {missingKey ? (
        <AppText variant="body" tone="soft" style={{ marginTop: space.md }}>
          La referencia ya es de hoy. El texto llega cuando esté la clave de API.Bible.
        </AppText>
      ) : loading ? (
        <AppText variant="body" tone="soft" style={{ marginTop: space.md }}>
          Trayendo el texto de tu edición…
        </AppText>
      ) : text ? (
        <AppText variant="verse" style={{ marginTop: space.md }}>
          {text}
        </AppText>
      ) : (
        <View style={{ marginTop: space.md }}>
          <AppText variant="body" tone="soft">
            {error && error.length < 90 ? error : BIBLE_RETRY_COPY}
          </AppText>
          <Pressable
            onPress={retry}
            accessibilityRole="button"
            accessibilityLabel="Reintentar el versículo"
            hitSlop={8}
            style={{ marginTop: space.sm }}>
            <AppText variant="caption" tone="amber">
              Reintentar
            </AppText>
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={() => router.push({ pathname: '/biblia/leer', params: { ref: reference } })}
        accessibilityRole="button"
        accessibilityLabel={`${kicker}, ${reference}`}>
        <AppText variant="subtitle" style={{ marginTop: space.lg }}>
          {reference}
        </AppText>
        {bible?.abbreviation ? (
          <AppText variant="caption" tone="soft" style={{ marginTop: 4 }}>
            {bible.abbreviation}
          </AppText>
        ) : null}
        <View style={{ marginTop: space.md }}>
          <AppText variant="caption" tone="amber">
            Abrir en la Biblia
          </AppText>
        </View>
      </Pressable>
    </View>
  );
}
