import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Ornament } from '@/components/ui/Ornament';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { isPlanFinished } from '@/features/plans/content';
import { colors, radius, space } from '@/theme';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

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
    shareVerse,
    openReading,
  } = useAppState();

  const plan = kind === 'personal' ? personalPlan ?? groupPlan : groupPlan;
  const day = kind === 'personal' ? (todayPersonalReading ?? todayGroupReading) : todayGroupReading;
  const startDate =
    kind === 'personal' ? (state.personalPlanStartDate ?? state.groupPlanStartDate) : state.groupPlanStartDate;
  const finished = isPlanFinished(plan, startDate, today);

  const [celebrate, setCelebrate] = useState(false);
  const [result, setResult] = useState({ personalStreak: 0, groupStreak: 0, groupJustUnlocked: false });
  const [shared, setShared] = useState(false);

  useEffect(() => {
    openReading();
  }, [openReading]);

  const alreadyDone = todayStatus === 'completado';

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <AppText variant="label" tone="amber">
          ← Volver
        </AppText>
      </Pressable>
      <AppText variant="caption" tone="soft" style={{ marginTop: space.md }}>
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
          setCelebrate(true);
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {
            /* web u otros entornos sin haptics */
          }
        }}
      />
      {alreadyDone ? (
        <Button
          label="Compartir el versículo al grupo"
          variant="ghost"
          style={{ marginTop: 10 }}
          onPress={() => {
            shareVerse(day.featured.reference, day.featured.text);
            router.push('/(tabs)/grupo');
          }}
        />
      ) : null}
      <Modal visible={celebrate} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: 'center',
            padding: space.lg,
          }}>
          <View
            style={{
              backgroundColor: colors.paper,
              borderRadius: radius.lg,
              padding: space.xl,
            }}>
            <AppText variant="label" tone="amber">
              El día cuenta
            </AppText>
            <AppText variant="numeral" style={{ marginTop: 8 }}>
              {result.personalStreak}
            </AppText>
            <AppText variant="subtitle">
              {result.personalStreak === 1 ? 'día seguido, el tuyo' : 'días seguidos, los tuyos'}
            </AppText>
            <Ornament />
            <AppText variant="body" tone="soft">
              {result.groupJustUnlocked
                ? `Hoy leyeron todos. La racha del grupo va en ${result.groupStreak}.`
                : 'Tu racha ya sumó. El grupo espera a que terminen los que faltan.'}
            </AppText>
            <View
              style={{
                marginTop: space.md,
                paddingTop: space.md,
                borderTopWidth: 1,
                borderTopColor: colors.line,
              }}>
              <AppText variant="ui" italic>
                «{day.featured.text}»
              </AppText>
              <AppText variant="caption" tone="amber" style={{ marginTop: 6 }}>
                {day.featured.reference}
              </AppText>
            </View>
            <Button
              label={shared ? 'Ya está en el hilo' : 'Compartí este versículo al grupo'}
              style={{ marginTop: space.lg }}
              disabled={shared}
              onPress={() => {
                shareVerse(day.featured.reference, day.featured.text);
                setShared(true);
              }}
            />
            <Button
              label={shared ? 'Ver el hilo' : 'Seguir'}
              variant="ghost"
              style={{ marginTop: 8 }}
              onPress={() => {
                setCelebrate(false);
                if (shared) router.push('/(tabs)/grupo');
              }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
