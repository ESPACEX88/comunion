export class MissingBibleKeyError extends Error {
  constructor() {
    super('Falta configurar API.Bible');
    this.name = 'MissingBibleKeyError';
  }
}

export class BibleApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'BibleApiError';
  }
}

const RAW_NETWORK =
  /tls|secure connection|unexpectedexception|expomodulescore|promise\.swift|fetch failed|network request failed|failed to fetch|networkerror|load failed/i;

export const BIBLE_RETRY_COPY = 'No se pudo cargar el texto. Tocá para reintentar.';

export function friendlyBibleLoadError(error: unknown): string {
  if (error instanceof MissingBibleKeyError) {
    return 'Falta configurar API.Bible';
  }
  if (error instanceof BibleApiError) {
    return error.message;
  }
  const raw = error instanceof Error ? error.message : String(error ?? '');
  if (!raw) return BIBLE_RETRY_COPY;
  if (RAW_NETWORK.test(raw) || /exception|at expo|swift:/i.test(raw)) {
    return BIBLE_RETRY_COPY;
  }
  if (raw.length > 90) return BIBLE_RETRY_COPY;
  return raw;
}
