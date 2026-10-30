'use client';
// All orders, with search and a status filter.
import { useState } from 'react';
import { useLang } from '@/lib/i18n';
import OrderCard, { STATUSES } from './OrderCard';

const PAGE = 50;

export default function OrdersView({ orders, ctx }) {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [shown, setShown] = useState(PAGE);

  // Text matches name or items; 3+ digits match anywhere in the number (so the last 4 digits work).
  const q = query.trim().toLowerCase();
  const digits = q.replace(/\D/g, '').replace(/^0/, '');
  const list = orders.filter(
    (o) =>
      (status === 'all' || o.status === status) &&
      (!q ||
        o.customer_name.toLowerCase().includes(q) ||
        o.items.toLowerCase().includes(q) ||
        (digits.length >= 3 && o.phone.includes(digits)))
  );

  return (
    <>
      <input
        className="search"
        type="search"
        aria-label={t('search')}
        placeholder={t('search')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="scroll-row filters">
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            className={'pill' + (status === s ? ' on' : '')}
            aria-pressed={status === s}
            onClick={(e) => {
              setStatus(s);
              e.currentTarget.scrollIntoView({ inline: 'nearest', block: 'nearest' });
            }}
          >
            {s === 'all' ? t('all') : t('status_' + s)}
            <small className="num">{s === 'all' ? orders.length : orders.filter((o) => o.status === s).length}</small>
          </button>
        ))}
      </div>

      {list.length === 0 && <p className="empty">{t('noOrders')}</p>}
      {list.slice(0, shown).map((o) => (
        <OrderCard key={o.id} order={o} ctx={ctx} />
      ))}
      {list.length > shown && (
        <button className="btn secondary block" onClick={() => setShown(shown + PAGE)}>
          {t('showMore')}
        </button>
      )}
    </>
  );
}
