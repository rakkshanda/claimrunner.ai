// API client for the ClaimRunner backend (server/).
const API_BASE =
  process.env.REACT_APP_API_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5555' : '');

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

export async function signup(name, email, password, phone, eligibilityFormId) {
  try {
    const data = await request('/api/auth/signup', {
      method: 'POST',
      body: {
        name,
        email,
        password,
        phone: phone || undefined,
        eligibility_form_id: eligibilityFormId || undefined,
      },
    });
    if (data?.session?.access_token) setToken(data.session.access_token);
    return data;
  } catch (err) {
    console.error('[api] signup failed:', err);
    throw err;
  }
}

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

export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST', auth: true });
  } catch (err) {
    console.error('[api] logout failed (clearing token anyway):', err);
  } finally {
    setToken(null);
  }
}

export async function getMe() {
  try {
    return await request('/api/auth/me', { auth: true });
  } catch (err) {
    console.error('[api] getMe failed:', err);
    throw err;
  }
}

export async function updateMyProfile(patch) {
  try {
    return await request('/api/plaintiffs/me', { method: 'PATCH', body: patch, auth: true });
  } catch (err) {
    console.error('[api] updateMyProfile failed:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Eligibility endpoint
// ---------------------------------------------------------------------------

export async function submitEligibilityForm(answers, eligible) {
  try {
    return await request('/api/eligibility-forms', {
      method: 'POST',
      body: { answers, eligible },
    });
  } catch (err) {
    console.error('[api] submitEligibilityForm failed:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Case endpoints
// ---------------------------------------------------------------------------

export const DIVISIONS = [
  'East Division, Redmond Courthouse, 8601 160th Ave. N.E. Redmond, WA 98052',
  'South Division, Burien Courthouse, 601 SW 149th St. Burien WA 98166',
  'South Division, MRJC Courthouse, 401 4th Ave N., Kent, WA 98032',
  'Vashon Courthouse, 10011 S.W. Bank Road, Vashon 98070',
  'West Division, Seattle Courthouse, 516 3rd Ave, Room E-327 Seattle WA 98104',
  'West Division, Shoreline Courthouse, 18050 Meridian Ave N shoreline WA 98133',
];

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

export async function listCases() {
  try {
    return await request('/api/cases', { auth: true });
  } catch (err) {
    console.error('[api] listCases failed:', err);
    throw err;
  }
}

export async function createCase(caseData) {
  try {
    return await request('/api/cases', { method: 'POST', body: caseData, auth: true });
  } catch (err) {
    console.error('[api] createCase failed:', err);
    throw err;
  }
}

export async function getCase(caseId) {
  try {
    return await request(`/api/cases/${caseId}`);
  } catch (err) {
    console.error(`[api] getCase(${caseId}) failed:`, err);
    throw err;
  }
}

export async function updateCase(caseId, patch) {
  try {
    return await request(`/api/cases/${caseId}`, { method: 'PATCH', body: patch, auth: true });
  } catch (err) {
    console.error(`[api] updateCase(${caseId}) failed:`, err);
    throw err;
  }
}

export async function deleteCase(caseId) {
  try {
    return await request(`/api/cases/${caseId}`, { method: 'DELETE', auth: true });
  } catch (err) {
    console.error(`[api] deleteCase(${caseId}) failed:`, err);
    throw err;
  }
}

export async function getCaseSteps() {
  try {
    return await request('/api/case-steps');
  } catch (err) {
    console.error('[api] getCaseSteps failed:', err);
    throw err;
  }
}

export async function downloadCasePdf(caseId, filename = 'notice-of-small-claim-filled.pdf') {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/cases/${caseId}/fill`, { method: 'POST' });
  } catch (err) {
    console.error(`[api] downloadCasePdf(${caseId}) network error:`, err);
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  if (!response.ok) {
    let message = `PDF generation failed (${response.status})`;
    try {
      const json = await response.json();
      if (json?.error) message = json.error;
    } catch (err) {
      console.error(`[api] downloadCasePdf(${caseId}) failed to parse error body:`, err);
    }
    console.error(`[api] downloadCasePdf(${caseId}) → ${response.status}: ${message}`);
    throw new Error(message);
  }

  try {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(`[api] downloadCasePdf(${caseId}) failed to save file:`, err);
    throw new Error('Failed to download the PDF.');
  }
}

export async function advanceCaseStep(caseId) {
  try {
    return await request(`/api/cases/${caseId}/step`, { method: 'PATCH' });
  } catch (err) {
    console.error(`[api] advanceCaseStep(${caseId}) failed:`, err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Demand Letter endpoints
// ---------------------------------------------------------------------------

export async function getDemandLetterText(caseId) {
  try {
    const data = await request('/api/generate-demand-letter/narrative', {
      method: 'POST',
      body: { case_id: caseId },
      auth: true,
    });
    return data?.narrative ?? '';
  } catch (err) {
    console.error(`[api] getDemandLetterText(${caseId}) failed:`, err);
    throw err;
  }
}

export async function generateDemandLetterPdf(caseId, narrative = null, filename = 'demand-letter.pdf') {
  let response;
  try {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    response = await fetch(`${API_BASE}/api/generate-demand-letter/pdf`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        case_id: caseId,
        ...(narrative ? { narrative } : {}),
      }),
    });
  } catch (err) {
    console.error(`[api] generateDemandLetterPdf(${caseId}) network error:`, err);
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  if (!response.ok) {
    let message = `PDF generation failed (${response.status})`;
    try {
      const json = await response.json();
      if (json?.error) message = json.error;
    } catch (err) {
      console.error(`[api] generateDemandLetterPdf(${caseId}) error parse failed:`, err);
    }
    throw new Error(message);
  }

  try {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(`[api] generateDemandLetterPdf(${caseId}) file save error:`, err);
    throw new Error('Failed to download the demand letter PDF.');
  }
}