import { CheckInCard } from '@/components/duo/CheckInCard';
import { CheckInComposer } from '@/components/duo/CheckInComposer';
import { DuoQuestionCard } from '@/components/duo/DuoQuestionCard';
import { GraceCard } from '@/components/duo/GraceCard';
import { ReadingCard } from '@/components/reading/ReadingCard';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { partnerFirstName } from '@/features/duo/labels';
import { isDuoPlan } from '@/features/plans/content';
import { formatLongDate, greeting, yesterday } from '@/lib/date';
import { space, useTheme } from '@/theme';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function HoyScreen() {
  const {
    state,
    today,
    personalStreak,
    todayStatus,
    todayGroupReading,
    groupPlan,
    groupToday,
    groupStreakCount,
    openReading,
    myCheckInToday,
    friendCheckInToday,
    specialFriend,
    saveCheckIn,
    members,
    isDuoActive,
    grace,
    myDuoAnswerToday,
    friendDuoAnswerToday,
    saveDuoAnswer,
    useGraceDay,
    live,
    syncError,
  } = useAppState();
  const { refreshing, onRefresh } = useDuoSyncControls();
  const { colors } = useTheme();

  const self = members.find((member) => member.isSelf) ?? members[0];
  const friendName = partnerFirstName(specialFriend);
  const duo = isDuoPlan(groupPlan);
  const usedGraceYesterday = state.graceDates.includes(yesterday(today));
  const cta =
    todayStatus === 'completado'
      ? 'Volver al pasaje'
      : todayStatus === 'en_curso'
        ? 'Seguí la lectura'
        : 'Empezá la lectura';

  const streakLine =
    grace.kind === 'offer'
      ? 'Ayer se quedó. Hay un día de gracia esta semana.'
      : grace.kind === 'retomar'
        ? 'Esta semana ya usaron la gracia. Hoy, al terminar, empiezan en 1.'
        : todayStatus === 'completado'
          ? `${personalStreak === 1 ? '1 día seguido' : `${personalStreak} días seguidos`}. Hoy ya está contado.`
          : usedGraceYesterday
            ? 'Ayer fue gracia. Hoy cuenta cuando termines el pasaje.'
            : `${personalStreak === 0 ? 'Todavía no hay racha.' : `${personalStreak} días seguidos.`} El día cuenta al terminar el pasaje.`;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <AppText variant="label" tone="olive">
        {greeting()}
      </AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        {state.userName.split(' ')[0]}
      </AppText>
      <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
        {formatLongDate(today)}
        {duo ? ' · de a dos' : ''}
      </AppText>
      {syncError ? (
        <AppText variant="ui" style={{ color: colors.terracotta, marginTop: space.md }}>
          {syncError}
        </AppText>
      ) : null}

      <View style={{ height: space.xl }} />
      {live && specialFriend.id === 'pending' ? (
        <Card accent="olive" style={{ marginBottom: space.lg }}>
          <AppText variant="label" tone="olive">
            Esperando a tu dúo
          </AppText>
          <AppText variant="subtitle" style={{ marginTop: 8 }}>
            Código {state.group.inviteCode}
          </AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
            Compartilo. Cuando se una, el check-in y la racha se ven en los dos teléfonos.
          </AppText>
        </Card>
      ) : null}

      <ReadingCard
        plan={groupPlan}
        day={todayGroupReading}
        cta={cta}
        onPress={() => {
          openReading();
          router.push({ pathname: '/lectura', params: { plan: 'group' } });
        }}
      />

      <View
        style={{
          marginTop: space.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space.md,
        }}>
        <AppText variant="ui" tone="soft" style={{ flex: 1 }}>
          {streakLine}
        </AppText>
        <StatusBadge status={todayStatus} />
      </View>

      <GraceCard offer={grace} friendName={friendName} onUseGrace={useGraceDay} />

      {todayStatus === 'completado' && !myCheckInToday ? (
        <View style={{ marginTop: space.xl }}>
          <AppText variant="label" tone="amber">
            Cómo te encontró
          </AppText>
          <View style={{ height: space.sm }} />
          <CheckInComposer onSave={saveCheckIn} />
        </View>
      ) : null}

      {myCheckInToday ? (
        <View style={{ marginTop: space.xl }}>
          <CheckInCard checkIn={myCheckInToday} member={self} />
        </View>
      ) : null}

      {friendCheckInToday ? (
        <View style={{ marginTop: space.md }}>
          <CheckInCard
            checkIn={friendCheckInToday}
            member={specialFriend}
            kicker={`${friendName} hoy`}
          />
        </View>
      ) : null}

      {isDuoActive && todayGroupReading.prompt && todayStatus === 'completado' && !myDuoAnswerToday ? (
        <View style={{ marginTop: space.xl }}>
          <DuoQuestionCard
            question={todayGroupReading.prompt}
            unlocked
            myAnswer={myDuoAnswerToday}
            friendAnswer={friendDuoAnswerToday}
            friendName={friendName}
            onSave={saveDuoAnswer}
          />
        </View>
      ) : null}

      <Pressable onPress={() => router.push('/(tabs)/grupo')} style={{ marginTop: space.xl }}>
        <AppText variant="label" tone="olive">
          Nosotros
        </AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
          {groupToday.allDone
            ? `Hoy leyeron juntas · racha ${groupStreakCount}`
            : `${groupToday.done} de ${groupToday.total} leyeron hoy. Oración y mural con ${friendName}.`}
        </AppText>
      </Pressable>
    </Screen>
  );
}
