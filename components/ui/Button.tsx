import { PressScale } from '@/components/motion/PressScale';
import { AppText } from '@/components/ui/AppText';
import { radius, space, useTheme } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type Variant = 'primary' | 'olive' | 'ghost' | 'inline' | 'solid' | 'danger';

type Props = PressableProps & {
  label: string;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function Button({ label, variant = 'primary', style, disabled, compact, ...rest }: Props) {
  const { colors } = useTheme();
  const padV = compact ? 10 : 15;
  const padH = compact ? 14 : space.lg;
  const radiusValue = radius.pill;

  if (variant === 'primary') {
    return (
      <PressScale accessibilityRole="button" disabled={disabled} style={style} {...rest}>
        <LinearGradient
          colors={[colors.glowFrom, colors.glowTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: radiusValue,
            paddingVertical: padV,
            paddingHorizontal: padH,
            alignItems: 'center',
            width: compact ? undefined : '100%',
            opacity: disabled ? 0.45 : 1,
            shadowColor: colors.glowTo,
            shadowOpacity: 0.4,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}>
          <AppText variant="ui" style={{ color: colors.glowFg, letterSpacing: 0.2, fontWeight: '700' }}>
            {label}
          </AppText>
        </LinearGradient>
      </PressScale>
    );
  }

  const palette = {
    olive: { bg: colors.olive, fg: colors.white, border: colors.olive },
    ghost: { bg: colors.glass, fg: colors.ink, border: colors.glassBorder },
    inline: { bg: 'transparent', fg: colors.amberDeep, border: 'transparent' },
    solid: { bg: colors.tabOnBg, fg: colors.tabOnFg, border: colors.tabOnBg },
    danger: { bg: colors.dangerBg, fg: colors.danger, border: colors.dangerBorder },
  }[variant];

  return (
    <PressScale accessibilityRole="button" disabled={disabled} style={style} {...rest}>
      <View
        style={{
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === 'inline' ? 0 : 1,
          borderRadius: radiusValue,
          paddingVertical: variant === 'inline' ? 6 : padV,
          paddingHorizontal: variant === 'inline' ? 0 : padH,
          alignItems: 'center',
          width: compact ? undefined : '100%',
          opacity: disabled ? 0.45 : 1,
        }}>
        <AppText variant="ui" style={{ color: palette.fg, letterSpacing: 0.2 }}>
          {label}
        </AppText>
      </View>
    </PressScale>
  );
}
