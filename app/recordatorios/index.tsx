import { TimeStepper } from '@/components/reminders/TimeStepper';
import { AppText } from '@/components/ui/AppText';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useReminders } from '@/features/reminders/ReminderProvider';
import { formatClock, remindersSupported } from '@/lib/reminders';
import { space, useTheme } from '@/theme';
import { useEffect, useRef } from 'react';
import { Alert, Platform, Switch, View } from 'react-native';

export default function RecordatoriosScreen() {
  const { hasDuo } = useAppState();
  const { prefs, ready, permission, updatePrefs, requestAccess, preview } = useReminders();
  const { colors } = useTheme();
  const asked = useRef(false);

  const askIfNeeded = async () => {
    if (permission === 'granted' || permission === 'unavailable') return true;
    const go = async () => requestAccess();
    if (Platform.OS === 'web') return go();
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        'Un aviso, despacio',
        'Comunión puede tocarte a la hora que elijas — para tu lectura o para el dúo. No es ruido: es un toque para volver.',
        [
          { text: 'Ahora no', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Permitir',
            onPress: () => {
              void go().then(resolve);
            },
          },
        ],
      );
    });
  };

  useEffect(() => {
    if (!ready || asked.current) return;
    if (permission !== 'undetermined') return;
    if (!prefs.soloEnabled && !(hasDuo && prefs.duoEnabled)) return;
    asked.current = true;
    void askIfNeeded();
  }, [hasDuo, permission, prefs.duoEnabled, prefs.soloEnabled, ready]);

  const toggleSolo = async (value: boolean) => {
    if (value) {
      const ok = await askIfNeeded();
      if (!ok) return;
    }
    await updatePrefs({ soloEnabled: value });
  };

  const toggleDuo = async (value: boolean) => {
    if (value) {
      const ok = await askIfNeeded();
      if (!ok) return;
    }
    await updatePrefs({ duoEnabled: value });
  };

  return (
    <Screen>
      <BackLink label="Yo" />
      <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
        Recordatorios
      </AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        Un toque, no un grito
      </AppText>
      <Ornament />
      <AppText variant="body" tone="soft">
        Avisos locales en este teléfono. El push entre aparatos viene después.
      </AppText>
      {!remindersSupported() ? (
        <AppText variant="caption" tone="soft" style={{ marginTop: space.md }}>
          En la web se guarda la hora. El aviso llega en Expo Go / iPhone.
        </AppText>
      ) : null}
      {permission === 'denied' ? (
        <AppText variant="ui" style={{ color: colors.terracotta, marginTop: space.md }}>
          El sistema no dejó avisos. Podés activarlos en Ajustes → Comunión.
        </AppText>
      ) : null}

      <View
        style={{
          marginTop: space.xl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space.md,
        }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <AppText variant="label" tone="amber">
            Tu momento
          </AppText>
          <AppText variant="subtitle" style={{ marginTop: 6 }}>
            Lectura o diario
          </AppText>
          <AppText variant="ui" tone="soft" style={{ marginTop: 4 }}>
            Por la mañana, si querés. Ahora a las {formatClock(prefs.soloHour, prefs.soloMinute)}.
          </AppText>
        </View>
        <Switch
          value={prefs.soloEnabled}
          onValueChange={(value) => void toggleSolo(value)}
          trackColor={{ false: colors.line, true: colors.oliveSoft }}
          thumbColor={prefs.soloEnabled ? colors.olive : colors.creamDeep}
        />
      </View>
      <View style={{ marginTop: space.md }}>
        <TimeStepper
          hour={prefs.soloHour}
          minute={prefs.soloMinute}
          disabled={!prefs.soloEnabled}
          onChange={(soloHour, soloMinute) => void updatePrefs({ soloHour, soloMinute })}
        />
      </View>

      {hasDuo ? (
        <>
          <View
            style={{
              marginTop: space.xl,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: space.md,
            }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <AppText variant="label" tone="amber">
                Juntos
              </AppText>
              <AppText variant="subtitle" style={{ marginTop: 6 }}>
                Oración o el plan de a dos
              </AppText>
              <AppText variant="ui" tone="soft" style={{ marginTop: 4 }}>
                Al caer el día. Ahora a las {formatClock(prefs.duoHour, prefs.duoMinute)}.
              </AppText>
            </View>
            <Switch
              value={prefs.duoEnabled}
              onValueChange={(value) => void toggleDuo(value)}
              trackColor={{ false: colors.line, true: colors.oliveSoft }}
              thumbColor={prefs.duoEnabled ? colors.olive : colors.creamDeep}
            />
          </View>
          <View style={{ marginTop: space.md }}>
            <TimeStepper
              hour={prefs.duoHour}
              minute={prefs.duoMinute}
              disabled={!prefs.duoEnabled}
              onChange={(duoHour, duoMinute) => void updatePrefs({ duoHour, duoMinute })}
            />
          </View>
        </>
      ) : (
        <AppText variant="caption" tone="soft" style={{ marginTop: space.xl }}>
          El aviso de Juntos aparece cuando haya dúo.
        </AppText>
      )}

      {remindersSupported() ? (
        <Button
          label="Probar aviso ahora"
          variant="ghost"
          style={{ marginTop: space.xl }}
          onPress={async () => {
            const ok = await preview('solo');
            if (!ok && Platform.OS !== 'web') {
              Alert.alert('Sin permiso', 'Activá los avisos para probar uno ahora.');
            }
          }}
        />
      ) : null}
    </Screen>
  );
}
