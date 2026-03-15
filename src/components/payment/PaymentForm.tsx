/**
 * Payment Form Component
 * 
 * Collects payment details using Stripe Elements
 */

import { useState, FormEvent } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import PaymentService from '@/services/paymentService';

interface PaymentFormProps {
  paymentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  description: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export const PaymentForm = ({
  paymentId,
  clientSecret,
  amount,
  currency,
  description,
  onSuccess,
  onError,
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        onError?.(stripeError.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        try {
          const response = await PaymentService.confirmPayment(paymentId, {
            payment_intent_id: paymentIntent.id,
          });

          if (response.success) {
            setSuccess(true);
            onSuccess?.(paymentIntent.id);
          } else {
            throw new Error('Failed to confirm payment on server');
          }
        } catch (backendError) {
          setError(
            backendError instanceof Error
              ? backendError.message
              : 'Payment confirmation failed'
          );
          onError?.(
            backendError instanceof Error
              ? backendError.message
              : 'Payment confirmation failed'
          );
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-3 text-green-600">
          <CheckCircle2 className="w-6 h-6" />
          <p className="text-lg font-semibold">Payment Successful!</p>
        </div>
        <p className="text-center text-gray-600 mt-2">
          {currency.toUpperCase()} {(amount / 100).toFixed(2)}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
        <p className="text-gray-600 mb-1">{description}</p>
        <p className="text-2xl font-bold">
          {currency.toUpperCase()} {(amount / 100).toFixed(2)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${currency.toUpperCase()} ${(amount / 100).toFixed(2)}`
          )}
        </Button>
      </form>
    </Card>
  );
};

export default PaymentForm;
