import { Enter } from '@/components/motion/Enter';
import { AppText } from '@/components/ui/AppText';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { GROUP_COLOR_HEX } from '@/features/groups/challenges';
import { useGroups } from '@/features/groups/GroupsProvider';
import { confirmLeaveGroup, confirmRemoveMember } from '@/features/groups/leaveConfirm';
import { useActiveGroupLive } from '@/features/groups/useGroupLive';
import { groupInviteMessage } from '@/lib/groups';
import { space, useTheme } from '@/theme';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Share, View } from 'react-native';

export default function GrupoMiembros() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const groupsApi = useGroups();
  const { bundle, loading, error, refreshing, onRefresh, reload } = useActiveGroupLive();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const selfId = user?.id ?? '';
  const isOwner = bundle?.group.role === 'owner';

  const shareCode = async () => {
    if (!bundle) return;
    const message = groupInviteMessage(bundle.group.name, bundle.group.inviteCode);
    try {
      await Share.share({ message });
    } catch {
      await Clipboard.setStringAsync(bundle.group.inviteCode);
      setCopied(true);
    }
  };

  const rotate = async () => {
    if (!id) return;
    setBusy(true);
    try {
      await groupsApi.rotateCode(id);
      await reload();
      await groupsApi.refresh();
    } finally {
      setBusy(false);
    }
  };

  const leave = () => {
    if (!id) return;
    confirmLeaveGroup(() => {
      void (async () => {
        setBusy(true);
        try {
          await groupsApi.leaveGroup(id);
          router.replace('/(tabs)/grupos');
        } finally {
          setBusy(false);
        }
      })();
    });
  };

  return (
    <Screen refreshing={refreshing} onRefresh={() => void onRefresh()}>
      <BackLink label="Grupo" />
      <Enter>
        <AppText variant="label" tone="amber" style={{ marginTop: space.lg }}>
          Personas
        </AppText>
        <AppText variant="title" style={{ marginTop: 8 }}>
          {bundle?.group.name ?? 'El grupo'}
        </AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
          Hasta treinta. El código sirve las veces que haga falta.
        </AppText>
      </Enter>

      {loading && !bundle ? (
        <AppText variant="ui" tone="soft" style={{ marginTop: space.lg }}>
          Trayendo a la gente…
        </AppText>
      ) : null}
      {error ? (
        <AppText variant="ui" style={{ color: colors.terracotta, marginTop: space.md }}>
          {error}
        </AppText>
      ) : null}

      {bundle ? (
        <>
          <GlassCard style={{ marginTop: space.lg }}>
            <AppText variant="label" tone="amber">
              Invitación
            </AppText>
            <AppText variant="title" style={{ marginTop: 8 }}>
              {bundle.group.inviteCode}
            </AppText>
            <AppText variant="caption" tone="soft" style={{ marginTop: 4, letterSpacing: 0 }}>
              Compartilo. Quien lo ponga entra al grupo, no al dúo.
            </AppText>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <View style={{ flex: 1 }}>
                <Button
                  label={copied ? 'Copiado' : 'Copiar'}
                  variant="ghost"
                  onPress={async () => {
                    await Clipboard.setStringAsync(bundle.group.inviteCode);
                    setCopied(true);
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Enviar" variant="ghost" onPress={() => void shareCode()} />
              </View>
            </View>
            {isOwner ? (
              <Button
                label={busy ? 'Un segundo…' : 'Renovar código'}
                variant="ghost"
                style={{ marginTop: 8 }}
                disabled={busy}
                onPress={() => void rotate()}
              />
            ) : null}
          </GlassCard>

          <View style={{ marginTop: space.lg, gap: 8 }}>
            {bundle.members.map((member) => {
              const mine = member.userId === selfId;
              return (
                <View
                  key={member.userId}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 10,
                  }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      backgroundColor: GROUP_COLOR_HEX[bundle.group.color],
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <AppText variant="ui" style={{ color: '#FFFCF6' }}>
                      {member.name.slice(0, 1).toUpperCase()}
                    </AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="ui">{mine ? `${member.name} · vos` : member.name}</AppText>
                    <AppText variant="caption" tone="soft" style={{ letterSpacing: 0 }}>
                      {member.role === 'owner' ? 'Cuida el grupo' : 'En el grupo'}
                    </AppText>
                  </View>
                  {isOwner && !mine ? (
                    <Button
                      label="Sacar"
                      variant="ghost"
                      compact
                      disabled={busy}
                      onPress={() =>
                        confirmRemoveMember(member.name.split(' ')[0] || member.name, () => {
                          void groupsApi.removeMember(id!, member.userId).then(() => reload());
                        })
                      }
                    />
                  ) : null}
                </View>
              );
            })}
          </View>

          <Button
            label="Salir del grupo"
            variant="danger"
            style={{ marginTop: space.xl, marginBottom: space.lg }}
            disabled={busy}
            onPress={leave}
          />
        </>
      ) : null}
    </Screen>
  );
}
