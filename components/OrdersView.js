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

  const q = query.trim().toLowerCase();
  const digits = q.replace(/\D/g, '').replace(/^0/, '');
  const list = orders.filter(
    (o) =>
      (status === 'all' || o.status === status) &&
      (!q || o.customer_name.toLowerCase().includes(q) || (digits.length >= 3 && o.phone.includes(digits)))
  );

  return (
    <>
      <input
        className="search"
        type="search"
        placeholder={t('search')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="filters">
        {['all', ...STATUSES].map((s) => (
          <button key={s} className={`chip s-${s}` + (status === s ? ' on' : '')} onClick={() => setStatus(s)}>
            {s === 'all' ? t('all') : t('status_' + s)}{' '}
            <small>{s === 'all' ? orders.length : orders.filter((o) => o.status === s).length}</small>
          </button>
        ))}
      </div>

      {list.length === 0 && <p className="empty">{t('noOrders')}</p>}
      {list.slice(0, shown).map((o) => (
        <OrderCard key={o.id} order={o} ctx={ctx} />
      ))}
      {list.length > shown && (
        <button className="btn ghost block" onClick={() => setShown(shown + PAGE)}>
          {t('showMore')}
        </button>
      )}
    </>
  );
}
