import { radius, useTheme } from '@/theme';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  strong?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GlassCard({ children, strong, padded = true, style }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: strong ? colors.glassStrong : colors.glass,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          borderRadius: radius.xxl,
          padding: padded ? 20 : 0,
        },
        style,
      ]}>
      {children}
    </View>
  );
}
