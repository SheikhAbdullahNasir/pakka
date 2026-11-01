// Draws the home-screen icons as PNGs when the app is built.
import { ImageResponse } from 'next/og';
import Mark, { HEX_COLORS } from '@/components/Mark';

export function generateStaticParams() {
  return [{ size: '192' }, { size: '512' }, { size: 'maskable' }];
}

export async function GET(_request, { params }) {
  const name = (await params).size;
  const size = name === '192' ? 192 : 512;
  const maskable = name === 'maskable';
  return new ImageResponse(
    (
      // Android crops maskable icons to a circle or other shape, so that one is a full-bleed square
      // with the P and tick kept inside the middle. The others are the rounded tile on transparent.
      <div style={{ width: '100%', height: '100%', display: 'flex', background: maskable ? HEX_COLORS.tile : 'transparent' }}>
        <Mark size={size} tile={maskable ? 'none' : 'rounded'} colors={HEX_COLORS} />
      </div>
    ),
    { width: size, height: size }
  );
}
