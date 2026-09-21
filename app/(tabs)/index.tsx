import { CheckInCard } from '@/components/duo/CheckInCard';
import { CheckInComposer } from '@/components/duo/CheckInComposer';
import { DuoQuestionCard } from '@/components/duo/DuoQuestionCard';
import { GraceCard } from '@/components/duo/GraceCard';
import { ReadingCard } from '@/components/reading/ReadingCard';
import { StreakMark } from '@/components/streak/StreakMark';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { partnerFirstName } from '@/features/duo/labels';
import { isDuoPlan } from '@/features/plans/content';
import { formatLongDate, greeting, yesterday } from '@/lib/date';
import { colors, space } from '@/theme';
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

  const self = members.find((member) => member.isSelf) ?? members[0];
  const friendName = partnerFirstName(specialFriend);
  const duo = isDuoPlan(groupPlan);
  const usedGraceYesterday = state.graceDates.includes(yesterday(today));
  const cta =
    todayStatus === 'completado'
      ? 'Volver a leer el pasaje'
      : todayStatus === 'en_curso'
        ? 'Seguí la lectura'
        : 'Empezá la lectura';

  const streakHint =
    grace.kind === 'offer'
      ? 'Ayer se quedó. Hay un día de gracia esta semana, si lo querés usar.'
      : grace.kind === 'retomar'
        ? 'Esta semana ya usaron la gracia. Hoy, al terminar, empiezan de nuevo en 1.'
        : todayStatus === 'completado'
          ? 'Hoy ya está contado. Gracias por no apurar el texto.'
          : usedGraceYesterday
            ? 'Ayer fue día de gracia. Hoy cuenta cuando termines el pasaje.'
            : 'Hoy cuenta cuando terminés el pasaje, no antes.';

  return (
    <Screen>
      <AppText variant="label" tone="olive">
        {greeting()}
      </AppText>
      <AppText variant="display" style={{ marginTop: 6 }}>
        {state.userName.split(' ')[0]}
      </AppText>
      <AppText variant="ui" tone="soft" style={{ marginTop: 4 }}>
        {formatLongDate(today)}
        {duo ? ' · plan de a dos' : ''}
      </AppText>
      <Ornament />
      {syncError ? (
        <AppText variant="ui" style={{ color: colors.terracotta, marginBottom: space.md }}>
          {syncError}
        </AppText>
      ) : null}
      {live && specialFriend.id === 'pending' ? (
        <Card accent="olive">
          <AppText variant="label" tone="olive">
            Esperando a tu dúo
          </AppText>
          <AppText variant="subtitle" style={{ marginTop: 6 }}>
            Código {state.group.inviteCode}
          </AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
            Compartilo. Cuando se una, el check-in, la pregunta y la racha se ven en los dos
            teléfonos.
          </AppText>
        </Card>
      ) : null}
      {live && specialFriend.id === 'pending' ? <View style={{ height: space.md }} /> : null}
      <GraceCard offer={grace} friendName={friendName} onUseGrace={useGraceDay} />
      {grace.kind !== 'none' ? <View style={{ height: space.md }} /> : null}
      <StreakMark count={personalStreak} label="Racha personal" hint={streakHint} />
      <View style={{ height: space.md }} />
      <StatusBadge status={todayStatus} />
      <View style={{ height: space.lg }} />
      <ReadingCard
        plan={groupPlan}
        day={todayGroupReading}
        cta={cta}
        onPress={() => {
          openReading();
          router.push({ pathname: '/lectura', params: { plan: 'group' } });
        }}
      />
      <View style={{ height: space.lg }} />
      <AppText variant="label" tone="amber">
        Check-in espiritual
      </AppText>
      <View style={{ height: space.sm }} />
      {todayStatus !== 'completado' ? (
        <Card accent="none">
          <AppText variant="subtitle">Primero el pasaje.</AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
            El check-in se abre cuando terminás la lectura de hoy. No hay atajo: el texto, y después
            cómo te encontró.
          </AppText>
        </Card>
      ) : myCheckInToday ? (
        <CheckInCard checkIn={myCheckInToday} member={self} />
      ) : (
        <Card>
          <AppText variant="subtitle">Todavía no dejaste cómo te encontró.</AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 6, marginBottom: space.md }}>
            Un ánimo, y si querés una línea. {friendName} va a verlo en Nosotros.
          </AppText>
          <CheckInComposer onSave={saveCheckIn} />
        </Card>
      )}
      <View style={{ height: space.md }} />
      {friendCheckInToday ? (
        <CheckInCard
          checkIn={friendCheckInToday}
          member={specialFriend}
          kicker={`${friendName} hoy`}
        />
      ) : (
        <Card accent="none">
          <AppText variant="subtitle">
            {specialFriend.id === 'pending'
              ? 'Todavía no hay nadie del otro lado.'
              : `${friendName} todavía no dejó el check-in de hoy.`}
          </AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
            No hay apuro. El pasaje espera.
          </AppText>
        </Card>
      )}
      {isDuoActive && todayGroupReading.prompt ? (
        <>
          <View style={{ height: space.lg }} />
          <DuoQuestionCard
            question={todayGroupReading.prompt}
            unlocked={todayStatus === 'completado'}
            myAnswer={myDuoAnswerToday}
            friendAnswer={friendDuoAnswerToday}
            friendName={friendName}
            onSave={saveDuoAnswer}
          />
        </>
      ) : null}
      <View style={{ height: space.md }} />
      <Pressable onPress={() => router.push('/(tabs)/grupo')}>
        <Card accent="olive">
          <AppText variant="label" tone="olive">
            Nosotros
          </AppText>
          <AppText variant="subtitle" style={{ marginTop: 6 }}>
            {groupToday.allDone
              ? `Hoy leyeron juntas · racha ${groupStreakCount}`
              : `${groupToday.done} de ${groupToday.total} leyeron hoy`}
          </AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
            {duo
              ? `Pregunta de a dos, oración y el mural con ${friendName}.`
              : `Oración mutua y el mural con ${friendName}, dentro de ${state.group.name}.`}
          </AppText>
          <AppText variant="label" tone="amber" style={{ marginTop: 12, color: colors.amberDeep }}>
            Ora y mirá el mural →
          </AppText>
        </Card>
      </Pressable>
    </Screen>
  );
}
