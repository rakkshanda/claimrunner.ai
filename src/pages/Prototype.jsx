// Prototype page — renders below the navbar at /prototype, so the nav stays
// interactive. Login/signup → case list → case detail (with step progress bar).

import { useEffect, useState } from 'react';
import { getMe, getToken, login, logout, signup, updateMyProfile } from '../api/client';
import CaseList from '../components/CaseList';
import CaseDetail from '../components/CaseDetail';
import EligibilityCheck from '../components/EligibilityCheck';
import {
  clearEligibility,
  loadEligibility,
  scheduleEligibilityExpiry,
} from '../eligibility/eligibilityStorage';
import './Prototype.scss';

export default function Prototype() {
  const [mode, setMode] = useState('eligibility'); // 'eligibility' | 'login' | 'signup'
  const [openCaseId, setOpenCaseId] = useState(null); // null = case list
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null); // plaintiff row when logged in
  const [casePrefill, setCasePrefill] = useState(null); // carried over from eligibility on signup

  // If a token is already stored, try to restore the session.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (!cancelled) setProfile(me);
      } catch (err) {
        // Expired/invalid token — stay on the login form.
        console.error('[Prototype] Session restore failed:', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Live-expire any stored eligibility result once it passes its TTL.
  useEffect(() => scheduleEligibilityExpiry(() => {}), []);

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        // Pull any eligibility submission to link the account + prefill the first case.
        const stored = loadEligibility();
        const data = await signup(
          name.trim(),
          email.trim(),
          password,
          phone.trim(),
          stored?.formId || undefined
        );
        setProfile(data.plaintiff);

        if (stored) {
          // Carry the case prefill into React state before wiping local storage.
          if (stored.prefill && Object.keys(stored.prefill).length > 0) {
            setCasePrefill(stored.prefill);
            // Best-effort: persist the plaintiff's ZIP right away.
            if (stored.prefill.zip) {
              try {
                await updateMyProfile({ zip: stored.prefill.zip });
              } catch (zipErr) {
                console.error('[Prototype] Failed to save prefilled ZIP:', zipErr);
              }
            }
          }
          clearEligibility(); // local copy gone the moment the account exists
        }
      } else {
        await login(email.trim(), password);
        const me = await getMe();
        setProfile(me);
      }
      setPassword('');
    } catch (err) {
      console.error(`[Prototype] ${mode} failed:`, err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
    } catch (err) {
      console.error('[Prototype] Logout failed:', err);
    } finally {
      setProfile(null);
      setOpenCaseId(null);
      setCasePrefill(null);
      setBusy(false);
    }
  };

  return (
    <div className="prototype-page">
      <div
        className={`prototype-panel ${
          profile || mode === 'eligibility' ? 'prototype-panel--wide' : ''
        }`}
      >
        {profile ? (
          <>
            <div className="proto-header">
              <div>
                <h2>ClaimRunner Prototype</h2>
                <p className="proto-user">Logged in as {profile.name}</p>
              </div>
              <div className="proto-header-actions">
                <button className="proto-btn secondary small" onClick={handleLogout} disabled={busy}>
                  {busy ? '…' : 'Log out'}
                </button>
              </div>
            </div>

            {openCaseId ? (
              <CaseDetail caseId={openCaseId} onBack={() => setOpenCaseId(null)} />
            ) : (
              <CaseList
                prefill={casePrefill}
                onPrefillConsumed={() => setCasePrefill(null)}
                onOpenCase={(id) => setOpenCaseId(id)}
              />
            )}
          </>
        ) : (
          <div className={`proto-auth ${mode === 'eligibility' ? 'proto-auth--wide' : ''}`}>
            <h2>
              {mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create your account' : 'Am I eligible?'}
            </h2>
            <p className="proto-subtitle">
              {mode === 'login'
                ? 'Access the ClaimRunner prototype.'
                : mode === 'signup'
                ? 'Sign up to start filing your small claim.'
                : 'Check whether your dispute qualifies for small claims court.'}
            </p>

            <div className="proto-tabs" role="tablist">
              <button
                role="tab"
                aria-selected={mode === 'eligibility'}
                className={mode === 'eligibility' ? 'active' : ''}
                onClick={() => switchMode('eligibility')}
              >
                Check eligibility
              </button>
              <button
                role="tab"
                aria-selected={mode === 'login'}
                className={mode === 'login' ? 'active' : ''}
                onClick={() => switchMode('login')}
              >
                Log in
              </button>
              <button
                role="tab"
                aria-selected={mode === 'signup'}
                className={mode === 'signup' ? 'active' : ''}
                onClick={() => switchMode('signup')}
              >
                Sign up
              </button>
            </div>

            {mode === 'eligibility' ? (
              <EligibilityCheck onGoToSignup={() => switchMode('signup')} />
            ) : (
            <form className="proto-form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <>
                  <label>
                    Name
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </label>
                  <label>
                    Phone number
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="206-555-0101"
                      autoComplete="tel"
                    />
                  </label>
                </>
              )}
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
              </label>

              {error && <div className="proto-error" role="alert">{error}</div>}

              <button type="submit" className="proto-btn" disabled={busy}>
                {busy
                  ? (mode === 'login' ? 'Logging in…' : 'Creating account…')
                  : (mode === 'login' ? 'Log in' : 'Sign up')}
              </button>
            </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
