// Browser port of the small-claims eligibility rules (see /EligibilityLogic.ts
// at the repo root). Two constructor bugs in the original are FIXED here:
//   - bankruptcy was inverted (you were only eligible if the defendant WAS
//     bankrupt) — now `defendantInBankruptcy: true` makes you ineligible.
//   - the 12-claim check was inverted — now `hasFiled12OrMoreClaims: true`
//     makes you ineligible.
// The `claimNature` field is dropped. `EligibilityLogic.ts` is left untouched.

export const KING_COUNTY_ZIP_CODES = new Set([
  '98001','98002','98003','98004','98005','98006','98007','98008','98009','98010','98011','98013','98014','98015','98019','98022','98023','98024','98025','98027','98028','98029','98030','98031','98032','98033','98034','98035','98038','98039','98040','98041','98042','98045','98047','98050','98051','98052','98053','98054','98055','98056','98057','98058','98059','98062','98063','98064','98065','98070','98071','98072','98073','98074','98075','98077','98083','98089','98092','98093','98101','98102','98103','98104','98105','98106','98107','98108','98109','98111','98112','98113','98114','98115','98116','98117','98118','98119','98121','98122','98124','98125','98126','98127','98129','98131','98132','98133','98134','98136','98138','98139','98141','98144','98145','98146','98148','98151','98154','98155','98158','98160','98161','98164','98165','98166','98168','98170','98171','98174','98175','98177','98178','98181','98184','98185','98188','98190','98191','98194','98195','98198','98199','98224','98251','98288','98354',
]);

// Claim types offered in the form (mirrors the ClaimType enum). "Other" is a
// valid selection but marks the claim ineligible per the rules.
export const CLAIM_TYPES = [
  'Property Damage',
  'Personal Injury',
  'Breach of Contract',
  'Lease Agreement',
  'Wages',
  'Loan',
  'Rent',
  'Goods and Services',
  'Automobile Accident',
  'Damage Deposit',
  'Open Account',
  'Service Rendered',
  'Written Instrument',
  'Other',
];

// Optional demographic values (mirrors the Ethnicity enum). Never affect eligibility.
export const ETHNICITIES = [
  'Asian',
  'African American',
  'Hispanic or Latino',
  'Native American or Alaska Native',
  'Native Hawaiian or Other Pacific Islander',
  'Caucasian',
  'Other',
];

export const PARTY_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'business', label: 'Business' },
  { value: 'government', label: 'Government' },
];

// Maps a form claimType (ClaimType enum) to a case claim_reason (ClaimReason enum).
// Types with no natural match fall through to 'Other'.
export const CLAIM_TYPE_TO_REASON = {
  'Property Damage': 'Property_Damage',
  'Automobile Accident': 'Auto_damages',
  Wages: 'wages',
  Loan: 'Loan',
  Rent: 'Rent',
  'Damage Deposit': 'Return_of_Deposit',
  'Goods and Services': 'Merchandise',
  'Service Rendered': 'Faulty_Workmanship',
  'Personal Injury': 'Other',
  'Breach of Contract': 'Other',
  'Lease Agreement': 'Other',
  'Open Account': 'Other',
  'Written Instrument': 'Other',
  Other: 'Other',
};

/**
 * Evaluate eligibility from a plain answers object.
 * Returns { eligible: boolean, reasons: string[] } — reasons lists why NOT eligible.
 */
export function checkEligibility(answers = {}) {
  const reasons = [];
  const age = Number(answers.age);
  const claimAmount = Number(answers.claimAmount);

  if (Number.isFinite(age) && age < 18 && !answers.hasGuardian) {
    reasons.push('The claimant must be at least 18 years old or have a guardian appointed to file a claim.');
  }
  if (Number.isFinite(claimAmount) && claimAmount > 10000) {
    reasons.push('The claim amount exceeds the $10,000 maximum limit for small claims.');
  }
  if (Number.isFinite(claimAmount) && claimAmount > 5000 && answers.defendantType !== 'individual') {
    reasons.push('Claims over $5,000 can only be filed against individuals.');
  }
  if (Number.isFinite(claimAmount) && claimAmount > 5000 && answers.plaintiffType !== 'individual') {
    reasons.push('Claims over $5,000 can only be filed by individuals.');
  }
  if (!KING_COUNTY_ZIP_CODES.has(String(answers.zipCode || '').trim())) {
    reasons.push('The claimant must reside in King County to file a claim.');
  }
  if (answers.claimType === 'Other') {
    reasons.push('The selected claim type is not in the list of accepted claim types.');
  }
  if (!answers.selfRepresentation) {
    reasons.push('The claimant must represent themselves in small claims court.');
  }
  if (answers.incidentDate) {
    const incident = new Date(answers.incidentDate);
    const today = new Date();
    const sixYearsAgo = new Date(today.getFullYear() - 6, today.getMonth(), today.getDate());
    if (!Number.isNaN(incident.getTime()) && incident < sixYearsAgo) {
      reasons.push('The incident date is more than 6 years ago and exceeds the statute of limitations.');
    }
  }
  if (!answers.settlementAttempts) {
    reasons.push('Parties must attempt to resolve the dispute before filing.');
  }
  if (!answers.hasDefendantInfo) {
    reasons.push("The claimant must have the defendant's legal name and valid residential address.");
  }
  // FIXED: bankruptcy blocks the claim (original inverted this).
  if (answers.defendantInBankruptcy) {
    reasons.push('The claimant cannot file a claim while the defendant is currently in bankruptcy.');
  }
  if (!answers.firstClaimAgainstDefendant) {
    reasons.push('The claimant can only file one claim against the same defendant in a 12-month period.');
  }
  if (!answers.canPayFee) {
    reasons.push('The claimant must be able to pay the court filing fees.');
  }
  // FIXED: 12+ prior claims blocks the claim (original inverted this).
  if (answers.hasFiled12OrMoreClaims) {
    reasons.push('The claimant cannot have filed 12 or more claims in the past year.');
  }
  if (!answers.understandsCourtAttendance) {
    reasons.push('The claimant must understand that they are required to attend the court hearing.');
  }

  return { eligible: reasons.length === 0, reasons };
}

/**
 * Extract the subset of eligibility answers that map onto plaintiff/case fields,
 * so a new account can pre-fill its first case.
 */
export function buildPrefillFromAnswers(answers = {}) {
  const prefill = {};
  if (answers.zipCode) prefill.zip = String(answers.zipCode).trim();
  if (answers.claimAmount !== undefined && answers.claimAmount !== '') {
    const amount = Number(answers.claimAmount);
    if (Number.isFinite(amount)) prefill.claim_amount = amount;
  }
  if (answers.incidentDate) prefill.incident_date = answers.incidentDate;
  if (answers.claimType && CLAIM_TYPE_TO_REASON[answers.claimType]) {
    prefill.claim_reason = CLAIM_TYPE_TO_REASON[answers.claimType];
  }
  return prefill;
}
