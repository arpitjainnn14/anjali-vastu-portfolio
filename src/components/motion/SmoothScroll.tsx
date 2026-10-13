'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Smooth scrolling for mouse wheels and trackpads (Lenis), driven by GSAP's
 * ticker so ScrollTrigger effects move in step with it.
 *
 * Touch scrolling is left native: phones already glide, and smoothing a
 * finger feels laggy. Nothing changes under reduced motion. In-page anchors
 * (/#services) glide too, stopping where `scroll-padding-top` would.
 * An element marked `data-lenis-prevent` (the testimonial dialog) keeps its
 * own scrolling.
 */

gsap.registerPlugin(ScrollTrigger);

/** Matches `scroll-padding-top` in globals.css: room for the fixed nav. */
const NAV_ROOM = 96;

export function SmoothScroll() {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let dispose: (() => void) | undefined;

    const syncPreference = () => {
      dispose?.();
      dispose = undefined;
      if (preference.matches) return;

      const lenis = new Lenis({ lerp: 0.09, anchors: { offset: -NAV_ROOM } });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);

      // Existing overlays lock either html or body. Lenis scrolls imperatively,
      // so it must stop too, including a wheel animation already in progress.
      // Read their inline locks: Lenis's own stopped class also sets overflow.
      const syncLock = () => {
        const locked = [document.documentElement, document.body].some((el) =>
          ['hidden', 'clip'].includes(el.style.overflowY),
        );
        if (locked) lenis.stop();
        else lenis.start();
      };
      const observer = new MutationObserver(syncLock);
      for (const el of [document.documentElement, document.body]) {
        observer.observe(el, { attributes: true, attributeFilter: ['style'] });
      }
      syncLock();
      dispose = () => {
        observer.disconnect();
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    };

    syncPreference();
    preference.addEventListener('change', syncPreference);

    return () => {
      preference.removeEventListener('change', syncPreference);
      dispose?.();
    };
  }, []);

  return null;
}
