import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  Loader,
  AlertCircle,
  Lock,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

interface Props {
  tournamentId: string;
  registrationId: string;
}

const cn = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ');

const inputCls =
  'w-full h-10 rounded-xl px-3.5 text-sm bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20 outline-none focus:border-[#ace600]/50 transition-all';
const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5';

const PaymentPage: any = ({ tournamentId, registrationId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [registrationData, setRegistrationData] = useState<any>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const response = await api.get<ApiResponse<any>>(
          `/tournaments/${tournamentId}/registrations/${registrationId}`,
        );
        setRegistrationData((response as any)?.registration || null);
      } catch (error) {
        setError('Failed to load registration details');
      }
    };
    fetchRegistration();
  }, [tournamentId, registrationId]);

  const validateCardForm = (): boolean => {
    if (!cardNumber || !cardHolder || !expiryMonth || !expiryYear || !cvv) {
      setError('Please fill in all card details');
      return false;
    }
    if (cardNumber.replace(/\s/g, '').length < 13) {
      setError('Invalid card number');
      return false;
    }
    if (cvv.length < 3) {
      setError('Invalid CVV');
      return false;
    }
    return true;
  };

  const validateBankForm = (): boolean => {
    if (!bankAccount) {
      setError('Please enter bank account details');
      return false;
    }
    return true;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (paymentMethod === 'card') {
      if (!validateCardForm()) return;
    } else if (!validateBankForm()) return;

    setLoading(true);
    try {
      const paymentPayload = {
        registration_id: registrationId,
        payment_method: paymentMethod === 'bank' ? 'bank_transfer' : paymentMethod,
        ...(paymentMethod === 'card' && {
          card_number: cardNumber.replace(/\s/g, ''),
          card_holder: cardHolder,
          expiry_month: expiryMonth,
          expiry_year: expiryYear,
          cvv,
        }),
        ...(paymentMethod === 'bank' && { bank_account: bankAccount }),
      };
      const response = await api.post<ApiResponse<any>>(
        `/tournaments/${tournamentId}/payments`,
        paymentPayload,
      );
      if ((response as any)?.success) {
        navigate(`/tournaments/${tournamentId}`);
      } else {
        setError('Payment processing failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton
  if (!registrationData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#080c10]">
        <div className="w-5 h-5 rounded-full border-2 border-[#ace600]/30 border-t-[#ace600] animate-spin" />
      </div>
    );
  }

  const amount = registrationData?.entryFee || registrationData?.event?.entry_fee || 0;

  return (
    <div className="min-h-screen bg-[#080c10] py-10 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        {/* ── Back ──────────────────────────────────────────────────────────*/}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/25 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver
        </button>

        {/* ── Header ────────────────────────────────────────────────────────*/}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-5 h-5 text-[#ace600]" />
            <h1 className="text-[22px] font-bold text-white tracking-tight">Pago</h1>
          </div>
          <p className="text-xs text-white/25">
            Completa tu pago para confirmar tu registro al torneo
          </p>
        </div>

        {/* ── Order summary ─────────────────────────────────────────────────*/}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.06]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
              Resumen del pedido
            </p>
          </div>
          <div className="px-5 py-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/35">Evento</span>
              <span className="text-xs font-semibold text-white/70 truncate max-w-[200px] text-right">
                {registrationData?.event?.name || 'Tournament Event'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/35">Cuota de registro</span>
              <span className="text-xs font-semibold text-white/70">${amount.toFixed(2)}</span>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest text-[10px]">
                Total
              </span>
              <span className="text-lg font-bold text-[#ace600]">${amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── Error ─────────────────────────────────────────────────────────*/}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {/* ── Payment form ──────────────────────────────────────────────────*/}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          {/* Method tabs */}
          <div className="flex p-1.5 gap-1 border-b border-white/[0.06]">
            {(
              [
                { value: 'card', label: 'Tarjeta', icon: CreditCard },
                { value: 'bank', label: 'Transferencia', icon: Building },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setPaymentMethod(value)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-[11px] font-bold transition-all',
                  paymentMethod === value
                    ? 'bg-[#ace600] border border-[#ace600] text-black shadow-[0_0_8px_rgba(172,230,0,0.15)]'
                    : 'text-white/25 hover:text-white/50',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <form onSubmit={handlePayment} className="p-5 space-y-4">
            {paymentMethod === 'card' ? (
              <>
                <div>
                  <label className={labelCls}>Nombre del titular</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Juan Pérez"
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Número de tarjeta</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className={cn(inputCls, 'pr-10')}
                      required
                    />
                    <CreditCard className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Mes</label>
                    <input
                      type="text"
                      value={expiryMonth}
                      onChange={(e) =>
                        setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))
                      }
                      placeholder="MM"
                      maxLength={2}
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Año</label>
                    <input
                      type="text"
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="YYYY"
                      maxLength={4}
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>CVV</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength={4}
                      className={inputCls}
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className={labelCls}>Datos de cuenta bancaria</label>
                <textarea
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Ingresa los datos de tu cuenta bancaria para la transferencia…"
                  rows={4}
                  className="w-full bg-white/[0.04] border border-white/[0.09] focus:border-[#ace600]/50 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/20 outline-none resize-none transition-colors"
                  required
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-bold bg-[#ace600] hover:bg-[#bdf200] text-black transition-all shadow-[0_0_16px_rgba(172,230,0,0.2)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  Procesando…
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Pagar ${amount.toFixed(2)}
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Security note ─────────────────────────────────────────────────*/}
        <div className="flex items-center justify-center gap-2 py-1">
          <ShieldCheck className="w-3.5 h-3.5 text-white/15" />
          <p className="text-[11px] text-white/20">
            Tu información de pago es segura y está cifrada
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
