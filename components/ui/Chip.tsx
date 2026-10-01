import { PressScale } from '@/components/motion/PressScale';
import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme';
import type { ReactNode } from 'react';
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
      style={{ flex: 1 }}>
      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 6,
          borderRadius: 12,
          backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
          alignItems: 'center',
        }}>
        <AppText variant="ui" style={{ fontSize: 12, color: active ? colors.ink : colors.charcoalSoft }}>
          {label}
        </AppText>
      </View>
    </PressScale>
  );
}

export function SegmentTrack({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 5,
        borderRadius: 16,
      }}>
      {children}
    </View>
  );
}
