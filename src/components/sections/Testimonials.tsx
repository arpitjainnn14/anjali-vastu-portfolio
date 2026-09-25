import { testimonialsSection } from '@/content';
import { Section, SectionHeader } from '@/components/ui/Section';
import { usableTestimonials } from '@/lib/sections';
import { TestimonialsRail } from '@/components/sections/TestimonialsRail';

/**
 * Testimonials, on the page's one night band.
 *
 *   0     — no section at all. An empty rail is worse than no rail.
 *   1–2   — cards, still, side by side.
 *   3+    — the same cards on a rail that drifts on its own.
 *
 * Every card is an excerpt; "Read more" opens the full testimonial in a
 * dialog. See TestimonialsRail for the motion and the dialog.
 */
export function Testimonials() {
  const quotes = usableTestimonials;
  if (quotes.length === 0) return null;

  return (
    /*
     * Tighter than the paper sections (80px, not 128). On a light page a dark
     * band already reads as a strong block; at full padding it became a
     * ~950px slab with one row of cards in it.
     */
    <Section id="testimonials" tone="night" className="py-14! md:py-20!">
      {/* Full-bleed: the rail runs edge to edge, past the content gutters. */}
      <div className="relative z-10">
        <TestimonialsRail
          quotes={quotes}
          header={<SectionHeader heading={testimonialsSection.heading} />}
        />
      </div>
    </Section>
  );
}
