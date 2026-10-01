import { AuroraBackground } from '@/components/ui/Aurora';
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
  footer?: ReactNode;
  aurora?: boolean;
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
  refreshing,
  onRefresh,
  footer,
  aurora = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const padding = {
    paddingHorizontal: padded ? 20 : 0,
    paddingTop: space.lg,
    paddingBottom: footer ? 148 : space.xxl,
  };

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
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
            progressBackgroundColor={colors.creamDeep}
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
      {aurora ? <AuroraBackground /> : null}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
        keyboardVerticalOffset={0}>
        {body}
        {footer ? (
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 40,
              paddingBottom: Math.max(insets.bottom, 12),
            }}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}
