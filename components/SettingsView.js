'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import * as db from '@/lib/data';
import { useLang } from '@/lib/i18n';
import { confirmationMessage } from '@/lib/messages';
import LangToggle from './LangToggle';

export default function SettingsView({ session, shop, onShopSaved, onExitDemo }) {
  const { t } = useLang();
  const [name, setName] = useState(shop.shop_name || '');
  const [msgLang, setMsgLang] = useState(shop.message_lang || 'ur');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const sample = {
    customer_name: t('sampleName'),
    items: t('sampleItems'),
    amount: 4500,
    city: t('sampleCity'),
    address: '',
  };

  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setStatus('');
    setBusy(true);
    try {
      onShopSaved(await db.saveShop({ shop_name: name.trim(), message_lang: msgLang }));
      setStatus(t('saved'));
    } catch (err) {
      console.error(err);
      setStatus(t('errorGeneric'));
    }
    setBusy(false);
  }

  return (
    <>
      <form className="panel" onSubmit={save}>
        <label className="field">
          <span className="label">{t('shopName')}</span>
          <input maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <div className="field">
          <span className="label">{t('msgLang')}</span>
          <div className="lang wide" role="group" aria-label={t('msgLang')}>
            {[
              ['ur', 'Roman Urdu'],
              ['en', 'English'],
            ].map(([code, label]) => (
              <button
                key={code}
                type="button"
                className={msgLang === code ? 'on' : ''}
                aria-pressed={msgLang === code}
                onClick={() => setMsgLang(code)}
              >
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="label">{t('preview')}</span>
          <pre className="preview">{confirmationMessage(sample, { shop_name: name.trim() }, msgLang)}</pre>
        </div>

        <button className="btn primary lg block" disabled={busy}>
          {busy ? (
            <>
              <span className="spinner" aria-hidden="true" />
              {t('saving')}
            </>
          ) : (
            t('save')
          )}
        </button>
        {status && (
          <p className="saved-note" role="status">
            {status}
          </p>
        )}
      </form>

      <section className="panel">
        <div className="field">
          <span className="label">{t('appLang')}</span>
          <LangToggle wide />
        </div>
      </section>

      <section className="panel">
        {session.demo ? (
          <button className="btn outline lg block" onClick={onExitDemo}>
            {t('exitDemo')}
          </button>
        ) : (
          <>
            <p className="muted" style={{ marginBottom: 12, overflowWrap: 'anywhere' }}>
              {t('signedInAs')} <strong>{session.user?.email}</strong>
            </p>
            <button className="btn outline lg block" onClick={() => supabase.auth.signOut()}>
              {t('signOut')}
            </button>
          </>
        )}
      </section>
    </>
  );
}
