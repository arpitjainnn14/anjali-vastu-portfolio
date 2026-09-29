'use client';

import { useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Content } from '@/content';
import { Accented } from '@/components/ui/Section';
import { Seal } from '@/components/art/Seal';

gsap.registerPlugin(ScrollTrigger);

/**
 * About, told through her kundli. On desktop the section pins for ~2.5
 * screens and three beats play, scrubbed to scroll:
 *   1 the chart draws (1995)  2 it smudges, one house pulses (the poor reading)
 *   3 planets settle, the chart gives way to her portrait, the seal stamps.
 * Elsewhere (phones, reduced motion) nothing is pinned and the finished
 * section is simply shown, so the copy is always real, readable text.
 */

const HOUSE_CENTRE: Array<[number, number]> = [
  [200, 104], [100, 36], [36, 100], [104, 200], [36, 300], [100, 364],
  [200, 296], [300, 364], [364, 300], [296, 200], [364, 100], [300, 36],
];
const SIGN_POS: Array<[number, number]> = [
  [200, 172], [100, 76], [74, 100], [172, 200], [74, 300], [100, 324],
  [200, 228], [300, 324], [326, 300], [228, 200], [326, 100], [300, 76],
];
const PLANETS: Array<[number, string]> = [
  [1, 'गु'], [3, 'रा'], [4, 'चं'], [6, 'श'], [7, 'मं'], [9, 'के'], [10, 'सू'], [10, 'बु'], [11, 'शु'],
];
/* House 4 (the left diamond): the one that "goes wrong" in beat two. */
const HOT_HOUSE = '1 200 100 100 200 200 100 300';

export function ChartStory({
  about,
  seal,
}: {
  about: Pick<Content['about'], 'heading' | 'paragraphs' | 'facts' | 'portrait'>;
  seal: Content['seal'];
}) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);

    const media = gsap.matchMedia();
    media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const paras = q('[data-para]');
      /* Stack the paragraphs in one spot; revert() on cleanup undoes this. */
      gsap.set(paras, { position: 'absolute', top: 0, left: 0, right: 0 });
      gsap.set(paras.slice(1), { opacity: 0, y: 24 });
      gsap.set(q('[data-facts],[data-seal]'), { opacity: 0 });
      gsap.set(q('[data-hot]'), { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: { trigger: el, start: 'top top', end: '+=250%', pin: true, scrub: 0.8, anticipatePin: 1 },
      });

      /* Beat 1: the chart draws itself. */
      tl.fromTo(q('[data-line]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.12, duration: 0.5 }, 0)
        .fromTo(q('[data-sign]'), { opacity: 0 }, { opacity: 1, stagger: 0.02, duration: 0.2 }, 0.45)
        .from(q('[data-planet]'), { opacity: 0, scale: 0.4, duration: 0 }, 0)
        .set(q('[data-planet]'), { opacity: 0 }, 0)
        /* Beat 2: para 1 out, para 2 in; the chart dims, one house pulses. */
        .to(paras[0], { opacity: 0, y: -24, duration: 0.3 }, 1)
        .to(paras[1], { opacity: 1, y: 0, duration: 0.3 }, 1.1)
        .to(q('[data-lines]'), { opacity: 0.45, duration: 0.4 }, 1)
        .to(q('[data-hot]'), { opacity: 1, duration: 0.3 }, 1.1)
        .to(q('[data-hot]'), { opacity: 0.35, duration: 0.25, yoyo: true, repeat: 3 }, 1.4)
        /* Beat 3: para 3 in, planets settle, chart gives way to portrait. */
        .to(paras[1], { opacity: 0, y: -24, duration: 0.3 }, 2.5)
        .to(paras[2], { opacity: 1, y: 0, duration: 0.3 }, 2.6)
        .to(q('[data-hot]'), { opacity: 0, duration: 0.3 }, 2.5)
        .to(q('[data-lines]'), { opacity: 1, duration: 0.3 }, 2.5)
        .to(q('[data-line-haldi]'), { stroke: 'var(--color-haldi)', duration: 0.3 }, 2.5)
        .to(q('[data-planet]'), { opacity: 1, scale: 1, stagger: 0.1, duration: 0.3, ease: 'back.out(2)' }, 2.6)
        .to(q('[data-chart]'), { opacity: 0, scale: 1.08, duration: 0.8 }, 3.6)
        .fromTo(q('[data-portrait]'), { clipPath: 'circle(0% at 50% 45%)' }, { clipPath: 'circle(72% at 50% 45%)', duration: 0.9 }, 3.6)
        .fromTo(q('[data-seal]'), { opacity: 0, scale: 1.9, rotate: -14 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.35, ease: 'power4.in' }, 4.6)
        .to(q('[data-facts]'), { opacity: 1, duration: 0.4 }, 4.9)
        .to({}, { duration: 0.6 });
    });

    return () => media.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-paper">
      <div className="mx-auto grid min-h-screen max-w-[1200px] items-center gap-10 px-5 py-20 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20 lg:py-0">
        {/* The chart, with her portrait waiting behind it. */}
        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          <div data-portrait className="absolute inset-0 flex items-center justify-center" style={{ clipPath: 'circle(72% at 50% 45%)' }}>
            <Image src={about.portrait.src} alt={about.portrait.alt} width={560} height={680} className="h-full w-full object-cover object-[55%_28%]" />
          </div>
          <svg data-chart viewBox="-24 -24 448 448" aria-hidden="true" className="absolute inset-0 h-full w-full">
            <g data-lines>
              <rect x="-14" y="-14" width="428" height="428" fill="none" stroke="var(--color-haldi)" strokeWidth="0.8" />
              <polygon data-hot points={HOT_HOUSE} fill="var(--color-sindoor)" opacity="0.28" />
              {[
                ['M1 1H399V399H1Z', true],
                ['M1 1L399 399', false],
                ['M399 1L1 399', false],
                ['M200 1L399 200L200 399L1 200Z', true],
              ].map(([d, strong]) => (
                <path
                  key={d as string}
                  d={d as string}
                  data-line
                  {...(strong ? {} : { 'data-line-haldi': true })}
                  fill="none"
                  stroke={strong ? 'var(--color-ink)' : 'var(--color-haldi)'}
                  strokeWidth={strong ? 1.6 : 1.2}
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                />
              ))}
            </g>
            <g fontFamily="var(--font-body)" fontSize="13" fill="var(--color-muted)" textAnchor="middle" dominantBaseline="central">
              {SIGN_POS.map(([x, y], i) => (
                <text key={i} data-sign x={x} y={y}>{((4 + i) % 12) + 1}</text>
              ))}
            </g>
            <g fontFamily="var(--font-deva)" fontSize="22" fill="var(--color-sindoor)" textAnchor="middle" dominantBaseline="central">
              {PLANETS.map(([h, label], i) => {
                const [cx, cy] = HOUSE_CENTRE[h - 1];
                const dx = label === 'बु' ? 18 : label === 'सू' ? -18 : 0;
                return (
                  <text key={i} data-planet x={cx + dx} y={cy} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>{label}</text>
                );
              })}
            </g>
          </svg>
          <div data-seal className="absolute -bottom-2 -right-2 md:bottom-2 md:right-2">
            <Seal id="lab-story" seal={seal} size={132} />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <h2 className="t-h2 m-0 max-w-[20ch] text-balance text-ink">
            <Accented text={about.heading} />
          </h2>
          <div className="relative flex flex-col gap-5 lg:min-h-[250px]">
            {about.paragraphs.map((p, i) => (
              <p key={i} data-para className="t-body m-0 max-w-[56ch]">{p}</p>
            ))}
          </div>
          <p data-facts className="t-small m-0 text-muted">{about.facts.join(' · ')}</p>
        </div>
      </div>
    </section>
  );
}
