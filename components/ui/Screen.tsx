import { space, useTheme } from '@/theme';
import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Barra fija al pie (queda fuera del ScrollView: teclado y versículo). */
  footer?: ReactNode;
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
  refreshing,
  onRefresh,
  footer,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const padding = {
    paddingHorizontal: padded ? space.lg : 0,
    paddingTop: space.lg,
    paddingBottom: footer ? space.lg : space.xxl,
  };

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[padding, { flexGrow: 1 }]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      automaticallyAdjustKeyboardInsets
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
  ) : (
    <View style={[{ flex: 1 }, padded ? padding : null]}>{children}</View>
  );

  return (
    <View style={[{ flex: 1, backgroundColor: colors.cream, paddingTop: insets.top }, style]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
        keyboardVerticalOffset={0}>
        {body}
        {footer ? (
          <View
            style={{
              paddingBottom: Math.max(insets.bottom, 10),
              backgroundColor: colors.cream,
            }}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}
