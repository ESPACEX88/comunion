import { Enter } from '@/components/motion/Enter';
import { PressScale } from '@/components/motion/PressScale';
import { Avatar } from '@/components/group/MemberRow';
import { AppText } from '@/components/ui/AppText';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Ornament } from '@/components/ui/Ornament';
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
import { useCallback, useState } from 'react';
import { Alert, Platform, Share, View } from 'react-native';

export default function AmigosScreen() {
  const { user, configured } = useAuth();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ shot?: string }>();
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
        <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
          Amigos
        </AppText>
        <AppText variant="title" style={{ marginTop: 8 }}>
          {visibleFriends.length === 0 ? 'Aún sin amigos' : 'Tu red'}
        </AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
          El dúo sigue siendo la pareja del plan. Acá es más ancho: un código, un sí, y quedan.
        </AppText>
      </Enter>
      <Ornament />

      {visibleFriends.length === 0 ? (
        <Enter delay={80}>
          <View
            style={{
              paddingVertical: space.xxl,
              paddingHorizontal: space.md,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.line,
              borderRadius: radius.lg,
              backgroundColor: colors.paper,
            }}>
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: colors.amber,
                transform: [{ rotate: '45deg' }],
                marginBottom: space.md,
              }}
            />
            <AppText variant="subtitle" style={{ textAlign: 'center' }}>
              Aún sin amigos
            </AppText>
            <AppText variant="body" tone="soft" style={{ marginTop: 8, textAlign: 'center' }}>
              {needAccount
                ? 'Con tu cuenta podés invitar. El otro entra el código y queda.'
                : 'Compartí un código. Cuando lo acepten, aparecen acá.'}
            </AppText>
            <Button
              label={busy ? 'Un segundo…' : 'Invitar amigos'}
              style={{ marginTop: space.xl, alignSelf: 'stretch' }}
              disabled={busy}
              onPress={() => void inviteSomeone()}
            />
          </View>
        </Enter>
      ) : (
        <Enter delay={80}>
          <View style={{ gap: 4 }}>
            {visibleFriends.map((friend) => (
              <View
                key={friend.id}
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
            ))}
          </View>
          <Button
            label={busy ? 'Un segundo…' : 'Invitar a otro'}
            variant="ghost"
            style={{ marginTop: space.lg }}
            disabled={busy}
            onPress={() => void inviteSomeone()}
          />
        </Enter>
      )}

      {invite ? (
        <View
          style={{
            marginTop: space.xl,
            padding: space.md,
            borderRadius: radius.lg,
            backgroundColor: colors.creamDeep,
          }}>
          <AppText variant="label" tone="amber">
            Invitación pendiente
          </AppText>
          <AppText variant="title" style={{ marginTop: 8 }}>
            {invite.code}
          </AppText>
          <AppText variant="caption" tone="soft" style={{ marginTop: 4 }}>
            Todavía no la usaron. Podés copiarla o cancelarla.
          </AppText>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: space.md }}>
            <View style={{ flex: 1 }}>
              <Button
                label={copied ? 'Copiado' : 'Copiar código'}
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
      ) : null}

      <AppText variant="label" tone="amber" style={{ marginTop: space.xl }}>
        Tengo un código
      </AppText>
      <Field
        value={code}
        onChangeText={(value) => setCode(value.toUpperCase())}
        placeholder="Código"
        autoCapitalize="characters"
        autoCorrect={false}
        accessibilityLabel="Código de amigo"
      />
      <Button
        label={busy ? 'Un segundo…' : 'Aceptar invitación'}
        variant="olive"
        style={{ marginTop: space.md }}
        disabled={busy}
        onPress={() => void joinWithCode()}
      />
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
    </Screen>
  );
}
