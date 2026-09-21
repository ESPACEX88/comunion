import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Camino perdido', headerShown: true }} />
      <Screen>
        <AppText variant="label" tone="amber">
          404
        </AppText>
        <AppText variant="title" style={{ marginTop: 8 }}>
          Esta página no está en el mapa.
        </AppText>
        <AppText variant="body" tone="soft" style={{ marginTop: 12, marginBottom: 24 }}>
          Quizá el enlace quedó viejo. Volvé a Hoy y seguí desde la mesa.
        </AppText>
        <Link href="/" asChild>
          <Button label="Volver al inicio" />
        </Link>
      </Screen>
    </>
  );
}
