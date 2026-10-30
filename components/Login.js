'use client';
// Welcome screen: try the demo, or log in by email with a one-time code (no password to forget).
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/lib/i18n';
import LangToggle from './LangToggle';

// Supabase's own error text is technical English, so show a friendly translated one instead.
function friendlyError(error) {
  console.error(error);
  const text = (error.message || '').toLowerCase();
  if (error.status === 429 || text.includes('rate limit') || text.includes('too many')) return 'errRateLimit';
  if (text.includes('expired') || text.includes('invalid') || text.includes('token')) return 'errBadCode';
  return 'errNetwork';
}

export default function Login({ onTryDemo }) {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(null); // null = button only, 'email', 'code'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function sendCode(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) setError(friendlyError(error));
    else setStep('code');
  }

  async function verify(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) setError(friendlyError(error));
    // On success the app notices the new login by itself and opens.
  }

  const busyLabel = (label) =>
    busy ? (
      <>
        <span className="spinner" aria-hidden="true" />
        {label}
      </>
    ) : (
      label
    );

  return (
    <div className="welcome">
      <div className="welcome-top">
        <LangToggle />
      </div>

      <main className="welcome-main">
        <div className="monogram" aria-hidden="true">
          CC
        </div>
        <h1>{t('headline')}</h1>
        <p className="lede">{t('lede')}</p>

        <button type="button" className="btn primary lg block" onClick={onTryDemo}>
          {t('tryDemo')}
        </button>
        <p className="helper">{t('tryDemoHint')}</p>

        {/* Without Supabase (only on a developer's computer) there is nothing to log in to. */}
        {supabase &&
          (step === null ? (
            <button type="button" className="btn outline lg block" onClick={() => setStep('email')}>
              {t('loginEmail')}
            </button>
          ) : step === 'email' ? (
            <form onSubmit={sendCode}>
              <label className="field">
                <span className="label">{t('email')}</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <button className="btn outline lg block" disabled={busy}>
                {busyLabel(t('sendCode'))}
              </button>
            </form>
          ) : (
            <form onSubmit={verify}>
              <p>{t('codeSent', { email })}</p>
              <label className="field">
                <span className="label">{t('code')}</span>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  required
                  maxLength={10}
                  className="num"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </label>
              <button className="btn outline lg block" disabled={busy}>
                {busyLabel(t('logIn'))}
              </button>
              <button type="button" className="btn secondary block" onClick={() => setStep('email')}>
                {t('changeEmail')}
              </button>
            </form>
          ))}
        {error && (
          <p className="error-text" role="alert">
            {t(error)}
          </p>
        )}
      </main>

      <p className="welcome-foot">{t('welcomeFoot')}</p>
    </div>
  );
}
