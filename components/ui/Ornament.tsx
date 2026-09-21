import { colors } from '@/theme';
import { View } from 'react-native';

export function Ornament() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginVertical: 8,
      }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      <View
        style={{
          width: 7,
          height: 7,
          backgroundColor: colors.amber,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
    </View>
  );
}
