// Canonical shapes shared across the backend.
// See HANDOFF.md Section 2 (FormData) and Section 4 (DB rows).

export type ClaimReason =
  | 'Faulty_Workmanship'
  | 'Merchandise'
  | 'Auto_damages'
  | 'wages'
  | 'Loan'
  | 'Return_of_Deposit'
  | 'Rent'
  | 'Property_Damage'
  | 'Other';

export const CLAIM_REASONS: ClaimReason[] = [
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

export type Division =
  | ' '
  | 'East Division, Redmond Courthouse, 8601 160th Ave. N.E. Redmond, WA 98052'
  | 'South Division, Burien Courthouse, 601 SW 149th St. Burien WA 98166'
  | 'South Division, MRJC Courthouse, 401 4th Ave N., Kent, WA 98032'
  | 'Vashon Courthouse, 10011 S.W. Bank Road, Vashon 98070'
  | 'West Division, Seattle Courthouse, 516 3rd Ave, Room E-327 Seattle WA 98104'
  | 'West Division, Shoreline Courthouse, 18050 Meridian Ave N shoreline WA 98133';

export interface Party {
  name: string; // required
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
}

export interface Interpreter {
  required: boolean;
  name?: string;
  language?: string;
}

export interface ClaimDetails {
  reasons: ClaimReason[]; // at least one required
  autoDamagesAccidentDate?: string; // required when 'Auto_damages' is in reasons
  otherReasonName?: string; // required when 'Other' is in reasons
  explanation: string; // required
}

export interface ServiceMemberCivilRelief {
  status: 'yes' | 'no' | 'unknown';
  factsIfCovered?: string; // used when status === 'yes'
  reasonIfNotCovered?: string; // used when status === 'no'
}

export interface Signature {
  city: string;
  state: string;
  date: string; // ISO "YYYY-MM-DD"
  plaintiffName: string;
}

export interface FormData {
  clerk?: string;
  division?: Division;
  smallClaimNumber?: string;
  plaintiffs: [Party, Party?]; // 1–2 plaintiffs; first is required
  defendants: [Party, Party?]; // 1–2 defendants; first is required
  interpreterPlaintiff?: Interpreter;
  interpreterDefendant?: Interpreter;
  claimantName?: string;
  claimAmount: string; // dollar string e.g. "3500.00"
  incidentDate: string; // ISO "YYYY-MM-DD"
  claim: ClaimDetails;
  serviceMemberCivilRelief: ServiceMemberCivilRelief;
  signature: Signature;
}

// ---------------------------------------------------------------------------
// Database row shapes
// ---------------------------------------------------------------------------

export interface PlaintiffRow {
  id: string;
  name: string;
  dob: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  auth_user_id: string | null;
  created_at: string;
}

export interface DefendantRow {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface CaseStepRow {
  id: string;
  step_number: number;
  step_name: string;
  pdf_template_id: string | null;
  created_at: string;
}

export interface PdfExtraFields {
  explanation?: string;
  additionalReasons?: ClaimReason[];
  autoDamagesAccidentDate?: string;
  otherReasonName?: string;
  division?: Division;
  clerk?: string;
  smallClaimNumber?: string;
  claimantName?: string;
  interpreterPlaintiff?: Interpreter;
  interpreterDefendant?: Interpreter;
  serviceMemberCivilRelief?: Partial<ServiceMemberCivilRelief>;
  signature?: Partial<Signature>;
}

export interface CaseRow {
  id: string;
  case_number: string | null;
  case_name: string;
  incident_date: string;
  claim_amount: number;
  claim_reason: ClaimReason;
  current_step_id: string | null;
  plaintiff_id: string;
  defendant_id: string | null;
  pdf_extra_fields: PdfExtraFields;
  created_at: string;
}

export interface CaseWithParties extends CaseRow {
  plaintiff: PlaintiffRow | null;
  defendant: DefendantRow | null;
}

// ---------------------------------------------------------------------------
// Auth shapes
// ---------------------------------------------------------------------------

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/** Thrown when input fails validation → HTTP 400. */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/** Thrown when a resource is not found → HTTP 404. */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/** Thrown on Supabase/network failures → HTTP 502. */
export class UpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpstreamError';
  }
}
