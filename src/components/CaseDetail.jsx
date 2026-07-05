// Case detail view — step progress bar + editable case & defendant info.

import { useEffect, useState } from 'react';
import { CLAIM_REASONS, getCase, getCaseSteps, updateCase } from '../api/client';

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
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Case form state
  const [form, setForm] = useState({
    case_name: '',
    case_number: '',
    incident_date: '',
    claim_amount: '',
    claim_reason: CLAIM_REASONS[0],
    explanation: '',
  });
  // Defendant form state
  const [defendant, setDefendant] = useState({
    name: '', address: '', city: '', state: '', zip: '', phone: '', email: '',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [row, stepList] = await Promise.all([getCase(caseId), getCaseSteps()]);
        if (cancelled) return;
        setCaseRow(row);
        setSteps(stepList);
        setForm({
          case_name: row.case_name || '',
          case_number: row.case_number || '',
          incident_date: row.incident_date || '',
          claim_amount: row.claim_amount != null ? String(row.claim_amount) : '',
          claim_reason: row.claim_reason || CLAIM_REASONS[0],
          explanation: row.pdf_extra_fields?.explanation || '',
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
      } catch (err) {
        console.error(`[CaseDetail] Failed to load case ${caseId}:`, err);
        if (!cancelled) setError(err.message || 'Failed to load case.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [caseId]);

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setSaved(false);
  };
  const setDefField = (key) => (e) => {
    setDefendant((d) => ({ ...d, [key]: e.target.value }));
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (!form.case_name.trim()) { setError('Case name is required.'); return; }
    const amount = Number(form.claim_amount);
    if (!form.claim_amount || Number.isNaN(amount) || amount <= 0) {
      setError('Please enter a valid claim amount.');
      return;
    }
    const hasDefendantInfo = Object.values(defendant).some((v) => v.trim() !== '');
    if (hasDefendantInfo && !defendant.name.trim()) {
      setError('Defendant name is required when providing defendant information.');
      return;
    }

    setBusy(true);
    try {
      const patch = {
        case_name: form.case_name.trim(),
        case_number: form.case_number.trim() || undefined,
        incident_date: form.incident_date,
        claim_amount: amount,
        claim_reason: form.claim_reason,
        pdf_extra_fields: { explanation: form.explanation },
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
    } catch (err) {
      console.error(`[CaseDetail] Failed to save case ${caseId}:`, err);
      setError(err.message || 'Failed to save changes.');
    } finally {
      setBusy(false);
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

      <form className="proto-form" onSubmit={handleSave}>
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
        <div className="form-row">
          <label>
            Reason for claim
            <select value={form.claim_reason} onChange={setField('claim_reason')}>
              {CLAIM_REASONS.map((r) => (
                <option key={r} value={r}>{prettyReason(r)}</option>
              ))}
            </select>
          </label>
          <label>
            Case number <span className="optional">(if assigned)</span>
            <input type="text" value={form.case_number} onChange={setField('case_number')} placeholder="Court-assigned" />
          </label>
        </div>
        <label>
          Explanation of claim
          <textarea
            rows={4}
            value={form.explanation}
            onChange={setField('explanation')}
            placeholder="Describe what happened and why you are owed this amount…"
          />
        </label>

        <h4 className="section-heading">Defendant information</h4>
        <label>
          Name
          <input type="text" value={defendant.name} onChange={setDefField('name')} placeholder="Person or business you are suing" />
        </label>
        <label>
          Address
          <input type="text" value={defendant.address} onChange={setDefField('address')} />
        </label>
        <div className="form-row">
          <label>
            City
            <input type="text" value={defendant.city} onChange={setDefField('city')} />
          </label>
          <label>
            State
            <input type="text" value={defendant.state} onChange={setDefField('state')} />
          </label>
          <label>
            ZIP
            <input type="text" value={defendant.zip} onChange={setDefField('zip')} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Phone
            <input type="tel" value={defendant.phone} onChange={setDefField('phone')} />
          </label>
          <label>
            Email
            <input type="email" value={defendant.email} onChange={setDefField('email')} />
          </label>
        </div>

        {error && <div className="proto-error" role="alert">{error}</div>}
        {saved && <div className="proto-success" role="status">Changes saved.</div>}

        <button type="submit" className="proto-btn" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
