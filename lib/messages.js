// The WhatsApp messages sent to customers.
// Nothing is ever sent automatically: these only fill in the text,
// and the seller presses "send" inside WhatsApp.

export function rupees(amount) {
  return 'Rs ' + Number(amount || 0).toLocaleString('en-PK');
}

function details(order, lang) {
  const where = order.address ? `${order.address}, ${order.city}` : order.city;
  return lang === 'en'
    ? `${order.items}, ${rupees(order.amount)}, cash on delivery.\nDelivery to: ${where}`
    : `${order.items}, ${rupees(order.amount)}, cash on delivery.\nDelivery: ${where}`;
}

export function confirmationMessage(order, shop, lang = 'ur') {
  const from = shop?.shop_name ? ` (${shop.shop_name})` : '';
  if (lang === 'en') {
    return (
      `Assalam o Alaikum ${order.customer_name}!\n` +
      `Your order${from}: ${details(order, lang)}\n\n` +
      `Reply 1 to confirm, 2 to cancel.\nThank you!`
    );
  }
  return (
    `Assalam o Alaikum ${order.customer_name}!\n` +
    `Aap ka order${from}: ${details(order, lang)}\n\n` +
    `Confirm karne ke liye 1 likhein, cancel ke liye 2.\nShukriya!`
  );
}

export function reminderMessage(order, shop, lang = 'ur') {
  const from = shop?.shop_name ? ` (${shop.shop_name})` : '';
  if (lang === 'en') {
    return (
      `Assalam o Alaikum ${order.customer_name}! A quick reminder:\n` +
      `your order${from}: ${details(order, lang)}\n\n` +
      `We will ship it as soon as you confirm. Reply 1 to confirm, 2 to cancel.`
    );
  }
  return (
    `Assalam o Alaikum ${order.customer_name}! Yaad dahani:\n` +
    `aap ka order${from}: ${details(order, lang)}\n\n` +
    `Confirm hote hi hum bhej denge. Confirm ke liye 1 likhein, cancel ke liye 2.`
  );
}

// wa.me link that opens WhatsApp (or WhatsApp Business) with the text ready.
export function waLink(phone, text) {
  return `https://wa.me/${phone}` + (text ? `?text=${encodeURIComponent(text)}` : '');
}
