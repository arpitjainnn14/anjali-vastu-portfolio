'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * The scroll layer. Every effect is opted into by an attribute:
 *
 *   [data-reveal]         rises 24px and fades in, once, when it enters.
 *   [data-reveal-group]   its [data-reveal-item] children do the same, in turn.
 *   [data-parallax="-40"] drifts that many px over its trip through the
 *                         viewport. Desktop only; scrubbed, so it is scenery.
 *   [data-stack]          the services stage (sections/Services.tsx). Its
 *                         [data-stack-panel] grows into place, each
 *                         [data-stack-card] steps back as the next slides over
 *                         it, and each [data-stack-scene] fades in with its
 *                         card. Under reduced motion the scenes just switch.
 *                         The cards scroll natively (CSS sticky), so the page
 *                         never takes over the wheel.
 *   [data-turn]           the hero kundli turns and shrinks as it scrolls away.
 *   [data-drift-out]      the hero text drifts up and fades as it scrolls away.
 *   h1/h2 .accent         the inked underline draws in when the heading enters
 *                         (not the hero's, which has its own brush stroke).
 *   [data-unveil]         a portrait frame opens from the bottom, the photo
 *                         settling from a slight zoom.
 *   [data-magnetic]       buttons lean toward a mouse pointer (Button.tsx).
 *   [data-ease-open]      a <details> eases open and shut instead of jumping.
 *   [data-band]           the testimonials band: the page darkens into it from
 *                         paper and it widens to the screen edges as it arrives.
 *   [data-scroll-boost]   the testimonial rail drifts faster while the page
 *                         is being scrolled, then settles back.
 *
 * Reveals are played, never scrubbed: scrubbed opacity makes body copy fade
 * back out when you scroll up. Scrubbed effects are kept to scenery and to
 * text that is leaving the screen. Nothing is hidden in the HTML, so no-JS
 * and reduced-motion visitors get the finished page.
 *
 * The site moved from "deliberately small" motion to this fuller set at the
 * owner's request (Oct 2026), after a Hexalog-style services stage. Smooth
 * scrolling is SmoothScroll.tsx; page cross-fades are SiteBody's
 * <ViewTransition>. The hero's entrance and the kundli's drawing are CSS
 * (globals.css) so they start before hydration.
 */

gsap.registerPlugin(ScrollTrigger);

export function Motion() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add(
        {
          all: 'all',
          motion: '(prefers-reduced-motion: no-preference)',
          desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };

          const undo = gsap.utils.toArray<HTMLElement>('[data-stack]').map((stack) => stage(stack, motion));
          const cleanup = () => undo.forEach((fn) => fn());

          if (!motion) return cleanup;

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

          hero();
          ink();
          undo.push(magnetic(), easeOpen(), band());

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

          return cleanup;
        },
      );

      /* Fraunces changes heading heights, which moves every trigger. */
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });

    return () => context.revert();
  }, [pathname]);

  return null;
}

/** The hero kundli turns as it leaves; the text column drifts up and fades. */
function hero() {
  gsap.utils.toArray<HTMLElement>('[data-turn]').forEach((el) => {
    gsap.to(el, {
      rotate: 30,
      scale: 0.82,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 60%', end: 'bottom top', scrub: 0.8 },
    });
  });
  gsap.utils.toArray<HTMLElement>('[data-drift-out]').forEach((el) => {
    gsap.to(el, {
      y: -90,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.8 },
    });
  });
}

/** Heading underlines draw in; portraits are unveiled. Both played once. */
function ink() {
  gsap.utils.toArray<HTMLElement>(':is(h1, h2) .accent').forEach((accent) => {
    if (accent.closest('#top')) return;
    gsap.fromTo(
      accent,
      { backgroundSize: '0% 0.16em' },
      {
        backgroundSize: '100% 0.16em',
        duration: 1.1,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: accent, start: 'top 85%', once: true },
      },
    );
  });
  gsap.utils.toArray<HTMLElement>('[data-unveil]').forEach((frame) => {
    const photo = frame.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 80%', once: true } });
    tl.fromTo(
      frame,
      { clipPath: 'inset(100% 0 0 0)' },
      { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'power3.inOut', clearProps: 'clipPath' },
    );
    if (photo) tl.fromTo(photo, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'power3.out', clearProps: 'scale' }, 0);
  });
}

/** Buttons lean toward a mouse pointer. Not on touch, where there is nothing to follow. */
function magnetic(): () => void {
  if (!matchMedia('(pointer: fine)').matches) return () => {};
  const offs = gsap.utils.toArray<HTMLElement>('[data-magnetic]').map((button) => {
    const x = gsap.quickTo(button, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(button, 'y', { duration: 0.5, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = button.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.3);
      y((e.clientY - r.top - r.height / 2) * 0.4);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    button.addEventListener('pointermove', move);
    button.addEventListener('pointerleave', leave);
    return () => {
      button.removeEventListener('pointermove', move);
      button.removeEventListener('pointerleave', leave);
    };
  });
  return () => offs.forEach((off) => off());
}

/**
 * <details> that ease open and shut. The click is taken over only to animate;
 * `open` is still what the browser and assistive tech read.
 */
function easeOpen(): () => void {
  const offs = gsap.utils.toArray<HTMLDetailsElement>('details[data-ease-open]').map((details) => {
    const summary = details.querySelector('summary');
    const body = summary?.nextElementSibling as HTMLElement | null;
    if (!summary || !body) return () => {};
    let expanded = details.open;
    const click = (e: MouseEvent) => {
      e.preventDefault();
      gsap.killTweensOf(body);
      expanded = !expanded;
      if (!expanded) {
        gsap.to(body, {
          height: 0,
          opacity: 0,
          duration: 0.45,
          ease: 'power2.inOut',
          onComplete: () => {
            details.open = false;
            gsap.set(body, { clearProps: 'height,opacity' });
          },
        });
      } else {
        if (!details.open) gsap.set(body, { height: 0, opacity: 0 });
        details.open = true;
        gsap.to(body, { height: 'auto', opacity: 1, duration: 0.55, ease: 'power2.out', clearProps: 'height,opacity' });
      }
    };
    summary.addEventListener('click', click);
    return () => {
      summary.removeEventListener('click', click);
      gsap.killTweensOf(body);
      details.open = expanded;
      gsap.set(body, { clearProps: 'height,opacity' });
    };
  });
  return () => offs.forEach((off) => off());
}

/**
 * The testimonials band darkens in from the section above and widens to the
 * edges; its rail runs faster while the page scrolls.
 */
function band(): () => void {
  const offs = gsap.utils.toArray<HTMLElement>('[data-band]').map((band) => {
    const above = band.previousElementSibling;
    const from = above ? getComputedStyle(above).backgroundColor : '';
    const arrive = { trigger: band, start: 'top 95%', end: 'top 30%', scrub: 0.5 };
    if (from && from !== 'rgba(0, 0, 0, 0)') {
      gsap.fromTo(band, { backgroundColor: from }, { backgroundColor: getComputedStyle(band).backgroundColor, ease: 'none', scrollTrigger: arrive });
    }
    gsap.fromTo(
      band,
      { clipPath: 'inset(0 5% round 28px)' },
      { clipPath: 'inset(0 0% round 0px)', ease: 'none', scrollTrigger: arrive },
    );

    const drift = band.querySelector('[data-scroll-boost] .marquee-track')?.getAnimations()[0];
    if (!drift) return () => {};
    let boost = 1;
    ScrollTrigger.create({
      trigger: band,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        boost = Math.min(6, Math.max(boost, 1 + Math.abs(self.getVelocity()) / 300));
      },
    });
    const settle = () => {
      boost += (1 - boost) * 0.06;
      drift.playbackRate = boost;
    };
    gsap.ticker.add(settle);
    return () => {
      gsap.ticker.remove(settle);
      drift.playbackRate = 1;
    };
  });
  return () => offs.forEach((off) => off());
}

/**
 * The services stage. Card i+1 enters over the screen of scroll before it
 * sticks; that same stretch hands the scene over and steps card i back.
 */
function stage(stack: HTMLElement, motion: boolean): () => void {
  const panel = stack.querySelector<HTMLElement>('[data-stack-panel]');
  const scenes = gsap.utils.toArray<HTMLElement>('[data-stack-scene]', stack);
  const cards = gsap.utils.toArray<HTMLElement>('[data-stack-card]', stack);
  const slots = cards.map((card) => card.parentElement as HTMLElement);

  /*
   * Every card as tall as the tallest, so the one stepping back shows only
   * above the new card, never below it. Re-measured on each refresh (fonts,
   * resizes), before the triggers are laid out.
   */
  const equalize = () => {
    cards.forEach((card) => (card.style.minHeight = ''));
    const tallest = Math.max(...cards.map((card) => card.offsetHeight));
    cards.forEach((card) => (card.style.minHeight = `${tallest}px`));
  };
  equalize();
  ScrollTrigger.addEventListener('refreshInit', equalize);
  const undo = () => {
    ScrollTrigger.removeEventListener('refreshInit', equalize);
    cards.forEach((card) => (card.style.minHeight = ''));
  };

  if (!motion) {
    /* No fades: the scene behind simply changes as its card arrives. */
    slots.slice(1).forEach((slot, i) => {
      ScrollTrigger.create({
        trigger: slot,
        start: 'top 50%',
        onEnter: () => gsap.set(scenes[i + 1], { opacity: 1 }),
        onLeaveBack: () => gsap.set(scenes[i + 1], { opacity: 0 }),
      });
    });
    return undo;
  }

  if (panel) {
    gsap.fromTo(
      panel,
      { scale: 0.72, borderRadius: 40 },
      {
        scale: 1,
        borderRadius: 20,
        ease: 'none',
        scrollTrigger: { trigger: stack, start: 'top bottom', end: 'top top', scrub: 0.6 },
      },
    );
  }
  if (scenes[0]) {
    gsap.fromTo(
      scenes[0].firstElementChild,
      { scale: 1.12 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: stack, start: 'top bottom', end: 'top top', scrub: 0.6 } },
    );
  }

  /* The first card is played in, not scrubbed, so its copy never fades back out. */
  if (cards[0]) {
    gsap.from(cards[0], {
      y: 60,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: stack, start: 'top 15%', once: true },
    });
  }

  slots.slice(1).forEach((slot, i) => {
    const handOff = { trigger: slot, start: 'top bottom', end: 'top top', scrub: 0.6 };
    gsap.fromTo(
      cards[i],
      /* Darkened, not faded: a translucent card would show the one under it through. */
      { scale: 1, y: 0, filter: 'brightness(1)' },
      { scale: 0.92, y: -36, filter: 'brightness(0.55)', transformOrigin: 'center top', ease: 'none', scrollTrigger: handOff },
    );
    const scene = scenes[i + 1];
    if (scene) {
      gsap.fromTo(scene, { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { ...handOff, end: 'top 30%' } });
      gsap.fromTo(scene.firstElementChild, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: handOff });
    }
  });

  return undo;
}
