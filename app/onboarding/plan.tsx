import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { ALL_PLANS, PSALMS_PLAN } from '@/features/plans/content';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { space, useTheme } from '@/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

export default function OnboardingPlan() {
  const { draft, setDraft, completeOnboarding, syncError } = useAppState();
  const { colors } = useTheme();
  const { session } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plans = session ? [PSALMS_PLAN] : ALL_PLANS;

  return (
    <Screen>
      <AppText variant="label" tone="olive">
        Comunión · el plan
      </AppText>
      <AppText variant="display" style={{ marginTop: space.md }}>
        Salmos de a dos.
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        {session
          ? 'Al crear o unirte, se siembra este plan de siete días con una pregunta suave cada tarde. Un día cuenta cuando terminás el pasaje.'
          : 'Este es el plan compartido. Un día cuenta cuando el pasaje se termina, no cuando se marca de apuro.'}
      </AppText>
      <View style={{ marginTop: space.lg, gap: space.md }}>
        {plans.map((plan) => {
          const active = draft.planId === plan.id;
          return (
            <Pressable key={plan.id} onPress={() => setDraft({ planId: plan.id })}>
              <Card accent={active ? 'amber' : 'none'}>
                <AppText variant="label" tone={active ? 'amber' : 'soft'}>
                  {plan.recommendedFor === 'duo' ? 'De a dos' : 'Más corto'} · {plan.durationLabel}
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
      {error || syncError ? (
        <AppText variant="ui" style={{ color: colors.terracotta, marginBottom: space.md }}>
          {error ?? syncError}
        </AppText>
      ) : null}
      <Button
        label={busy ? 'Un segundo…' : session ? 'Entrar al dúo' : 'Entrar a Comunión'}
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          setError(null);
          try {
            await completeOnboarding();
            router.replace('/(tabs)');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo entrar.');
          } finally {
            setBusy(false);
          }
        }}
      />
      <Button label="Atrás" variant="ghost" onPress={() => router.back()} style={{ marginTop: 10 }} />
    </Screen>
  );
}
