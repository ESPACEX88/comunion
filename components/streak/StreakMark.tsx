import { AppText } from '@/components/ui/AppText';
import { radius, space, useTheme } from '@/theme';
import { View } from 'react-native';

type Props = {
  count: number;
  label: string;
  hint?: string;
  compact?: boolean;
};

export function StreakMark({ count, label, hint, compact }: Props) {
  const { colors } = useTheme();
  const size = compact ? 56 : 72;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius.lg,
          backgroundColor: colors.streakBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            position: 'absolute',
            width: size - 16,
            height: size - 16,
            borderRadius: 32,
            borderWidth: 1,
            borderColor: colors.amberSoft,
            opacity: 0.55,
          }}
        />
        <AppText variant={compact ? 'title' : 'numeral'} style={{ color: colors.amberSoft, fontSize: compact ? 26 : 40 }}>
          {count}
        </AppText>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <AppText variant="label" tone="amber">
          {label}
        </AppText>
        <AppText variant="subtitle">
          {count === 1 ? '1 día seguido' : `${count} días seguidos`}
        </AppText>
        {hint ? (
          <AppText variant="ui" tone="soft">
            {hint}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
