import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const springIn = { damping: 22, stiffness: 420, mass: 0.4 };
const springOut = { damping: 18, stiffness: 280, mass: 0.45 };

export function PressScale({ children, style, disabled, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animated, style]}>
      <Pressable
        disabled={disabled}
        onPressIn={(event) => {
          if (!disabled) scale.value = withSpring(0.975, springIn);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          scale.value = withSpring(1, springOut);
          onPressOut?.(event);
        }}
        {...rest}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
