import { Enter } from '@/components/motion/Enter';
import { PressScale } from '@/components/motion/PressScale';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { GlassCard } from '@/components/ui/GlassCard';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  GROUP_COLOR_HEX,
  GROUP_COLOR_IDS,
  GROUP_EMOJIS,
  type GroupColorId,
} from '@/features/groups/challenges';
import { GROUP_WHAT_IT_IS } from '@/features/groups/copy';
import { GroupHomeView } from '@/features/groups/GroupHomeView';
import { GroupWelcome } from '@/features/groups/GroupWelcome';
import { useGroups } from '@/features/groups/GroupsProvider';
import { space, useTheme } from '@/theme';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

export default function GruposTab() {
  const { session } = useAuth();
  const { groups, error, refresh, createGroup, joinGroup } = useGroups();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ code?: string; intent?: string }>();
  const [mode, setMode] = useState<'list' | 'crear' | 'codigo'>('list');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<(typeof GROUP_EMOJIS)[number]>('✦');
  const [color, setColor] = useState<GroupColorId>('amber');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    if (typeof params.code === 'string' && params.code.trim()) {
      setCode(params.code.trim().toUpperCase());
      setMode('codigo');
      return;
    }
    if (params.intent === 'join') setMode('codigo');
    if (params.intent === 'create') setMode('crear');
  }, [params.code, params.intent]);

  const goNeedAccount = () => router.push('/onboarding');

  const onCreate = async () => {
    if (!session) return goNeedAccount();
    setBusy(true);
    setLocalError(null);
    try {
      await createGroup(name, emoji, color);
      setMode('list');
      setName('');
    } catch (caught) {
      setLocalError(caught instanceof Error ? caught.message : 'No se pudo crear.');
    } finally {
      setBusy(false);
    }
  };

  const onJoin = async () => {
    if (!session) return goNeedAccount();
    setBusy(true);
    setLocalError(null);
    try {
      await joinGroup(code);
      setMode('list');
      setCode('');
    } catch (caught) {
      setLocalError(caught instanceof Error ? caught.message : 'No se pudo unir.');
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'list' && groups.length === 1) {
    return <GroupHomeView groupId={groups[0].id} embedded />;
  }

  return (
    <Screen refreshing={false} onRefresh={() => void refresh()}>
      {groups.length > 0 ? (
        <Enter>
          <AppText variant="label" tone="amber">
            Grupo
          </AppText>
          <AppText variant="title" style={{ marginTop: 8 }}>
            Tus grupos
          </AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
            {GROUP_WHAT_IT_IS}
          </AppText>
        </Enter>
      ) : null}

      {mode === 'crear' ? (
        <Enter delay={60} style={{ marginTop: space.lg }}>
          <AppText variant="label" tone="amber">
            Nombre
          </AppText>
          <Field value={name} onChangeText={setName} placeholder="Jóvenes de la iglesia" autoCapitalize="words" />
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
          <Button
            label={busy ? 'Un segundo…' : 'Crear grupo'}
            style={{ marginTop: space.lg }}
            disabled={busy}
            onPress={() => void onCreate()}
          />
          <Button label="Volver" variant="ghost" style={{ marginTop: 10 }} onPress={() => setMode('list')} />
        </Enter>
      ) : null}

      {mode === 'codigo' ? (
        <Enter delay={60} style={{ marginTop: space.lg }}>
          <AppText variant="label" tone="amber">
            Código
          </AppText>
          <Field
            value={code}
            onChangeText={(value) => setCode(value.toUpperCase())}
            placeholder="A3F9C2"
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <Button
            label={busy ? 'Un segundo…' : 'Unirme'}
            style={{ marginTop: space.md }}
            disabled={busy}
            onPress={() => void onJoin()}
          />
          <Button label="Volver" variant="ghost" style={{ marginTop: 10 }} onPress={() => setMode('list')} />
        </Enter>
      ) : null}

      {mode === 'list' && groups.length === 0 ? (
        <GroupWelcome
          onCreate={() => (session ? setMode('crear') : goNeedAccount())}
          onJoin={() => (session ? setMode('codigo') : goNeedAccount())}
        />
      ) : null}

      {mode === 'list' && groups.length > 1 ? (
        <View style={{ marginTop: space.lg, gap: 10 }}>
          {groups.map((group) => (
            <PressScale
              key={group.id}
              onPress={() => router.push({ pathname: '/grupo/[id]', params: { id: group.id } })}>
              <GlassCard>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: GROUP_COLOR_HEX[group.color],
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <AppText variant="subtitle" style={{ color: '#FFFCF6' }}>
                      {group.emoji}
                    </AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="ui">{group.name}</AppText>
                    <AppText variant="caption" tone="soft" style={{ marginTop: 2, letterSpacing: 0 }}>
                      {group.memberCount} {group.memberCount === 1 ? 'persona' : 'personas'}
                      {group.role === 'owner' ? ' · lo cuidás vos' : ''}
                    </AppText>
                  </View>
                  <AppText variant="ui" tone="amber">
                    →
                  </AppText>
                </View>
              </GlassCard>
            </PressScale>
          ))}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
            <View style={{ flex: 1 }}>
              <Button label="Crear otro" variant="ghost" onPress={() => setMode('crear')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Tengo un código" variant="ghost" onPress={() => setMode('codigo')} />
            </View>
          </View>
        </View>
      ) : null}

      {localError || error ? (
        <AppText variant="ui" style={{ color: colors.terracotta, marginTop: space.md }}>
          {localError || error}
        </AppText>
      ) : null}

      {!session ? (
        <AppText variant="caption" tone="soft" style={{ marginTop: space.lg, textAlign: 'center' }}>
          Con una cuenta el código queda y el grupo se ve en todos los teléfonos.
        </AppText>
      ) : null}
    </Screen>
  );
}
