import { HeartMural } from '@/components/duo/HeartMural';
import { AppText } from '@/components/ui/AppText';
import { BackLink } from '@/components/ui/BackLink';
import { Ornament } from '@/components/ui/Ornament';
import { Screen } from '@/components/ui/Screen';
import { useAppState } from '@/features/app-state/AppStateProvider';
import { useDuoSyncControls } from '@/features/app-state/useDuoSync';
import { space } from '@/theme';

export default function MuralScreen() {
  const { heartVerses, members, selfId } = useAppState();
  const { refreshing, onRefresh } = useDuoSyncControls();

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <BackLink label="Nosotros" />
      <AppText variant="label" tone="olive" style={{ marginTop: space.lg }}>
        Mural del corazón
      </AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        Lo que se quedó.
      </AppText>
      <AppText variant="body" tone="soft" style={{ marginTop: space.sm }}>
        No es el hilo de la mesa. Es la pared chiquita de las dos: un versículo y por qué se pegó.
        Se guarda al terminar la lectura.
      </AppText>
      <Ornament />
      <HeartMural verses={heartVerses} members={members} selfId={selfId} />
    </Screen>
  );
}
