import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DollarSign, CreditCard, Calendar, CheckCircle, Clock, AlertCircle,
  Receipt, Crown, Star, Loader2, FileText, RefreshCw, ExternalLink,
  Zap, ShieldCheck, BarChart3, Trophy, Wrench,
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

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  completed: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Completado', icon: CheckCircle },
  pending:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   dot: 'bg-amber-400 animate-pulse',   label: 'Pendiente',   icon: Clock },
  failed:    { bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400',     dot: 'bg-red-400',     label: 'Fallido',     icon: AlertCircle },
} as const;

const getS = (s: string) => STATUS_CFG[s as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;

const TYPE_LABELS: Record<string, string> = {
  annual_membership:       'Membresía Anual',
  premium_plan:            'Plan Premium',
  tournament_registration: 'Torneo',
  court_rental:            'Renta de Cancha',
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden', className)}>
      <div className="h-0.5 bg-gradient-to-r from-[#ace600]/30 via-[#ace600]/10 to-transparent" />
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatMini({ label, value, icon: Icon, accent }: {
  label: string; value: React.ReactNode; icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3.5 hover:border-white/[0.12] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{label}</p>
        <div className={cn('w-7 h-7 rounded-xl border flex items-center justify-center', accent)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="text-2xl font-black text-white leading-none">{value}</p>
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-white/45 font-medium">
      <CheckCircle className="w-3 h-3 text-[#ace600]/60 shrink-0" />
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClubPaymentsPage() {
  const { toast } = useToast();
  const { t } = useTranslation();

  const [membership,          setMembership]          = useState<any>(null);
  const [payments,            setPayments]            = useState<Payment[]>([]);
  const [loading,             setLoading]             = useState(true);
  const [error,               setError]               = useState<string | null>(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [planTarget,          setPlanTarget]          = useState<'annual_membership' | 'premium_plan'>('annual_membership');

  const loadData = async () => {
    try {
      setLoading(true); setError(null);
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
      setError(err instanceof Error ? err.message : t('club_dashboard.payments.error_loading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const isBasicActive   = membership?.membership_status === 'active'   && !membership?.is_expired;
  const isPremiumActive = membership?.membership_status === 'premium'  && !membership?.is_expired;
  const memberActive    = isBasicActive || isPremiumActive;

  const openModal = (target: 'annual_membership' | 'premium_plan') => {
    setPlanTarget(target); setShowMembershipModal(true);
  };

  const stats = {
    totalPaid:       payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0),
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    nextRenewal:     membership?.membership_expires_at,
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
      <p className="text-xs text-white/20">Cargando pagos…</p>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[22px] font-black text-white tracking-tight">
              {t('club_dashboard.payments.title')}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <CreditCard className="w-2.5 h-2.5" /> Pagos
            </span>
          </div>
          <p className="text-xs text-white/25">{t('club_dashboard.payments.subtitle')}</p>
        </div>
        <button onClick={loadData}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/35 hover:text-white text-xs font-bold transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar
        </button>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/20 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-0.5">Error</p>
            <p className="text-xs text-red-400/60">{error}</p>
          </div>
          <button onClick={loadData}
            className="h-8 px-3 rounded-xl text-[11px] font-bold border border-red-500/20 text-red-400 hover:bg-red-500/[0.08] transition-all">
            {t('club_dashboard.payments.retry')}
          </button>
        </div>
      )}

      {/* ── Plan cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Basic Annual */}
        <div className={cn(
          'bg-[#0d1117] rounded-2xl border overflow-hidden transition-all',
          memberActive ? 'border-[#ace600]/30 shadow-[0_0_20px_rgba(172,230,0,0.06)]' : 'border-white/[0.07]',
        )}>
          <div className={cn('h-0.5 bg-gradient-to-r via-transparent to-transparent',
            memberActive ? 'from-[#ace600]/50' : 'from-white/[0.06]')} />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shrink-0',
                  memberActive ? 'bg-[#ace600]/10 border-[#ace600]/20' : 'bg-white/[0.04] border-white/[0.08]')}>
                  <Star className={cn('w-4 h-4', memberActive ? 'text-[#ace600]' : 'text-white/25')} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Membresía Anual Básica</p>
                  <p className="text-[11px] text-white/25 mt-0.5">Afiliación oficial a la Federación</p>
                </div>
              </div>
              <span className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest shrink-0',
                memberActive
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : membership?.is_expired
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-white/[0.04] border-white/[0.08] text-white/25',
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full',
                  memberActive ? 'bg-emerald-400' : membership?.is_expired ? 'bg-red-400' : 'bg-white/20')} />
                {memberActive ? 'Activa' : membership?.is_expired ? 'Vencida' : 'Inactiva'}
              </span>
            </div>

            <p className="text-3xl font-black text-white mb-1">$2,000 <span className="text-base text-white/25 font-bold">MXN / año</span></p>
            {memberActive && membership?.membership_expires_at && (
              <p className="text-[11px] text-white/30 mb-3 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Vence: {new Date(membership.membership_expires_at).toLocaleDateString('es-MX')}
              </p>
            )}

            <div className="space-y-1.5 mb-4">
              <FeatureItem>Perfil de club activo</FeatureItem>
              <FeatureItem>Gestión de miembros</FeatureItem>
              <FeatureItem>Acceso a torneos</FeatureItem>
            </div>

            <button
              onClick={() => openModal('annual_membership')}
              className={cn(
                'w-full h-9 rounded-xl text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all',
                memberActive
                  ? 'border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white'
                  : 'bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.15)]',
              )}>
              <CreditCard className="w-3.5 h-3.5" />
              {memberActive ? 'Renovar Membresía' : 'Activar Membresía Anual'}
            </button>
          </div>
        </div>

        {/* Premium Plan */}
        <div className={cn(
          'bg-[#0d1117] rounded-2xl border overflow-hidden transition-all',
          isPremiumActive ? 'border-amber-400/30 shadow-[0_0_20px_rgba(251,191,36,0.08)]' : 'border-white/[0.07]',
        )}>
          <div className={cn('h-0.5 bg-gradient-to-r via-transparent to-transparent',
            isPremiumActive ? 'from-amber-400/50' : 'from-white/[0.06]')} />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shrink-0',
                  isPremiumActive ? 'bg-amber-400/10 border-amber-400/20' : 'bg-white/[0.04] border-white/[0.08]')}>
                  <Crown className={cn('w-4 h-4', isPremiumActive ? 'text-amber-400' : 'text-white/25')} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Plan Premium</p>
                  <p className="text-[11px] text-white/25 mt-0.5">Canchas, torneos e ingresos por rentas</p>
                </div>
              </div>
              {isPremiumActive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-amber-400/10 border-amber-400/20 text-amber-400 text-[10px] font-black uppercase tracking-widest shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Activo
                </span>
              )}
            </div>

            <p className="text-3xl font-black text-white mb-4">$5,000 <span className="text-base text-white/25 font-bold">MXN / año</span></p>

            <div className="space-y-1.5 mb-4">
              <FeatureItem>Todo lo del plan básico</FeatureItem>
              <FeatureItem>Gestión de Canchas</FeatureItem>
              <FeatureItem>Creación de Torneos</FeatureItem>
              <FeatureItem>Ingresos por rentas de canchas</FeatureItem>
              <FeatureItem>Análisis avanzado</FeatureItem>
              <FeatureItem>Soporte prioritario</FeatureItem>
            </div>

            <button
              onClick={() => openModal('premium_plan')}
              disabled={!memberActive}
              className={cn(
                'w-full h-9 rounded-xl text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all disabled:opacity-35',
                isPremiumActive
                  ? 'border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white'
                  : 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_12px_rgba(251,191,36,0.18)]',
              )}>
              <Crown className="w-3.5 h-3.5" />
              {isPremiumActive ? 'Renovar Plan Premium' : 'Activar Plan Premium'}
            </button>
            {!memberActive && (
              <p className="text-[10px] text-white/20 text-center mt-2">Activa primero la membresía anual</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <StatMini label="Total Pagado"
          value={`$${stats.totalPaid.toLocaleString()}`}
          icon={DollarSign}
          accent="bg-emerald-400/10 border-emerald-400/20 text-emerald-400" />
        <StatMini label="Pagos Pendientes"
          value={stats.pendingPayments}
          icon={Clock}
          accent="bg-amber-400/10 border-amber-400/20 text-amber-400" />
        <StatMini label="Próxima Renovación"
          value={stats.nextRenewal ? new Date(stats.nextRenewal).toLocaleDateString('es-MX') : '—'}
          icon={Calendar}
          accent="bg-sky-400/10 border-sky-400/20 text-sky-400" />
      </div>

      {/* ── Payment History ───────────────────────────────────────────────────── */}
      <SectionCard>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Historial de Pagos</p>
            <p className="text-[11px] text-white/25 mt-0.5">Todos los pagos del club</p>
          </div>
          {payments.length > 0 && (
            <span className="ml-auto inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-white/[0.04] border-white/[0.08] text-white/25">
              {payments.length}
            </span>
          )}
        </div>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white/10" />
            </div>
            <p className="text-xs text-white/20">No hay pagos registrados</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-white/[0.05]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
                  {['Fecha', 'Descripción', 'Tipo', 'Monto', 'Estado', ''].map(h => (
                    <TableHead key={h} className="text-[10px] font-black uppercase tracking-widest text-white/20 h-10 px-4">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map(payment => {
                  const s = getS(payment.status);
                  const StatusIcon = s.icon;
                  return (
                    <TableRow key={payment.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">

                      <TableCell className="py-3.5 px-4 text-xs text-white/40 font-medium whitespace-nowrap">
                        {new Date(payment.created_at).toLocaleDateString('es-MX')}
                      </TableCell>

                      <TableCell className="py-3.5 px-4">
                        <p className="text-xs font-bold text-white/75 group-hover:text-white transition-colors">
                          {payment.description || TYPE_LABELS[payment.payment_type] || payment.payment_type}
                        </p>
                      </TableCell>

                      <TableCell className="py-3.5 px-4">
                        <span className="text-[11px] text-white/35 font-medium">
                          {TYPE_LABELS[payment.payment_type] || payment.payment_type}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5 px-4">
                        <span className="text-xs font-black text-white/75">
                          ${Number(payment.amount).toLocaleString()} {payment.currency?.toUpperCase() || 'MXN'}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5 px-4">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest',
                          s.bg, s.border, s.text,
                        )}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
                          {s.label}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5 px-4">
                        {payment.receipt_url && (
                          <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg border border-sky-400/15 bg-sky-400/[0.05] hover:bg-sky-400/[0.12] text-sky-400/40 hover:text-sky-400 flex items-center justify-center transition-all">
                            <FileText className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      <MembershipSelector
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        userType="club"
        currentMembershipStatus={membership?.membership_status || 'free'}
        onSuccess={planType => {
          toast({
            title: planType === 'premium_plan' ? 'Plan Premium activado' : 'Membresía activada',
            description: 'Tu plan ha sido activado exitosamente.',
          });
          setShowMembershipModal(false);
          loadData();
        }}
      />
    </div>
  );
}