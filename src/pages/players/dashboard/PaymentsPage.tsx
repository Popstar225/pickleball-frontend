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
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  FileText,
} from 'lucide-react';

export default function PlayerPaymentsPage() {
  // Mock data - in real app this would come from Redux/API
  const payments = [
    {
      id: 'PAY-2024-001',
      date: '2024-01-15',
      amount: 500.0,
      currency: 'MXN',
      status: 'completed',
      method: 'Stripe',
      description: 'Renovación Credencial Digital 2024',
      reference: 'DC-2024-001',
      invoiceUrl: '#',
      receiptUrl: '#',
    },
    {
      id: 'PAY-2024-002',
      date: '2024-02-10',
      amount: 300.0,
      currency: 'MXN',
      status: 'completed',
      method: 'Stripe',
      description: 'Inscripción Torneo Nacional Pickleball 2024',
      reference: 'TN-2024-001',
      invoiceUrl: '#',
      receiptUrl: '#',
    },
    {
      id: 'PAY-2023-015',
      date: '2023-12-20',
      amount: 200.0,
      currency: 'MXN',
      status: 'completed',
      method: 'Stripe',
      description: 'Inscripción Copa Estatal CDMX 2023',
      reference: 'CE-2023-045',
      invoiceUrl: '#',
      receiptUrl: '#',
    },
    {
      id: 'PAY-2023-014',
      date: '2023-01-10',
      amount: 450.0,
      currency: 'MXN',
      status: 'completed',
      method: 'Stripe',
      description: 'Renovación Credencial Digital 2023',
      reference: 'DC-2023-001',
      invoiceUrl: '#',
      receiptUrl: '#',
    },
    {
      id: 'PAY-2024-003',
      date: '2024-03-05',
      amount: 150.0,
      currency: 'MXN',
      status: 'pending',
      method: 'Stripe',
      description: 'Inscripción Torneo Interclubes Primavera 2024',
      reference: 'TI-2024-012',
      invoiceUrl: '#',
      receiptUrl: null,
    },
    {
      id: 'PAY-2024-004',
      date: '2024-02-28',
      amount: 75.0,
      currency: 'MXN',
      status: 'failed',
      method: 'Stripe',
      description: 'Compra de Artículos en Tienda',
      reference: 'SHOP-2024-089',
      invoiceUrl: '#',
      receiptUrl: null,
    },
  ];

  const stats = {
    totalPaid: payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: payments.filter((p) => p.status === 'pending').length,
    thisYearPaid: payments
      .filter((p) => p.status === 'completed' && new Date(p.date).getFullYear() === 2024)
      .reduce((sum, p) => sum + p.amount, 0),
    lastPayment: payments
      .filter((p) => p.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0],
  };

  const handleDownloadInvoice = (paymentId: string) => {
    // Here you would download the invoice PDF
    alert(`Descargando factura ${paymentId}`);
  };

  const handleDownloadReceipt = (paymentId: string) => {
    // Here you would download the receipt PDF
    alert(`Descargando recibo ${paymentId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600 hover:bg-green-700">Completado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Pendiente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fallido</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-600 hover:bg-blue-700">Reembolsado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pagos</h1>
          <p className="text-slate-400 mt-1">Historial de pagos y facturas</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <CreditCard className="h-4 w-4 mr-2" />
          Nuevo Pago
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium text-slate-400">Pagado en 2024</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${stats.thisYearPaid.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">Este año</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Último Pago</CardTitle>
            <Receipt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${stats.lastPayment?.amount.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-slate-400">
              {stats.lastPayment
                ? new Date(stats.lastPayment.date).toLocaleDateString('es-MX')
                : 'Sin pagos'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Historial de Pagos
          </CardTitle>
          <CardDescription className="text-slate-400">
            Todos tus pagos realizados en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Fecha</TableHead>
                <TableHead className="text-slate-400">Descripción</TableHead>
                <TableHead className="text-slate-400">Monto</TableHead>
                <TableHead className="text-slate-400">Estado</TableHead>
                <TableHead className="text-slate-400">Método</TableHead>
                <TableHead className="text-slate-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="text-white">
                    {new Date(payment.date).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-white font-medium">{payment.description}</p>
                      <p className="text-sm text-slate-400">Ref: {payment.reference}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    ${payment.amount.toLocaleString()} {payment.currency}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      {getStatusBadge(payment.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400">{payment.method}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownloadInvoice(payment.id)}
                        variant="outline"
                        size="sm"
                        className="border-slate-700 text-white hover:bg-slate-800"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Factura
                      </Button>
                      {payment.receiptUrl && (
                        <Button
                          onClick={() => handleDownloadReceipt(payment.id)}
                          variant="outline"
                          size="sm"
                          className="border-slate-700 text-white hover:bg-slate-800"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Recibo
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
            <CreditCard className="h-5 w-5" />
            Métodos de Pago
          </CardTitle>
          <CardDescription className="text-slate-400">
            Gestiona tus métodos de pago guardados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-600/20">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-white font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-slate-400">Visa • Expira 12/26</p>
                </div>
              </div>
              <Badge className="bg-green-600 hover:bg-green-700">Predeterminado</Badge>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
                <CreditCard className="h-4 w-4 mr-2" />
                Agregar Tarjeta
              </Button>
              <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
                Gestionar Métodos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Payments */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Próximos Pagos</CardTitle>
          <CardDescription className="text-slate-400">
            Pagos programados y renovaciones pendientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Renovación Credencial Digital</h4>
                  <p className="text-sm text-slate-400">Vence el 31 de diciembre de 2024</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">$500 MXN</p>
                <Button size="sm" className="bg-primary hover:bg-primary/90 mt-1">
                  Pagar Ahora
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
