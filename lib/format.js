// Display helpers. They only change how text looks on screen, never what is saved.

// "nasir ali" -> "Nasir Ali", "KARACHI" -> "Karachi"
export function titleCase(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/(^|[\s\-'(.])(\p{L})/gu, (_, before, letter) => before + letter.toUpperCase());
}

// While typing an amount: keeps digits and one dot, and adds commas ("25000" -> "25,000").
export function formatAmountTyping(text) {
  const clean = String(text).replace(/[^\d.]/g, '');
  const [whole, ...rest] = clean.split('.');
  const withCommas = whole.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return rest.length ? `${withCommas}.${rest.join('').slice(0, 2)}` : withCommas;
}
