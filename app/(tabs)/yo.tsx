import { Avatar } from '@/components/group/MemberRow';
import { HubEntry } from '@/components/group/HubEntry';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip, SegmentTrack } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { SettingsCard } from '@/components/ui/SettingsCard';
import { Toggle } from '@/components/ui/Toggle';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useLiveSyncControls } from '@/features/app-state/useLiveSync';
import { useAuth } from '@/features/auth/AuthProvider';
import { useGroups } from '@/features/groups/GroupsProvider';
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
    signedIn,
    soloStreak,
    journalEntries,
    personalPlan,
  } = useAppState();
  const { refreshing, onRefresh } = useLiveSyncControls();
  const { signOut, user } = useAuth();
  const { groups } = useGroups();
  const { prefs, cancelAll, updatePrefs } = useReminders();
  const { colors, preference, setPreference } = useTheme();
  const params = useLocalSearchParams<{ shot?: string }>();
  const self = members.find((m) => m.isSelf) ?? members[0];
  const history = lastNDays(today, 14);

  useEffect(() => {
    if (params.shot === 'ajustes') setPreference('dark');
  }, [params.shot, setPreference]);

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <View style={{ marginTop: space.lg }}>
        <Avatar name={state.userName} hue={self?.hue ?? 'amber'} />
        <AppText variant="title" style={{ marginTop: 12 }}>
          {state.userName || 'Vos'}
        </AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 4 }}>
          {user?.email || (live ? 'En la nube' : 'En este teléfono, por ahora')}
        </AppText>
      </View>

      <SettingsCard title="Cómo te llamás" style={{ marginTop: space.xl }}>
        <Field
          value={state.userName}
          onChangeText={setUserName}
          accessibilityLabel="Tu nombre"
          autoCapitalize="words"
        />
        <AppText variant="caption" tone="soft" style={{ marginTop: 8 }}>
          Así te ve tu grupo.
        </AppText>
      </SettingsCard>

      <SettingsCard title="Tu espacio" style={{ marginTop: space.xl }}>
        <HubEntry
          kicker="Diario"
          title="Solo entre vos y Él"
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
              ? 'Tu racha personal, aparte de la del grupo.'
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
          hint="Avisos en este teléfono, a la hora que elijas."
          onPress={() => router.push('/recordatorios')}
        />
        <HubEntry
          kicker="Grupo"
          title={groups.length === 0 ? 'Crear o unirme' : groups.length === 1 ? groups[0].name : 'Tus grupos'}
          hint={
            groups.length === 0
              ? 'Leer juntos, orar, un versículo y un reto.'
              : `${groups.length} ${groups.length === 1 ? 'grupo' : 'grupos'}.`
          }
          onPress={() => router.push('/(tabs)/grupos')}
          last
        />
      </SettingsCard>

      <SettingsCard title="Apariencia" style={{ marginTop: space.xl }}>
        <View style={{ paddingVertical: 8 }}>
          <SegmentTrack>
            {THEME_OPTIONS.map((option) => (
              <Chip
                key={option.id}
                label={option.id === 'system' ? 'Auto' : option.label}
                active={preference === option.id}
                onPress={() => setPreference(option.id)}
              />
            ))}
          </SegmentTrack>
        </View>
      </SettingsCard>

      <SettingsCard title="Avisos" style={{ marginTop: space.lg }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.glassBorder,
          }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <AppText variant="ui">Aviso diario</AppText>
            <AppText variant="caption" tone="soft" style={{ marginTop: 2, letterSpacing: 0 }}>
              {prefs.soloEnabled
                ? `${formatClock(prefs.soloHour, prefs.soloMinute)} · Guatemala`
                : 'Apagado'}
            </AppText>
          </View>
          <Toggle
            value={prefs.soloEnabled}
            onValueChange={(value) => void updatePrefs({ soloEnabled: value })}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
          }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <AppText variant="ui">Recordatorios</AppText>
            <AppText variant="caption" tone="soft" style={{ marginTop: 2, letterSpacing: 0 }}>
              Horario de tu momento
            </AppText>
          </View>
          <AppText variant="ui" tone="amber" onPress={() => router.push('/recordatorios')}>
            →
          </AppText>
        </View>
      </SettingsCard>

      <SettingsCard title="Tu racha personal" style={{ marginTop: space.lg }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 8 }}>
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
          Cerrar sesión no borra el grupo. Volvés a entrar con el mismo correo.
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
