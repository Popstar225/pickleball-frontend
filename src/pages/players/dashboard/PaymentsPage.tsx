import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Receipt, CreditCard, DollarSign, Calendar, FileText, Star,
  MapPin, Loader2, AlertCircle, CheckCircle, Clock, Lock, Zap, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MembershipSelector } from '@/components/payment/MembershipSelector';
import PaymentService, { type Payment } from '@/services/paymentService';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/payment/StripeProvider';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { cn } from '@/lib/utils';

function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || null;
  } catch { return null; }
}

/* ─── Status badge ───────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    completed: {
      label: 'Completado',
      className: 'bg-[#C8FF00]/[0.1] border border-[#C8FF00]/[0.22] text-[#C8FF00]',
      icon: <CheckCircle className="w-3 h-3" />,
    },
    pending: {
      label: 'Pendiente',
      className: 'bg-amber-500/[0.1] border border-amber-500/[0.22] text-amber-400',
      icon: <Clock className="w-3 h-3" />,
    },
    failed: {
      label: 'Fallido',
      className: 'bg-[#FF5A1F]/[0.1] border border-[#FF5A1F]/[0.22] text-[#FF5A1F]',
      icon: <AlertCircle className="w-3 h-3" />,
    },
    refunded: {
      label: 'Reembolsado',
      className: 'bg-blue-500/[0.1] border border-blue-500/[0.22] text-blue-400',
      icon: null,
    },
  };
  const cfg = map[status] ?? { label: status, className: 'bg-white/[0.06] border border-white/[0.1] text-white/50', icon: null };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold font-sans tracking-wide', cfg.className)}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

/* ─── Stat card ──────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, iconColor }: {
  icon: React.ElementType; label: string; value: string; sub: string; iconColor: string;
}) {
  return (
    <Card className="bg-white/[0.025] border border-[#C8FF00]/[0.08] rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] text-white/65 font-medium">{label}</span>
          <div className={cn('w-8 h-8 rounded-[9px] flex items-center justify-center', iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <p className="font-sans font-extrabold text-[26px] leading-none text-white tracking-tight">
          {value}
        </p>
        <p className="text-[11px] text-white/60 mt-1.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

const TYPE_LABELS: Record<string, string> = {
  annual_membership: 'Afiliación Anual',
  tournament_registration: 'Torneo',
  player_nearby_search: 'Búsqueda de Jugadores',
  court_rental: 'Reserva de Cancha',
  premium_plan: 'Plan Premium',
};

/* ─── Main Page ─────────────────────────────────────────────── */
export default function PlayerPaymentsPage() {
  const { toast } = useToast();

  const [membership, setMembership] = useState<{
    membership_status: string;
    membership_tier: string | null;
    membership_expires_at: string | null;
    annual_fee: number;
    is_expired: boolean;
  } | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [searchFeaturePaid, setSearchFeaturePaid] = useState(false);
  const [showSearchPayment, setShowSearchPayment] = useState(false);
  const [searchPaymentData, setSearchPaymentData] = useState<{ paymentId: string; clientSecret: string } | null>(null);
  const [searchPaymentLoading, setSearchPaymentLoading] = useState(false);

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
        const arr = Array.isArray(list) ? list : [];
        setPayments(arr);
        setSearchFeaturePaid(arr.some((p: Payment) => p.payment_type === 'player_nearby_search' && p.status === 'completed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleBuySearchFeature = async () => {
    setSearchPaymentLoading(true);
    try {
      const res = await PaymentService.createPlayerFeaturePayment('nearby_search');
      if (res.success && res.data) {
        setSearchPaymentData({ paymentId: res.data.payment_id, clientSecret: res.data.client_secret });
        setShowSearchPayment(true);
      }
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error al procesar', variant: 'destructive' });
    } finally { setSearchPaymentLoading(false); }
  };

  const handleSearchPaymentSuccess = async (paymentIntentId: string) => {
    if (!searchPaymentData) return;
    try {
      await PaymentService.confirmPayment(searchPaymentData.paymentId, { payment_intent_id: paymentIntentId });
      toast({ title: '¡Acceso activado!', description: 'Ya puedes buscar jugadores cercanos.' });
      setShowSearchPayment(false); setSearchPaymentData(null); loadData();
    } catch {
      toast({ title: 'Error', description: 'Error confirmando el pago', variant: 'destructive' });
    }
  };

  const isActive = membership && ['active', 'premium'].includes(membership.membership_status) && !membership.is_expired;

  const stats = {
    totalPaid: payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0),
    pending: payments.filter(p => p.status === 'pending').length,
    thisYear: payments
      .filter(p => p.status === 'completed' && new Date(p.created_at).getFullYear() === new Date().getFullYear())
      .reduce((s, p) => s + Number(p.amount), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-[#C8FF00] animate-spin" />
          <span className="text-white/60 text-sm font-['DM_Sans',sans-serif]">Cargando pagos…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['DM_Sans',sans-serif]">

      {/* ── Page header ── */}
      <div>
        <h1 className="font-sans font-extrabold text-[28px] tracking-tight text-white leading-none">
          Pagos
        </h1>
        <p className="text-white/65 text-[13px] mt-1.5">Historial de pagos y gestión de Afiliación</p>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-[#FF5A1F]/[0.08] border border-[#FF5A1F]/[0.25] rounded-2xl">
          <AlertCircle className="w-4 h-4 text-[#FF5A1F] flex-shrink-0" />
          <p className="text-[13px] text-[#FF5A1F] flex-1">{error}</p>
          <Button
            size="sm"
            onClick={loadData}
            className="bg-[#FF5A1F]/[0.12] text-[#FF5A1F] border border-[#FF5A1F]/[0.25] hover:bg-[#FF5A1F]/[0.2] rounded-xl text-[12px]"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* ── Membership card ── */}
      <Card className={cn(
        'rounded-2xl border-2 overflow-hidden',
        isActive
          ? 'bg-[#C8FF00]/[0.04] border-[#C8FF00]/[0.3]'
          : 'bg-[#FF5A1F]/[0.04] border-[#FF5A1F]/[0.25]',
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-5">
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0',
                isActive ? 'bg-[#C8FF00]/[0.12] border border-[#C8FF00]/[0.2]' : 'bg-[#FF5A1F]/[0.12] border border-[#FF5A1F]/[0.2]',
              )}>
                <Star className={cn('w-5 h-5', isActive ? 'text-[#C8FF00]' : 'text-[#FF5A1F]')} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <p className="font-sans font-extrabold text-[15px] text-white">
                    Afiliación Anual de Jugador
                  </p>
                  <span className={cn(
                    'px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans tracking-wide',
                    isActive
                      ? 'bg-[#C8FF00]/[0.12] border border-[#C8FF00]/[0.25] text-[#C8FF00]'
                      : 'bg-[#FF5A1F]/[0.12] border border-[#FF5A1F]/[0.25] text-[#FF5A1F]',
                  )}>
                    {isActive ? 'ACTIVA' : membership?.is_expired ? 'VENCIDA' : 'INACTIVA'}
                  </span>
                </div>
                <p className="font-sans font-extrabold text-[28px] leading-none text-white tracking-tight">
                  ${(membership?.annual_fee || 500).toLocaleString()}
                  <span className="text-[14px] font-normal text-white/65 ml-1.5">MXN/año</span>
                </p>
                {isActive && membership?.membership_expires_at ? (
                  <p className="text-[12px] text-white/65 mt-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Vence el {new Date(membership.membership_expires_at).toLocaleDateString('en-US')}
                  </p>
                ) : (
                  <p className="text-[12px] text-white/65 mt-1.5 max-w-sm">
                    Activa tu Afiliación para participar en torneos oficiales y acceder a funciones exclusivas
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={() => setShowMembershipModal(true)}
              className={cn(
                'rounded-xl font-sans font-extrabold text-[13px] gap-2',
                isActive
                  ? 'bg-white/[0.07] border border-white/[0.12] text-white hover:bg-white/[0.12]'
                  : 'bg-[#C8FF00] text-black hover:bg-[#d6ff26] shadow-[0_4px_20px_rgba(200,255,0,0.25)]',
              )}
            >
              <CreditCard className="w-3.5 h-3.5" />
              {isActive ? 'Renovar' : 'Activar Afiliación'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Add-ons ── */}
      <Card className="bg-white/[0.025] border border-[#C8FF00]/[0.08] rounded-2xl">
        <CardHeader className="px-5 pt-5 pb-3.5 border-b border-[#C8FF00]/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[8px] bg-[#C8FF00]/[0.08] border border-[#C8FF00]/[0.15] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#C8FF00]" />
            </div>
            <div>
              <CardTitle className="text-[13px] font-sans font-bold tracking-[1px] uppercase text-white/95">
                Funciones Adicionales
              </CardTitle>
              <CardDescription className="text-white/60 text-[12px] mt-0.5">
                Funciones opcionales para jugadores
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Player search */}
            <div className={cn(
              'p-4 rounded-xl border',
              searchFeaturePaid
                ? 'bg-[#C8FF00]/[0.05] border-[#C8FF00]/[0.2]'
                : 'bg-white/[0.03] border-white/[0.07]',
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  'w-8 h-8 rounded-[9px] flex items-center justify-center',
                  searchFeaturePaid
                    ? 'bg-[#C8FF00]/[0.12] border border-[#C8FF00]/[0.2]'
                    : 'bg-white/[0.06] border border-white/[0.1]',
                )}>
                  <MapPin className={cn('w-4 h-4', searchFeaturePaid ? 'text-[#C8FF00]' : 'text-white/65')} />
                </div>
                {searchFeaturePaid
                  ? <span className="text-[10px] font-bold font-sans bg-[#C8FF00]/[0.1] border border-[#C8FF00]/[0.22] text-[#C8FF00] px-2 py-0.5 rounded-full">ACTIVO</span>
                  : <Lock className="w-3.5 h-3.5 text-white/50" />}
              </div>
              <p className="font-sans font-bold text-[13px] text-white mb-0.5">Búsqueda de Jugadores</p>
              <p className="text-[11px] text-white/65 mb-2.5">Busca jugadores cercanos en el mapa</p>
              <p className="font-sans font-extrabold text-[15px] text-[#C8FF00]">
                $200 MXN
                <span className="text-[11px] font-normal text-white/60 ml-1">pago único</span>
              </p>
              {!searchFeaturePaid && isActive && (
                showSearchPayment && searchPaymentData ? (
                  <div className="mt-3">
                    <Elements stripe={stripePromise} options={{ clientSecret: searchPaymentData.clientSecret }}>
                      <PaymentForm
                        paymentId={searchPaymentData.paymentId}
                        clientSecret={searchPaymentData.clientSecret}
                        amount={20000}
                        currency="mxn"
                        description="Búsqueda de Jugadores Cercanos - $200 MXN"
                        onSuccess={handleSearchPaymentSuccess}
                        onError={(err) => {
                          toast({ title: 'Error', description: err, variant: 'destructive' });
                          setShowSearchPayment(false);
                        }}
                      />
                    </Elements>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleBuySearchFeature}
                    disabled={searchPaymentLoading}
                    className="mt-3 w-full bg-[#C8FF00] text-black font-sans font-extrabold rounded-xl text-[12px] hover:bg-[#d6ff26] gap-1.5"
                  >
                    {searchPaymentLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Comprar Acceso
                  </Button>
                )
              )}
              {!searchFeaturePaid && !isActive && (
                <p className="text-[11px] text-white/88 mt-2.5">Requiere Afiliación activa</p>
              )}
            </div>

            {/* Tournaments */}
            <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.07]">
              <div className="w-8 h-8 rounded-[9px] bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mb-3">
                <Receipt className="w-4 h-4 text-white/65" />
              </div>
              <p className="font-sans font-bold text-[13px] text-white mb-0.5">Inscripción a Torneos</p>
              <p className="text-[11px] text-white/65 mb-2.5">Cuota variable por torneo</p>
              <p className="font-sans font-bold text-[13px] text-white/50">Varía por torneo</p>
            </div>

            {/* Courts */}
            <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.07]">
              <div className="w-8 h-8 rounded-[9px] bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mb-3">
                <Calendar className="w-4 h-4 text-white/65" />
              </div>
              <p className="font-sans font-bold text-[13px] text-white mb-0.5">Reserva de Canchas</p>
              <p className="text-[11px] text-white/65 mb-2.5">Reserva canchas disponibles</p>
              <p className="font-sans font-bold text-[13px] text-white/50">Varía por cancha</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Pagado"
          value={`$${stats.totalPaid.toLocaleString()}`}
          sub="MXN acumulado"
          iconColor="bg-[#C8FF00]/[0.1] border border-[#C8FF00]/[0.18] text-[#C8FF00]"
        />
        <StatCard
          icon={Clock}
          label="Pagos Pendientes"
          value={String(stats.pending)}
          sub="Esperando confirmación"
          iconColor="bg-amber-500/[0.1] border border-amber-500/[0.18] text-amber-400"
        />
        <StatCard
          icon={Calendar}
          label="Pagado Este Año"
          value={`$${stats.thisYear.toLocaleString()}`}
          sub={String(new Date().getFullYear())}
          iconColor="bg-blue-500/[0.1] border border-blue-500/[0.18] text-blue-400"
        />
      </div>

      {/* ── Payment history ── */}
      <Card className="bg-white/[0.025] border border-[#C8FF00]/[0.08] rounded-2xl overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-3.5 border-b border-[#C8FF00]/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[8px] bg-[#C8FF00]/[0.08] border border-[#C8FF00]/[0.15] flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5 text-[#C8FF00]" />
            </div>
            <div>
              <CardTitle className="text-[13px] font-sans font-bold tracking-[1px] uppercase text-white/95">
                Historial de Pagos
              </CardTitle>
              <CardDescription className="text-white/60 text-[12px] mt-0.5">
                Todos tus pagos en la plataforma
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white/50" />
              </div>
              <p className="text-white/60 text-[13px]">No hay pagos registrados</p>
            </div>
          ) : (() => {
            const totalPages = Math.ceil(payments.length / PAGE_SIZE);
            const paged = payments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
            return (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
                      <TableHead className="text-[11px] font-bold font-sans tracking-[1px] uppercase text-white/60 px-5">Fecha</TableHead>
                      <TableHead className="text-[11px] font-bold font-sans tracking-[1px] uppercase text-white/60">Descripción</TableHead>
                      <TableHead className="text-[11px] font-bold font-sans tracking-[1px] uppercase text-white/60">Tipo</TableHead>
                      <TableHead className="text-[11px] font-bold font-sans tracking-[1px] uppercase text-white/60">Monto</TableHead>
                      <TableHead className="text-[11px] font-bold font-sans tracking-[1px] uppercase text-white/60">Estado</TableHead>
                      <TableHead className="text-[11px] font-bold font-sans tracking-[1px] uppercase text-white/60 pr-5">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map(payment => (
                      <TableRow
                        key={payment.id}
                        className="border-b border-white/[0.04] last:border-none hover:bg-white/[0.02] transition-colors"
                      >
                        <TableCell className="text-[13px] text-white/60 px-5 py-3.5">
                          {new Date(payment.created_at).toLocaleDateString('en-US')}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <p className="text-[13px] font-medium text-white/85">
                            {payment.description || TYPE_LABELS[payment.payment_type] || payment.payment_type}
                          </p>
                          {payment.invoice_number && (
                            <p className="text-[11px] text-white/88 mt-0.5 font-['JetBrains_Mono',monospace]">
                              {payment.invoice_number}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-[12px] text-white/65 py-3.5">
                          {TYPE_LABELS[payment.payment_type] || payment.payment_type}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <span className="font-sans font-extrabold text-[15px] text-[#C8FF00]">
                            ${Number(payment.amount).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-white ml-1">
                            {payment.currency?.toUpperCase() || 'MXN'}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <StatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell className="py-3.5 pr-5">
                          {payment.receipt_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="bg-transparent border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.06] rounded-xl text-[12px] gap-1.5"
                            >
                              <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-3 h-3" /> Recibo
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.05]">
                    <p className="text-[12px] text-white/60">
                      {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, payments.length)} de {payments.length} pagos
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] text-white/65 hover:text-white hover:bg-white/[0.06] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={cn(
                            'w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-bold font-sans transition-all',
                            p === page
                              ? 'bg-[#C8FF00]/[0.12] border border-[#C8FF00]/[0.25] text-[#C8FF00]'
                              : 'border border-white/[0.08] text-white/65 hover:text-white hover:bg-white/[0.06]',
                          )}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.08] text-white/65 hover:text-white hover:bg-white/[0.06] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </CardContent>
      </Card>

      <MembershipSelector
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        userType="player"
        currentMembershipStatus={membership?.membership_status || 'free'}
        onSuccess={() => {
          toast({ title: 'Afiliación activada', description: 'Tu Afiliación anual ha sido activada.' });
          setShowMembershipModal(false);
          loadData();
        }}
      />
    </div>
  );
}