import { AppText } from '@/components/ui/AppText';
import { colors, radius } from '@/theme';
import { View } from 'react-native';

const tones = {
  pendiente: { bg: '#EFE3CF', fg: colors.charcoalSoft, label: 'Pendiente' },
  en_curso: { bg: '#F3DEC0', fg: colors.amberDeep, label: 'En curso' },
  completado: { bg: '#E0E6D4', fg: colors.olive, label: 'Completado' },
} as const;

type Props = {
  status: keyof typeof tones;
};

export function StatusBadge({ status }: Props) {
  const tone = tones[status];
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: tone.bg,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.sm,
      }}>
      <AppText variant="label" style={{ color: tone.fg, fontSize: 10 }}>
        {tone.label}
      </AppText>
    </View>
  );
}
