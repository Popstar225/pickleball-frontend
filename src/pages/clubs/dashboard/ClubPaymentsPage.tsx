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
  Crown,
  Star,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MembershipSelector } from '@/components/payment/MembershipSelector';
import { PremiumPlanModal } from '@/components/payment/PremiumPlanModal';

export default function ClubPaymentsPage() {
  const { toast } = useToast();
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Mock payments data - in real app this would come from Redux/API
  const payments = [
    {
      id: 'PAY-2024-001',
      date: '2024-01-15',
      amount: 2000,
      currency: 'MXN',
      status: 'completed',
      method: 'Stripe',
      description: 'Membresía Anual - Club 2024',
      type: 'annual_membership',
    },
    {
      id: 'PAY-2024-002',
      date: '2024-02-10',
      amount: 300,
      currency: 'MXN',
      status: 'completed',
      method: 'Stripe',
      description: 'Inscripción Torneo Nacional Pickleball 2024',
      type: 'tournament_registration',
    },
  ];

  const membershipStatus = {
    status: 'active',
    expiresAt: '2025-01-15',
    plan: 'Membresía Anual',
    isPremium: false,
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
      premium_plan: 'Plan Premium',
      tournament_registration: 'Torneo',
      court_rental: 'Cancha',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pagos y Membresía</h1>
          <p className="text-slate-400 mt-1">Gestiona tu membresía, plan premium e historial de pagos</p>
        </div>
      </div>

      {/* Membership Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Annual Membership Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Membresía Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Badge className={membershipStatus.status === 'active' ? 'bg-green-600' : 'bg-red-600'}>
                  {membershipStatus.status === 'active' ? 'Activa' : 'Inactiva'}
                </Badge>
                <p className="text-2xl font-bold text-white mt-2">$2,000 MXN/año</p>
                {membershipStatus.status === 'active' && (
                  <p className="text-xs text-slate-400">
                    Vence: {new Date(membershipStatus.expiresAt).toLocaleDateString('es-MX')}
                  </p>
                )}
              </div>
              <Button
                className="w-full"
                variant={membershipStatus.status === 'active' ? 'outline' : 'default'}
                onClick={() => setShowMembershipModal(true)}
              >
                {membershipStatus.status === 'active' ? 'Renovar Membresía' : 'Activar Membresía'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Premium Plan Card */}
        <Card className={`border-2 ${membershipStatus.isPremium ? 'border-yellow-500 bg-yellow-900/20' : 'bg-slate-900 border-slate-800'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              Plan Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Badge className={membershipStatus.isPremium ? 'bg-yellow-600' : 'bg-slate-700'}>
                  {membershipStatus.isPremium ? 'Activo' : 'No activo'}
                </Badge>
                <p className="text-2xl font-bold text-white mt-2">$5,000 MXN/año</p>
                <p className="text-xs text-slate-400">Gestión de Canchas + Creación de Torneos</p>
              </div>
              <Button
                className="w-full"
                variant={membershipStatus.isPremium ? 'outline' : 'default'}
                onClick={() => setShowPremiumModal(true)}
                disabled={membershipStatus.isPremium}
              >
                {membershipStatus.isPremium ? 'Plan Activo' : 'Activar Plan Premium'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Total Pagado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              ${payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">MXN en total</p>
          </CardContent>
        </Card>
      </div>

      {/* Premium Plan Features Info */}
      {!membershipStatus.isPremium && (
        <Card className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border-yellow-700">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Crown className="h-8 w-8 text-yellow-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Desbloquea el Plan Premium
                </h3>
                <p className="text-slate-400 mb-3">
                  Obtén acceso a gestión de canchas y creación de torneos por $5,000 MXN/año
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {['Gestión de Canchas', 'Creación de Torneos'].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-white">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button onClick={() => setShowPremiumModal(true)} className="bg-yellow-600 hover:bg-yellow-700">
                  <Crown className="h-4 w-4 mr-2" />
                  Activar Plan Premium
                </Button>
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
            Todos los pagos realizados en la plataforma
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

      {/* Membership Modal */}
      <MembershipSelector
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        userType="club"
        currentMembershipStatus={membershipStatus.status}
        onSuccess={(planType) => {
          toast({ title: 'Membresía activada', description: 'Tu membresía ha sido activada exitosamente.' });
          setShowMembershipModal(false);
        }}
      />

      {/* Premium Plan Modal */}
      <PremiumPlanModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        userType="club"
        onSuccess={() => {
          toast({ title: 'Plan Premium activado', description: 'Tu Plan Premium ha sido activado exitosamente.' });
          setShowPremiumModal(false);
        }}
      />
    </div>
  );
}
