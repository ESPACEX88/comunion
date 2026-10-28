import { Enter } from '@/components/motion/Enter';
import { AppText } from '@/components/ui/AppText';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { useGroups } from '@/features/groups/GroupsProvider';
import { space, useTheme } from '@/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

export default function UnirseGrupo() {
  const { session } = useAuth();
  const { joinGroup } = useGroups();
  const { setDraft, enterSolo, state } = useAppState();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof params.code === 'string' && params.code.trim()) {
      const next = params.code.trim().toUpperCase();
      setCode(next);
      setDraft({ inviteCode: next, mode: 'join' });
    }
  }, [params.code, setDraft]);

  const onJoin = async () => {
    setDraft({ inviteCode: code.trim().toUpperCase(), mode: 'join' });
    if (!session) {
      router.push('/onboarding');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const id = await joinGroup(code);
      if (!state.onboardingComplete) await enterSolo();
      router.replace({ pathname: '/grupo/[id]', params: { id } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo unir.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <BackLink label="Grupo" />
      <Enter>
        <AppText variant="label" tone="amber" style={{ marginTop: space.lg }}>
          Unirme
        </AppText>
        <AppText variant="title" style={{ marginTop: 8 }}>
          Un código, y ya estás
        </AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
          Seis letras o números. Quien te invitó te los pasa, o abrís el enlace.
        </AppText>
      </Enter>
      <Field
        value={code}
        onChangeText={(value) => setCode(value.toUpperCase())}
        placeholder="A3F9C2"
        autoCapitalize="characters"
        autoCorrect={false}
        accessibilityLabel="Código del grupo"
      />
      {error ? (
        <AppText variant="ui" style={{ color: colors.terracotta, marginTop: space.md }}>
          {error}
        </AppText>
      ) : null}
      <Button
        label={busy ? 'Un segundo…' : session ? 'Unirme' : 'Primero tu cuenta'}
        style={{ marginTop: space.lg }}
        disabled={busy || code.trim().length < 4}
        onPress={() => void onJoin()}
      />
      {!session ? (
        <AppText variant="caption" tone="soft" style={{ marginTop: space.md, textAlign: 'center' }}>
          Creá la cuenta: el código queda listo para unirte después.
        </AppText>
      ) : null}
    </Screen>
  );
}
