// Fills the Notice of Small Claim PDF template using pdf-lib.
// Field mapping per HANDOFF.md Section 3 — note the two intentional typos in
// the PDF field names: `defedant_State_1` and `reason_Explaination`.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, PDFForm } from 'pdf-lib';
import { FormData, Party, ValidationError } from './types.js';

const DEFAULT_TEMPLATE_PATH = './templates/notice-of-small-claim-september-2025.pdf';

export function validateFormData(formData: FormData): void {
  const errors: string[] = [];

  if (!formData.plaintiffs?.[0] || !formData.plaintiffs[0].name?.trim()) {
    errors.push('plaintiffs[0].name is required');
  }
  if (!formData.defendants?.[0] || !formData.defendants[0].name?.trim()) {
    errors.push('defendants[0].name is required');
  }
  if (!formData.claimAmount?.trim()) {
    errors.push('claimAmount is required');
  }
  if (!formData.incidentDate?.trim()) {
    errors.push('incidentDate is required');
  }
  if (!formData.claim?.reasons || formData.claim.reasons.length === 0) {
    errors.push('claim.reasons must contain at least one reason');
  }
  if (!formData.claim?.explanation?.trim()) {
    errors.push('claim.explanation is required');
  }
  const status = formData.serviceMemberCivilRelief?.status;
  if (!status || !['yes', 'no', 'unknown'].includes(status)) {
    errors.push("serviceMemberCivilRelief.status must be 'yes', 'no', or 'unknown'");
  }
  if (!formData.signature?.city?.trim()) errors.push('signature.city is required');
  if (!formData.signature?.state?.trim()) errors.push('signature.state is required');
  if (!formData.signature?.date?.trim()) errors.push('signature.date is required');
  if (!formData.signature?.plaintiffName?.trim()) errors.push('signature.plaintiffName is required');

  if (errors.length > 0) {
    const message = `FormData validation failed: ${errors.join('; ')}`;
    console.error(`[fillPdf] ${message}`);
    throw new ValidationError(message);
  }
}

/** Set a text field, ignoring missing fields but logging them for debugging. */
function setText(form: PDFForm, fieldName: string, value: string | undefined): void {
  if (value === undefined || value === null || value === '') return;
  try {
    form.getTextField(fieldName).setText(String(value));
  } catch (err) {
    console.error(`[fillPdf] Failed to set text field "${fieldName}":`, err);
    throw new Error(`Failed to set PDF text field "${fieldName}": ${err instanceof Error ? err.message : String(err)}`);
  }
}

function setCheckBox(form: PDFForm, fieldName: string, checked: boolean): void {
  if (!checked) return;
  try {
    form.getCheckBox(fieldName).check();
  } catch (err) {
    console.error(`[fillPdf] Failed to check box "${fieldName}":`, err);
    throw new Error(`Failed to check PDF checkbox "${fieldName}": ${err instanceof Error ? err.message : String(err)}`);
  }
}

function setDropdown(form: PDFForm, fieldName: string, value: string | undefined): void {
  if (value === undefined || value === null || value === '') return;
  try {
    form.getDropdown(fieldName).select(value);
  } catch (err) {
    console.error(`[fillPdf] Failed to select dropdown "${fieldName}" value "${value}":`, err);
    throw new Error(`Failed to set PDF dropdown "${fieldName}": ${err instanceof Error ? err.message : String(err)}`);
  }
}

function fillParty(
  form: PDFForm,
  party: Party | undefined,
  fields: { name: string; address: string; city: string; state: string; zip: string; phone: string; email: string }
): void {
  if (!party) return;
  setText(form, fields.name, party.name);
  setText(form, fields.address, party.address);
  setText(form, fields.city, party.city);
  setText(form, fields.state, party.state);
  setText(form, fields.zip, party.zip);
  setText(form, fields.phone, party.phone);
  setText(form, fields.email, party.email);
}

export function getTemplatePath(): string {
  return path.resolve(process.env.PDF_TEMPLATE_PATH || DEFAULT_TEMPLATE_PATH);
}

/**
 * Validate the FormData, load the PDF template, fill every mapped field, and
 * return the filled PDF bytes.
 */
export async function fillPdf(formData: FormData): Promise<Uint8Array> {
  validateFormData(formData);

  const templatePath = getTemplatePath();
  let templateBytes: Buffer;
  try {
    templateBytes = await readFile(templatePath);
  } catch (err) {
    const message = `Failed to read PDF template at ${templatePath}. Set PDF_TEMPLATE_PATH in .env or place the template in server/templates/.`;
    console.error(`[fillPdf] ${message}`, err);
    throw new Error(message);
  }

  let form: PDFForm;
  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(templateBytes);
    form = pdfDoc.getForm();
  } catch (err) {
    const message = `Failed to load PDF template: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[fillPdf] ${message}`, err);
    throw new Error(message);
  }

  try {
    // Header
    setText(form, 'Clerk', formData.clerk);
    setDropdown(form, 'cmbdivision', formData.division);
    setText(form, 'small_claim_number', formData.smallClaimNumber);

    // Plaintiffs
    fillParty(form, formData.plaintiffs[0], {
      name: 'plaintiff_name_1',
      address: 'plaintiff_Address_1',
      city: 'plaintiff_City_1',
      state: 'plaintiff_State_1',
      zip: 'plaintiff_Zip_1',
      phone: 'plaintiff_Phone',
      email: 'plaintiff_Email',
    });
    fillParty(form, formData.plaintiffs[1], {
      name: 'plaintiff_name_2',
      address: 'plaintiff_Address_2',
      city: 'plaintiff_City_2',
      state: 'plaintiff_State_2',
      zip: 'plaintiff_Zip_2',
      phone: 'plaintiff_Phone_2',
      email: 'plaintiff_Email_2',
    });

    // Defendants — note the PDF's misspelled `defedant_State_1`
    fillParty(form, formData.defendants[0], {
      name: 'defendant_name_1',
      address: 'defendant_Address_1',
      city: 'defendant_City_1',
      state: 'defedant_State_1', // typo is in the PDF template; must match exactly
      zip: 'defendant_Zip_1',
      phone: 'defendant_Phone_1',
      email: 'defendant_Email_1',
    });
    fillParty(form, formData.defendants[1], {
      name: 'defendant_name_2',
      address: 'defendant_Address_2',
      city: 'defendant_City_2',
      state: 'defendant_State_2',
      zip: 'defendant_Zip_2',
      phone: 'defendant_Phone_2',
      email: 'defendant_Email_2',
    });

    // Interpreters
    if (formData.interpreterPlaintiff) {
      setCheckBox(form, 'Intepreter_yes', formData.interpreterPlaintiff.required === true);
      setCheckBox(form, 'intepreter_no', formData.interpreterPlaintiff.required === false);
      setText(form, 'intepreter_Name_1', formData.interpreterPlaintiff.name);
      setText(form, 'intepreter_Language_1', formData.interpreterPlaintiff.language);
    }
    if (formData.interpreterDefendant) {
      setText(form, 'intepreter_Name_2', formData.interpreterDefendant.name);
      setText(form, 'intepreter_Language_2', formData.interpreterDefendant.language);
    }

    // Claim — `plaintiff_Name_1` (capital N) is the claimant, distinct from plaintiff_name_1
    setText(form, 'plaintiff_Name_1', formData.claimantName);
    setText(form, 'small_claim_amount', formData.claimAmount);
    setText(form, 'incident_date', formData.incidentDate);

    // Claim reasons
    const reasons = formData.claim.reasons;
    setCheckBox(form, 'reason_Faulty_Workmanship', reasons.includes('Faulty_Workmanship'));
    setCheckBox(form, 'reason_Merchandise', reasons.includes('Merchandise'));
    setCheckBox(form, 'reason_Auto_damages', reasons.includes('Auto_damages'));
    setCheckBox(form, 'reason_wages', reasons.includes('wages'));
    setCheckBox(form, 'reason_Loan', reasons.includes('Loan'));
    setCheckBox(form, 'reason_Return_of_Deposit', reasons.includes('Return_of_Deposit'));
    setCheckBox(form, 'reason_Rent', reasons.includes('Rent'));
    setCheckBox(form, 'reason_Property_Damage', reasons.includes('Property_Damage'));
    setCheckBox(form, 'reason_Other', reasons.includes('Other'));
    if (reasons.includes('Auto_damages')) {
      setText(form, 'reason_Auto_Damages_accident_date', formData.claim.autoDamagesAccidentDate);
    }
    if (reasons.includes('Other')) {
      setText(form, 'reason_Other_Name', formData.claim.otherReasonName);
    }
    // Misspelled in the PDF template ("Explaination"); must match exactly
    setText(form, 'reason_Explaination', formData.claim.explanation);

    // Servicemembers Civil Relief Act
    const smcr = formData.serviceMemberCivilRelief;
    setCheckBox(form, 'service_member_civil_relief_yes', smcr.status === 'yes');
    setCheckBox(form, 'service_member_civil_relief_no', smcr.status === 'no');
    setCheckBox(form, 'service_member_civil_relief_unknown', smcr.status === 'unknown');
    if (smcr.status === 'yes') {
      setText(form, 'service_member_civil_relief_law', smcr.factsIfCovered);
    }
    if (smcr.status === 'no') {
      setText(form, 'service_member_civil_relief_law_not_covered_reason', smcr.reasonIfNotCovered);
    }

    // Signature block
    setText(form, 'signed_city', formData.signature.city);
    setText(form, 'signed_State', formData.signature.state);
    setText(form, 'signed_Date', formData.signature.date);
    setText(form, 'signed_plaintiff_name', formData.signature.plaintiffName);
  } catch (err) {
    console.error('[fillPdf] Error while filling PDF fields:', err);
    throw err;
  }

  try {
    return await pdfDoc.save();
  } catch (err) {
    const message = `Failed to save filled PDF: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[fillPdf] ${message}`, err);
    throw new Error(message);
  }
}
