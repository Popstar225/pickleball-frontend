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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PartnerPaymentsPage() {
  const { toast } = useToast();

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
      description: 'Renovación Partnership Gold - 2024',
      amount: 25000,
      currency: 'MXN',
      status: 'completed',
      date: '2024-01-01T09:00:00',
      method: 'Stripe',
      transactionId: 'txn_0987654321',
      type: 'membership',
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
    {
      id: 4,
      description: 'Patrocinio - Equipamiento para Clubes',
      amount: 25000,
      currency: 'MXN',
      status: 'processing',
      date: '2024-01-20T14:30:00',
      method: 'Stripe',
      transactionId: 'txn_processing_123',
      type: 'sponsorship',
      invoiceUrl: null,
    },
  ];

  const paymentStats = {
    totalPaid: 75000,
    pendingPayments: 100000,
    thisYear: 150000,
    nextRenewal: '2024-06-15',
  };

  const handleProcessPayment = (paymentId: number) => {
    // In real app, this would redirect to Stripe checkout
    toast({
      title: 'Procesando pago',
      description: 'Redirigiendo a Stripe para completar el pago...',
    });
  };

  const handleDownloadInvoice = (paymentId: number) => {
    // In real app, this would download the invoice
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
      case 'sponsorship':
        return 'Patrocinio';
      case 'membership':
        return 'Membresía';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pagos y Facturación</h1>
          <p className="text-slate-400 mt-1">Gestiona tus pagos, patrocinios y renovaciones</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <CreditCard className="h-4 w-4 mr-2" />
          Nuevo Pago
        </Button>
      </div>

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
            <p className="text-xs text-slate-400">Partnership Gold</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments Alert */}
      <Card className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-600/20">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white">Pagos Próximos</h3>
              <p className="text-slate-400 mb-3">Tienes pagos pendientes que requieren atención</p>
              <div className="space-y-2">
                {payments
                  .filter((p) => p.status === 'pending')
                  .map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">{payment.description}</p>
                        <p className="text-sm text-slate-400">
                          Vence: {new Date(payment.date).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold">
                          ${payment.amount.toLocaleString()} {payment.currency}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleProcessPayment(payment.id)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Pagar Ahora
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <TableHead className="text-slate-400">Método</TableHead>
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
                  <TableCell className="text-white">{payment.method}</TableCell>
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

      {/* Payment Methods */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Métodos de Pago
          </CardTitle>
          <CardDescription className="text-slate-400">
            Gestiona tus métodos de pago guardados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-white font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-slate-400">Visa • Expira 12/26</p>
                </div>
              </div>
              <Badge className="bg-green-600 hover:bg-green-700">Predeterminado</Badge>
            </div>
            <Button
              variant="outline"
              className="w-full border-slate-700 text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Método de Pago
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
