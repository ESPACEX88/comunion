import { useAppState } from '@/features/app-state/AppStateProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/theme';
import { Redirect } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  const { hydrated, state } = useAppState();
  const { configured, ready, session } = useAuth();

  if (!hydrated || (configured && !ready)) {
    return <View style={{ flex: 1, backgroundColor: colors.cream }} />;
  }

  if (configured && !session) {
    return <Redirect href="/onboarding" />;
  }

  if (configured && session && !state.remoteDuoId) {
    return <Redirect href="/onboarding/grupo" />;
  }

  if (!state.onboardingComplete && !state.remoteDuoId) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
