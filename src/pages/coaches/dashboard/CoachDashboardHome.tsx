import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Award,
  Calendar,
  TrendingUp,
  BookOpen,
  Trophy,
  MessageSquare,
  DollarSign,
  Shield,
  GraduationCap,
  Loader,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import {
  fetchCoachProfile,
  fetchCoachStudents,
  fetchCoachMessages,
} from '@/store/slices/coachDashboardSlice';

export default function CoachDashboardHome() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    profile,
    students,
    messages,
    profileLoading,
    profileError,
    studentsLoading,
    messagesLoading,
  } = useSelector((state: RootState) => state.coachDashboard);

  useEffect(() => {
    dispatch(fetchCoachProfile());
    dispatch(fetchCoachStudents({}));
    dispatch(fetchCoachMessages({ limit: 10 }));
  }, [dispatch]);

  const certifications = [
    {
      name: 'Certificación NRTP Level 3',
      issuer: 'USA Pickleball',
      expiryDate: '2024-08-15',
      status: 'active',
    },
    {
      name: 'Entrenador Nacional',
      issuer: 'Federación Mexicana',
      expiryDate: '2025-03-20',
      status: 'active',
    },
    {
      name: 'Primeros Auxilios Deportivos',
      issuer: 'Cruz Roja Mexicana',
      expiryDate: '2024-11-10',
      status: 'active',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">¡Bienvenido a tu Panel de Coach!</h1>
          <p className="text-slate-400 mt-1">
            Gestiona tus estudiantes, sesiones y certificaciones
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            asChild
            variant="outline"
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            <Link to="/coaches/dashboard/messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Ver Mensajes ({messages?.length || 0})
            </Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/coaches/dashboard/credentials">
              <Shield className="h-4 w-4 mr-2" />
              Ver Credenciales
            </Link>
          </Button>
        </div>
      </div>

      {/* NRTP Status */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border-blue-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-600/20">
                <Award className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Certificación: {profile?.certifications || 'Estándar'}
                </h3>
                <p className="text-slate-400">
                  Desde:{' '}
                  {profile?.joinedDate
                    ? new Date(profile.joinedDate).toLocaleDateString('es-MX')
                    : 'N/A'}
                </p>
              </div>
            </div>
            <Badge className="bg-blue-600 hover:bg-blue-700 text-lg px-4 py-2">
              {profile?.certifications || 'Nivel 1'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Estudiantes Activos
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{students?.length || 0}</div>
            <p className="text-xs text-slate-400">Total</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Certificaciones</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1</div>
            <p className="text-xs text-slate-400">Activas</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Sesiones Próximas</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-slate-400">Esta semana</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Ingresos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$0</div>
            <p className="text-xs text-slate-400">MXN este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Sessions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Students */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estudiantes Recientes
            </CardTitle>
            <CardDescription className="text-slate-400">
              Actividad reciente de tus estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentsLoading && !students?.length ? (
              <div className="flex justify-center items-center h-32">
                <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : students && students.length > 0 ? (
              students.slice(0, 3).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white">
                      {student.firstName} {student.lastName}
                    </h4>
                    <p className="text-sm text-slate-400">
                      Nivel: {student.level || 'Principiante'} • Registro:{' '}
                      {new Date(student.joinDate).toLocaleDateString('es-MX')}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: '50%' }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400">50%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-4">Sin estudiantes registrados</p>
            )}
            <Button
              asChild
              variant="outline"
              className="w-full border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/coaches/dashboard/account">Gestionar Estudiantes</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sesiones Próximas
            </CardTitle>
            <CardDescription className="text-slate-400">
              Tus próximas clases y entrenamientos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-400 text-center py-8">No hay sesiones próximas programadas</p>
            <Button
              asChild
              variant="outline"
              className="w-full border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/coaches/dashboard/account">Ver Todas las Sesiones</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Certifications */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificaciones Activas
          </CardTitle>
          <CardDescription className="text-slate-400">
            Tus credenciales profesionales y certificaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-yellow-600/20">
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Certificación NRTP</h4>
                  <p className="text-sm text-slate-400">{profile?.certifications || 'Nivel 1'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Desde:{' '}
                  {profile?.joinedDate
                    ? new Date(profile.joinedDate).toLocaleDateString('es-MX')
                    : 'N/A'}
                </span>
                <Badge className="bg-green-600 hover:bg-green-700">Activa</Badge>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button
              asChild
              variant="outline"
              className="w-full border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/coaches/dashboard/credentials">Gestionar Certificaciones</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

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
              <Link to="/coaches/dashboard/account">
                <Users className="h-6 w-6" />
                <span>Gestionar Estudiantes</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/coaches/dashboard/credentials">
                <Shield className="h-6 w-6" />
                <span>Renovar NRTP</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/coaches/dashboard/messages">
                <MessageSquare className="h-6 w-6" />
                <span>Contactar Federación</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-20 flex-col gap-2 border-slate-700 text-white hover:bg-slate-800"
            >
              <Link to="/coaches/dashboard/payments">
                <DollarSign className="h-6 w-6" />
                <span>Ver Ingresos</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
