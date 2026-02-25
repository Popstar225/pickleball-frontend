import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building2,
  MapPin,
  Users,
  Search,
  Star,
  Calendar,
  Clock,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';

export default function PlayerClubsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Mock data - in real app this would come from Redux/API
  const myClubs = [
    {
      id: 1,
      name: 'Club Pickleball CDMX',
      location: 'Ciudad de México',
      members: 245,
      joinedDate: '2023-06-15',
      status: 'active',
      logo: '/api/placeholder/64/64',
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Pickleball Guadalajara',
      location: 'Guadalajara',
      members: 156,
      joinedDate: '2023-08-20',
      status: 'active',
      logo: '/api/placeholder/64/64',
      rating: 4.6,
    },
  ];

  const availableClubs = [
    {
      id: 3,
      name: 'Club Deportivo Monterrey',
      location: 'Monterrey',
      members: 189,
      distance: '2.3 km',
      description: 'Club deportivo con instalaciones de primer nivel para pickleball.',
      facilities: ['8 canchas', 'Gimnasio', 'Cafetería'],
      rating: 4.7,
      logo: '/api/placeholder/64/64',
      contact: {
        phone: '+52 81 1234 5678',
        email: 'info@cdmonterrey.com',
        website: 'https://cdmonterrey.com',
      },
      upcomingEvents: [
        { name: 'Torneo Semanal', date: '2024-03-25', time: '10:00' },
        { name: 'Clases Grupales', date: '2024-03-26', time: '18:00' },
      ],
    },
    {
      id: 4,
      name: 'Pickleball Tijuana',
      location: 'Tijuana',
      members: 98,
      distance: '15.7 km',
      description: 'Comunidad apasionada de pickleball en la frontera norte.',
      facilities: ['4 canchas', 'Tienda', 'Área social'],
      rating: 4.4,
      logo: '/api/placeholder/64/64',
      contact: {
        phone: '+52 664 123 4567',
        email: 'contacto@pickleballtijuana.mx',
        website: 'https://pickleballtijuana.mx',
      },
      upcomingEvents: [{ name: 'Entrenamiento Libre', date: '2024-03-24', time: '09:00' }],
    },
    {
      id: 5,
      name: 'Club Querétaro Pickleball',
      location: 'Querétaro',
      members: 134,
      distance: '45.2 km',
      description: 'Instalaciones modernas dedicadas exclusivamente al pickleball.',
      facilities: ['6 canchas', 'Vestidores', 'Estacionamiento'],
      rating: 4.9,
      logo: '/api/placeholder/64/64',
      contact: {
        phone: '+52 442 123 4567',
        email: 'info@clubqueretaro.com',
        website: 'https://clubqueretaro.com',
      },
      upcomingEvents: [
        { name: 'Campeonato Estatal', date: '2024-04-01', time: '08:00' },
        { name: 'Taller Técnico', date: '2024-03-28', time: '16:00' },
      ],
    },
  ];

  const filteredClubs = availableClubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      club.location.toLowerCase().includes(locationFilter.toLowerCase()),
  );

  const handleJoinClub = (clubId: number) => {
    // Here you would call the API to join the club
    alert(`Solicitud enviada para unirte al club ${clubId}`);
  };

  const handleLeaveClub = (clubId: number) => {
    // Here you would call the API to leave the club
    alert(`Has abandonado el club ${clubId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Buscar Clubes</h1>
          <p className="text-slate-400 mt-1">
            Encuentra y únete a clubes de pickleball cerca de ti
          </p>
        </div>
      </div>

      {/* Search Filters */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar clubes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Ubicación..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Clubs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Mis Clubes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {myClubs.map((club) => (
            <Card key={club.id} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={club.logo} alt={club.name} />
                      <AvatarFallback className="bg-primary text-slate-900">
                        {club.name
                          .split(' ')
                          .map((word) => word[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-white">{club.name}</h3>
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {club.location}
                      </p>
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {club.members} miembros
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-white">{club.rating}</span>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700">Activo</Badge>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Miembro desde {new Date(club.joinedDate).toLocaleDateString('es-MX')}
                  </p>
                  <Button
                    onClick={() => handleLeaveClub(club.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-700 text-red-400 hover:bg-red-500/10"
                  >
                    Abandonar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Available Clubs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Clubes Disponibles</h2>
        <div className="grid gap-6">
          {filteredClubs.map((club) => (
            <Card key={club.id} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={club.logo} alt={club.name} />
                      <AvatarFallback className="bg-primary text-slate-900 text-lg">
                        {club.name
                          .split(' ')
                          .map((word) => word[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{club.name}</h3>
                      <p className="text-slate-400 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {club.location} • {club.distance}
                      </p>
                      <p className="text-slate-400 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {club.members} miembros
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-white">{club.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoinClub(club.id)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Unirme al Club
                  </Button>
                </div>

                <p className="text-slate-300 mb-4">{club.description}</p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <h4 className="font-medium text-white mb-2">Instalaciones</h4>
                    <div className="flex flex-wrap gap-1">
                      {club.facilities.map((facility, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-slate-700 text-slate-300"
                        >
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">Contacto</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-400 flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {club.contact.phone}
                      </p>
                      <p className="text-slate-400 flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {club.contact.email}
                      </p>
                      <p className="text-slate-400 flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        <a
                          href={club.contact.website}
                          className="hover:text-white transition-colors"
                        >
                          Sitio web
                        </a>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-2">Próximos Eventos</h4>
                    <div className="space-y-1">
                      {club.upcomingEvents.slice(0, 2).map((event, index) => (
                        <div key={index} className="text-sm text-slate-400 flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{event.name}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>
                            {event.date} {event.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClubs.length === 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6 text-center">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No se encontraron clubes</h3>
              <p className="text-slate-400">
                Intenta ajustar tus criterios de búsqueda para encontrar más clubes.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
