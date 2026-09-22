import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { useBible } from '@/features/bible/BibleProvider';
import { useBiblePassage } from '@/features/bible/useBiblePassage';
import { verseOfDayRef } from '@/lib/bible/verseOfDay';
import { space } from '@/theme';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

type Props = {
  dayKey: string;
};

export function VerseOfDayCard({ dayKey }: Props) {
  const reference = verseOfDayRef(dayKey);
  const { bible } = useBible();
  const { passage, loading, error, missingKey } = useBiblePassage(reference);
  const text = passage?.verses.map((verse) => verse.text).join(' ').trim();

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/biblia/leer', params: { ref: reference } })}
      accessibilityRole="button"
      accessibilityLabel={`Versículo del día, ${reference}`}>
      <Card accent="amber" style={{ marginTop: space.md }}>
        <AppText variant="label" tone="amber">
          Versículo del día
        </AppText>
        <AppText variant="subtitle" style={{ marginTop: 10 }}>
          {reference}
        </AppText>
        {bible?.abbreviation ? (
          <AppText variant="caption" tone="soft" style={{ marginTop: 4 }}>
            {bible.abbreviation}
          </AppText>
        ) : null}

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
          <AppText variant="body" tone="soft" style={{ marginTop: space.md }}>
            {error ?? 'No se pudo abrir el pasaje ahora. Tocá para intentar en el lector.'}
          </AppText>
        )}

        <View style={{ marginTop: space.md }}>
          <AppText variant="caption" tone="amber">
            Abrir en la Biblia
          </AppText>
        </View>
      </Card>
    </Pressable>
  );
}
