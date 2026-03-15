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
  Star,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MembershipSelector } from '@/components/payment/MembershipSelector';

export default function StatePaymentsPage() {
  const { toast } = useToast();
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const payments = [
    {
      id: 'PAY-2024-001',
      date: '2024-01-01',
      amount: 15000,
      currency: 'MXN',
      status: 'completed',
      method: 'Stripe',
      description: 'Membresía Anual - Federación Estatal 2024',
      type: 'annual_membership',
      invoiceUrl: '#',
    },
    {
      id: 'PAY-2024-002',
      date: '2024-03-10',
      amount: 2500,
      currency: 'MXN',
      status: 'completed',
      method: 'Stripe',
      description: 'Organización Torneo Estatal Primavera 2024',
      type: 'tournament_registration',
      invoiceUrl: '#',
    },
  ];

  const membershipStatus = {
    status: 'active',
    expiresAt: '2025-01-01',
    annualFee: 15000,
  };

  const stats = {
    totalPaid: payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0),
    pendingPayments: payments.filter(p => p.status === 'pending').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Fallido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      annual_membership: 'Membresía Anual',
      tournament_registration: 'Torneo',
      premium_plan: 'Plan Premium',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pagos y Membresía</h1>
          <p className="text-slate-400 mt-1">Gestiona la membresía anual de la federación estatal</p>
        </div>
      </div>

      {/* Annual Membership Card */}
      <Card className={`border-2 ${membershipStatus.status === 'active' ? 'border-green-600 bg-green-900/20' : 'bg-slate-900 border-slate-800'}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Membresía Anual Estatal
          </CardTitle>
          <CardDescription className="text-slate-400">
            Cuota anual para federaciones estatales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge className={membershipStatus.status === 'active' ? 'bg-green-600' : 'bg-red-600'}>
                {membershipStatus.status === 'active' ? 'Activa' : 'Inactiva'}
              </Badge>
              <p className="text-3xl font-bold text-white mt-2">${membershipStatus.annualFee.toLocaleString()} MXN/año</p>
              {membershipStatus.status === 'active' && (
                <p className="text-sm text-slate-400 mt-1">
                  Vigente hasta: {new Date(membershipStatus.expiresAt).toLocaleDateString('es-MX')}
                </p>
              )}
              <div className="mt-3 space-y-1">
                {['Perfil estatal activo', 'Gestión de torneos estatales', 'Validación de resultados', 'Gestión de clubes y jugadores del estado'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setShowMembershipModal(true)}
              variant={membershipStatus.status === 'active' ? 'outline' : 'default'}
              className="ml-4"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {membershipStatus.status === 'active' ? 'Renovar Membresía' : 'Activar Membresía'}
            </Button>
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
              {new Date(membershipStatus.expiresAt).toLocaleDateString('es-MX')}
            </div>
            <p className="text-xs text-slate-400">Membresía anual</p>
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
            Todos los pagos realizados por la federación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Fecha</TableHead>
                <TableHead className="text-slate-400">Descripción</TableHead>
                <TableHead className="text-slate-400">Tipo</TableHead>
                <TableHead className="text-slate-400">Monto</TableHead>
                <TableHead className="text-slate-400">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="text-white">
                    {new Date(payment.date).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell className="text-white">{payment.description}</TableCell>
                  <TableCell className="text-slate-400">{getTypeLabel(payment.type)}</TableCell>
                  <TableCell className="text-white font-medium">
                    ${payment.amount.toLocaleString()} {payment.currency}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
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
        userType="state"
        currentMembershipStatus={membershipStatus.status}
        onSuccess={() => {
          toast({ title: 'Membresía activada', description: 'La membresía anual estatal ha sido activada.' });
          setShowMembershipModal(false);
        }}
      />
    </div>
  );
}
