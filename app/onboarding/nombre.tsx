import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { Field } from '@/components/ui/Field';
import { radius, space, useTheme } from '@/theme';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function OnboardingName() {
  const { draft, setDraft } = useAppState();
  const { colors } = useTheme();

  return (
    <Screen>
      <AppText variant="label" tone="olive">
        Comunión · este teléfono
      </AppText>
      <AppText variant="display" style={{ marginTop: space.md }}>
        Antes de la mesa, tu nombre.
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        Esto queda solo en el aparato: no hay cuenta ni sync. Para leer con alguien de verdad,
        volvé y creá una cuenta.
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
        label="Seguir"
        onPress={() => router.push('/onboarding/grupo')}
        disabled={draft.name.trim().length < 2}
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
