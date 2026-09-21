import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { EXAMPLE_INVITE_CODE } from '@/features/plans/content';
import { radius, space, useTheme } from '@/theme';
import { Redirect, router } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function OnboardingGroup() {
  const { draft, setDraft, state } = useAppState();
  const { session } = useAuth();

  if (state.remoteDuoId) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Screen>
      <AppText variant="label" tone="olive">
        Comunión · el dúo
      </AppText>
      <AppText variant="title" style={{ marginTop: space.md }}>
        Nadie lee del todo solo.
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        {session
          ? 'Una crea el dúo y comparte el código. La otra se une. El plan «Salmos de a dos» se siembra solo, con una pregunta cada tarde.'
          : 'Sin cuenta, Ana queda de amiga mock en este teléfono. Con cuenta, el dúo es de verdad.'}
      </AppText>
      <View style={{ height: space.lg }} />
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Choice
          label="Crear dúo"
          active={draft.mode === 'create'}
          onPress={() => setDraft({ mode: 'create' })}
        />
        <Choice
          label="Unirme"
          active={draft.mode === 'join'}
          onPress={() => setDraft({ mode: 'join' })}
        />
      </View>
      <View style={{ height: space.lg }} />
      {draft.mode === 'create' ? (
        <>
          <AppText variant="label" tone="amber">
            Nombre del dúo
          </AppText>
          <Field
            value={draft.groupName}
            onChangeText={(groupName) => setDraft({ groupName })}
            placeholder="Nosotros"
          />
        </>
      ) : (
        <>
          <AppText variant="label" tone="amber">
            Código de invitación
          </AppText>
          <Field
            value={draft.inviteCode}
            onChangeText={(inviteCode) => setDraft({ inviteCode })}
            placeholder="A3F9C2"
            autoCapitalize="characters"
          />
          <AppText variant="caption" tone="soft" style={{ marginTop: 8 }}>
            {session
              ? 'El código lo comparte quien creó el dúo. Seis letras o números.'
              : `En el mock local podés probar ${EXAMPLE_INVITE_CODE}.`}
          </AppText>
        </>
      )}
      <View style={{ height: space.xl }} />
      <Button label="El plan de a dos" onPress={() => router.push('/onboarding/plan')} />
      <Button label="Atrás" variant="ghost" onPress={() => router.back()} style={{ marginTop: 10 }} />
    </Screen>
  );
}

function Choice({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 14,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: active ? colors.amber : colors.line,
        backgroundColor: active ? colors.charcoal : colors.paper,
        alignItems: 'center',
      }}>
      <AppText variant="ui" style={{ color: active ? colors.amberSoft : colors.charcoal }}>
        {label}
      </AppText>
    </Pressable>
  );
}
