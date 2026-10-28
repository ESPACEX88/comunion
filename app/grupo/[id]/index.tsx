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
import { useGroups } from '@/features/groups/GroupsProvider';
import { useActiveGroupLive } from '@/features/groups/useGroupLive';
import { groupVerseOfDayRef } from '@/lib/bible/verseOfDay';
import { planProgress, PSALMS_PLAN } from '@/features/plans/content';
import { ensureGroupPsalmsPlan, ensureWeekChallenge } from '@/lib/groups';
import { todayKey } from '@/lib/date';
import { collectiveStreak, groupDayProgress, groupReadThreshold } from '@/lib/streaks';
import { space, useTheme } from '@/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

export default function GrupoHome() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const groupsApi = useGroups();
  const { bundle, loading, error, refreshing, onRefresh, reload } = useActiveGroupLive();
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const seeded = useRef(false);
  const today = todayKey();
  const selfId = user?.id ?? '';

  useEffect(() => {
    if (!id || !bundle || seeded.current) return;
    if (bundle.group.role !== 'owner') return;
    if (bundle.plan && bundle.challenge) return;
    seeded.current = true;
    void (async () => {
      try {
        if (!bundle.plan) await ensureGroupPsalmsPlan(id);
        if (!bundle.challenge) await ensureWeekChallenge(id);
        await reload();
      } catch {
        seeded.current = false;
      }
    })();
  }, [bundle, id, reload]);

  const stats = useMemo(() => {
    if (!bundle) return null;
    const memberIds = bundle.members.map((member) => member.userId);
    const byUser: Record<string, string[]> = {};
    for (const row of bundle.completions) {
      byUser[row.userId] = [...(byUser[row.userId] ?? []), row.completedOn];
    }
    const progress = groupDayProgress(memberIds, byUser, today);
    const streak = collectiveStreak(memberIds, byUser, today);
    const needed = groupReadThreshold(memberIds.length);
    const selfDone = (byUser[selfId] ?? []).includes(today);
    const reading = bundle.plan ? planProgress(PSALMS_PLAN, bundle.plan.startsOn, today) : null;
    return { progress, streak, needed, selfDone, reading, byUser, memberIds };
  }, [bundle, selfId, today]);

  if (!id) return null;

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
      await groupsApi.postComment(id, comment);
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
      <BackLink label="Grupos" />
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: space.md }}>
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
                <AppText variant="title">{bundle.group.name}</AppText>
                <AppText variant="caption" tone="soft" style={{ marginTop: 4, letterSpacing: 0 }}>
                  Código {bundle.group.inviteCode} · {bundle.members.length} personas
                </AppText>
              </View>
            </View>
          </Enter>

          <Pressable
            onPress={() => router.push({ pathname: '/grupo/[id]/miembros', params: { id } })}
            style={{ marginTop: space.md }}>
            <AppText variant="caption" tone="amber">
              Ver miembros →
            </AppText>
          </Pressable>

          <GlassCard style={{ marginTop: space.lg }}>
            <AppText variant="label" tone="amber">
              Lectura de hoy
            </AppText>
            <AppText variant="subtitle" style={{ marginTop: 8 }}>
              {stats?.reading?.day.reference ?? 'Salmos'}
            </AppText>
            <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
              {stats
                ? `${stats.progress.done} de ${stats.progress.total} ya leyeron. El día cuenta al llegar a ${stats.needed}.`
                : ''}
            </AppText>
            {stats && stats.streak > 0 ? (
              <AppText variant="ui" style={{ marginTop: 8 }}>
                Racha del grupo · {stats.streak}
              </AppText>
            ) : (
              <AppText variant="caption" tone="soft" style={{ marginTop: 8, letterSpacing: 0 }}>
                Sin apuro. Cuando la mitad lee, el día queda. Un hueco por semana no rompe.
              </AppText>
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {bundle.members.map((member) => {
                const done = stats?.byUser[member.userId]?.includes(today);
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
                      style={{ letterSpacing: 0, color: done ? colors.statusDoneFg : colors.charcoalSoft }}>
                      {member.name.split(' ')[0]}
                    </AppText>
                  </View>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              <View style={{ flex: 1 }}>
                <Button
                  label={stats?.selfDone ? 'Hecho' : busy ? 'Un segundo…' : 'Marqué hoy'}
                  onPress={() => void onMark()}
                  disabled={busy || Boolean(stats?.selfDone) || !bundle.plan}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  label="Leer"
                  variant="ghost"
                  onPress={() =>
                    router.push({
                      pathname: '/biblia/leer',
                      params: { ref: stats?.reading?.day.reference ?? 'Salmo 1' },
                    })
                  }
                />
              </View>
            </View>
          </GlassCard>

          <View style={{ marginTop: 12 }}>
            <VerseOfDayCard reference={groupVerseOfDayRef(today, bundle.group.id)} kicker="✦ Versículo del grupo" />
          </View>

          <GlassCard style={{ marginTop: 12 }}>
            <AppText variant="label" tone="amber">
              Comentarios de hoy
            </AppText>
            {bundle.comments.length === 0 ? (
              <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
                Todavía en silencio. Un renglón basta.
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
                Muro de oración
              </AppText>
              <Pressable onPress={() => router.push({ pathname: '/grupo/[id]/oracion', params: { id } })}>
                <AppText variant="caption" tone="amber">
                  Ver todo →
                </AppText>
              </Pressable>
            </View>
            {bundle.prayers.slice(0, 2).map((prayer) => {
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
            })}
            {bundle.prayers.length === 0 ? (
              <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
                El muro está en blanco. Un pedido, si hace falta.
              </AppText>
            ) : null}
          </GlassCard>

          <GlassCard style={{ marginTop: 12, marginBottom: space.lg }}>
            <AppText variant="label" tone="amber">
              Reto de la semana
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
                Esta semana todavía no hay reto.
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
                      onPress={() => void groupsApi.pickChallenge(id, item.id).then(() => reload())}
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
        </>
      ) : null}
    </Screen>
  );
}
