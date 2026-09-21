import { MoodChips } from '@/components/duo/MoodChips';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { CHECK_IN_NOTE_MAX } from '@/features/duo/moods';
import type { MoodId } from '@/lib/types';
import { colors, radius, space } from '@/theme';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

type Props = {
  submitLabel?: string;
  onSave: (mood: MoodId, note: string) => void;
};

export function CheckInComposer({ submitLabel = 'Guardar el check-in', onSave }: Props) {
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
      <TextInput
        value={note}
        onChangeText={(value) => setNote(value.slice(0, CHECK_IN_NOTE_MAX))}
        placeholder="Una línea alcanza. Es para vos y para ella."
        placeholderTextColor={colors.oliveSoft}
        maxLength={CHECK_IN_NOTE_MAX}
        multiline
        style={{
          minHeight: 64,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.paper,
          borderRadius: radius.md,
          padding: space.md,
          fontFamily: 'Literata_400Regular',
          fontSize: 16,
          color: colors.ink,
          textAlignVertical: 'top',
        }}
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
