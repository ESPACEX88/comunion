import { AppText } from '@/components/ui/AppText';
import { GlassCard } from '@/components/ui/GlassCard';
import { space } from '@/theme';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  title?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SettingsCard({ title, children, style }: Props) {
  return (
    <View style={style}>
      {title ? (
        <AppText variant="label" tone="amber" style={{ marginBottom: space.sm }}>
          {title}
        </AppText>
      ) : null}
      <GlassCard padded={false} style={{ paddingHorizontal: space.md, paddingVertical: 8 }}>
        {children}
      </GlassCard>
    </View>
  );
}
