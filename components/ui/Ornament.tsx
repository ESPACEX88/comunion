import { useTheme } from '@/theme';
import { View } from 'react-native';

export function Ornament() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginVertical: 18,
      }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      <View
        style={{
          width: 6,
          height: 6,
          backgroundColor: colors.amber,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
    </View>
  );
}
