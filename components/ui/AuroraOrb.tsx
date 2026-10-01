import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';

export function AuroraOrb() {
  return (
    <LinearGradient
      colors={['#FBBF24', '#A855F7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 120,
        height: 120,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#A855F7',
        shadowOpacity: 0.4,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 16 },
      }}>
      <AppText variant="display" style={{ color: '#FFFCF6', fontSize: 42, lineHeight: 48 }}>
        ✦
      </AppText>
    </LinearGradient>
  );
}
