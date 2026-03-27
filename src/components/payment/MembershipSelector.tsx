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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, AlertCircle, Crown, Star, ChevronLeft, Lock, Zap } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import PaymentService from '@/services/paymentService';
import { PaymentForm } from './PaymentForm';
import { stripePromise } from './StripeProvider';
import { cn } from '@/lib/utils';

/* ─── Types ──────────────────────────────────────────────────── */
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
  required?: boolean; // when true: dialog cannot be dismissed without paying
  /** Pre-registration mode: payment happens before account creation */
  preRegistrationMode?: boolean;
  /** Called with the Stripe paymentIntentId after successful payment (pre-registration only) */
  onPreRegistrationPaymentSuccess?: (paymentIntentId: string, planType: string) => void;
}

/* ─── Plans data ─────────────────────────────────────────────── */
const USER_TYPE_PLANS: Record<string, MembershipPlan[]> = {
  player: [
    {
      id: 'player-annual',
      name: 'Afiliación Anual',
      price: 500,
      currency: 'MXN',
      period: 'año',
      description: 'Afiliación anual oficial para jugadores de pickleball',
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
      name: 'Afiliación Anual',
      price: 800,
      currency: 'MXN',
      period: 'año',
      description: 'Afiliación anual oficial para entrenadores',
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
      name: 'Afiliación Anual',
      price: 2000,
      currency: 'MXN',
      period: 'año',
      description: 'Afiliación anual básica para clubes',
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
        'Todo lo de la Afiliación Anual',
        'Gestión de Canchas',
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
        'Gestión de Canchas',
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
      name: 'Afiliación Anual Estatal',
      price: 15000,
      currency: 'MXN',
      period: 'año',
      description: 'Afiliación anual para federaciones estatales',
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

/* ─── Component ─────────────────────────────────────────────── */
export const MembershipSelector = ({
  isOpen,
  onClose,
  userType,
  currentMembershipStatus,
  onSuccess,
  required = false,
  preRegistrationMode = false,
  onPreRegistrationPaymentSuccess,
}: MembershipSelectorProps) => {
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState<{ paymentId: string; clientSecret: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const plans = USER_TYPE_PLANS[userType] || [];

  const handleSelectPlan = async (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setError(null);
    setLoading(true);
    try {
      let response;
      if (preRegistrationMode) {
        response = await PaymentService.createPreRegistrationPayment(userType, plan.type);
      } else {
        response = plan.type === 'annual_membership'
          ? await PaymentService.createAnnualMembershipPayment()
          : await PaymentService.createPremiumPlanPayment();
      }
      if (!response.success || !response.data) throw new Error('No se pudo crear la solicitud de pago');
      setPaymentData({ paymentId: response.data.payment_id, clientSecret: response.data.client_secret });
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
      if (preRegistrationMode) {
        // In pre-registration mode: don't call confirm API (user doesn't exist yet).
        // Hand the paymentIntentId back to the parent so it can call registerUser.
        onPreRegistrationPaymentSuccess?.(paymentIntentId, selectedPlan.type);
        handleClose();
        return;
      }
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

  const isPlanActive = (plan: MembershipPlan) =>
    (plan.type === 'annual_membership' && currentMembershipStatus === 'active') ||
    (plan.type === 'premium_plan' && currentMembershipStatus === 'premium');

  return (
    <Dialog open={isOpen} onOpenChange={(required && !preRegistrationMode) ? undefined : handleClose}>
      <DialogContent
        className={cn(
          'font-["DM_Sans",sans-serif] bg-[#06080E] border border-[#C8FF00]/[0.12]',
          'rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8),0_0_80px_rgba(200,255,0,0.05)]',
          'max-w-3xl p-0 overflow-hidden',
          (required && !preRegistrationMode) ? '[&>button]:hidden' : '[&>button]:text-white/30 [&>button]:hover:text-white [&>button]:border-none',
        )}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-[#C8FF00]/[0.07]">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-[8px] bg-[#C8FF00]/[0.08] border border-[#C8FF00]/[0.15] flex items-center justify-center flex-shrink-0">
                <Zap className="w-3.5 h-3.5 text-[#C8FF00]" />
              </div>
              <DialogTitle className="font-sans font-extrabold text-[18px] text-white tracking-tight">
                Planes de Afiliación
              </DialogTitle>
            </div>
            <DialogDescription className="text-white/35 text-[13px] ml-9">
              Selecciona el plan adecuado para acceder a todas las funcionalidades
            </DialogDescription>
          </DialogHeader>
          {required && (
            <div className="mt-4 flex items-center gap-2.5 px-3.5 py-2.5 bg-amber-500/[0.08] border border-amber-500/[0.2] rounded-xl">
              <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <p className="text-amber-300 text-[12px] font-medium">
                La afiliación anual es requerida para completar el registro y acceder a la plataforma.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-3.5 bg-[#FF5A1F]/[0.08] border border-[#FF5A1F]/[0.25] rounded-xl">
              <AlertCircle className="w-4 h-4 text-[#FF5A1F] flex-shrink-0" />
              <p className="text-[13px] text-[#FF5A1F]">{error}</p>
            </div>
          )}

          {/* ── Payment step ── */}
          {showPayment && selectedPlan && paymentData ? (
            <div className="space-y-4">
              {/* Selected plan summary strip */}
              <div className="flex items-center justify-between p-4 bg-[#C8FF00]/[0.05] border border-[#C8FF00]/[0.15] rounded-xl">
                <div>
                  <p className="font-sans font-extrabold text-[14px] text-white">
                    {selectedPlan.name}
                  </p>
                  <p className="text-[12px] text-white/40 mt-0.5">{selectedPlan.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-sans font-extrabold text-[22px] leading-none text-[#C8FF00]">
                    ${selectedPlan.price.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    {selectedPlan.currency} / {selectedPlan.period}
                  </p>
                </div>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
                <PaymentForm
                  paymentId={paymentData.paymentId}
                  clientSecret={paymentData.clientSecret}
                  amount={selectedPlan.price * 100}
                  currency="mxn"
                  description={`${selectedPlan.name} - ${selectedPlan.price.toLocaleString()} MXN/${selectedPlan.period}`}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => { setError(err); setShowPayment(false); }}
                  skipBackendConfirm={preRegistrationMode}
                />
              </Elements>

              <Button
                onClick={() => setShowPayment(false)}
                variant="ghost"
                className="w-full text-white/40 hover:text-white hover:bg-white/[0.05] rounded-xl gap-2 text-[13px]"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Volver a los planes
              </Button>
            </div>
          ) : (
            /* ── Plan selection ── */
            <>
              <div className={cn(
                'grid gap-4',
                plans.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2',
              )}>
                {plans.map(plan => {
                  const isActive = isPlanActive(plan);
                  const isProcessing = loading && selectedPlan?.id === plan.id;
                  const isPremium = plan.type === 'premium_plan';

                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        'relative rounded-2xl p-5 border transition-all duration-200',
                        plan.popular && !isActive
                          ? 'bg-[#C8FF00]/[0.05] border-[#C8FF00]/[0.3]'
                          : 'bg-white/[0.025] border-white/[0.08]',
                        isActive && 'bg-[#C8FF00]/[0.05] border-[#C8FF00]/[0.25] opacity-80',
                      )}
                    >
                      {/* Popular ribbon */}
                      {plan.popular && !isActive && (
                        <div className="absolute top-3 right-[-34px] bg-[#C8FF00] text-black px-10 py-0.5 rotate-45 font-sans text-[9px] font-extrabold tracking-[1px] overflow-hidden">
                          POPULAR
                        </div>
                      )}

                      {/* Active badge */}
                      {isActive && (
                        <div className="absolute top-4 right-4 inline-flex items-center gap-1 bg-[#C8FF00]/[0.12] border border-[#C8FF00]/[0.25] rounded-full px-2.5 py-0.5 text-[10px] font-bold font-sans text-[#C8FF00] tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00]" /> ACTIVO
                        </div>
                      )}

                      {/* Plan type pill */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className={cn(
                          'w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0',
                          isPremium
                            ? 'bg-amber-400/[0.12] border border-amber-400/[0.2]'
                            : 'bg-[#C8FF00]/[0.08] border border-[#C8FF00]/[0.15]',
                        )}>
                          {isPremium
                            ? <Crown className="w-4 h-4 text-amber-400" />
                            : <Star className="w-4 h-4 text-[#C8FF00]" />}
                        </div>
                        <span className={cn(
                          'text-[10px] font-bold font-sans tracking-[1.5px] uppercase',
                          isPremium ? 'text-amber-400' : 'text-[#C8FF00]',
                        )}>
                          {isPremium ? 'Premium' : 'Afiliación'}
                        </span>
                      </div>

                      {/* Name + description */}
                      <h3 className="font-sans font-extrabold text-[16px] text-white mb-0.5">
                        {plan.name}
                      </h3>
                      <p className="text-[12px] text-white/35 mb-4 leading-relaxed">
                        {plan.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5 mb-5">
                        <span className={cn(
                          'font-sans font-extrabold text-[34px] leading-none tracking-tight',
                          isPremium ? 'text-amber-400' : 'text-[#C8FF00]',
                        )}>
                          ${plan.price.toLocaleString()}
                        </span>
                        <span className="text-[12px] text-white/30">{plan.currency}</span>
                        <span className="text-[12px] text-white/25">/ {plan.period}</span>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-white/[0.06] mb-4" />

                      {/* Features */}
                      <ul className="space-y-2.5 mb-5">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-[12px] text-white/60">
                            <div className={cn(
                              'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-px',
                              isPremium
                                ? 'bg-amber-400/[0.12] border border-amber-400/[0.2]'
                                : 'bg-[#C8FF00]/[0.1] border border-[#C8FF00]/[0.2]',
                            )}>
                              <Check className={cn(
                                'w-2.5 h-2.5',
                                isPremium ? 'text-amber-400' : 'text-[#C8FF00]',
                              )} />
                            </div>
                            {feat}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <Button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={isActive || loading}
                        className={cn(
                          'w-full rounded-xl font-sans font-extrabold text-[13px] gap-2',
                          isActive
                            ? 'bg-white/[0.06] text-white/30 cursor-not-allowed border border-white/[0.1]'
                            : isPremium
                              ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-[0_4px_18px_rgba(251,191,36,0.25)]'
                              : 'bg-[#C8FF00] text-black hover:bg-[#d6ff26] shadow-[0_4px_18px_rgba(200,255,0,0.28)]',
                        )}
                      >
                        {isProcessing ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                        ) : isActive ? (
                          <><Check className="w-3.5 h-3.5" /> Plan Activo</>
                        ) : (
                          `Contratar · $${plan.price.toLocaleString()} MXN`
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Partner info note */}
              {userType === 'partner' && (
                <div className="flex items-start gap-3 p-4 bg-blue-500/[0.07] border border-blue-500/[0.2] rounded-xl">
                  <Lock className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-blue-300 leading-relaxed">
                    <span className="font-bold text-blue-200">Registro gratuito: </span>
                    Tu registro como socio es completamente gratuito. El Plan Premium te permite acceder a
                    funcionalidades avanzadas de gestión de canchas y creación de torneos.
                  </p>
                </div>
              )}

              {/* Security note */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-white/20">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Pagos procesados de forma segura con Stripe
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipSelector;