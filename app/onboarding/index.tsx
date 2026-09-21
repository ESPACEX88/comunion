import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { colors, radius, space } from '@/theme';
import { router } from 'expo-router';
import { TextInput, View } from 'react-native';

export default function OnboardingName() {
  const { draft, setDraft } = useAppState();

  return (
    <Screen>
      <AppText variant="label" tone="olive">
        Comunión · 1 de 3
      </AppText>
      <AppText variant="display" style={{ marginTop: space.md }}>
        Antes de la mesa, tu nombre.
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        Así te van a ver tus amigos cuando termines la lectura del día. Un apodo está bien; lo
        importante es que sea tuyo.
      </AppText>
      <View style={{ height: space.xl }} />
      <AppText variant="label" tone="amber">
        ¿Cómo te llamás?
      </AppText>
      <TextInput
        value={draft.name}
        onChangeText={(name) => setDraft({ name })}
        placeholder="Tu nombre"
        placeholderTextColor={colors.oliveSoft}
        autoFocus
        autoCapitalize="words"
        style={{
          marginTop: space.sm,
          borderBottomWidth: 1.5,
          borderBottomColor: colors.amber,
          paddingVertical: 12,
          fontFamily: 'Fraunces_600SemiBold',
          fontSize: 28,
          color: colors.ink,
        }}
      />
      <View style={{ height: space.xl }} />
      <Button
        label="Seguir"
        onPress={() => router.push('/onboarding/grupo')}
        disabled={draft.name.trim().length < 2}
      />
      <View
        style={{
          marginTop: space.xl,
          padding: space.md,
          borderRadius: radius.md,
          backgroundColor: colors.creamDeep,
        }}>
        <AppText variant="ui" tone="soft">
          El día cuenta cuando terminás el pasaje, no con un visto suelto. Eso vale para vos y para
          el grupo.
        </AppText>
      </View>
    </Screen>
  );
}
