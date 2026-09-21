/**
 * Capa de datos lista para un backend.
 *
 * Hoy: AsyncStorage + amigos/planes embebidos (`localDataSource`).
 * Mañana: implementar `SupabaseDataSource` con las mismas firmas
 * (auth, grupo, lecturas, rachas, hilo) y cambiar el proveedor.
 *
 * No hay claves de API en este repo a propósito.
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
