// Prototype modal — step 1: login/signup against the backend auth endpoints.
// Opens from the "Prototype" item in the navbar (App.jsx).

import { useEffect, useState } from 'react';
import { getMe, getToken, login, logout, signup } from '../api/client';
import CaseList from './CaseList';
import CaseDetail from './CaseDetail';
import './PrototypeModal.scss';

export default function PrototypeModal({ onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [openCaseId, setOpenCaseId] = useState(null); // null = case list
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null); // plaintiff row when logged in

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
        console.error('[PrototypeModal] Session restore failed:', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
        const data = await signup(name.trim(), email.trim(), password);
        setProfile(data.plaintiff);
      } else {
        await login(email.trim(), password);
        const me = await getMe();
        setProfile(me);
      }
      setPassword('');
    } catch (err) {
      console.error(`[PrototypeModal] ${mode} failed:`, err);
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
      console.error('[PrototypeModal] Logout failed:', err);
    } finally {
      setProfile(null);
      setOpenCaseId(null);
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal prototype-modal ${profile ? 'prototype-modal--wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {profile ? (
          <>
            <div className="proto-header">
              <div>
                <h2>ClaimRunner</h2>
                <p className="proto-user">Logged in as {profile.name}</p>
              </div>
              <div className="proto-header-actions">
                <button className="proto-btn secondary small" onClick={handleLogout} disabled={busy}>
                  {busy ? '…' : 'Log out'}
                </button>
                <button className="proto-btn small" onClick={onClose}>Close</button>
              </div>
            </div>

            {openCaseId ? (
              <CaseDetail caseId={openCaseId} onBack={() => setOpenCaseId(null)} />
            ) : (
              <CaseList onOpenCase={(id) => setOpenCaseId(id)} />
            )}
          </>
        ) : (
          <>
            <h2>{mode === 'login' ? 'Log in' : 'Create your account'}</h2>
            <p className="proto-subtitle">
              {mode === 'login'
                ? 'Access the ClaimRunner prototype.'
                : 'Sign up to start filing your small claim.'}
            </p>

            <div className="proto-tabs" role="tablist">
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

            <form className="proto-form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
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
          </>
        )}
      </div>
    </div>
  );
}
