import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type AuthContextValue = {
  configured: boolean;
  ready: boolean;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ needsConfirm: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabase();
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        setSession(data.session ?? null);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(mapAuthError(error.message));
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim() },
      },
    });
    if (error) throw new Error(mapAuthError(error.message));
    return { needsConfirm: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      ready,
      session,
      user: session?.user ?? null,
      signIn,
      signUp,
      signOut,
    }),
    [configured, ready, session, signIn, signOut, signUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login')) return 'El correo o la contraseña no coinciden.';
  if (lower.includes('already registered')) return 'Ese correo ya tiene cuenta. Entrá con tu contraseña.';
  if (lower.includes('email not confirmed')) {
    return 'Falta confirmar el correo. En el dashboard de Supabase: Authentication → Users, o desactivá Confirm email mientras prueban.';
  }
  if (lower.includes('password')) return 'La contraseña es muy corta. Usá al menos 6 caracteres.';
  return message;
}
