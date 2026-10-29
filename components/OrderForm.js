'use client';
// Add or edit an order. Number first: as soon as it is typed we show the
// customer's history and fill in their name and city from last time.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '@/lib/i18n';
import { displayPhone, normalizePhone } from '@/lib/phone';
import { confirmationMessage, waLink } from '@/lib/messages';

const COMMON_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta',
  'Hyderabad', 'Gujranwala', 'Sialkot', 'Sargodha', 'Bahawalpur', 'Sukkur', 'Abbottabad', 'Mardan',
];

// "2500", "2,500" and "2500.50" (rounded to 2501) are fine; "2.5k" or "Rs 2500" are not.
function parseAmount(text) {
  const plain = text.trim().replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(plain)) return NaN;
  return Math.round(parseFloat(plain));
}

export default function OrderForm({ existing, orders, refusals, shop, onSave, onClose }) {
  const { t } = useLang();
  const [f, setF] = useState(() => ({
    phone: existing ? displayPhone(existing.phone) : '',
    customer_name: existing?.customer_name || '',
    city: existing?.city || '',
    address: existing?.address || '',
    items: existing?.items || '',
    amount: existing ? String(existing.amount) : '',
  }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const set = (key) => (e) => setF((cur) => ({ ...cur, [key]: e.target.value }));

  const phone = normalizePhone(f.phone);
  const others = useMemo(
    () => (phone ? orders.filter((o) => o.phone === phone && o.id !== existing?.id) : []),
    [phone, orders, existing]
  );
  const refused = phone
    ? (refusals[phone] || 0) - (existing?.phone === phone && existing.status === 'refused' ? 1 : 0)
    : 0;
  const delivered = others.filter((o) => o.status === 'delivered').length;

  // Returning customer: fill empty fields from their latest order (once per number).
  const filledFor = useRef(null);
  useEffect(() => {
    if (existing || !others.length || filledFor.current === phone) return;
    filledFor.current = phone;
    const last = others[0];
    setF((cur) => ({
      ...cur,
      customer_name: cur.customer_name || last.customer_name,
      city: cur.city || last.city,
      address: cur.address || last.address,
    }));
  }, [others, phone, existing]);

  const cities = useMemo(
    () => [...new Set([...orders.map((o) => o.city).filter(Boolean), ...COMMON_CITIES])],
    [orders]
  );

  async function submit(send) {
    const amount = parseAmount(f.amount);
    const e = {};
    if (!phone) e.phone = t('phoneInvalid');
    if (!f.customer_name.trim()) e.customer_name = t('required');
    if (!f.city.trim()) e.city = t('required');
    if (!f.items.trim()) e.items = t('required');
    if (!(amount > 0)) e.amount = t('amountInvalid');
    setErrors(e);
    if (Object.keys(e).length) return;

    const fields = {
      customer_name: f.customer_name.trim(),
      phone,
      city: f.city.trim(),
      address: f.address.trim(),
      items: f.items.trim(),
      amount,
    };
    // Phones block new windows opened after waiting for the save, so open an
    // empty one now, during the tap, and only send it to WhatsApp once the order is saved.
    let wa = null;
    if (send) {
      wa = window.open('', '_blank');
      if (wa) wa.opener = null;
      fields.messages_sent = 1;
      fields.last_message_at = new Date().toISOString();
    }
    setBusy(true);
    setSaveError('');
    try {
      await onSave(fields, existing);
    } catch (err) {
      if (wa) wa.close();
      setSaveError(t('errorGeneric') + (err?.message ? ` (${err.message})` : ''));
      setBusy(false);
      return;
    }
    if (send) {
      const link = waLink(phone, confirmationMessage(fields, shop, shop.message_lang));
      if (wa) wa.location.href = link;
      else window.location.href = link; // the empty window was blocked: open WhatsApp in this tab
    }
  }

  const field = (key, label, input) => (
    <label className="field">
      <span>{label}</span>
      {input}
      {errors[key] && <em className="error-text">{errors[key]}</em>}
    </label>
  );

  return (
    <div className="sheet" role="dialog" aria-modal="true">
      <form
        className="sheet-body"
        onSubmit={(e) => {
          e.preventDefault();
          submit(!existing);
        }}
      >
        <div className="sheet-head">
          <h2>{existing ? t('editOrder') : t('newOrderTitle')}</h2>
          <button type="button" className="btn ghost" onClick={onClose}>
            {t('close')}
          </button>
        </div>

        {field(
          'phone',
          t('phone'),
          <input
            type="tel"
            inputMode="tel"
            autoComplete="off"
            autoFocus={!existing}
            placeholder={t('phoneHint')}
            value={f.phone}
            onChange={set('phone')}
          />
        )}

        {refused > 0 && (
          <div className="warn big">
            <strong>⚠ {t('refusedWarn', { n: refused })}</strong>
            <div>{t('refusedWarnSub')}</div>
          </div>
        )}
        {others.length > 0 && (
          <div className="info">
            {t('returning', { n: others.length })}
            {delivered > 0 && ' · ' + t('deliveredBefore', { n: delivered })}
          </div>
        )}

        {field(
          'customer_name',
          t('name'),
          <input autoCapitalize="words" value={f.customer_name} onChange={set('customer_name')} />
        )}
        {field(
          'city',
          t('city'),
          <input list="city-list" autoCapitalize="words" value={f.city} onChange={set('city')} />
        )}
        <datalist id="city-list">
          {cities.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        {field('address', t('address'), <input value={f.address} onChange={set('address')} />)}
        {field(
          'items',
          t('items'),
          <textarea rows={2} placeholder={t('itemsHint')} value={f.items} onChange={set('items')} />
        )}
        {field(
          'amount',
          t('amount'),
          <input inputMode="numeric" placeholder="2500" value={f.amount} onChange={set('amount')} />
        )}

        {saveError && <p className="error-text">{saveError}</p>}

        <div className="sheet-foot">
          {existing ? (
            <button className="btn primary block" disabled={busy}>
              {t('saveChanges')}
            </button>
          ) : (
            <>
              <button className="btn wa block" disabled={busy}>
                {t('saveSend')}
              </button>
              <button type="button" className="btn ghost block" disabled={busy} onClick={() => submit(false)}>
                {t('saveOnly')}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
