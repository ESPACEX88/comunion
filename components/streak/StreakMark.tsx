import { AppText } from '@/components/ui/AppText';
import { colors, radius, space } from '@/theme';
import { View } from 'react-native';

type Props = {
  count: number;
  label: string;
  hint?: string;
  compact?: boolean;
};

export function StreakMark({ count, label, hint, compact }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <View
        style={{
          width: compact ? 64 : 84,
          height: compact ? 64 : 84,
          borderRadius: radius.lg,
          backgroundColor: colors.charcoal,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            position: 'absolute',
            width: compact ? 48 : 64,
            height: compact ? 48 : 64,
            borderRadius: 32,
            borderWidth: 1,
            borderColor: colors.amberSoft,
            opacity: 0.7,
          }}
        />
        <AppText variant={compact ? 'title' : 'numeral'} style={{ color: colors.amberSoft }}>
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
