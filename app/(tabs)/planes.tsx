import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useLiveSyncControls } from '@/features/app-state/useLiveSync';
import { SOLO_PSALMS_PLAN, planCaption } from '@/features/plans/content';
import { space } from '@/theme';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function PlanesScreen() {
  const {
    personalPlan,
    todayPersonalReading,
    personalProgress,
    ensureSoloPlan,
    openPersonalReading,
    soloStreak,
    personalTodayStatus,
  } = useAppState();
  const { refreshing, onRefresh } = useLiveSyncControls();
  const plan = personalPlan ?? SOLO_PSALMS_PLAN;
  const day = todayPersonalReading ?? plan.days[0];

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <AppText variant="label" tone="olive">
        Planes
      </AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        Lo tuyo
      </AppText>
      <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
        Tu plan personal. El del grupo vive en Hoy y en Grupo.
      </AppText>

      <View style={{ marginTop: space.xl }}>
        <AppText variant="subtitle">{plan.title}</AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
          {plan.durationLabel} · racha {soloStreak}
          {personalTodayStatus === 'completado' ? ' · hoy listo' : ''}
        </AppText>
        <View style={{ marginTop: space.lg }}>
          <ProgressBar value={personalProgress?.dayNumber ?? day.dayNumber} total={plan.days.length} />
          <AppText variant="caption" tone="soft" style={{ marginTop: 8 }}>
            {personalProgress ? planCaption(personalProgress) : `Día ${day.dayNumber} de ${plan.days.length}`}
          </AppText>
        </View>
        <AppText variant="subtitle" style={{ marginTop: space.xl }}>
          {day.reference}
        </AppText>
        <AppText variant="body" tone="soft" style={{ marginTop: 6 }}>
          {day.title}
        </AppText>
        <Button
          label={personalPlan ? 'Abrir tu lectura de hoy' : 'Empezar Salmos'}
          style={{ marginTop: space.xl }}
          onPress={async () => {
            if (!personalPlan) await ensureSoloPlan();
            openPersonalReading();
            router.push({ pathname: '/lectura', params: { plan: 'personal' } });
          }}
        />
      </View>
    </Screen>
  );
}
