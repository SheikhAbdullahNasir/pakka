'use client';
// One order: who, what, how much, its status, and a big button for the next step.
// Everything else (any status, chat, edit, delete) is in the "···" sheet.
import { useEffect, useRef } from 'react';
import { useLang, timeAgo } from '@/lib/i18n';
import { displayPhone } from '@/lib/phone';
import { titleCase } from '@/lib/format';
import { confirmationMessage, reminderMessage, rupees, waLink } from '@/lib/messages';

export const STATUSES = ['waiting', 'confirmed', 'cancelled', 'shipped', 'delivered', 'refused'];

export function StatusChip({ status }) {
  const { t } = useLang();
  return <span className={`status-chip st-${status}`}>{t('status_' + status)}</span>;
}

export default function OrderCard({ order, ctx }) {
  const { t } = useLang();

  // Refusals by this number on OTHER orders.
  const refused = (ctx.refusals[order.phone] || 0) - (order.status === 'refused' ? 1 : 0);

  const sent = order.messages_sent > 0;
  const msgLang = ctx.shop.message_lang || 'ur';
  const message = sent ? reminderMessage(order, ctx.shop, msgLang) : confirmationMessage(order, ctx.shop, msgLang);
  const showAddress = order.address && (order.status === 'confirmed' || order.status === 'shipped');

  const waButton = (label, kind) => (
    <a
      className={`btn ${kind}`}
      href={waLink(order.phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => ctx.recordMessage(order)}
    >
      {label}
    </a>
  );
  const statusButton = (status, label, kind) => (
    <button className={`btn ${kind}`} onClick={() => ctx.setStatus(order, status)}>
      {label}
    </button>
  );

  let main = null;
  if (order.status === 'waiting') {
    main = sent ? (
      <>
        {statusButton('confirmed', t('markConfirmed'), 'primary')}
        {waButton(t('remind'), 'secondary narrow')}
      </>
    ) : (
      waButton(t('sendConfirm'), 'primary')
    );
  } else if (order.status === 'confirmed') {
    main = statusButton('shipped', t('markShipped'), 'accent');
  } else if (order.status === 'shipped') {
    main = (
      <>
        {statusButton('delivered', t('markDelivered'), 'primary')}
        {statusButton('refused', t('markRefused'), 'danger-outline')}
      </>
    );
  }

  return (
    <article className="card">
      {refused > 0 && <div className="card-warn">⚠ {t('refusedWarn', { n: refused })}</div>}

      <div className="card-title">
        <strong>{titleCase(order.customer_name)}</strong>
        <span className="amount">{rupees(order.amount)}</span>
      </div>
      <div className="card-meta">
        {displayPhone(order.phone)} · {titleCase(order.city)} · {timeAgo(order.created_at, t)}
      </div>
      <div className="card-items">{order.items}</div>
      {showAddress && <div className="card-address">{order.address}</div>}

      <div className="card-state">
        <StatusChip status={order.status} />
        {sent ? (
          <span>{t('sentAgo', { t: timeAgo(order.last_message_at, t) })}</span>
        ) : (
          order.status === 'waiting' && <span>{t('notSent')}</span>
        )}
      </div>

      <div className="actions">
        {main && <div className="main">{main}</div>}
        <button className="btn more-btn" aria-label={t('moreActions')} onClick={() => ctx.openMore(order)}>
          ···
        </button>
      </div>
    </article>
  );
}

// The "···" bottom sheet: every status, chat, edit, delete.
export function OrderActionsSheet({ order, ctx, onClose }) {
  const { t } = useLang();
  const first = useRef();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Focus the sheet once when it opens; Escape closes it.
  useEffect(() => {
    first.current?.focus();
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const then = (fn) => () => {
    onClose();
    fn();
  };

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="bsheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className="grab" />
        <h3 id="sheet-title">
          {titleCase(order.customer_name)} · <span className="num">{rupees(order.amount)}</span>
        </h3>

        <div className="label">{t('changeStatus')}</div>
        <div className="status-grid">
          {STATUSES.map((s, i) => (
            <button
              key={s}
              ref={i === 0 ? first : undefined}
              className={`st-${s}`}
              aria-pressed={s === order.status}
              onClick={then(() => ctx.setStatus(order, s))}
            >
              {s === order.status && '✓ '}
              {t('status_' + s)}
            </button>
          ))}
        </div>

        <div className="sheet-list">
          <a
            className="btn secondary"
            href={waLink(order.phone)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            {t('openChat')}
          </a>
          <button className="btn secondary" onClick={then(() => ctx.onEdit(order))}>
            {t('edit')}
          </button>
          <button className="btn secondary danger-text" onClick={then(() => ctx.onDelete(order))}>
            {t('delete')}
          </button>
          <button className="btn outline" onClick={onClose}>
            {t('close')}
          </button>
        </div>
      </div>
    </>
  );
}
