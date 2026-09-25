import { seal } from '@/content';

/**
 * The practitioner's seal — the mark an astrologer stamps on a chart she has
 * read. It replaces the coloured bars that used to flag the important blocks:
 * a bar is furniture any template ships, a seal says a particular person
 * stands behind this.
 *
 * Drawn to look inked rather than printed:
 *   - the rings are hand-wobbled cubics, not perfect circles, and each quarter
 *     has a slightly different radius, so no two arcs match
 *   - strokes carry a long dash pattern, which leaves the hairline gaps a
 *     rubber stamp leaves where the ink did not take
 *   - the whole mark sits a few degrees off square, as a hand would place it
 *
 * `id` must be unique per instance: the curved text hangs off path ids, and a
 * page with two seals sharing an id would hang both texts on one path.
 */
export function Seal({
  id,
  size = 108,
  className = '',
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  const topArc = `seal-top-${id}`;
  const bottomArc = `seal-bottom-${id}`;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={seal.alt}
      className={`shrink-0 -rotate-6 text-sindoor ${className}`}
    >
      <g fill="none" stroke="currentColor" opacity="0.88">
        {/* Outer ring: four cubics at 56.4 / 55.2 / 56.2 / 55.4 radius. */}
        <path
          d="M60 3.6 C 90.4 3.6, 116.4 29.6, 116.4 60 C 116.4 90.8, 90.8 115.2, 60 115.2
             C 29.2 115.2, 3.8 90.2, 3.8 60 C 3.8 29.8, 29.8 3.6, 60 3.6 Z"
          strokeWidth="2.1"
          strokeDasharray="62 1.4 96 1.1 74 1.6"
          strokeLinecap="round"
        />
        {/* Inner ring, drawn the other way round so its gaps fall elsewhere. */}
        <path
          d="M60 12.8 C 86.2 12.8, 107.4 33.4, 107.4 60 C 107.4 86.4, 86 107.6, 60 107.6
             C 33.6 107.6, 12.6 86.6, 12.6 60 C 12.6 33.2, 33.8 12.8, 60 12.8 Z"
          strokeWidth="0.9"
          strokeDasharray="120 1.2 88 1.5"
          strokeLinecap="round"
        />
      </g>

      {/* The two arcs the ring text hangs from. Never painted. */}
      <defs>
        <path id={topArc} d="M17 60 A 43 43 0 0 1 103 60" fill="none" />
        <path id={bottomArc} d="M105 60 A 45 45 0 0 1 15 60" fill="none" />
      </defs>

      <g fill="currentColor" opacity="0.9">
        <text fontFamily="var(--font-deva)" fontSize="10.5">
          <textPath href={`#${topArc}`} startOffset="50%" textAnchor="middle">
            {seal.arcTop}
          </textPath>
        </text>
        <text fontFamily="var(--font-body)" fontSize="7.4" letterSpacing="1.15" fontWeight="600">
          <textPath href={`#${bottomArc}`} startOffset="50%" textAnchor="middle">
            {seal.arcBottom}
          </textPath>
        </text>
      </g>

      {/* The kundli mark, then her name, at the centre. */}
      <g stroke="currentColor" fill="none" strokeWidth="1" opacity="0.75">
        <path d="M60 35.5 L 68.5 44 L 60 52.5 L 51.5 44 Z" />
      </g>
      <g
        fill="currentColor"
        fontFamily="var(--font-deva)"
        textAnchor="middle"
        opacity="0.95"
      >
        <text x="60" y="68" fontSize="16">
          {seal.name[0]}
        </text>
        <text x="60" y="86" fontSize="16">
          {seal.name[1]}
        </text>
      </g>

      {/* The hairline under the name, as on a stamp. */}
      <path
        d="M41 93.5 C 50 92.6, 70 92.6, 79 93.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}
