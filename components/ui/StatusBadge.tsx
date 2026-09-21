import { AppText } from '@/components/ui/AppText';
import { radius, useTheme } from '@/theme';
import { View } from 'react-native';

const labels = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  completado: 'Completado',
} as const;

type Props = {
  status: keyof typeof labels;
};

export function StatusBadge({ status }: Props) {
  const { colors } = useTheme();
  const tones = {
    pendiente: { bg: colors.statusPendienteBg, fg: colors.statusPendienteFg },
    en_curso: { bg: colors.statusCursoBg, fg: colors.statusCursoFg },
    completado: { bg: colors.statusDoneBg, fg: colors.statusDoneFg },
  };
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
        {labels[status]}
      </AppText>
    </View>
  );
}
