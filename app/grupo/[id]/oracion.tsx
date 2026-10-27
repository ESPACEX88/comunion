import { Enter } from '@/components/motion/Enter';
import { AppText } from '@/components/ui/AppText';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { GlassCard } from '@/components/ui/GlassCard';
import { Screen } from '@/components/ui/Screen';
import { Toggle } from '@/components/ui/Toggle';
import { useAuth } from '@/features/auth/AuthProvider';
import { PRAYER_MAX } from '@/features/duo/moods';
import { useGroups } from '@/features/groups/GroupsProvider';
import { useGroupLive } from '@/features/groups/useGroupLive';
import { space, useTheme } from '@/theme';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

export default function GrupoOracion() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const groupsApi = useGroups();
  const { bundle, loading, error, refreshing, onRefresh, reload } = useGroupLive(id);
  const [prayer, setPrayer] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const selfId = user?.id ?? '';

  const publish = async () => {
    if (!id || !prayer.trim()) return;
    setBusy(true);
    try {
      await groupsApi.postPrayer(id, prayer, anonymous);
      setPrayer('');
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen refreshing={refreshing} onRefresh={() => void onRefresh()}>
      <BackLink label="Grupo" />
      <Enter>
        <AppText variant="label" tone="amber" style={{ marginTop: space.lg }}>
          Muro de oración
        </AppText>
        <AppText variant="title" style={{ marginTop: 8 }}>
          Pedidos del grupo
        </AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
          Un renglón basta. Nadie señala. «Oré por vos» es un sí honesto.
        </AppText>
      </Enter>

      {loading && !bundle ? (
        <AppText variant="ui" tone="soft" style={{ marginTop: space.lg }}>
          Trayendo el muro…
        </AppText>
      ) : null}
      {error ? (
        <AppText variant="ui" style={{ color: colors.terracotta, marginTop: space.md }}>
          {error}
        </AppText>
      ) : null}

      {bundle?.prayers.length === 0 ? (
        <AppText variant="ui" tone="soft" style={{ marginTop: space.lg }}>
          El muro está en blanco. Un pedido, si hace falta.
        </AppText>
      ) : null}

      <View style={{ marginTop: space.md, gap: 10 }}>
        {bundle?.prayers.map((item) => {
          const author = bundle.members.find((member) => member.userId === item.authorId);
          const hidden = item.anonymous && item.authorId !== selfId;
          const label = hidden ? 'Alguien del grupo' : author?.name ?? 'Alguien';
          const mine = item.authorId === selfId;
          const already = item.prayedBy.includes(selfId);
          const prayedNames = item.prayedBy
            .map((uid) => bundle.members.find((member) => member.userId === uid)?.name.split(' ')[0])
            .filter(Boolean);
          return (
            <GlassCard key={item.id}>
              <AppText variant="caption" tone="soft" style={{ letterSpacing: 0 }}>
                {label}
                {item.answered ? ' · escuchada' : ''}
                {item.anonymous && mine ? ' · anónimo para los demás' : ''}
              </AppText>
              <AppText variant="ui" style={{ marginTop: 6 }}>
                {item.body}
              </AppText>
              <AppText variant="caption" tone="amber" style={{ marginTop: 8, letterSpacing: 0 }}>
                {prayedNames.length === 0
                  ? 'Todavía nadie marcó'
                  : prayedNames.length === 1
                    ? `${prayedNames[0]} oró`
                    : `${prayedNames.join(', ')} oraron`}
              </AppText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                <View style={{ flexGrow: 1, minWidth: 140 }}>
                  <Button
                    label={already ? 'Ya oraste' : 'Oré por vos'}
                    variant={already ? 'ghost' : 'olive'}
                    compact
                    disabled={busy}
                    onPress={() =>
                      void groupsApi.togglePray(item.id, already).then(() => reload())
                    }
                  />
                </View>
                {mine ? (
                  <Pressable
                    onPress={() =>
                      void groupsApi.answerPrayer(item.id, !item.answered).then(() => reload())
                    }
                    hitSlop={8}
                    style={{ justifyContent: 'center' }}>
                    <AppText variant="caption" tone="amber">
                      {item.answered ? 'Seguir abierta' : 'Marcar escuchada'}
                    </AppText>
                  </Pressable>
                ) : null}
                {mine ? (
                  <Pressable
                    onPress={() => void groupsApi.deletePrayer(item.id).then(() => reload())}
                    hitSlop={8}
                    style={{ justifyContent: 'center' }}>
                    <AppText variant="caption" tone="soft">
                      Borrar
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
            </GlassCard>
          );
        })}
      </View>

      <AppText variant="label" tone="amber" style={{ marginTop: space.xl }}>
        Dejar un pedido
      </AppText>
      <Field
        value={prayer}
        onChangeText={(value) => setPrayer(value.slice(0, PRAYER_MAX))}
        placeholder="Algo concreto, sin discurso."
        maxLength={PRAYER_MAX}
        multiline
        tall
      />
      <AppText variant="caption" tone="soft" style={{ marginTop: 6 }}>
        {prayer.length}/{PRAYER_MAX}
      </AppText>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: space.md,
        }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <AppText variant="ui">Anónimo en el grupo</AppText>
          <AppText variant="caption" tone="soft" style={{ marginTop: 2, letterSpacing: 0 }}>
            Ellos no ven tu nombre. Vos sí.
          </AppText>
        </View>
        <Toggle value={anonymous} onValueChange={setAnonymous} />
      </View>
      <Button
        label={busy ? 'Un segundo…' : 'Publicar'}
        style={{ marginTop: space.md, marginBottom: space.lg }}
        disabled={busy || prayer.trim().length < 2}
        onPress={() => void publish()}
      />
    </Screen>
  );
}
