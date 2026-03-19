import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DollarSign, CreditCard, Calendar, CheckCircle, Clock, AlertCircle,
  Receipt, Award, Star, Loader2, FileText,
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
  try { return JSON.parse(atob(token.split('.')[1])).userId || null; } catch { return null; }
}

const LICENSE_TIERS = [
  { type: 'basic',        label: 'Licencia Básica',        amount: 800 },
  { type: 'professional', label: 'Licencia Profesional',   amount: 1500 },
  { type: 'advanced',     label: 'Licencia Avanzada',      amount: 2500 },
];

export default function CoachPaymentsPage() {
  const { toast } = useToast();

  const [membership, setMembership] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const [licensePaymentData, setLicensePaymentData] = useState<{ paymentId: string; clientSecret: string; label: string; amount: number } | null>(null);
  const [licenseLoading, setLicenseLoading] = useState<string | null>(null);

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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleBuyLicense = async (tier: typeof LICENSE_TIERS[0]) => {
    setLicenseLoading(tier.type);
    try {
      const res = await PaymentService.createCoachLicensePayment(tier.type, tier.amount);
      if (res.success && res.data) {
        setLicensePaymentData({ paymentId: res.data.payment_id, clientSecret: res.data.client_secret, label: tier.label, amount: tier.amount });
      }
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Error al procesar', variant: 'destructive' });
    } finally {
      setLicenseLoading(null);
    }
  };

  const handleLicensePaymentSuccess = async (paymentIntentId: string) => {
    if (!licensePaymentData) return;
    try {
      await PaymentService.confirmPayment(licensePaymentData.paymentId, { payment_intent_id: paymentIntentId });
      toast({ title: '¡Licencia adquirida!', description: `${licensePaymentData.label} activada exitosamente.` });
      setLicensePaymentData(null);
      loadData();
    } catch {
      toast({ title: 'Error', description: 'Error confirmando el pago', variant: 'destructive' });
    }
  };

  const isActive = membership && ['active', 'premium'].includes(membership.membership_status) && !membership.is_expired;
  const stats = {
    totalPaid: payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0),
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    nextRenewal: membership?.membership_expires_at,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>;
      case 'pending': return <Badge className="bg-yellow-600"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'failed': return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Fallido</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => ({
    annual_membership: 'Membresía Anual', coach_license: 'Licencia', certification: 'Certificación',
  }[type] || type);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Pagos y Facturación</h1>
        <p className="text-slate-200 mt-1">Gestiona tu membresía anual y licencias de entrenador</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
          <Button size="sm" variant="outline" onClick={loadData} className="ml-auto border-red-500/30 text-red-300">Reintentar</Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Annual Membership */}
        <Card className={`border-2 ${isActive ? 'border-green-600 bg-green-900/20' : 'bg-slate-900 border-red-600/50'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Membresía Anual
            </CardTitle>
            <CardDescription className="text-slate-200">Cuota anual obligatoria para entrenadores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge className={isActive ? 'bg-green-600' : 'bg-red-600'}>
              {isActive ? 'Activa' : membership?.is_expired ? 'Vencida' : 'Inactiva'}
            </Badge>
            <p className="text-2xl font-bold text-white">${(membership?.annual_fee || 800).toLocaleString()} MXN/año</p>
            {isActive && membership?.membership_expires_at && (
              <p className="text-sm text-slate-200">Vence: {new Date(membership.membership_expires_at).toLocaleDateString('en-US')}</p>
            )}
            <Button className="w-full" variant={isActive ? 'outline' : 'default'} onClick={() => setShowMembershipModal(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              {isActive ? 'Renovar Membresía' : 'Activar Membresía'}
            </Button>
          </CardContent>
        </Card>

        {/* Coach Licenses */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Licencias de Entrenador
            </CardTitle>
            <CardDescription className="text-slate-200">Adquiere certificaciones a través de la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {licensePaymentData ? (
              <div className="space-y-3">
                <p className="text-white font-medium">{licensePaymentData.label} — ${licensePaymentData.amount.toLocaleString()} MXN</p>
                <Elements stripe={stripePromise} options={{ clientSecret: licensePaymentData.clientSecret }}>
                  <PaymentForm
                    paymentId={licensePaymentData.paymentId}
                    clientSecret={licensePaymentData.clientSecret}
                    amount={licensePaymentData.amount * 100}
                    currency="mxn"
                    description={licensePaymentData.label}
                    onSuccess={handleLicensePaymentSuccess}
                    onError={(err) => { toast({ title: 'Error', description: err, variant: 'destructive' }); setLicensePaymentData(null); }}
                  />
                </Elements>
                <Button variant="outline" className="w-full" onClick={() => setLicensePaymentData(null)}>Cancelar</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {LICENSE_TIERS.map(tier => (
                  <div key={tier.type} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium text-sm">{tier.label}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-sm">${tier.amount.toLocaleString()} MXN</span>
                      <Button size="sm" variant="outline" onClick={() => handleBuyLicense(tier)} disabled={!isActive || licenseLoading === tier.type} className="border-slate-600 text-white">
                        {licenseLoading === tier.type ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Comprar'}
                      </Button>
                    </div>
                  </div>
                ))}
                {!isActive && <p className="text-xs text-slate-300 mt-2">Se requiere membresía anual activa</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Total Pagado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.totalPaid.toLocaleString()}</div>
            <p className="text-xs text-slate-200">MXN este año</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Pagos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingPayments}</div>
            <p className="text-xs text-slate-200">Por procesar</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Próxima Renovación</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.nextRenewal ? new Date(stats.nextRenewal).toLocaleDateString('en-US') : '—'}
            </div>
            <p className="text-xs text-slate-200">Membresía anual</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><Receipt className="h-5 w-5" />Historial de Pagos</CardTitle>
          <CardDescription className="text-slate-200">Todos tus pagos y transacciones</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-10 text-slate-300">No hay pagos registrados</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-200">Descripción</TableHead>
                  <TableHead className="text-slate-200">Tipo</TableHead>
                  <TableHead className="text-slate-200">Monto</TableHead>
                  <TableHead className="text-slate-200">Estado</TableHead>
                  <TableHead className="text-slate-200">Fecha</TableHead>
                  <TableHead className="text-slate-200">Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">{payment.description || getTypeLabel(payment.payment_type)}</TableCell>
                    <TableCell className="text-slate-200">{getTypeLabel(payment.payment_type)}</TableCell>
                    <TableCell className="text-white font-medium">${Number(payment.amount).toLocaleString()} {payment.currency?.toUpperCase() || 'MXN'}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-white">{new Date(payment.created_at).toLocaleDateString('en-US')}</TableCell>
                    <TableCell>
                      {payment.receipt_url && (
                        <Button variant="ghost" size="sm" asChild className="text-blue-400 hover:text-blue-300">
                          <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer"><FileText className="h-4 w-4" /></a>
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
        userType="coach"
        currentMembershipStatus={membership?.membership_status || 'free'}
        onSuccess={() => {
          toast({ title: 'Membresía activada', description: 'Tu membresía anual de entrenador ha sido activada.' });
          setShowMembershipModal(false);
          loadData();
        }}
      />
    </div>
  );
}
