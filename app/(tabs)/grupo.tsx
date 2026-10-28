import { Redirect } from 'expo-router';

/** Ruta vieja de la pestaña social: el grupo vive en Grupo. */
export default function GrupoTabRedirect() {
  return <Redirect href="/(tabs)/grupos" />;
}
