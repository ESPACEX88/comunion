import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { SUPABASE_URL } from '@/lib/supabase';
import { radius, space, useTheme } from '@/theme';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export default function OnboardingAccount() {
  const { draft, setDraft } = useAppState();
  const { configured, session, signIn, signUp } = useAuth();
  const { colors } = useTheme();
  const [mode, setMode] = useState<'entrar' | 'crear'>('crear');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (session) {
    return <Redirect href="/onboarding/grupo" />;
  }

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (!configured) {
      setError(
        'Faltan las claves de Supabase. En un .env local, pegá EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY (Settings → API).',
      );
      return;
    }
    if (!email.includes('@') || password.length < 6) {
      setError('Usá un correo válido y una contraseña de al menos 6 caracteres.');
      return;
    }
    if (mode === 'crear' && draft.name.trim().length < 2) {
      setError('Antes, tu nombre. Así te va a ver tu dúo.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'crear') {
        const result = await signUp(email, password, draft.name.trim());
        if (result.needsConfirm) {
          setInfo(
            'Te mandamos un correo para confirmar. Si no llega, en el dashboard de Supabase: Authentication → Providers → Email, desactivá Confirm email mientras prueban.',
          );
          return;
        }
        router.replace('/onboarding/grupo');
      } else {
        await signIn(email, password);
        router.replace('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <AppText variant="label" tone="olive">
        Comunión
      </AppText>
      <AppText variant="display" style={{ marginTop: space.md }}>
        {mode === 'crear' ? 'Una cuenta, para las dos.' : 'Volvé a la mesa.'}
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        El dúo vive en la nube, despacio. Misma mesa en los dos teléfonos. Sin service_role: solo la
        clave anónima del proyecto.
      </AppText>
      {!configured ? (
        <View
          style={{
            marginTop: space.md,
            padding: space.md,
            backgroundColor: colors.creamDeep,
            borderRadius: radius.md,
          }}>
          <AppText variant="ui" tone="soft">
            URL esperada: {SUPABASE_URL || 'https://…supabase.co'}. Pegá la anon key en `.env` y
            reiniciá Expo.
          </AppText>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.lg }}>
        <Choice label="Crear cuenta" active={mode === 'crear'} onPress={() => setMode('crear')} />
        <Choice label="Entrar" active={mode === 'entrar'} onPress={() => setMode('entrar')} />
      </View>
      {mode === 'crear' ? (
        <>
          <AppText variant="label" tone="amber" style={{ marginTop: space.lg }}>
            ¿Cómo te llamás?
          </AppText>
          <Field
            value={draft.name}
            onChangeText={(name) => setDraft({ name })}
            placeholder="José, Ana…"
            autoCapitalize="words"
          />
        </>
      ) : null}
      <AppText variant="label" tone="amber" style={{ marginTop: space.md }}>
        Correo
      </AppText>
      <Field
        value={email}
        onChangeText={setEmail}
        placeholder="ana@correo.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <AppText variant="label" tone="amber" style={{ marginTop: space.md }}>
        Contraseña
      </AppText>
      <Field
        value={password}
        onChangeText={setPassword}
        placeholder="Mínimo 6 caracteres"
        autoCapitalize="none"
        secureTextEntry
      />
      {error ? (
        <AppText variant="ui" tone="soft" style={{ marginTop: space.md, color: colors.terracotta }}>
          {error}
        </AppText>
      ) : null}
      {info ? (
        <AppText variant="ui" tone="olive" style={{ marginTop: space.md }}>
          {info}
        </AppText>
      ) : null}
      <Button
        label={busy ? 'Un segundo…' : mode === 'crear' ? 'Crear cuenta' : 'Entrar'}
        style={{ marginTop: space.lg }}
        disabled={busy}
        onPress={() => void submit()}
      />
      <Button
        label="Seguir sin cuenta (solo este teléfono)"
        variant="ghost"
        style={{ marginTop: 10 }}
        onPress={() => router.push('/onboarding/nombre')}
      />
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
    <Button
      label={label}
      variant={active ? 'olive' : 'ghost'}
      onPress={onPress}
      style={{ flex: 1, paddingHorizontal: 8 }}
    />
  );
}

