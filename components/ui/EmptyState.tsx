import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { colors, radius, space } from '@/theme';
import { View } from 'react-native';

type Props = {
  kicker?: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ kicker, title, body, actionLabel, onAction }: Props) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.md,
        padding: space.lg,
        backgroundColor: colors.creamDeep,
        gap: space.sm,
      }}>
      <View
        style={{
          width: 36,
          height: 4,
          backgroundColor: colors.oliveSoft,
          borderRadius: 2,
          marginBottom: 4,
        }}
      />
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
