// API client for the ClaimRunner backend (server/).
// Base URL: set REACT_APP_API_URL in a root .env to override (CRA reads it at build time).

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5555';

const TOKEN_KEY = 'claimrunner_token';

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (err) {
    console.error('[api] Failed to read token from localStorage:', err);
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('[api] Failed to write token to localStorage:', err);
  }
}

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (!token) {
      console.error(`[api] ${method} ${path} requires auth but no token is stored`);
      throw new Error('You are not logged in.');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    console.error(`[api] Network error on ${method} ${path}:`, err);
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  if (response.status === 204) return null;

  let json = null;
  try {
    json = await response.json();
  } catch (err) {
    console.error(`[api] Failed to parse JSON from ${method} ${path}:`, err);
  }

  if (!response.ok) {
    const message = json?.error || `Request failed (${response.status})`;
    console.error(`[api] ${method} ${path} → ${response.status}: ${message}`);
    throw new Error(message);
  }

  return json;
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

/** POST /api/auth/signup → { session, plaintiff }. Stores the token. */
export async function signup(name, email, password) {
  try {
    const data = await request('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    });
    if (data?.session?.access_token) setToken(data.session.access_token);
    return data;
  } catch (err) {
    console.error('[api] signup failed:', err);
    throw err;
  }
}

/** POST /api/auth/login → { session, user }. Stores the token. */
export async function login(email, password) {
  try {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (data?.session?.access_token) setToken(data.session.access_token);
    return data;
  } catch (err) {
    console.error('[api] login failed:', err);
    throw err;
  }
}

/** POST /api/auth/logout. Clears the stored token even if the call fails. */
export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST', auth: true });
  } catch (err) {
    console.error('[api] logout failed (clearing token anyway):', err);
  } finally {
    setToken(null);
  }
}

/** GET /api/auth/me → plaintiff profile row. */
export async function getMe() {
  try {
    return await request('/api/auth/me', { auth: true });
  } catch (err) {
    console.error('[api] getMe failed:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Case endpoints
// ---------------------------------------------------------------------------

export const CLAIM_REASONS = [
  'Faulty_Workmanship',
  'Merchandise',
  'Auto_damages',
  'wages',
  'Loan',
  'Return_of_Deposit',
  'Rent',
  'Property_Damage',
  'Other',
];

/** GET /api/cases → the logged-in plaintiff's cases (newest first). */
export async function listCases() {
  try {
    return await request('/api/cases', { auth: true });
  } catch (err) {
    console.error('[api] listCases failed:', err);
    throw err;
  }
}

/** POST /api/cases → created case row. */
export async function createCase(caseData) {
  try {
    return await request('/api/cases', { method: 'POST', body: caseData, auth: true });
  } catch (err) {
    console.error('[api] createCase failed:', err);
    throw err;
  }
}

/** GET /api/cases/:id → case with plaintiff + defendant joined. */
export async function getCase(caseId) {
  try {
    return await request(`/api/cases/${caseId}`);
  } catch (err) {
    console.error(`[api] getCase(${caseId}) failed:`, err);
    throw err;
  }
}

/** PATCH /api/cases/:id → updated case row. Accepts case fields, defendant object, pdf_extra_fields. */
export async function updateCase(caseId, patch) {
  try {
    return await request(`/api/cases/${caseId}`, { method: 'PATCH', body: patch, auth: true });
  } catch (err) {
    console.error(`[api] updateCase(${caseId}) failed:`, err);
    throw err;
  }
}

/** GET /api/case-steps → ordered list of the 7 case steps. */
export async function getCaseSteps() {
  try {
    return await request('/api/case-steps');
  } catch (err) {
    console.error('[api] getCaseSteps failed:', err);
    throw err;
  }
}

/** PATCH /api/cases/:id/step → { case, nextStep }. */
export async function advanceCaseStep(caseId) {
  try {
    return await request(`/api/cases/${caseId}/step`, { method: 'PATCH' });
  } catch (err) {
    console.error(`[api] advanceCaseStep(${caseId}) failed:`, err);
    throw err;
  }
}
