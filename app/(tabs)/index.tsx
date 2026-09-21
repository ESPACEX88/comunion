import { CheckInCard } from '@/components/duo/CheckInCard';
import { CheckInComposer } from '@/components/duo/CheckInComposer';
import { ReadingCard } from '@/components/reading/ReadingCard';
import { StreakMark } from '@/components/streak/StreakMark';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { formatLongDate, greeting } from '@/lib/date';
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
  } = useAppState();

  const self = members.find((member) => member.isSelf) ?? members[0];
  const friendName = specialFriend.name.split(' ')[0] ?? 'Ana';
  const cta =
    todayStatus === 'completado'
      ? 'Volver a leer el pasaje'
      : todayStatus === 'en_curso'
        ? 'Seguí la lectura'
        : 'Empezá la lectura';

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
      </AppText>
      <Ornament />
      <StreakMark
        count={personalStreak}
        label="Racha personal"
        hint={
          todayStatus === 'completado'
            ? 'Hoy ya está contado. Gracias por no apurar el texto.'
            : 'Hoy cuenta cuando terminés el pasaje, no antes.'
        }
      />
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
      <CheckInCard
        checkIn={friendCheckInToday}
        member={specialFriend}
        kicker={`${friendName} hoy`}
      />
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
            Oración mutua y el mural con {friendName}, dentro de {state.group.name}.
          </AppText>
          <AppText variant="label" tone="amber" style={{ marginTop: 12, color: colors.amberDeep }}>
            Ora y mirá el mural →
          </AppText>
        </Card>
      </Pressable>
    </Screen>
  );
}
