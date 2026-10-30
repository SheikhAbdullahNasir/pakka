'use client';
// The daily screen: who still has to reply, what to ship, and what came back.
// Shows every order that needs action, not only orders created today.
import { useLang } from '@/lib/i18n';
import OrderCard from './OrderCard';

const oldestFirst = (a, b) => a.created_at.localeCompare(b.created_at);

export default function TodayView({ orders, ctx, onExport, onNew }) {
  const { t } = useLang();
  const waiting = orders.filter((o) => o.status === 'waiting').sort(oldestFirst);
  const confirmed = orders.filter((o) => o.status === 'confirmed').sort(oldestFirst);
  const shipped = orders.filter((o) => o.status === 'shipped').sort(oldestFirst);

  if (!waiting.length && !confirmed.length && !shipped.length) {
    return (
      <div className="empty-state">
        <p>{orders.length ? t('allClear') : t('emptyApp')}</p>
        <button className="btn primary lg" onClick={onNew}>
          {t('newOrderTitle')}
        </button>
      </div>
    );
  }

  return (
    <>
      <Section title={t('waitingReply')} empty={t('emptyWaiting')} list={waiting} ctx={ctx} />
      <Section
        title={t('readyToShip')}
        empty={t('emptyReady')}
        list={confirmed}
        ctx={ctx}
        action={
          confirmed.length > 0 && (
            <button className="btn accent sm" onClick={() => onExport(confirmed)}>
              {t('exportCsv')}
            </button>
          )
        }
      />
      <Section title={t('outForDelivery')} empty={t('emptyShipped')} list={shipped} ctx={ctx} />
    </>
  );
}

function Section({ title, empty, list, ctx, action }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>
          {title} <span className="num">· {list.length}</span>
        </h2>
        {action}
      </div>
      {list.length === 0 ? (
        <p className="section-empty">{empty}</p>
      ) : (
        list.map((o) => <OrderCard key={o.id} order={o} ctx={ctx} />)
      )}
    </section>
  );
}
