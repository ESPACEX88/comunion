import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function Toggle({ value, onValueChange, disabled }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={{ opacity: disabled ? 0.45 : 1 }}>
      {value ? (
        <LinearGradient
          colors={[colors.glowFrom, colors.glowTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 50, height: 30, borderRadius: 999, justifyContent: 'center' }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#fff',
              alignSelf: 'flex-end',
              marginRight: 3,
            }}
          />
        </LinearGradient>
      ) : (
        <View
          style={{
            width: 50,
            height: 30,
            borderRadius: 999,
            backgroundColor: colors.line,
            justifyContent: 'center',
          }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: colors.white,
              marginLeft: 3,
            }}
          />
        </View>
      )}
    </Pressable>
  );
}
