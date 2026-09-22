import { AppText } from '@/components/ui/AppText';
import { radius, space, useTheme } from '@/theme';
import { Pressable, View } from 'react-native';

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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${cta}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        backgroundColor: colors.paper,
        borderColor: colors.line,
        borderWidth: 1,
        borderRadius: radius.lg,
        paddingVertical: 18,
        paddingHorizontal: 18,
        opacity: pressed ? 0.78 : 1,
      })}>
      <View style={{ flex: 1 }}>
        <AppText variant="subtitle">{title}</AppText>
        <AppText variant="ui" tone="soft" style={{ marginTop: 4 }}>
          {hint}
        </AppText>
      </View>
      <View
        style={{
          backgroundColor: done ? colors.statusDoneBg : colors.amber,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 999,
          minWidth: 64,
          alignItems: 'center',
        }}>
        <AppText variant="ui" style={{ color: done ? colors.statusDoneFg : colors.white }}>
          {cta}
        </AppText>
      </View>
    </Pressable>
  );
}
