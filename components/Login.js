'use client';
// Email login with a one-time code (no password to forget).
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/lib/i18n';
import LangToggle from './LangToggle';

export default function Login() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email');
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
    if (error) setError(error.message);
    else setStep('code');
  }

  async function verify(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) setError(error.message);
    // On success the app notices the new login by itself and opens.
  }

  return (
    <div className="login">
      <div className="login-top">
        <LangToggle />
      </div>
      <h1>COD Confirmer</h1>
      <h2>{t('loginTitle')}</h2>
      <p className="muted">{t('loginWhy')}</p>

      {step === 'email' ? (
        <form onSubmit={sendCode}>
          <label className="field">
            <span>{t('email')}</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button className="btn primary block" disabled={busy}>
            {t('sendCode')}
          </button>
        </form>
      ) : (
        <form onSubmit={verify}>
          <p>{t('codeSent', { email })}</p>
          <label className="field">
            <span>{t('code')}</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </label>
          <button className="btn primary block" disabled={busy}>
            {t('logIn')}
          </button>
          <button type="button" className="btn ghost block" onClick={() => setStep('email')}>
            {t('changeEmail')}
          </button>
        </form>
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
