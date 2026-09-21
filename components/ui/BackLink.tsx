import { AppText } from '@/components/ui/AppText';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

export function BackLink({ label = 'Volver' }: { label?: string }) {
  return (
    <Pressable onPress={() => router.back()} hitSlop={12}>
      <AppText variant="label" tone="amber">
        ← {label}
      </AppText>
    </Pressable>
  );
}
