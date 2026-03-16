import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DollarSign, CreditCard, Calendar, CheckCircle, Clock, AlertCircle,
  Receipt, Crown, Loader2, FileText, Info,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MembershipSelector } from '@/components/payment/MembershipSelector';
import PaymentService, { type Payment } from '@/services/paymentService';

function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1])).userId || null; } catch { return null; }
}

export default function PartnerPaymentsPage() {
  const { toast } = useToast();

  const [membership, setMembership] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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

  const isPremiumActive = membership && membership.membership_status === 'premium' && !membership.is_expired;

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
    premium_plan: 'Plan Premium', court_rental: 'Renta de Cancha', tournament_registration: 'Torneo',
  }[type] || type);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Pagos y Plan Premium</h1>
        <p className="text-slate-400 mt-1">Gestiona tu Plan Premium como socio de la Federación</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
          <Button size="sm" variant="outline" onClick={loadData} className="ml-auto border-red-500/30 text-red-300">Reintentar</Button>
        </div>
      )}

      {/* Free Registration Info */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-300">
          <strong>Registro gratuito:</strong> Como socio, tu afiliación a la Federación es completamente gratuita.
          El Plan Premium te da acceso a gestión de canchas y creación de torneos para generar ingresos.
        </p>
      </div>

      {/* Premium Plan Card */}
      <Card className={`border-2 ${isPremiumActive ? 'border-yellow-500 bg-yellow-900/20' : 'bg-slate-900 border-slate-700'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Plan Premium
            {isPremiumActive && <Badge className="bg-yellow-600 ml-2">Activo</Badge>}
          </CardTitle>
          <CardDescription className="text-slate-400">
            Único pago requerido — gestión de canchas y creación de torneos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 space-y-4">
              <p className="text-3xl font-bold text-white">$8,000 MXN<span className="text-lg text-slate-400 font-normal">/año</span></p>
              {isPremiumActive && membership?.membership_expires_at && (
                <p className="text-sm text-slate-400">Vence: {new Date(membership.membership_expires_at).toLocaleDateString('es-MX')}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {[
                  'Gestión de Canchas (Court Management)',
                  'Creación y gestión de Torneos',
                  'Ingresos por rentas de canchas',
                  'Visibilidad premium en la plataforma',
                  'Herramientas de patrocinio',
                  'Panel de análisis avanzado',
                  'Soporte prioritario',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-48">
              <Button className="w-full" variant={isPremiumActive ? 'outline' : 'default'} onClick={() => setShowPremiumModal(true)}>
                <Crown className="h-4 w-4 mr-2" />
                {isPremiumActive ? 'Renovar Premium' : 'Activar Plan Premium'}
              </Button>
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
            <p className="text-xs text-slate-400">MXN total</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pagos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingPayments}</div>
            <p className="text-xs text-slate-400">Por procesar</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Renovación Premium</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.nextRenewal ? new Date(stats.nextRenewal).toLocaleDateString('es-MX') : '—'}
            </div>
            <p className="text-xs text-slate-400">Plan premium</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><Receipt className="h-5 w-5" />Historial de Pagos</CardTitle>
          <CardDescription className="text-slate-400">Todos tus pagos en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No hay pagos registrados</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Fecha</TableHead>
                  <TableHead className="text-slate-400">Descripción</TableHead>
                  <TableHead className="text-slate-400">Tipo</TableHead>
                  <TableHead className="text-slate-400">Monto</TableHead>
                  <TableHead className="text-slate-400">Estado</TableHead>
                  <TableHead className="text-slate-400">Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="border-slate-800">
                    <TableCell className="text-white">{new Date(payment.created_at).toLocaleDateString('es-MX')}</TableCell>
                    <TableCell className="text-white font-medium">{payment.description || getTypeLabel(payment.payment_type)}</TableCell>
                    <TableCell className="text-slate-400">{getTypeLabel(payment.payment_type)}</TableCell>
                    <TableCell className="text-white font-medium">${Number(payment.amount).toLocaleString()} {payment.currency?.toUpperCase() || 'MXN'}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.receipt_url && (
                        <Button variant="ghost" size="sm" asChild className="text-blue-400">
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
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        userType="partner"
        currentMembershipStatus={membership?.membership_status || 'free'}
        onSuccess={() => {
          toast({ title: 'Plan Premium activado', description: 'Tu Plan Premium ha sido activado exitosamente.' });
          setShowPremiumModal(false);
          loadData();
        }}
      />
    </div>
  );
}
