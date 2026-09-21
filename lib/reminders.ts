import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const REMINDER_CACHE_KEY = '@comunion/reminder-prefs';
export const SOLO_REMINDER_ID = 'comunion.solo';
export const DUO_REMINDER_ID = 'comunion.duo';

export type ReminderPrefs = {
  soloEnabled: boolean;
  soloHour: number;
  soloMinute: number;
  duoEnabled: boolean;
  duoHour: number;
  duoMinute: number;
  expoPushToken: string | null;
};

export const defaultReminderPrefs: ReminderPrefs = {
  soloEnabled: true,
  soloHour: 7,
  soloMinute: 0,
  duoEnabled: true,
  duoHour: 20,
  duoMinute: 0,
  expoPushToken: null,
};

export function formatClock(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function clampHour(value: number) {
  return ((value % 24) + 24) % 24;
}

export function clampMinute(value: number) {
  return ((value % 60) + 60) % 60;
}

export function remindersSupported() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

if (remindersSupported()) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function loadCachedPrefs(): Promise<ReminderPrefs> {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_CACHE_KEY);
    if (!raw) return defaultReminderPrefs;
    const parsed = JSON.parse(raw) as Partial<ReminderPrefs>;
    return { ...defaultReminderPrefs, ...parsed };
  } catch {
    return defaultReminderPrefs;
  }
}

export async function cachePrefs(prefs: ReminderPrefs) {
  await AsyncStorage.setItem(REMINDER_CACHE_KEY, JSON.stringify(prefs));
}

export async function clearCachedPrefs() {
  await AsyncStorage.removeItem(REMINDER_CACHE_KEY);
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Recordatorios',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180],
    lightColor: '#C47B2A',
  });
}

export async function getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined' | 'unavailable'> {
  if (!remindersSupported()) return 'unavailable';
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return 'granted';
    if (current.status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'unavailable';
  }
}

export async function requestReminderPermission(): Promise<boolean> {
  if (!remindersSupported()) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const next = await Notifications.requestPermissionsAsync();
    return next.granted;
  } catch {
    return false;
  }
}

export async function cancelAppReminders() {
  if (!remindersSupported()) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(SOLO_REMINDER_ID);
    await Notifications.cancelScheduledNotificationAsync(DUO_REMINDER_ID);
  } catch {
    /* web / Expo Go sin módulo nativo */
  }
}

export async function scheduleAppReminders(prefs: ReminderPrefs, hasDuo: boolean) {
  if (!remindersSupported()) return;
  await cancelAppReminders();
  const allowed = await getPermissionStatus();
  if (allowed !== 'granted') return;
  await ensureAndroidChannel();

  if (prefs.soloEnabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: SOLO_REMINDER_ID,
      content: {
        title: 'Tu momento',
        body: 'Hay un pasaje esperándote. Un rato, cuando quieras.',
        data: { screen: 'hoy' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: prefs.soloHour,
        minute: prefs.soloMinute,
        channelId: 'reminders',
      },
    });
  }

  if (hasDuo && prefs.duoEnabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: DUO_REMINDER_ID,
      content: {
        title: 'Juntas',
        body: 'El dúo te espera: oración o el pasaje de hoy.',
        data: { screen: 'nosotros' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: prefs.duoHour,
        minute: prefs.duoMinute,
        channelId: 'reminders',
      },
    });
  }
}

export async function previewReminder(kind: 'solo' | 'duo') {
  if (!remindersSupported()) return false;
  const allowed = await requestReminderPermission();
  if (!allowed) return false;
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content:
      kind === 'solo'
        ? {
            title: 'Tu momento',
            body: 'Hay un pasaje esperándote. Un rato, cuando quieras.',
          }
        : {
            title: 'Juntas',
            body: 'El dúo te espera: oración o el pasaje de hoy.',
          },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      channelId: 'reminders',
    },
  });
  return true;
}

export async function maybeExpoPushToken(): Promise<string | null> {
  if (!remindersSupported()) return null;
  try {
    const projectId =
      Constants.easConfig?.projectId ??
      (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
    if (!projectId) return null;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data ?? null;
  } catch {
    return null;
  }
}
