import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { EXAMPLE_INVITE_CODE } from '@/features/plans/content';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { colors, radius, space } from '@/theme';
import { router } from 'expo-router';
import { Pressable, TextInput, View } from 'react-native';

export default function OnboardingGroup() {
  const { draft, setDraft } = useAppState();

  return (
    <Screen>
      <AppText variant="label" tone="olive">
        Comunión · 2 de 3
      </AppText>
      <AppText variant="display" style={{ marginTop: space.md }}>
        Nadie lee del todo solo.
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        Creá un grupo para compartir la racha, o unite con un código. En esta versión los amigos son
        de ejemplo: Ana, Mateo y Lucía ya están en la mesa.
      </AppText>
      <View style={{ height: space.lg }} />
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Choice
          label="Crear grupo"
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
            Nombre del grupo
          </AppText>
          <Field
            value={draft.groupName}
            onChangeText={(groupName) => setDraft({ groupName })}
            placeholder="Mesa de Emaús"
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
            placeholder={EXAMPLE_INVITE_CODE}
            autoCapitalize="characters"
          />
          <AppText variant="caption" tone="soft" style={{ marginTop: 8 }}>
            Probá {EXAMPLE_INVITE_CODE} para entrar al grupo de ejemplo.
          </AppText>
        </>
      )}
      <View style={{ height: space.xl }} />
      <Button label="Elegir el plan" onPress={() => router.push('/onboarding/plan')} />
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

function Field({
  value,
  onChangeText,
  placeholder,
  autoCapitalize,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  autoCapitalize?: 'characters' | 'words';
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.oliveSoft}
      autoCapitalize={autoCapitalize ?? 'words'}
      style={{
        marginTop: space.sm,
        backgroundColor: colors.paper,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.md,
        paddingHorizontal: space.md,
        paddingVertical: 14,
        fontFamily: 'Literata_400Regular',
        fontSize: 18,
        color: colors.ink,
      }}
    />
  );
}
