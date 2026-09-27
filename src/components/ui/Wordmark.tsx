import { brandLines } from '@/content/shared';

/**
 * The business name as a two-line wordmark. One line of "Anjali Vastu & Astro
 * Divine Solutions" is too wide to sit beside the menu on a phone or the nav
 * links at 1024px; stacked, it reads as a name rather than a sentence.
 *
 * The brand stays in English on Hindi pages, so this reads the shared fact
 * directly rather than taking a content bundle: it renders the same wordmark
 * whichever language the page around it is in.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex flex-col font-display leading-[1.05] ${className}`}>
      {brandLines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  );
}
