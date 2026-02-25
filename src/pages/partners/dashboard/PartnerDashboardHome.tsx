import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  FileText,
  Handshake,
  Loader,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import {
  fetchPartnerProfile,
  fetchPartnerSponsorships,
  fetchPartnerMessages,
} from '@/store/slices/partnerDashboardSlice';

export default function PartnerDashboardHome() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    profile,
    sponsorships,
    messages,
    profileLoading,
    profileError,
    sponsorshipsLoading,
    messagesLoading,
  } = useSelector((state: RootState) => state.partnerDashboard);

  useEffect(() => {
    dispatch(fetchPartnerProfile());
    dispatch(fetchPartnerSponsorships());
    dispatch(fetchPartnerMessages({ limit: 10 }));
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">¡Bienvenido al Panel de Partner!</h1>
          <p className="text-slate-400 mt-1">
            Gestiona tus patrocinios y colaboraciones con la federación
          </p>
        </div>
        <div>
          <Button
            asChild
            variant="outline"
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            <Link to="/partners/dashboard/messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Ver Mensajes ({messages?.length || 0})
            </Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/partners/dashboard/account">
              <Handshake className="h-4 w-4 mr-2" />
              Gestionar Patrocinios
            </Link>
          </Button>
        </div>
      </div>

      {/* Partnership Status */}
      <Card className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-600/20">
                <Handshake className="h-8 w-8 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Nivel de Partnership: {profile?.sponsorshipLevel || 'Sin nivel'}
                </h3>
                <p className="text-slate-400">
                  Próxima renovación:{' '}
                  {profile?.sponsorshipEndDate
                    ? new Date(profile.sponsorshipEndDate).toLocaleDateString('es-MX')
                    : 'N/A'}
                </p>
              </div>
            </div>
            <Badge className="bg-yellow-600 hover:bg-yellow-700 text-lg px-4 py-2">
              {profile?.sponsorshipLevel || 'Estándar'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Patrocinios Activos
            </CardTitle>
            <Handshake className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {sponsorships?.filter((s) => s.status === 'active').length || 0}
            </div>
            <p className="text-xs text-slate-400">En curso</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Inversión Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${(sponsorships?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-400">MXN este año</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Patrocinios</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{sponsorships?.length || 0}</div>
            <p className="text-xs text-slate-400">Total</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{messages?.length || 0}</div>
            <p className="text-xs text-slate-400">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Sponsorships */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Handshake className="h-5 w-5" />
              Patrocinios Activos
            </CardTitle>
            <CardDescription className="text-slate-400">
              Tus colaboraciones actuales con la federación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sponsorshipsLoading && !sponsorships?.length ? (
              <div className="flex justify-center items-center h-32">
                <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : sponsorships && sponsorships.length > 0 ? (
              sponsorships.map((sponsorship) => (
                <div
                  key={sponsorship.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Nivel: {sponsorship.level}</h4>
                    <p className="text-sm text-slate-400">
                      {new Date(sponsorship.startDate).toLocaleDateString('es-MX')} -{' '}
                      {new Date(sponsorship.endDate).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-white">
                        ${sponsorship.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">MXN</p>
                    </div>
                    <Badge
                      variant={sponsorship.status === 'active' ? 'default' : 'secondary'}
                      className={
                        sponsorship.status === 'active'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-yellow-600 hover:bg-yellow-700'
                      }
                    >
                      {sponsorship.status === 'active' ? 'Activo' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-4">Sin patrocinios registrados</p>
            )}
            <Button
              asChild
              variant="outline"
              className="w-full border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/partners/dashboard/account">Gestionar Patrocinios</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Sponsorships */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Eventos Próximos
            </CardTitle>
            <CardDescription className="text-slate-400">
              Eventos donde eres patrocinador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sponsorshipsLoading && !sponsorships?.length ? (
              <div className="flex justify-center items-center h-32">
                <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : sponsorships &&
              sponsorships.filter((s) => new Date(s.endDate) > new Date()).length > 0 ? (
              sponsorships
                .filter((s) => new Date(s.endDate) > new Date())
                .map((sponsorship) => (
                  <div
                    key={sponsorship.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{sponsorship.level} Sponsorship</h4>
                      <p className="text-sm text-slate-400">
                        {new Date(sponsorship.endDate).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <Badge className="bg-blue-600 hover:bg-blue-700">{sponsorship.level}</Badge>
                  </div>
                ))
            ) : (
              <p className="text-slate-400 text-center py-4">Sin eventos próximos</p>
            )}
            <Button
              asChild
              variant="outline"
              className="w-full border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/partners/dashboard/account">Ver Todos los Eventos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Acciones Rápidas</CardTitle>
          <CardDescription className="text-slate-400">
            Accede rápidamente a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/partners/dashboard/account">
                <Handshake className="h-6 w-6" />
                <span>Nuevo Patrocinio</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/partners/dashboard/messages">
                <MessageSquare className="h-6 w-6" />
                <span>Contactar Federación</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/partners/dashboard/payments">
                <DollarSign className="h-6 w-6" />
                <span>Ver Pagos</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/partners/dashboard/account">
                <FileText className="h-6 w-6" />
                <span>Reportes</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
