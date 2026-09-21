import { MoodChips } from '@/components/duo/MoodChips';
import { BackLink } from '@/components/ui/BackLink';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { JOURNAL_BODY_MAX, JOURNAL_TITLE_MAX } from '@/features/duo/moods';
import { formatLongDate } from '@/lib/date';
import type { MoodId } from '@/lib/types';
import { space } from '@/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export default function DiarioNuevaScreen() {
  const { today, saveJournalEntry } = useAppState();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<MoodId | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <Screen>
      <BackLink label="Diario" />
      <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
        {formatLongDate(today)}
      </AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        Escribí despacio
      </AppText>
      <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
        Queda en tu espacio. Nadie del dúo lo ve.
      </AppText>

      <AppText variant="label" tone="amber" style={{ marginTop: space.xl }}>
        Título, si hace falta
      </AppText>
      <Field
        value={title}
        onChangeText={(value) => setTitle(value.slice(0, JOURNAL_TITLE_MAX))}
        placeholder="Opcional"
        maxLength={JOURNAL_TITLE_MAX}
      />

      <AppText variant="label" tone="amber" style={{ marginTop: space.lg }}>
        Ánimo
      </AppText>
      <View style={{ marginTop: space.sm }}>
        <MoodChips value={mood} onChange={setMood} />
      </View>

      <AppText variant="label" tone="amber" style={{ marginTop: space.lg }}>
        Cuerpo
      </AppText>
      <Field
        value={body}
        onChangeText={(value) => setBody(value.slice(0, JOURNAL_BODY_MAX))}
        placeholder="Lo que no querés decir en voz alta."
        maxLength={JOURNAL_BODY_MAX}
        multiline
        tall
        style={{ minHeight: 160 }}
      />
      <AppText variant="caption" tone="soft" style={{ marginTop: 6 }}>
        {body.length}/{JOURNAL_BODY_MAX}
      </AppText>

      <Button
        label={busy ? 'Guardando…' : 'Guardar en el diario'}
        disabled={!body.trim() || busy}
        style={{ marginTop: space.xl }}
        onPress={async () => {
          setBusy(true);
          try {
            await saveJournalEntry({ title, body, mood });
            router.replace('/diario');
          } finally {
            setBusy(false);
          }
        }}
      />
    </Screen>
  );
}
