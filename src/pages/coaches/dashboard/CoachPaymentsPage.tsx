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
import { FileText } from 'lucide-react';
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
  Users,
  Award,
  Plus,
  Star,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MembershipSelector } from '@/components/payment/MembershipSelector';

export default function CoachPaymentsPage() {
  const { toast } = useToast();
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  // Mock payments data - in real app this would come from Redux/API
  const payments = [
    {
      id: 1,
      description: 'Membresía Anual - Entrenador 2024',
      amount: 800,
      currency: 'MXN',
      status: 'completed',
      date: '2024-01-01T09:00:00',
      method: 'Stripe',
      transactionId: 'txn_annual_2024',
      type: 'annual_membership',
      invoiceUrl: '#',
    },
    {
      id: 2,
      description: 'Licencia Profesional Entrenador - 2024',
      amount: 1500,
      currency: 'MXN',
      status: 'completed',
      date: '2024-01-15T10:30:00',
      method: 'Stripe',
      transactionId: 'txn_1234567890',
      type: 'coach_license',
      invoiceUrl: '#',
    },
    {
      id: 3,
      description: 'Licencia Nivel Avanzado',
      amount: 2500,
      currency: 'MXN',
      status: 'pending',
      date: '2024-02-01T00:00:00',
      method: 'Stripe',
      transactionId: null,
      type: 'coach_license',
      invoiceUrl: null,
    },
  ];

  const membershipStatus = {
    status: 'active',
    expiresAt: '2025-01-01',
    annualFee: 800,
  };

  const paymentStats = {
    totalPaid: payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0),
    pendingPayments: payments.filter(p => p.status === 'pending').length,
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
    const labels: Record<string, string> = {
      annual_membership: 'Membresía Anual',
      coach_license: 'Licencia',
      certification: 'Certificación',
      coaching: 'Entrenamiento',
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'annual_membership':
        return <Star className="h-4 w-4 text-primary" />;
      case 'coach_license':
        return <Award className="h-4 w-4 text-yellow-500" />;
      case 'certification':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pagos y Facturación</h1>
          <p className="text-slate-400 mt-1">
            Gestiona tu membresía anual y licencias de entrenador
          </p>
        </div>
      </div>

      {/* Membership & License Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Annual Membership */}
        <Card className={`border-2 ${membershipStatus.status === 'active' ? 'border-green-600 bg-green-900/20' : 'bg-slate-900 border-slate-800'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Membresía Anual
            </CardTitle>
            <CardDescription className="text-slate-400">
              Cuota anual obligatoria para entrenadores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Badge className={membershipStatus.status === 'active' ? 'bg-green-600' : 'bg-red-600'}>
                  {membershipStatus.status === 'active' ? 'Activa' : 'Inactiva'}
                </Badge>
                <p className="text-2xl font-bold text-white mt-2">${membershipStatus.annualFee.toLocaleString()} MXN/año</p>
                {membershipStatus.status === 'active' && (
                  <p className="text-sm text-slate-400 mt-1">
                    Vence: {new Date(membershipStatus.expiresAt).toLocaleDateString('es-MX')}
                  </p>
                )}
              </div>
              <Button
                className="w-full"
                variant={membershipStatus.status === 'active' ? 'outline' : 'default'}
                onClick={() => setShowMembershipModal(true)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {membershipStatus.status === 'active' ? 'Renovar Membresía' : 'Activar Membresía'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Coach License */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Licencias de Entrenador
            </CardTitle>
            <CardDescription className="text-slate-400">
              Adquiere licencias profesionales a través de la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-300 text-sm">Licencia Básica</span>
                  <span className="text-white font-medium">$800 MXN</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-300 text-sm">Licencia Profesional</span>
                  <span className="text-white font-medium">$1,500 MXN</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-300 text-sm">Licencia Avanzada</span>
                  <span className="text-white font-medium">$2,500 MXN</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  toast({
                    title: 'Compra de Licencia',
                    description: 'Próximamente: selección y pago de licencias en la plataforma.',
                  });
                }}
              >
                <Award className="h-4 w-4 mr-2" />
                Comprar Licencia
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Pagado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${paymentStats.totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">MXN este año</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pagos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{paymentStats.pendingPayments}</div>
            <p className="text-xs text-slate-400">Por procesar</p>
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
            <p className="text-xs text-slate-400">Membresía anual</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments Alert */}
      {payments.some(p => p.status === 'pending') && (
        <Card className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-600/20">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">Pagos Pendientes</h3>
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
      )}

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
                    <div className="flex items-center gap-2">
                      {getTypeIcon(payment.type)}
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        {payment.transactionId && (
                          <p className="text-xs text-slate-400">ID: {payment.transactionId}</p>
                        )}
                      </div>
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

      {/* Membership Selector Modal */}
      <MembershipSelector
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        userType="coach"
        currentMembershipStatus={membershipStatus.status}
        onSuccess={() => {
          toast({ title: 'Membresía activada', description: 'Tu membresía anual de entrenador ha sido activada.' });
          setShowMembershipModal(false);
        }}
      />
    </div>
  );
}
