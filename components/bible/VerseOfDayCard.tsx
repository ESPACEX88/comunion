import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useBible } from '@/features/bible/BibleProvider';
import { useBiblePassage } from '@/features/bible/useBiblePassage';
import { BIBLE_RETRY_COPY } from '@/lib/bible/errors';
import { space, useTheme } from '@/theme';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

type Props = {
  reference: string;
  kicker: string;
  compact?: boolean;
  done?: boolean;
  onDone?: () => void;
};

export function VerseOfDayCard({ reference, kicker, compact, done, onDone }: Props) {
  const { bible } = useBible();
  const { passage, loading, error, missingKey, retry } = useBiblePassage(reference);
  const text = passage?.verses.map((verse) => verse.text).join(' ').trim();
  const open = () => router.push({ pathname: '/biblia/leer', params: { ref: reference } });

  return (
    <GlassCard strong padded={!compact}>
      <AppText variant="label" tone="amber">
        {kicker}
      </AppText>

      {missingKey ? (
        <AppText variant="body" tone="soft" style={{ marginTop: space.md }}>
          La referencia ya es de hoy. El texto llega cuando esté la clave de API.Bible.
        </AppText>
      ) : loading ? (
        <AppText variant="subtitle" tone="soft" style={{ marginTop: 12 }}>
          Trayendo el texto de tu edición…
        </AppText>
      ) : text ? (
        <AppText variant="subtitle" style={{ marginTop: 12 }}>
          {text}
        </AppText>
      ) : (
        <View style={{ marginTop: 12 }}>
          <AppText variant="body" tone="soft">
            {error && error.length < 90 ? error : BIBLE_RETRY_COPY}
          </AppText>
          <Pressable onPress={retry} accessibilityRole="button" hitSlop={8} style={{ marginTop: space.sm }}>
            <AppText variant="caption" tone="amber">
              Reintentar
            </AppText>
          </Pressable>
        </View>
      )}

      {onDone ? (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
          <View style={{ flex: 1 }}>
            <Button label={done ? 'Hecho' : 'Hecho'} onPress={onDone} disabled={done} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Leer" variant="ghost" onPress={open} />
          </View>
        </View>
      ) : (
        <Pressable onPress={open} accessibilityRole="button" style={{ marginTop: space.md }}>
          <AppText variant="caption" tone="amber">
            {reference}
            {bible?.abbreviation ? ` · ${bible.abbreviation}` : ''}
          </AppText>
        </Pressable>
      )}
    </GlassCard>
  );
}
