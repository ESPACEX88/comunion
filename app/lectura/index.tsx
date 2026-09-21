import { AfterReadingSheet } from '@/components/duo/AfterReadingSheet';
import { DuoQuestionCard } from '@/components/duo/DuoQuestionCard';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Ornament } from '@/components/ui/Ornament';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { isDuoPlan, isPlanFinished } from '@/features/plans/content';
import type { MoodId } from '@/lib/types';
import { colors, radius, space } from '@/theme';
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
    groupPlan,
    personalPlan,
    todayGroupReading,
    todayPersonalReading,
    completeToday,
    saveCheckIn,
    saveHeartVerse,
    saveDuoAnswer,
    openReading,
    myCheckInToday,
    myDuoAnswerToday,
    friendDuoAnswerToday,
    specialFriend,
  } = useAppState();

  const plan = kind === 'personal' ? personalPlan ?? groupPlan : groupPlan;
  const day = kind === 'personal' ? (todayPersonalReading ?? todayGroupReading) : todayGroupReading;
  const startDate =
    kind === 'personal' ? (state.personalPlanStartDate ?? state.groupPlanStartDate) : state.groupPlanStartDate;
  const finished = isPlanFinished(plan, startDate, today);
  const friendName = specialFriend.name.split(' ')[0] ?? 'Ana';

  const [sheet, setSheet] = useState<'celebrate' | 'quiet' | null>(null);
  const [result, setResult] = useState({ personalStreak: 0, groupStreak: 0, groupJustUnlocked: false });

  useEffect(() => {
    openReading();
  }, [openReading]);

  const alreadyDone = todayStatus === 'completado';
  const showDuo = kind === 'group' && Boolean(day.prompt);

  const persistSheet = (payload: {
    mood: MoodId;
    note: string;
    heartNote: string;
    duoAnswer: string;
  }) => {
    saveCheckIn(payload.mood, payload.note);
    const wantsMural = Boolean(payload.heartNote.trim());
    if (wantsMural) {
      saveHeartVerse(day.featured.reference, day.featured.text, payload.heartNote);
    }
    if (payload.duoAnswer.trim()) {
      saveDuoAnswer(payload.duoAnswer);
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
        {isDuoPlan(plan) ? 'Plan de a dos · ' : ''}
        {plan.title}
      </AppText>
      <AppText variant="display" style={{ marginTop: 4 }}>
        {day.reference}
      </AppText>
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
      {day.verses.map((verse) => (
        <View key={`${day.id}-${verse.n}`} style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
          <AppText variant="caption" tone="amber" style={{ width: 22, marginTop: 6 }}>
            {verse.n}
          </AppText>
          <AppText variant="verse" style={{ flex: 1 }}>
            {verse.text}
          </AppText>
        </View>
      ))}
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
      <Button
        label={alreadyDone ? 'Hoy ya está completo' : 'Marcá el día como leído'}
        disabled={alreadyDone}
        onPress={async () => {
          const next = completeToday();
          setResult(next);
          setSheet('celebrate');
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {
            /* web u otros entornos sin haptics */
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
        onSave={persistSheet}
        onSkip={() => setSheet(null)}
      />
    </Screen>
  );
}
