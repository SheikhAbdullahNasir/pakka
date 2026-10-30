// Turns any way of writing a Pakistani mobile number into 92XXXXXXXXXX,
// which is the format WhatsApp links (wa.me) need.
//   "0300 1234567", "+92 300 1234567", "00923001234567", "3001234567" -> "923001234567"
// Returns null if it does not look like a Pakistani mobile number.
export function normalizePhone(input) {
  let d = String(input || '').replace(/\D/g, '');
  if (d.startsWith('0092')) d = d.slice(2);
  if (d.startsWith('92') && d.length === 12 && d[2] === '3') return d;
  if (d.startsWith('03') && d.length === 11) return '92' + d.slice(1);
  if (d.startsWith('3') && d.length === 10) return '92' + d;
  return null;
}

// 923001234567 -> "0300-1234567" (how people in Pakistan read numbers)
export function displayPhone(phone) {
  if (phone && phone.length === 12 && phone.startsWith('92')) {
    return '0' + phone.slice(2, 5) + '-' + phone.slice(5);
  }
  return phone || '';
}

// 923001234567 -> "03001234567" (what most courier portals expect)
export function localPhone(phone) {
  if (phone && phone.length === 12 && phone.startsWith('92')) return '0' + phone.slice(2);
  return phone || '';
}

// While typing: "03001234567" -> "0300-1234567". Anything not starting with 0 (like +92 300...) is left as typed.
export function formatPhoneTyping(text) {
  const raw = String(text);
  if (!/^\s*0/.test(raw) || /^\s*00/.test(raw)) return raw;
  const d = raw.replace(/\D/g, '').slice(0, 11);
  return d.length > 4 ? d.slice(0, 4) + '-' + d.slice(4) : d;
}
