/**
 * OwnStripeSetup
 *
 * Allows clubs and partners to configure their own independent Stripe account keys.
 * Payments go directly to their Stripe account — the platform has zero involvement.
 */

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, CheckCircle2, AlertCircle, Loader2, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const A = '#ace600';

interface OwnStripeSetupProps {
  userType: 'club' | 'partner';
}

export function OwnStripeSetup({ userType }: OwnStripeSetupProps) {
  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey]           = useState('');
  const [showSecret, setShowSecret]         = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [configured, setConfigured]         = useState<boolean | null>(null);
  const [loadingStatus, setLoadingStatus]   = useState(true);

  // Check if keys are already saved (we only know if publishable key exists)
  useEffect(() => {
    const check = async () => {
      try {
        // GET /clubs/stripe-keys/status — returns whether keys are set
        const res = await api.get<any>('/clubs/stripe-keys/status');
        setConfigured(!!res?.stripe_publishable_key);
        if (res?.stripe_publishable_key) {
          setPublishableKey(res.stripe_publishable_key);
        }
      } catch {
        setConfigured(false);
      } finally {
        setLoadingStatus(false);
      }
    };
    check();
  }, []);

  const handleSave = async () => {
    if (!publishableKey.startsWith('pk_')) {
      toast.error('La clave publicable debe comenzar con "pk_"');
      return;
    }
    if (!secretKey.startsWith('sk_')) {
      toast.error('La clave secreta debe comenzar con "sk_"');
      return;
    }
    setSaving(true);
    try {
      await api.put('/clubs/stripe-keys', {
        stripe_publishable_key: publishableKey.trim(),
        stripe_secret_key: secretKey.trim(),
      });
      setConfigured(true);
      setSecretKey('');
      toast.success('Claves de Stripe guardadas', {
        description: 'Los pagos ahora irán directamente a tu cuenta de Stripe.',
      });
    } catch {
      // error toast handled by api interceptor
    } finally {
      setSaving(false);
    }
  };

  const label = userType === 'club' ? 'club' : 'socio';

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: 'rgba(172,230,0,0.07)', border: '1px solid rgba(172,230,0,0.15)' }}>
            <Key className="w-4 h-4" style={{ color: A }} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white/85">Sistema de Pagos Independiente</p>
            <p className="text-[11px] text-white/35 mt-0.5">
              Los pagos van directo a tu cuenta de Stripe — la plataforma no interviene
            </p>
          </div>
        </div>

        {loadingStatus ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/[0.05] text-white/30">
            <Loader2 className="w-3 h-3 animate-spin" /> Verificando…
          </span>
        ) : configured ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
            style={{ background: 'rgba(172,230,0,0.08)', borderColor: 'rgba(172,230,0,0.2)', color: A }}>
            <CheckCircle2 className="w-3 h-3" /> Configurado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/[0.05] text-white/40 border border-white/[0.07]">
            Sin configurar
          </span>
        )}
      </div>

      {/* What payments you receive */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-1.5">
        <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">
          Pagos que recibirás directamente
        </p>
        <PaymentRow label="Rentas de cancha" />
        <PaymentRow label="Inscripciones a torneos (cuando tu club es anfitrión)" />
      </div>

      {/* Keys form */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-4">
        <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
          Claves de tu cuenta Stripe
        </p>

        {/* Publishable key */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-white/40">
            Clave publicable <span className="text-white/20 font-normal">(pk_live_xxx o pk_test_xxx)</span>
          </label>
          <input
            value={publishableKey}
            onChange={(e) => setPublishableKey(e.target.value)}
            placeholder="pk_live_..."
            className={cn(
              'w-full h-9 px-3 rounded-xl text-[12px] font-mono bg-white/[0.04] border border-white/[0.08]',
              'text-white/70 placeholder:text-white/20 outline-none focus:border-[#ace600]/30 transition-colors',
            )}
          />
        </div>

        {/* Secret key */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-white/40">
            Clave secreta <span className="text-white/20 font-normal">(sk_live_xxx o sk_test_xxx)</span>
          </label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder={configured ? '••••••••••••••••••••• (dejar vacío para no cambiar)' : 'sk_live_...'}
              className={cn(
                'w-full h-9 pl-3 pr-9 rounded-xl text-[12px] font-mono bg-white/[0.04] border border-white/[0.08]',
                'text-white/70 placeholder:text-white/20 outline-none focus:border-[#ace600]/30 transition-colors',
              )}
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
            >
              {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !publishableKey || (!secretKey && !configured)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-40"
          style={{ background: A, color: '#080c14' }}
        >
          {saving
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando…</>
            : <><Save className="w-3.5 h-3.5" /> Guardar claves</>}
        </button>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/[0.05] border border-amber-500/[0.15] rounded-xl">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400/70 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-400/60 leading-relaxed">
          La clave secreta se almacena de forma segura y nunca se expone al frontend.
          Obtén tus claves en{' '}
          <span className="text-amber-400/80 font-semibold">dashboard.stripe.com/apikeys</span>.
        </p>
      </div>

      <p className="text-[11px] text-white/20 leading-relaxed">
        Los cobros son procesados íntegramente por tu cuenta de{' '}
        <span className="text-white/35 font-semibold">Stripe</span>.
        La plataforma no tiene acceso ni visibilidad sobre tus transacciones.
      </p>
    </div>
  );
}

const PaymentRow = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 text-[12px] text-white/55">
    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: A }} />
    {label}
  </div>
);

export default OwnStripeSetup;
