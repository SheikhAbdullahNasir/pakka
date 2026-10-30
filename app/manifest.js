// Lets sellers "Add to Home screen" so the app opens like a normal phone app.
export default function manifest() {
  return {
    name: 'COD Confirmer',
    short_name: 'COD Confirmer',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6EFE3',
    theme_color: '#F6EFE3',
    icons: [
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png' },
    ],
  };
}
