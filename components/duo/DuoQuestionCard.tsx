import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DUO_ANSWER_MAX } from '@/features/duo/moods';
import type { DuoAnswer } from '@/lib/types';
import { colors, radius, space } from '@/theme';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

type Props = {
  question: string;
  unlocked: boolean;
  myAnswer: DuoAnswer | null;
  friendAnswer: DuoAnswer | null;
  friendName: string;
  onSave: (text: string) => void;
};

export function DuoQuestionCard({
  question,
  unlocked,
  myAnswer,
  friendAnswer,
  friendName,
  onSave,
}: Props) {
  const [draft, setDraft] = useState(myAnswer?.text ?? '');

  if (!unlocked) {
    return (
      <Card accent="olive">
        <AppText variant="label" tone="olive">
          Pregunta de a dos
        </AppText>
        <AppText variant="subtitle" style={{ marginTop: 6 }}>
          Se abre cuando terminen el pasaje.
        </AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
          No es un examen. Es una pregunta para hablar despacio con {friendName}.
        </AppText>
      </Card>
    );
  }

  return (
    <Card accent="olive">
      <AppText variant="label" tone="olive">
        Pregunta de a dos
      </AppText>
      <AppText variant="subtitle" style={{ marginTop: 8 }}>
        {question}
      </AppText>
      {myAnswer ? (
        <View style={{ marginTop: space.md }}>
          <AppText variant="label" tone="amber">
            Vos
          </AppText>
          <AppText variant="body" style={{ marginTop: 4 }}>
            {myAnswer.text}
          </AppText>
        </View>
      ) : (
        <View style={{ marginTop: space.md }}>
          <TextInput
            value={draft}
            onChangeText={(value) => setDraft(value.slice(0, DUO_ANSWER_MAX))}
            placeholder="Una respuesta corta, sin ensayar."
            placeholderTextColor={colors.oliveSoft}
            maxLength={DUO_ANSWER_MAX}
            multiline
            style={{
              minHeight: 64,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: colors.cream,
              borderRadius: radius.md,
              padding: space.md,
              fontFamily: 'Literata_400Regular',
              fontSize: 16,
              color: colors.ink,
              textAlignVertical: 'top',
            }}
          />
          <AppText variant="caption" tone="soft" style={{ marginTop: 6 }}>
            {draft.length}/{DUO_ANSWER_MAX}
          </AppText>
          <Button
            label="Dejar mi respuesta"
            variant="olive"
            style={{ marginTop: 8 }}
            disabled={!draft.trim()}
            onPress={() => onSave(draft)}
          />
        </View>
      )}
      {friendAnswer ? (
        <View style={{ marginTop: space.md }}>
          <AppText variant="label" tone="olive">
            {friendName}
          </AppText>
          <AppText variant="body" italic style={{ marginTop: 4 }}>
            {friendAnswer.text}
          </AppText>
        </View>
      ) : null}
    </Card>
  );
}
