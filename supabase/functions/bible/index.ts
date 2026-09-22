import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const BASE = 'https://api.scripture.api.bible/v1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bible-key',
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function allowedPath(path: string): boolean {
  if (!path.startsWith('/bibles')) return false;
  if (path.includes('..') || path.includes('//') || path.includes('\\')) return false;
  return /^\/bibles[A-Za-z0-9._:/%-]*$/.test(path);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }
  if (req.method !== 'POST') {
    return json(405, { error: 'method' });
  }

  try {
    const body = (await req.json()) as { path?: unknown; query?: unknown };
    const path = typeof body.path === 'string' ? body.path : '';
    if (!allowedPath(path)) {
      return json(400, { error: 'path' });
    }

    const key =
      Deno.env.get('API_BIBLE_KEY')?.trim() ||
      req.headers.get('x-bible-key')?.trim() ||
      '';
    if (!key) {
      return json(503, { error: 'missing-key' });
    }

    const url = new URL(`${BASE}${path}`);
    if (body.query && typeof body.query === 'object' && body.query !== null) {
      for (const [name, value] of Object.entries(body.query as Record<string, unknown>)) {
        if (typeof value === 'string' && value) url.searchParams.set(name, value);
      }
    }

    const upstream = await fetch(url.toString(), {
      headers: {
        accept: 'application/json',
        'api-key': key,
      },
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch {
    return json(502, { error: 'upstream' });
  }
});
