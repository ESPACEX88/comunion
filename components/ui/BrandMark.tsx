import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme';
import { View } from 'react-native';

type Props = {
  compact?: boolean;
};

export function BrandMark({ compact }: Props) {
  const { colors } = useTheme();
  const size = compact ? 8 : 10;
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: colors.amber,
          transform: [{ rotate: '45deg' }],
          marginBottom: compact ? 10 : 14,
        }}
      />
      <AppText
        variant="label"
        tone="olive"
        style={{ letterSpacing: 3.2 }}>
        Comunión
      </AppText>
    </View>
  );
}
