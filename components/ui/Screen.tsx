import { colors, space } from '@/theme';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, scroll = true, padded = true, style }: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingHorizontal: padded ? space.lg : 0,
    paddingTop: space.md,
    paddingBottom: space.xxl,
  };

  if (scroll) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.cream, paddingTop: insets.top }, style]}>
        <ScrollView
          contentContainerStyle={padding}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.cream, paddingTop: insets.top },
        padded ? padding : null,
        style,
      ]}>
      {children}
    </View>
  );
}
