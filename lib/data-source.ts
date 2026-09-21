/**
 * Capa de datos.
 *
 * Con sesión: Supabase (auth + dúo). AsyncStorage queda como caché.
 * Sin sesión: el mock local de las fases 1–2.
 */

import { clearState, loadState, saveState } from '@/lib/storage';
import type { PersistedState } from '@/lib/types';

export interface DataSource {
  load(): Promise<PersistedState | null>;
  save(state: PersistedState): Promise<void>;
  clear(): Promise<void>;
}

export const localDataSource: DataSource = {
  load: loadState,
  save: saveState,
  clear: clearState,
};

export const dataSource: DataSource = localDataSource;
