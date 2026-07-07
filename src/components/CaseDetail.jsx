// Case detail view — step progress bar + every field the Notice of Small Claim
// PDF needs: court info, claim details, plaintiff/defendant info, interpreters,
// Servicemembers Civil Relief Act, and signature. Save persists everything;
// Download PDF saves first, then downloads the filled form.

import { useEffect, useState } from 'react';
import {
  advanceCaseStep,
  CLAIM_REASONS,
  DIVISIONS,
  downloadCasePdf,
  getCase,
  getCaseSteps,
  updateCase,
  updateMyProfile,
} from '../api/client';

// Placeholder copy for steps 2–7 until each step's real workflow is built.
const STEP_PLACEHOLDERS = {
  2: 'The defendant must be officially served with your Notice of Small Claim. This step will walk you through service options (sheriff, process server, or certified mail) and let you record proof of service.',
  3: 'Before trial, many small claims are resolved through settlement. This step will help you track settlement offers, communications with the defendant, and any agreement you reach.',
  4: 'Gather the evidence that supports your claim — receipts, contracts, photos, messages, and witness information. This step will let you organize and store your evidence for trial.',
  5: 'Prepare for your day in court. This step will cover what to bring, how the hearing works, and let you review your evidence and notes before trial.',
  6: "After the hearing, the court issues a judgment. This step will record the court's decision and what it means for your case.",
  7: 'If you won, collect the judgment. This step will help you track payments from the defendant and the steps available if they do not pay.',
};

const prettyReason = (r) => r.replace(/_/g, ' ');

function StepProgressBar({ steps, currentStepId }) {
  if (!steps?.length) return null;
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);
  const current = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="step-progress">
      <div className="step-progress-track">
        <div
          className="step-progress-fill"
          style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={`step-dot ${i < current ? 'done' : ''} ${i === current ? 'current' : ''}`}
            style={{ left: `${(i / (steps.length - 1)) * 100}%` }}
            title={`Step ${s.step_number}: ${s.step_name}`}
          >
            {i < current ? '✓' : s.step_number}
          </div>
        ))}
      </div>
      <p className="step-progress-label">
        Step {steps[current].step_number} of {steps.length}: <strong>{steps[current].step_name}</strong>
      </p>
    </div>
  );
}

export default function CaseDetail({ caseId, onBack }) {
  const [caseRow, setCaseRow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Court + case basics + claim details
  const [form, setForm] = useState({
    case_name: '', case_number: '', incident_date: '', claim_amount: '',
    claim_reason: CLAIM_REASONS[0], explanation: '',
    division: '', clerk: '', claimantName: '',
    autoDamagesAccidentDate: '', otherReasonName: '',
  });
  const [additionalReasons, setAdditionalReasons] = useState([]);
  const [claimantSame, setClaimantSame] = useState(false); // claimant = plaintiff
  // Plaintiff (profile) info — the PDF pulls this from your plaintiff row
  const [plaintiff, setPlaintiff] = useState({
    name: '', address: '', city: '', state: '', zip: '', phone: '', email: '',
  });
  const [defendant, setDefendant] = useState({
    name: '', address: '', city: '', state: '', zip: '', phone: '', email: '',
  });
  // Interpreters
  const [interpP, setInterpP] = useState({ required: false, name: '', language: '' });
  const [interpD, setInterpD] = useState({ name: '', language: '' });
  // Servicemembers Civil Relief Act
  const [smcr, setSmcr] = useState({ status: 'unknown', factsIfCovered: '', reasonIfNotCovered: '' });
  // Signature
  const [signature, setSignature] = useState({ city: '', state: '', date: '', plaintiffName: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [row, stepList] = await Promise.all([getCase(caseId), getCaseSteps()]);
        if (cancelled) return;
        const extra = row.pdf_extra_fields || {};
        setCaseRow(row);
        setSteps(stepList);
        setForm({
          case_name: row.case_name || '',
          case_number: row.case_number || '',
          incident_date: row.incident_date || '',
          claim_amount: row.claim_amount != null ? String(row.claim_amount) : '',
          claim_reason: row.claim_reason || CLAIM_REASONS[0],
          explanation: extra.explanation || '',
          division: extra.division || '',
          clerk: extra.clerk || '',
          claimantName: extra.claimantName || '',
          autoDamagesAccidentDate: extra.autoDamagesAccidentDate || '',
          otherReasonName: extra.otherReasonName || '',
        });
        setAdditionalReasons(extra.additionalReasons || []);
        setClaimantSame(extra.claimantSameAsPlaintiff === true);
        setPlaintiff({
          name: row.plaintiff?.name || '',
          address: row.plaintiff?.address || '',
          city: row.plaintiff?.city || '',
          state: row.plaintiff?.state || '',
          zip: row.plaintiff?.zip || '',
          phone: row.plaintiff?.phone || '',
          email: row.plaintiff?.email || '',
        });
        setDefendant({
          name: row.defendant?.name || '',
          address: row.defendant?.address || '',
          city: row.defendant?.city || '',
          state: row.defendant?.state || '',
          zip: row.defendant?.zip || '',
          phone: row.defendant?.phone || '',
          email: row.defendant?.email || '',
        });
        setInterpP({
          required: extra.interpreterPlaintiff?.required === true,
          name: extra.interpreterPlaintiff?.name || '',
          language: extra.interpreterPlaintiff?.language || '',
        });
        setInterpD({
          name: extra.interpreterDefendant?.name || '',
          language: extra.interpreterDefendant?.language || '',
        });
        setSmcr({
          status: extra.serviceMemberCivilRelief?.status || 'unknown',
          factsIfCovered: extra.serviceMemberCivilRelief?.factsIfCovered || '',
          reasonIfNotCovered: extra.serviceMemberCivilRelief?.reasonIfNotCovered || '',
        });
        setSignature({
          city: extra.signature?.city || '',
          state: extra.signature?.state || '',
          date: extra.signature?.date || '',
          plaintiffName: extra.signature?.plaintiffName || row.plaintiff?.name || '',
        });
      } catch (err) {
        console.error(`[CaseDetail] Failed to load case ${caseId}:`, err);
        if (!cancelled) setError(err.message || 'Failed to load case.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [caseId]);

  const touch = () => setSaved(false);
  const setField = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); touch(); };
  const setPl = (key) => (e) => { setPlaintiff((p) => ({ ...p, [key]: e.target.value })); touch(); };
  const setDef = (key) => (e) => { setDefendant((d) => ({ ...d, [key]: e.target.value })); touch(); };
  const setSig = (key) => (e) => { setSignature((s) => ({ ...s, [key]: e.target.value })); touch(); };

  const toggleAdditionalReason = (reason) => {
    setAdditionalReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
    touch();
  };

  const allReasons = [form.claim_reason, ...additionalReasons];

  // Saves everything; returns true on success (used by Download PDF too).
  const doSave = async () => {
    setError('');
    setSaved(false);

    if (!form.case_name.trim()) { setError('Case name is required.'); return false; }
    const amount = Number(form.claim_amount);
    if (!form.claim_amount || Number.isNaN(amount) || amount <= 0) {
      setError('Please enter a valid claim amount.');
      return false;
    }
    const hasDefendantInfo = Object.values(defendant).some((v) => v.trim() !== '');
    if (hasDefendantInfo && !defendant.name.trim()) {
      setError('Defendant name is required when providing defendant information.');
      return false;
    }
    if (!plaintiff.name.trim()) { setError('Your name is required.'); return false; }

    setBusy(true);
    try {
      // 1. Plaintiff profile (the PDF reads your contact info from it)
      await updateMyProfile({
        name: plaintiff.name.trim(),
        address: plaintiff.address.trim(),
        city: plaintiff.city.trim(),
        state: plaintiff.state.trim(),
        zip: plaintiff.zip.trim(),
        phone: plaintiff.phone.trim(),
        email: plaintiff.email.trim(),
      });

      // 2. Case + defendant + all PDF extra fields
      const patch = {
        case_name: form.case_name.trim(),
        case_number: form.case_number.trim() || undefined,
        incident_date: form.incident_date,
        claim_amount: amount,
        claim_reason: form.claim_reason,
        pdf_extra_fields: {
          explanation: form.explanation,
          additionalReasons: additionalReasons.filter((r) => r !== form.claim_reason),
          division: form.division || undefined,
          clerk: form.clerk || undefined,
          claimantName: (claimantSame ? plaintiff.name.trim() : form.claimantName) || undefined,
          claimantSameAsPlaintiff: claimantSame,
          autoDamagesAccidentDate: allReasons.includes('Auto_damages')
            ? form.autoDamagesAccidentDate || undefined
            : undefined,
          otherReasonName: allReasons.includes('Other')
            ? form.otherReasonName || undefined
            : undefined,
          interpreterPlaintiff: {
            required: interpP.required,
            name: interpP.name || undefined,
            language: interpP.language || undefined,
          },
          interpreterDefendant: {
            required: Boolean(interpD.name || interpD.language),
            name: interpD.name || undefined,
            language: interpD.language || undefined,
          },
          serviceMemberCivilRelief: {
            status: smcr.status,
            factsIfCovered: smcr.status === 'yes' ? smcr.factsIfCovered || undefined : undefined,
            reasonIfNotCovered: smcr.status === 'no' ? smcr.reasonIfNotCovered || undefined : undefined,
          },
          signature: {
            city: signature.city,
            state: signature.state,
            date: signature.date,
            plaintiffName: signature.plaintiffName,
          },
        },
      };
      if (hasDefendantInfo) {
        patch.defendant = {
          name: defendant.name.trim(),
          address: defendant.address.trim() || undefined,
          city: defendant.city.trim() || undefined,
          state: defendant.state.trim() || undefined,
          zip: defendant.zip.trim() || undefined,
          phone: defendant.phone.trim() || undefined,
          email: defendant.email.trim() || undefined,
        };
      }
      await updateCase(caseId, patch);
      const fresh = await getCase(caseId);
      setCaseRow(fresh);
      setSaved(true);
      return true;
    } catch (err) {
      console.error(`[CaseDetail] Failed to save case ${caseId}:`, err);
      setError(err.message || 'Failed to save changes.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await doSave();
  };

  const currentStepIndex = steps.findIndex((s) => s.id === caseRow?.current_step_id);
  const currentStep = steps[currentStepIndex === -1 ? 0 : currentStepIndex] || null;
  const isLastStep = currentStep && steps.length > 0 && currentStep.id === steps[steps.length - 1].id;

  const handleAdvanceStep = async () => {
    if (!currentStep) return;
    const next = steps[steps.findIndex((s) => s.id === currentStep.id) + 1];
    const confirmed = window.confirm(
      `Move this case from "${currentStep.step_name}" to "${next ? next.step_name : 'the next step'}"? This cannot be undone.`
    );
    if (!confirmed) return;

    // On the filing step, save the form first so nothing is lost.
    if (currentStep.step_number === 1) {
      const ok = await doSave();
      if (!ok) return;
    }

    setAdvancing(true);
    setError('');
    try {
      const { case: updated } = await advanceCaseStep(caseId);
      setCaseRow((prev) => ({ ...prev, ...updated }));
      setSaved(false);
    } catch (err) {
      console.error(`[CaseDetail] Failed to advance step for case ${caseId}:`, err);
      setError(err.message || 'Failed to advance to the next step.');
    } finally {
      setAdvancing(false);
    }
  };

  const handleDownloadPdf = async () => {
    const ok = await doSave();
    if (!ok) return;
    setDownloading(true);
    setError('');
    try {
      await downloadCasePdf(caseId);
    } catch (err) {
      console.error(`[CaseDetail] PDF download failed for case ${caseId}:`, err);
      setError(err.message || 'Failed to generate the PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <p className="case-list-empty">Loading case…</p>;
  if (!caseRow) {
    return (
      <div>
        {error && <div className="proto-error" role="alert">{error}</div>}
        <button className="proto-btn secondary" onClick={onBack}>← Back to cases</button>
      </div>
    );
  }

  return (
    <div className="case-detail">
      <button className="case-back" onClick={onBack}>← Back to cases</button>
      <h3 className="case-detail-title">{caseRow.case_name}</h3>

      <StepProgressBar steps={steps} currentStepId={caseRow.current_step_id} />

      {currentStep && currentStep.step_number !== 1 ? (
        /* ---- Placeholder panels for steps 2–7 ---- */
        <div className="step-placeholder">
          <h4>{currentStep.step_name}</h4>
          <p>{STEP_PLACEHOLDERS[currentStep.step_number] || 'Details for this step are coming soon.'}</p>
          <p className="step-placeholder-note">This part of the process is under construction — check back soon.</p>

          {error && <div className="proto-error" role="alert">{error}</div>}

          <div className="case-detail-actions">
            {!isLastStep ? (
              <button type="button" className="proto-btn" onClick={handleAdvanceStep} disabled={advancing}>
                {advancing ? 'Advancing…' : 'Continue to next step →'}
              </button>
            ) : (
              <p className="step-placeholder-note">🎉 This case has reached the final step.</p>
            )}
          </div>
        </div>
      ) : (
      <form className="proto-form" onSubmit={handleSave}>
        {/* ---- Court information ---- */}
        <h4 className="section-heading">Court information</h4>
        <label>
          Courthouse division
          <select value={form.division} onChange={setField('division')}>
            <option value="">— Select a courthouse —</option>
            {DIVISIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <div className="form-row">
          <label>
            Clerk <span className="optional">(if known)</span>
            <input type="text" value={form.clerk} onChange={setField('clerk')} />
          </label>
          <label>
            Small claim number <span className="optional">(if assigned)</span>
            <input type="text" value={form.case_number} onChange={setField('case_number')} placeholder="Court-assigned" />
          </label>
        </div>

        {/* ---- Case information ---- */}
        <h4 className="section-heading">Case information</h4>
        <label>
          Case name
          <input type="text" value={form.case_name} onChange={setField('case_name')} />
        </label>
        <div className="form-row">
          <label>
            Incident date
            <input type="date" value={form.incident_date} onChange={setField('incident_date')} />
          </label>
          <label>
            Claim amount ($)
            <input type="number" min="0" step="0.01" value={form.claim_amount} onChange={setField('claim_amount')} />
          </label>
        </div>
        <label>
          Claimant name <span className="optional">(as it should appear on the claim line)</span>
          <input
            type="text"
            value={claimantSame ? plaintiff.name : form.claimantName}
            onChange={setField('claimantName')}
            disabled={claimantSame}
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={claimantSame}
            onChange={(e) => { setClaimantSame(e.target.checked); touch(); }}
          />
          Same as plaintiff
        </label>
        <label>
          Primary reason for claim
          <select value={form.claim_reason} onChange={setField('claim_reason')}>
            {CLAIM_REASONS.map((r) => (
              <option key={r} value={r}>{prettyReason(r)}</option>
            ))}
          </select>
        </label>
        <fieldset className="checkbox-fieldset">
          <legend>Additional reasons <span className="optional">(check all that apply)</span></legend>
          <div className="checkbox-grid">
            {CLAIM_REASONS.filter((r) => r !== form.claim_reason).map((r) => (
              <label key={r} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={additionalReasons.includes(r)}
                  onChange={() => toggleAdditionalReason(r)}
                />
                {prettyReason(r)}
              </label>
            ))}
          </div>
        </fieldset>
        {allReasons.includes('Auto_damages') && (
          <label>
            Auto damages — accident date
            <input type="date" value={form.autoDamagesAccidentDate} onChange={setField('autoDamagesAccidentDate')} />
          </label>
        )}
        {allReasons.includes('Other') && (
          <label>
            Other reason — describe
            <input type="text" value={form.otherReasonName} onChange={setField('otherReasonName')} />
          </label>
        )}
        <label>
          Explanation of claim
          <textarea
            rows={4}
            value={form.explanation}
            onChange={setField('explanation')}
            placeholder="Describe what happened and why you are owed this amount…"
          />
        </label>

        {/* ---- Plaintiff (your) information ---- */}
        <h4 className="section-heading">Your information <span className="optional">(appears on the PDF as Plaintiff)</span></h4>
        <label>
          Name
          <input type="text" value={plaintiff.name} onChange={setPl('name')} />
        </label>
        <label>
          Address
          <input type="text" value={plaintiff.address} onChange={setPl('address')} />
        </label>
        <div className="form-row">
          <label>
            City
            <input type="text" value={plaintiff.city} onChange={setPl('city')} />
          </label>
          <label>
            State
            <input type="text" value={plaintiff.state} onChange={setPl('state')} />
          </label>
          <label>
            ZIP
            <input type="text" value={plaintiff.zip} onChange={setPl('zip')} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Phone
            <input type="tel" value={plaintiff.phone} onChange={setPl('phone')} />
          </label>
          <label>
            Email
            <input type="email" value={plaintiff.email} onChange={setPl('email')} />
          </label>
        </div>

        {/* ---- Defendant information ---- */}
        <h4 className="section-heading">Defendant information</h4>
        <label>
          Name
          <input type="text" value={defendant.name} onChange={setDef('name')} placeholder="Person or business you are suing" />
        </label>
        <label>
          Address
          <input type="text" value={defendant.address} onChange={setDef('address')} />
        </label>
        <div className="form-row">
          <label>
            City
            <input type="text" value={defendant.city} onChange={setDef('city')} />
          </label>
          <label>
            State
            <input type="text" value={defendant.state} onChange={setDef('state')} />
          </label>
          <label>
            ZIP
            <input type="text" value={defendant.zip} onChange={setDef('zip')} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Phone
            <input type="tel" value={defendant.phone} onChange={setDef('phone')} />
          </label>
          <label>
            Email
            <input type="email" value={defendant.email} onChange={setDef('email')} />
          </label>
        </div>

        {/* ---- Interpreters ---- */}
        <h4 className="section-heading">Interpreter</h4>
        <div className="radio-group" role="radiogroup" aria-label="Do you need an interpreter?">
          <span className="radio-group-label">Do you need an interpreter?</span>
          <label className="radio-label">
            <input
              type="radio"
              name="interp-required"
              checked={interpP.required === true}
              onChange={() => { setInterpP((p) => ({ ...p, required: true })); touch(); }}
            />
            Yes
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="interp-required"
              checked={interpP.required === false}
              onChange={() => { setInterpP((p) => ({ ...p, required: false })); touch(); }}
            />
            No
          </label>
        </div>
        {interpP.required && (
          <div className="form-row">
            <label>
              Interpreter name <span className="optional">(plaintiff)</span>
              <input
                type="text"
                value={interpP.name}
                onChange={(e) => { setInterpP((p) => ({ ...p, name: e.target.value })); touch(); }}
              />
            </label>
            <label>
              Language
              <input
                type="text"
                value={interpP.language}
                onChange={(e) => { setInterpP((p) => ({ ...p, language: e.target.value })); touch(); }}
              />
            </label>
          </div>
        )}
        <div className="form-row">
          <label>
            Interpreter name <span className="optional">(defendant, if needed)</span>
            <input
              type="text"
              value={interpD.name}
              onChange={(e) => { setInterpD((d) => ({ ...d, name: e.target.value })); touch(); }}
            />
          </label>
          <label>
            Language
            <input
              type="text"
              value={interpD.language}
              onChange={(e) => { setInterpD((d) => ({ ...d, language: e.target.value })); touch(); }}
            />
          </label>
        </div>

        {/* ---- Servicemembers Civil Relief Act ---- */}
        <h4 className="section-heading">Servicemembers Civil Relief Act</h4>
        <div className="radio-group" role="radiogroup" aria-label="Is the defendant covered by the Servicemembers Civil Relief Act?">
          <span className="radio-group-label">Is the defendant in active military service (covered by the Act)?</span>
          {['yes', 'no', 'unknown'].map((s) => (
            <label key={s} className="radio-label">
              <input
                type="radio"
                name="smcr-status"
                checked={smcr.status === s}
                onChange={() => { setSmcr((v) => ({ ...v, status: s })); touch(); }}
              />
              {s === 'unknown' ? "Don't know" : s.charAt(0).toUpperCase() + s.slice(1)}
            </label>
          ))}
        </div>
        {smcr.status === 'yes' && (
          <label>
            Facts supporting coverage
            <textarea
              rows={2}
              value={smcr.factsIfCovered}
              onChange={(e) => { setSmcr((v) => ({ ...v, factsIfCovered: e.target.value })); touch(); }}
            />
          </label>
        )}
        {smcr.status === 'no' && (
          <label>
            Why the defendant is not covered
            <textarea
              rows={2}
              value={smcr.reasonIfNotCovered}
              onChange={(e) => { setSmcr((v) => ({ ...v, reasonIfNotCovered: e.target.value })); touch(); }}
            />
          </label>
        )}

        {/* ---- Signature ---- */}
        <h4 className="section-heading">Signature</h4>
        <div className="form-row">
          <label>
            Signed in city
            <input type="text" value={signature.city} onChange={setSig('city')} />
          </label>
          <label>
            State
            <input type="text" value={signature.state} onChange={setSig('state')} />
          </label>
          <label>
            Date
            <input type="date" value={signature.date} onChange={setSig('date')} />
          </label>
        </div>
        <label>
          Plaintiff name (signature)
          <input type="text" value={signature.plaintiffName} onChange={setSig('plaintiffName')} />
        </label>

        {error && <div className="proto-error" role="alert">{error}</div>}
        {saved && <div className="proto-success" role="status">Changes saved.</div>}

        <div className="case-detail-actions">
          <button type="submit" className="proto-btn" disabled={busy || downloading || advancing}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            className="proto-btn secondary"
            onClick={handleDownloadPdf}
            disabled={busy || downloading || advancing}
          >
            {downloading ? 'Generating…' : 'Save & download PDF'}
          </button>
          <button
            type="button"
            className="proto-btn secondary"
            onClick={handleAdvanceStep}
            disabled={busy || downloading || advancing}
            title="Saves the form, then moves the case to the next step"
          >
            {advancing ? 'Advancing…' : 'Continue to next step →'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
