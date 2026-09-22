import type { ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

type Props = {
  children: ReactNode;
  delay?: number;
  down?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Enter({ children, delay = 0, down = true, style }: Props) {
  const entering = (down ? FadeInDown : FadeIn)
    .duration(420)
    .delay(delay)
    .springify()
    .damping(24)
    .stiffness(210);
  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
