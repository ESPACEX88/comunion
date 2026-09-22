import { EmptyState } from '@/components/ui/EmptyState';

export function MissingBibleKey({ compact = false }: { compact?: boolean }) {
  return (
    <EmptyState
      kicker="API.Bible"
      title="Falta configurar API.Bible"
      body={
        compact
          ? 'Sin la clave no se puede pedir el texto completo. Mientras, queda el extracto del plan.'
          : 'Hace falta EXPO_PUBLIC_API_BIBLE_KEY en el .env o en EAS preview. Después, un update nuevo. La key no va en el repo.'
      }
    />
  );
}
