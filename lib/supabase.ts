import { authStorage } from '@/lib/auth-storage';
import type { Database } from '@/lib/database.types';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function isSupabaseConfigured(): boolean {
  const url = SUPABASE_URL.trim();
  const key = SUPABASE_ANON_KEY.trim();
  if (!url || !key) return false;
  if (key.includes('TU_ANON') || key.includes('your-anon') || key.includes('REPLACE')) return false;
  return url.startsWith('https://') && key.length > 20;
}

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!isSupabaseConfigured()) {
    throw new Error('Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }
  if (!client) {
    client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
