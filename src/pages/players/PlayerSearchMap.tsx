import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Navigation, AlertCircle, Search, Loader, Trophy, Users, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { searchNearbyPlayers, getCurrentLocation, type PlayerFinderResult } from '@/services/playerFinderService';

const PlayerSearchMap = () => {
  const { t } = useTranslation();
  const [players, setPlayers] = useState<PlayerFinderResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedRadius, setSelectedRadius] = useState('50');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);

  // Get user's location on component mount
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        setError(null);
        const coords = await getCurrentLocation();
        setUserLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to get your location. Please enable location services.',
        );
      }
    };

    getUserLocation();
  }, []);

  // Fetch nearby players when location changes or filters change
  useEffect(() => {
    if (!userLocation) return;

    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await searchNearbyPlayers({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius_km: parseInt(selectedRadius),
          skill_level: selectedSkillLevel || undefined,
          limit: 100,
        });

        if (response.success) {
          setPlayers(response.data);
        } else {
          setError(response.message || 'Failed to fetch nearby players');
          setPlayers([]);
        }
      } catch (err) {
        console.error('Error fetching players:', err);
        setError(err instanceof Error ? err.message : 'Failed to load players');
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPlayers();
    }, 500);

    return () => clearTimeout(timer);
  }, [userLocation, selectedRadius, selectedSkillLevel]);

  // Group players by distance ranges
  const playersByDistance = {
    nearby: players.filter((p) => p.distance_km <= 10),
    moderate: players.filter((p) => p.distance_km > 10 && p.distance_km <= 25),
    far: players.filter((p) => p.distance_km > 25),
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5">
      <main className="flex-1">
        {/* Header Section */}
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(124, 252, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 252, 0, 0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-block mb-6 animate-fade-in">
                <span className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-widest uppercase bg-primary/10 px-6 py-3 rounded-full border border-primary/20 backdrop-blur-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{t('pages.playerSearchMap.label') || 'Find Players'}</span>
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                {t('pages.playerSearchMap.title') || 'Find Nearby Players'}
              </h1>

              <p className="text-white/80 text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                {t('pages.playerSearchMap.subtitle') ||
                  'Discover fellow pickleball players in your area and connect with your community.'}
              </p>

              {userLocation && (
                <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-6 py-3 backdrop-blur-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">
                    Location detected: ({userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)})
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Controls */}
              <div className="mb-8 p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-2xl">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-3 block">
                      {t('pages.playerSearchMap.radius') || 'Search Radius'}
                    </label>
                    <Select value={selectedRadius} onValueChange={setSelectedRadius}>
                      <SelectTrigger className="h-12 border-slate-200 dark:border-slate-700 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 km</SelectItem>
                        <SelectItem value="10">10 km</SelectItem>
                        <SelectItem value="25">25 km</SelectItem>
                        <SelectItem value="50">50 km (Default)</SelectItem>
                        <SelectItem value="100">100 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-3 block">
                      {t('pages.playerSearchMap.skillLevel') || 'Skill Level'}
                    </label>
                    <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                      <SelectTrigger className="h-12 border-slate-200 dark:border-slate-700 rounded-xl">
                        <SelectValue placeholder={t('pages.playerSearchMap.allLevels') || 'All Levels'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Levels</SelectItem>
                        <SelectItem value="2.5">2.5</SelectItem>
                        <SelectItem value="3.5">3.5</SelectItem>
                        <SelectItem value="4.5">4.5</SelectItem>
                        <SelectItem value="5.0+">5.0+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-3 block">
                      {t('pages.playerSearchMap.findingPlayers') || 'Players Found'}
                    </label>
                    <div className="h-12 flex items-center px-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold">
                      {loading ? (
                        <Loader className="w-4 h-4 animate-spin text-primary mr-2" />
                      ) : (
                        <Trophy className="w-4 h-4 text-primary mr-2" />
                      )}
                      {players.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-400">Error</p>
                    <p className="text-sm text-red-300 mt-1">{error}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Loading State */}
              {loading && !players.length && (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-slate-400">{t('common.loading') || 'Loading players...'}</p>
                </div>
              )}

              {/* No Results */}
              {!loading && players.length === 0 && !error && (
                <div className="text-center py-24">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                    <div className="relative bg-slate-100 dark:bg-slate-800 rounded-3xl p-8">
                      <Search className="w-16 h-16 text-primary mx-auto" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {t('pages.playerSearchMap.noPlayersNearby') || 'No players nearby'}
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {t('pages.playerSearchMap.tryIncreasingRadius') ||
                      'Try increasing the search radius to find more players.'}
                  </p>
                </div>
              )}

              {/* Players by Distance */}
              {!loading && players.length > 0 && (
                <div className="space-y-8">
                  {/* Nearby Players (0-10 km) */}
                  {playersByDistance.nearby.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
                        Very Close ({playersByDistance.nearby.length})
                      </h2>
                      <div className="grid gap-4">
                        {playersByDistance.nearby.map((player) => (
                          <PlayerCard key={player.id} player={player} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Moderate Distance Players (10-25 km) */}
                  {playersByDistance.moderate.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full" />
                        Moderate Distance ({playersByDistance.moderate.length})
                      </h2>
                      <div className="grid gap-4">
                        {playersByDistance.moderate.map((player) => (
                          <PlayerCard key={player.id} player={player} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Far Players (25+ km) */}
                  {playersByDistance.far.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-pink-500 rounded-full" />
                        Further Away ({playersByDistance.far.length})
                      </h2>
                      <div className="grid gap-4">
                        {playersByDistance.far.map((player) => (
                          <PlayerCard key={player.id} player={player} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// Player Card Component
function PlayerCard({ player }: { player: PlayerFinderResult }) {
  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-lime-400 to-primary rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/50 group-hover:border-primary/50 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative group/avatar">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-lime-500 rounded-full opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-500" />
              <div className="relative">
                <img
                  src={player.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`}
                  alt={player.full_name}
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`;
                  }}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-lg group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-2xl text-foreground group-hover:text-primary transition-colors duration-300">
                    {player.full_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {player.city && player.state
                        ? `${player.city}, ${player.state}`
                        : player.state || 'Unknown'}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="flex-shrink-0 border-2 border-primary/20 bg-primary/10 text-primary font-bold px-4 py-2">
                  {player.distance_km} km
                </Badge>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl px-4 py-2">
                  <div className="text-xs text-muted-foreground">Skill Level</div>
                  <div className="font-bold text-foreground">{player.skill_level || 'N/A'}</div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl px-4 py-2">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-bold text-foreground capitalize">{player.membership_status}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col gap-3 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none h-12 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 font-semibold transition-all duration-300">
                View Profile
              </Button>
              <Button className="flex-1 sm:flex-none h-12 gap-2 px-6 rounded-xl bg-gradient-to-r from-primary to-lime-500 hover:shadow-lg hover:shadow-primary/50 font-semibold transition-all duration-300">
                <Users className="w-4 h-4" />
                Connect
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerSearchMap;
