// Lets sellers "Add to Home screen" so the app opens like a normal phone app.
export default function manifest() {
  return {
    name: 'Pakka',
    short_name: 'Pakka',
    description: 'Confirmed orders. Fewer refusals.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6EFE3',
    theme_color: '#F6EFE3',
    icons: [
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-icon/maskable', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
