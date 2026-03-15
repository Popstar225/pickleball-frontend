/**
 * Premium Plan Modal
 *
 * Allows clubs and partners to upgrade to the Premium Plan.
 * Premium Plan unlocks: Court Management + Tournament Creation
 * - Club: $5,000 MXN/year
 * - Partner: $8,000 MXN/year
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, AlertCircle, Crown, MapPin, Trophy } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import PaymentService from '@/services/paymentService';
import { PaymentForm } from './PaymentForm';
import { stripePromise } from './StripeProvider';

interface PremiumPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'club' | 'partner';
  onSuccess?: () => void;
}

const PREMIUM_PLAN_FEES: Record<string, number> = {
  club: 5000,
  partner: 8000,
};

const PREMIUM_PLAN_FEATURES = [
  {
    icon: MapPin,
    title: 'Gestión de Canchas',
    description: 'Administra tus canchas, horarios y reservaciones',
  },
  {
    icon: Trophy,
    title: 'Creación de Torneos',
    description: 'Organiza y gestiona torneos de pickleball',
  },
];

export const PremiumPlanModal = ({
  isOpen,
  onClose,
  userType,
  onSuccess,
}: PremiumPlanModalProps) => {
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    clientSecret: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fee = PREMIUM_PLAN_FEES[userType] || 0;

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await PaymentService.createPremiumPlanPayment();

      if (!response.success || !response.data) {
        throw new Error('No se pudo crear la solicitud de pago');
      }

      setPaymentData({
        paymentId: response.data.payment_id,
        clientSecret: response.data.client_secret,
      });
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
      await PaymentService.confirmPremiumPlan(paymentData.paymentId, paymentIntentId);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al confirmar el pago');
    }
  };

  const handleClose = () => {
    setStep('info');
    setPaymentData(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Plan Premium
          </DialogTitle>
          <DialogDescription>
            Desbloquea funcionalidades avanzadas para tu{' '}
            {userType === 'club' ? 'club' : 'organización'}
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
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold">Plan Premium - ${fee.toLocaleString()} MXN/año</p>
              <p className="text-sm text-gray-600">Gestión de Canchas + Creación de Torneos</p>
            </div>
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: paymentData.clientSecret }}
            >
              <PaymentForm
                paymentId={paymentData.paymentId}
                clientSecret={paymentData.clientSecret}
                amount={fee * 100}
                currency="mxn"
                description={`Plan Premium - ${fee.toLocaleString()} MXN/año`}
                onSuccess={handlePaymentSuccess}
                onError={(err) => {
                  setError(err);
                  setStep('info');
                }}
              />
            </Elements>
            <Button onClick={() => setStep('info')} variant="outline" className="w-full">
              Volver
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Price */}
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
              <Badge className="bg-yellow-500 mb-3">
                <Crown className="w-3 h-3 mr-1" />
                Plan Premium
              </Badge>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">${fee.toLocaleString()}</span>
                <span className="text-gray-500">MXN/año</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Funcionalidades incluidas:</h3>
              {PREMIUM_PLAN_FEATURES.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                  <Check className="w-4 h-4 text-green-600 mt-1 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>

            {userType === 'partner' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Como socio, tu registro es gratuito. El Plan Premium te permite gestionar canchas y crear torneos.
                </p>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Activar Plan Premium - ${fee.toLocaleString()} MXN/año
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PremiumPlanModal;
