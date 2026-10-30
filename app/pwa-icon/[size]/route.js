// Draws the home-screen icon as a PNG when the app is built.
import { ImageResponse } from 'next/og';

export function generateStaticParams() {
  return [{ size: '192' }, { size: '512' }, { size: 'maskable' }];
}

export async function GET(_request, { params }) {
  const name = (await params).size;
  const size = name === '192' ? 192 : 512;
  // Android crops maskable icons to a circle or other shape, so that letter stays small and in the middle.
  const letter = name === 'maskable' ? 0.42 : 0.6;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1F4D3A',
          color: '#FFF6E6',
          fontSize: size * letter,
          fontWeight: 700,
        }}
      >
        P
      </div>
    ),
    { width: size, height: size }
  );
}
