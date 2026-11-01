// The preview image shown when a link to the app is shared. Drawn when the app is built.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import Mark, { HEX_COLORS } from '@/components/Mark';

export const alt = 'Pakka logo with the slogan: Confirmed orders. Fewer refusals. Made for Instagram and WhatsApp sellers in Pakistan.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The image generator can't read woff2, so these woff copies live in the repo.
const font = (weight) => readFile(join(process.cwd(), `assets/fonts/PlusJakartaSans-${weight}.woff`));

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F6EFE3',
          fontFamily: 'Plus Jakarta Sans',
        }}
      >
        <Mark size={160} colors={HEX_COLORS} />
        <div style={{ marginTop: 24, fontSize: 72, lineHeight: 1.1, fontWeight: 700, color: '#1F4D3A' }}>Pakka</div>
        <div style={{ marginTop: 12, fontSize: 40, lineHeight: 1.2, fontWeight: 400, color: '#2A2420' }}>
          Confirmed orders. Fewer refusals.
        </div>
        <div style={{ marginTop: 16, fontSize: 28, lineHeight: 1.2, fontWeight: 400, color: '#665B4E' }}>
          Made for Instagram and WhatsApp sellers in Pakistan
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Plus Jakarta Sans', data: await font(400), weight: 400, style: 'normal' },
        { name: 'Plus Jakarta Sans', data: await font(700), weight: 700, style: 'normal' },
      ],
    }
  );
}
