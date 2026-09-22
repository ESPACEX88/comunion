import { MissingBibleKey } from '@/components/bible/MissingBibleKey';
import { VerseList } from '@/components/bible/VerseList';
import { AfterReadingSheet } from '@/components/duo/AfterReadingSheet';
import { DuoQuestionCard } from '@/components/duo/DuoQuestionCard';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Ornament } from '@/components/ui/Ornament';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useBible } from '@/features/bible/BibleProvider';
import { useBiblePassage } from '@/features/bible/useBiblePassage';
import { partnerFirstName } from '@/features/duo/labels';
import { PERSONAL_NOTE_MAX } from '@/features/duo/moods';
import { isDuoPlan, isPlanFinished } from '@/features/plans/content';
import type { MoodId } from '@/lib/types';
import { radius, space, useTheme } from '@/theme';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

export default function LecturaScreen() {
  const params = useLocalSearchParams<{ plan?: string }>();
  const kind = params.plan === 'personal' ? 'personal' : 'group';
  const {
    state,
    today,
    todayStatus,
    personalTodayStatus,
    groupPlan,
    personalPlan,
    todayGroupReading,
    todayPersonalReading,
    completeToday,
    completePersonalToday,
    saveCheckIn,
    saveHeartVerse,
    saveDuoAnswer,
    openReading,
    openPersonalReading,
    myCheckInToday,
    myDuoAnswerToday,
    friendDuoAnswerToday,
    specialFriend,
    hasDuo,
    soloStreak,
  } = useAppState();

  const plan = kind === 'personal' ? personalPlan ?? groupPlan : groupPlan;
  const day = kind === 'personal' ? (todayPersonalReading ?? todayGroupReading) : todayGroupReading;
  const startDate =
    kind === 'personal' ? (state.personalPlanStartDate ?? state.groupPlanStartDate) : state.groupPlanStartDate;
  const finished = isPlanFinished(plan, startDate, today);
  const friendName = partnerFirstName(specialFriend);

  const [sheet, setSheet] = useState<'celebrate' | 'quiet' | null>(null);
  const [result, setResult] = useState({ personalStreak: 0, groupStreak: 0, groupJustUnlocked: false });
  const [dayNote, setDayNote] = useState('');
  const [saving, setSaving] = useState(false);
  const { colors } = useTheme();
  const { bible } = useBible();
  const full = useBiblePassage(day.reference);
  const verses = full.passage?.verses.length ? full.passage.verses : day.verses;

  useEffect(() => {
    if (kind === 'personal') openPersonalReading();
    else openReading();
  }, [kind, openPersonalReading, openReading]);

  const alreadyDone = kind === 'personal' ? personalTodayStatus === 'completado' : todayStatus === 'completado';
  const showDuo = kind === 'group' && hasDuo && Boolean(day.prompt);

  const persistSheet = async (payload: {
    mood: MoodId;
    note: string;
    heartNote: string;
    duoAnswer: string;
  }) => {
    await saveCheckIn(payload.mood, payload.note);
    const wantsMural = hasDuo && Boolean(payload.heartNote.trim());
    if (wantsMural) {
      await saveHeartVerse(day.featured.reference, day.featured.text, payload.heartNote);
    }
    if (showDuo && payload.duoAnswer.trim()) {
      await saveDuoAnswer(payload.duoAnswer);
    }
    setSheet(null);
    if (wantsMural) {
      router.push('/(tabs)/grupo');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <AppText variant="label" tone="amber">
          ← Volver
        </AppText>
      </Pressable>
      <AppText variant="caption" tone="soft" style={{ marginTop: space.md }}>
        {kind === 'personal' ? 'Plan personal · ' : isDuoPlan(plan) ? 'Plan de a dos · ' : ''}
        {plan.title}
      </AppText>
      <Pressable
        onPress={() => router.push({ pathname: '/biblia/leer', params: { ref: day.reference } })}
        hitSlop={8}>
        <AppText variant="display" style={{ marginTop: 4 }}>
          {day.reference}
        </AppText>
      </Pressable>
      <AppText variant="subtitle" tone="soft">
        {day.title}
      </AppText>
      <Ornament />
      <ProgressBar value={day.dayNumber} total={plan.days.length} />
      <AppText variant="caption" tone="soft" style={{ marginTop: 8 }}>
        Día {day.dayNumber} de {plan.days.length}
        {finished ? ' · el calendario del plan ya se cumplió' : ''}
      </AppText>
      <View style={{ height: space.lg }} />
      {full.missingKey ? (
        <View style={{ marginBottom: space.lg }}>
          <MissingBibleKey compact />
        </View>
      ) : full.loading ? (
        <AppText variant="ui" tone="soft" style={{ marginBottom: space.lg }}>
          Trayendo el pasaje completo…
        </AppText>
      ) : full.passage?.verses.length ? (
        <AppText variant="caption" tone="olive" style={{ marginBottom: space.md }}>
          Texto completo{bible ? ` · ${bible.abbreviation || bible.name}` : ''}
        </AppText>
      ) : (
        <AppText variant="caption" tone="soft" style={{ marginBottom: space.md }}>
          Extracto del plan. Tocá la referencia para abrir el lector.
        </AppText>
      )}
      <VerseList verses={verses} />
      <View
        style={{
          marginTop: space.sm,
          marginBottom: space.lg,
          padding: space.md,
          backgroundColor: colors.creamDeep,
          borderRadius: radius.md,
        }}>
        <AppText variant="ui" tone="soft">
          Leélo una vez más si hace falta. El día no se marca hasta que toqués completar.
        </AppText>
      </View>
      {kind === 'personal' && !alreadyDone ? (
        <View style={{ marginBottom: space.lg }}>
          <AppText variant="label" tone="amber">
            Nota corta, solo para vos
          </AppText>
          <Field
            value={dayNote}
            onChangeText={(value) => setDayNote(value.slice(0, PERSONAL_NOTE_MAX))}
            placeholder="Opcional. Queda en tu plan, no en el dúo."
            maxLength={PERSONAL_NOTE_MAX}
            multiline
          />
        </View>
      ) : null}
      <Button
        label={alreadyDone ? 'Hoy ya está completo' : saving ? 'Guardando…' : 'Marcá el día como leído'}
        disabled={alreadyDone || saving}
        onPress={async () => {
          if (saving || alreadyDone) return;
          setSaving(true);
          try {
            if (kind === 'personal') {
              const next = await completePersonalToday(dayNote);
              setResult({ personalStreak: next.soloStreak, groupStreak: 0, groupJustUnlocked: false });
            } else {
              const next = await completeToday();
              setResult(next);
            }
            setSheet('celebrate');
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {
              /* web u otros entornos sin haptics */
            }
          } finally {
            setSaving(false);
          }
        }}
      />
      {alreadyDone && !myCheckInToday ? (
        <Button
          label="Dejá el check-in de hoy"
          variant="olive"
          style={{ marginTop: 10 }}
          onPress={() => setSheet('quiet')}
        />
      ) : null}
      {alreadyDone ? (
        <Button
          label="Guardar un versículo del corazón"
          variant="ghost"
          style={{ marginTop: 10 }}
          onPress={() => setSheet('quiet')}
        />
      ) : null}
      {alreadyDone && showDuo && day.prompt ? (
        <View style={{ marginTop: space.lg }}>
          <DuoQuestionCard
            question={day.prompt}
            unlocked
            myAnswer={myDuoAnswerToday}
            friendAnswer={friendDuoAnswerToday}
            friendName={friendName}
            onSave={saveDuoAnswer}
          />
        </View>
      ) : null}
      <AfterReadingSheet
        visible={sheet !== null}
        variant={sheet === 'quiet' ? 'quiet' : 'celebrate'}
        streak={result.personalStreak}
        groupJustUnlocked={result.groupJustUnlocked}
        groupStreak={result.groupStreak}
        friendName={friendName}
        featured={day.featured}
        question={showDuo && day.prompt && !myDuoAnswerToday ? day.prompt : undefined}
        hasDuo={hasDuo && kind === 'group'}
        onSave={persistSheet}
        onSkip={() => setSheet(null)}
      />
    </Screen>
  );
}
