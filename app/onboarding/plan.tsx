import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { ALL_PLANS } from '@/features/plans/content';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { colors, space } from '@/theme';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function OnboardingPlan() {
  const { draft, setDraft, completeOnboarding } = useAppState();

  return (
    <Screen>
      <AppText variant="label" tone="olive">
        Comunión · 3 de 3
      </AppText>
      <AppText variant="display" style={{ marginTop: space.md }}>
        El plan de la mesa.
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        Este es el plan compartido. Un día cuenta cuando el pasaje se termina, no cuando se marca de
        apuro. Si elegís el de a dos, cada tarde hay una pregunta suave para hablar.
      </AppText>
      <View style={{ marginTop: space.lg, gap: space.md }}>
        {ALL_PLANS.map((plan) => {
          const active = draft.planId === plan.id;
          return (
            <Pressable key={plan.id} onPress={() => setDraft({ planId: plan.id })}>
              <Card accent={active ? 'amber' : 'none'}>
                <AppText variant="label" tone={active ? 'amber' : 'soft'}>
                  {plan.recommendedFor === 'duo'
                    ? 'Recomendado para las dos'
                    : plan.recommendedFor === 'group'
                      ? 'Recomendado para el grupo'
                      : 'Más corto'}
                  {' · '}
                  {plan.durationLabel}
                </AppText>
                <AppText variant="subtitle" style={{ marginTop: 6 }}>
                  {plan.title}
                </AppText>
                <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
                  {plan.description}
                </AppText>
              </Card>
            </Pressable>
          );
        })}
      </View>
      <View style={{ height: space.lg }} />
      <Button
        label="Entrar a Comunión"
        onPress={async () => {
          await completeOnboarding();
          router.replace('/(tabs)');
        }}
      />
      <Button label="Atrás" variant="ghost" onPress={() => router.back()} style={{ marginTop: 10 }} />
      <AppText variant="caption" tone="soft" style={{ marginTop: space.md, color: colors.charcoalSoft }}>
        Podés cambiar de plan después, desde la pestaña Planes.
      </AppText>
    </Screen>
  );
}
