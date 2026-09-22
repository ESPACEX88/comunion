import { AppStateProvider } from '@/features/app-state/AppStateProvider';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { BibleProvider } from '@/features/bible/BibleProvider';
import { ReminderProvider } from '@/features/reminders/ReminderProvider';
import { ThemeProvider, useTheme } from '@/theme';
import {
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_600SemiBold_Italic,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  Literata_400Regular,
  Literata_400Regular_Italic,
  Literata_500Medium,
} from '@expo-google-fonts/literata';
import { DefaultTheme, Stack, ThemeProvider as NavTheme } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    Fraunces_700Bold,
    Literata_400Regular,
    Literata_400Regular_Italic,
    Literata_500Medium,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <ThemedRoot />
    </ThemeProvider>
  );
}

function ThemedRoot() {
  const { colors, scheme } = useTheme();
  const navTheme = {
    ...DefaultTheme,
    dark: scheme === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: colors.amber,
      background: colors.cream,
      card: colors.cream,
      text: colors.ink,
      border: colors.line,
      notification: colors.amber,
    },
  };

  return (
    <NavTheme value={navTheme}>
      <AuthProvider>
        <AppStateProvider>
          <ReminderProvider>
            <BibleProvider>
              <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.cream },
                  animation: 'fade',
                }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="lectura" />
                <Stack.Screen name="nosotros" />
                <Stack.Screen name="diario" />
                <Stack.Screen name="recordatorios" />
                <Stack.Screen name="biblia" />
              </Stack>
            </BibleProvider>
          </ReminderProvider>
        </AppStateProvider>
      </AuthProvider>
    </NavTheme>
  );
}
