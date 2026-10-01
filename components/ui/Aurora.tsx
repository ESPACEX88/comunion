import { useTheme } from '@/theme';
import { View } from 'react-native';

/** Cielo Aurora: blobs ámbar y un violeta suave. */
export function AuroraBackground() {
  const { colors } = useTheme();
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' }}>
      <View
        style={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: colors.blobAmber,
          top: -70,
          right: -80,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: colors.blobViolet,
          bottom: 160,
          left: -90,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 200,
          height: 160,
          borderRadius: 100,
          backgroundColor: colors.glowFrom,
          bottom: -30,
          alignSelf: 'center',
          left: '22%',
          opacity: 0.22,
        }}
      />
    </View>
  );
}
