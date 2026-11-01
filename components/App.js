'use client';
// The whole app lives here: it checks login, loads orders, and shows one of the screens.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, configMissing, linkSignedIn, linkError } from '@/lib/supabase';
import * as db from '@/lib/data';
import { LangContext, makeT, useLang } from '@/lib/i18n';
import { ordersToCsv, downloadCsv } from '@/lib/csv';
import Login from './Login';
import LangToggle from './LangToggle';
import Brand from './Brand';
import OrderForm from './OrderForm';
import TodayView from './TodayView';
import OrdersView from './OrdersView';
import SettingsView from './SettingsView';
import { OrderActionsSheet } from './OrderCard';
import { TodayIcon, OrdersIcon, SettingsIcon } from './Icons';

const LANG_KEY = 'cod-confirmer-lang';
const now = () => new Date().toISOString();

export default function App() {
  const [lang, setLang] = useState('en');
  const [session, setSession] = useState(undefined); // undefined = still checking
  const [demo, setDemo] = useState(false);
  const [demoRun, setDemoRun] = useState(0); // goes up on "Reset demo" so the screen reloads
  const [linkFailed, setLinkFailed] = useState(false); // the email link had expired or was already used

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'ur') setLang(saved);
    } catch {}

    if (configMissing) return;
    // Tapping the email link means the seller wants their real account, even if demo was left on.
    if (linkSignedIn || linkError) db.exitDemo();
    setDemo(db.demoWasOn());
    if (!supabase) {
      setSession(null);
      return;
    }
    setLinkFailed(linkError);
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      // Leave a clean address: no "#", and no error text from a failed link.
      if (linkSignedIn || linkError) {
        window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // Tells phones and screen readers which language the page is in.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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

  const demoActions = {
    start: () => {
      setLinkFailed(false);
      db.startDemo();
      setDemo(true);
    },
    reset: () => {
      if (!window.confirm(langValue.t('confirmResetDemo'))) return;
      db.resetDemo();
      setDemoRun((n) => n + 1);
    },
    exit: () => {
      db.exitDemo();
      setDemo(false);
    },
  };

  return (
    <LangContext.Provider value={langValue}>
      {configMissing ? (
        <ConfigError />
      ) : demo ? (
        <Main key={'demo-' + demoRun} session={{ demo: true }} demoActions={demoActions} />
      ) : session === undefined ? (
        <div className="center muted">{langValue.t('loading')}</div>
      ) : !session ? (
        <Login onTryDemo={demoActions.start} linkFailed={linkFailed} />
      ) : (
        <Main key={session.user.id} session={session} />
      )}
    </LangContext.Provider>
  );
}

// Shown on a live site where the two Supabase settings were never added.
function ConfigError() {
  const { t } = useLang();
  return (
    <div className="welcome">
      <div className="welcome-top">
        <LangToggle />
      </div>
      <main className="welcome-main">
        <Brand />
        <h1>{t('configErrorTitle')}</h1>
        <p className="lede">{t('configErrorBody')}</p>
        <pre className="code-block">{'NEXT_PUBLIC_SUPABASE_URL\nNEXT_PUBLIC_SUPABASE_ANON_KEY'}</pre>
        <p className="muted">{t('configErrorFix')}</p>
      </main>
      <p className="welcome-foot">{t('welcomeFoot')}</p>
    </div>
  );
}

function Main({ session, demoActions }) {
  const { t } = useLang();
  const [orders, setOrders] = useState(null);
  const [refusals, setRefusals] = useState({});
  const [shop, setShop] = useState({ shop_name: '', message_lang: 'ur' });
  const [tab, setTab] = useState('today');
  const [form, setForm] = useState(null); // null = closed, {} = new order, { order } = editing
  const [sheetId, setSheetId] = useState(null); // order whose "···" sheet is open
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
      .catch((e) => {
        console.error(e);
        setLoadError(true);
      });
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
  // Returns true if it was saved.
  async function patchOrder(id, patch) {
    const before = ordersRef.current.find((o) => o.id === id);
    if (!before) return false;
    replaceLocal({ ...before, ...patch });
    try {
      replaceLocal(await db.updateOrder(id, patch));
      return true;
    } catch (e) {
      console.error(e);
      replaceLocal(before);
      showToast(t('errorGeneric'));
      return false;
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
    // Refused orders stay, so the red warning keeps working for that number.
    if (order.status === 'refused') {
      showToast(t('refusedNoDelete'));
      return;
    }
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await db.deleteOrder(order.id);
      setOrders((os) => os.filter((o) => o.id !== order.id));
      refreshRefusals();
    } catch (e) {
      console.error(e);
      showToast(t('errorGeneric'));
    }
  }

  async function exportForCourier(list) {
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`cod-orders-${date}.csv`, ordersToCsv(list));
    // Give the download a moment to start before asking.
    await new Promise((r) => setTimeout(r, 400));
    if (!window.confirm(t('markAllShipped', { n: list.length }))) return;
    const results = await Promise.all(
      list.map((o) => patchOrder(o.id, { status: 'shipped', status_changed_at: now() }))
    );
    const done = results.filter(Boolean).length;
    const failed = list.length - done;
    showToast(failed ? t('markedShippedFailed', { n: done, f: failed }) : t('markedShipped', { n: done }));
  }

  const ctx = {
    refusals,
    shop,
    setStatus,
    recordMessage,
    onEdit: (order) => setForm({ order }),
    onDelete: removeOrder,
    openMore: (order) => setSheetId(order.id),
  };
  const sheetOrder = sheetId && orders?.find((o) => o.id === sheetId);
  const title = t('tab' + tab[0].toUpperCase() + tab.slice(1));

  const navButton = (name, Icon) => (
    <button
      className={'nav-btn' + (tab === name ? ' on' : '')}
      aria-current={tab === name ? 'page' : undefined}
      onClick={() => setTab(name)}
    >
      <Icon />
      {t('tab' + name[0].toUpperCase() + name.slice(1))}
    </button>
  );

  return (
    <div className="app">
      <header className="topbar">
        <h1>{title}</h1>
        <LangToggle />
      </header>

      {session.demo && (
        <div className="demo-strip">
          <span>{t('demoMode')}</span>
          <span className="links">
            <button className="link-btn" onClick={demoActions.reset}>
              {t('resetShort')}
            </button>
            <span aria-hidden="true">·</span>
            <button className="link-btn" onClick={demoActions.exit}>
              {t('exitShort')}
            </button>
          </span>
        </div>
      )}
      {loadError && (
        <div className="banner" role="alert">
          {t('errLoad')}
        </div>
      )}

      <main className="content">
        {orders === null ? (
          !loadError && <p className="center muted">{t('loading')}</p>
        ) : tab === 'today' ? (
          <TodayView orders={orders} ctx={ctx} onExport={exportForCourier} onNew={() => setForm({})} />
        ) : tab === 'orders' ? (
          <OrdersView orders={orders} ctx={ctx} />
        ) : (
          <SettingsView session={session} shop={shop} onShopSaved={setShop} onExitDemo={demoActions?.exit} />
        )}
      </main>

      <nav className="bottombar">
        <div className="bottombar-inner">
          {navButton('today', TodayIcon)}
          {navButton('orders', OrdersIcon)}
          <button className="nav-new" onClick={() => setForm({})} disabled={orders === null}>
            {t('tabNew')}
          </button>
          {navButton('settings', SettingsIcon)}
        </div>
      </nav>

      {sheetOrder && <OrderActionsSheet order={sheetOrder} ctx={ctx} onClose={() => setSheetId(null)} />}

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
        <div className={'toast' + (form ? ' over-sheet' : '')} role="status">
          <span>{toast.text}</span>
          {toast.undo && <button onClick={toast.undo}>{t('undo')}</button>}
        </div>
      )}
    </div>
  );
}
