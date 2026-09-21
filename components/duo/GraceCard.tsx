import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { GraceOffer } from '@/lib/streaks';
import { space } from '@/theme';

type Props = {
  offer: GraceOffer;
  friendName: string;
  onUseGrace: () => void;
};

export function GraceCard({ offer, friendName, onUseGrace }: Props) {
  if (offer.kind === 'none') return null;

  if (offer.kind === 'offer') {
    return (
      <Card accent="olive">
        <AppText variant="label" tone="olive">
          Un día de gracia
        </AppText>
        <AppText variant="subtitle" style={{ marginTop: 6 }}>
          Ayer se quedó. No pasa nada.
        </AppText>
        <AppText variant="body" tone="soft" style={{ marginTop: 8 }}>
          Esta semana tenés un día de gracia: no cuenta como lectura (el pasaje sigue esperando),
          pero la racha no se rompe. Hoy, si terminás el texto, seguís de a dos con {friendName}.
        </AppText>
        <Button label="Usar el día de gracia" variant="olive" style={{ marginTop: space.md }} onPress={onUseGrace} />
      </Card>
    );
  }

  return (
    <Card accent="none">
      <AppText variant="label" tone="amber">
        Retomar juntos
      </AppText>
      <AppText variant="subtitle" style={{ marginTop: 6 }}>
        Esta semana ya usaron la gracia. Está bien.
      </AppText>
      <AppText variant="body" tone="soft" style={{ marginTop: 8 }}>
        No hay que recuperar el hueco. Cuando termines la lectura de hoy, la racha empieza de nuevo
        en 1 —sin culpa, con {friendName} al lado.
      </AppText>
    </Card>
  );
}
