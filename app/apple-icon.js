// The iPhone home-screen icon. iOS rounds the corners itself, so this one is a plain square.
import { ImageResponse } from 'next/og';
import Mark, { HEX_COLORS } from '@/components/Mark';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: HEX_COLORS.tile }}>
        <Mark size={180} tile="square" colors={HEX_COLORS} />
      </div>
    ),
    size
  );
}
