import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Receipt,
  Download,
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  Star,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Lock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MembershipSelector } from '@/components/payment/MembershipSelector';
import PaymentService, { type Payment } from '@/services/paymentService';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/payment/StripeProvider';
import { PaymentForm } from '@/components/payment/PaymentForm';

function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || null;
  } catch {
    return null;
  }
}

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

  // Player search feature purchase state
  const [searchFeaturePaid, setSearchFeaturePaid] = useState(false);
  const [showSearchPayment, setShowSearchPayment] = useState(false);
  const [searchPaymentData, setSearchPaymentData] = useState<{ paymentId: string; clientSecret: string } | null>(null);
  const [searchPaymentLoading, setSearchPaymentLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getUserIdFromToken();
      const [membershipRes, paymentsRes] = await Promise.all([
        PaymentService.getMembershipStatus(),
        userId ? PaymentService.getUserPaymentHistory(userId, 1, 50) : Promise.resolve({ success: false, data: [], pagination: {} }),
      ]);
      if (membershipRes.success) setMembership(membershipRes.data);
      if (paymentsRes.success) {
        const list = (paymentsRes.data as any)?.payments ?? (paymentsRes.data as any) ?? [];
        setPayments(Array.isArray(list) ? list : []);
        // Check if search feature is paid
        const hasSearchPaid = (Array.isArray(list) ? list : []).some(
          (p: Payment) => p.payment_type === 'player_nearby_search' && p.status === 'completed'
        );
        setSearchFeaturePaid(hasSearchPaid);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
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
    } finally {
      setSearchPaymentLoading(false);
    }
  };

  const handleSearchPaymentSuccess = async (paymentIntentId: string) => {
    if (!searchPaymentData) return;
    try {
      await PaymentService.confirmPayment(searchPaymentData.paymentId, { payment_intent_id: paymentIntentId });
      toast({ title: '¡Acceso activado!', description: 'Ya puedes buscar jugadores cercanos.' });
      setShowSearchPayment(false);
      setSearchPaymentData(null);
      loadData();
    } catch (err) {
      toast({ title: 'Error', description: 'Error confirmando el pago', variant: 'destructive' });
    }
  };

  const isActive = membership && ['active', 'premium'].includes(membership.membership_status) && !membership.is_expired;

  const stats = {
    totalPaid: payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0),
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    thisYearPaid: payments
      .filter(p => p.status === 'completed' && new Date(p.created_at).getFullYear() === new Date().getFullYear())
      .reduce((s, p) => s + Number(p.amount), 0),
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>;
      case 'pending': return <Badge className="bg-yellow-600 hover:bg-yellow-700"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'failed': return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Fallido</Badge>;
      case 'refunded': return <Badge className="bg-blue-600 hover:bg-blue-700">Reembolsado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      annual_membership: 'Membresía Anual',
      tournament_registration: 'Torneo',
      player_nearby_search: 'Búsqueda de Jugadores',
      court_rental: 'Reserva de Cancha',
      premium_plan: 'Plan Premium',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Pagos</h1>
        <p className="text-slate-400 mt-1">Historial de pagos y membresía</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
          <Button size="sm" variant="outline" onClick={loadData} className="ml-auto border-red-500/30 text-red-300">Reintentar</Button>
        </div>
      )}

      {/* Annual Membership Card */}
      <Card className={`border-2 ${isActive ? 'border-green-600 bg-green-900/20' : 'bg-slate-900 border-red-600/50'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Membresía Anual de Jugador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Badge className={isActive ? 'bg-green-600' : 'bg-red-600'}>
                {isActive ? 'Activa' : membership?.is_expired ? 'Vencida' : 'Inactiva'}
              </Badge>
              <p className="text-2xl font-bold text-white mt-2">
                ${(membership?.annual_fee || 500).toLocaleString()} MXN/año
              </p>
              {isActive && membership?.membership_expires_at && (
                <p className="text-sm text-slate-400 mt-1">
                  Vence: {new Date(membership.membership_expires_at).toLocaleDateString('es-MX')}
                </p>
              )}
              {!isActive && (
                <p className="text-sm text-slate-400 mt-1">
                  Activa tu membresía para participar en torneos oficiales y acceder a funciones exclusivas
                </p>
              )}
            </div>
            <Button
              onClick={() => setShowMembershipModal(true)}
              variant={isActive ? 'outline' : 'default'}
              className={!isActive ? 'bg-primary hover:bg-primary/90' : ''}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isActive ? 'Renovar' : 'Activar Membresía'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Paid Features */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Funciones de Pago Adicionales</CardTitle>
          <CardDescription className="text-slate-400">Funciones opcionales para jugadores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Player Search Feature */}
            <div className={`p-4 rounded-lg border ${searchFeaturePaid ? 'bg-green-900/20 border-green-600/40' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className="flex items-center justify-between mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                {searchFeaturePaid
                  ? <Badge className="bg-green-600 text-xs">Activo</Badge>
                  : <Lock className="h-4 w-4 text-slate-500" />}
              </div>
              <p className="text-white font-medium text-sm">Búsqueda de Jugadores</p>
              <p className="text-slate-400 text-xs mt-1">Busca jugadores cercanos en el mapa</p>
              <p className="text-primary font-bold text-sm mt-2">$200 MXN <span className="text-slate-500 font-normal text-xs">(pago único)</span></p>
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
                        onError={(err) => { toast({ title: 'Error', description: err, variant: 'destructive' }); setShowSearchPayment(false); }}
                      />
                    </Elements>
                  </div>
                ) : (
                  <Button size="sm" className="mt-3 w-full" onClick={handleBuySearchFeature} disabled={searchPaymentLoading}>
                    {searchPaymentLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Comprar Acceso
                  </Button>
                )
              )}
              {!searchFeaturePaid && !isActive && (
                <p className="text-xs text-slate-500 mt-2">Requiere membresía anual activa</p>
              )}
            </div>

            {/* Tournament */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <Receipt className="h-5 w-5 text-primary mb-2" />
              <p className="text-white font-medium text-sm">Inscripción a Torneos</p>
              <p className="text-slate-400 text-xs mt-1">Cuota variable por torneo</p>
              <p className="text-primary font-bold text-sm mt-2">Varía por torneo</p>
            </div>

            {/* Court Reservation */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <Calendar className="h-5 w-5 text-primary mb-2" />
              <p className="text-white font-medium text-sm">Reserva de Canchas</p>
              <p className="text-slate-400 text-xs mt-1">Reserva canchas disponibles</p>
              <p className="text-primary font-bold text-sm mt-2">Varía por cancha</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Pagado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.totalPaid.toLocaleString()}</div>
            <p className="text-xs text-slate-400">MXN en total</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pagos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingPayments}</div>
            <p className="text-xs text-slate-400">Esperando confirmación</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pagado Este Año</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.thisYearPaid.toLocaleString()}</div>
            <p className="text-xs text-slate-400">{new Date().getFullYear()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Historial de Pagos
          </CardTitle>
          <CardDescription className="text-slate-400">Todos tus pagos en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No hay pagos registrados</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-400">Fecha</TableHead>
                  <TableHead className="text-slate-400">Descripción</TableHead>
                  <TableHead className="text-slate-400">Tipo</TableHead>
                  <TableHead className="text-slate-400">Monto</TableHead>
                  <TableHead className="text-slate-400">Estado</TableHead>
                  <TableHead className="text-slate-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="text-white">{new Date(payment.created_at).toLocaleDateString('es-MX')}</TableCell>
                    <TableCell>
                      <p className="text-white font-medium">{payment.description || getTypeLabel(payment.payment_type)}</p>
                      {payment.invoice_number && <p className="text-xs text-slate-400">Ref: {payment.invoice_number}</p>}
                    </TableCell>
                    <TableCell className="text-slate-400">{getTypeLabel(payment.payment_type)}</TableCell>
                    <TableCell className="text-white font-medium">
                      ${Number(payment.amount).toLocaleString()} {payment.currency?.toUpperCase() || 'MXN'}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.receipt_url && (
                        <Button variant="outline" size="sm" asChild className="border-slate-700 text-white hover:bg-slate-800">
                          <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-3 w-3 mr-1" />Recibo
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MembershipSelector
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        userType="player"
        currentMembershipStatus={membership?.membership_status || 'free'}
        onSuccess={() => {
          toast({ title: 'Membresía activada', description: 'Tu membresía anual ha sido activada.' });
          setShowMembershipModal(false);
          loadData();
        }}
      />
    </div>
  );
}
