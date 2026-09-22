import { MissingBibleKeyError } from '@/lib/bible/apiBible';
import type { BiblePassage } from '@/lib/bible/types';
import { useEffect, useState } from 'react';
import { useBible } from './BibleProvider';

export function useBiblePassage(reference?: string | null) {
  const { missingKey, ready, loadRef, bible } = useBible();
  const [passage, setPassage] = useState<BiblePassage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setPassage(null);
      setError(null);
      return;
    }
    if (missingKey) {
      setPassage(null);
      setError('Falta configurar API.Bible');
      return;
    }
    if (!ready) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void loadRef(reference)
      .then((next) => {
        if (!cancelled) setPassage(next);
      })
      .catch((caught) => {
        if (cancelled) return;
        if (caught instanceof MissingBibleKeyError) {
          setError('Falta configurar API.Bible');
        } else if (caught instanceof Error) {
          setError(caught.message);
        } else {
          setError('No se pudo abrir el pasaje.');
        }
        setPassage(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reference, missingKey, ready, loadRef, bible?.id]);

  return { passage, loading, error, missingKey };
}
