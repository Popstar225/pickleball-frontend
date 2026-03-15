import { useState } from 'react';
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
  DollarSign,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Receipt,
  TrendingUp,
  Wallet,
  Plus,
  Crown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PremiumPlanModal } from '@/components/payment/PremiumPlanModal';

export default function PartnerPaymentsPage() {
  const { toast } = useToast();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Mock payments data - in real app this would come from Redux/API
  const payments = [
    {
      id: 1,
      description: 'Patrocinio - Torneo Nacional Pickleball 2024',
      amount: 50000,
      currency: 'MXN',
      status: 'completed',
      date: '2024-01-15T10:30:00',
      method: 'Stripe',
      transactionId: 'txn_1234567890',
      type: 'sponsorship',
      invoiceUrl: '#',
    },
    {
      id: 2,
      description: 'Plan Premium - Socio 2024',
      amount: 8000,
      currency: 'MXN',
      status: 'completed',
      date: '2024-01-01T09:00:00',
      method: 'Stripe',
      transactionId: 'txn_0987654321',
      type: 'premium_plan',
      invoiceUrl: '#',
    },
    {
      id: 3,
      description: 'Patrocinio - Programa Desarrollo Juvenil',
      amount: 75000,
      currency: 'MXN',
      status: 'pending',
      date: '2024-02-01T00:00:00',
      method: 'Stripe',
      transactionId: null,
      type: 'sponsorship',
      invoiceUrl: null,
    },
  ];

  const isPremiumActive = true; // Replace with actual state from API

  const paymentStats = {
    totalPaid: 58000,
    pendingPayments: 75000,
    thisYear: 133000,
    nextRenewal: '2025-01-01',
  };

  const handleProcessPayment = (paymentId: number) => {
    toast({
      title: 'Procesando pago',
      description: 'Redirigiendo a Stripe para completar el pago...',
    });
  };

  const handleDownloadInvoice = (paymentId: number) => {
    toast({
      title: 'Descargando factura',
      description: 'La factura se está descargando...',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completado
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Procesando
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Fallido
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sponsorship': return 'Patrocinio';
      case 'premium_plan': return 'Plan Premium';
      case 'membership': return 'Membresía';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pagos y Facturación</h1>
          <p className="text-slate-400 mt-1">Gestiona tus pagos, patrocinios y Plan Premium</p>
        </div>
      </div>

      {/* Partner Free Registration Notice */}
      <Card className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-blue-700">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-white text-sm">
              <strong>Registro gratuito:</strong> Tu registro como socio/partner es completamente gratuito.
              No hay cuota de membresía anual para socios.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Premium Plan Card */}
      <Card className={`border-2 ${isPremiumActive ? 'border-yellow-500 bg-yellow-900/20' : 'bg-slate-900 border-slate-800'}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Plan Premium
          </CardTitle>
          <CardDescription className="text-slate-400">
            Desbloquea gestión de canchas y creación de torneos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge className={isPremiumActive ? 'bg-yellow-600' : 'bg-slate-700'}>
                {isPremiumActive ? 'Plan Activo' : 'No activo'}
              </Badge>
              <p className="text-2xl font-bold text-white mt-2">$8,000 MXN/año</p>
              <div className="flex gap-4 mt-2">
                <span className="text-sm text-slate-400">✓ Gestión de Canchas</span>
                <span className="text-sm text-slate-400">✓ Creación de Torneos</span>
              </div>
            </div>
            <Button
              onClick={() => setShowPremiumModal(true)}
              disabled={isPremiumActive}
              className={isPremiumActive ? 'bg-yellow-700' : 'bg-yellow-600 hover:bg-yellow-700'}
            >
              <Crown className="h-4 w-4 mr-2" />
              {isPremiumActive ? 'Plan Activo' : 'Activar Plan Premium'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Pagado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${paymentStats.totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">MXN este mes</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pagos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${paymentStats.pendingPayments.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">MXN por procesar</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Inversión Anual</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${paymentStats.thisYear.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">MXN en 2024</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Próxima Renovación</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {new Date(paymentStats.nextRenewal).toLocaleDateString('es-MX')}
            </div>
            <p className="text-xs text-slate-400">Plan Premium</p>
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
          <CardDescription className="text-slate-400">
            Todos tus pagos y transacciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400">Descripción</TableHead>
                <TableHead className="text-slate-400">Tipo</TableHead>
                <TableHead className="text-slate-400">Monto</TableHead>
                <TableHead className="text-slate-400">Estado</TableHead>
                <TableHead className="text-slate-400">Fecha</TableHead>
                <TableHead className="text-slate-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="border-slate-700">
                  <TableCell className="text-white">
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      {payment.transactionId && (
                        <p className="text-xs text-slate-400">ID: {payment.transactionId}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{getTypeLabel(payment.type)}</TableCell>
                  <TableCell className="text-white font-medium">
                    ${payment.amount.toLocaleString()} {payment.currency}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-white">
                    {new Date(payment.date).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {payment.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleProcessPayment(payment.id)}
                          className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      )}
                      {payment.status === 'completed' && payment.invoiceUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(payment.id)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Premium Plan Modal */}
      <PremiumPlanModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        userType="partner"
        onSuccess={() => {
          toast({
            title: 'Plan Premium activado',
            description: 'Tu Plan Premium ha sido activado exitosamente.',
          });
          setShowPremiumModal(false);
        }}
      />
    </div>
  );
}
