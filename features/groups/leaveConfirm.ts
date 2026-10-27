import { Alert, Platform } from 'react-native';

export function confirmLeaveGroup(run: () => void) {
  const title = '¿Salir del grupo?';
  const body =
    'Tu dúo y tu diario se quedan. El grupo sigue con los demás. Si eras quien lo cuidaba, pasa a la persona que lleva más tiempo.';
  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' && window.confirm(`${title}\n\n${body}`);
    if (ok) run();
    return;
  }
  Alert.alert(title, body, [
    { text: 'Mejor no', style: 'cancel' },
    { text: 'Salir', style: 'destructive', onPress: run },
  ]);
}

export function confirmRemoveMember(name: string, run: () => void) {
  const title = `¿Sacar a ${name}?`;
  const body = 'Puede volver a entrar con el código, si todavía vale.';
  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' && window.confirm(`${title}\n\n${body}`);
    if (ok) run();
    return;
  }
  Alert.alert(title, body, [
    { text: 'Mejor no', style: 'cancel' },
    { text: 'Sacar', style: 'destructive', onPress: run },
  ]);
}
