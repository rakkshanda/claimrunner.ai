// Eligibility questionnaire — shown as a tab in the logged-out Prototype view.
// Runs the rules locally, saves the submission to the backend, stashes the
// result (with prefill) in local storage, and offers a jump to signup.

import { useState } from 'react';
import {
  CLAIM_TYPES,
  ETHNICITIES,
  PARTY_TYPES,
  buildPrefillFromAnswers,
  checkEligibility,
} from '../eligibility/eligibilityLogic';
import { saveEligibility } from '../eligibility/eligibilityStorage';
import { submitEligibilityForm } from '../api/client';

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const emptyForm = {
  age: '',
  hasGuardian: 'no',
  plaintiffType: 'individual',
  zipCode: '',
  selfRepresentation: 'yes',
  canPayFee: 'yes',
  understandsCourtAttendance: 'yes',
  claimAmount: '',
  claimType: CLAIM_TYPES[0],
  incidentDate: '',
  settlementAttempts: 'yes',
  defendantType: 'individual',
  hasDefendantInfo: 'yes',
  defendantInBankruptcy: 'no',
  firstClaimAgainstDefendant: 'yes',
  hasFiled12OrMoreClaims: 'no',
  plaintiffEthnicity: '',
  defendantEthnicity: '',
};

// Convert the form's string values into the typed shape the rules expect.
function toAnswers(f) {
  const yn = (v) => v === 'yes';
  return {
    age: f.age === '' ? undefined : Number(f.age),
    hasGuardian: yn(f.hasGuardian),
    plaintiffType: f.plaintiffType,
    zipCode: f.zipCode.trim(),
    selfRepresentation: yn(f.selfRepresentation),
    canPayFee: yn(f.canPayFee),
    understandsCourtAttendance: yn(f.understandsCourtAttendance),
    claimAmount: f.claimAmount === '' ? undefined : Number(f.claimAmount),
    claimType: f.claimType,
    incidentDate: f.incidentDate || undefined,
    settlementAttempts: yn(f.settlementAttempts),
    defendantType: f.defendantType,
    hasDefendantInfo: yn(f.hasDefendantInfo),
    defendantInBankruptcy: yn(f.defendantInBankruptcy),
    firstClaimAgainstDefendant: yn(f.firstClaimAgainstDefendant),
    hasFiled12OrMoreClaims: yn(f.hasFiled12OrMoreClaims),
    plaintiffEthnicity: f.plaintiffEthnicity || undefined,
    defendantEthnicity: f.defendantEthnicity || undefined,
  };
}

export default function EligibilityCheck({ onGoToSignup }) {
  const [f, setF] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { eligible, reasons }
  const [saveNote, setSaveNote] = useState('');

  const set = (key) => (e) => {
    setF((prev) => ({ ...prev, [key]: e.target.value }));
    setResult(null);
    setSaveNote('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveNote('');

    if (f.age === '' || Number.isNaN(Number(f.age))) return;
    if (f.claimAmount === '' || Number.isNaN(Number(f.claimAmount))) return;

    const answers = toAnswers(f);
    const { eligible, reasons } = checkEligibility(answers);
    setResult({ eligible, reasons });

    // Persist to backend + local storage (best-effort — local result still shows).
    setBusy(true);
    try {
      const prefill = buildPrefillFromAnswers(answers);
      const row = await submitEligibilityForm(answers, eligible);
      saveEligibility({ formId: row.id, answers, prefill, eligible });
    } catch (err) {
      console.error('[EligibilityCheck] Failed to save submission:', err);
      // Still stash locally so signup can prefill, just without a form id.
      try {
        saveEligibility({ formId: null, answers, prefill: buildPrefillFromAnswers(answers), eligible });
      } catch (inner) {
        console.error('[EligibilityCheck] Local save also failed:', inner);
      }
      setSaveNote("We couldn't save your submission to the server, but your result is shown below.");
    } finally {
      setBusy(false);
    }
  };

  const isMinor = f.age !== '' && Number(f.age) < 18;

  return (
    <div className="eligibility-check">
      <div className="eligibility-intro">
        <p className="proto-subtitle">
          Answer a few questions to see if your dispute qualifies for King County small claims court.
        </p>
        <button type="button" className="eligibility-skip" onClick={onGoToSignup}>
          Skip and go straight to sign up →
        </button>
      </div>

      <form className="proto-form" onSubmit={handleSubmit}>
        <h4 className="section-heading">About you</h4>
        <div className="form-row">
          <label>
            Your age
            <input type="number" min="0" value={f.age} onChange={set('age')} placeholder="e.g. 34" />
          </label>
          {isMinor && (
            <label>
              Do you have a court-appointed guardian?
              <select value={f.hasGuardian} onChange={set('hasGuardian')}>
                {YES_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          )}
        </div>
        <div className="form-row">
          <label>
            You are a…
            <select value={f.plaintiffType} onChange={set('plaintiffType')}>
              {PARTY_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label>
            Your ZIP code
            <input type="text" value={f.zipCode} onChange={set('zipCode')} placeholder="98104" />
          </label>
        </div>
        <label>
          Will you represent yourself (no attorney)?
          <select value={f.selfRepresentation} onChange={set('selfRepresentation')}>
            {YES_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <div className="form-row">
          <label>
            Can you pay the court filing fees?
            <select value={f.canPayFee} onChange={set('canPayFee')}>
              {YES_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label>
            Do you understand you must attend the hearing?
            <select value={f.understandsCourtAttendance} onChange={set('understandsCourtAttendance')}>
              {YES_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>

        <h4 className="section-heading">Your claim</h4>
        <div className="form-row">
          <label>
            Claim amount ($)
            <input type="number" min="0" step="0.01" value={f.claimAmount} onChange={set('claimAmount')} placeholder="3500.00" />
          </label>
          <label>
            Type of claim
            <select value={f.claimType} onChange={set('claimType')}>
              {CLAIM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Date of the incident
            <input type="date" value={f.incidentDate} onChange={set('incidentDate')} />
          </label>
          <label>
            Have you tried to resolve it first?
            <select value={f.settlementAttempts} onChange={set('settlementAttempts')}>
              {YES_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>

        <h4 className="section-heading">The defendant</h4>
        <div className="form-row">
          <label>
            The defendant is a…
            <select value={f.defendantType} onChange={set('defendantType')}>
              {PARTY_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label>
            Do you have their legal name &amp; address?
            <select value={f.hasDefendantInfo} onChange={set('hasDefendantInfo')}>
              {YES_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Is the defendant currently in bankruptcy?
            <select value={f.defendantInBankruptcy} onChange={set('defendantInBankruptcy')}>
              {YES_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label>
            First claim against them in 12 months?
            <select value={f.firstClaimAgainstDefendant} onChange={set('firstClaimAgainstDefendant')}>
              {YES_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>
        <label>
          Have you filed 12 or more claims in the past year?
          <select value={f.hasFiled12OrMoreClaims} onChange={set('hasFiled12OrMoreClaims')}>
            {YES_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        <h4 className="section-heading">
          Demographics <span className="optional">(optional — never affects your result)</span>
        </h4>
        <div className="form-row">
          <label>
            Your ethnicity
            <select value={f.plaintiffEthnicity} onChange={set('plaintiffEthnicity')}>
              <option value="">Prefer not to say</option>
              {ETHNICITIES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>
          <label>
            Defendant's ethnicity
            <select value={f.defendantEthnicity} onChange={set('defendantEthnicity')}>
              <option value="">Prefer not to say</option>
              {ETHNICITIES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>
        </div>

        <button type="submit" className="proto-btn" disabled={busy}>
          {busy ? 'Checking…' : 'Check eligibility'}
        </button>
      </form>

      {result && (
        <div className={`eligibility-result ${result.eligible ? 'eligible' : 'ineligible'}`} role="status">
          {result.eligible ? (
            <>
              <h4>✓ You appear eligible</h4>
              <p>Based on your answers, your dispute looks like a fit for small claims court. Create an account to start your filing — we'll carry over what you entered.</p>
            </>
          ) : (
            <>
              <h4>Your claim may not qualify</h4>
              <p>Based on your answers, we found the following issue{result.reasons.length > 1 ? 's' : ''}:</p>
              <ul>
                {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
              <p>You can still create an account if you'd like to proceed or keep your information.</p>
            </>
          )}
          {saveNote && <p className="eligibility-save-note">{saveNote}</p>}
          <button type="button" className="proto-btn" onClick={onGoToSignup}>
            Continue to sign up →
          </button>
        </div>
      )}
    </div>
  );
}
