import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * lazy-loaded Stripe instance
 */
export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

/**
 * Prices for membership tiers
 * Managed via environment variables for security and flexibility.
 * NOTE: Replace these with your actual Stripe Price IDs (starts with price_...)
 * found in the Stripe Dashboard > Products > [Your Product].
 */
export const MEMBERSHIP_PRICES = {
  STANDARD: import.meta.env.VITE_STRIPE_PRICE_STANDARD || 'price_1P3Z...placeholder',
  PRO: import.meta.env.VITE_STRIPE_PRICE_PRO || 'price_1P3Z...placeholder',
  ELITE: import.meta.env.VITE_STRIPE_PRICE_ELITE || 'price_1P3Z...placeholder',
};

/**
 * Initiates a Stripe Checkout session
 */
export const redirectToCheckout = async (priceId: string) => {
  const stripe = await getStripe();
  
  if (!stripe) {
    throw new Error('Stripe failed to initialize.');
  }

  // NOTE: For client-side only checkout, you need to enable it in Stripe Dashboard
  // Settings > Payments > Checkout settings > "Enable client-only integration"
  // However, the standard way is to use a server to create a session.
  // We specify success/cancel URLs here.
  
  const { error } = await (stripe as any).redirectToCheckout({
    lineItems: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/membership`,
  });

  if (error) {
    console.error('Stripe Redirect Error:', error);
    throw error;
  }
};
