import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Search, MapPin, Trophy, Star, MessageCircle, UserPlus, Filter } from 'lucide-react';

export default function PlayerSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - in real app this would come from Redux/API
  const players = [
    {
      id: 1,
      name: 'María González',
      location: 'Ciudad de México',
      skillLevel: 'Avanzado',
      rating: 4.9,
      tournamentsPlayed: 28,
      club: 'Club Pickleball CDMX',
      avatar: '/api/placeholder/64/64',
      lastActive: '2024-03-20',
      bio: 'Jugadora apasionada con experiencia en torneos nacionales.',
      preferredPositions: ['Derecha', 'Ambos'],
      availability: 'Fines de semana',
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      location: 'Guadalajara',
      skillLevel: 'Intermedio',
      rating: 4.3,
      tournamentsPlayed: 15,
      club: 'Pickleball Guadalajara',
      avatar: '/api/placeholder/64/64',
      lastActive: '2024-03-19',
      bio: 'Busco compañeros para entrenar y mejorar mi juego.',
      preferredPositions: ['Izquierda'],
      availability: 'Entre semana',
    },
    {
      id: 3,
      name: 'Ana López',
      location: 'Monterrey',
      skillLevel: 'Principiante',
      rating: 4.1,
      tournamentsPlayed: 5,
      club: 'Club Deportivo Monterrey',
      avatar: '/api/placeholder/64/64',
      lastActive: '2024-03-18',
      bio: 'Nueva en el pickleball, buscando aprender con jugadores experimentados.',
      preferredPositions: ['Ambos'],
      availability: 'Fines de semana',
    },
    {
      id: 4,
      name: 'Roberto Sánchez',
      location: 'Querétaro',
      skillLevel: 'Avanzado',
      rating: 4.8,
      tournamentsPlayed: 42,
      club: 'Club Querétaro Pickleball',
      avatar: '/api/placeholder/64/64',
      lastActive: '2024-03-20',
      bio: 'Ex campeón estatal, disponible para coaching y partidos competitivos.',
      preferredPositions: ['Derecha', 'Izquierda'],
      availability: 'Todos los días',
    },
    {
      id: 5,
      name: 'Laura Martínez',
      location: 'Tijuana',
      skillLevel: 'Intermedio',
      rating: 4.5,
      tournamentsPlayed: 22,
      club: 'Pickleball Tijuana',
      avatar: '/api/placeholder/64/64',
      lastActive: '2024-03-17',
      bio: 'Me encanta el dobles mixto y los torneos locales.',
      preferredPositions: ['Ambos'],
      availability: 'Fines de semana',
    },
  ];

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.club.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      !locationFilter || player.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesSkill = !skillFilter || player.skillLevel === skillFilter;

    return matchesSearch && matchesLocation && matchesSkill;
  });

  const handleSendMessage = (playerId: number) => {
    // Here you would navigate to messages or open a chat
    alert(`Iniciando conversación con jugador ${playerId}`);
  };

  const handleAddFriend = (playerId: number) => {
    // Here you would call the API to send a friend request
    alert(`Solicitud de amistad enviada al jugador ${playerId}`);
  };

  const getSkillBadgeColor = (skill: string) => {
    switch (skill) {
      case 'Principiante':
        return 'bg-green-600 hover:bg-green-700';
      case 'Intermedio':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'Avanzado':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'Profesional':
        return 'bg-purple-600 hover:bg-purple-700';
      default:
        return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Buscar Jugadores</h1>
          <p className="text-slate-400 mt-1">
            Encuentra compañeros de juego y conecta con la comunidad
          </p>
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="border-slate-700 text-white hover:bg-slate-800"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o club..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-slate-800">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Ubicación</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Ciudad o estado..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Nivel de Habilidad</label>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Todos los niveles" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">Todos los niveles</SelectItem>
                    <SelectItem value="Principiante">Principiante</SelectItem>
                    <SelectItem value="Intermedio">Intermedio</SelectItem>
                    <SelectItem value="Avanzado">Avanzado</SelectItem>
                    <SelectItem value="Profesional">Profesional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Jugadores Encontrados ({filteredPlayers.length})
          </h2>
        </div>

        <div className="grid gap-4">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={player.avatar} alt={player.name} />
                      <AvatarFallback className="bg-primary text-slate-900 text-lg">
                        {player.name
                          .split(' ')
                          .map((word) => word[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{player.name}</h3>
                        <Badge className={getSkillBadgeColor(player.skillLevel)}>
                          {player.skillLevel}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-white">{player.rating}</span>
                        </div>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2 text-sm text-slate-400 mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{player.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-3 w-3" />
                          <span>{player.tournamentsPlayed} torneos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{player.club}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Activo: {new Date(player.lastActive).toLocaleDateString('es-MX')}
                        </div>
                      </div>

                      <p className="text-slate-300 mb-3">{player.bio}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs text-slate-400">Posiciones:</span>
                        {player.preferredPositions.map((position, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-slate-700 text-slate-300"
                          >
                            {position}
                          </Badge>
                        ))}
                      </div>

                      <p className="text-xs text-slate-400">
                        Disponibilidad: {player.availability}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleSendMessage(player.id)}
                      variant="outline"
                      size="sm"
                      className="border-slate-700 text-white hover:bg-slate-800"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Mensaje
                    </Button>
                    <Button
                      onClick={() => handleAddFriend(player.id)}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Conectar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No se encontraron jugadores</h3>
              <p className="text-slate-400">
                Intenta ajustar tus criterios de búsqueda para encontrar más jugadores.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Estadísticas de la Comunidad</CardTitle>
          <CardDescription className="text-slate-400">
            Información general sobre la comunidad de jugadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1,247</div>
              <p className="text-sm text-slate-400">Jugadores Activos</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">89</div>
              <p className="text-sm text-slate-400">Clubes Registrados</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">156</div>
              <p className="text-sm text-slate-400">Torneos este Mes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4.6</div>
              <p className="text-sm text-slate-400">Rating Promedio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
