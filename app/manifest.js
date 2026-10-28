// Lets sellers "Add to Home screen" so the app opens like a normal phone app.
export default function manifest() {
  return {
    name: 'COD Confirmer',
    short_name: 'COD Confirmer',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f5f4',
    theme_color: '#0b7a4b',
    icons: [
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png' },
    ],
  };
}
