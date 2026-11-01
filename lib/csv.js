import { displayPhone } from './phone';

// One CSV cell. Quotes text with commas/quotes/new lines, and stops
// spreadsheet apps from treating text like "=SUM(...)" as a formula.
function cell(value) {
  let s = value == null ? '' : String(value);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function ordersToCsv(orders) {
  const header = ['Order ID', 'Customer Name', 'Phone', 'City', 'Address', 'Items', 'COD Amount', 'Order Date'];
  const rows = orders.map((o) => [
    o.id.slice(0, 8).toUpperCase(),
    o.customer_name,
    // With the dash, spreadsheet apps keep it as text and don't drop the leading 0.
    displayPhone(o.phone),
    o.city,
    o.address,
    o.items,
    o.amount,
    new Date(o.created_at).toLocaleDateString('en-GB'),
  ]);
  // "﻿" at the start makes Excel open the file with the right characters.
  return '﻿' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
}

export function downloadCsv(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
