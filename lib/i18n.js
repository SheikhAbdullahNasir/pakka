'use client';
// All the words on screen, in English and Roman Urdu.
// To change any wording, edit it here. {n}, {s}, {t}, {email} get filled in by the app.
import { createContext, useContext } from 'react';

const en = {
  loading: 'Loading…',
  tabToday: 'Today',
  tabOrders: 'Orders',
  tabSettings: 'Settings',
  newOrder: '+ New order',

  status_waiting: 'Waiting',
  status_confirmed: 'Confirmed',
  status_cancelled: 'Cancelled',
  status_shipped: 'Shipped',
  status_delivered: 'Delivered',
  status_refused: 'Refused',

  // order form
  newOrderTitle: 'New order',
  editOrder: 'Edit order',
  phone: 'WhatsApp number',
  phoneHint: 'e.g. 0300 1234567',
  phoneInvalid: 'Enter a Pakistani mobile number like 0300 1234567',
  name: 'Customer name',
  city: 'City',
  address: 'Address (optional)',
  items: 'Items',
  itemsHint: 'e.g. 2 lawn suits, blue',
  amount: 'Amount (Rs)',
  required: 'Please fill this',
  amountInvalid: 'Enter the amount in rupees',
  saveSend: 'Save & send on WhatsApp',
  saveOnly: 'Save only',
  saveChanges: 'Save changes',
  close: 'Close',
  returning: 'Returning customer: {n} order(s) before',
  refusedWarn: 'Refused {n} time(s) before!',
  refusedWarnSub: 'Confirm carefully, or ask for advance payment.',
  deliveredBefore: '{n} delivered before',

  // order card
  sendConfirm: 'Send confirmation',
  remind: 'Remind',
  sentAgo: 'Message sent {t}',
  notSent: 'Not sent yet',
  more: 'More ▾',
  less: 'Less ▴',
  changeStatus: 'Change status',
  edit: 'Edit',
  delete: 'Delete',
  confirmDelete: 'Delete this order? This cannot be undone.',
  openChat: 'Open chat',

  // today
  readyToShip: 'Ready to ship',
  waitingReply: 'Waiting for reply',
  outForDelivery: 'Shipped: mark the result',
  nothingHere: 'Nothing here right now.',
  exportCsv: 'Export CSV for courier',
  markAllShipped: 'CSV downloaded. Mark these {n} orders as Shipped?',
  markedShipped: '{n} orders marked Shipped',
  emptyApp: 'No orders yet. Tap "+ New order" to add your first one.',

  // orders
  search: 'Search name or number',
  all: 'All',
  noOrders: 'No orders found.',
  showMore: 'Show more',

  // settings
  shopName: 'Shop name (shown in messages)',
  msgLang: 'Language of customer messages',
  appLang: 'App language',
  preview: 'Message preview',
  save: 'Save',
  saved: 'Saved',
  signedInAs: 'Signed in as',
  signOut: 'Sign out',
  demoBanner: 'Demo mode: orders are saved on this phone only. Connect Supabase to save them online.',
  sampleName: 'Ayesha',
  sampleItems: '2 lawn suits',
  sampleCity: 'Lahore',

  // login
  loginTitle: 'Log in with your email',
  loginWhy: 'Your orders are saved online, so they are safe even if you lose your phone.',
  email: 'Email',
  sendCode: 'Send login code',
  codeSent: 'We emailed a code to {email}. Type it below, or tap the link in the email.',
  code: 'Code from the email',
  logIn: 'Log in',
  changeEmail: 'Use a different email',

  // general
  undo: 'Undo',
  statusChanged: 'Marked {s}',
  errorGeneric: 'Could not save. Check your internet and try again.',
  justNow: 'just now',
  minsAgo: '{n} min ago',
  hoursAgo: '{n} h ago',
  daysAgo: '{n} days ago',
};

const ur = {
  loading: 'Load ho raha hai…',
  tabToday: 'Aaj',
  tabOrders: 'Orders',
  tabSettings: 'Settings',
  newOrder: '+ Naya order',

  status_waiting: 'Intezar',
  status_confirmed: 'Confirm',
  status_cancelled: 'Cancel',
  status_shipped: 'Bhej diya',
  status_delivered: 'Deliver ho gaya',
  status_refused: 'Refuse kiya',

  newOrderTitle: 'Naya order',
  editOrder: 'Order badlein',
  phone: 'WhatsApp number',
  phoneHint: 'maslan 0300 1234567',
  phoneInvalid: 'Sahi mobile number likhein, maslan 0300 1234567',
  name: 'Customer ka naam',
  city: 'Shehar',
  address: 'Pata (zaroori nahi)',
  items: 'Kya mangwaya',
  itemsHint: 'maslan 2 lawn suit, neela',
  amount: 'Raqam (Rs)',
  required: 'Ye zaroor bharein',
  amountInvalid: 'Raqam rupay mein likhein',
  saveSend: 'Save karein aur WhatsApp bhejein',
  saveOnly: 'Sirf save karein',
  saveChanges: 'Tabdeeli save karein',
  close: 'Band karein',
  returning: 'Purana customer: pehle {n} order',
  refusedWarn: 'Pehle {n} dafa order refuse kiya!',
  refusedWarnSub: 'Ehtiyat se confirm karein, ya advance payment maangein.',
  deliveredBefore: 'Pehle {n} deliver huay',

  sendConfirm: 'Confirmation bhejein',
  remind: 'Yaad dilaein',
  sentAgo: 'Message bheja: {t}',
  notSent: 'Abhi message nahi bheja',
  more: 'Aur ▾',
  less: 'Kam ▴',
  changeStatus: 'Status badlein',
  edit: 'Badlein',
  delete: 'Delete',
  confirmDelete: 'Ye order delete karein? Wapas nahi aayega.',
  openChat: 'Chat kholein',

  readyToShip: 'Bhejne ke liye tayyar',
  waitingReply: 'Jawab ka intezar',
  outForDelivery: 'Bhej diye: nateeja likhein',
  nothingHere: 'Abhi yahan kuch nahi.',
  exportCsv: 'Courier ke liye CSV',
  markAllShipped: 'CSV download ho gayi. In {n} orders ko "Bhej diya" kar dein?',
  markedShipped: '{n} orders "Bhej diya" ho gaye',
  emptyApp: 'Abhi koi order nahi. Pehla order daalne ke liye "+ Naya order" dabayein.',

  search: 'Naam ya number dhoondein',
  all: 'Sab',
  noOrders: 'Koi order nahi mila.',
  showMore: 'Aur dikhayein',

  shopName: 'Dukaan ka naam (message mein aayega)',
  msgLang: 'Customer ko message kis zabaan mein',
  appLang: 'App ki zabaan',
  preview: 'Message ka namoona',
  save: 'Save karein',
  saved: 'Save ho gaya',
  signedInAs: 'Login:',
  signOut: 'Log out',
  demoBanner: 'Demo mode: orders sirf is phone par save hain. Online save ke liye Supabase jorein.',
  sampleName: 'Ayesha',
  sampleItems: '2 lawn suit',
  sampleCity: 'Lahore',

  loginTitle: 'Apni email se login karein',
  loginWhy: 'Aap ke orders online save hote hain, phone gum ho jaye tab bhi mehfooz rehte hain.',
  email: 'Email',
  sendCode: 'Login code bhejein',
  codeSent: '{email} par code bheja hai. Neeche likhein, ya email wala link dabayein.',
  code: 'Email wala code',
  logIn: 'Login karein',
  changeEmail: 'Doosri email istemal karein',

  undo: 'Wapas karein',
  statusChanged: '"{s}" kar diya',
  errorGeneric: 'Save nahi hua. Internet check kar ke dobara koshish karein.',
  justNow: 'abhi',
  minsAgo: '{n} minute pehle',
  hoursAgo: '{n} ghante pehle',
  daysAgo: '{n} din pehle',
};

const dictionaries = { en, ur };

export function makeT(lang) {
  const dict = dictionaries[lang] || en;
  return (key, vars) => {
    let s = dict[key] ?? en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
    return s;
  };
}

export const LangContext = createContext({ lang: 'en', t: makeT('en'), changeLang: () => {} });
export const useLang = () => useContext(LangContext);

export function timeAgo(iso, t) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return t('justNow');
  if (mins < 60) return t('minsAgo', { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('hoursAgo', { n: hours });
  return t('daysAgo', { n: Math.floor(hours / 24) });
}
