/**
 * Section shell and the small typographic parts that repeat down the page.
 *
 * 128px section padding desktop / 80 mobile, 80px gutter desktop / 20 mobile,
 * 1280 content width inside a 1440 frame.
 */

type Tone = 'paper' | 'deep' | 'night';

const TONES: Record<Tone, string> = {
  paper: '',
  deep: 'bg-paper-deep',
  night: 'on-night bg-night text-cream-muted',
};

export function Section({
  id,
  className = '',
  tone = 'paper',
  children,
  ...rest
}: {
  id?: string;
  className?: string;
  tone?: Tone;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden py-16 md:py-32 ${TONES[tone]} ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}

export function Container({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative z-10 mx-auto w-full max-w-[1440px] px-5 md:px-20 ${className}`}>
      {children}
    </div>
  );
}

/**
 * The label above a heading: a small sindoor diamond, then the words.
 * The diamond is the kundli's centre house, repeated as a mark.
 */
export function Eyebrow({
  children,
  className = '',
  ...rest
}: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...rest} className={`inline-flex items-center gap-2.5 t-label text-sindoor in-[.on-night]:text-haldi-light ${className}`}>
      <Diamond />
      {children}
    </span>
  );
}

export function Diamond({ className = '' }: { className?: string }) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Renders a heading string, setting any word wrapped in *asterisks* as the
 * italic accent. Keeps emphasis in content.ts without putting markup there.
 */
export function Accented({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('*') && part.endsWith('*') ? (
          <em key={i} className="accent">
            {part.slice(1, -1)}
          </em>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** Left-aligned section header: label, h2, lead. Split in two on wide screens. */
export function SectionHeader({
  eyebrow,
  heading,
  lead,
  className = '',
}: {
  eyebrow: string;
  heading: string;
  lead?: string | null;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-20 ${className}`}
      data-reveal
    >
      <div className="flex flex-col gap-5">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="t-h2 m-0 max-w-[16ch] text-balance text-ink in-[.on-night]:text-cream">
          <Accented text={heading} />
        </h2>
      </div>
      {lead && <p className="t-body m-0 max-w-[46ch] lg:pb-2">{lead}</p>}
    </div>
  );
}
