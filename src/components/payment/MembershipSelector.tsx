/**
 * Membership Selector Component
 *
 * Role-based membership plan display.
 * Shows the correct plan(s) based on the user's role:
 * - Player: Annual membership $500 MXN/year
 * - Coach: Annual membership $800 MXN/year
 * - Club: Basic annual $2,000 MXN/year | Premium Plan $5,000 MXN/year
 * - State: Annual membership $15,000 MXN/year
 * - Partner: No annual fee | Premium Plan $8,000 MXN/year (only option)
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
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, AlertCircle, Crown, Star } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import PaymentService from '@/services/paymentService';
import { PaymentForm } from './PaymentForm';
import { stripePromise } from './StripeProvider';

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  type: 'annual_membership' | 'premium_plan';
  popular?: boolean;
}

interface MembershipSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  userType: string;
  currentMembershipStatus?: string;
  onSuccess?: (planType: string) => void;
}

const USER_TYPE_PLANS: Record<string, MembershipPlan[]> = {
  player: [
    {
      id: 'player-annual',
      name: 'Membresía Anual',
      price: 500,
      currency: 'MXN',
      period: 'año',
      description: 'Membresía anual oficial para jugadores de pickleball',
      features: [
        'Perfil de jugador activo',
        'Participación en torneos oficiales',
        'Seguimiento de estadísticas',
        'Credencial digital',
        'Acceso al ranking oficial',
      ],
      type: 'annual_membership',
      popular: true,
    },
  ],
  coach: [
    {
      id: 'coach-annual',
      name: 'Membresía Anual',
      price: 800,
      currency: 'MXN',
      period: 'año',
      description: 'Membresía anual oficial para entrenadores',
      features: [
        'Perfil de entrenador activo',
        'Acceso a herramientas de entrenamiento',
        'Seguimiento de estadísticas',
        'Credencial digital de entrenador',
        'Compra de licencias disponible',
      ],
      type: 'annual_membership',
      popular: true,
    },
  ],
  club: [
    {
      id: 'club-annual',
      name: 'Membresía Anual',
      price: 2000,
      currency: 'MXN',
      period: 'año',
      description: 'Membresía anual básica para clubes',
      features: [
        'Perfil de club activo',
        'Gestión de miembros',
        'Acceso a torneos',
        'Herramientas básicas de gestión',
        'Estadísticas del club',
      ],
      type: 'annual_membership',
    },
    {
      id: 'club-premium',
      name: 'Plan Premium',
      price: 5000,
      currency: 'MXN',
      period: 'año',
      description: 'Plan premium con funcionalidades avanzadas para clubes',
      features: [
        'Todo lo de la Membresía Anual +',
        'Gestión de Canchas (Court Management)',
        'Creación de Torneos',
        'Panel de análisis avanzado',
        'Soporte prioritario',
        'Acceso completo a la plataforma',
      ],
      type: 'premium_plan',
      popular: true,
    },
  ],
  partner: [
    {
      id: 'partner-premium',
      name: 'Plan Premium',
      price: 8000,
      currency: 'MXN',
      period: 'año',
      description: 'Plan premium para socios y patrocinadores',
      features: [
        'Registro gratuito como socio',
        'Gestión de Canchas (Court Management)',
        'Creación de Torneos',
        'Visibilidad en la plataforma',
        'Herramientas de patrocinio',
        'Soporte prioritario',
      ],
      type: 'premium_plan',
      popular: true,
    },
  ],
  state: [
    {
      id: 'state-annual',
      name: 'Membresía Anual Estatal',
      price: 15000,
      currency: 'MXN',
      period: 'año',
      description: 'Membresía anual para federaciones estatales',
      features: [
        'Perfil estatal activo',
        'Gestión de torneos estatales',
        'Validación de resultados',
        'Gestión de clubes y jugadores del estado',
        'Estadísticas estatales',
        'Panel de administración estatal',
      ],
      type: 'annual_membership',
      popular: true,
    },
  ],
};

export const MembershipSelector = ({
  isOpen,
  onClose,
  userType,
  currentMembershipStatus,
  onSuccess,
}: MembershipSelectorProps) => {
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    clientSecret: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const plans = USER_TYPE_PLANS[userType] || [];

  const handleSelectPlan = async (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setError(null);
    setLoading(true);

    try {
      let response;
      if (plan.type === 'annual_membership') {
        response = await PaymentService.createAnnualMembershipPayment();
      } else {
        response = await PaymentService.createPremiumPlanPayment();
      }

      if (!response.success || !response.data) {
        throw new Error('No se pudo crear la solicitud de pago');
      }

      setPaymentData({
        paymentId: response.data.payment_id,
        clientSecret: response.data.client_secret,
      });
      setShowPayment(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el plan');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!selectedPlan || !paymentData) return;

    try {
      if (selectedPlan.type === 'annual_membership') {
        await PaymentService.confirmAnnualMembership(paymentData.paymentId, paymentIntentId);
      } else {
        await PaymentService.confirmPremiumPlan(paymentData.paymentId, paymentIntentId);
      }
      onSuccess?.(selectedPlan.type);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al confirmar el pago');
    }
  };

  const handleClose = () => {
    setSelectedPlan(null);
    setShowPayment(false);
    setPaymentData(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  const isPlanActive = (plan: MembershipPlan) => {
    if (plan.type === 'annual_membership' && currentMembershipStatus === 'active') return true;
    if (plan.type === 'premium_plan' && currentMembershipStatus === 'premium') return true;
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Planes de Membresía</DialogTitle>
          <DialogDescription>
            Selecciona el plan adecuado para acceder a todas las funcionalidades
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showPayment && selectedPlan && paymentData ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg">{selectedPlan.name}</h3>
              <p className="text-gray-600">
                ${selectedPlan.price.toLocaleString()} {selectedPlan.currency}/{selectedPlan.period}
              </p>
            </div>
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: paymentData.clientSecret }}
            >
              <PaymentForm
                paymentId={paymentData.paymentId}
                clientSecret={paymentData.clientSecret}
                amount={selectedPlan.price * 100}
                currency="mxn"
                description={`${selectedPlan.name} - ${selectedPlan.price.toLocaleString()} MXN/${selectedPlan.period}`}
                onSuccess={handlePaymentSuccess}
                onError={(err) => {
                  setError(err);
                  setShowPayment(false);
                }}
              />
            </Elements>
            <Button onClick={() => setShowPayment(false)} variant="outline" className="w-full">
              Volver a los planes
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {plans.map((plan) => {
              const isActive = isPlanActive(plan);
              const isSelected = selectedPlan?.id === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={`p-6 relative transition-all ${
                    plan.popular ? 'border-primary shadow-lg' : ''
                  } ${isActive ? 'bg-green-50 border-green-400' : ''} ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {plan.popular && !isActive && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                      <Star className="w-3 h-3 mr-1" />
                      Recomendado
                    </Badge>
                  )}

                  {plan.type === 'premium_plan' && (
                    <Badge className="absolute top-4 right-4 bg-yellow-500">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}

                  {isActive && (
                    <Badge className="absolute top-4 right-4 bg-green-600">
                      Plan Activo
                    </Badge>
                  )}

                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">${plan.price.toLocaleString()}</span>
                      <span className="text-gray-500">{plan.currency}</span>
                    </div>
                    <p className="text-gray-500 text-sm">por {plan.period}</p>
                  </div>

                  <div className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isActive || loading}
                  >
                    {loading && selectedPlan?.id === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : isActive ? (
                      'Plan Activo'
                    ) : (
                      `Contratar - $${plan.price.toLocaleString()} MXN`
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        {userType === 'partner' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Registro gratuito:</strong> Tu registro como socio es completamente gratuito.
              El Plan Premium te permite acceder a funcionalidades avanzadas de gestión de canchas y creación de torneos.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MembershipSelector;
