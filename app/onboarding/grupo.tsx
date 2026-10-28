import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  GROUP_COLOR_HEX,
  GROUP_COLOR_IDS,
  GROUP_EMOJIS,
  type GroupColorId,
} from '@/features/groups/challenges';
import { GROUP_WHAT_IT_IS } from '@/features/groups/copy';
import { useGroups } from '@/features/groups/GroupsProvider';
import { radius, space, useTheme } from '@/theme';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

export default function OnboardingGroup() {
  const { draft, setDraft, state, enterSolo } = useAppState();
  const { session } = useAuth();
  const { groups, createGroup, joinGroup } = useGroups();
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emoji, setEmoji] = useState<(typeof GROUP_EMOJIS)[number]>('✦');
  const [color, setColor] = useState<GroupColorId>('amber');

  if (state.onboardingComplete && groups.length > 0) {
    return <Redirect href="/(tabs)" />;
  }

  const finish = async () => {
    await enterSolo();
    router.replace('/(tabs)/grupos');
  };

  const onCreate = async () => {
    if (!session) {
      await finish();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createGroup(draft.groupName.trim() || draft.name.trim() || 'Nuestro grupo', emoji, color);
      await finish();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo crear el grupo.');
    } finally {
      setBusy(false);
    }
  };

  const onJoin = async () => {
    if (!session) {
      router.push('/onboarding');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await joinGroup(draft.inviteCode);
      await finish();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo unir.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <AppText variant="label" tone="olive">
        Comunión · el grupo
      </AppText>
      <AppText variant="title" style={{ marginTop: space.md }}>
        Crear un grupo o unirme con código
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        {GROUP_WHAT_IT_IS}
      </AppText>
      <View style={{ height: space.lg }} />
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Choice
          label="Crear un grupo"
          active={draft.mode === 'create'}
          onPress={() => setDraft({ mode: 'create' })}
        />
        <Choice
          label="Tengo un código"
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
            placeholder="Jóvenes de la iglesia"
          />
          <AppText variant="label" tone="amber" style={{ marginTop: space.md }}>
            Marca
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {GROUP_EMOJIS.map((mark) => (
              <Pressable
                key={mark}
                onPress={() => setEmoji(mark)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: emoji === mark ? colors.glassStrong : colors.glass,
                  borderWidth: 1,
                  borderColor: emoji === mark ? colors.amber : colors.glassBorder,
                }}>
                <AppText variant="subtitle">{mark}</AppText>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: space.md }}>
            {GROUP_COLOR_IDS.map((id) => (
              <Pressable
                key={id}
                onPress={() => setColor(id)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: GROUP_COLOR_HEX[id],
                  borderWidth: color === id ? 2 : 0,
                  borderColor: colors.ink,
                }}
              />
            ))}
          </View>
        </>
      ) : (
        <>
          <AppText variant="label" tone="amber">
            Código de invitación
          </AppText>
          <Field
            value={draft.inviteCode}
            onChangeText={(inviteCode) => setDraft({ inviteCode: inviteCode.toUpperCase() })}
            placeholder="A3F9C2"
            autoCapitalize="characters"
          />
          <AppText variant="caption" tone="soft" style={{ marginTop: 8 }}>
            El código lo comparte quien creó el grupo. Seis letras o números.
          </AppText>
        </>
      )}
      {error ? (
        <AppText variant="ui" style={{ color: colors.terracotta, marginTop: space.md }}>
          {error}
        </AppText>
      ) : null}
      <View style={{ height: space.xl }} />
      <Button
        label={
          busy
            ? 'Un segundo…'
            : draft.mode === 'create'
              ? session
                ? 'Crear grupo'
                : 'Primero tu cuenta'
              : session
                ? 'Unirme'
                : 'Primero tu cuenta'
        }
        disabled={busy}
        onPress={() => void (draft.mode === 'create' ? onCreate() : onJoin())}
      />
      <Button
        label="Ahora no"
        variant="ghost"
        style={{ marginTop: 10 }}
        onPress={async () => {
          await enterSolo();
          router.replace('/(tabs)');
        }}
      />
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
      <AppText variant="ui" style={{ color: active ? colors.amberSoft : colors.charcoal, textAlign: 'center' }}>
        {label}
      </AppText>
    </Pressable>
  );
}
