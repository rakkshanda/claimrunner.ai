// Case list view — shows the logged-in plaintiff's cases and a "new case" form.

import { useCallback, useEffect, useState } from 'react';
import { CLAIM_REASONS, createCase, listCases } from '../api/client';

const prettyReason = (r) => r.replace(/_/g, ' ');

export default function CaseList({ onOpenCase }) {
  const [cases, setCases] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  // New case form state
  const [caseName, setCaseName] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimReason, setClaimReason] = useState(CLAIM_REASONS[0]);

  const refresh = useCallback(async () => {
    try {
      setError('');
      const rows = await listCases();
      setCases(rows);
    } catch (err) {
      console.error('[CaseList] Failed to load cases:', err);
      setError(err.message || 'Failed to load cases.');
      setCases([]);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!caseName.trim()) { setError('Please enter a case name.'); return; }
    if (!incidentDate) { setError('Please enter the incident date.'); return; }
    const amount = Number(claimAmount);
    if (!claimAmount || Number.isNaN(amount) || amount <= 0) {
      setError('Please enter a valid claim amount.');
      return;
    }

    setBusy(true);
    try {
      const created = await createCase({
        case_name: caseName.trim(),
        incident_date: incidentDate,
        claim_amount: amount,
        claim_reason: claimReason,
      });
      setCaseName('');
      setIncidentDate('');
      setClaimAmount('');
      setClaimReason(CLAIM_REASONS[0]);
      setShowForm(false);
      onOpenCase(created.id); // jump straight into the new case
    } catch (err) {
      console.error('[CaseList] Failed to create case:', err);
      setError(err.message || 'Failed to create case.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="case-list">
      <div className="case-list-header">
        <h3>Your cases</h3>
        <button className="proto-btn small" onClick={() => { setShowForm(!showForm); setError(''); }}>
          {showForm ? 'Cancel' : '+ New case'}
        </button>
      </div>

      {showForm && (
        <form className="proto-form case-create-form" onSubmit={handleCreate}>
          <label>
            Case name
            <input
              type="text"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              placeholder='e.g. "Me v. Acme Repairs"'
            />
          </label>
          <div className="form-row">
            <label>
              Incident date
              <input type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} />
            </label>
            <label>
              Claim amount ($)
              <input
                type="number"
                min="0"
                step="0.01"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                placeholder="3500.00"
              />
            </label>
          </div>
          <label>
            Reason for claim
            <select value={claimReason} onChange={(e) => setClaimReason(e.target.value)}>
              {CLAIM_REASONS.map((r) => (
                <option key={r} value={r}>{prettyReason(r)}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="proto-btn" disabled={busy}>
            {busy ? 'Creating…' : 'Create case'}
          </button>
        </form>
      )}

      {error && <div className="proto-error" role="alert">{error}</div>}

      {cases === null ? (
        <p className="case-list-empty">Loading cases…</p>
      ) : cases.length === 0 ? (
        !showForm && <p className="case-list-empty">No cases yet. Create your first one to get started.</p>
      ) : (
        <ul className="case-items">
          {cases.map((c) => (
            <li key={c.id}>
              <button className="case-item" onClick={() => onOpenCase(c.id)}>
                <span className="case-item-name">{c.case_name}</span>
                <span className="case-item-meta">
                  ${Number(c.claim_amount).toFixed(2)} · {prettyReason(c.claim_reason)}
                  {c.defendant?.name ? ` · vs ${c.defendant.name}` : ''}
                </span>
                <span className="case-item-step">
                  {c.current_step ? `Step ${c.current_step.step_number}: ${c.current_step.step_name}` : 'Not started'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
