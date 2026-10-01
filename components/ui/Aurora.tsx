import { useTheme } from '@/theme';
import { Platform, View, type ViewStyle } from 'react-native';

function blobStyle(extra: ViewStyle): ViewStyle {
  return {
    position: 'absolute',
    ...extra,
    ...(Platform.OS === 'web' ? ({ filter: 'blur(48px)' } as ViewStyle) : null),
  };
}

/** Cielo Aurora: blobs ámbar y un violeta suave. */
export function AuroraBackground() {
  const { colors } = useTheme();
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' }}>
      <View
        style={blobStyle({
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: colors.blobAmber,
          top: -70,
          right: -80,
        })}
      />
      <View
        style={blobStyle({
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: colors.blobViolet,
          bottom: 160,
          left: -90,
        })}
      />
      <View
        style={blobStyle({
          width: 200,
          height: 160,
          borderRadius: 100,
          backgroundColor: colors.glowFrom,
          bottom: -30,
          left: '22%',
          opacity: 0.35,
        })}
      />
    </View>
  );
}
