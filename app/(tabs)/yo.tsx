import { GraceCard } from '@/components/duo/GraceCard';
import { Avatar } from '@/components/group/MemberRow';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { useAuth } from '@/features/auth/AuthProvider';
import { partnerFirstName } from '@/features/duo/labels';
import { lastNDays, parseDayKey } from '@/lib/date';
import { space, useTheme, type AppearancePref } from '@/theme';
import { router } from 'expo-router';
import { Alert, Platform, Pressable, Switch, View } from 'react-native';

const THEME_OPTIONS: { id: AppearancePref; label: string }[] = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Oscuro' },
  { id: 'system', label: 'Sistema' },
];

export default function YoScreen() {
  const {
    state,
    today,
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
  const { refreshing, onRefresh } = useDuoSyncControls();
  const { signOut, user } = useAuth();
  const { colors, preference, setPreference } = useTheme();
  const self = members.find((m) => m.isSelf) ?? members[0];
  const history = lastNDays(today, 14);
  const friendName = partnerFirstName(specialFriend);

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <AppText variant="label" tone="olive">
        Vos
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.lg }}>
        <Avatar name={state.userName} hue={self.hue} />
        <View style={{ flex: 1 }}>
          <AppText variant="title">{state.userName}</AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 4 }}>
            {state.group.name}
            {live ? ' · en la nube' : ''}
          </AppText>
          {user?.email ? (
            <AppText variant="caption" tone="soft" style={{ marginTop: 4 }}>
              {user.email}
            </AppText>
          ) : null}
        </View>
      </View>

      <Field
        value={state.userName}
        onChangeText={setUserName}
        accessibilityLabel="Tu nombre"
        autoCapitalize="words"
        style={{ marginTop: space.lg }}
      />
      <AppText variant="caption" tone="soft" style={{ marginTop: 6 }}>
        Así te ve tu dúo.
      </AppText>

      <AppText variant="label" tone="amber" style={{ marginTop: space.xl }}>
        Apariencia
      </AppText>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: space.md }}>
        {THEME_OPTIONS.map((option) => {
          const active = preference === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setPreference(option.id)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: active ? colors.amber : colors.line,
                backgroundColor: active ? colors.paper : 'transparent',
                alignItems: 'center',
              }}>
              <AppText variant="ui" tone={active ? 'amber' : 'soft'}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <AppText variant="caption" tone="soft" style={{ marginTop: 8 }}>
        Claro de papel. Oscuro de carbón. Sistema sigue al teléfono.
      </AppText>

      <AppText variant="label" tone="amber" style={{ marginTop: space.xl }}>
        Últimas dos semanas
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: space.md }}>
        {history.map((day) => {
          const done = state.userCompletedDates.includes(day);
          const graceDay = state.graceDates.includes(day);
          const isToday = day === today;
          return (
            <View key={day} style={{ alignItems: 'center', width: 28 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
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

      <View style={{ marginTop: space.lg }}>
        <GraceCard offer={grace} friendName={friendName} onUseGrace={useGraceDay} />
      </View>

      <View
        style={{
          marginTop: space.xl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <AppText variant="subtitle">Recordatorio diario</AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 4 }}>
            Solo la interfaz, por ahora.
          </AppText>
        </View>
        <Switch
          value={state.notificationsEnabled}
          onValueChange={setNotifications}
          trackColor={{ false: colors.line, true: colors.oliveSoft }}
          thumbColor={state.notificationsEnabled ? colors.olive : colors.creamDeep}
        />
      </View>

      <View style={{ height: space.xl }} />
      {live ? (
        <Button
          label="Cerrar sesión"
          onPress={async () => {
            await signOut();
            await resetLocalData();
            router.replace('/onboarding');
          }}
        />
      ) : null}

      <AppText variant="label" tone="soft" style={{ marginTop: space.xxl }}>
        Este teléfono
      </AppText>
      <Button
        label="Probar un día saltado"
        variant="ghost"
        style={{ marginTop: space.md }}
        onPress={simulateMissedDay}
      />
      <Button
        label="Empezar de cero en este aparato"
        variant="ghost"
        style={{ marginTop: 8 }}
        onPress={() => {
          const wipe = async () => {
            await resetLocalData();
            router.replace('/onboarding');
          };
          if (Platform.OS === 'web') {
            const ok =
              typeof window !== 'undefined' &&
              window.confirm('¿Borrar lo de este teléfono? Se pierde la racha guardada aquí.');
            if (ok) void wipe();
            return;
          }
          Alert.alert('¿Borrar lo de este teléfono?', 'Se pierde la racha guardada aquí.', [
            { text: 'Mejor no', style: 'cancel' },
            { text: 'Borrar', style: 'destructive', onPress: () => void wipe() },
          ]);
        }}
      />
    </Screen>
  );
}
