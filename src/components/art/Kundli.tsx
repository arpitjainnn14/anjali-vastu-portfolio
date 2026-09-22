/**
 * A North Indian kundli: the diamond chart Anjali actually draws, rather than
 * the Western zodiac wheel every other astrology site uses.
 *
 * Geometry: a 400-unit square, both diagonals, and the diamond joining the
 * mid-points. That makes the twelve houses; house 1 (the lagna) is the top
 * centre diamond and the rest run anticlockwise.
 *
 * The placements are decorative, not anyone's chart. Planets are written the
 * way they are on a hand-drawn kundli, as Devanagari abbreviations.
 *
 * All motion is CSS (see `.ink-line` and `.planet` in globals.css), so the
 * chart draws itself before hydration and renders complete without JS or under
 * reduced motion.
 */

/** The lagna's sign; every other house number follows from it. */
const LAGNA_SIGN = 5;

/** Where each house's sign number sits, near its inner vertex. Houses 1–12. */
const SIGN_POS: Array<[number, number]> = [
  [200, 172], [100, 76], [74, 100], [172, 200], [74, 300], [100, 324],
  [200, 228], [300, 324], [326, 300], [228, 200], [326, 100], [300, 76],
];

/** House centres, for the planets. Houses 1–12. */
const HOUSE_CENTRE: Array<[number, number]> = [
  [200, 104], [100, 36], [36, 100], [104, 200], [36, 300], [100, 364],
  [200, 296], [300, 364], [364, 300], [296, 200], [364, 100], [300, 36],
];

/** [house, label]. Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu. */
const PLANETS: Array<[number, string]> = [
  [1, 'गु'],
  [3, 'रा'],
  [4, 'चं'],
  [6, 'श'],
  [7, 'मं'],
  [9, 'के'],
  [10, 'सू'],
  [10, 'बु'],
  [11, 'शु'],
];

const LINES: Array<{ d: string; delay: number; strong?: boolean }> = [
  { d: 'M1 1H399V399H1Z', delay: 0.15, strong: true },
  { d: 'M1 1L399 399', delay: 0.55 },
  { d: 'M399 1L1 399', delay: 0.7 },
  { d: 'M200 1L399 200L200 399L1 200Z', delay: 0.95, strong: true },
];

export function Kundli({ className = '', size = 460 }: { className?: string; size?: number }) {
  /* Planets sharing a house sit side by side. */
  const byHouse = new Map<number, string[]>();
  for (const [house, label] of PLANETS) {
    byHouse.set(house, [...(byHouse.get(house) ?? []), label]);
  }
  let order = 0;

  return (
    <svg
      viewBox="-24 -24 448 448"
      width={size}
      height={size}
      aria-hidden="true"
      className={`h-auto max-w-full ${className}`}
    >
      {/* The printed border: a second square, offset, as on almanac pages. */}
      <rect
        x="-14" y="-14" width="428" height="428"
        fill="none" stroke="var(--color-haldi)" strokeWidth="0.8"
        pathLength={1} className="ink-line" style={{ '--d': '0s' } as React.CSSProperties}
      />

      <rect x="1" y="1" width="398" height="398" fill="var(--color-card)" opacity=".7" />

      {LINES.map((line) => (
        <path
          key={line.d}
          d={line.d}
          fill="none"
          stroke={line.strong ? 'var(--color-ink)' : 'var(--color-haldi)'}
          strokeWidth={line.strong ? 1.4 : 1.1}
          strokeLinejoin="round"
          pathLength={1}
          className="ink-line"
          style={{ '--d': `${line.delay}s` } as React.CSSProperties}
        />
      ))}

      {/* The lagna, marked the way astrologers do: a small stroke in the top house. */}
      <circle cx="200" cy="30" r="4" fill="var(--color-sindoor)" className="planet lagna-dot" style={{ '--d': '1.5s' } as React.CSSProperties} />

      <g
        fontFamily="var(--font-body)"
        fontSize="13"
        fill="var(--color-muted)"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {SIGN_POS.map(([x, y], i) => (
          <text
            key={i}
            x={x}
            y={y}
            className="planet"
            style={{ '--d': `${1.35 + i * 0.03}s` } as React.CSSProperties}
          >
            {((LAGNA_SIGN + i - 1) % 12) + 1}
          </text>
        ))}
      </g>

      <g
        fontFamily="var(--font-deva)"
        fontSize="22"
        fill="var(--color-sindoor)"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {[...byHouse.entries()].flatMap(([house, labels]) => {
          const [cx, cy] = HOUSE_CENTRE[house - 1];
          return labels.map((label, i) => {
            const dx = (i - (labels.length - 1) / 2) * 30;
            const delay = 1.7 + order++ * 0.12;
            return (
              <text
                key={`${house}-${label}`}
                x={cx + dx}
                y={cy}
                className="planet"
                style={{ '--d': `${delay}s` } as React.CSSProperties}
              >
                {label}
              </text>
            );
          });
        })}
      </g>
    </svg>
  );
}

/** A small kundli outline used as a mark: logo, list bullets, dividers. */
export function KundliMark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" />
        <path d="M2 2 22 22M22 2 2 22M12 2 22 12 12 22 2 12Z" />
      </g>
    </svg>
  );
}
