import { PressScale } from '@/components/motion/PressScale';
import { AppText } from '@/components/ui/AppText';
import { radius, useTheme } from '@/theme';
import { View } from 'react-native';

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export function Chip({ label, active, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{ width: '100%' }}>
      <View
        style={{
          paddingVertical: 11,
          paddingHorizontal: 14,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: active ? colors.amber : colors.line,
          backgroundColor: active ? colors.creamDeep : colors.paper,
          alignItems: 'center',
        }}>
        <AppText variant="ui" tone={active ? 'amber' : 'soft'}>
          {label}
        </AppText>
      </View>
    </PressScale>
  );
}
