import { radius, space, useTheme } from '@/theme';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import type { ReactNode } from 'react';

type Props = {
  title?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SettingsCard({ title, children, style }: Props) {
  const { colors } = useTheme();
  return (
    <View style={style}>
      {title ? (
        <AppText variant="label" tone="amber" style={{ marginBottom: space.sm }}>
          {title}
        </AppText>
      ) : null}
      <View
        style={{
          backgroundColor: colors.paper,
          borderColor: colors.line,
          borderWidth: 1,
          borderRadius: radius.xl,
          paddingHorizontal: space.lg,
          paddingVertical: space.md,
          overflow: 'hidden',
        }}>
        {children}
      </View>
    </View>
  );
}
