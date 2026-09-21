import { darkColors, lightColors, type ThemeColors } from '@/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

const THEME_KEY = '@comunion/appearance';

export type AppearancePref = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

type ThemeContextValue = {
  preference: AppearancePref;
  scheme: ColorScheme;
  colors: ThemeColors;
  setPreference: (pref: AppearancePref) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPrefState] = useState<AppearancePref>('system');

  useEffect(() => {
    void AsyncStorage.getItem(THEME_KEY)
      .then((raw) => {
        if (raw === 'light' || raw === 'dark' || raw === 'system') setPrefState(raw);
      })
      .catch(() => undefined);
  }, []);

  const setPreference = useCallback((pref: AppearancePref) => {
    setPrefState(pref);
    void AsyncStorage.setItem(THEME_KEY, pref);
  }, []);

  const scheme: ColorScheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const palette = scheme === 'dark' ? darkColors : lightColors;

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, scheme, colors: palette, setPreference }),
    [palette, preference, scheme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
}
