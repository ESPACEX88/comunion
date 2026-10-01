import { Avatar } from '@/components/group/MemberRow';
import { HubEntry } from '@/components/group/HubEntry';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { SettingsCard } from '@/components/ui/SettingsCard';
import { confirmLeaveDuo } from '@/features/duo/leaveConfirm';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { useAuth } from '@/features/auth/AuthProvider';
import { useReminders } from '@/features/reminders/ReminderProvider';
import { formatClock } from '@/lib/reminders';
import { lastNDays, parseDayKey } from '@/lib/date';
import { space, useTheme, type AppearancePref } from '@/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Platform, View } from 'react-native';

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
    setUserName,
    resetLocalData,
    live,
    hasDuo,
    signedIn,
    soloStreak,
    journalEntries,
    personalPlan,
    leaveDuo,
  } = useAppState();
  const { refreshing, onRefresh } = useDuoSyncControls();
  const { signOut, user } = useAuth();
  const { prefs, cancelAll } = useReminders();
  const { colors, preference, setPreference } = useTheme();
  const params = useLocalSearchParams<{ shot?: string }>();
  const self = members.find((m) => m.isSelf) ?? members[0];
  const history = lastNDays(today, 14);
  const showLeave = hasDuo || params.shot === 'duo';

  useEffect(() => {
    if (params.shot === 'duo' || params.shot === 'ajustes') setPreference('dark');
  }, [params.shot, setPreference]);

  const runLeave = () => {
    void leaveDuo().then(() => router.replace('/(tabs)/grupo'));
  };

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <AppText variant="label" tone="olive">
        Tu espacio con Dios
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.lg }}>
        <Avatar name={state.userName} hue={self.hue} />
        <View style={{ flex: 1 }}>
          <AppText variant="title">{state.userName || 'Vos'}</AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 4 }}>
            {showLeave
              ? `${state.group.name}${live ? ' · en la nube' : ''}`
              : 'En solitario, por ahora'}
          </AppText>
          {user?.email ? (
            <AppText variant="caption" tone="soft" style={{ marginTop: 4 }}>
              {user.email}
            </AppText>
          ) : null}
        </View>
      </View>

      <SettingsCard title="Cómo te llamás" style={{ marginTop: space.xl }}>
        <Field
          value={state.userName}
          onChangeText={setUserName}
          accessibilityLabel="Tu nombre"
          autoCapitalize="words"
        />
        <AppText variant="caption" tone="soft" style={{ marginTop: 8 }}>
          {hasDuo ? 'Así te ve tu dúo.' : 'Así te vas a ver cuando haya dúo.'}
        </AppText>
      </SettingsCard>

      <SettingsCard title="Tu espacio" style={{ marginTop: space.xl }}>
        <HubEntry
          kicker="Biblia"
          title="Leer la Biblia"
          hint="Libros y capítulos. El texto completo, si hay clave de API.Bible."
          onPress={() => router.push('/biblia')}
        />
        <HubEntry
          kicker="Diario"
          title="Lo que no va al dúo"
          hint={
            journalEntries.length === 0
              ? 'Todavía en blanco. Una fecha, un cuerpo, un ánimo si querés.'
              : `${journalEntries.length} ${journalEntries.length === 1 ? 'entrada' : 'entradas'}. Solo tuyas.`
          }
          onPress={() => router.push('/diario')}
        />
        <HubEntry
          kicker="Mi plan"
          title={personalPlan?.title ?? 'Salmos en solitario'}
          hint={
            soloStreak === 0
              ? 'Tu racha personal, aparte de la de a dos.'
              : `${soloStreak} ${soloStreak === 1 ? 'día seguido' : 'días seguidos'}.`
          }
          onPress={() => router.push('/(tabs)/planes')}
        />
        <HubEntry
          kicker="Recordatorios"
          title={
            prefs.soloEnabled
              ? `Tu momento · ${formatClock(prefs.soloHour, prefs.soloMinute)}`
              : 'Tu momento está apagado'
          }
          hint={
            hasDuo
              ? prefs.duoEnabled
                ? `Juntos a las ${formatClock(prefs.duoHour, prefs.duoMinute)}. Se puede apagar.`
                : 'Juntos está apagado. El aviso de a dos se enciende acá.'
              : 'Avisos en este teléfono. Juntos aparece cuando haya dúo.'
          }
          onPress={() => router.push('/recordatorios')}
        />
        <HubEntry
          kicker="Amigos"
          title="Tu red"
          hint="Más ancha que el dúo. Un código, un sí."
          onPress={() => router.push('/amigos')}
          last={!hasDuo ? false : true}
        />
        {!hasDuo ? (
          <HubEntry
            kicker="Dúo"
            title="Sumar a alguien"
            hint="Cuando quieras. No es requisito para seguir leyendo."
            onPress={() => router.push('/onboarding/grupo')}
            last
          />
        ) : null}
      </SettingsCard>

      <SettingsCard title="Apariencia" style={{ marginTop: space.xl }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {THEME_OPTIONS.map((option) => (
            <View key={option.id} style={{ flex: 1 }}>
              <Chip
                label={option.label}
                active={preference === option.id}
                onPress={() => setPreference(option.id)}
              />
            </View>
          ))}
        </View>
        <AppText variant="caption" tone="soft" style={{ marginTop: 10 }}>
          Claro de papel. Oscuro de carbón. Sistema sigue al teléfono.
        </AppText>
      </SettingsCard>

      <SettingsCard title="Tu racha personal" style={{ marginTop: space.xl }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {history.map((day) => {
            const done = state.personalCompletedDates.includes(day);
            const isToday = day === today;
            return (
              <View key={day} style={{ alignItems: 'center', width: 28 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: done ? colors.olive : colors.line,
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
      </SettingsCard>

      <SettingsCard title="Cuenta" style={{ marginTop: space.xl }}>
        {showLeave ? (
          <Button
            label="Salir del dúo"
            variant="ghost"
            testID="leave-duo"
            onPress={() => confirmLeaveDuo(runLeave)}
          />
        ) : null}
        <View style={{ height: showLeave ? space.sm : 0 }} />
        {signedIn ? (
          <Button
            label="Cerrar sesión"
            onPress={async () => {
              await cancelAll();
              await signOut();
              await resetLocalData();
              router.replace('/onboarding');
            }}
          />
        ) : (
          <Button label="Crear cuenta" onPress={() => router.push('/onboarding')} />
        )}
        <AppText variant="caption" tone="soft" style={{ marginTop: 10 }}>
          Salir del dúo no borra tu cuenta. Después podés crear o unirte otra vez.
        </AppText>
      </SettingsCard>

      <SettingsCard title="Este teléfono" style={{ marginTop: space.xl, marginBottom: space.lg }}>
        <Button
          label="Empezar de cero en este aparato"
          variant="ghost"
          onPress={() => {
            const wipe = async () => {
              await cancelAll();
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
      </SettingsCard>
    </Screen>
  );
}
