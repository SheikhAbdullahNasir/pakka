'use client';
// All the words on screen, in English and Roman Urdu.
// To change any wording, edit it here. {n}, {s}, {t}, {email} get filled in by the app.
// A key ending in "_one" is used instead of the plain key when {n} is 1 ("1 day ago" vs "2 days ago").
import { createContext, useContext } from 'react';

const en = {
  loading: 'Loading…',
  tabToday: 'Today',
  tabOrders: 'Orders',
  tabSettings: 'Settings',
  tabNew: '+ New',

  status_waiting: 'Waiting',
  status_confirmed: 'Confirmed',
  status_cancelled: 'Cancelled',
  status_shipped: 'Shipped',
  status_delivered: 'Delivered',
  status_refused: 'Refused',

  // demo strip
  demoMode: 'Demo mode',
  resetShort: 'Reset',
  exitShort: 'Exit',
  confirmResetDemo: 'Reset the demo? Your changes will be removed and the sample orders will come back.',

  // order form
  newOrderTitle: 'New order',
  editOrder: 'Edit order',
  phone: 'WhatsApp number',
  phoneHint: 'e.g. 0300-1234567',
  phoneInvalid: 'Enter a Pakistani mobile number like 0300-1234567',
  name: 'Customer name',
  city: 'City',
  address: 'Address (optional)',
  addressHint: 'Couriers need the full address',
  items: 'Items',
  itemsHint: 'e.g. 2 lawn suits, blue',
  amount: 'Amount',
  required: 'Please fill this',
  amountInvalid: 'Enter the amount in rupees, like 2,500',
  saveSend: 'Save and send on WhatsApp',
  saveOnly: 'Save only',
  saveChanges: 'Save changes',
  saving: 'Saving…',
  close: 'Close',
  returning: 'Returning customer · {n} orders before',
  returning_one: 'Returning customer · 1 order before',
  refusedWarn: 'Refused {n} times before',
  refusedWarn_one: 'Refused once before',
  refusedWarnSub: 'Confirm carefully, or ask for advance payment.',
  deliveredBefore: '{n} delivered',

  // order card
  sendConfirm: 'Send confirmation',
  markConfirmed: 'Mark confirmed',
  remind: 'Remind',
  markShipped: 'Mark shipped',
  markDelivered: 'Mark delivered',
  markRefused: 'Mark refused',
  moreActions: 'More actions',
  sentAgo: 'Message sent {t}',
  notSent: 'Not sent yet',
  changeStatus: 'Change status',
  openChat: 'Open chat in WhatsApp',
  edit: 'Edit',
  delete: 'Delete',
  confirmDelete: 'Delete this order? This cannot be undone.',
  refusedNoDelete: 'Refused orders cannot be deleted. They are kept so you are warned if this number orders again.',

  // today
  waitingReply: 'Waiting for reply',
  readyToShip: 'Ready to ship',
  outForDelivery: 'Shipped: mark the result',
  emptyWaiting: 'No orders waiting',
  emptyReady: 'Nothing ready to ship',
  emptyShipped: 'No shipped orders to update',
  exportCsv: 'Export CSV',
  markAllShipped: 'CSV downloaded. Mark these {n} orders as shipped?',
  markAllShipped_one: 'CSV downloaded. Mark this order as shipped?',
  markedShipped: '{n} orders marked shipped',
  markedShipped_one: '1 order marked shipped',
  markedShippedFailed: '{n} marked shipped, {f} failed. Check your internet and mark the rest again.',
  emptyApp: 'No orders yet. Add your first one.',
  allClear: 'Nothing needs action right now.',

  // orders
  search: 'Search name, items or number',
  all: 'All',
  noOrders: 'No orders found',
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
  exitDemo: 'Exit demo',
  sampleName: 'Ayesha',
  sampleItems: '2 lawn suits',
  sampleCity: 'Lahore',

  // welcome / login
  headline: 'Stop paying for refused COD orders',
  lede: 'Confirm every order on WhatsApp before it ships, and get warned about customers who refused before.',
  tryDemo: 'Try the demo',
  tryDemoHint: 'No account needed. Sample orders stay on this phone.',
  loginEmail: 'Log in with email',
  slogan: 'Confirmed orders. Fewer refusals.',
  email: 'Email',
  sendLink: 'Send sign-in link',
  linkSent: 'Check your email and tap the sign-in link. Open it on this phone.',
  sendAgain: 'Send again',
  sendAgainIn: 'Send again in {n}s',
  changeEmail: 'Use a different email',
  configErrorTitle: 'Setup is not finished',
  configErrorBody: 'This site is missing its database settings, so orders cannot be saved. These two settings are needed:',
  configErrorFix: 'Add them in Vercel → Settings → Environment Variables, then redeploy. See README Part 4.',

  // errors (the technical error goes to the browser console only)
  errorGeneric: 'Could not save. Check your internet and try again.',
  errLoad: 'Could not load your orders. Check your internet and reload the page.',
  errRateLimit: 'Too many tries. Wait a few minutes and try again.',
  errLinkExpired: 'That sign-in link has expired or was already used. Ask for a new one.',
  errNetwork: 'Something went wrong. Check your internet and try again.',

  // general
  undo: 'Undo',
  statusChanged: 'Status changed to {s}',
  justNow: 'just now',
  minsAgo: '{n} min ago',
  hoursAgo: '{n}h ago',
  daysAgo: '{n} days ago',
  daysAgo_one: '1 day ago',
};

const ur = {
  loading: 'Load ho raha hai…',
  tabToday: 'Aaj',
  tabOrders: 'Orders',
  tabSettings: 'Settings',
  tabNew: '+ Naya',

  status_waiting: 'Intezar',
  status_confirmed: 'Confirm',
  status_cancelled: 'Cancel',
  status_shipped: 'Ship ho gaya',
  status_delivered: 'Deliver ho gaya',
  status_refused: 'Refuse kiya',

  demoMode: 'Demo mode',
  resetShort: 'Reset',
  exitShort: 'Band karein',
  confirmResetDemo: 'Demo reset karein? Aap ki tabdeeliyan mit jayengi aur namoone ke orders wapas aa jayenge.',

  newOrderTitle: 'Naya order',
  editOrder: 'Order badlein',
  phone: 'WhatsApp number',
  phoneHint: 'maslan 0300-1234567',
  phoneInvalid: 'Sahi mobile number likhein, maslan 0300-1234567',
  name: 'Customer ka naam',
  city: 'Shehar',
  address: 'Pata (zaroori nahi)',
  addressHint: 'Courier ko poora pata chahiye hota hai',
  items: 'Kya mangwaya',
  itemsHint: 'maslan 2 lawn suit, neela',
  amount: 'Raqam',
  required: 'Ye zaroor bharein',
  amountInvalid: 'Raqam rupees mein likhein, maslan 2,500',
  saveSend: 'Save karein aur WhatsApp bhejein',
  saveOnly: 'Sirf save karein',
  saveChanges: 'Tabdeeli save karein',
  saving: 'Save ho raha hai…',
  close: 'Band karein',
  returning: 'Purana customer · pehle {n} order',
  refusedWarn: 'Pehle bhi {n} dafa refuse hua',
  refusedWarnSub: 'Ehtiyat se confirm karein, ya advance payment maangein.',
  deliveredBefore: '{n} deliver huay',

  sendConfirm: 'Confirmation bhejein',
  markConfirmed: 'Confirm mark karein',
  remind: 'Yaad dilaein',
  markShipped: 'Ship mark karein',
  markDelivered: 'Deliver mark karein',
  markRefused: 'Refuse mark karein',
  moreActions: 'Aur options',
  sentAgo: 'Message bhej diya {t}',
  notSent: 'Abhi message nahi bheja',
  changeStatus: 'Status badlein',
  openChat: 'WhatsApp par chat kholein',
  edit: 'Badlein',
  delete: 'Delete',
  confirmDelete: 'Ye order delete karein? Wapas nahi aayega.',
  refusedNoDelete: 'Refuse wale order delete nahi hote. Ye rakhe jaate hain taa ke ye number dobara order kare to aap ko warning mile.',

  waitingReply: 'Jawab ka intezar',
  readyToShip: 'Bhejne ke liye tayyar',
  outForDelivery: 'Ship ho gaye: nateeja likhein',
  emptyWaiting: 'Koi order intezar mein nahi',
  emptyReady: 'Bhejne ke liye kuch tayyar nahi',
  emptyShipped: 'Koi ship hua order baqi nahi',
  exportCsv: 'CSV download',
  markAllShipped: 'CSV download ho gayi. In {n} orders ko "Ship" mark kar dein?',
  markAllShipped_one: 'CSV download ho gayi. Is order ko "Ship" mark kar dein?',
  markedShipped: '{n} orders "Ship" mark ho gaye',
  markedShipped_one: '1 order "Ship" mark ho gaya',
  markedShippedFailed: '{n} "Ship" mark ho gaye, {f} nahi huay. Internet check kar ke baqi dobara karein.',
  emptyApp: 'Abhi koi order nahi. Pehla order daalein.',
  allClear: 'Abhi koi kaam baqi nahi.',

  search: 'Naam, saman ya number dhoondein',
  all: 'Sab',
  noOrders: 'Koi order nahi mila',
  showMore: 'Aur dikhayein',

  shopName: 'Dukaan ka naam (message mein aayega)',
  msgLang: 'Customer ko message kis zabaan mein',
  appLang: 'App ki zabaan',
  preview: 'Message ka namoona',
  save: 'Save karein',
  saved: 'Save ho gaya',
  signedInAs: 'Login:',
  signOut: 'Log out',
  exitDemo: 'Demo band karein',
  sampleName: 'Ayesha',
  sampleItems: '2 lawn suit',
  sampleCity: 'Lahore',

  headline: 'Wapis hone wale COD orders ka nuqsan bharna band karein',
  lede: 'Har order bhejne se pehle WhatsApp par confirm karein, aur pehle refuse karne wale customers ki warning payein.',
  tryDemo: 'Demo dekhein',
  tryDemoHint: 'Account ki zaroorat nahi. Sample orders sirf is phone par rehte hain',
  loginEmail: 'Email se login karein',
  slogan: 'Pakke orders. Kam refusals.',
  email: 'Email',
  sendLink: 'Login link bhejein',
  linkSent: 'Email check karein aur login link par tap karein. Link isi phone par kholein.',
  sendAgain: 'Dobara bhejein',
  sendAgainIn: 'Dobara bhejein ({n}s)',
  changeEmail: 'Doosri email istemal karein',
  configErrorTitle: 'Setup mukammal nahi',
  configErrorBody: 'Is site mein database ki settings nahi hain, is liye orders save nahi ho sakte. Ye do settings chahiye:',
  configErrorFix: 'Inhein Vercel → Settings → Environment Variables mein daalein, phir redeploy karein. README Part 4 dekhein.',

  errorGeneric: 'Save nahi hua. Internet check kar ke dobara koshish karein.',
  errLoad: 'Orders load nahi huay. Internet check kar ke page dobara load karein',
  errRateLimit: 'Bohat zyada koshishein ho gayin. Kuch minute ruk kar dobara koshish karein',
  errLinkExpired: 'Ye link expire ho gaya hai ya pehle use ho chuka hai. Naya link mangwaein.',
  errNetwork: 'Shayad kuch issue ho gaya hai. Internet check kar ke dobara koshish karein',

  undo: 'Wapas karein',
  statusChanged: 'Status badal gaya: {s}',
  justNow: 'abhi',
  minsAgo: '{n} minute pehle',
  hoursAgo: '{n} ghante pehle',
  hoursAgo_one: '1 ghanta pehle',
  daysAgo: '{n} din pehle',
};

const dictionaries = { en, ur };

export function makeT(lang) {
  const dict = dictionaries[lang] || en;
  return (key, vars) => {
    const one = vars && Number(vars.n) === 1 ? dict[key + '_one'] : undefined;
    let s = one ?? dict[key] ?? en[key] ?? key;
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
