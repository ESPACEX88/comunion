import { colors, radius } from '@/theme';
import { View } from 'react-native';

export function ProgressBar({ value, total }: { value: number; total: number }) {
  const ratio = total === 0 ? 0 : Math.min(1, value / total);
  return (
    <View
      style={{
        height: 6,
        backgroundColor: colors.creamDeep,
        borderRadius: radius.sm,
        overflow: 'hidden',
      }}>
      <View
        style={{
          width: `${ratio * 100}%`,
          height: '100%',
          backgroundColor: colors.amber,
        }}
      />
    </View>
  );
}
