import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Building,
  Trophy,
  Calendar,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  FileText,
  MapPin,
  BarChart3,
  BookOpen,
  Loader,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import {
  fetchStateStatistics,
  fetchStateActivities,
  fetchUpcomingEvents,
} from '@/store/slices/stateDashboardSlice';

export default function StateDashboardHome() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    stats,
    activities,
    upcomingEvents,
    statsLoading,
    statsError,
    activitiesLoading,
    eventsLoading,
  } = useSelector((state: RootState) => state.stateDashboard);

  useEffect(() => {
    dispatch(fetchStateStatistics());
    dispatch(fetchStateActivities({ limit: 10, offset: 0 }));
    dispatch(fetchUpcomingEvents({ limit: 10 }));
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Estatal</h1>
        <p className="text-slate-400 mt-2">
          Bienvenido al panel de administración de la federación estatal
        </p>
      </div>

      {/* Statistics Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Estadísticas Generales
        </h2>

        {statsLoading && !stats ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : statsError ? (
          <Card className="bg-red-950 border-red-800">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-200 font-medium">Error al cargar estadísticas</p>
                  <p className="text-red-300 text-sm">{statsError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-200 text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Miembros Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalMembers || 0}</div>
                <p className="text-xs text-slate-400 mt-1">Miembros activos en la federación</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-200 text-sm font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Clubes Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.activeClubs || 0}</div>
                <p className="text-xs text-slate-400 mt-1">Clubes afiliados</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-200 text-sm font-medium flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Torneos Año
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stats.tournamentsThisYear || 0}
                </div>
                <p className="text-xs text-slate-400 mt-1">Torneos realizados en 2024</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-200 text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Eventos Próximos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.upcomingEvents || 0}</div>
                <p className="text-xs text-slate-400 mt-1">Eventos por venir</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-200 text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Crecimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {stats.membershipGrowth || 0}%
                </div>
                <p className="text-xs text-slate-400 mt-1">Crecimiento año actual</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-200 text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Mensajes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.messagesUnread || 0}</div>
                <p className="text-xs text-slate-400 mt-1">Mensajes sin leer</p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>

      {/* Recent Activities Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Actividades Recientes
        </h2>

        {activitiesLoading && !activities.length ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <Card
                key={activity.id}
                className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {activity.type === 'tournament' && (
                          <Trophy className="w-5 h-5 text-yellow-500" />
                        )}
                        {activity.type === 'club' && <Building className="w-5 h-5 text-blue-500" />}
                        {activity.type === 'member' && <Users className="w-5 h-5 text-green-500" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{activity.title}</h3>
                        <p className="text-slate-400 text-sm">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(activity.date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        activity.status === 'completed'
                          ? 'default'
                          : activity.status === 'pending'
                            ? 'secondary'
                            : 'outline'
                      }
                      className={
                        activity.status === 'completed'
                          ? 'bg-green-900 text-green-200'
                          : activity.status === 'pending'
                            ? 'bg-yellow-900 text-yellow-200'
                            : 'bg-slate-700 text-slate-200'
                      }
                    >
                      {activity.status === 'completed'
                        ? 'Completado'
                        : activity.status === 'pending'
                          ? 'Pendiente'
                          : 'Activo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-center">No hay actividades recientes</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Events Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Próximos Eventos
        </h2>

        {eventsLoading && !upcomingEvents.length ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{event.title}</CardTitle>
                      <CardDescription className="text-slate-400">{event.type}</CardDescription>
                    </div>
                    <Badge className="bg-blue-900 text-blue-200">{event.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">
                      {event.date ? new Date(event.date).toLocaleDateString('es-ES') : '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">
                      {event.participants || 0} participantes esperados
                    </span>
                  </div>
                  <Link to={`/state/dashboard/events/${event.id}`}>
                    <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                      Ver Detalles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-center">No hay eventos próximos</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link to="/state/dashboard/statistics">
            <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver Estadísticas
            </Button>
          </Link>
          <Link to="/state/dashboard/members">
            <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white">
              <Users className="w-4 h-4 mr-2" />
              Gestionar Miembros
            </Button>
          </Link>
          <Link to="/state/dashboard/clubs">
            <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white">
              <Building className="w-4 h-4 mr-2" />
              Gestionar Clubes
            </Button>
          </Link>
          <Link to="/state/dashboard/events">
            <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Crear Evento
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
