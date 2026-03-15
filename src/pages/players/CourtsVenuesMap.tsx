import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, AlertCircle, Loader, Map, Building2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchCourts, fetchVenuesByClub, type Court, type Venue } from '@/services/courtService';

interface LocationMarker {
  id: string;
  type: 'court' | 'venue';
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  details?: Court | Venue;
}

const CourtsVenuesMap = () => {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<LocationMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [viewType, setViewType] = useState<'courts' | 'venues'>('courts');
  const [selectedMarker, setSelectedMarker] = useState<LocationMarker | null>(null);

  // Fetch courts or venues
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);

        if (viewType === 'courts') {
          const response = await fetchCourts({
            state: selectedState || undefined,
            limit: 100,
          });

          if (response.success) {
            const markers: LocationMarker[] = response.data.map((court) => ({
              id: court.id,
              type: 'court' as const,
              name: court.name,
              latitude: court.club.latitude,
              longitude: court.club.longitude,
              address: court.club.address,
              city: court.club.city,
              state: court.club.state,
              details: court,
            }));
            setLocations(markers);
          } else {
            setError(response.message || 'Failed to fetch courts');
            setLocations([]);
          }
        } else {
          // For venues, we would need a dedicated API endpoint
          // For now, we'll show a placeholder message
          setError('Venue map feature coming soon');
          setLocations([]);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load locations');
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [viewType, selectedState]);

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
                  <Map className="w-4 h-4" />
                  <span>{t('pages.courtsMap.label') || 'Facilities'}</span>
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                {t('pages.courtsMap.title') || 'Find Courts & Venues'}
              </h1>

              <p className="text-white/80 text-xl max-w-2xl mx-auto leading-relaxed">
                {t('pages.courtsMap.subtitle') ||
                  'Discover pickleball courts and venues near you. Find the perfect place to play.'}
              </p>

              <div className="flex justify-center gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4">
                  <div className="text-3xl font-bold text-white mb-1">{locations.length}+</div>
                  <div className="text-white/70 text-sm">{t('pages.courtsMap.stat_locations') || 'Locations'}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4">
                  <div className="text-3xl font-bold text-white mb-1">32</div>
                  <div className="text-white/70 text-sm">{t('pages.courtsMap.stat_states') || 'States'}</div>
                </div>
              </div>
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
                      {t('pages.courtsMap.view') || 'View Type'}
                    </label>
                    <Select value={viewType} onValueChange={(val) => setViewType(val as 'courts' | 'venues')}>
                      <SelectTrigger className="h-12 border-slate-200 dark:border-slate-700 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="courts">Courts</SelectItem>
                        <SelectItem value="venues">Venues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-3 block">
                      {t('pages.courtsMap.state') || 'State'}
                    </label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger className="h-12 border-slate-200 dark:border-slate-700 rounded-xl">
                        <SelectValue placeholder={t('pages.courtsMap.allStates') || 'All States'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All States</SelectItem>
                        <SelectItem value="California">California</SelectItem>
                        <SelectItem value="Texas">Texas</SelectItem>
                        <SelectItem value="Florida">Florida</SelectItem>
                        <SelectItem value="New York">New York</SelectItem>
                        <SelectItem value="Arizona">Arizona</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-3 block">
                      {t('pages.courtsMap.locationsFound') || 'Locations Found'}
                    </label>
                    <div className="h-12 flex items-center px-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold">
                      {loading ? (
                        <Loader className="w-4 h-4 animate-spin text-primary mr-2" />
                      ) : (
                        <Building2 className="w-4 h-4 text-primary mr-2" />
                      )}
                      {locations.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-400">{t('common.error') || 'Error'}</p>
                    <p className="text-sm text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-slate-400">{t('common.loading') || 'Loading locations...'}</p>
                </div>
              )}

              {/* No Results */}
              {!loading && locations.length === 0 && !error && (
                <div className="text-center py-24">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                    <div className="relative bg-slate-100 dark:bg-slate-800 rounded-3xl p-8">
                      <MapPin className="w-16 h-16 text-primary mx-auto" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {t('pages.courtsMap.noLocations') || 'No locations found'}
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {t('pages.courtsMap.tryOtherFilters') ||
                      'Try adjusting your filters to find more locations.'}
                  </p>
                </div>
              )}

              {/* Locations Grid */}
              {!loading && locations.length > 0 && (
                <div className="grid gap-4">
                  {locations.map((location) => (
                    <LocationCard
                      key={location.id}
                      location={location}
                      isSelected={selectedMarker?.id === location.id}
                      onSelect={setSelectedMarker}
                    />
                  ))}
                </div>
              )}

              {/* Map Placeholder */}
              {!loading && locations.length > 0 && (
                <div className="mt-8 p-8 bg-slate-200 dark:bg-slate-800 rounded-3xl border border-slate-300 dark:border-slate-700 text-center">
                  <Map className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-semibold mb-2">
                    {t('pages.courtsMap.mapComingSoon') || 'Interactive Map Coming Soon'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    {t('pages.courtsMap.mapFeatureInfo') ||
                      'We are working on adding an interactive map view for better location visualization.'}
                  </p>
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

// Location Card Component
function LocationCard({
  location,
  isSelected,
  onSelect,
}: {
  location: LocationMarker;
  isSelected: boolean;
  onSelect: (location: LocationMarker) => void;
}) {
  return (
    <div
      className={`group relative cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(location)}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-lime-400 to-primary rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

      <div className={`relative bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/10 ${
        isSelected
          ? 'border-primary/50'
          : 'border-slate-200 dark:border-slate-700/50 group-hover:border-primary/50'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              {location.type === 'court' ? <MapPin className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-2xl text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                {location.name}
              </h3>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {location.city && location.state
                    ? `${location.city}, ${location.state}`
                    : location.state || 'Unknown'}
                </span>
              </div>
              {location.address && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{location.address}</p>
              )}
            </div>

            {/* Badge */}
            <Badge className="flex-shrink-0 bg-primary/10 text-primary border border-primary/20">
              {location.type === 'court' ? 'Court' : 'Venue'}
            </Badge>
          </div>

          {/* Details Row */}
          {isSelected && location.details && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="grid sm:grid-cols-2 gap-4">
                {location.type === 'court' && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Court Type</p>
                      <p className="font-semibold text-foreground">
                        {(location.details as Court).court_type || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Surface</p>
                      <p className="font-semibold text-foreground">
                        {(location.details as Court).surface || 'N/A'}
                      </p>
                    </div>
                  </>
                )}
                {location.type === 'venue' && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Courts</p>
                      <p className="font-semibold text-foreground">
                        {(location.details as Venue).number_of_courts || 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {isSelected && (
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1 h-10 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 font-semibold transition-all duration-300">
                Get Directions
              </Button>
              <Button className="flex-1 h-10 rounded-lg bg-gradient-to-r from-primary to-lime-500 hover:shadow-lg hover:shadow-primary/50 font-semibold transition-all duration-300">
                Book Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourtsVenuesMap;
