import { VerseOfDayCard } from '@/components/bible/VerseOfDayCard';
import { DayActionRow } from '@/components/hoy/DayActionRow';
import { Enter } from '@/components/motion/Enter';
import { AppText } from '@/components/ui/AppText';
import { GlassCard } from '@/components/ui/GlassCard';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { moodLabel } from '@/features/duo/moods';
import { partnerFirstName } from '@/features/duo/labels';
import { personalVerseOfDayRef } from '@/lib/bible/verseOfDay';
import { greeting, heroLine } from '@/lib/date';
import { planCaption } from '@/features/plans/content';
import { space, useTheme } from '@/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

export default function HoyScreen() {
  const {
    state,
    today,
    personalTodayStatus,
    todayPersonalReading,
    personalPlan,
    personalProgress,
    ensureSoloPlan,
    openPersonalReading,
    completePersonalToday,
    myCheckInToday,
    specialFriend,
    journalEntries,
    hasDuo,
    syncError,
    selfId,
    soloStreak,
  } = useAppState();
  const { refreshing, onRefresh } = useDuoSyncControls();
  const { colors, setPreference } = useTheme();
  const params = useLocalSearchParams<{ shot?: string }>();
  useEffect(() => {
    if (params.shot === 'aurora') setPreference('dark');
  }, [params.shot, setPreference]);
  const friendName = partnerFirstName(specialFriend);
  const lastJournal = journalEntries[0] ?? null;
  const personalRef = personalVerseOfDayRef(today, {
    userId: state.userId || selfId,
    name: state.userName,
  });
  const readingHint = todayPersonalReading
    ? `${todayPersonalReading.reference} · ${personalProgress ? planCaption(personalProgress) : `día ${todayPersonalReading.dayNumber}`}`
    : 'Salmos, siete días. Para vos.';
  const readingDone = personalTodayStatus === 'completado';
  const salmosLabel = personalProgress
    ? `${personalProgress.dayNumber}/${personalProgress.cycleLen}`
    : '—';

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
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

      <Enter delay={80} style={{ marginTop: space.lg }}>
        <VerseOfDayCard
          reference={personalRef}
          kicker="✦ Tu versículo"
          done={readingDone}
          onDone={async () => {
            if (readingDone) return;
            if (!personalPlan) await ensureSoloPlan();
            await completePersonalToday();
          }}
        />
      </Enter>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <GlassCard style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 16 }}>
          <AppText variant="numeral">{soloStreak}</AppText>
          <AppText variant="caption" tone="soft" style={{ marginTop: 2, letterSpacing: 0 }}>
            racha
          </AppText>
        </GlassCard>
        <Pressable
          onPress={async () => {
            if (!personalPlan) await ensureSoloPlan();
            openPersonalReading();
            router.push({ pathname: '/lectura', params: { plan: 'personal' } });
          }}
          style={{ flex: 1 }}>
          <GlassCard style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
            <AppText variant="numeral">{salmosLabel}</AppText>
            <AppText variant="caption" tone="soft" style={{ marginTop: 2, letterSpacing: 0 }}>
              salmos
            </AppText>
          </GlassCard>
        </Pressable>
      </View>

      <View style={{ marginTop: space.lg, gap: 10 }}>
        <Enter delay={140}>
          <DayActionRow
            title="Lectura"
            hint={readingHint}
            cta={readingDone ? 'Hecho' : 'Ir'}
            done={readingDone}
            onPress={async () => {
              if (!personalPlan) await ensureSoloPlan();
              openPersonalReading();
              router.push({ pathname: '/lectura', params: { plan: 'personal' } });
            }}
          />
        </Enter>
        <Enter delay={180}>
          <DayActionRow
            title="Check-in"
            hint={myCheckInToday ? moodLabel(myCheckInToday.mood) : 'Cómo te encontró hoy'}
            cta={myCheckInToday ? 'Hecho' : 'Ir'}
            done={Boolean(myCheckInToday)}
            onPress={() => router.push('/check-in')}
          />
        </Enter>
        <Enter delay={220}>
          <DayActionRow
            title="Diario"
            hint={lastJournal ? lastJournal.title || lastJournal.body.slice(0, 48) : 'Lo que no va al dúo'}
            cta="Ir"
            onPress={() => router.push('/diario')}
          />
        </Enter>
        <Enter delay={260}>
          <DayActionRow
            title="Biblia"
            hint="Libros, capítulos, el texto completo"
            cta="Ir"
            onPress={() => router.push('/biblia')}
          />
        </Enter>
        {hasDuo ? (
          <Enter delay={300}>
            <DayActionRow
              title={`Con ${friendName}`}
              hint="Versículo de los dos, lectura y oración"
              cta="Ir"
              onPress={() => router.push('/(tabs)/grupo')}
            />
          </Enter>
        ) : null}
      </View>
    </Screen>
  );
}
