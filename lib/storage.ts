import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PersistedState } from '@/lib/types';

export const STORAGE_KEY = '@comunion/v1/state';

/**
 * Persistencia local (v1). Más adelante este módulo se puede sustituir
 * por un cliente de Supabase sin cambiar las pantallas.
 */
export async function loadState(): Promise<PersistedState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed?.version !== 1) return null;
    return parsed;
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
