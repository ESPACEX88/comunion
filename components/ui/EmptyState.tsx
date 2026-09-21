import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { radius, space, useTheme } from '@/theme';
import { View } from 'react-native';

type Props = {
  kicker?: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ kicker, title, body, actionLabel, onAction }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.md,
        paddingVertical: space.xl,
        paddingHorizontal: space.lg,
        backgroundColor: colors.creamDeep,
        gap: space.sm,
      }}>
      {kicker ? (
        <AppText variant="label" tone="olive">
          {kicker}
        </AppText>
      ) : null}
      <AppText variant="subtitle">{title}</AppText>
      <AppText variant="body" tone="soft">
        {body}
      </AppText>
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="inline" onPress={onAction} />
      ) : null}
    </View>
  );
}
