import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  DollarSign,
  MessageSquare,
  UserPlus,
  Loader,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import {
  fetchClubProfile,
  fetchClubMembers,
  fetchClubEvents,
} from '@/store/slices/clubDashboardSlice';

export default function ClubDashboardHome() {
  const { clubId } = useParams<{ clubId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, members, events, profileLoading, profileError, membersLoading, eventsLoading } =
    useSelector((state: RootState) => state.clubDashboard);

  useEffect(() => {
    if (!clubId) return;
    dispatch(fetchClubProfile());
    dispatch(fetchClubMembers({ clubId, limit: 10 }));
    dispatch(fetchClubEvents());
  }, [dispatch, clubId]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">¡Bienvenido al Panel de Club!</h1>
          <p className="text-slate-400 mt-1">Gestiona tu club, miembros y organiza torneos</p>
        </div>
        <div className="flex gap-3">
          <Button
            asChild
            variant="outline"
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            <Link to="/clubs/dashboard/members">
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Miembro
            </Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/clubs/dashboard/tournaments">
              <Trophy className="h-4 w-4 mr-2" />
              Crear Torneo
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Miembros Totales</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{profile?.memberCount || 0}</div>
            <p className="text-xs text-slate-400">{profile?.membershipStatus || 0} activos</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Torneos Organizados
            </CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{profile?.memberCount || 0}</div>
            <p className="text-xs text-slate-400">Este año</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${(members?.length || 0) * 100}</div>
            <p className="text-xs text-slate-400">MXN</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{events?.length || 0}</div>
            <p className="text-xs text-slate-400">Pagos pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Members */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Miembros Recientes
            </CardTitle>
            <CardDescription className="text-slate-400">
              Nuevos miembros y solicitudes pendientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {membersLoading && !members?.length ? (
              <div className="flex justify-center items-center h-32">
                <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : members && members.length > 0 ? (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white">
                      {member.firstName} {member.lastName}
                    </h4>
                    <p className="text-sm text-slate-400">
                      Miembro desde{' '}
                      {member.joinDate
                        ? new Date(member.joinDate).toLocaleDateString('es-MX')
                        : '-'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {member.membershipStatus || 'Estándar'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={member.membershipStatus === 'active' ? 'default' : 'secondary'}
                      className={
                        member.membershipStatus === 'active'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-yellow-600 hover:bg-yellow-700'
                      }
                    >
                      {member.membershipStatus === 'active' ? 'Activo' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-4">Sin miembros registrados</p>
            )}
            <Button
              asChild
              variant="outline"
              className="w-full border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/clubs/dashboard/members">Ver Todos los Miembros</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Tournaments */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Próximos Torneos
            </CardTitle>
            <CardDescription className="text-slate-400">
              Torneos organizados por el club
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {eventsLoading && !events?.length ? (
              <div className="flex justify-center items-center h-32">
                <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : events && events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{event.title}</h4>
                    <p className="text-sm text-slate-400">
                      {event.date ? new Date(event.date).toLocaleDateString('es-MX') : '-'} •{' '}
                      {event.type || 'Evento'}
                    </p>
                  </div>
                  <Badge
                    variant={event.status === 'registered' ? 'default' : 'secondary'}
                    className={
                      event.status === 'registered'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-slate-700 hover:bg-slate-800'
                    }
                  >
                    {event.status === 'registered' ? 'Registrado' : 'Preparando'}
                  </Badge>
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
              <Link to="/clubs/dashboard/tournaments">Gestionar Torneos</Link>
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
              <Link to="/clubs/dashboard/members">
                <Users className="h-6 w-6" />
                <span>Gestionar Miembros</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/clubs/dashboard/tournaments">
                <Trophy className="h-6 w-6" />
                <span>Crear Torneo</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/clubs/dashboard/messages">
                <MessageSquare className="h-6 w-6" />
                <span>Ver Mensajes</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/clubs/dashboard/payments">
                <DollarSign className="h-6 w-6" />
                <span>Ver Pagos</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
