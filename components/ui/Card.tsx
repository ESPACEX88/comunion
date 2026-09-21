import { colors, radius, space } from '@/theme';
import { View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  accent?: 'amber' | 'olive' | 'none';
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, accent = 'amber', style }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.paper,
          borderColor: colors.line,
          borderWidth: 1,
          borderRadius: radius.md,
          padding: space.lg,
          borderLeftWidth: accent === 'none' ? 1 : 3,
          borderLeftColor:
            accent === 'olive' ? colors.olive : accent === 'amber' ? colors.amber : colors.line,
        },
        style,
      ]}>
      {children}
    </View>
  );
}
