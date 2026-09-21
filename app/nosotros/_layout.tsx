import { useTheme } from '@/theme';
import { Stack } from 'expo-router';

export default function NosotrosLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.cream },
        animation: 'slide_from_right',
      }}
    />
  );
}
