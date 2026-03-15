/**
 * Stripe Provider Component
 * 
 * Wraps the app with Stripe context for payment processing
 */

import { ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error(
    'STRIPE_PUBLISHABLE_KEY is not set. Please add it to your .env file'
  );
}

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY || '');

interface StripeProviderProps {
  children: ReactNode;
}

export const StripeProvider = ({ children }: StripeProviderProps) => {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: 'payment',
        amount: 0,
        currency: 'mxn',
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0ea5e9',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
};

export default StripeProvider;
