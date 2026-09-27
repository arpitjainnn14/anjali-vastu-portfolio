import { site } from '@/content';

/**
 * The business name as a two-line wordmark. One line of "Anjali Vastu & Astro
 * Divine Solutions" is too wide to sit beside the menu on a phone or the nav
 * links at 1024px; stacked, it reads as a name rather than a sentence.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex flex-col font-display leading-[1.05] ${className}`}>
      {site.brandLines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  );
}
