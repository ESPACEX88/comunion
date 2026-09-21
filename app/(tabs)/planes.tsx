import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { SOLO_PSALMS_PLAN } from '@/features/plans/content';
import { space, useTheme } from '@/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

export default function PlanesScreen() {
  const {
    state,
    groupPlan,
    personalPlan,
    todayGroupReading,
    todayPersonalReading,
    ensureSoloPlan,
    openReading,
    openPersonalReading,
    soloStreak,
    personalTodayStatus,
    hasDuo,
  } = useAppState();
  const { refreshing, onRefresh } = useDuoSyncControls();
  const { colors } = useTheme();
  const [lane, setLane] = useState<'personal' | 'duo'>('personal');
  const showDuoLane = hasDuo;
  const active = showDuoLane && lane === 'duo' ? 'duo' : 'personal';
  const plan = personalPlan ?? SOLO_PSALMS_PLAN;
  const day = todayPersonalReading ?? plan.days[0];

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <AppText variant="label" tone="olive">
        Planes
      </AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        {active === 'personal' ? 'Lo tuyo' : 'De a dos'}
      </AppText>
      <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
        {hasDuo
          ? 'Personal y dúo no se mezclan. Cada racha es de su mesa.'
          : 'Tu plan en solitario. Un dúo se puede sumar después.'}
      </AppText>

      {showDuoLane ? (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: space.lg }}>
          {(
            [
              { id: 'personal' as const, label: 'Personal' },
              { id: 'duo' as const, label: 'De a dos' },
            ] as const
          ).map((option) => {
            const on = active === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setLane(option.id)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: on ? colors.amber : colors.line,
                  backgroundColor: on ? colors.paper : 'transparent',
                  alignItems: 'center',
                }}>
                <AppText variant="ui" tone={on ? 'amber' : 'soft'}>
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {active === 'personal' ? (
        <View style={{ marginTop: space.xl }}>
          <AppText variant="subtitle">{plan.title}</AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
            {plan.durationLabel} · racha {soloStreak}
            {personalTodayStatus === 'completado' ? ' · hoy listo' : ''}
          </AppText>
          <View style={{ marginTop: space.lg }}>
            <ProgressBar value={day.dayNumber} total={plan.days.length} />
            <AppText variant="caption" tone="soft" style={{ marginTop: 8 }}>
              Día {day.dayNumber} de {plan.days.length}
            </AppText>
          </View>
          <AppText variant="subtitle" style={{ marginTop: space.xl }}>
            {day.reference}
          </AppText>
          <AppText variant="body" tone="soft" style={{ marginTop: 6 }}>
            {day.title}
          </AppText>
          {day.prompt ? (
            <AppText variant="ui" italic tone="soft" style={{ marginTop: space.md }}>
              {day.prompt}
            </AppText>
          ) : null}
          <Button
            label={personalPlan ? 'Abrir tu lectura de hoy' : 'Empezar Salmos en solitario'}
            style={{ marginTop: space.xl }}
            onPress={async () => {
              if (!personalPlan) await ensureSoloPlan();
              openPersonalReading();
              router.push({ pathname: '/lectura', params: { plan: 'personal' } });
            }}
          />
        </View>
      ) : (
        <View style={{ marginTop: space.xl }}>
          <AppText variant="subtitle">{groupPlan.title}</AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
            {groupPlan.durationLabel} · {state.group.name}
          </AppText>
          <View style={{ marginTop: space.lg }}>
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
            label="Abrir la lectura de a dos"
            style={{ marginTop: space.xl }}
            onPress={() => {
              openReading();
              router.push({ pathname: '/lectura', params: { plan: 'group' } });
            }}
          />
        </View>
      )}
    </Screen>
  );
}
