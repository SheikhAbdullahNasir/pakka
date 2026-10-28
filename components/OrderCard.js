'use client';
// One order: who, what, how much, its status, and big buttons for the next step.
import { useState } from 'react';
import { useLang, timeAgo } from '@/lib/i18n';
import { displayPhone } from '@/lib/phone';
import { confirmationMessage, reminderMessage, rupees, waLink } from '@/lib/messages';

export const STATUSES = ['waiting', 'confirmed', 'cancelled', 'shipped', 'delivered', 'refused'];

export default function OrderCard({ order, ctx }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  // Refusals by this number on OTHER orders.
  const refused = (ctx.refusals[order.phone] || 0) - (order.status === 'refused' ? 1 : 0);

  const sent = order.messages_sent > 0;
  const msgLang = ctx.shop.message_lang || 'ur';
  const message = sent ? reminderMessage(order, ctx.shop, msgLang) : confirmationMessage(order, ctx.shop, msgLang);

  const statusButton = (status) => (
    <button key={status} className={`btn s-${status}`} onClick={() => ctx.setStatus(order, status)}>
      {t('status_' + status)}
    </button>
  );

  return (
    <article className={`card`}>
      <button className="card-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="card-title">
          <strong>{order.customer_name}</strong>
          <span className="amount">{rupees(order.amount)}</span>
        </div>
        <div className="card-sub">
          {displayPhone(order.phone)} · {order.city} · {timeAgo(order.created_at, t)}
        </div>
        <div className="card-items">{order.items}</div>
        <span className={`badge s-${order.status}`}>{t('status_' + order.status)}</span>
      </button>

      {refused > 0 && <div className="warn">⚠ {t('refusedWarn', { n: refused })}</div>}

      {order.status === 'waiting' && (
        <div className="card-note muted">
          {sent ? t('sentAgo', { t: timeAgo(order.last_message_at, t) }) : t('notSent')}
        </div>
      )}

      <div className="actions">
        {order.status === 'waiting' && (
          <>
            <a
              className="btn wa wide"
              href={waLink(order.phone, message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => ctx.recordMessage(order)}
            >
              {sent ? t('remind') : t('sendConfirm')}
            </a>
            {statusButton('confirmed')}
            {statusButton('cancelled')}
          </>
        )}
        {order.status === 'confirmed' && statusButton('shipped')}
        {order.status === 'shipped' && (
          <>
            {statusButton('delivered')}
            {statusButton('refused')}
          </>
        )}
        <button className="btn ghost" onClick={() => setOpen(!open)}>
          {open ? t('less') : t('more')}
        </button>
      </div>

      {open && (
        <div className="more">
          <div className="label">{t('changeStatus')}</div>
          <div className="status-grid">
            {STATUSES.map((s) => (
              <button
                key={s}
                className={`chip s-${s}` + (s === order.status ? ' on' : '')}
                onClick={() => ctx.setStatus(order, s)}
              >
                {t('status_' + s)}
              </button>
            ))}
          </div>
          {order.address && <p className="muted">{order.address}</p>}
          <div className="actions">
            <a className="btn ghost" href={waLink(order.phone)} target="_blank" rel="noopener noreferrer">
              {t('openChat')}
            </a>
            <button className="btn ghost" onClick={() => ctx.onEdit(order)}>
              {t('edit')}
            </button>
            <button className="btn ghost danger" onClick={() => ctx.onDelete(order)}>
              {t('delete')}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
