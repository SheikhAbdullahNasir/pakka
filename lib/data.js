// Every read and write of orders goes through this file.
// Normally it talks to the online database (Supabase);
// in demo mode it uses the browser's own storage instead.
import { supabase as online } from './supabase';

const DEMO_KEY = 'cod-confirmer-demo';
const DEMO_ON_KEY = 'cod-confirmer-demo-on';
const now = () => new Date().toISOString();

// Demo mode is switched on only by the "Try demo" button.
let demoOn = false;
// The database to use right now: null means demo (browser storage).
let supabase = online;

function setDemo(on) {
  demoOn = on;
  supabase = on ? null : online;
}

// Called once when the app opens: was demo mode left on last time?
export function demoWasOn() {
  try {
    setDemo(localStorage.getItem(DEMO_ON_KEY) === '1');
  } catch {}
  return demoOn;
}

export function startDemo() {
  setDemo(true);
  try {
    localStorage.setItem(DEMO_ON_KEY, '1');
    if (!localStorage.getItem(DEMO_KEY)) demoSave(sampleData());
  } catch {}
}

export function exitDemo() {
  setDemo(false);
  try {
    localStorage.removeItem(DEMO_ON_KEY);
  } catch {}
}

export function resetDemo() {
  demoSave(sampleData());
}

function demoLoad() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY)) || { orders: [], shop: null };
  } catch {
    return { orders: [], shop: null };
  }
}
function demoSave(db) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(db));
  } catch {}
}
// About 10 realistic orders, one in every status. Kamran has refused twice
// and has a new order waiting, so the red warning shows straight away.
function sampleData() {
  const ago = (hours) => new Date(Date.now() - hours * 3600000).toISOString();
  const order = (hours, status, customer_name, phone, city, address, items, amount, sentHoursAgo) => ({
    id: newId(),
    customer_name,
    phone,
    city,
    address,
    items,
    amount,
    status,
    messages_sent: sentHoursAgo == null ? 0 : 1,
    last_message_at: sentHoursAgo == null ? null : ago(sentHoursAgo),
    status_changed_at: ago(status === 'waiting' ? hours : hours / 2),
    created_at: ago(hours),
  });
  return {
    shop: null,
    orders: [
      order(1, 'waiting', 'Kamran Shah', '923211234567', 'Multan', 'Gulgasht Colony, Street 4', 'Bluetooth speaker, black', 3500),
      order(5, 'waiting', 'Ayesha Khan', '923001112233', 'Lahore', 'House 12, Block C, Johar Town', '2 lawn suits (3-piece), blue', 4500, 4),
      order(3, 'waiting', 'Ali Raza', '923459876543', 'Sialkot', '', 'Cricket bat, hard ball', 6500),
      order(26, 'confirmed', 'Bilal Ahmed', '923332223344', 'Karachi', 'Flat 7, Gulshan-e-Iqbal Block 13', "Men's kurta, white, size L", 2800, 25),
      order(30, 'confirmed', 'Fatima Noor', '923125556677', 'Islamabad', 'G-11/2, Street 18', 'Embroidered dupatta + 1 shawl', 3200, 29),
      order(52, 'shipped', 'Usman Tariq', '923067778899', 'Faisalabad', 'Peoples Colony No. 1', 'Wireless earbuds', 1999, 50),
      order(120, 'delivered', 'Sana Iqbal', '923214445566', 'Rawalpindi', 'Satellite Town, D Block', "3 kids' frocks", 3600, 118),
      order(150, 'delivered', 'Zainab Hussain', '923008889900', 'Hyderabad', 'Latifabad Unit 7', 'Skincare set (4 items)', 5400, 148),
      order(70, 'cancelled', 'Hamza Ali', '923441237890', 'Peshawar', 'Hayatabad Phase 3', 'Leather wallet + belt', 2200, 68),
      order(220, 'refused', 'Kamran Shah', '923211234567', 'Multan', 'Gulgasht Colony, Street 4', 'Smart watch', 4200, 218),
      order(480, 'refused', 'Kamran Shah', '923211234567', 'Multan', 'Gulgasht Colony, Street 4', 'Running shoes, size 9', 3900, 478),
    ],
  };
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16));
}

// Newest first. 1000 is the most Supabase returns in one go, plenty for daily work.
export async function listOrders() {
  if (!supabase) {
    return demoLoad().orders.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);
  if (error) throw error;
  return data;
}

// { "923001234567": 2, ... } — how many times each number refused, all time.
export async function refusalCounts() {
  if (!supabase) {
    const counts = {};
    for (const o of demoLoad().orders) if (o.status === 'refused') counts[o.phone] = (counts[o.phone] || 0) + 1;
    return counts;
  }
  const { data, error } = await supabase.from('customer_refusals').select('phone, refused');
  if (error) throw error;
  return Object.fromEntries(data.map((r) => [r.phone, r.refused]));
}

export async function createOrder(fields) {
  if (!supabase) {
    const db = demoLoad();
    const row = {
      id: newId(),
      status: 'waiting',
      messages_sent: 0,
      last_message_at: null,
      status_changed_at: now(),
      created_at: now(),
      ...fields,
    };
    db.orders.push(row);
    demoSave(db);
    return row;
  }
  const { data, error } = await supabase.from('orders').insert(fields).select().single();
  if (error) throw error;
  return data;
}

export async function updateOrder(id, patch) {
  if (!supabase) {
    const db = demoLoad();
    const i = db.orders.findIndex((o) => o.id === id);
    if (i < 0) throw new Error('Order not found');
    db.orders[i] = { ...db.orders[i], ...patch };
    demoSave(db);
    return db.orders[i];
  }
  const { data, error } = await supabase.from('orders').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteOrder(id) {
  if (!supabase) {
    const db = demoLoad();
    db.orders = db.orders.filter((o) => o.id !== id);
    demoSave(db);
    return;
  }
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
}

export async function getShop() {
  if (!supabase) return demoLoad().shop;
  const { data, error } = await supabase.from('shops').select('shop_name, message_lang').maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveShop(shop) {
  const fields = { shop_name: shop.shop_name, message_lang: shop.message_lang, updated_at: now() };
  if (!supabase) {
    const db = demoLoad();
    db.shop = fields;
    demoSave(db);
    return fields;
  }
  const { data: auth } = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from('shops')
    .upsert({ user_id: auth.session.user.id, ...fields })
    .select('shop_name, message_lang')
    .single();
  if (error) throw error;
  return data;
}
