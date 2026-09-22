import { Enter } from '@/components/motion/Enter';
import { PressScale } from '@/components/motion/PressScale';
import { AppText } from '@/components/ui/AppText';
import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { SUPABASE_URL } from '@/lib/supabase';
import { radius, space, useTheme } from '@/theme';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

type Mode = 'entrar' | 'crear';

export default function OnboardingAccount() {
  const { draft, setDraft } = useAppState();
  const { configured, session, signIn, signUp } = useAuth();
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>('crear');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (session) {
    return <Redirect href="/" />;
  }

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (!configured) {
      setError('Falta configurar Supabase en este teléfono. Pegá las claves en el .env y reiniciá.');
      return;
    }
    if (!email.includes('@') || password.length < 6) {
      setError('Usá un correo válido y una contraseña de al menos 6 caracteres.');
      return;
    }
    if (mode === 'crear' && draft.name.trim().length < 2) {
      setError('Antes, tu nombre. Así te vas a ver en tu espacio.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'crear') {
        const result = await signUp(email, password, draft.name.trim());
        if (result.needsConfirm) {
          setInfo('Te mandamos un correo para confirmar. Si no llega, mirá el spam.');
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
      <Enter>
        <BrandMark />
      </Enter>
      <Enter delay={60}>
        <AppText variant="title" style={{ marginTop: space.lg, textAlign: 'center' }}>
          {mode === 'crear' ? 'Tu espacio' : 'Buenas'}
        </AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 8, textAlign: 'center' }}>
          {mode === 'crear' ? 'Un nombre, un correo. El dúo se suma después.' : 'Entrá con tu correo. Tu día te espera.'}
        </AppText>
      </Enter>

      {!configured ? (
        <Enter delay={90}>
          <View
            style={{
              marginTop: space.lg,
              padding: space.md,
              backgroundColor: colors.creamDeep,
              borderRadius: radius.lg,
            }}>
            <AppText variant="ui" tone="soft">
              {SUPABASE_URL ? 'Falta la clave anónima de Supabase.' : 'Falta la URL de Supabase.'} En el
              .env, pegá las dos y reiniciá Expo.
            </AppText>
          </View>
        </Enter>
      ) : null}

      <Enter delay={120}>
        <ModeTabs mode={mode} onChange={setMode} />
      </Enter>

      {mode === 'crear' ? (
        <Enter delay={160} key="nombre">
          <AppText variant="label" tone="amber" style={{ marginTop: space.xl }}>
            Tu nombre
          </AppText>
          <Field
            value={draft.name}
            onChangeText={(name) => setDraft({ name })}
            placeholder="Tu nombre"
            autoCapitalize="words"
            autoComplete="name"
            accessibilityLabel="Tu nombre"
          />
        </Enter>
      ) : null}

      <Enter delay={mode === 'crear' ? 200 : 160} key={`correo-${mode}`}>
        <AppText variant="label" tone="amber" style={{ marginTop: space.lg }}>
          Correo
        </AppText>
        <Field
          value={email}
          onChangeText={setEmail}
          placeholder="Correo"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          accessibilityLabel="Correo"
        />
      </Enter>

      <Enter delay={mode === 'crear' ? 240 : 200} key={`clave-${mode}`}>
        <AppText variant="label" tone="amber" style={{ marginTop: space.lg }}>
          Contraseña
        </AppText>
        <Field
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          autoCapitalize="none"
          autoComplete={mode === 'crear' ? 'password-new' : 'password'}
          secureTextEntry
          accessibilityLabel="Contraseña"
        />
      </Enter>

      {error ? (
        <AppText variant="ui" style={{ marginTop: space.md, color: colors.terracotta }}>
          {error}
        </AppText>
      ) : null}
      {info ? (
        <AppText variant="ui" tone="olive" style={{ marginTop: space.md }}>
          {info}
        </AppText>
      ) : null}

      <Enter delay={280}>
        <Button
          label={busy ? 'Un segundo…' : mode === 'crear' ? 'Crear cuenta' : 'Entrar'}
          style={{ marginTop: space.xl }}
          disabled={busy}
          onPress={() => void submit()}
        />
        <Button
          label="Seguir sin cuenta"
          variant="ghost"
          style={{ marginTop: 12 }}
          onPress={() => router.push('/onboarding/nombre')}
        />
      </Enter>
    </Screen>
  );
}

function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (next: Mode) => void }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        marginTop: space.xl,
        flexDirection: 'row',
        padding: 4,
        backgroundColor: colors.creamDeep,
        borderRadius: 999,
      }}>
      <ModeTab label="Crear cuenta" active={mode === 'crear'} onPress={() => onChange('crear')} />
      <ModeTab label="Entrar" active={mode === 'entrar'} onPress={() => onChange('entrar')} />
    </View>
  );
}

function ModeTab({
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
    <PressScale onPress={onPress} style={{ flex: 1 }} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <View
        style={{
          paddingVertical: 11,
          borderRadius: 999,
          backgroundColor: active ? colors.paper : 'transparent',
          borderWidth: active ? 1 : 0,
          borderColor: colors.line,
        }}>
        <AppText
          variant="ui"
          style={{
            textAlign: 'center',
            color: active ? colors.amberDeep : colors.charcoalSoft,
          }}>
          {label}
        </AppText>
      </View>
    </PressScale>
  );
}
