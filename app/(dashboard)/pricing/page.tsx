import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import {
    getSampleStripePrices,
    getSampleStripeProducts,
    getStripePrices,
    getStripeProducts
} from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {

  const prices = getSampleStripePrices();
  const products = getSampleStripeProducts();

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');
    console.log(basePlan);
    console.log(plusPlan);
  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);
  console.log(basePrice);
    console.log(plusPrice);

  return (
    <main className="relative min-h-screen bg-white">
      <SiteHeader />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        <div className="grid md:grid-cols-2 gap-8 max-w-xl mx-auto">
          <PricingCard
            name={basePlan?.name || 'Base'}
            price={basePrice?.unitAmount || 800}
            interval={basePrice?.interval || 'month'}
            trialDays={basePrice?.trialPeriodDays || 7}
            features={[
              '1 user seat',
              '10 manageable projects',
              'PDF generation',
            ]}
            priceId={basePrice?.id}
          />
          <PricingCard
            name={plusPlan?.name || 'Plus'}
            price={plusPrice?.unitAmount || 1200}
            interval={plusPrice?.interval || 'month'}
            trialDays={plusPrice?.trialPeriodDays || 7}
            features={[
              '10 user seats',
              'unlimited manageable projects',
              'PDF generation & API-service',
            ]}
            priceId={plusPrice?.id}
          />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
}) {
  return (
    <div className="pt-6">
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        with {trialDays} day free trial
      </p>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        {price / 100}{'€ '}
        <span className="text-xl font-normal text-gray-600">
          per user / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton />
      </form>
    </div>
  );
}
