'use client';
// Add or edit an order. Number first: as soon as it is typed we show the
// customer's history and fill in their name and city from last time.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '@/lib/i18n';
import { displayPhone, formatPhoneTyping, normalizePhone } from '@/lib/phone';
import { formatAmountTyping } from '@/lib/format';
import { confirmationMessage, waLink } from '@/lib/messages';

const COMMON_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta',
  'Hyderabad', 'Gujranwala', 'Sialkot', 'Sargodha', 'Bahawalpur', 'Sukkur', 'Abbottabad', 'Mardan',
];
const QUICK_CITIES = COMMON_CITIES.slice(0, 7); // shown as tap chips; the rest come up as suggestions

// "2500", "2,500" and "2500.50" (rounded to 2501) are fine; "2.5k" or "Rs 2500" are not.
function parseAmount(text) {
  const plain = text.trim().replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(plain)) return NaN;
  return Math.round(parseFloat(plain));
}

const sameCity = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

export default function OrderForm({ existing, orders, refusals, shop, onSave, onClose }) {
  const { t } = useLang();
  const [f, setF] = useState(() => ({
    phone: existing ? displayPhone(existing.phone) : '',
    customer_name: existing?.customer_name || '',
    city: existing?.city || '',
    address: existing?.address || '',
    items: existing?.items || '',
    amount: existing ? formatAmountTyping(String(existing.amount)) : '',
  }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(null); // null, or which button is saving: 'send' / 'only'
  const [saveError, setSaveError] = useState('');
  const setValue = (key, value) => setF((cur) => ({ ...cur, [key]: value }));
  const set = (key, format) => (e) => setValue(key, format ? format(e.target.value) : e.target.value);

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

  // Keep the highlighted city chip in view (for example after a returning customer's city is filled in).
  const cityRow = useRef();
  useEffect(() => {
    const on = cityRow.current?.querySelector('.on');
    if (on) cityRow.current.scrollLeft = on.offsetLeft - cityRow.current.offsetLeft - 16;
  }, [f.city]);

  // Suggestions for the city box, without "lahore" and "Lahore" both showing.
  const cities = useMemo(() => {
    const list = [];
    for (const c of [...COMMON_CITIES, ...orders.map((o) => o.city)]) {
      if (c && !list.some((x) => sameCity(x, c))) list.push(c);
    }
    return list;
  }, [orders]);

  async function submit(send) {
    if (busy) return;
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
    setBusy(send ? 'send' : 'only');
    setSaveError('');
    try {
      await onSave(fields, existing);
    } catch (err) {
      console.error(err);
      if (wa) wa.close();
      setSaveError(t('errorGeneric'));
      setBusy(null);
      return;
    }
    if (send) {
      const link = waLink(phone, confirmationMessage(fields, shop, shop.message_lang));
      if (wa) wa.location.href = link;
      else window.location.href = link; // the empty window was blocked: open WhatsApp in this tab
    }
  }

  const field = (key, label, input, extra) => (
    <div className="field">
      <label className="label" htmlFor={'f-' + key}>
        {label}
      </label>
      {input}
      {errors[key] && <em className="error-text">{errors[key]}</em>}
      {extra}
    </div>
  );
  const busyLabel = (
    <>
      <span className="spinner" aria-hidden="true" />
      {t('saving')}
    </>
  );

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="form-title">
      <div className="sheet-head">
        <h2 id="form-title">{existing ? t('editOrder') : t('newOrderTitle')}</h2>
        <button type="button" className="btn secondary sm" onClick={onClose}>
          {t('close')}
        </button>
      </div>

      <form
        className="sheet-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit(!existing);
        }}
      >
        <div className="sheet-scroll">
          <div className="sheet-body">
            {field(
              'phone',
              t('phone'),
              <input
                id="f-phone"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                autoFocus={!existing}
                className="num"
                placeholder={t('phoneHint')}
                value={f.phone}
                onChange={set('phone', formatPhoneTyping)}
              />
            )}

            {refused > 0 && (
              <div className="warn" role="alert">
                <strong>⚠ {t('refusedWarn', { n: refused })}</strong>
                {t('refusedWarnSub')}
              </div>
            )}
            {others.length > 0 && (
              <p className="note">
                {t('returning', { n: others.length })}
                {delivered > 0 && ' · ' + t('deliveredBefore', { n: delivered })}
              </p>
            )}

            {field(
              'customer_name',
              t('name'),
              <input id="f-customer_name" autoCapitalize="words" value={f.customer_name} onChange={set('customer_name')} />
            )}
            {field(
              'city',
              t('city'),
              <input id="f-city" list="city-list" autoCapitalize="words" value={f.city} onChange={set('city')} />,
              <div className="scroll-row" ref={cityRow}>
                {QUICK_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={'pill' + (sameCity(f.city, c) ? ' on' : '')}
                    aria-pressed={sameCity(f.city, c)}
                    onClick={() => setValue('city', c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            <datalist id="city-list">
              {cities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {field(
              'address',
              t('address'),
              <input id="f-address" value={f.address} onChange={set('address')} />,
              <span className="hint">{t('addressHint')}</span>
            )}
            {field(
              'items',
              t('items'),
              <textarea id="f-items" rows={2} placeholder={t('itemsHint')} value={f.items} onChange={set('items')} />
            )}
            {field(
              'amount',
              t('amount'),
              <div className="prefixed">
                <b aria-hidden="true">Rs</b>
                <input
                  id="f-amount"
                  inputMode="decimal"
                  className="num"
                  placeholder="2,500"
                  value={f.amount}
                  onChange={set('amount', formatAmountTyping)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="sheet-foot">
          <div className="sheet-foot-inner">
            {saveError && (
              <p className="error-text" role="alert">
                {saveError}
              </p>
            )}
            {existing ? (
              <button className="btn primary lg block" disabled={!!busy}>
                {busy ? busyLabel : t('saveChanges')}
              </button>
            ) : (
              <>
                <button className="btn primary lg block" disabled={!!busy}>
                  {busy === 'send' ? busyLabel : t('saveSend')}
                </button>
                <button type="button" className="btn secondary lg block" disabled={!!busy} onClick={() => submit(false)}>
                  {busy === 'only' ? busyLabel : t('saveOnly')}
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
