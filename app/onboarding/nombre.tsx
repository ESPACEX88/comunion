import { Enter } from '@/components/motion/Enter';
import { AppText } from '@/components/ui/AppText';
import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { Field } from '@/components/ui/Field';
import { radius, space, useTheme } from '@/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export default function OnboardingName() {
  const { draft, setDraft, enterSolo } = useAppState();
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);

  return (
    <Screen>
      <Enter>
        <BrandMark compact />
      </Enter>
      <Enter delay={50}>
        <AppText variant="title" style={{ marginTop: space.lg, textAlign: 'center' }}>
          Antes, tu nombre
        </AppText>
      </Enter>
      <Ornament />
      <AppText variant="body" tone="soft">
        Esto queda en este teléfono. Podés entrar ya a tu espacio, o más adelante sumar un dúo.
      </AppText>
      <View style={{ height: space.xl }} />
      <AppText variant="label" tone="amber">
        ¿Cómo te llamás?
      </AppText>
      <Field
        value={draft.name}
        onChangeText={(name) => setDraft({ name })}
        placeholder="Tu nombre"
        autoFocus
        autoCapitalize="words"
      />
      <View style={{ height: space.xl }} />
      <Button
        label={busy ? 'Un segundo…' : 'Seguir en solitario'}
        onPress={async () => {
          setBusy(true);
          try {
            await enterSolo();
            router.replace('/(tabs)');
          } finally {
            setBusy(false);
          }
        }}
        disabled={draft.name.trim().length < 2 || busy}
      />
      <Button
        label="Prefiero un dúo"
        variant="ghost"
        onPress={() => router.push('/onboarding/grupo')}
        style={{ marginTop: 10 }}
      />
      <Button label="Atrás" variant="ghost" onPress={() => router.back()} style={{ marginTop: 10 }} />
      <View
        style={{
          marginTop: space.xl,
          padding: space.md,
          borderRadius: radius.md,
          backgroundColor: colors.creamDeep,
        }}>
        <AppText variant="ui" tone="soft">
          El día cuenta cuando terminás el pasaje, no con un visto suelto.
        </AppText>
      </View>
    </Screen>
  );
}
