import { useState, useEffect } from 'react';
import {
  DollarSign, CreditCard, Calendar, CheckCircle, Clock, AlertCircle,
  Receipt, Loader2, FileText, Building2, ChevronRight, Zap, ShieldCheck,
  BarChart3, Users, RotateCcw, X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MembershipSelector } from '@/components/payment/MembershipSelector';
import PaymentService, { type Payment } from '@/services/paymentService';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1])).userId || null; } catch { return null; }
}

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  completed: {
    label: 'Completado',
    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  pending: {
    label: 'Pendiente',
    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400 animate-pulse',
  },
  failed: {
    label: 'Fallido',
    cls: 'bg-red-500/10 text-red-400 border-red-500/20',
    dot: 'bg-red-400',
  },
};

const TYPE_LABELS: Record<string, string> = {
  annual_membership: 'Afiliación Anual Estatal',
  tournament_registration: 'Registro a Torneo',
  other: 'Otro',
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? {
    label: status,
    cls: 'bg-white/[0.05] text-white/30 border-white/[0.08]',
    dot: 'bg-white/20',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap', c.cls)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
      {c.label}
    </span>
  );
}

function StatCard({
  label, value, sub, icon: Icon, color, bg,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">{label}</p>
        <p className={cn('text-[26px] font-bold leading-none', color)}>{value}</p>
        <p className="text-[11px] text-white/25 mt-1">{sub}</p>
      </div>
      <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center shrink-0', bg)}>
        <Icon className={cn('w-4 h-4', color)} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StatePaymentsPage() {
  const { toast } = useToast();

  const [membership, setMembership] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getUserIdFromToken();
      const [membershipRes, paymentsRes] = await Promise.all([
        PaymentService.getMembershipStatus(),
        userId
          ? PaymentService.getUserPaymentHistory(userId, 1, 50)
          : Promise.resolve({ success: false, data: [], pagination: {} }),
      ]);
      if (membershipRes.success) setMembership(membershipRes.data);
      if (paymentsRes.success) {
        const list = (paymentsRes.data as any)?.payments ?? (paymentsRes.data as any) ?? [];
        setPayments(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const isActive =
    membership &&
    ['active', 'premium'].includes(membership.membership_status) &&
    !membership.is_expired;

  const totalPaid = payments
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + Number(p.amount), 0);
  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  const FEATURES = [
    { icon: BarChart3,  text: 'Gestión de torneos estatales' },
    { icon: ShieldCheck, text: 'Validación de resultados' },
    { icon: Users,      text: 'Gestión de clubes y jugadores' },
    { icon: Zap,        text: 'Panel de administración' },
    { icon: BarChart3,  text: 'Estadísticas completas' },
    { icon: ShieldCheck, text: 'Acceso completo al dashboard' },
    { icon: CheckCircle, text: 'Sin plan premium adicional' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-5 h-5 text-[#ace600]" />
            <h1 className="text-[22px] font-bold text-white tracking-tight">Pagos y Afiliación</h1>
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider',
              isActive
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400',
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full', isActive ? 'bg-emerald-400' : 'bg-red-400 animate-pulse')} />
              {isActive ? 'Activa' : membership?.is_expired ? 'Vencida' : 'Inactiva'}
            </span>
          </div>
          <p className="text-xs text-white/25">Gestiona la afiliación anual de tu federación estatal</p>
        </div>
      </div>

      {/* ── Error banner ────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/[0.07] border border-red-500/20 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300 flex-1">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 h-7 px-3 rounded-xl text-[11px] font-semibold border border-red-500/20 bg-red-500/[0.08] text-red-300 hover:bg-red-500/20 transition-all"
          >
            <RotateCcw className="w-3 h-3" /> Reintentar
          </button>
        </div>
      )}

      {/* ── Stats strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <StatCard
          label="Total Pagado"
          value={`$${totalPaid.toLocaleString()}`}
          sub="MXN acumulado"
          icon={DollarSign}
          color="text-emerald-400"
          bg="bg-emerald-500/10 border-emerald-500/20"
        />
        <StatCard
          label="Pagos Pendientes"
          value={pendingCount}
          sub="Por procesar"
          icon={Clock}
          color="text-amber-400"
          bg="bg-amber-500/10 border-amber-500/20"
        />
        <StatCard
          label="Próxima Renovación"
          value={
            membership?.membership_expires_at
              ? new Date(membership.membership_expires_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'
          }
          sub="Afiliación estatal"
          icon={Calendar}
          color="text-sky-400"
          bg="bg-sky-500/10 border-sky-500/20"
        />
      </div>

      {/* ── Affiliation card ─────────────────────────────────────────────────── */}
      <div className={cn(
        'bg-[#0d1117] border rounded-2xl overflow-hidden',
        isActive ? 'border-emerald-500/25' : 'border-red-500/25',
      )}>
        {/* Top accent bar */}
        <div className={cn('h-0.5', isActive
          ? 'bg-gradient-to-r from-emerald-500/70 via-emerald-500/30 to-transparent'
          : 'bg-gradient-to-r from-red-500/70 via-red-500/30 to-transparent'
        )} />

        <div className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row gap-6 md:items-start md:justify-between">

            {/* Left — info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-[#ace600]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Afiliación Anual Estatal</p>
                  <p className="text-[11px] text-white/30">Cuota única · acceso completo</p>
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="text-[32px] font-black text-white leading-none tracking-tight">
                  $15,000
                  <span className="text-base font-normal text-white/30 ml-1">MXN / año</span>
                </p>
                {isActive && membership?.membership_expires_at && (
                  <p className="text-[11px] text-white/30 mt-1">
                    Vence el {new Date(membership.membership_expires_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {FEATURES.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-[11px] text-white/40">
                    <div className="w-4 h-4 rounded-md bg-[#ace600]/10 border border-[#ace600]/15 flex items-center justify-center shrink-0">
                      <Icon className="w-2.5 h-2.5 text-[#ace600]" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — CTA */}
            <div className="md:w-56 space-y-2.5 shrink-0">
              <button
                onClick={() => setShowMembershipModal(true)}
                className={cn(
                  'w-full h-10 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
                  isActive
                    ? 'bg-white/[0.05] border border-white/[0.09] text-white/60 hover:bg-white/[0.09] hover:text-white'
                    : 'bg-[#ace600] border border-[#ace600] text-black hover:bg-[#ace600]/90 shadow-[0_0_20px_rgba(172,230,0,0.15)]',
                )}
              >
                <CreditCard className="w-4 h-4" />
                {isActive ? 'Renovar Afiliación' : 'Activar Afiliación'}
              </button>
              {!isActive && (
                <p className="text-[10px] text-white/20 text-center leading-relaxed">
                  Sin afiliación activa no se puede acceder al panel estatal
                </p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Payment history ──────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
          <Receipt className="w-4 h-4 text-white/30" />
          <p className="text-sm font-bold text-white">Historial de Pagos</p>
          {payments.length > 0 && (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-white/20">
              {payments.length} registro{payments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Receipt className="w-4 h-4 text-white/10" />
            </div>
            <p className="text-sm text-white/20">No hay pagos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Fecha', 'Descripción', 'Tipo', 'Monto', 'Estado', 'Recibo'].map((h) => (
                    <th key={h} className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest text-white/20">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {payments.map((payment) => (
                  <tr key={payment.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-[11px] text-white/30 whitespace-nowrap">
                      {new Date((payment as any).createdAt ?? payment.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-white/70 group-hover:text-white transition-colors max-w-[200px] truncate">
                      {payment.description || TYPE_LABELS[payment.payment_type] || payment.payment_type}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-white/30">
                      {TYPE_LABELS[payment.payment_type] || payment.payment_type}
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-white whitespace-nowrap">
                      ${Number(payment.amount).toLocaleString()}
                      <span className="text-white/25 font-normal ml-1">{payment.currency?.toUpperCase() || 'MXN'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusPill status={payment.status} />
                    </td>
                    <td className="py-3 px-4">
                      {payment.receipt_url ? (
                        <a
                          href={payment.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-semibold border border-sky-500/20 bg-sky-500/[0.07] text-sky-400 hover:bg-sky-500/15 transition-all"
                        >
                          <FileText className="w-3 h-3" /> Ver
                        </a>
                      ) : (
                        <span className="text-white/15 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Membership Modal ────────────────────────────────────────────────── */}
      <MembershipSelector
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        userType="state"
        currentMembershipStatus={membership?.membership_status || 'free'}
        onSuccess={() => {
          toast({ title: 'Afiliación activada', description: 'Tu afiliación anual estatal ha sido activada.' });
          setShowMembershipModal(false);
          loadData();
        }}
      />
    </div>
  );
}