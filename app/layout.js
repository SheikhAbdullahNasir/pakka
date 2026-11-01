import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

// Downloaded once at build time and served from this site, so nothing jumps when it loads.
const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

const title = 'Pakka · Confirmed orders. Fewer refusals.';
const description = 'Confirm cash-on-delivery orders on WhatsApp before they ship, and get warned about customers who refused before.';

export const metadata = {
  metadataBase: new URL('https://pakkapk.vercel.app'),
  title,
  description,
  openGraph: { title, description, url: '/', siteName: 'Pakka', type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F6EFE3',
  colorScheme: 'light',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
