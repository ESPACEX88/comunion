import { VerseOfDayCard } from '@/components/bible/VerseOfDayCard';
import { DayActionRow } from '@/components/hoy/DayActionRow';
import { Enter } from '@/components/motion/Enter';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { moodLabel } from '@/features/duo/moods';
import { partnerFirstName } from '@/features/duo/labels';
import { personalVerseOfDayRef } from '@/lib/bible/verseOfDay';
import { formatLongDate, greeting } from '@/lib/date';
import { space, useTheme } from '@/theme';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function HoyScreen() {
  const {
    state,
    today,
    personalTodayStatus,
    todayPersonalReading,
    personalPlan,
    ensureSoloPlan,
    openPersonalReading,
    myCheckInToday,
    specialFriend,
    journalEntries,
    hasDuo,
    syncError,
    selfId,
  } = useAppState();
  const { refreshing, onRefresh } = useDuoSyncControls();
  const { colors } = useTheme();
  const friendName = partnerFirstName(specialFriend);
  const lastJournal = journalEntries[0] ?? null;
  const personalRef = personalVerseOfDayRef(today, {
    userId: state.userId || selfId,
    name: state.userName,
  });
  const readingHint = todayPersonalReading
    ? `${todayPersonalReading.reference} · día ${todayPersonalReading.dayNumber} de ${personalPlan?.days.length ?? 7}`
    : 'Salmos, siete días. Para vos.';
  const readingDone = personalTodayStatus === 'completado';

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Enter>
        <AppText variant="label" tone="olive">
          {greeting()}
        </AppText>
        <AppText variant="title" style={{ marginTop: 8 }}>
          {state.userName.split(' ')[0] || 'Vos'}
        </AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
          {formatLongDate(today)}
        </AppText>
      </Enter>
      {syncError ? (
        <AppText variant="ui" style={{ color: colors.terracotta, marginTop: space.md }}>
          {syncError}
        </AppText>
      ) : null}

      <Enter delay={80} style={{ marginTop: space.lg }}>
        <VerseOfDayCard reference={personalRef} kicker="Tu versículo" />
      </Enter>

      <View style={{ marginTop: space.xl, gap: 12 }}>
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
            hint={
              lastJournal
                ? lastJournal.title || lastJournal.body.slice(0, 48)
                : 'Lo que no va al dúo'
            }
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
