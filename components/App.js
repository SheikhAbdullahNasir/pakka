'use client';
// The whole app lives here: it checks login, loads orders, and shows one of the screens.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, isDemo } from '@/lib/supabase';
import * as db from '@/lib/data';
import { LangContext, makeT, useLang } from '@/lib/i18n';
import { ordersToCsv, downloadCsv } from '@/lib/csv';
import Login from './Login';
import LangToggle from './LangToggle';
import OrderForm from './OrderForm';
import TodayView from './TodayView';
import OrdersView from './OrdersView';
import SettingsView from './SettingsView';

const LANG_KEY = 'cod-confirmer-lang';
const now = () => new Date().toISOString();

export default function App() {
  const [lang, setLang] = useState('en');
  const [session, setSession] = useState(undefined); // undefined = still checking

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'ur') setLang(saved);
    } catch {}

    if (!supabase) {
      setSession({ demo: true });
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const langValue = useMemo(
    () => ({
      lang,
      t: makeT(lang),
      changeLang: (l) => {
        setLang(l);
        try {
          localStorage.setItem(LANG_KEY, l);
        } catch {}
      },
    }),
    [lang]
  );

  return (
    <LangContext.Provider value={langValue}>
      {session === undefined ? (
        <div className="center muted">{langValue.t('loading')}</div>
      ) : !session ? (
        <Login />
      ) : (
        <Main key={session.user?.id || 'demo'} session={session} />
      )}
    </LangContext.Provider>
  );
}

function Main({ session }) {
  const { t } = useLang();
  const [orders, setOrders] = useState(null);
  const [refusals, setRefusals] = useState({});
  const [shop, setShop] = useState({ shop_name: '', message_lang: 'ur' });
  const [tab, setTab] = useState('today');
  const [form, setForm] = useState(null); // null = closed, {} = new order, { order } = editing
  const [toast, setToast] = useState(null);
  const [loadError, setLoadError] = useState('');
  const toastTimer = useRef();
  const ordersRef = useRef([]);
  ordersRef.current = orders || [];

  const refreshRefusals = useCallback(() => db.refusalCounts().then(setRefusals).catch(() => {}), []);

  useEffect(() => {
    Promise.all([db.listOrders(), db.refusalCounts(), db.getShop()])
      .then(([o, r, s]) => {
        setOrders(o);
        setRefusals(r);
        if (s) setShop(s);
      })
      .catch((e) => setLoadError(e.message || String(e)));
  }, []);

  function showToast(text, undo) {
    clearTimeout(toastTimer.current);
    setToast({ text, undo });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }

  function replaceLocal(row) {
    setOrders((os) => os.map((o) => (o.id === row.id ? row : o)));
  }

  // Changes the screen straight away, then saves. If saving fails, puts it back.
  async function patchOrder(id, patch) {
    const before = ordersRef.current.find((o) => o.id === id);
    if (!before) return;
    replaceLocal({ ...before, ...patch });
    try {
      replaceLocal(await db.updateOrder(id, patch));
    } catch {
      replaceLocal(before);
      showToast(t('errorGeneric'));
    }
  }

  function setStatus(order, status) {
    if (order.status === status) return;
    const previous = order.status;
    patchOrder(order.id, { status, status_changed_at: now() }).then(refreshRefusals);
    showToast(t('statusChanged', { s: t('status_' + status) }), () => {
      setToast(null);
      patchOrder(order.id, { status: previous, status_changed_at: now() }).then(refreshRefusals);
    });
  }

  function recordMessage(order) {
    patchOrder(order.id, { messages_sent: (order.messages_sent || 0) + 1, last_message_at: now() });
  }

  // Called by the order form. Throws if saving fails, so the form stays open.
  async function saveOrder(fields, existing) {
    if (existing) {
      replaceLocal(await db.updateOrder(existing.id, fields));
    } else {
      const row = await db.createOrder(fields);
      setOrders((os) => [row, ...os]);
    }
    setForm(null);
    refreshRefusals();
  }

  async function removeOrder(order) {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await db.deleteOrder(order.id);
      setOrders((os) => os.filter((o) => o.id !== order.id));
      refreshRefusals();
    } catch {
      showToast(t('errorGeneric'));
    }
  }

  async function exportForCourier(list) {
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`cod-orders-${date}.csv`, ordersToCsv(list));
    // Give the download a moment to start before asking.
    await new Promise((r) => setTimeout(r, 400));
    if (!window.confirm(t('markAllShipped', { n: list.length }))) return;
    await Promise.all(list.map((o) => patchOrder(o.id, { status: 'shipped', status_changed_at: now() })));
    showToast(t('markedShipped', { n: list.length }));
  }

  const ctx = {
    refusals,
    shop,
    setStatus,
    recordMessage,
    onEdit: (order) => setForm({ order }),
    onDelete: removeOrder,
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1>COD Confirmer</h1>
        <LangToggle />
      </header>

      {isDemo && <div className="banner">{t('demoBanner')}</div>}
      {loadError && <div className="banner danger">{loadError}</div>}

      <main className="content">
        {orders === null ? (
          !loadError && <p className="center muted">{t('loading')}</p>
        ) : tab === 'today' ? (
          <TodayView orders={orders} ctx={ctx} onExport={exportForCourier} />
        ) : tab === 'orders' ? (
          <OrdersView orders={orders} ctx={ctx} />
        ) : (
          <SettingsView session={session} shop={shop} onShopSaved={setShop} />
        )}
      </main>

      {tab !== 'settings' && orders !== null && (
        <button className="fab" onClick={() => setForm({})}>
          {t('newOrder')}
        </button>
      )}

      <nav className="tabbar">
        {['today', 'orders', 'settings'].map((name) => (
          <button key={name} className={tab === name ? 'on' : ''} onClick={() => setTab(name)}>
            {t('tab' + name[0].toUpperCase() + name.slice(1))}
          </button>
        ))}
      </nav>

      {form && (
        <OrderForm
          existing={form.order}
          orders={orders || []}
          refusals={refusals}
          shop={shop}
          onSave={saveOrder}
          onClose={() => setForm(null)}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          <span>{toast.text}</span>
          {toast.undo && <button onClick={toast.undo}>{t('undo')}</button>}
        </div>
      )}
    </div>
  );
}
