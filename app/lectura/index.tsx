import { MissingBibleKey } from '@/components/bible/MissingBibleKey';
import { VerseList, VerseActionBar } from '@/components/bible/VerseList';
import { AfterReadingSheet } from '@/components/duo/AfterReadingSheet';
import { StreakModal } from '@/components/streak/StreakModal';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Ornament } from '@/components/ui/Ornament';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useBible } from '@/features/bible/BibleProvider';
import { useBiblePassage } from '@/features/bible/useBiblePassage';
import { useVerseActions } from '@/features/bible/useVerseActions';
import { PERSONAL_NOTE_MAX } from '@/features/duo/moods';
import { planCaption } from '@/features/plans/content';
import type { MoodId } from '@/lib/types';
import { radius, space, useTheme } from '@/theme';
import { weekDaysSunday } from '@/lib/date';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

export default function LecturaScreen() {
  const params = useLocalSearchParams<{ plan?: string; shot?: string }>();
  const {
    state,
    today,
    personalTodayStatus,
    personalPlan,
    groupPlan,
    todayPersonalReading,
    todayGroupReading,
    personalProgress,
    groupProgress,
    completePersonalToday,
    saveCheckIn,
    openPersonalReading,
    myCheckInToday,
    soloStreak,
    selfId,
  } = useAppState();

  const plan = personalPlan ?? groupPlan;
  const day = todayPersonalReading ?? todayGroupReading;
  const progress = personalProgress ?? groupProgress;

  const [sheet, setSheet] = useState<'celebrate' | 'quiet' | null>(null);
  const [streakOpen, setStreakOpen] = useState(params.shot === 'racha');
  const [result, setResult] = useState({ personalStreak: 0, groupStreak: 0, groupJustUnlocked: false });
  const [dayNote, setDayNote] = useState('');
  const [saving, setSaving] = useState(false);
  const { colors } = useTheme();
  const { bible } = useBible();
  const full = useBiblePassage(day.reference);
  const verses = full.passage?.verses.length ? full.passage.verses : day.verses;
  const verseActions = useVerseActions({
    userId: selfId,
    bibleId: bible?.id ?? 'plan',
    passageKey: day.reference,
    reference: day.reference,
  });

  useEffect(() => {
    openPersonalReading();
  }, [openPersonalReading]);

  const alreadyDone = personalTodayStatus === 'completado';

  const persistSheet = async (payload: {
    mood: MoodId;
    note: string;
    heartNote: string;
    duoAnswer: string;
  }) => {
    await saveCheckIn(payload.mood, payload.note);
    setSheet(null);
    router.replace('/(tabs)');
  };

  return (
    <Screen
      footer={
        verseActions.selectedCount > 0 ? (
          <VerseActionBar
            selectedCount={verseActions.selectedCount}
            paletteOpen={verseActions.paletteOpen}
            copied={verseActions.copied}
            onCopy={() => void verseActions.onCopy()}
            onTogglePalette={verseActions.onTogglePalette}
            onPickColor={verseActions.onPickColor}
            onClose={verseActions.clear}
          />
        ) : null
      }>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <AppText variant="label" tone="amber">
          ← Volver
        </AppText>
      </Pressable>
      <AppText variant="caption" tone="soft" style={{ marginTop: space.md }}>
        Plan personal · {plan.title}
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
      <ProgressBar value={progress.dayNumber} total={progress.cycleLen} />
      <AppText variant="caption" tone="soft" style={{ marginTop: 8 }}>
        {planCaption(progress)}
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
      <VerseList
        verses={verses}
        selectedNs={verseActions.selectedNs}
        colorsByVerse={verseActions.colorsByVerse}
        onSelect={verseActions.onSelect}
      />
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
      {!alreadyDone ? (
        <View style={{ marginBottom: space.lg }}>
          <AppText variant="label" tone="amber">
            Nota corta, solo para vos
          </AppText>
          <Field
            value={dayNote}
            onChangeText={(value) => setDayNote(value.slice(0, PERSONAL_NOTE_MAX))}
            placeholder="Opcional. Queda en tu plan."
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
            const next = await completePersonalToday(dayNote);
            setResult({ personalStreak: next.soloStreak, groupStreak: 0, groupJustUnlocked: false });
            setStreakOpen(true);
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
      <StreakModal
        visible={streakOpen}
        streak={params.shot === 'racha' ? 11 : result.personalStreak || soloStreak}
        today={today}
        completedDays={params.shot === 'racha' ? weekDaysSunday(today).slice(0, 3) : state.personalCompletedDates}
        onContinue={() => {
          setStreakOpen(false);
          setSheet('celebrate');
        }}
        onClose={() => setStreakOpen(false)}
      />
      <AfterReadingSheet
        visible={sheet !== null}
        variant={sheet === 'quiet' ? 'quiet' : 'celebrate'}
        streak={result.personalStreak}
        groupJustUnlocked={result.groupJustUnlocked}
        groupStreak={result.groupStreak}
        friendName=""
        featured={day.featured}
        hasDuo={false}
        onSave={persistSheet}
        onSkip={() => setSheet(null)}
      />
    </Screen>
  );
}
