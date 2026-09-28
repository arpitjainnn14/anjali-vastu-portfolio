import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Section, Container } from '@/components/ui/Section';
import { sandboxEnabled } from '@/lib/razorpay';
import { PayTest } from './PayTest';
import { WebhookLog } from './WebhookLog';

/**
 * Razorpay learning sandbox. `npm run dev` only; a 404 in any production
 * build, and never linked from anywhere. See src/lib/razorpay.ts.
 */
export const metadata: Metadata = {
  title: 'Razorpay sandbox',
  robots: { index: false, follow: false },
};

export default function PayTestPage() {
  if (!sandboxEnabled) notFound();

  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <div className="flex max-w-[760px] flex-col gap-6">
          <h1 className="t-h1 m-0 text-ink">Razorpay sandbox</h1>
          <p className="t-lead m-0">
            Pays ₹2,151 of test money through Standard Checkout and logs every step. Use test mode keys only.
          </p>
          <PayTest />
          <WebhookLog />
        </div>
      </Container>
    </Section>
  );
}
