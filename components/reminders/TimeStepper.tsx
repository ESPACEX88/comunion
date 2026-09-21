import { AppText } from '@/components/ui/AppText';
import { clampHour, clampMinute, formatClock } from '@/lib/reminders';
import { radius, space, useTheme } from '@/theme';
import { Pressable, View } from 'react-native';

type Props = {
  hour: number;
  minute: number;
  disabled?: boolean;
  onChange: (hour: number, minute: number) => void;
};

export function TimeStepper({ hour, minute, disabled, onChange }: Props) {
  const { colors } = useTheme();
  const step = (part: 'hour' | 'minute', delta: number) => {
    if (disabled) return;
    if (part === 'hour') onChange(clampHour(hour + delta), minute);
    else onChange(hour, clampMinute(minute + delta * 5));
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, opacity: disabled ? 0.45 : 1 }}>
      <StepperButton label="−" onPress={() => step('hour', -1)} disabled={disabled} />
      <View
        style={{
          minWidth: 92,
          paddingVertical: 10,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.paper,
          alignItems: 'center',
        }}>
        <AppText variant="subtitle">{formatClock(hour, minute)}</AppText>
      </View>
      <StepperButton label="+" onPress={() => step('hour', 1)} disabled={disabled} />
      <View style={{ width: 8 }} />
      <StepperButton label="−5" onPress={() => step('minute', -1)} disabled={disabled} />
      <StepperButton label="+5" onPress={() => step('minute', 1)} disabled={disabled} />
    </View>
  );
}

function StepperButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: pressed ? colors.paper : 'transparent',
      })}>
      <AppText variant="ui" tone="amber">
        {label}
      </AppText>
    </Pressable>
  );
}
