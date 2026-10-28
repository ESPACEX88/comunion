import { VerseOfDayCard } from '@/components/bible/VerseOfDayCard';
import { Enter } from '@/components/motion/Enter';
import { AppText } from '@/components/ui/AppText';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { GlassCard } from '@/components/ui/GlassCard';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { GROUP_CHALLENGES, GROUP_COLOR_HEX } from '@/features/groups/challenges';
import { GROUP_STREAK_RULE } from '@/features/groups/copy';
import { useGroups } from '@/features/groups/GroupsProvider';
import { groupTodayStats } from '@/features/groups/stats';
import { useGroupLive } from '@/features/groups/useGroupLive';
import { groupVerseOfDayRef } from '@/lib/bible/verseOfDay';
import { ensureGroupPsalmsPlan, ensureWeekChallenge, groupInviteMessage } from '@/lib/groups';
import { todayKey } from '@/lib/date';
import { space, useTheme } from '@/theme';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Share, View } from 'react-native';

type Props = {
  groupId: string;
  embedded?: boolean;
};

export function GroupHomeView({ groupId, embedded }: Props) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const groupsApi = useGroups();
  const { bundle, loading, error, refreshing, onRefresh, reload } = useGroupLive(groupId);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const seeded = useRef(false);
  const today = todayKey();
  const selfId = user?.id ?? '';

  useEffect(() => {
    if (!groupId || !bundle || seeded.current) return;
    if (bundle.group.role !== 'owner') return;
    if (bundle.plan && bundle.challenge) return;
    seeded.current = true;
    void (async () => {
      try {
        if (!bundle.plan) await ensureGroupPsalmsPlan(groupId);
        if (!bundle.challenge) await ensureWeekChallenge(groupId);
        await reload();
      } catch {
        seeded.current = false;
      }
    })();
  }, [bundle, groupId, reload]);

  const stats = useMemo(
    () => (bundle ? groupTodayStats(bundle, selfId, today) : null),
    [bundle, selfId, today],
  );

  const shareCode = async () => {
    if (!bundle) return;
    const message = groupInviteMessage(bundle.group.name, bundle.group.inviteCode);
    try {
      await Share.share({ message });
    } catch {
      await Clipboard.setStringAsync(message);
      setCopied(true);
    }
  };

  const onMark = async () => {
    if (!bundle?.plan || !stats?.reading) return;
    setBusy(true);
    try {
      await groupsApi.markReading(bundle.plan.id, stats.reading.dayNumber);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const onComment = async () => {
    if (!comment.trim()) return;
    setBusy(true);
    try {
      await groupsApi.postComment(groupId, comment);
      setComment('');
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const onChallengeTap = async (challengeId: string, current: number, target: number) => {
    setBusy(true);
    try {
      const next = current >= target ? 0 : current + 1;
      await groupsApi.bumpChallenge(challengeId, next);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen refreshing={refreshing} onRefresh={() => void onRefresh()}>
      {embedded ? null : <BackLink label="Grupo" />}
      {loading && !bundle ? (
        <AppText variant="ui" tone="soft" style={{ marginTop: space.lg }}>
          Trayendo el grupo…
        </AppText>
      ) : null}
      {error ? (
        <AppText variant="ui" style={{ color: colors.terracotta, marginTop: space.md }}>
          {error}
        </AppText>
      ) : null}
      {!loading && !bundle ? (
        <AppText variant="ui" tone="soft" style={{ marginTop: space.lg }}>
          Este grupo no está, o ya no estás adentro.
        </AppText>
      ) : null}

      {bundle ? (
        <>
          <Enter>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: embedded ? 0 : space.md }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: GROUP_COLOR_HEX[bundle.group.color],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <AppText variant="title" style={{ color: '#FFFCF6' }}>
                  {bundle.group.emoji}
                </AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="label" tone="amber">
                  Grupo
                </AppText>
                <AppText variant="title" style={{ marginTop: 2 }}>
                  {bundle.group.name}
                </AppText>
              </View>
            </View>
          </Enter>

          <GlassCard style={{ marginTop: space.md }}>
            <AppText variant="label" tone="amber">
              Código de invitación
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <AppText variant="title" style={{ flex: 1, letterSpacing: 3 }}>
                {bundle.group.inviteCode}
              </AppText>
              <View style={{ minWidth: 120 }}>
                <Button
                  label={copied ? 'Copiado' : 'Compartir'}
                  compact
                  onPress={() => void shareCode()}
                />
              </View>
            </View>
            <AppText variant="caption" tone="soft" style={{ marginTop: 8, letterSpacing: 0 }}>
              Mandá el código o el enlace. Quien lo abra entra al grupo.
            </AppText>
          </GlassCard>

          <AppText variant="caption" tone="soft" style={{ marginTop: 12, letterSpacing: 0 }}>
            {GROUP_STREAK_RULE}
          </AppText>

          <GlassCard style={{ marginTop: space.md }}>
            <AppText variant="label" tone="amber">
              Lectura
            </AppText>
            {stats?.reading ? (
              <>
                <AppText variant="subtitle" style={{ marginTop: 8 }}>
                  {stats.reading.day.reference}
                </AppText>
                <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
                  {`${stats.progress.done} de ${stats.progress.total} ya leyeron`}
                </AppText>
                {stats.streak > 0 ? (
                  <AppText variant="ui" style={{ marginTop: 8 }}>
                    Racha colectiva · {stats.streak}
                  </AppText>
                ) : (
                  <AppText variant="caption" tone="soft" style={{ marginTop: 8, letterSpacing: 0 }}>
                    Cuando la mitad lea, el día cuenta. Un hueco por semana no rompe.
                  </AppText>
                )}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                  {bundle.members.map((member) => {
                    const done = stats.byUser[member.userId]?.includes(today);
                    return (
                      <View
                        key={member.userId}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 999,
                          backgroundColor: done ? colors.statusDoneBg : colors.glass,
                        }}>
                        <AppText
                          variant="caption"
                          style={{
                            letterSpacing: 0,
                            color: done ? colors.statusDoneFg : colors.charcoalSoft,
                          }}>
                          {member.name.split(' ')[0]}
                        </AppText>
                      </View>
                    );
                  })}
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label={stats.selfDone ? 'Hecho' : busy ? 'Un segundo…' : 'Marqué hoy'}
                      onPress={() => void onMark()}
                      disabled={busy || stats.selfDone || !bundle.plan}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Leer"
                      variant="ghost"
                      onPress={() =>
                        router.push({
                          pathname: '/biblia/leer',
                          params: { ref: stats.reading?.day.reference ?? 'Salmo 1' },
                        })
                      }
                    />
                  </View>
                </View>
              </>
            ) : (
              <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
                Todavía no hay lectura de hoy. Quien cuida el grupo la abre al entrar.
              </AppText>
            )}
          </GlassCard>

          <View style={{ marginTop: 12 }}>
            <VerseOfDayCard reference={groupVerseOfDayRef(today, bundle.group.id)} kicker="✦ Versículo" />
          </View>

          <GlassCard style={{ marginTop: 12 }}>
            <AppText variant="label" tone="amber">
              Versículo · comentarios
            </AppText>
            {bundle.comments.length === 0 ? (
              <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
                Nadie escribió todavía. Un renglón sobre el versículo de hoy basta.
              </AppText>
            ) : (
              bundle.comments.map((item) => {
                const author = bundle.members.find((member) => member.userId === item.authorId);
                const mine = item.authorId === selfId;
                return (
                  <View key={item.id} style={{ marginTop: 12 }}>
                    <AppText variant="caption" tone="amber">
                      {author?.name ?? 'Alguien'}
                    </AppText>
                    <AppText variant="ui" style={{ marginTop: 4 }}>
                      {item.body}
                    </AppText>
                    {mine ? (
                      <Pressable
                        onPress={() => void groupsApi.deleteComment(item.id).then(() => reload())}
                        hitSlop={8}>
                        <AppText variant="caption" tone="soft" style={{ marginTop: 4 }}>
                          Borrar
                        </AppText>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })
            )}
            <Field value={comment} onChangeText={setComment} placeholder="Una frase, si querés" />
            <Button
              label="Publicar"
              variant="ghost"
              style={{ marginTop: 10 }}
              disabled={busy || comment.trim().length < 2}
              onPress={() => void onComment()}
            />
          </GlassCard>

          <GlassCard style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="label" tone="amber">
                Oración
              </AppText>
              <Pressable onPress={() => router.push({ pathname: '/grupo/[id]/oracion', params: { id: groupId } })}>
                <AppText variant="caption" tone="amber">
                  Ver todo →
                </AppText>
              </Pressable>
            </View>
            {bundle.prayers.length === 0 ? (
              <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
                El muro está en blanco. Dejá un pedido para que los demás oren.
              </AppText>
            ) : (
              bundle.prayers.slice(0, 3).map((prayer) => {
                const author = bundle.members.find((member) => member.userId === prayer.authorId);
                const label =
                  prayer.anonymous && prayer.authorId !== selfId ? 'Alguien del grupo' : (author?.name ?? 'Alguien');
                return (
                  <View key={prayer.id} style={{ marginTop: 12 }}>
                    <AppText variant="caption" tone="soft">
                      {label}
                      {prayer.answered ? ' · escuchada' : ''}
                    </AppText>
                    <AppText variant="ui" style={{ marginTop: 4 }}>
                      {prayer.body}
                    </AppText>
                    <AppText variant="caption" tone="amber" style={{ marginTop: 6, letterSpacing: 0 }}>
                      {prayer.prayedBy.length === 0
                        ? 'Todavía nadie marcó'
                        : `${prayer.prayedBy.length} ${prayer.prayedBy.length === 1 ? 'oró' : 'oraron'}`}
                    </AppText>
                  </View>
                );
              })
            )}
          </GlassCard>

          <GlassCard style={{ marginTop: 12 }}>
            <AppText variant="label" tone="amber">
              Reto
            </AppText>
            {bundle.challenge ? (
              <>
                <AppText variant="subtitle" style={{ marginTop: 8 }}>
                  {bundle.challenge.title}
                </AppText>
                <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
                  {bundle.challenge.body}
                </AppText>
                <AppText variant="caption" tone="soft" style={{ marginTop: 8, letterSpacing: 0 }}>
                  {Object.values(bundle.challenge.checkins).filter((n) => n >= bundle.challenge!.target).length} de{' '}
                  {bundle.members.length} ya lo marcaron
                </AppText>
                <Button
                  label={
                    (bundle.challenge.checkins[selfId] ?? 0) >= bundle.challenge.target
                      ? 'Hecho'
                      : bundle.challenge.target > 1
                        ? `${bundle.challenge.checkins[selfId] ?? 0}/${bundle.challenge.target}`
                        : 'Lo hice'
                  }
                  style={{ marginTop: 14 }}
                  disabled={busy}
                  onPress={() =>
                    void onChallengeTap(
                      bundle.challenge!.id,
                      bundle.challenge!.checkins[selfId] ?? 0,
                      bundle.challenge!.target,
                    )
                  }
                />
              </>
            ) : (
              <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
                Esta semana todavía no hay reto. Quien cuida el grupo elige uno abajo.
              </AppText>
            )}
            {bundle.group.role === 'owner' ? (
              <View style={{ marginTop: 12, gap: 10 }}>
                <AppText variant="caption" tone="soft" style={{ letterSpacing: 0 }}>
                  Vos elegís el de esta semana.
                </AppText>
                {GROUP_CHALLENGES.map((item) => {
                  const active = bundle.challenge?.key === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => void groupsApi.pickChallenge(groupId, item.id).then(() => reload())}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: active ? colors.amber : colors.glassBorder,
                        backgroundColor: active ? colors.glassStrong : colors.glass,
                      }}>
                      <AppText variant="ui" style={{ color: active ? colors.ink : colors.charcoalSoft }}>
                        {item.title}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </GlassCard>

          <GlassCard style={{ marginTop: 12, marginBottom: space.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="label" tone="amber">
                Miembros
              </AppText>
              <Pressable onPress={() => router.push({ pathname: '/grupo/[id]/miembros', params: { id: groupId } })}>
                <AppText variant="caption" tone="amber">
                  Ver →
                </AppText>
              </Pressable>
            </View>
            <AppText variant="ui" style={{ marginTop: 8 }}>
              {bundle.members.length} {bundle.members.length === 1 ? 'persona' : 'personas'}
            </AppText>
            {bundle.members.length <= 1 ? (
              <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
                Todavía estás sola. Compartí el código para que entre la gente de la iglesia.
              </AppText>
            ) : null}
          </GlassCard>
        </>
      ) : null}
    </Screen>
  );
}
