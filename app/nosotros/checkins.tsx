import { CheckInCard } from '@/components/duo/CheckInCard';
import { DuoQuestionCard } from '@/components/duo/DuoQuestionCard';
import { GraceCard } from '@/components/duo/GraceCard';
import { AppText } from '@/components/ui/AppText';
import { BackLink } from '@/components/ui/BackLink';
import { Card } from '@/components/ui/Card';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { partnerFirstName } from '@/features/duo/labels';
import { space } from '@/theme';
import { View } from 'react-native';

export default function CheckinsScreen() {
  const {
    members,
    specialFriend,
    myCheckInToday,
    friendCheckInToday,
    todayGroupReading,
    todayStatus,
    isDuoActive,
    grace,
    myDuoAnswerToday,
    friendDuoAnswerToday,
    saveDuoAnswer,
    useGraceDay,
  } = useAppState();
  const { refreshing, onRefresh } = useDuoSyncControls();
  const self = members.find((member) => member.isSelf) ?? members[0];
  const friendName = partnerFirstName(specialFriend);

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <BackLink label="Nosotros" />
      <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
        Hoy juntos
      </AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        Cómo las encontró.
      </AppText>
      <AppText variant="body" tone="soft" style={{ marginTop: space.sm }}>
        El check-in y la pregunta nacen después del pasaje. Acá se ven las dos.
      </AppText>
      <Ornament />
      <GraceCard offer={grace} friendName={friendName} onUseGrace={useGraceDay} />
      {grace.kind !== 'none' ? <View style={{ height: space.lg }} /> : null}
      {myCheckInToday ? (
        <CheckInCard checkIn={myCheckInToday} member={self} />
      ) : (
        <Card>
          <AppText variant="subtitle">Todavía no dejaste el tuyo.</AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
            Cuando termines la lectura, el ánimo aparece en Hoy y aquí.
          </AppText>
        </Card>
      )}
      <View style={{ height: space.md }} />
      {friendCheckInToday ? (
        <CheckInCard checkIn={friendCheckInToday} member={specialFriend} kicker={`${friendName} hoy`} />
      ) : (
        <Card>
          <AppText variant="subtitle">
            {specialFriend.id === 'pending'
              ? 'Todavía no se unió nadie.'
              : `${friendName} todavía no dejó el check-in.`}
          </AppText>
        </Card>
      )}
      {isDuoActive && todayGroupReading.prompt ? (
        <View style={{ marginTop: space.xl }}>
          <DuoQuestionCard
            question={todayGroupReading.prompt}
            unlocked={todayStatus === 'completado'}
            myAnswer={myDuoAnswerToday}
            friendAnswer={friendDuoAnswerToday}
            friendName={friendName}
            onSave={saveDuoAnswer}
          />
        </View>
      ) : null}
    </Screen>
  );
}
