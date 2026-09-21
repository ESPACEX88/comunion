import { MoodChips } from '@/components/duo/MoodChips';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Ornament } from '@/components/ui/Ornament';
import { CHECK_IN_NOTE_MAX, DUO_ANSWER_MAX, HEART_NOTE_MAX } from '@/features/duo/moods';
import type { FeaturedVerse, MoodId } from '@/lib/types';
import { colors, radius, space } from '@/theme';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, TextInput, View } from 'react-native';

type Props = {
  visible: boolean;
  variant?: 'celebrate' | 'quiet';
  streak?: number;
  groupJustUnlocked?: boolean;
  groupStreak?: number;
  friendName: string;
  featured: FeaturedVerse;
  question?: string;
  onSave: (payload: { mood: MoodId; note: string; heartNote: string; duoAnswer: string }) => void;
  onSkip: () => void;
};

export function AfterReadingSheet({
  visible,
  variant = 'celebrate',
  streak = 0,
  groupJustUnlocked,
  groupStreak = 0,
  friendName,
  featured,
  question,
  onSave,
  onSkip,
}: Props) {
  const [mood, setMood] = useState<MoodId | null>(null);
  const [note, setNote] = useState('');
  const [heartNote, setHeartNote] = useState('');
  const [duoAnswer, setDuoAnswer] = useState('');

  const resetAnd = (fn: () => void) => {
    setMood(null);
    setNote('');
    setHeartNote('');
    setDuoAnswer('');
    fn();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.paper,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            maxHeight: '90%',
            paddingHorizontal: space.lg,
            paddingTop: space.lg,
            paddingBottom: space.xl,
          }}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {variant === 'celebrate' ? (
              <>
                <AppText variant="label" tone="amber">
                  El día cuenta
                </AppText>
                <AppText variant="numeral" style={{ marginTop: 8 }}>
                  {streak}
                </AppText>
                <AppText variant="subtitle">
                  {streak === 1 ? 'día seguido, el tuyo' : 'días seguidos, los tuyos'}
                </AppText>
                <Ornament />
                <AppText variant="body" tone="soft">
                  {groupJustUnlocked
                    ? `Hoy también cerraron con ${friendName}. La racha compartida va en ${groupStreak}.`
                    : `Antes de seguir, dejale a ${friendName} —y a vos— cómo te encontró el texto.`}
                </AppText>
              </>
            ) : (
              <>
                <AppText variant="label" tone="amber">
                  Check-in de hoy
                </AppText>
                <AppText variant="title" style={{ marginTop: 8 }}>
                  ¿Cómo te encontró el pasaje?
                </AppText>
                <Ornament />
              </>
            )}
            <View style={{ height: space.md }} />
            <AppText variant="label" tone="amber">
              Un ánimo
            </AppText>
            <View style={{ height: 8 }} />
            <MoodChips value={mood} onChange={setMood} />
            <View style={{ height: space.md }} />
            <AppText variant="label" tone="amber">
              ¿Qué me dijo Dios hoy?
            </AppText>
            <TextInput
              value={note}
              onChangeText={(value) => setNote(value.slice(0, CHECK_IN_NOTE_MAX))}
              placeholder="Una línea. Es entre vos y ella."
              placeholderTextColor={colors.oliveSoft}
              maxLength={CHECK_IN_NOTE_MAX}
              multiline
              style={inputStyle}
            />
            <AppText variant="caption" tone="soft">
              {note.length}/{CHECK_IN_NOTE_MAX} · opcional
            </AppText>
            <View
              style={{
                marginTop: space.md,
                paddingTop: space.md,
                borderTopWidth: 1,
                borderTopColor: colors.line,
              }}>
              <AppText variant="label" tone="olive">
                Versículo del corazón
              </AppText>
              <AppText variant="ui" italic style={{ marginTop: 8 }}>
                «{featured.text}»
              </AppText>
              <AppText variant="caption" tone="amber" style={{ marginTop: 6 }}>
                {featured.reference}
              </AppText>
              <TextInput
                value={heartNote}
                onChangeText={(value) => setHeartNote(value.slice(0, HEART_NOTE_MAX))}
                placeholder={`Esto me acordó de ${friendName} / de lo que hablamos…`}
                placeholderTextColor={colors.oliveSoft}
                maxLength={HEART_NOTE_MAX}
                multiline
                style={[inputStyle, { marginTop: space.sm }]}
              />
              <AppText variant="caption" tone="soft">
                Si escribís una nota, se guarda en el mural de las dos.
              </AppText>
            </View>
            {question ? (
              <View
                style={{
                  marginTop: space.md,
                  paddingTop: space.md,
                  borderTopWidth: 1,
                  borderTopColor: colors.line,
                }}>
                <AppText variant="label" tone="olive">
                  Pregunta de a dos
                </AppText>
                <AppText variant="ui" style={{ marginTop: 8 }}>
                  {question}
                </AppText>
                <TextInput
                  value={duoAnswer}
                  onChangeText={(value) => setDuoAnswer(value.slice(0, DUO_ANSWER_MAX))}
                  placeholder="Una respuesta corta, para ella y para vos."
                  placeholderTextColor={colors.oliveSoft}
                  maxLength={DUO_ANSWER_MAX}
                  multiline
                  style={[inputStyle, { marginTop: space.sm }]}
                />
                <AppText variant="caption" tone="soft">
                  {duoAnswer.length}/{DUO_ANSWER_MAX} · opcional
                </AppText>
              </View>
            ) : null}
            <Button
              label="Guardar este momento"
              style={{ marginTop: space.lg }}
              disabled={!mood}
              onPress={() => {
                if (!mood) return;
                const payload = { mood, note, heartNote, duoAnswer };
                resetAnd(() => onSave(payload));
              }}
            />
            <Button
              label="Ahora no"
              variant="ghost"
              style={{ marginTop: 8 }}
              onPress={() => resetAnd(onSkip)}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const inputStyle = {
  minHeight: 64,
  marginTop: 8,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.cream,
  borderRadius: radius.md,
  padding: space.md,
  fontFamily: 'Literata_400Regular' as const,
  fontSize: 16,
  color: colors.ink,
  textAlignVertical: 'top' as const,
};
