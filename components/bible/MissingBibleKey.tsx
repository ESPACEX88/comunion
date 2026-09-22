import { EmptyState } from '@/components/ui/EmptyState';

export function MissingBibleKey({ compact = false }: { compact?: boolean }) {
  return (
    <EmptyState
      kicker="API.Bible"
      title="Falta configurar API.Bible"
      body={
        compact
          ? 'Sin la clave no se puede pedir el texto completo. Mientras, queda el extracto del plan.'
          : 'José: en scripture.api.bible creá la app Comunión, copiá la key y poné EXPO_PUBLIC_API_BIBLE_KEY en el .env local y en EAS environment preview. Después republicá el update. No va en el repo.'
      }
    />
  );
}
