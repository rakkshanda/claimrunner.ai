// Typed query helpers over the Supabase PostgREST wrapper.

import { supabaseRest } from './supabaseRest.js';
import {
  CaseRow,
  CaseStepRow,
  CaseWithParties,
  DefendantRow,
  NotFoundError,
  PlaintiffRow,
} from '../types.js';

// ---------------------------------------------------------------------------
// Plaintiffs
// ---------------------------------------------------------------------------

export async function createPlaintiff(input: {
  name: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  auth_user_id?: string;
}): Promise<PlaintiffRow> {
  try {
    const rows = await supabaseRest<PlaintiffRow[]>({
      method: 'POST',
      table: 'plaintiffs',
      body: input,
      returnRepresentation: true,
    });
    if (!rows?.[0]) {
      throw new Error('Insert returned no row');
    }
    return rows[0];
  } catch (err) {
    console.error('[queries] createPlaintiff failed:', err);
    throw err;
  }
}

export async function getPlaintiffByAuthUserId(authUserId: string): Promise<PlaintiffRow | null> {
  try {
    const rows = await supabaseRest<PlaintiffRow[]>({
      method: 'GET',
      table: 'plaintiffs',
      query: { auth_user_id: `eq.${authUserId}`, limit: '1' },
    });
    return rows?.[0] ?? null;
  } catch (err) {
    console.error(`[queries] getPlaintiffByAuthUserId(${authUserId}) failed:`, err);
    throw err;
  }
}

export async function updatePlaintiff(
  plaintiffId: string,
  patch: Partial<Omit<PlaintiffRow, 'id' | 'auth_user_id' | 'created_at'>>
): Promise<PlaintiffRow> {
  try {
    const rows = await supabaseRest<PlaintiffRow[]>({
      method: 'PATCH',
      table: 'plaintiffs',
      query: { id: `eq.${plaintiffId}` },
      body: patch,
      returnRepresentation: true,
    });
    const row = rows?.[0];
    if (!row) {
      throw new NotFoundError(`Plaintiff not found: ${plaintiffId}`);
    }
    return row;
  } catch (err) {
    console.error(`[queries] updatePlaintiff(${plaintiffId}) failed:`, err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Defendants
// ---------------------------------------------------------------------------

export async function createDefendant(input: {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
}): Promise<DefendantRow> {
  try {
    const rows = await supabaseRest<DefendantRow[]>({
      method: 'POST',
      table: 'defendants',
      body: input,
      returnRepresentation: true,
    });
    if (!rows?.[0]) {
      throw new Error('Insert returned no row');
    }
    return rows[0];
  } catch (err) {
    console.error('[queries] createDefendant failed:', err);
    throw err;
  }
}

export async function updateDefendant(
  defendantId: string,
  patch: Partial<Omit<DefendantRow, 'id' | 'created_at'>>
): Promise<DefendantRow> {
  try {
    const rows = await supabaseRest<DefendantRow[]>({
      method: 'PATCH',
      table: 'defendants',
      query: { id: `eq.${defendantId}` },
      body: patch,
      returnRepresentation: true,
    });
    const row = rows?.[0];
    if (!row) {
      throw new NotFoundError(`Defendant not found: ${defendantId}`);
    }
    return row;
  } catch (err) {
    console.error(`[queries] updateDefendant(${defendantId}) failed:`, err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Case steps
// ---------------------------------------------------------------------------

export async function getAllCaseSteps(): Promise<CaseStepRow[]> {
  try {
    const rows = await supabaseRest<CaseStepRow[]>({
      method: 'GET',
      table: 'case_steps',
      query: { order: 'step_number.asc' },
    });
    return rows ?? [];
  } catch (err) {
    console.error('[queries] getAllCaseSteps failed:', err);
    throw err;
  }
}

export async function getFirstCaseStep(): Promise<CaseStepRow | null> {
  try {
    const rows = await supabaseRest<CaseStepRow[]>({
      method: 'GET',
      table: 'case_steps',
      query: { order: 'step_number.asc', limit: '1' },
    });
    return rows?.[0] ?? null;
  } catch (err) {
    console.error('[queries] getFirstCaseStep failed:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

export async function createCase(input: {
  case_name: string;
  incident_date: string;
  claim_amount: number;
  claim_reason: string;
  plaintiff_id: string;
  defendant_id?: string;
  case_number?: string;
  current_step_id?: string;
  pdf_extra_fields?: Record<string, unknown>;
}): Promise<CaseRow> {
  try {
    const rows = await supabaseRest<CaseRow[]>({
      method: 'POST',
      table: 'cases',
      body: input,
      returnRepresentation: true,
    });
    if (!rows?.[0]) {
      throw new Error('Insert returned no row');
    }
    return rows[0];
  } catch (err) {
    console.error('[queries] createCase failed:', err);
    throw err;
  }
}

/** All cases belonging to a plaintiff, newest first, with defendant + step joined. */
export async function listCasesByPlaintiff(plaintiffId: string): Promise<CaseWithParties[]> {
  try {
    const rows = await supabaseRest<CaseWithParties[]>({
      method: 'GET',
      table: 'cases',
      query: {
        plaintiff_id: `eq.${plaintiffId}`,
        select: '*,defendant:defendant_id(*),current_step:current_step_id(*)',
        order: 'created_at.desc',
      },
    });
    return rows ?? [];
  } catch (err) {
    console.error(`[queries] listCasesByPlaintiff(${plaintiffId}) failed:`, err);
    throw err;
  }
}

/** Fetch a case joined with its plaintiff and defendant rows. */
export async function getCaseWithParties(caseId: string): Promise<CaseWithParties> {
  try {
    const rows = await supabaseRest<CaseWithParties[]>({
      method: 'GET',
      table: 'cases',
      query: {
        id: `eq.${caseId}`,
        select: '*,plaintiff:plaintiff_id(*),defendant:defendant_id(*)',
        limit: '1',
      },
    });
    const row = rows?.[0];
    if (!row) {
      throw new NotFoundError(`Case not found: ${caseId}`);
    }
    return row;
  } catch (err) {
    console.error(`[queries] getCaseWithParties(${caseId}) failed:`, err);
    throw err;
  }
}

export async function updateCase(
  caseId: string,
  patch: Partial<
    Pick<
      CaseRow,
      | 'case_number'
      | 'case_name'
      | 'incident_date'
      | 'claim_amount'
      | 'claim_reason'
      | 'current_step_id'
      | 'defendant_id'
      | 'pdf_extra_fields'
    >
  >
): Promise<CaseRow> {
  try {
    const rows = await supabaseRest<CaseRow[]>({
      method: 'PATCH',
      table: 'cases',
      query: { id: `eq.${caseId}` },
      body: patch,
      returnRepresentation: true,
    });
    const row = rows?.[0];
    if (!row) {
      throw new NotFoundError(`Case not found: ${caseId}`);
    }
    return row;
  } catch (err) {
    console.error(`[queries] updateCase(${caseId}) failed:`, err);
    throw err;
  }
}
