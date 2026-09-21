import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { ALL_PLANS, JOHN_PLAN, JOHN_PLAN_ID, isDuoPlan } from '@/features/plans/content';
import { calendarDiff } from '@/lib/date';
import { space } from '@/theme';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function PlanesScreen() {
  const {
    state,
    today,
    groupPlan,
    personalPlan,
    todayGroupReading,
    todayPersonalReading,
    startPersonalPlan,
    clearPersonalPlan,
    openReading,
    switchGroupPlan,
    live,
  } = useAppState();
  const { refreshing, onRefresh } = useDuoSyncControls();
  const personalElapsed =
    state.personalPlanStartDate != null
      ? Math.max(1, calendarDiff(state.personalPlanStartDate, today) + 1)
      : 1;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <AppText variant="label" tone="olive">
        Planes
      </AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        {groupPlan.title}
      </AppText>
      <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
        {isDuoPlan(groupPlan) ? 'De a dos' : 'De la mesa'} · {groupPlan.durationLabel} ·{' '}
        {state.group.name}
      </AppText>

      <View style={{ marginTop: space.xl }}>
        <ProgressBar value={todayGroupReading.dayNumber} total={groupPlan.days.length} />
        <AppText variant="caption" tone="soft" style={{ marginTop: 8 }}>
          Día {todayGroupReading.dayNumber} de {groupPlan.days.length}
        </AppText>
      </View>

      <AppText variant="subtitle" style={{ marginTop: space.xl }}>
        {todayGroupReading.reference}
      </AppText>
      <AppText variant="body" tone="soft" style={{ marginTop: 6 }}>
        {todayGroupReading.title}
      </AppText>
      {todayGroupReading.prompt ? (
        <AppText variant="ui" italic tone="soft" style={{ marginTop: space.md }}>
          {todayGroupReading.prompt}
        </AppText>
      ) : null}

      <Button
        label="Abrir la lectura de hoy"
        style={{ marginTop: space.xl }}
        onPress={() => {
          openReading();
          router.push({ pathname: '/lectura', params: { plan: 'group' } });
        }}
      />
      {!live
        ? ALL_PLANS.filter((plan) => plan.id !== groupPlan.id).map((plan) => (
            <Button
              key={plan.id}
              label={`Cambiar a «${plan.title}»`}
              variant="ghost"
              style={{ marginTop: 8 }}
              onPress={() => switchGroupPlan(plan.id)}
            />
          ))
        : null}

      <View style={{ height: space.xxl }} />
      <AppText variant="label" tone="soft">
        Aparte, si querés
      </AppText>
      <View style={{ height: space.md }} />
      {personalPlan && todayPersonalReading ? (
        <View>
          <AppText variant="subtitle">{personalPlan.title}</AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
            Día {todayPersonalReading.dayNumber} de {personalPlan.days.length} · {personalElapsed}{' '}
            {personalElapsed === 1 ? 'día' : 'días'} desde que lo empezaste
          </AppText>
          <View style={{ marginVertical: space.md }}>
            <ProgressBar value={todayPersonalReading.dayNumber} total={personalPlan.days.length} />
          </View>
          <Button
            label="Leer el plan personal"
            variant="olive"
            onPress={() => {
              openReading();
              router.push({ pathname: '/lectura', params: { plan: 'personal' } });
            }}
          />
          <Button
            label="Dejar este plan personal"
            variant="ghost"
            style={{ marginTop: 8 }}
            onPress={clearPersonalPlan}
          />
        </View>
      ) : (
        <EmptyState
          kicker="Personal"
          title="No tenés un plan aparte."
          body="El de la mesa sigue. Este espacio es para lo que vos querés leer despacio."
          actionLabel={`Empezar «${JOHN_PLAN.title}»`}
          onAction={() => startPersonalPlan(JOHN_PLAN_ID)}
        />
      )}
    </Screen>
  );
}
