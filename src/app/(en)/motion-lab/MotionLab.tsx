'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Content } from '@/content';

type Testimonial = Content['testimonials'][number];
import { Section, Container } from '@/components/ui/Section';
import { Seal } from '@/components/art/Seal';

gsap.registerPlugin(ScrollTrigger);

/* ---------- 1. Seal stamps down when it scrolls into view ---------- */
function StampDemo({ seal }: { seal: Content['seal'] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(el, { scale: 1.9, opacity: 0, rotate: -14 }, { scale: 0.94, opacity: 1, rotate: 0, duration: 0.28, ease: 'power4.in' })
        .to(el, { scale: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' });
    });
    return () => ctx.revert();
  }, [run]);

  return (
    <div className="flex items-center gap-8">
      <div ref={ref}>
        <Seal id="lab-stamp" seal={seal} size={140} />
      </div>
      <button type="button" onClick={() => setRun((n) => n + 1)} className="t-small underline">
        Stamp again
      </button>
    </div>
  );
}

/* ---------- 2. Paragraph fills from faint to ink as you scroll ---------- */
function ScrollFillDemo({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('[data-w]');
      gsap.fromTo(
        words,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.4 },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <p ref={ref} className="t-open m-0 max-w-[60ch] text-ink" aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} data-w aria-hidden="true">
          {w}{' '}
        </span>
      ))}
    </p>
  );
}

/* ---------- 3. Stacked deck: click or drag the top card away ---------- */
function DeckDemo({ items }: { items: readonly Testimonial[] }) {
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const topRef = useRef<HTMLElement>(null);
  const busy = useRef(false);

  const next = (dir: 1 | -1 = 1) => {
    const el = topRef.current;
    if (!el || busy.current) return;
    busy.current = true;
    gsap.to(el, {
      x: dir * 420,
      rotate: dir * 12,
      opacity: 0,
      duration: 0.45,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(el, { clearProps: 'all' });
        setOrder((o) => [...o.slice(1), o[0]]);
        busy.current = false;
      },
    });
  };

  const startX = useRef(0);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative h-[360px] w-full max-w-[460px] sm:h-[340px]" style={{ touchAction: 'pan-y' }}>
        {order.slice(0, 3).map((idx, depth) => {
          const t = items[idx];
          const excerpt = t.quote.split('\n\n')[0];
          const top = depth === 0;
          return (
            <figure
              key={idx}
              ref={top ? topRef : undefined}
              onPointerDown={top ? (e) => (startX.current = e.clientX) : undefined}
              onPointerUp={top ? (e) => { const d = e.clientX - startX.current; if (Math.abs(d) > 40) next(d > 0 ? 1 : -1); } : undefined}
              className="absolute inset-0 m-0 flex cursor-grab flex-col justify-between rounded-[22px] border border-night-line bg-night-card p-7 text-cream shadow-[0_18px_40px_-20px_rgba(29,24,18,.6)] transition-[transform] duration-500"
              style={{
                transform: `translateY(${depth * 16}px) scale(${1 - depth * 0.05})`,
                zIndex: 3 - depth,
                filter: top ? undefined : `brightness(${1 - depth * 0.12})`,
              }}
            >
              <blockquote className="font-display m-0 line-clamp-[8] text-[17px] leading-[1.55]">{excerpt}</blockquote>
              <figcaption className="t-small text-cream-muted">
                {t.name} · {t.service}
              </figcaption>
            </figure>
          );
        })}
      </div>
      <div className="flex gap-6">
        <button type="button" onClick={() => next(-1)} className="t-small underline">Previous</button>
        <button type="button" onClick={() => next(1)} className="t-small underline">Next</button>
      </div>
    </div>
  );
}

export function MotionLab({
  seal,
  opening,
  testimonials,
}: {
  seal: Content['seal'];
  opening: string;
  testimonials: readonly Testimonial[];
}) {
  return (
    <>
      <Section className="pt-28 md:pt-40">
        <Container>
          <div className="flex flex-col gap-4">
            <h1 className="t-h1 m-0 text-ink">Motion lab</h1>
            <p className="t-lead m-0 max-w-[50ch]">Throwaway previews for the About and Testimonials sections. Scroll down.</p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="t-h2 mb-10 text-ink">1. Seal stamp</h2>
          <StampDemo seal={seal} />
        </Container>
      </Section>

      <Section className="min-h-[140vh]">
        <Container>
          <h2 className="t-h2 mb-10 text-ink">2. Scroll-filled paragraph</h2>
          <ScrollFillDemo text={opening} />
        </Container>
      </Section>

      <Section className="bg-night pb-32">
        <Container>
          <h2 className="t-h2 mb-10 text-cream">3. Testimonial deck (click, drag or use buttons)</h2>
          <DeckDemo items={testimonials} />
        </Container>
      </Section>
    </>
  );
}
