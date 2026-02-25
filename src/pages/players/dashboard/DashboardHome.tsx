import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Users,
  Building2,
  CreditCard,
  Calendar,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import {
  fetchPlayerProfile,
  fetchPlayerTournaments,
  fetchPlayerMessages,
} from '@/store/slices/playerDashboardSlice';

export default function PlayerDashboardHome() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    profile,
    tournaments,
    messages,
    profileLoading,
    profileError,
    tournamentsLoading,
    messagesLoading,
  } = useSelector((state: RootState) => state.playerDashboard);

  useEffect(() => {
    dispatch(fetchPlayerProfile());
    dispatch(fetchPlayerTournaments());
    dispatch(fetchPlayerMessages({ limit: 10 }));
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">¡Bienvenido de vuelta!</h1>
          <p className="text-slate-400 mt-1">
            Gestiona tu cuenta, credenciales y participa en torneos
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            asChild
            variant="outline"
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            <Link to="/players/dashboard/credentials">
              <CreditCard className="h-4 w-4 mr-2" />
              Ver Credencial
            </Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/players/dashboard/tournaments">
              <Trophy className="h-4 w-4 mr-2" />
              Buscar Torneos
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Torneos Jugados</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{tournaments?.length || 0}</div>
            <p className="text-xs text-slate-400">+2 desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Clubes Afiliado</CardTitle>
            <Building2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{profile?.club_id ? 1 : 0}</div>
            <p className="text-xs text-slate-400">Clubes activos</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{messages?.length || 0}</div>
            <p className="text-xs text-slate-400">Mensajes sin leer</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Credencial</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-600 hover:bg-green-700">Activa</Badge>
            <p className="text-xs text-slate-400 mt-2">Estado de credencial</p>
          </CardContent>
        </Card>
      </div>

      {/* Tournaments & Events */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Tournaments */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Torneos Recientes
            </CardTitle>
            <CardDescription className="text-slate-400">
              Tu historial actual de torneos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tournamentsLoading && !tournaments?.length ? (
              <div className="flex justify-center items-center h-32">
                <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : tournaments && tournaments.length > 0 ? (
              tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{tournament.tournamentName}</h4>
                    <p className="text-sm text-slate-400">Categoría: {tournament.category}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(tournament.registrationDate).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <Badge
                    className={
                      tournament.status === 'completed'
                        ? 'bg-green-600 hover:bg-green-700'
                        : tournament.status === 'registered'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-slate-700'
                    }
                  >
                    {tournament.status === 'completed'
                      ? 'Completado'
                      : tournament.status === 'registered'
                        ? 'Próximo'
                        : 'Pendiente'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-4">Sin torneos registrados</p>
            )}
            <Button
              asChild
              variant="outline"
              className="w-full border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/players/dashboard/tournaments">Ver Todos</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mensajes Recientes
            </CardTitle>
            <CardDescription className="text-slate-400">
              Últimos mensajes de clubes y federación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {messagesLoading && !messages?.length ? (
              <div className="flex justify-center items-center h-32">
                <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="p-3 rounded-lg bg-slate-800/50 border-l-2 border-blue-600"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-white">{message.senderName}</h4>
                    <span className="text-xs text-slate-500">
                      {new Date(message.date).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{message.body}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-4">Sin mensajes</p>
            )}
            <Button
              asChild
              variant="outline"
              className="w-full border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/players/dashboard/messages">Ver Todos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Acciones Rápidas</CardTitle>
          <CardDescription className="text-slate-400">
            Accede rápidamente a funciones importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/players/dashboard/tournaments">
                <Trophy className="h-6 w-6" />
                <span>Buscar Torneos</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/players/dashboard/clubs">
                <Building2 className="h-6 w-6" />
                <span>Mis Clubes</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/players/dashboard/credentials">
                <CreditCard className="h-6 w-6" />
                <span>Credencial</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/players/dashboard/account">
                <Users className="h-6 w-6" />
                <span>Mi Cuenta</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
