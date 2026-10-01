import { PressScale } from '@/components/motion/PressScale';
import { AppText } from '@/components/ui/AppText';
import { space, useTheme } from '@/theme';
import { View } from 'react-native';

type Props = {
  kicker: string;
  title: string;
  hint: string;
  onPress: () => void;
  last?: boolean;
};

export function HubEntry({ kicker, title, hint, onPress, last }: Props) {
  const { colors } = useTheme();
  return (
    <PressScale onPress={onPress} accessibilityRole="button">
      <View
        style={{
          paddingVertical: space.md,
          borderBottomWidth: last ? 0 : 1,
          borderBottomColor: colors.line,
        }}>
        <AppText variant="label" tone="amber">
          {kicker}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 }}>
          <AppText variant="subtitle">{title}</AppText>
          <AppText variant="ui" tone="amber">
            →
          </AppText>
        </View>
        <AppText variant="ui" tone="soft" style={{ marginTop: 6 }}>
          {hint}
        </AppText>
      </View>
    </PressScale>
  );
}
