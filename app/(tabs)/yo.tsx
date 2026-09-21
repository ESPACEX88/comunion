import { Avatar } from '@/components/group/MemberRow';
import { GraceCard } from '@/components/duo/GraceCard';
import { StreakMark } from '@/components/streak/StreakMark';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { partnerFirstName } from '@/features/duo/labels';
import { lastNDays, parseDayKey } from '@/lib/date';
import { colors, space } from '@/theme';
import { router } from 'expo-router';
import { Alert, Platform, Switch, TextInput, View } from 'react-native';

export default function YoScreen() {
  const {
    state,
    today,
    personalStreak,
    members,
    setNotifications,
    setUserName,
    resetLocalData,
    grace,
    useGraceDay,
    simulateMissedDay,
    specialFriend,
    live,
  } = useAppState();
  const { signOut, user } = useAuth();
  const self = members.find((m) => m.isSelf) ?? members[0];
  const history = lastNDays(today, 14);
  const friendName = partnerFirstName(specialFriend);

  return (
    <Screen>
      <AppText variant="label" tone="olive">
        Vos
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md }}>
        <Avatar name={state.userName} hue={self.hue} />
        <View style={{ flex: 1 }}>
          <AppText variant="title">{state.userName}</AppText>
          <AppText variant="ui" tone="soft">
            {state.group.name}
            {live ? ' · en la nube' : ''}
          </AppText>
          {user?.email ? (
            <AppText variant="caption" tone="soft">
              {user.email}
            </AppText>
          ) : null}
        </View>
      </View>
      <Ornament />
      <TextInput
        value={state.userName}
        onChangeText={setUserName}
        accessibilityLabel="Tu nombre"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.line,
          paddingVertical: 8,
          fontFamily: 'Fraunces_500Medium',
          fontSize: 16,
          color: colors.ink,
        }}
      />
      <AppText variant="caption" tone="soft" style={{ marginTop: 6 }}>
        Ese nombre se ve en el grupo.
      </AppText>
      <View style={{ height: space.lg }} />
      <StreakMark
        count={personalStreak}
        label="Racha personal"
        hint={
          grace.kind === 'offer'
            ? 'Ayer se quedó. Un día de gracia por semana sostiene la racha, sin fingir que leíste.'
            : grace.kind === 'retomar'
              ? 'Esta semana ya usaron la gracia. Hoy, al terminar, empiezan de nuevo en 1.'
              : `Tu mejor racha: ${state.personalBest} ${state.personalBest === 1 ? 'día' : 'días'}. Un día de gracia por semana (lunes–domingo).`
        }
      />
      <View style={{ height: space.md }} />
      <GraceCard offer={grace} friendName={friendName} onUseGrace={useGraceDay} />
      <View style={{ height: space.lg }} />
      <AppText variant="label" tone="amber">
        Últimas dos semanas
      </AppText>
      <AppText variant="ui" tone="soft" style={{ marginTop: 4, marginBottom: space.sm }}>
        Oliva: día leído. Ámbar: día de gracia. Hueco: todavía no se leyó. La gracia no infla el
        número; solo puentea.
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {history.map((day) => {
          const done = state.userCompletedDates.includes(day);
          const graceDay = state.graceDates.includes(day);
          const isToday = day === today;
          return (
            <View key={day} style={{ alignItems: 'center', width: 28 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: done ? colors.olive : graceDay ? colors.amber : colors.line,
                  borderWidth: isToday ? 2 : 0,
                  borderColor: colors.amber,
                }}
              />
              <AppText variant="caption" tone="soft" style={{ marginTop: 4, fontSize: 9, letterSpacing: 0 }}>
                {parseDayKey(day).getDate()}
              </AppText>
            </View>
          );
        })}
      </View>
      <View style={{ height: space.lg }} />
      <Card accent="none">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <AppText variant="subtitle">Recordatorio diario</AppText>
            <AppText variant="ui" tone="soft" style={{ marginTop: 4 }}>
              Solo la interfaz, por ahora. Cuando haya backend, esto pedirá permiso de notificaciones.
            </AppText>
          </View>
          <Switch
            value={state.notificationsEnabled}
            onValueChange={setNotifications}
            trackColor={{ false: colors.line, true: colors.oliveSoft }}
            thumbColor={state.notificationsEnabled ? colors.olive : colors.creamDeep}
          />
        </View>
      </Card>
      <View style={{ height: space.lg }} />
      <AppText variant="label" tone="amber">
        Datos locales
      </AppText>
      <AppText variant="ui" tone="soft" style={{ marginTop: 6, marginBottom: space.md }}>
        {live
          ? 'Lo del dúo vive en Supabase. Este teléfono guarda una caché. Cerrar sesión no borra lo compartido.'
          : 'Todo vive en este teléfono. Borrar te lleva otra vez al onboarding.'}
      </AppText>
      {live ? (
        <Button
          label="Cerrar sesión"
          variant="olive"
          style={{ marginBottom: space.md }}
          onPress={async () => {
            await signOut();
            await resetLocalData();
            router.replace('/onboarding');
          }}
        />
      ) : null}
      <Button
        label="Probar un día saltado (demo)"
        variant="olive"
        onPress={simulateMissedDay}
      />
      <AppText variant="caption" tone="soft" style={{ marginTop: 8, marginBottom: space.md }}>
        Deja ayer sin leer y conserva dos días previos, para ver la gracia o «Retomar juntos».
      </AppText>
      <Button
        label="Empezar de cero en este aparato"
        variant="ghost"
        onPress={() => {
          const wipe = async () => {
            await resetLocalData();
            router.replace('/onboarding');
          };
          if (Platform.OS === 'web') {
            const ok =
              typeof window !== 'undefined' &&
              window.confirm(
                '¿Borrar lo de este teléfono? Se pierde la racha, el hilo y el grupo guardados aquí.',
              );
            if (ok) void wipe();
            return;
          }
          Alert.alert(
            '¿Borrar lo de este teléfono?',
            'Se pierde la racha, el hilo y el grupo guardados aquí. No hay nube todavía.',
            [
              { text: 'Mejor no', style: 'cancel' },
              { text: 'Borrar', style: 'destructive', onPress: () => void wipe() },
            ],
          );
        }}
      />
    </Screen>
  );
}
