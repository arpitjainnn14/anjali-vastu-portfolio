'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Content } from '@/content';

type Testimonial = Content['testimonials'][number];
import { Section, Container } from '@/components/ui/Section';
import { Seal } from '@/components/art/Seal';

import { ChartStory } from './ChartStory';
import { Constellation } from './Constellation';

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


/* ---------- 4. Portrait tilts toward the cursor, with a soft sheen ---------- */
function TiltDemo({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: x * 10, rotateX: -y * 8, duration: 0.5, ease: 'power3.out', transformPerspective: 900 });
    gsap.to(sheen.current, { opacity: 1, x: x * 60, duration: 0.5 });
  };
  const leave = () => {
    gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' });
    gsap.to(sheen.current, { opacity: 0, duration: 0.4 });
  };
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className="relative w-[280px] border border-line-strong bg-card p-2.5">
      <Image src={src} alt={alt} width={560} height={680} className="h-[340px] w-full object-cover object-[55%_30%]" />
      <div ref={sheen} aria-hidden="true" className="pointer-events-none absolute inset-2.5 opacity-0" style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,.28) 50%, transparent 65%)' }} />
    </div>
  );
}

/* ---------- 5. Portrait curtain: clip-path wipe plus a slow settle-in zoom ---------- */
function CurtainDemo({ src, alt }: { src: string; alt: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(wrap.current, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power4.inOut' });
      gsap.fromTo(img.current, { scale: 1.35 }, { scale: 1, duration: 1.6, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, [run]);
  return (
    <div className="flex items-end gap-8">
      <div ref={wrap} className="w-[280px] overflow-hidden">
        <div ref={img}>
          <Image src={src} alt={alt} width={560} height={680} className="h-[340px] w-full object-cover object-[55%_30%]" />
        </div>
      </div>
      <button type="button" onClick={() => setRun((n) => n + 1)} className="t-small underline">Replay</button>
    </div>
  );
}

/* ---------- 6. Headline lines rise out of a mask ---------- */
function MaskHeadingDemo() {
  const ref = useRef<HTMLHeadingElement>(null);
  const [run, setRun] = useState(0);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-line]', { yPercent: 110, rotate: 3 }, { yPercent: 0, rotate: 0, duration: 0.9, ease: 'power4.out', stagger: 0.14 });
    }, ref);
    return () => ctx.revert();
  }, [run]);
  const lines = ['I was once the client', 'who got a poor answer.'];
  return (
    <div className="flex flex-col gap-6">
      <h3 ref={ref} className="t-h2 m-0 text-ink" aria-label={lines.join(' ')}>
        {lines.map((l) => (
          <span key={l} aria-hidden="true" className="block overflow-hidden pb-1">
            <span data-line className="block origin-left">{l}</span>
          </span>
        ))}
      </h3>
      <button type="button" onClick={() => setRun((n) => n + 1)} className="t-small self-start underline">Replay</button>
    </div>
  );
}

/* ---------- 7. Flip card: quote in front, who and what on the back ---------- */
function FlipDemo({ items }: { items: readonly Testimonial[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.slice(0, 3).map((t) => (
        <button key={t.name} type="button" className="group h-[280px] text-left [perspective:1000px]" aria-label={`${t.name}: ${t.quote.split('\n\n')[0]}`}>
          <span className="relative block h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)]">
            <span className="absolute inset-0 flex flex-col justify-between rounded-[18px] border border-night-line bg-night-card p-6 text-cream [backface-visibility:hidden]">
              <span className="font-display line-clamp-[8] text-[16px] leading-[1.55]">{t.quote.split('\n\n')[0]}</span>
              <span className="t-small text-cream-muted">Hover to flip</span>
            </span>
            <span className="absolute inset-0 flex flex-col justify-center gap-2 rounded-[18px] bg-sindoor p-6 text-cream [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <span className="font-display text-[26px] leading-tight">{t.name}</span>
              <span className="t-small">{t.city}</span>
              <span className="t-small">{t.service}</span>
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------- 8. Accordion strip: hovered card widens, the rest narrow ---------- */
function StripDemo({ items }: { items: readonly Testimonial[] }) {
  const [open, setOpen] = useState(0);
  const shown = items.slice(0, 4);
  return (
    <div className="flex h-[360px] gap-3">
      {shown.map((t, i) => {
        const on = i === open;
        return (
          <button
            key={t.name}
            type="button"
            onMouseEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
            onClick={() => setOpen(i)}
            aria-expanded={on}
            className="relative overflow-hidden rounded-[18px] border border-night-line bg-night-card p-5 text-left text-cream transition-[flex-grow] duration-500 ease-out"
            style={{ flex: on ? '5 1 0%' : '1 1 0%' }}
          >
            <span className="font-display absolute left-5 top-4 text-[44px] leading-none text-haldi-light">“</span>
            <span className={`mt-12 block font-display text-[16px] leading-[1.55] transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0'}`}>
              <span className="line-clamp-[9]">{t.quote.split('\n\n')[0]}</span>
              <span className="t-small mt-4 block text-cream-muted">{t.name} · {t.service}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function MotionLab({
  seal,
  opening,
  testimonials,
  portrait,
  about,
}: {
  about: Pick<Content['about'], 'heading' | 'paragraphs' | 'facts' | 'portrait'>;
  portrait: { src: string; alt: string };
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

      <ChartStory about={about} seal={seal} />

      <Section className="bg-night">
        <Container>
          <h2 className="t-h2 mb-10 text-cream">Constellation of clients</h2>
          <Constellation items={testimonials} />
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
      <Section>
        <Container>
          <h2 className="t-h2 mb-10 text-ink">4. Portrait tilt (move your cursor over it)</h2>
          <TiltDemo {...portrait} />
        </Container>
      </Section>

      <Section className="bg-paper-deep">
        <Container>
          <h2 className="t-h2 mb-10 text-ink">5. Portrait curtain reveal</h2>
          <CurtainDemo {...portrait} />
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="t-h2 mb-10 text-ink">6. Headline mask reveal</h2>
          <MaskHeadingDemo />
        </Container>
      </Section>

      <Section className="bg-night">
        <Container>
          <h2 className="t-h2 mb-10 text-cream">7. Flip cards (hover or Tab)</h2>
          <FlipDemo items={testimonials} />
        </Container>
      </Section>

      <Section className="bg-night pb-32">
        <Container>
          <h2 className="t-h2 mb-10 text-cream">8. Accordion strip (hover)</h2>
          <StripDemo items={testimonials} />
        </Container>
      </Section>
    </>
  );
}
