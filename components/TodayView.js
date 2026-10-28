'use client';
// The daily screen: what to ship, who still has to reply, and what came back.
import { useLang } from '@/lib/i18n';
import OrderCard from './OrderCard';

const oldestFirst = (a, b) => a.created_at.localeCompare(b.created_at);

export default function TodayView({ orders, ctx, onExport }) {
  const { t } = useLang();
  const confirmed = orders.filter((o) => o.status === 'confirmed').sort(oldestFirst);
  const waiting = orders.filter((o) => o.status === 'waiting').sort(oldestFirst);
  const shipped = orders.filter((o) => o.status === 'shipped').sort(oldestFirst);

  if (!orders.length) return <p className="empty">{t('emptyApp')}</p>;

  return (
    <>
      <div className="summary">
        <div className="stat s-confirmed">
          <b>{confirmed.length}</b>
          <span>{t('readyToShip')}</span>
        </div>
        <div className="stat s-waiting">
          <b>{waiting.length}</b>
          <span>{t('waitingReply')}</span>
        </div>
        <div className="stat s-shipped">
          <b>{shipped.length}</b>
          <span>{t('status_shipped')}</span>
        </div>
      </div>

      <Section title={t('readyToShip')} list={confirmed} ctx={ctx}>
        {confirmed.length > 0 && (
          <button className="btn primary block" onClick={() => onExport(confirmed)}>
            ⬇ {t('exportCsv')} ({confirmed.length})
          </button>
        )}
      </Section>
      <Section title={t('waitingReply')} list={waiting} ctx={ctx} />
      <Section title={t('outForDelivery')} list={shipped} ctx={ctx} />
    </>
  );
}

function Section({ title, list, ctx, children }) {
  const { t } = useLang();
  return (
    <section className="section">
      <h2>
        {title} <span className="count">{list.length}</span>
      </h2>
      {children}
      {list.length === 0 ? (
        <p className="muted">{t('nothingHere')}</p>
      ) : (
        list.map((o) => <OrderCard key={o.id} order={o} ctx={ctx} />)
      )}
    </section>
  );
}
