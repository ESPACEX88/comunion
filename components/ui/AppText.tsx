import { fonts, typeScale, useTheme } from '@/theme';
import { Text, type TextProps } from 'react-native';

type Variant =
  | 'display'
  | 'numeral'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'verse'
  | 'ui'
  | 'caption'
  | 'label';

const variantFont: Record<Variant, string> = {
  display: fonts.display,
  numeral: fonts.display,
  title: fonts.title,
  subtitle: fonts.title,
  body: fonts.reading,
  verse: fonts.reading,
  ui: fonts.ui,
  caption: fonts.caption,
  label: fonts.ui,
};

const variantSize: Record<Variant, object> = {
  display: typeScale.display,
  numeral: typeScale.numeral,
  title: typeScale.title,
  subtitle: typeScale.subtitle,
  body: typeScale.body,
  verse: typeScale.verse,
  ui: typeScale.ui,
  caption: typeScale.caption,
  label: typeScale.label,
};

type Props = TextProps & {
  variant?: Variant;
  tone?: 'ink' | 'soft' | 'amber' | 'olive' | 'cream';
  italic?: boolean;
};

export function AppText({
  variant = 'body',
  tone = 'ink',
  italic,
  style,
  children,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const toneColor = {
    ink: colors.ink,
    soft: colors.charcoalSoft,
    amber: colors.amberDeep,
    olive: colors.olive,
    cream: colors.cream,
  };
  const fontFamily = italic
    ? variant === 'verse' || variant === 'body'
      ? fonts.readingItalic
      : fonts.uiItalic
    : variantFont[variant];

  return (
    <Text
      {...rest}
      style={[
        variantSize[variant],
        {
          fontFamily,
          color: toneColor[tone],
          textTransform: variant === 'label' ? 'uppercase' : 'none',
        },
        style,
      ]}>
      {children}
    </Text>
  );
}
