import './globals.css';

export const metadata = {
  title: 'COD Confirmer',
  description: 'Confirm cash-on-delivery orders on WhatsApp before they ship.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b7a4b',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
