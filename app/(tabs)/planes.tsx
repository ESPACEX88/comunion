import { Screen } from '@/components/ui/Screen';
import { ALL_PLANS, JOHN_PLAN, JOHN_PLAN_ID, PSALMS_PLAN_ID, isDuoPlan, planAudienceLabel } from '@/features/plans/content';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ornament } from '@/components/ui/Ornament';
import { ProgressBar } from '@/components/ui/ProgressBar';
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
    switchGroupPlan,
    openReading,
    live,
  } = useAppState();

  const otherGroupPlan = ALL_PLANS.find((plan) => plan.id !== groupPlan.id);
  const personalElapsed =
    state.personalPlanStartDate != null
      ? Math.max(1, calendarDiff(state.personalPlanStartDate, today) + 1)
      : 1;

  return (
    <Screen>
      <AppText variant="label" tone="olive">
        Planes
      </AppText>
      <AppText variant="display" style={{ marginTop: 6 }}>
        Lo que están leyendo.
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        El plan de a dos es el de la mesa íntima: un pasaje y una pregunta para hablar. El personal
        es el que vos cargás aparte, sin quitarle el día compartido.
      </AppText>
      <View style={{ height: space.lg }} />
      <AppText variant="label" tone="amber">
        {isDuoPlan(groupPlan) ? 'Plan de a dos' : 'Plan del grupo'}
      </AppText>
      <View style={{ height: space.sm }} />
      <Card>
        <AppText variant="label" tone="olive">
          {planAudienceLabel(groupPlan)} · {groupPlan.durationLabel}
        </AppText>
        <AppText variant="subtitle" style={{ marginTop: 6 }}>
          {groupPlan.title}
        </AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 4 }}>
          {groupPlan.subtitle} · {state.group.name}
        </AppText>
        <View style={{ marginVertical: space.md }}>
          <ProgressBar value={todayGroupReading.dayNumber} total={groupPlan.days.length} />
        </View>
        <AppText variant="ui">
          Hoy: {todayGroupReading.reference} — {todayGroupReading.title}
        </AppText>
        {todayGroupReading.prompt ? (
          <AppText variant="ui" tone="soft" italic style={{ marginTop: 8 }}>
            Pregunta de hoy: {todayGroupReading.prompt}
          </AppText>
        ) : null}
        <Button
          label="Abrir la lectura de hoy"
          style={{ marginTop: space.md }}
          onPress={() => {
            openReading();
            router.push({ pathname: '/lectura', params: { plan: 'group' } });
          }}
        />
        {otherGroupPlan && !live ? (
          <Button
            label={`Cambiar al plan «${otherGroupPlan.title}»`}
            variant="ghost"
            style={{ marginTop: 8 }}
            onPress={() => switchGroupPlan(otherGroupPlan.id)}
          />
        ) : null}
      </Card>
      <View style={{ height: space.lg }} />
      <AppText variant="label" tone="amber">
        Plan personal
      </AppText>
      <View style={{ height: space.sm }} />
      {personalPlan && todayPersonalReading ? (
        <Card accent="olive">
          <AppText variant="subtitle">{personalPlan.title}</AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 4 }}>
            Día {todayPersonalReading.dayNumber} de {personalPlan.days.length} · {personalElapsed}{' '}
            {personalElapsed === 1 ? 'día' : 'días'} desde que lo empezaste
          </AppText>
          <View style={{ marginVertical: space.md }}>
            <ProgressBar value={todayPersonalReading.dayNumber} total={personalPlan.days.length} />
          </View>
          <AppText variant="ui">
            Hoy: {todayPersonalReading.reference} — {todayPersonalReading.title}
          </AppText>
          <Button
            label="Leer el plan personal"
            variant="olive"
            style={{ marginTop: space.md }}
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
        </Card>
      ) : (
        <EmptyState
          kicker="Aparte del grupo"
          title="No tenés un plan personal todavía."
          body="El de la mesa sigue activo. Este espacio es para lo que vos querés leer despacio, sin sustituir el día compartido."
          actionLabel={`Empezar «${JOHN_PLAN.title}»`}
          onAction={() => startPersonalPlan(JOHN_PLAN_ID)}
        />
      )}
      {!personalPlan && groupPlan.id !== PSALMS_PLAN_ID ? (
        <Button
          label="Empezar Salmos en lo personal"
          variant="inline"
          style={{ marginTop: space.md }}
          onPress={() => startPersonalPlan(PSALMS_PLAN_ID)}
        />
      ) : null}
    </Screen>
  );
}
