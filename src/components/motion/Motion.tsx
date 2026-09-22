'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * The scroll layer. Deliberately small.
 *
 * The old version pinned the hero and the services for nearly three screens
 * of scroll. That reads as a demo, and it keeps a visitor from the content
 * they came for. What is left:
 *
 *   [data-reveal]         rises 24px and fades in, once, when it enters.
 *   [data-reveal-group]   its [data-reveal-item] children do the same, in turn.
 *   [data-parallax="-40"] drifts that many px over its trip through the
 *                         viewport. Desktop only; scrubbed, so it is scenery.
 *
 * Reveals are played, never scrubbed: scrubbed opacity makes body copy fade
 * back out when you scroll up. Nothing is hidden in the HTML, so no-JS and
 * reduced-motion visitors get the finished page.
 *
 * The hero's entrance and the kundli are CSS (globals.css) so they start
 * before hydration.
 */

gsap.registerPlugin(ScrollTrigger);

export function Motion() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
          if (!motion) return;

          const rise = (targets: Element[], trigger: Element, stagger = 0) =>
            gsap.from(targets, {
              y: 24,
              opacity: 0,
              duration: 0.8,
              ease: 'power3.out',
              stagger,
              clearProps: 'transform,opacity',
              scrollTrigger: { trigger, start: 'top 86%', once: true },
            });

          gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => rise([el], el));

          gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
            const items = gsap.utils.toArray<HTMLElement>('[data-reveal-item]', group);
            if (items.length) rise(items, group, 0.09);
          });

          if (desktop) {
            gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
              const distance = Number(el.dataset.parallax) || -30;
              gsap.fromTo(
                el,
                { y: -distance / 2 },
                {
                  y: distance / 2,
                  ease: 'none',
                  scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
                },
              );
            });
          }
        },
      );

      /* Fraunces changes heading heights, which moves every trigger. */
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });

    return () => context.revert();
  }, [pathname]);

  return null;
}
