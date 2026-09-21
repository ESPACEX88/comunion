import { MoodChips } from '@/components/duo/MoodChips';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { CHECK_IN_NOTE_MAX } from '@/features/duo/moods';
import type { MoodId } from '@/lib/types';
import { space } from '@/theme';
import { useState } from 'react';
import { View } from 'react-native';

type Props = {
  submitLabel?: string;
  hint?: string;
  onSave: (mood: MoodId, note: string) => void;
};

export function CheckInComposer({
  submitLabel = 'Guardar el check-in',
  hint = 'Una línea alcanza. Es para vos.',
  onSave,
}: Props) {
  const [mood, setMood] = useState<MoodId | null>(null);
  const [note, setNote] = useState('');

  return (
    <View style={{ gap: space.md }}>
      <AppText variant="label" tone="amber">
        ¿Cómo te encontró el pasaje?
      </AppText>
      <MoodChips value={mood} onChange={setMood} />
      <AppText variant="label" tone="amber">
        ¿Qué me dijo Dios hoy?
      </AppText>
      <Field
        value={note}
        onChangeText={(value) => setNote(value.slice(0, CHECK_IN_NOTE_MAX))}
        placeholder={hint}
        maxLength={CHECK_IN_NOTE_MAX}
        multiline
        tall
        style={{ marginTop: 0 }}
      />
      <AppText variant="caption" tone="soft">
        {note.length}/{CHECK_IN_NOTE_MAX} · opcional
      </AppText>
      <Button
        label={submitLabel}
        disabled={!mood}
        onPress={() => {
          if (!mood) return;
          onSave(mood, note);
          setNote('');
          setMood(null);
        }}
      />
    </View>
  );
}
