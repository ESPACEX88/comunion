import { PressScale } from '@/components/motion/PressScale';
import { AppText } from '@/components/ui/AppText';
import { radius, space, useTheme } from '@/theme';
import { View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type Variant = 'primary' | 'olive' | 'ghost' | 'inline';

type Props = PressableProps & {
  label: string;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, variant = 'primary', style, disabled, ...rest }: Props) {
  const { colors } = useTheme();
  const palette = {
    primary: { bg: colors.amber, fg: colors.white, border: colors.amber },
    olive: { bg: colors.olive, fg: colors.white, border: colors.olive },
    ghost: { bg: 'transparent', fg: colors.ink, border: colors.line },
    inline: { bg: 'transparent', fg: colors.amberDeep, border: 'transparent' },
  }[variant];

  return (
    <PressScale accessibilityRole="button" disabled={disabled} style={style} {...rest}>
      <View
        style={{
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === 'inline' ? 0 : 1,
          borderRadius: radius.lg,
          paddingVertical: variant === 'inline' ? 6 : 15,
          paddingHorizontal: variant === 'inline' ? 0 : space.lg,
          alignItems: 'center',
          width: '100%',
          opacity: disabled ? 0.45 : 1,
        }}>
        <AppText variant="ui" style={{ color: palette.fg, letterSpacing: 0.4 }}>
          {label}
        </AppText>
      </View>
    </PressScale>
  );
}
