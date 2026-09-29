'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Content } from '@/content';

type Testimonial = Content['testimonials'][number];

/**
 * Testimonials as a night sky. Each client is a star; select one and the sky
 * glides to it while the full quote opens. SVG + GSAP, no WebGL.
 * Stars are real buttons (Tab, arrows, Enter). Drift and twinkle stop for
 * reduced motion and via the Pause button.
 */

const W = 1000;
const H = 600;
/* Hand-placed so lines never cross awkwardly; more slots than clients. */
const SLOTS: Array<[number, number]> = [
  [150, 400], [330, 210], [520, 380], [690, 170], [850, 350], [560, 90], [260, 500], [770, 520], [90, 190], [430, 520],
];

/* Deterministic PRNG so server and client render the same sky. */
function rng(seed: number) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

function Sparkle({ r }: { r: number }) {
  const s = r;
  return <path d={`M0 ${-s * 2}L${s * 0.35} ${-s * 0.35}L${s * 2} 0L${s * 0.35} ${s * 0.35}L0 ${s * 2}L${-s * 0.35} ${s * 0.35}L${-s * 2} 0L${-s * 0.35} ${-s * 0.35}Z`} />;
}

export function Constellation({ items }: { items: readonly Testimonial[] }) {
  const [sel, setSel] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const world = useRef<SVGGElement>(null);
  const drift = useRef<gsap.core.Tween[]>([]);
  const reduce = useRef(false);

  const stars = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: 140 }, () => ({
      x: -350 + r() * (W + 700),
      y: -250 + r() * (H + 500),
      r: 0.6 + r() * 1.5,
      o: 0.25 + r() * 0.55,
    }));
  }, []);
  const pts = items.map((_, i) => SLOTS[i % SLOTS.length]);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  /* Twinkle and slow drift. */
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const tw = gsap.to('[data-bg]', {
        opacity: 0.12, duration: 'random(1.2, 3.2)', yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: { each: 0.03, from: 'random' },
      });
      const dr = gsap.to('[data-drift]', { y: 8, x: 5, duration: 6, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 0.7 });
      drift.current = [tw, dr];
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    drift.current.forEach((t) => (paused ? t.pause() : t.play()));
  }, [paused]);

  /* Glide the sky to the selected star. */
  useEffect(() => {
    if (!world.current) return;
    const s = sel === null ? 1 : 1.7;
    const [px, py] = sel === null ? [W / 2, H / 2] : pts[sel];
    gsap.to(world.current, {
      x: W / 2 - s * px + (sel === null ? 0 : -W * 0.14),
      y: H / 2 - s * py,
      scale: s,
      svgOrigin: '0 0',
      duration: reduce.current ? 0 : 1.3,
      ease: 'power3.inOut',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);

  const move = (i: number, dir: 1 | -1) => {
    const n = (i + dir + items.length) % items.length;
    setSel(n);
    root.current?.querySelector<SVGGElement>(`[data-star="${n}"]`)?.focus();
  };

  const t = sel === null ? null : items[sel];

  return (
    <div ref={root} className="relative overflow-hidden rounded-[26px] border border-night-line bg-night" style={{ background: 'radial-gradient(120% 90% at 30% 20%, #2a2118 0%, #1D1812 55%, #120e0a 100%)' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="group" aria-label="Client testimonials, as stars">
        <defs>
          <radialGradient id="glow">
            <stop offset="0" stopColor="#E6B75E" stopOpacity=".55" />
            <stop offset="1" stopColor="#E6B75E" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g ref={world}>
          {stars.map((s, i) => (
            <circle key={i} data-bg cx={s.x} cy={s.y} r={s.r} fill="#F4EBDD" opacity={s.o} />
          ))}
          {/* Lines linking the clients, in order. */}
          <polyline
            points={pts.map((p) => p.join(',')).join(' ')}
            fill="none" stroke="#E6B75E" strokeOpacity=".28" strokeWidth="1" strokeDasharray="3 6"
          />
          {pts.map(([x, y], i) => {
            const on = sel === i;
            return (
              <g key={i} data-drift transform={`translate(${x} ${y})`}>
                <g
                  data-star={i}
                  role="button"
                  tabIndex={0}
                  aria-pressed={on}
                  aria-label={`${items[i].name}, ${items[i].service}`}
                  className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-cream"
                  onClick={() => setSel(on ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(on ? null : i); }
                    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); move(i, 1); }
                    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); move(i, -1); }
                    else if (e.key === 'Escape') setSel(null);
                  }}
                >
                  <circle r="34" fill="url(#glow)" stroke="none" strokeWidth="2" opacity={on ? 1 : 0.6} />
                  <g fill="#F4EBDD" transform={`scale(${on ? 1.7 : 1})`} style={{ transition: 'transform .5s' }}>
                    <Sparkle r={9} />
                  </g>
                  <circle r="30" fill="transparent" />
                </g>
                <text y="34" textAnchor="middle" fontSize="15" fill="#B8AA95" opacity={sel === null || on ? 0.9 : 0.35} fontFamily="var(--font-body)" pointerEvents="none">
                  {items[i].name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* The opened quote. */}
      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end p-4 md:inset-y-0 md:items-center md:p-10">
        {t ? (
          <figure
            key={sel}
            lang={t.lang === 'hi' ? 'hi' : undefined}
            className="pointer-events-auto m-0 max-h-[80%] w-full overflow-auto rounded-[20px] border border-night-line bg-night/90 p-6 text-cream backdrop-blur md:w-[380px] md:p-7"
            style={{ animation: 'fadeup .6s .5s both' }}
          >
            <blockquote className={`m-0 flex flex-col gap-3 ${t.lang === 'hi' ? 'font-deva text-[17px] leading-[1.8]' : 'font-display text-[16px] leading-[1.55]'}`}>
              {t.quote.split('\n\n').map((p, i) => <p key={i} className="m-0">{p}</p>)}
            </blockquote>
            <figcaption className="t-small mt-4 text-cream-muted">{t.name} · {t.city} · {t.service}</figcaption>
            <button type="button" onClick={() => setSel(null)} className="t-small mt-3 text-haldi-light underline">Back to the sky</button>
          </figure>
        ) : (
          <p className="t-small m-0 self-end text-cream-muted md:self-center md:pr-4">Select a star to read what a client wrote.</p>
        )}
      </div>

      <button type="button" onClick={() => setPaused((p) => !p)} className="t-small absolute left-4 top-4 rounded-full border border-night-line px-3 py-1 text-cream-muted">
        {paused ? 'Resume motion' : 'Pause motion'}
      </button>
      <style>{`@keyframes fadeup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){figure{animation:none!important}}`}</style>
    </div>
  );
}
