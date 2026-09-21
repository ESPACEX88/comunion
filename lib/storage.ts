import { seedHeartVerses, seedPrayerRequests } from '@/features/duo/seeds';
import type { PersistedState } from '@/lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@comunion/v1/state';

type LooseState = Omit<
  PersistedState,
  | 'version'
  | 'checkIns'
  | 'prayerRequests'
  | 'heartVerses'
  | 'duoAnswers'
  | 'graceDates'
  | 'userId'
  | 'remoteDuoId'
  | 'remotePlanId'
  | 'remotePersonalPlanId'
  | 'duoEnabled'
  | 'personalCompletedDates'
  | 'personalInProgressDate'
  | 'journalEntries'
> & {
  version?: number;
  checkIns?: PersistedState['checkIns'];
  prayerRequests?: PersistedState['prayerRequests'];
  heartVerses?: PersistedState['heartVerses'];
  duoAnswers?: PersistedState['duoAnswers'];
  graceDates?: PersistedState['graceDates'];
  userId?: string | null;
  remoteDuoId?: string | null;
  remotePlanId?: string | null;
  remotePersonalPlanId?: string | null;
  duoEnabled?: boolean;
  personalCompletedDates?: string[];
  personalInProgressDate?: string | null;
  journalEntries?: PersistedState['journalEntries'];
};

/**
 * Caché local (key v1, payload v4). Con sesión, Supabase es la fuente de verdad;
 * esto sirve para arrancar rápido y para el mock sin cuenta.
 */
export function migrateState(raw: LooseState): PersistedState {
  const checkIns = raw.checkIns ?? [];
  const prayerRequests = raw.prayerRequests ?? [];
  const heartVerses = raw.heartVerses ?? [];
  const duoAnswers = raw.duoAnswers ?? [];
  const graceDates = raw.graceDates ?? [];
  const duoEnabled =
    raw.duoEnabled ??
    (Boolean(raw.remoteDuoId) ||
      (Boolean(raw.onboardingComplete) && prayerRequests.length > 0 && !raw.remoteDuoId));
  const shouldSeedDuo =
    duoEnabled &&
    Boolean(raw.onboardingComplete) &&
    !raw.remoteDuoId &&
    prayerRequests.length === 0 &&
    heartVerses.length === 0;

  return {
    ...raw,
    version: 4,
    duoEnabled,
    userId: raw.userId ?? null,
    remoteDuoId: raw.remoteDuoId ?? null,
    remotePlanId: raw.remotePlanId ?? null,
    remotePersonalPlanId: raw.remotePersonalPlanId ?? null,
    personalCompletedDates: raw.personalCompletedDates ?? [],
    personalInProgressDate: raw.personalInProgressDate ?? null,
    journalEntries: raw.journalEntries ?? [],
    checkIns,
    prayerRequests: shouldSeedDuo ? seedPrayerRequests() : prayerRequests,
    heartVerses: shouldSeedDuo ? seedHeartVerses() : heartVerses,
    duoAnswers,
    graceDates,
  };
}

export async function loadState(): Promise<PersistedState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LooseState;
    if (![1, 2, 3, 4].includes(parsed?.version ?? 0)) return null;
    return migrateState(parsed);
  } catch {
    return null;
  }
}

export async function saveState(state: PersistedState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
