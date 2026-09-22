import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { BIBLE_RETRY_COPY, BibleApiError, MissingBibleKeyError } from './errors';

const BASE = 'https://api.scripture.api.bible/v1';

type Envelope<T> = { data: T };

function clientKey(): string {
  return (process.env.EXPO_PUBLIC_API_BIBLE_KEY ?? '').trim();
}

function xhrGet(url: string, headers: Record<string, string>): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve({ status: xhr.status, body: String(xhr.responseText ?? '') });
    xhr.onerror = () => reject(new Error(BIBLE_RETRY_COPY));
    xhr.ontimeout = () => reject(new Error(BIBLE_RETRY_COPY));
    xhr.open('GET', url);
    xhr.timeout = 20000;
    Object.entries(headers).forEach(([name, value]) => {
      xhr.setRequestHeader(name, value);
    });
    xhr.send();
  });
}

function unwrap<T>(raw: string, status: number): T {
  if (status === 401 || status === 403) {
    throw new BibleApiError('La clave de API.Bible no alcanzó. Revisá EXPO_PUBLIC_API_BIBLE_KEY.', status);
  }
  if (status < 200 || status >= 300) {
    throw new BibleApiError(`API.Bible respondió ${status}.`, status);
  }
  let parsed: Envelope<T>;
  try {
    parsed = JSON.parse(raw) as Envelope<T>;
  } catch {
    throw new BibleApiError(BIBLE_RETRY_COPY);
  }
  if (parsed && parsed.data !== undefined) {
    return parsed.data;
  }
  throw new BibleApiError(BIBLE_RETRY_COPY);
}

async function viaEdgeFunction<T>(path: string, query?: Record<string, string>): Promise<T> {
  const supabase = getSupabase();
  const headers: Record<string, string> = {};
  const key = clientKey();
  if (key) headers['x-bible-key'] = key;
  const { data, error } = await supabase.functions.invoke('bible', {
    body: { path, query: query ?? {} },
    headers,
  });
  if (error) {
    throw new BibleApiError(BIBLE_RETRY_COPY);
  }
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as Envelope<T>).data;
  }
  throw new BibleApiError(BIBLE_RETRY_COPY);
}

async function viaDirectXhr<T>(path: string, query?: Record<string, string>): Promise<T> {
  const key = clientKey();
  if (!key) throw new MissingBibleKeyError();
  const url = new URL(`${BASE}${path}`);
  if (query) {
    Object.entries(query).forEach(([name, value]) => {
      if (value) url.searchParams.set(name, value);
    });
  }
  const response = await xhrGet(url.toString(), {
    accept: 'application/json',
    'api-key': key,
  });
  return unwrap<T>(response.body, response.status);
}

/** Evita el fetch nativo de Expo (TLS en iOS). Primero el proxy de Supabase. */
export async function bibleGetJson<T>(path: string, query?: Record<string, string>): Promise<T> {
  if (isSupabaseConfigured()) {
    try {
      return await viaEdgeFunction<T>(path, query);
    } catch (caught) {
      if (!clientKey()) throw caught;
    }
  }
  return viaDirectXhr<T>(path, query);
}
