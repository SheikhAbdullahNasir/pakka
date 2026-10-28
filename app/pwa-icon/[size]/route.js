// Draws the home-screen icon as a PNG when the app is built.
import { ImageResponse } from 'next/og';

export function generateStaticParams() {
  return [{ size: '192' }, { size: '512' }];
}

export async function GET(_request, { params }) {
  const size = (await params).size === '512' ? 512 : 192;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b7a4b',
          color: 'white',
          fontSize: size * 0.34,
          fontWeight: 700,
        }}
      >
        COD
      </div>
    ),
    { width: size, height: size }
  );
}
