import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { ArrowLeft, Trophy, CreditCard, AlertTriangle } from 'lucide-react';
import PaymentService from '@/services/paymentService';

interface TournamentCreationPaymentStepProps {
  paymentId: string;
  /** Amount in MXN (not cents) — for display only */
  amount: number;
  tournamentName: string;
  organizerType: 'club' | 'state';
  onSuccess: () => void;
  onBack: () => void;
}

export function TournamentCreationPaymentStep({
  paymentId,
  amount,
  tournamentName,
  organizerType,
  onSuccess,
  onBack,
}: TournamentCreationPaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);
    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });
      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        await PaymentService.confirmPayment(paymentId, { payment_intent_id: paymentIntent.id });
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="px-7 pt-6 pb-5 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-[#ace600]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">Tournament Creation Fee</h2>
            <p className="text-[11px] text-white/30 mt-0.5">
              Complete payment to publish your tournament
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 px-7 py-6 space-y-5">
        {/* Summary card */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Order Summary</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-3.5 h-3.5 text-[#ace600]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{tournamentName}</p>
              <p className="text-[11px] text-white/35 capitalize">{organizerType} · tournament creation</p>
            </div>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-white/[0.06]">
            <span className="text-[11px] text-white/35">Creation fee</span>
            <span className="font-bold text-[#ace600] text-xl">
              ${amount.toLocaleString()} <span className="text-sm font-normal text-white/30">MXN</span>
            </span>
          </div>
        </div>

        {/* Stripe PaymentElement */}
        <div>
          <p className="text-[11px] font-semibold text-white/40 mb-3">Payment Details</p>
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>

        {error && (
          <div className="flex gap-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-7 py-4 border-t border-white/[0.06] bg-[#0a0e14] flex-shrink-0">
        <button
          onClick={onBack}
          disabled={processing}
          className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/55 transition-colors disabled:opacity-40"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <button
          onClick={handlePay}
          disabled={processing || !stripe || !elements}
          className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] active:scale-[0.98] text-black text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-150 disabled:opacity-50 shadow-[0_0_18px_rgba(172,230,0,0.2)] hover:shadow-[0_0_28px_rgba(172,230,0,0.35)]"
        >
          <div className={`w-3.5 h-3.5 border-2 border-black/25 border-t-black rounded-full animate-spin ${processing ? '' : 'hidden'}`} />
          <CreditCard className={`w-4 h-4 ${processing ? 'hidden' : ''}`} />
          Pay ${amount.toLocaleString()} &amp; Create
        </button>
      </div>
    </>
  );
}
