import { useTheme } from '@/theme';
import { Stack } from 'expo-router';

export default function AmigosLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.cream },
        animation: 'fade',
      }}
    />
  );
}
