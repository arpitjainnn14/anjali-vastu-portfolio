/**
 * Line icons, drawn with a thin stroke to match the kundli's linework.
 * Never a filled glyph, never an emoji.
 */

type IconProps = { size?: number; className?: string; strokeWidth?: number };

export function SunIcon({ size = 30, className = '', strokeWidth = 1.3 }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
      aria-hidden="true" className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </svg>
  );
}

export function GridIcon({ size = 30, className = '', strokeWidth = 1.3 }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
      aria-hidden="true" className={className}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
      <path d="M9.17 3.5v17M14.83 3.5v17M3.5 9.17h17M3.5 14.83h17" />
      <circle cx="6.33" cy="6.33" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="17.67" cy="17.67" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CompassIcon({ size = 30, className = '', strokeWidth = 1.3 }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className={className}
    >
      <rect x="5" y="5" width="14" height="14" />
      <path d="M12 5V1.5M12 19v3.5M5 12H1.5M19 12h3.5" />
      <path d="M12 9.2 13.1 12 12 14.8 10.9 12 Z" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 19, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className={className}
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20.5l1.8-5.2A8.4 8.4 0 1 1 21 11.5Z" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 17, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className={className}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function AlertIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16.2v.3" />
    </svg>
  );
}

export function CheckIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className={className}
    >
      <path d="M4 12.5 9.5 18 20 6.5" />
    </svg>
  );
}

export const serviceIcons = {
  sun: SunIcon,
  grid: GridIcon,
  compass: CompassIcon,
} as const;

export type ServiceIconKey = keyof typeof serviceIcons;
