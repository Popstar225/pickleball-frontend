import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DollarSign, CreditCard, Calendar, CheckCircle, Clock, AlertCircle,
  Receipt, Crown, Star, Loader2, FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MembershipSelector } from '@/components/payment/MembershipSelector';
import PaymentService, { type Payment } from '@/services/paymentService';

function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1])).userId || null; } catch { return null; }
}

export default function ClubPaymentsPage() {
  const { toast } = useToast();

  const [membership, setMembership] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [planTarget, setPlanTarget] = useState<'annual_membership' | 'premium_plan'>('annual_membership');

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

  const isBasicActive = membership && membership.membership_status === 'active' && !membership.is_expired;
  const isPremiumActive = membership && membership.membership_status === 'premium' && !membership.is_expired;

  const openModal = (target: 'annual_membership' | 'premium_plan') => {
    setPlanTarget(target);
    setShowMembershipModal(true);
  };

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
    annual_membership: 'Membresía Anual', premium_plan: 'Plan Premium', tournament_registration: 'Torneo', court_rental: 'Renta de Cancha',
  }[type] || type);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Pagos y Planes</h1>
        <p className="text-slate-200 mt-1">Gestiona la afiliación y el Plan Premium de tu club</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
          <Button size="sm" variant="outline" onClick={loadData} className="ml-auto border-red-500/30 text-red-300">Reintentar</Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic Annual */}
        <Card className={`border-2 ${isBasicActive || isPremiumActive ? 'border-green-600 bg-green-900/20' : 'bg-slate-900 border-red-600/50'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Membresía Anual Básica
            </CardTitle>
            <CardDescription className="text-slate-200">Afiliación oficial a la Federación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge className={(isBasicActive || isPremiumActive) ? 'bg-green-600' : 'bg-red-600'}>
              {(isBasicActive || isPremiumActive) ? 'Activa' : membership?.is_expired ? 'Vencida' : 'Inactiva'}
            </Badge>
            <p className="text-2xl font-bold text-white">$2,000 MXN/año</p>
            {(isBasicActive || isPremiumActive) && membership?.membership_expires_at && (
              <p className="text-sm text-slate-200">Vence: {new Date(membership.membership_expires_at).toLocaleDateString('en-US')}</p>
            )}
            <div className="space-y-1 text-sm text-slate-300">
              <p>✓ Perfil de club activo</p>
              <p>✓ Gestión de miembros</p>
              <p>✓ Acceso a torneos</p>
            </div>
            {!isBasicActive && !isPremiumActive && (
              <Button className="w-full" onClick={() => openModal('annual_membership')}>
                <CreditCard className="h-4 w-4 mr-2" />Activar Membresía Anual
              </Button>
            )}
            {(isBasicActive || isPremiumActive) && (
              <Button className="w-full" variant="outline" onClick={() => openModal('annual_membership')}>
                Renovar Membresía
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className={`border-2 ${isPremiumActive ? 'border-yellow-500 bg-yellow-900/20' : 'bg-slate-900 border-slate-700'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Plan Premium
              {isPremiumActive && <Badge className="bg-yellow-600 ml-auto">Activo</Badge>}
            </CardTitle>
            <CardDescription className="text-slate-200">Canchas, torneos e ingresos por rentas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-bold text-white">$5,000 MXN/año</p>
            <div className="space-y-1 text-sm text-slate-300">
              <p>✓ Todo lo del plan básico +</p>
              <p>✓ Gestión de Canchas</p>
              <p>✓ Creación de Torneos</p>
              <p>✓ Ingresos por rentas de canchas</p>
              <p>✓ Análisis avanzado</p>
              <p>✓ Soporte prioritario</p>
            </div>
            <Button
              className="w-full"
              variant={isPremiumActive ? 'outline' : 'default'}
              onClick={() => openModal('premium_plan')}
              disabled={!isBasicActive && !isPremiumActive}
            >
              <Crown className="h-4 w-4 mr-2" />
              {isPremiumActive ? 'Renovar Plan Premium' : 'Activar Plan Premium'}
            </Button>
            {!isBasicActive && !isPremiumActive && (
              <p className="text-xs text-slate-300 text-center">Activa primero la membresía anual</p>
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
            <p className="text-xs text-slate-200">MXN total</p>
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
            <p className="text-xs text-slate-200">Plan activo</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><Receipt className="h-5 w-5" />Historial de Pagos</CardTitle>
          <CardDescription className="text-slate-200">Todos los pagos del club</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-10 text-slate-300">No hay pagos registrados</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-200">Fecha</TableHead>
                  <TableHead className="text-slate-200">Descripción</TableHead>
                  <TableHead className="text-slate-200">Tipo</TableHead>
                  <TableHead className="text-slate-200">Monto</TableHead>
                  <TableHead className="text-slate-200">Estado</TableHead>
                  <TableHead className="text-slate-200">Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="border-slate-800">
                    <TableCell className="text-white">{new Date(payment.created_at).toLocaleDateString('en-US')}</TableCell>
                    <TableCell className="text-white font-medium">{payment.description || getTypeLabel(payment.payment_type)}</TableCell>
                    <TableCell className="text-slate-200">{getTypeLabel(payment.payment_type)}</TableCell>
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
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        userType="club"
        currentMembershipStatus={membership?.membership_status || 'free'}
        onSuccess={(planType) => {
          toast({ title: planType === 'premium_plan' ? 'Plan Premium activado' : 'Membresía activada', description: 'Tu plan ha sido activado exitosamente.' });
          setShowMembershipModal(false);
          loadData();
        }}
      />
    </div>
  );
}
