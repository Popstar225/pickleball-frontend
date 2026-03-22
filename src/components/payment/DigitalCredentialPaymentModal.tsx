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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Check, Lock, CreditCard } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import PaymentService from '@/services/paymentService';
import { PaymentForm } from './PaymentForm';
import { stripePromise } from './StripeProvider';
import { cn } from '@/lib/utils';

type PlanType = 'basic' | 'membership' | 'premium';

interface DigitalCredentialPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: PlanType;
  planName: string;
  amount: number;
  userType: 'player' | 'coach';
  onSuccess?: (credential?: any) => void;
}

const PLAN_META: Record<PlanType, {
  duration: string;
  desc: string;
  features: string[];
}> = {
  basic: {
    duration: '1 mes',
    desc: 'Credencial mensual verificable con QR',
    features: [
      'Credencial digital con código QR',
      'Perfil verificado por 1 mes',
      'Acceso al directorio de jugadores',
    ],
  },
  membership: {
    duration: '1 año',
    desc: 'Membresía anual con credencial digital',
    features: [
      'Todo lo del plan básico',
      'Vigencia de 12 meses',
      'Estadísticas de juego integradas',
      'Prioridad en inscripción a torneos',
    ],
  },
  premium: {
    duration: '1 año',
    desc: 'Membresía premium con beneficios exclusivos',
    features: [
      'Todo lo del plan membresía',
      'Perfil destacado en directorio',
      'Acceso a eventos y zonas VIP',
      'Soporte prioritario 24/7',
      'Insignia premium verificada',
    ],
  },
};

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

  const meta = PLAN_META[planType];
  const userLabel = userType === 'player' ? 'Jugador' : 'Entrenador';

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
    setLoading(true);
    setError(null);
    try {
      const result = await PaymentService.confirmDigitalCredentialPayment(paymentData.paymentId, paymentIntentId);
      const credential = result?.data?.credential ?? null;
      onSuccess?.(credential);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al confirmar el pago. Contacta soporte con tu comprobante de pago.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setPaymentData(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 gap-0 bg-[#13131A] border border-[#2A2A3E] rounded-2xl overflow-hidden font-['DM_Sans',sans-serif] text-white [&>button]:hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-[#2A2A3E]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(200,255,0,0.08)] border border-[rgba(200,255,0,0.18)] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <circle cx="8" cy="12" r="2" />
                  <path d="M14 10h4M14 14h4" />
                </svg>
              </div>
              <div>
                <DialogTitle className="font-sans font-bold text-[17px] text-white leading-tight">
                  Credencial Digital
                </DialogTitle>
                <DialogDescription className="text-[#5A5A7A] text-[13px] mt-0.5">
                  {userLabel} · Válida por {meta.duration}
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center bg-[#1C1C27] border border-[#2A2A3E] rounded-lg text-[#5A5A7A] hover:text-white hover:border-[#353550] transition-all flex-shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-3.5 bg-[rgba(226,75,74,0.08)] border border-[rgba(226,75,74,0.2)] rounded-xl">
              <AlertCircle className="w-4 h-4 text-[#E24B4A] flex-shrink-0" />
              <span className="text-[#E24B4A] text-sm">{error}</span>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <>
              {/* Plan badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(200,255,0,0.07)] border border-[rgba(200,255,0,0.16)] rounded-full">
                <span className="text-[#C8FF00] text-[11px] font-bold font-sans uppercase tracking-wide">
                  {planName}
                </span>
              </div>

              {/* Price block */}
              <div className="bg-[#1C1C27] border border-[#2A2A3E] rounded-2xl p-5 text-center">
                <p className="text-[#5A5A7A] text-[11px] uppercase tracking-widest font-sans mb-2">
                  Precio del plan
                </p>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="font-sans font-extrabold text-[44px] text-[#C8FF00] leading-none">
                    ${amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-[#5A5A7A] text-sm mt-1">MXN / {meta.duration}</p>
                <p className="text-[#5A5A7A] text-xs mt-1.5">{meta.desc}</p>
              </div>

              {/* Features */}
              <div className="space-y-2.5">
                {meta.features.map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-[13px] text-[#9090B0]">
                    <div className="w-[18px] h-[18px] rounded-full bg-[rgba(200,255,0,0.1)] flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-[#C8FF00]" strokeWidth={3} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={handleInitiatePayment}
                disabled={loading}
                className="w-full py-3.5 bg-[#C8FF00] hover:bg-[#d4ff1a] text-black font-sans font-extrabold text-[15px] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando…
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pagar ${amount.toLocaleString()} MXN
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[#3A3A5A] text-xs">
                <Lock className="w-3 h-3" />
                Pago seguro cifrado con Stripe
              </div>
            </>
          )}

          {/* Step: Payment */}
          {step === 'payment' && paymentData && (
            <>
              {/* Summary */}
              <div className="bg-[rgba(200,255,0,0.05)] border border-[rgba(200,255,0,0.12)] rounded-xl p-4">
                <p className="text-[#5A5A7A] text-[11px] uppercase tracking-widest font-sans mb-1.5">
                  Resumen del pago
                </p>
                <p className="text-white font-medium text-sm">
                  {planName} — {userLabel}
                </p>
                <p className="font-sans font-extrabold text-[22px] text-[#C8FF00] mt-0.5">
                  ${amount.toLocaleString()} MXN
                </p>
                <p className="text-[#5A5A7A] text-xs mt-0.5">
                  Válida por {meta.duration} · Credencial QR verificable
                </p>
              </div>

              {/* Stripe Elements */}
              <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
                <PaymentForm
                  paymentId={paymentData.paymentId}
                  clientSecret={paymentData.clientSecret}
                  amount={amount * 100}
                  currency="mxn"
                  description={`Credencial Digital — ${planName}`}
                  skipBackendConfirm
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => {
                    setError(err);
                    setStep('confirm');
                  }}
                />
              </Elements>

              <button
                onClick={() => setStep('confirm')}
                className="w-full py-3 bg-transparent border border-[#2A2A3E] hover:border-[#353550] text-[#9090B0] hover:text-white font-['DM_Sans',sans-serif] text-[14px] rounded-xl transition-all"
              >
                Volver
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DigitalCredentialPaymentModal;