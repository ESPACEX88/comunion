import { AppText } from '@/components/ui/AppText';
import { radius, useTheme } from '@/theme';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

export function BackLink({ label = 'Volver' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      style={{
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: radius.pill,
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.glassBorder,
      }}>
      <AppText variant="ui" style={{ fontSize: 12 }}>
        ← {label}
      </AppText>
    </Pressable>
  );
}
