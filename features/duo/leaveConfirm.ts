import { Alert, Platform } from 'react-native';

const TITLE = '¿Salir del dúo?';
const BODY =
  'Tu cuenta y tu diario se quedan. El otro queda en el dúo, o se disuelve si no queda nadie. Después podés crear uno nuevo o unirte con un código.';

export function confirmLeaveDuo(run: () => void) {
  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' && window.confirm(`${TITLE}\n\n${BODY}`);
    if (ok) run();
    return;
  }
  Alert.alert(TITLE, BODY, [
    { text: 'Mejor no', style: 'cancel' },
    { text: 'Salir', style: 'destructive', onPress: run },
  ]);
}
