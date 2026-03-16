/**
 * Digital Credential Payment Modal
 *
 * Handles Stripe payment for player/coach digital credentials.
 * Plans: basic ($25/$35 — 1 month), membership ($250/$300 — 1 year), premium ($500/$600 — 1 year)
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, IdCard } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import PaymentService from '@/services/paymentService';
import { PaymentForm } from './PaymentForm';
import { stripePromise } from './StripeProvider';

type PlanType = 'basic' | 'membership' | 'premium';

interface DigitalCredentialPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: PlanType;
  planName: string;
  amount: number;
  userType: 'player' | 'coach';
  onSuccess?: () => void;
}

export const DigitalCredentialPaymentModal = ({
  isOpen,
  onClose,
  planType,
  planName,
  amount,
  userType,
  onSuccess,
}: DigitalCredentialPaymentModalProps) => {
  const [step, setStep] = useState<'confirm' | 'payment'>('confirm');
  const [paymentData, setPaymentData] = useState<{ paymentId: string; clientSecret: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await PaymentService.createDigitalCredentialPayment(planType);
      if (!response.success || !response.data) throw new Error('No se pudo crear la solicitud de pago');
      setPaymentData({ paymentId: response.data.payment_id, clientSecret: response.data.client_secret });
      setStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!paymentData) return;
    try {
      await PaymentService.confirmDigitalCredentialPayment(paymentData.paymentId, paymentIntentId);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al confirmar el pago');
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setPaymentData(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  const duration = planType === 'basic' ? '1 mes' : '1 año';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <IdCard className="w-5 h-5 text-green-400" />
            Credencial Digital — {planName}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {userType === 'player' ? 'Jugador' : 'Entrenador'} · Válida por {duration}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'payment' && paymentData ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-900/30 border border-green-700/40 rounded-lg">
              <p className="font-semibold text-white">
                {planName} — ${amount.toLocaleString()} MXN / {duration}
              </p>
              <p className="text-sm text-slate-400">Credencial Digital verificable con QR</p>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
              <PaymentForm
                paymentId={paymentData.paymentId}
                clientSecret={paymentData.clientSecret}
                amount={amount * 100}
                currency="mxn"
                description={`Credencial Digital — ${planName}`}
                onSuccess={handlePaymentSuccess}
                onError={(err) => {
                  setError(err);
                  setStep('confirm');
                }}
              />
            </Elements>
            <Button onClick={() => setStep('confirm')} variant="outline" className="w-full border-slate-600 text-slate-300">
              Volver
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center p-6 bg-green-900/20 border border-green-700/30 rounded-xl">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-green-400">${amount.toLocaleString()}</span>
                <span className="text-slate-400 text-sm">MXN / {duration}</span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                {planType === 'basic' ? 'Credencial mensual' : 'Membresía anual con credencial'}
              </p>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-black font-bold" size="lg" onClick={handleInitiatePayment} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <IdCard className="w-4 h-4 mr-2" />
                  Pagar ${amount.toLocaleString()} MXN
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DigitalCredentialPaymentModal;
