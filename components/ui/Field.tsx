import { fonts, radius, space, useTheme } from '@/theme';
import { TextInput, type TextInputProps } from 'react-native';

type Props = TextInputProps & {
  tall?: boolean;
};

export function Field({ tall, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.oliveSoft}
      style={[
        {
          marginTop: space.sm,
          backgroundColor: colors.paper,
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: radius.lg,
          paddingHorizontal: space.md,
          paddingVertical: tall ? space.md : 16,
          minHeight: tall ? 72 : undefined,
          fontFamily: fonts.reading,
          fontSize: 17,
          color: colors.ink,
          textAlignVertical: tall ? 'top' : 'center',
        },
        style,
      ]}
      {...rest}
    />
  );
}
