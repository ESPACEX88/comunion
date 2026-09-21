import { seedHeartVerses, seedPrayerRequests } from '@/features/duo/seeds';
import type { PersistedState } from '@/lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@comunion/v1/state';

type LooseState = Omit<
  PersistedState,
  'version' | 'checkIns' | 'prayerRequests' | 'heartVerses' | 'duoAnswers' | 'graceDates' | 'userId' | 'remoteDuoId' | 'remotePlanId'
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
  const shouldSeedDuo =
    Boolean(raw.onboardingComplete) &&
    !raw.remoteDuoId &&
    prayerRequests.length === 0 &&
    heartVerses.length === 0;

  return {
    ...raw,
    version: 4,
    userId: raw.userId ?? null,
    remoteDuoId: raw.remoteDuoId ?? null,
    remotePlanId: raw.remotePlanId ?? null,
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
