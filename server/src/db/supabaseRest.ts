// Thin wrapper around Supabase's PostgREST API using Node 22's built-in fetch.
// No third-party SDK. See HANDOFF.md Section 6.

import { UpstreamError } from '../types.js';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface SupabaseRequestOptions {
  method: HttpMethod;
  table: string;
  query?: Record<string, string>;
  body?: unknown;
  /** Adds `Prefer: return=representation` so POST/PATCH return the row. */
  returnRepresentation?: boolean;
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.startsWith('YOUR_') || value.includes('YOUR_PROJECT_REF')) {
    const message = `Missing or placeholder env var ${name}. Set it in server/.env (see .env.example).`;
    console.error(`[supabaseRest] ${message}`);
    throw new UpstreamError(message);
  }
  return value;
}

export async function supabaseRest<T>(options: SupabaseRequestOptions): Promise<T> {
  const { method, table, query, body, returnRepresentation } = options;

  const baseUrl = getEnv('SUPABASE_URL').replace(/\/+$/, '');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  const url = new URL(`${baseUrl}/rest/v1/${table}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };
  if (returnRepresentation) {
    headers.Prefer = 'return=representation';
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    const message = `Network error calling Supabase (${table}): ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[supabaseRest] ${message}`, err);
    throw new UpstreamError(message);
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const errorJson = (await response.json()) as {
        message?: string;
        hint?: string;
        details?: string;
      };
      detail = errorJson.message || errorJson.hint || errorJson.details || detail;
    } catch (parseErr) {
      console.error(`[supabaseRest] Failed to parse error response from ${table}:`, parseErr);
    }
    const message = `[${table}] ${detail}`;
    console.error(`[supabaseRest] PostgREST error (${response.status}): ${message}`);
    throw new UpstreamError(message);
  }

  // DELETE / some PATCH responses may have no body
  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch (err) {
    const message = `Failed to parse Supabase response for ${table}: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[supabaseRest] ${message}`, err);
    throw new UpstreamError(message);
  }
}
