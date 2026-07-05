// Server-side wrapper around Supabase Auth's REST endpoints.
// - anon key: /auth/v1/signup, /auth/v1/token, /auth/v1/logout (user-facing)
// - service role key: /auth/v1/user (token validation)
// See HANDOFF.md Section 9.

import { AuthSession, AuthUser, UpstreamError, ValidationError } from '../types.js';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.startsWith('YOUR_') || value.includes('YOUR_PROJECT_REF')) {
    const message = `Missing or placeholder env var ${name}. Set it in server/.env (see .env.example).`;
    console.error(`[auth] ${message}`);
    throw new UpstreamError(message);
  }
  return value;
}

function authBaseUrl(): string {
  return `${getEnv('SUPABASE_URL').replace(/\/+$/, '')}/auth/v1`;
}

interface SupabaseAuthErrorBody {
  msg?: string;
  message?: string;
  error?: string;
  error_description?: string;
}

async function readAuthError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as SupabaseAuthErrorBody;
    return body.msg || body.message || body.error_description || body.error || `HTTP ${response.status}`;
  } catch (err) {
    console.error('[auth] Failed to parse auth error response:', err);
    return `HTTP ${response.status}`;
  }
}

/**
 * Create a Supabase Auth account. Returns the session (flat shape at the top
 * level of the response) and the new auth user's id.
 * Must be called with the ANON key — service role key suppresses the session.
 */
export async function signUp(
  email: string,
  password: string
): Promise<{ session: AuthSession; user: AuthUser }> {
  const anonKey = getEnv('SUPABASE_ANON_KEY');

  let response: Response;
  try {
    response = await fetch(`${authBaseUrl()}/signup`, {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    const message = `Network error calling Supabase Auth signup: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[auth] ${message}`, err);
    throw new UpstreamError(message);
  }

  if (!response.ok) {
    const detail = await readAuthError(response);
    console.error(`[auth] Signup failed (${response.status}): ${detail}`);
    throw new ValidationError(`Signup failed: ${detail}`);
  }

  let body: AuthSession & { user?: { id: string; email: string } };
  try {
    body = (await response.json()) as AuthSession & { user?: { id: string; email: string } };
  } catch (err) {
    const message = 'Failed to parse Supabase Auth signup response';
    console.error(`[auth] ${message}:`, err);
    throw new UpstreamError(message);
  }

  // With email confirmation enabled, Supabase returns a user but no session.
  if (!body.access_token) {
    const message =
      'Signup succeeded but no session was returned. Disable email confirmation under Authentication → Providers → Email in Supabase.';
    console.error(`[auth] ${message}`);
    throw new ValidationError(message);
  }
  if (!body.user?.id) {
    const message = 'Signup response missing user id';
    console.error(`[auth] ${message}`);
    throw new UpstreamError(message);
  }

  return {
    session: {
      access_token: body.access_token,
      refresh_token: body.refresh_token,
      expires_in: body.expires_in,
      token_type: body.token_type,
    },
    user: { id: body.user.id, email: body.user.email },
  };
}

/** Exchange email + password for a session. Uses the ANON key. */
export async function signIn(
  email: string,
  password: string
): Promise<{ session: AuthSession; user: AuthUser } | null> {
  const anonKey = getEnv('SUPABASE_ANON_KEY');

  let response: Response;
  try {
    response = await fetch(`${authBaseUrl()}/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    const message = `Network error calling Supabase Auth login: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[auth] ${message}`, err);
    throw new UpstreamError(message);
  }

  if (response.status === 400 || response.status === 401) {
    const detail = await readAuthError(response);
    console.error(`[auth] Login rejected (${response.status}): ${detail}`);
    return null; // invalid credentials
  }
  if (!response.ok) {
    const detail = await readAuthError(response);
    console.error(`[auth] Login failed (${response.status}): ${detail}`);
    throw new UpstreamError(`Login failed: ${detail}`);
  }

  let body: AuthSession & { user?: { id: string; email: string } };
  try {
    body = (await response.json()) as AuthSession & { user?: { id: string; email: string } };
  } catch (err) {
    const message = 'Failed to parse Supabase Auth login response';
    console.error(`[auth] ${message}:`, err);
    throw new UpstreamError(message);
  }

  if (!body.access_token || !body.user?.id) {
    console.error('[auth] Login response missing access_token or user');
    throw new UpstreamError('Login response missing access_token or user');
  }

  return {
    session: {
      access_token: body.access_token,
      refresh_token: body.refresh_token,
      expires_in: body.expires_in,
      token_type: body.token_type,
    },
    user: { id: body.user.id, email: body.user.email },
  };
}

/** Invalidate a session. Uses the ANON key plus the user's own token. */
export async function signOut(accessToken: string): Promise<void> {
  const anonKey = getEnv('SUPABASE_ANON_KEY');

  let response: Response;
  try {
    response = await fetch(`${authBaseUrl()}/logout`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
    });
  } catch (err) {
    const message = `Network error calling Supabase Auth logout: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[auth] ${message}`, err);
    throw new UpstreamError(message);
  }

  if (!response.ok && response.status !== 401) {
    const detail = await readAuthError(response);
    console.error(`[auth] Logout failed (${response.status}): ${detail}`);
    throw new UpstreamError(`Logout failed: ${detail}`);
  }
}

/**
 * Validate an access token via round-trip to Supabase (GET /auth/v1/user).
 * Returns null for invalid/expired tokens; throws UpstreamError on network failure.
 */
export async function getAuthUser(accessToken: string): Promise<AuthUser | null> {
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  let response: Response;
  try {
    response = await fetch(`${authBaseUrl()}/user`, {
      method: 'GET',
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${accessToken}` },
    });
  } catch (err) {
    const message = `Network error validating token with Supabase Auth: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[auth] ${message}`, err);
    throw new UpstreamError(message);
  }

  if (response.status === 401 || response.status === 403) {
    return null; // invalid or expired token
  }
  if (!response.ok) {
    const detail = await readAuthError(response);
    console.error(`[auth] Token validation failed (${response.status}): ${detail}`);
    throw new UpstreamError(`Token validation failed: ${detail}`);
  }

  try {
    const user = (await response.json()) as { id?: string; email?: string };
    if (!user.id) {
      console.error('[auth] Token validation response missing user id');
      return null;
    }
    return { id: user.id, email: user.email ?? '' };
  } catch (err) {
    const message = 'Failed to parse Supabase Auth user response';
    console.error(`[auth] ${message}:`, err);
    throw new UpstreamError(message);
  }
}
