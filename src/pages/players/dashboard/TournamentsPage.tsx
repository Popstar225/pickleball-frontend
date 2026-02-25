import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Crown,
  Medal,
} from 'lucide-react';

export default function PlayerTournamentsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock data - in real app this would come from Redux/API
  const upcomingTournaments = [
    {
      id: 1,
      name: 'Torneo Nacional Pickleball 2024',
      date: '2024-04-15',
      endDate: '2024-04-17',
      location: 'Centro Deportivo Nacional, CDMX',
      category: 'Abierto',
      prize: 50000,
      maxParticipants: 128,
      registeredParticipants: 89,
      entryFee: 500,
      status: 'open',
      description: 'El torneo nacional más importante del año con participantes de todo el país.',
      organizer: 'Federación Mexicana de Pickleball',
      format: 'Individual y Dobles',
      courts: 16,
      logo: '/api/placeholder/64/64',
    },
    {
      id: 2,
      name: 'Copa Estatal Jalisco',
      date: '2024-03-30',
      endDate: '2024-03-31',
      location: 'Club Deportivo Guadalajara',
      category: 'Estatal',
      prize: 15000,
      maxParticipants: 64,
      registeredParticipants: 45,
      entryFee: 300,
      status: 'open',
      description: 'Torneo estatal con clasificatoria para el nacional.',
      organizer: 'Asociación Jalisco Pickleball',
      format: 'Individual y Dobles',
      courts: 8,
      logo: '/api/placeholder/64/64',
    },
    {
      id: 3,
      name: 'Torneo Interclubes Primavera',
      date: '2024-04-05',
      endDate: '2024-04-06',
      location: 'Polideportivo Municipal, Monterrey',
      category: 'Interclubes',
      prize: 8000,
      maxParticipants: 48,
      registeredParticipants: 48,
      entryFee: 200,
      status: 'full',
      description: 'Competencia entre los mejores clubes del norte del país.',
      organizer: 'Liga Norteña de Pickleball',
      format: 'Equipos',
      courts: 6,
      logo: '/api/placeholder/64/64',
    },
  ];

  const myTournaments = [
    {
      id: 1,
      name: 'Torneo Nacional Pickleball 2024',
      date: '2024-04-15',
      status: 'registered',
      registrationDate: '2024-03-10',
      position: null,
      partner: 'María González',
      category: 'Dobles Mixto',
    },
    {
      id: 2,
      name: 'Copa Estatal CDMX 2024',
      date: '2024-02-20',
      status: 'completed',
      registrationDate: '2024-02-01',
      position: 3,
      partner: 'Carlos Rodríguez',
      category: 'Dobles Masculino',
    },
    {
      id: 4,
      name: 'Torneo Interclubes Primavera',
      date: '2024-04-05',
      status: 'waitlist',
      registrationDate: '2024-03-15',
      position: null,
      partner: null,
      category: 'Individual',
    },
  ];

  const pastTournaments = [
    {
      id: 5,
      name: 'Campeonato Nacional 2023',
      date: '2023-12-10',
      endDate: '2023-12-12',
      location: 'Arena México, CDMX',
      position: 5,
      category: 'Individual',
      prize: 25000,
      participants: 96,
      partner: null,
    },
    {
      id: 6,
      name: 'Torneo Estatal 2023',
      date: '2023-11-15',
      endDate: '2023-11-16',
      location: 'Club Pickleball CDMX',
      position: 2,
      category: 'Dobles Mixto',
      prize: 5000,
      participants: 32,
      partner: 'Ana López',
    },
  ];

  const handleRegister = (tournamentId: number) => {
    // Here you would call the API to register for the tournament
    alert(`Registrándote en el torneo ${tournamentId}`);
  };

  const handleUnregister = (tournamentId: number) => {
    // Here you would call the API to unregister from the tournament
    alert(`Cancelando registro del torneo ${tournamentId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-600 hover:bg-green-700">Inscripciones Abiertas</Badge>;
      case 'full':
        return <Badge className="bg-red-600 hover:bg-red-700">Lleno</Badge>;
      case 'closed':
        return <Badge variant="secondary">Cerrado</Badge>;
      case 'registered':
        return <Badge className="bg-blue-600 hover:bg-blue-700">Registrado</Badge>;
      case 'waitlist':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Lista de Espera</Badge>;
      case 'completed':
        return (
          <Badge variant="outline" className="border-slate-700 text-slate-300">
            Completado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPositionIcon = (position: number | null) => {
    if (!position) return null;
    if (position === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (position === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (position === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <Trophy className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Torneos</h1>
          <p className="text-slate-400 mt-1">
            Explora torneos disponibles y administra tus participaciones
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Trophy className="h-4 w-4 mr-2" />
          Crear Torneo
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger
            value="upcoming"
            className="text-white data-[state=active]:bg-primary data-[state=active]:text-slate-900"
          >
            Próximos Torneos
          </TabsTrigger>
          <TabsTrigger
            value="my-tournaments"
            className="text-white data-[state=active]:bg-primary data-[state=active]:text-slate-900"
          >
            Mis Torneos
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-white data-[state=active]:bg-primary data-[state=active]:text-slate-900"
          >
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          <div className="grid gap-6">
            {upcomingTournaments.map((tournament) => (
              <Card key={tournament.id} className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={tournament.logo} alt={tournament.name} />
                        <AvatarFallback className="bg-primary text-slate-900 text-lg">
                          {tournament.name
                            .split(' ')
                            .map((word) => word[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{tournament.name}</h3>
                          {getStatusBadge(tournament.status)}
                        </div>
                        <p className="text-slate-300 mb-3">{tournament.description}</p>

                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(tournament.date).toLocaleDateString('es-MX')} -{' '}
                              {new Date(tournament.endDate).toLocaleDateString('es-MX')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin className="h-4 w-4" />
                            <span>{tournament.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Users className="h-4 w-4" />
                            <span>
                              {tournament.registeredParticipants}/{tournament.maxParticipants}{' '}
                              participantes
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <DollarSign className="h-4 w-4" />
                            <span>${tournament.entryFee} MXN</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="border-slate-700 text-slate-300">
                            {tournament.category}
                          </Badge>
                          <Badge variant="outline" className="border-slate-700 text-slate-300">
                            {tournament.format}
                          </Badge>
                          <Badge variant="outline" className="border-slate-700 text-slate-300">
                            {tournament.courts} canchas
                          </Badge>
                          <Badge variant="outline" className="border-slate-700 text-slate-300">
                            Premio: ${tournament.prize.toLocaleString()} MXN
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleRegister(tournament.id)}
                        disabled={tournament.status === 'full'}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-50"
                      >
                        {tournament.status === 'full' ? 'Lista de Espera' : 'Inscribirme'}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-slate-700 text-white hover:bg-slate-800"
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-tournaments" className="space-y-6">
          <div className="grid gap-4">
            {myTournaments.map((tournament) => (
              <Card key={tournament.id} className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{tournament.name}</h3>
                        {getStatusBadge(tournament.status)}
                        {tournament.position && getPositionIcon(tournament.position)}
                      </div>
                      <div className="grid gap-1 md:grid-cols-2 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(tournament.date).toLocaleDateString('es-MX')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-3 w-3" />
                          <span>{tournament.category}</span>
                        </div>
                        {tournament.partner && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span>Pareja: {tournament.partner}</span>
                          </div>
                        )}
                        <div className="text-xs">
                          Registrado:{' '}
                          {new Date(tournament.registrationDate).toLocaleDateString('es-MX')}
                        </div>
                      </div>
                      {tournament.position && (
                        <div className="mt-2">
                          <Badge className="bg-yellow-600 hover:bg-yellow-700">
                            Posición Final: #{tournament.position}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {tournament.status === 'registered' && (
                        <Button
                          onClick={() => handleUnregister(tournament.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-700 text-red-400 hover:bg-red-500/10"
                        >
                          Cancelar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-700 text-white hover:bg-slate-800"
                      >
                        Detalles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="grid gap-4">
            {pastTournaments.map((tournament) => (
              <Card key={tournament.id} className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{tournament.name}</h3>
                        {getPositionIcon(tournament.position)}
                        <Badge className="bg-slate-700 hover:bg-slate-800">
                          #{tournament.position} lugar
                        </Badge>
                      </div>
                      <div className="grid gap-1 md:grid-cols-2 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(tournament.date).toLocaleDateString('es-MX')} -{' '}
                            {new Date(tournament.endDate).toLocaleDateString('es-MX')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{tournament.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-3 w-3" />
                          <span>{tournament.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{tournament.participants} participantes</span>
                        </div>
                      </div>
                      {tournament.partner && (
                        <div className="mt-2 text-sm text-slate-400">
                          Pareja: {tournament.partner}
                        </div>
                      )}
                      <div className="mt-2">
                        <Badge variant="outline" className="border-slate-700 text-slate-300">
                          Premio: ${tournament.prize.toLocaleString()} MXN
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-slate-700 text-white hover:bg-slate-800"
                    >
                      Ver Resultados
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
