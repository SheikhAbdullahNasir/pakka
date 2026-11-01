// The Pakka mark: a "P" with a tick. The one source of truth for its shape, used by the welcome tile and
// every generated icon. app/icon.svg is a static file, so it repeats these same paths by hand.
const P = 'M40 94 V28 H62 a19 19 0 0 1 0 38 H40';
const TICK = 'M58 86 L68 96 L90 74';

const CSS_COLORS = { tile: 'var(--primary)', p: 'var(--on-primary)', tick: 'var(--accent)' };
// Generated images can't read CSS variables. These are the same three colours.
export const HEX_COLORS = { tile: '#1F4D3A', p: '#FFF6E6', tick: '#E3A93B' };

// Without a tile, the view is centred on the mark (64,61) and sized so the farthest painted point (the top
// and bottom of the stem, 48.31 units away) stays inside a circle of 70% diameter: 48.31 / 139 = 34.8% radius.
const VIEW_BOX = { rounded: '0 0 120 120', square: '0 0 120 120', none: '-5.5 -8.5 139 139' };

// tile: 'rounded' (the normal tile), 'square' (full-bleed, for iOS) or 'none' (P and tick only, for maskable).
export default function Mark({ size, tile = 'rounded', colors = CSS_COLORS }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={VIEW_BOX[tile]} aria-hidden="true">
      {tile !== 'none' && <rect width="120" height="120" rx={tile === 'rounded' ? 28 : 0} fill={colors.tile} />}
      <path d={P} fill="none" stroke={colors.p} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
      <path d={TICK} fill="none" stroke={colors.tick} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
