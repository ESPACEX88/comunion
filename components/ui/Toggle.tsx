import { useTheme } from '@/theme';
import { Switch } from 'react-native';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function Toggle({ value, onValueChange, disabled }: Props) {
  const { colors } = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: colors.line, true: colors.oliveSoft }}
      thumbColor={value ? colors.olive : colors.creamDeep}
      ios_backgroundColor={colors.line}
    />
  );
}
