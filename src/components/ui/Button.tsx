import { SmartLink } from '@/components/ui/SmartLink';

/**
 * Button.
 *
 * A pill, 54px tall on mobile and 56 on desktop. The primary is sindoor with
 * paper-white text (6.9:1); there is one primary per section.
 *
 *   hover   deeper sindoor, and the icon or arrow inside nudges forward
 *   active  pressed 1px down
 *   focus   2px sindoor outline at 3px offset, never transitioned
 *
 * Renders a real <a> when it navigates and a real <button> when it acts.
 */

const METRICS =
  'group inline-flex items-center justify-center gap-2.5 rounded-control ' +
  'h-[54px] px-7 text-[16px] md:h-14 md:px-8 ' +
  'font-semibold tracking-[.005em] no-underline ' +
  'transition-[background-color,border-color,color,transform] duration-[220ms] ease-out ' +
  'active:translate-y-px';

const VARIANTS = {
  primary:
    'bg-sindoor text-card hover:bg-sindoor-deep ' +
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-sindoor',
  secondary:
    'border border-line-strong bg-transparent text-ink hover:border-ink ' +
    'disabled:cursor-not-allowed disabled:opacity-50',
} as const;

type Variant = keyof typeof VARIANTS;

function classes(variant: Variant, block: boolean, className?: string) {
  return [METRICS, VARIANTS[variant], block ? 'flex w-full' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
}

type Shared = {
  variant?: Variant;
  /** Full width. The form submit, the service aside, the mobile drawer. */
  block?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function ButtonLink({
  href,
  variant = 'primary',
  block = false,
  className,
  children,
  ...rest
}: Shared & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <SmartLink href={href} className={classes(variant, block, className)} {...rest}>
      {children}
    </SmartLink>
  );
}

export function Button({
  variant = 'primary',
  block = false,
  className,
  children,
  type = 'button',
  ...rest
}: Shared & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes(variant, block, className)} {...rest}>
      {children}
    </button>
  );
}
