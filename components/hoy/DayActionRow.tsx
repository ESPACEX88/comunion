import { PressScale } from '@/components/motion/PressScale';
import { AppText } from '@/components/ui/AppText';
import { radius, space, useTheme } from '@/theme';
import { View } from 'react-native';

type Props = {
  title: string;
  hint: string;
  cta: string;
  done?: boolean;
  onPress: () => void;
};

export function DayActionRow({ title, hint, cta, done, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <PressScale onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${cta}`}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
          backgroundColor: colors.glass,
          borderColor: colors.glassBorder,
          borderWidth: 1,
          borderRadius: radius.xxl,
          paddingVertical: 16,
          paddingHorizontal: 18,
        }}>
        <View style={{ flex: 1 }}>
          <AppText variant="ui">{title}</AppText>
          <AppText variant="caption" tone="soft" style={{ marginTop: 4, letterSpacing: 0 }}>
            {hint}
          </AppText>
        </View>
        <View
          style={{
            backgroundColor: done ? colors.statusDoneBg : colors.glassStrong,
            borderWidth: 1,
            borderColor: done ? colors.statusDoneBg : colors.glassBorder,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: radius.pill,
            minWidth: 64,
            alignItems: 'center',
          }}>
          <AppText variant="ui" style={{ color: done ? colors.statusDoneFg : colors.ink }}>
            {cta}
          </AppText>
        </View>
      </View>
    </PressScale>
  );
}
