import { AppText } from '@/components/ui/AppText';
import { colors, radius, space } from '@/theme';
import { forwardRef } from 'react';
import { Pressable, type PressableProps, type StyleProp, type View, type ViewStyle } from 'react-native';

type Variant = 'primary' | 'olive' | 'ghost' | 'inline';

type Props = PressableProps & {
  label: string;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export const Button = forwardRef<View, Props>(function Button(
  { label, variant = 'primary', style, disabled, ...rest },
  ref,
) {
  const palette = {
    primary: { bg: colors.amber, fg: colors.white, border: colors.amber },
    olive: { bg: colors.olive, fg: colors.white, border: colors.olive },
    ghost: { bg: 'transparent', fg: colors.charcoal, border: colors.line },
    inline: { bg: 'transparent', fg: colors.amberDeep, border: 'transparent' },
  }[variant];

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === 'inline' ? 0 : 1,
          borderRadius: radius.md,
          paddingVertical: variant === 'inline' ? 6 : 14,
          paddingHorizontal: variant === 'inline' ? 0 : space.lg,
          alignItems: 'center',
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        },
        style,
      ]}
      {...rest}>
      <AppText
        variant="ui"
        style={{
          color: palette.fg,
          letterSpacing: 0.4,
        }}>
        {label}
      </AppText>
    </Pressable>
  );
});
