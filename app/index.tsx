import { useAppState } from '@/features/app-state/AppStateProvider';
import { colors } from '@/theme';
import { Redirect } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  const { hydrated, state } = useAppState();

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.cream }} />;
  }

  if (!state.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
