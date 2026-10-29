'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import * as db from '@/lib/data';
import { useLang } from '@/lib/i18n';
import { confirmationMessage } from '@/lib/messages';
import LangToggle from './LangToggle';

export default function SettingsView({ session, shop, onShopSaved }) {
  const { t } = useLang();
  const [name, setName] = useState(shop.shop_name || '');
  const [msgLang, setMsgLang] = useState(shop.message_lang || 'ur');
  const [status, setStatus] = useState('');

  const sample = {
    customer_name: t('sampleName'),
    items: t('sampleItems'),
    amount: 4500,
    city: t('sampleCity'),
    address: '',
  };

  async function save(e) {
    e.preventDefault();
    setStatus('');
    try {
      onShopSaved(await db.saveShop({ shop_name: name.trim(), message_lang: msgLang }));
      setStatus(t('saved'));
    } catch (err) {
      setStatus(t('errorGeneric') + (err?.message ? ` (${err.message})` : ''));
    }
  }

  return (
    <>
      <form className="section" onSubmit={save}>
        <label className="field">
          <span>{t('shopName')}</span>
          <input maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <div className="field">
          <span>{t('msgLang')}</span>
          <div className="segmented wide">
            <button type="button" className={msgLang === 'ur' ? 'on' : ''} onClick={() => setMsgLang('ur')}>
              Roman Urdu
            </button>
            <button type="button" className={msgLang === 'en' ? 'on' : ''} onClick={() => setMsgLang('en')}>
              English
            </button>
          </div>
        </div>

        <div className="field">
          <span>{t('preview')}</span>
          <pre className="preview">{confirmationMessage(sample, { shop_name: name.trim() }, msgLang)}</pre>
        </div>

        <button className="btn primary block">{t('save')}</button>
        {status && <p className="muted">{status}</p>}
      </form>

      <section className="section">
        <div className="field">
          <span>{t('appLang')}</span>
          <LangToggle />
        </div>
      </section>

      {!session.demo && (
        <section className="section">
          <p className="muted">
            {t('signedInAs')} <strong>{session.user?.email}</strong>
          </p>
          <button className="btn ghost block" onClick={() => supabase.auth.signOut()}>
            {t('signOut')}
          </button>
        </section>
      )}
    </>
  );
}
