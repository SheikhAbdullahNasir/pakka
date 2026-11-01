'use client';
// Welcome screen: try the demo, or log in with a link sent by email (no password to forget).
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/lib/i18n';
import LangToggle from './LangToggle';
import Brand from './Brand';

const RESEND_SECONDS = 60;

// Supabase's own error text is technical English, so show a friendly translated one instead.
function friendlyError(error) {
  console.error(error);
  const text = (error.message || '').toLowerCase();
  if (error.status === 429 || text.includes('rate limit') || text.includes('too many')) return 'errRateLimit';
  return 'errNetwork';
}

export default function Login({ onTryDemo, linkFailed }) {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(linkFailed ? 'email' : null); // null = button only, 'email', 'sent'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(linkFailed ? 'errLinkExpired' : '');
  const [resendAt, setResendAt] = useState(0);
  const [wait, setWait] = useState(0);

  // Counts from the clock, because phones pause timers while the seller is in their email app.
  useEffect(() => {
    if (!resendAt) return;
    const tick = () => setWait(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [resendAt]);

  async function sendLink(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) {
      setError(friendlyError(error));
    } else {
      setResendAt(Date.now() + RESEND_SECONDS * 1000);
      setStep('sent');
    }
  }

  function useDifferentEmail() {
    setError('');
    setStep('email');
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
        <Brand />
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
            <form onSubmit={sendLink}>
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
                {busyLabel(t('sendLink'))}
              </button>
            </form>
          ) : (
            <form onSubmit={sendLink}>
              <p role="status">{t('linkSent')}</p>
              <p className="sent-to">{email.trim()}</p>
              <button className="btn outline lg block" disabled={busy || wait > 0}>
                {wait > 0 ? t('sendAgainIn', { n: wait }) : busyLabel(t('sendAgain'))}
              </button>
              <button type="button" className="link-btn" onClick={useDifferentEmail}>
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
