import { seedHeartVerses, seedPrayerRequests } from '@/features/duo/seeds';
import type { PersistedState } from '@/lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@comunion/v1/state';

type LooseState = Omit<PersistedState, 'version' | 'checkIns' | 'prayerRequests' | 'heartVerses'> & {
  version?: number;
  checkIns?: PersistedState['checkIns'];
  prayerRequests?: PersistedState['prayerRequests'];
  heartVerses?: PersistedState['heartVerses'];
};

/**
 * Persistencia local (v1 del key, payload v2 con Fase 1).
 * Más adelante este módulo se puede sustituir por un cliente de Supabase.
 */
export function migrateState(raw: LooseState): PersistedState {
  const checkIns = raw.checkIns ?? [];
  const prayerRequests = raw.prayerRequests ?? [];
  const heartVerses = raw.heartVerses ?? [];
  const shouldSeedDuo =
    Boolean(raw.onboardingComplete) && prayerRequests.length === 0 && heartVerses.length === 0;

  return {
    ...raw,
    version: 2,
    checkIns,
    prayerRequests: shouldSeedDuo ? seedPrayerRequests() : prayerRequests,
    heartVerses: shouldSeedDuo ? seedHeartVerses() : heartVerses,
  };
}

export async function loadState(): Promise<PersistedState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LooseState;
    if (parsed?.version !== 1 && parsed?.version !== 2) return null;
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
