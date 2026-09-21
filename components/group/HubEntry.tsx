import { AppText } from '@/components/ui/AppText';
import { space, useTheme } from '@/theme';
import { Pressable, View } from 'react-native';

type Props = {
  kicker: string;
  title: string;
  hint: string;
  onPress: () => void;
};

export function HubEntry({ kicker, title, hint, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: space.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        opacity: pressed ? 0.7 : 1,
      })}>
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
    </Pressable>
  );
}
