import { VerseOfDayCard } from '@/components/bible/VerseOfDayCard';
import { DayActionRow } from '@/components/hoy/DayActionRow';
import { Enter } from '@/components/motion/Enter';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useLiveSyncControls } from '@/features/app-state/useLiveSync';
import { GROUP_COLOR_HEX } from '@/features/groups/challenges';
import { GROUP_STREAK_RULE } from '@/features/groups/copy';
import { GroupWelcome } from '@/features/groups/GroupWelcome';
import { useGroups } from '@/features/groups/GroupsProvider';
import { groupTodayStats } from '@/features/groups/stats';
import { useGroupLive } from '@/features/groups/useGroupLive';
import { moodLabel } from '@/features/duo/moods';
import { groupVerseOfDayRef } from '@/lib/bible/verseOfDay';
import { greeting, heroLine } from '@/lib/date';
import { space, useTheme } from '@/theme';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

export default function HoyScreen() {
  const {
    state,
    today,
    myCheckInToday,
    journalEntries,
    syncError,
    soloStreak,
  } = useAppState();
  const { refreshing, onRefresh } = useLiveSyncControls();
  const { groups, markReading } = useGroups();
  const { colors } = useTheme();
  const primary = groups[0] ?? null;
  const live = useGroupLive(primary?.id);
  const [busy, setBusy] = useState(false);
  const lastJournal = journalEntries[0] ?? null;
  const stats = useMemo(
    () => (live.bundle ? groupTodayStats(live.bundle, state.userId || '', today) : null),
    [live.bundle, state.userId, today],
  );

  const onMark = async () => {
    if (!live.bundle?.plan || !stats?.reading) return;
    setBusy(true);
    try {
      await markReading(live.bundle.plan.id, stats.reading.dayNumber);
      await live.reload();
    } finally {
      setBusy(false);
    }
  };

  const goGroup = () => {
    if (groups.length === 1) {
      router.push('/(tabs)/grupos');
      return;
    }
    if (primary) {
      router.push({ pathname: '/grupo/[id]', params: { id: primary.id } });
      return;
    }
    router.push('/(tabs)/grupos');
  };

  return (
    <Screen
      refreshing={refreshing || live.refreshing}
      onRefresh={async () => {
        await onRefresh?.();
        await live.onRefresh();
      }}>
      <Enter>
        <AppText variant="ui" tone="soft">
          {greeting()}
        </AppText>
        <AppText variant="display" style={{ marginTop: 6 }}>
          {heroLine(state.userName)}
        </AppText>
      </Enter>
      {syncError ? (
        <AppText variant="ui" style={{ color: colors.terracotta, marginTop: space.md }}>
          {syncError}
        </AppText>
      ) : null}

      {!primary ? (
        <View style={{ marginTop: space.lg }}>
          <GroupWelcome
            kicker="Hoy"
            title="Primero, un grupo"
            onCreate={() => router.push({ pathname: '/(tabs)/grupos', params: { intent: 'create' } })}
            onJoin={() => router.push({ pathname: '/(tabs)/grupos', params: { intent: 'join' } })}
          />
        </View>
      ) : (
        <>
          <Enter delay={80} style={{ marginTop: space.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: GROUP_COLOR_HEX[primary.color],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <AppText variant="ui" style={{ color: '#FFFCF6' }}>
                  {primary.emoji}
                </AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="caption" tone="amber" style={{ letterSpacing: 0 }}>
                  Hoy · {primary.name}
                </AppText>
                <AppText variant="caption" tone="soft" style={{ letterSpacing: 0 }}>
                  {GROUP_STREAK_RULE}
                </AppText>
              </View>
            </View>
            <VerseOfDayCard
              reference={groupVerseOfDayRef(today, primary.id)}
              kicker="✦ Versículo del grupo"
            />
          </Enter>

          <GlassCard style={{ marginTop: 12 }}>
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
                ) : null}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label={stats.selfDone ? 'Hecho' : busy ? 'Un segundo…' : 'Marqué hoy'}
                      onPress={() => void onMark()}
                      disabled={busy || stats.selfDone}
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
                {live.loading ? 'Trayendo la lectura…' : 'Todavía no hay lectura de hoy. Entrá al grupo para abrirla.'}
              </AppText>
            )}
          </GlassCard>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <GlassCard style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 16 }}>
              <AppText variant="numeral">{stats?.streak ?? 0}</AppText>
              <AppText variant="caption" tone="soft" style={{ marginTop: 2, letterSpacing: 0 }}>
                racha del grupo
              </AppText>
            </GlassCard>
            <GlassCard style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 16 }}>
              <AppText variant="numeral">{soloStreak}</AppText>
              <AppText variant="caption" tone="soft" style={{ marginTop: 2, letterSpacing: 0 }}>
                tu racha
              </AppText>
            </GlassCard>
          </View>

          {live.bundle?.challenge ? (
            <GlassCard style={{ marginTop: 12 }}>
              <AppText variant="label" tone="amber">
                Reto
              </AppText>
              <AppText variant="subtitle" style={{ marginTop: 8 }}>
                {live.bundle.challenge.title}
              </AppText>
              <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
                {live.bundle.challenge.body}
              </AppText>
            </GlassCard>
          ) : null}

          <GlassCard style={{ marginTop: 12 }}>
            <AppText variant="label" tone="amber">
              Oración
            </AppText>
            {!live.bundle || live.bundle.prayers.length === 0 ? (
              <AppText variant="ui" tone="soft" style={{ marginTop: 8 }}>
                Todavía no hay pedidos. En el grupo podés dejar el primero.
              </AppText>
            ) : (
              live.bundle.prayers.slice(0, 2).map((prayer) => (
                <View key={prayer.id} style={{ marginTop: 10 }}>
                  <AppText variant="ui">{prayer.body}</AppText>
                  <AppText variant="caption" tone="soft" style={{ marginTop: 4, letterSpacing: 0 }}>
                    {prayer.prayedBy.length === 0
                      ? 'Todavía nadie marcó'
                      : `${prayer.prayedBy.length} ${prayer.prayedBy.length === 1 ? 'oró' : 'oraron'}`}
                  </AppText>
                </View>
              ))
            )}
            <Button label="Ir al grupo" variant="ghost" style={{ marginTop: 12 }} onPress={goGroup} />
          </GlassCard>
        </>
      )}

      <View style={{ marginTop: space.lg, gap: 10, marginBottom: space.lg }}>
        <Enter delay={200}>
          <DayActionRow
            title="Check-in"
            hint={myCheckInToday ? moodLabel(myCheckInToday.mood) : 'Cómo te encontró hoy'}
            cta={myCheckInToday ? 'Hecho' : 'Ir'}
            done={Boolean(myCheckInToday)}
            onPress={() => router.push('/check-in')}
          />
        </Enter>
        <Enter delay={240}>
          <DayActionRow
            title="Diario"
            hint={lastJournal ? lastJournal.title || lastJournal.body.slice(0, 48) : 'Solo entre vos y Él'}
            cta="Ir"
            onPress={() => router.push('/diario')}
          />
        </Enter>
      </View>
    </Screen>
  );
}
