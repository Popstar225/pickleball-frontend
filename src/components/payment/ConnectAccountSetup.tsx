/**
 * ConnectAccountSetup
 *
 * Reusable component for setting up / managing a Stripe Connect payout account.
 * Used on the Club "Pagos" tab and the Admin payments page.
 */

import { useEffect, useState } from 'react';
import { Loader2, ExternalLink, CheckCircle2, AlertCircle, ArrowRight, Banknote, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import StripeConnectService, { ConnectAccountStatus } from '@/services/stripeConnectService';

interface ConnectAccountSetupProps {
  userType: 'admin' | 'club' | 'partner' | 'state';
  /** Called after onboarding link is opened so parent can show a message */
  onOnboardingStarted?: () => void;
}

const A = '#ace600';

type SetupStep = 'idle' | 'creating' | 'fetching_link' | 'fetching_status' | 'opening_dashboard';

export const ConnectAccountSetup = ({ userType, onOnboardingStarted }: ConnectAccountSetupProps) => {
  const [status, setStatus] = useState<ConnectAccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<SetupStep>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await StripeConnectService.getAccountStatus();
      setStatus(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al obtener estado de cuenta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleCreateAndOnboard = async () => {
    setError(null);
    try {
      // Step 1: create account if not yet created
      if (!status?.connected) {
        setStep('creating');
        await StripeConnectService.createAccount();
      }
      // Step 2: get onboarding link and redirect
      setStep('fetching_link');
      const res = await StripeConnectService.getOnboardingLink();
      onOnboardingStarted?.();
      window.location.href = res.data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar configuración');
    } finally {
      setStep('idle');
    }
  };

  const handleOpenDashboard = async () => {
    setError(null);
    setStep('opening_dashboard');
    try {
      const res = await StripeConnectService.getDashboardLink();
      window.open(res.data.url, '_blank');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al abrir panel de Stripe');
    } finally {
      setStep('idle');
    }
  };

  const busy = loading || step !== 'idle';

  // ── Status badge ───────────────────────────────────────────────────────────
  const StatusBadge = () => {
    if (loading) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/[0.05] text-white/30">
          <Loader2 className="w-3 h-3 animate-spin" /> Verificando…
        </span>
      );
    }
    if (!status?.connected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/[0.05] text-white/40 border border-white/[0.07]">
          Sin configurar
        </span>
      );
    }
    if (status.onboarded) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
          style={{ background: 'rgba(172,230,0,0.08)', borderColor: 'rgba(172,230,0,0.2)', color: A }}>
          <CheckCircle2 className="w-3 h-3" /> Activa
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/[0.08] border border-amber-500/[0.2] text-amber-400">
        <AlertCircle className="w-3 h-3" /> Pendiente
      </span>
    );
  };

  // ── Capability rows ────────────────────────────────────────────────────────
  const CapRow = ({ label, enabled }: { label: string; enabled: boolean }) => (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-[12px] text-white/50">{label}</span>
      <span className={cn(
        'text-[11px] font-bold',
        enabled ? 'text-[#ace600]' : 'text-white/25',
      )}>
        {enabled ? 'Habilitado' : 'No habilitado'}
      </span>
    </div>
  );

  const labelFor = {
    admin: 'administrador',
    club: 'club',
    partner: 'socio',
    state: 'estado',
  }[userType];

  return (
    <div className="space-y-4">
      {/* ── Header card ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: 'rgba(172,230,0,0.07)', border: '1px solid rgba(172,230,0,0.15)' }}>
            <Banknote className="w-4 h-4" style={{ color: A }} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white/85">Cuenta de Cobros (Stripe)</p>
            <p className="text-[11px] text-white/35 mt-0.5">
              Recibe pagos directamente como {labelFor}
            </p>
          </div>
        </div>
        <StatusBadge />
      </div>

      {/* ── What payments you receive ────────────────────────────────────────── */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-1.5">
        <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">
          Pagos que recibirás
        </p>
        {userType === 'admin' && (
          <>
            <PaymentRow label="Cuotas anuales de afiliación" />
            <PaymentRow label="Planes Premium (clubes y socios)" />
            <PaymentRow label="Funciones de jugador (búsqueda en mapa)" />
            <PaymentRow label="Licencias de entrenador" />
            <PaymentRow label="Credenciales digitales" />
            <PaymentRow label="Inscripciones a torneos (cuando admin es anfitrión)" />
          </>
        )}
        {(userType === 'club' || userType === 'partner') && (
          <>
            <PaymentRow label="Rentas de cancha" />
            <PaymentRow label="Inscripciones a torneos (cuando tu club es anfitrión)" />
          </>
        )}
        {userType === 'state' && (
          <>
            <PaymentRow label="Inscripciones a torneos estatales" />
          </>
        )}
      </div>

      {/* ── Capabilities (when account exists) ──────────────────────────────── */}
      {status?.connected && (
        <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">
            Estado de la cuenta
          </p>
          <CapRow label="Información enviada" enabled={!!status.details_submitted} />
          <CapRow label="Cobros habilitados"  enabled={!!status.charges_enabled} />
          <CapRow label="Pagos habilitados"   enabled={!!status.payouts_enabled} />
          {status.account_id && (
            <p className="text-[10px] text-white/20 mt-2 font-mono">{status.account_id}</p>
          )}
        </div>
      )}

      {/* ── Pending requirements ─────────────────────────────────────────────── */}
      {status?.requirements?.currently_due && status.requirements.currently_due.length > 0 && (
        <div className="p-4 bg-amber-500/[0.06] border border-amber-500/[0.18] rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-[12px] font-bold text-amber-300">Información requerida por Stripe</p>
          </div>
          <ul className="space-y-1">
            {status.requirements.currently_due.slice(0, 5).map((req) => (
              <li key={req} className="text-[11px] text-amber-400/70 font-mono">{req}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-500/[0.07] border border-red-500/[0.2] rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-[12px] text-red-400">{error}</p>
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {/* Main CTA */}
        {!status?.onboarded ? (
          <button
            onClick={handleCreateAndOnboard}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-40"
            style={{ background: A, color: '#080c14' }}
          >
            {busy && step !== 'opening_dashboard' ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {step === 'creating' ? 'Creando cuenta…' : 'Redirigiendo…'}</>
            ) : (
              <><ArrowRight className="w-3.5 h-3.5" /> {status?.connected ? 'Completar configuración' : 'Configurar cuenta de cobros'}</>
            )}
          </button>
        ) : (
          <button
            onClick={handleOpenDashboard}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-40"
            style={{ background: A, color: '#080c14' }}
          >
            {step === 'opening_dashboard' ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Abriendo…</>
            ) : (
              <><ExternalLink className="w-3.5 h-3.5" /> Abrir panel de Stripe</>
            )}
          </button>
        )}

        {/* Refresh status */}
        <button
          onClick={fetchStatus}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white/40 hover:text-white/70 border border-white/[0.07] hover:border-white/[0.14] transition-all disabled:opacity-30"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          Actualizar estado
        </button>
      </div>

      {/* Stripe notice */}
      <p className="text-[11px] text-white/20 leading-relaxed">
        Los cobros son procesados por{' '}
        <span className="text-white/35 font-semibold">Stripe</span>. Los fondos se depositan
        directamente en tu cuenta bancaria según el calendario de pagos configurado en Stripe.
      </p>
    </div>
  );
};

const PaymentRow = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 text-[12px] text-white/55">
    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: A }} />
    {label}
  </div>
);

export default ConnectAccountSetup;
