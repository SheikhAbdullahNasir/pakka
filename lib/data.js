// Every read and write of orders goes through this file.
// With Supabase connected it talks to the online database;
// in demo mode it uses the browser's own storage instead.
import { supabase } from './supabase';

const DEMO_KEY = 'cod-confirmer-demo';
const now = () => new Date().toISOString();

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
