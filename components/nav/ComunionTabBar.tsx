import { PressScale } from '@/components/motion/PressScale';
import { TabMark } from '@/components/nav/TabMark';
import { AppText } from '@/components/ui/AppText';
import { fonts, radius, useTheme } from '@/theme';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const spring = { damping: 18, stiffness: 210, mass: 0.7 };

type TabRoute = { key: string; name: string; params?: object };
type Props = {
  state: { index: number; routes: TabRoute[] };
  descriptors: Record<string, { options: { tabBarLabel?: unknown; title?: string } }>;
  navigation: {
    emit: (event: {
      type: 'tabPress';
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
};

export function ComunionTabBar({ state, descriptors, navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(state.index);
  const count = state.routes.length;
  const pillWidth = count > 0 && trackWidth > 0 ? trackWidth / count : 0;

  useEffect(() => {
    progress.value = withSpring(state.index, spring);
  }, [progress, state.index]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * pillWidth }],
    width: pillWidth,
  }));

  return (
    <View style={{ backgroundColor: 'transparent', paddingTop: 6 }}>
      <View
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width - 12)}
        style={{
          marginHorizontal: 16,
          marginBottom: Math.max(insets.bottom, 10),
          backgroundColor: colors.tabBar,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 6,
          height: 64,
        }}>
        {pillWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: 6,
                bottom: 6,
                left: 6,
                borderRadius: radius.pill,
                backgroundColor: colors.tabOnBg,
                shadowColor: '#fff',
                shadowOpacity: 0.25,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
              },
              pillStyle,
            ]}
          />
        ) : null}
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;
          const kind =
            route.name === 'index'
              ? 'hoy'
              : route.name === 'grupo'
                ? 'grupo'
                : route.name === 'planes'
                  ? 'planes'
                  : 'yo';

          return (
            <PressScale
              key={route.key}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              style={{ flex: 1, zIndex: 1 }}>
              <View style={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <TabMark kind={kind} focused={focused} onLight={focused} />
                <AppText
                  variant="caption"
                  style={{
                    fontFamily: fonts.ui,
                    fontSize: 10,
                    letterSpacing: 0.4,
                    textTransform: 'none',
                    color: focused ? colors.tabOnFg : colors.tabInactive,
                  }}>
                  {label}
                </AppText>
              </View>
            </PressScale>
          );
        })}
      </View>
    </View>
  );
}
