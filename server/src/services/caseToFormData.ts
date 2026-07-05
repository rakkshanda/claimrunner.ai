// Bridge between the database and the PDF filler.
// Reconstructs FormData from a case row joined with its parties.
// See HANDOFF.md Section 5.

import {
  CaseWithParties,
  ClaimReason,
  FormData,
  Party,
  PdfExtraFields,
  ValidationError,
} from '../types.js';

function toParty(row: {
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
}): Party {
  return {
    name: row.name,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    zip: row.zip ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
  };
}

export function buildFormDataFromCase(caseRow: CaseWithParties): FormData {
  try {
    const extra: PdfExtraFields = caseRow.pdf_extra_fields ?? {};

    // Pre-fill validation → HTTP 400
    if (!caseRow.plaintiff) {
      throw new ValidationError('Case has no plaintiff — cannot generate PDF');
    }
    if (!caseRow.defendant) {
      throw new ValidationError('Case has no defendant — cannot generate PDF');
    }
    if (!extra.explanation?.trim()) {
      throw new ValidationError('pdf_extra_fields.explanation is required to generate the PDF');
    }
    if (!extra.serviceMemberCivilRelief?.status) {
      throw new ValidationError('pdf_extra_fields.serviceMemberCivilRelief.status is required to generate the PDF');
    }
    const sig = extra.signature;
    if (!sig?.city || !sig?.state || !sig?.date || !sig?.plaintiffName) {
      throw new ValidationError(
        'pdf_extra_fields.signature must include city, state, date, and plaintiffName to generate the PDF'
      );
    }

    const reasons: ClaimReason[] = [caseRow.claim_reason, ...(extra.additionalReasons ?? [])];

    return {
      clerk: extra.clerk,
      division: extra.division,
      smallClaimNumber: extra.smallClaimNumber ?? caseRow.case_number ?? undefined,
      plaintiffs: [toParty(caseRow.plaintiff)],
      defendants: [toParty(caseRow.defendant)],
      interpreterPlaintiff: extra.interpreterPlaintiff,
      interpreterDefendant: extra.interpreterDefendant,
      claimantName: extra.claimantName,
      claimAmount: Number(caseRow.claim_amount).toFixed(2),
      incidentDate: caseRow.incident_date,
      claim: {
        reasons,
        autoDamagesAccidentDate: extra.autoDamagesAccidentDate,
        otherReasonName: extra.otherReasonName,
        explanation: extra.explanation,
      },
      serviceMemberCivilRelief: {
        status: extra.serviceMemberCivilRelief.status,
        factsIfCovered: extra.serviceMemberCivilRelief.factsIfCovered,
        reasonIfNotCovered: extra.serviceMemberCivilRelief.reasonIfNotCovered,
      },
      signature: {
        city: sig.city,
        state: sig.state,
        date: sig.date,
        plaintiffName: sig.plaintiffName,
      },
    };
  } catch (err) {
    console.error(`[caseToFormData] buildFormDataFromCase failed for case ${caseRow?.id}:`, err);
    throw err;
  }
}
