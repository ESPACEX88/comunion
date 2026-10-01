import { Enter } from '@/components/motion/Enter';
import { PressScale } from '@/components/motion/PressScale';
import { Avatar } from '@/components/group/MemberRow';
import { AppText } from '@/components/ui/AppText';
import { AuroraOrb } from '@/components/ui/AuroraOrb';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  acceptFriendInvite,
  cancelFriendInvite,
  createFriendInvite,
  loadFriends,
  unfriend,
  type FriendInvite,
  type FriendRow,
} from '@/lib/friends';
import { isSupabaseConfigured } from '@/lib/supabase';
import { radius, space, useTheme } from '@/theme';
import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Share, View } from 'react-native';

export default function AmigosScreen() {
  const { user, configured } = useAuth();
  const { colors, setPreference } = useTheme();
  const params = useLocalSearchParams<{ shot?: string }>();
  useEffect(() => {
    if (params.shot === 'aurora') setPreference('dark');
  }, [params.shot, setPreference]);
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [invite, setInvite] = useState<FriendInvite | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) return;
    try {
      const next = await loadFriends();
      setFriends(next.friends);
      setInvite(next.invite);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudieron cargar los amigos.');
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const shotFriends: FriendRow[] =
    params.shot === 'lista'
      ? [{ id: 'shot-mateo', name: 'Mateo', hue: 'olive', since: new Date().toISOString() }]
      : [];
  const visibleFriends = friends.length > 0 ? friends : shotFriends;
  const needAccount = !configured || !user;

  const inviteSomeone = async () => {
    if (needAccount) {
      router.push('/onboarding');
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const next = await createFriendInvite();
      setInvite(next);
      const message = `Te invito a Comunión. Código de amigo: ${next.code}`;
      try {
        await Share.share({ message });
      } catch {
        await Clipboard.setStringAsync(next.code);
        setCopied(true);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo crear la invitación.');
    } finally {
      setBusy(false);
    }
  };

  const joinWithCode = async () => {
    if (needAccount) {
      router.push('/onboarding');
      return;
    }
    if (code.trim().length < 4) {
      setError('Pegá el código que te compartieron.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await acceptFriendInvite(code);
      setCode('');
      setInfo('Listo. Ya está en tu lista.');
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo aceptar el código.');
    } finally {
      setBusy(false);
    }
  };

  const cancelPending = async () => {
    setBusy(true);
    setError(null);
    try {
      await cancelFriendInvite();
      setInvite(null);
      setInfo('Invitación cancelada.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cancelar.');
    } finally {
      setBusy(false);
    }
  };

  const removeFriend = (friend: FriendRow) => {
    const run = async () => {
      setBusy(true);
      setError(null);
      try {
        await unfriend(friend.id);
        await refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'No se pudo quitar.');
      } finally {
        setBusy(false);
      }
    };
    if (Platform.OS === 'web') {
      const ok =
        typeof window !== 'undefined' && window.confirm(`¿Quitar a ${friend.name} de tus amigos?`);
      if (ok) void run();
      return;
    }
    Alert.alert(`¿Quitar a ${friend.name}?`, 'El dúo, si lo hay, no se toca.', [
      { text: 'Mejor no', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => void run() },
    ]);
  };

  return (
    <Screen>
      <BackLink label="Volver" />
      <Enter>
        <AppText variant="label" tone="amber" style={{ marginTop: space.lg }}>
          Amigos
        </AppText>
      </Enter>

      {visibleFriends.length === 0 ? (
        <Enter delay={60}>
          <View style={{ alignItems: 'center', paddingTop: space.xl, paddingBottom: space.lg }}>
            <AuroraOrb />
            <AppText variant="title" style={{ textAlign: 'center' }}>
              Aún sin amigos
            </AppText>
            <AppText variant="ui" tone="soft" style={{ textAlign: 'center', marginTop: 8, maxWidth: 280 }}>
              Un código, un sí, y crece tu comunidad más allá del dúo.
            </AppText>
          </View>
        </Enter>
      ) : (
        <Enter>
          <AppText variant="title" style={{ marginTop: 8 }}>
            Tu red
          </AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
            El dúo es de a dos. Acá invitás con un código.
          </AppText>
        </Enter>
      )}

      <Enter delay={70}>
        <Button
          label={busy ? 'Un segundo…' : 'Invitar amigos'}
          variant={visibleFriends.length === 0 ? 'solid' : 'primary'}
          style={{ marginTop: space.md }}
          disabled={busy}
          onPress={() => void inviteSomeone()}
        />
      </Enter>

      <Enter delay={110}>
        <AppText variant="label" tone="amber" style={{ marginTop: space.lg }}>
          Tengo un código
        </AppText>
        <Field
          value={code}
          onChangeText={(value) => setCode(value.toUpperCase())}
          placeholder="Código"
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          accessibilityLabel="Código de amigo"
        />
        <Button
          label={busy ? 'Un segundo…' : 'Aceptar invitación'}
          variant="ghost"
          style={{ marginTop: space.md }}
          disabled={busy}
          onPress={() => void joinWithCode()}
        />
      </Enter>

      {invite ? (
        <Enter delay={140}>
          <View
            style={{
              marginTop: space.lg,
              padding: space.md,
              borderRadius: radius.lg,
              backgroundColor: colors.glass,
              borderWidth: 1,
              borderColor: colors.glassBorder,
            }}>
            <AppText variant="label" tone="amber">
              Invitación pendiente
            </AppText>
            <AppText variant="subtitle" style={{ marginTop: 6 }}>
              {invite.code}
            </AppText>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: space.sm }}>
              <View style={{ flex: 1 }}>
                <Button
                  label={copied ? 'Copiado' : 'Copiar'}
                  variant="ghost"
                  onPress={async () => {
                    await Clipboard.setStringAsync(invite.code);
                    setCopied(true);
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Cancelar" variant="ghost" disabled={busy} onPress={() => void cancelPending()} />
              </View>
            </View>
          </View>
        </Enter>
      ) : null}

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

      {visibleFriends.length === 0 ? (
        <Enter delay={180}>
          <AppText variant="caption" tone="soft" style={{ marginTop: space.xl, textAlign: 'center' }}>
            {needAccount
              ? 'Con tu cuenta el otro entra el código y queda.'
              : 'Cuando acepten el tuyo, aparecen acá.'}
          </AppText>
        </Enter>
      ) : (
        <View style={{ marginTop: space.xl }}>
          {visibleFriends.map((friend, index) => (
            <Enter key={friend.id} delay={160 + index * 40}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.line,
                }}>
                <Avatar name={friend.name} hue={friend.hue} size={44} />
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle">{friend.name}</AppText>
                  <AppText variant="caption" tone="soft">
                    Amigo · no es el dúo
                  </AppText>
                </View>
                <PressScale onPress={() => removeFriend(friend)} accessibilityRole="button">
                  <AppText variant="ui" tone="amber">
                    Quitar
                  </AppText>
                </PressScale>
              </View>
            </Enter>
          ))}
        </View>
      )}
    </Screen>
  );
}
