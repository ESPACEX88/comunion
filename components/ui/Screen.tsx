import { colors, space } from '@/theme';
import { RefreshControl, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
  refreshing,
  onRefresh,
}: Props) {
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
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={Boolean(refreshing)}
                onRefresh={onRefresh}
                tintColor={colors.amber}
                colors={[colors.amber]}
                progressBackgroundColor={colors.paper}
              />
            ) : undefined
          }>
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
