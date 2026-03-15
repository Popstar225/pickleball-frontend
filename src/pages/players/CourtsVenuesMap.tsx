import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  AlertCircle,
  Loader,
  Map,
  Building2,
  ExternalLink,
  Layers,
} from 'lucide-react';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { fetchCourts, type Court, type Venue } from '@/services/courtService';

const MEXICO_CENTER: [number, number] = [23.6345, -102.5528];

const MEXICO_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Estado de México',
  'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
  'Yucatán', 'Zacatecas',
];

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

function createCourtIcon(isSelected: boolean): L.DivIcon {
  const color = '#22C55E';
  const size = isSelected ? 44 : 36;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 36 44">
    <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.4"/></filter>
    <path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 26 18 26S36 30 36 18C36 8.06 27.94 0 18 0z"
      fill="${color}" stroke="white" stroke-width="2" filter="url(#s)"/>
    <rect x="10" y="11" width="16" height="12" rx="1" fill="white" opacity="0.9"/>
    <line x1="18" y1="11" x2="18" y2="23" stroke="${color}" stroke-width="1.5"/>
    <line x1="10" y1="17" x2="26" y2="17" stroke="${color}" stroke-width="1.5"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
}

function createVenueIcon(isSelected: boolean): L.DivIcon {
  const color = '#8B5CF6';
  const size = isSelected ? 44 : 36;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 36 44">
    <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.4"/></filter>
    <path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 26 18 26S36 30 36 18C36 8.06 27.94 0 18 0z"
      fill="${color}" stroke="white" stroke-width="2" filter="url(#s)"/>
    <rect x="11" y="12" width="14" height="11" rx="1" fill="white" opacity="0.9"/>
    <rect x="14" y="17" width="3" height="6" rx="0.5" fill="${color}"/>
    <rect x="19" y="14" width="3" height="4" rx="0.5" fill="${color}"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const CourtsVenuesMap = () => {
  const { t } = useTranslation();

  const [locations, setLocations] = useState<LocationMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('all');
  const [viewType, setViewType] = useState<'courts' | 'venues'>('courts');
  const [selectedLocation, setSelectedLocation] = useState<LocationMarker | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(MEXICO_CENTER);
  const [mapZoom, setMapZoom] = useState(6);

  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        setSelectedLocation(null);

        const response = await fetchCourts({
          state: selectedState !== 'all' ? selectedState : undefined,
          limit: 200,
        });

        if (response.success) {
          const markers: LocationMarker[] = response.data
            .filter((court) => court.club.latitude && court.club.longitude)
            .map((court) => ({
              id: court.id,
              type: viewType === 'courts' ? ('court' as const) : ('venue' as const),
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
          setError(response.message || 'Failed to fetch locations');
          setLocations([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load locations');
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [viewType, selectedState]);

  const handleMarkerClick = (location: LocationMarker) => {
    setSelectedLocation(location);
    setMapCenter([location.latitude, location.longitude]);
    setMapZoom(15);
  };

  const handleCardClick = (location: LocationMarker) => {
    setSelectedLocation(location);
    setMapCenter([location.latitude, location.longitude]);
    setMapZoom(15);
    setTimeout(() => markerRefs.current[location.id]?.openPopup(), 150);
  };

  const openDirections = (location: LocationMarker) => {
    const query = encodeURIComponent(
      location.address || `${location.name} ${location.city} ${location.state}`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <main className="flex-1 flex flex-col">
        {/* Hero Header */}
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 py-14 overflow-hidden flex-shrink-0">
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
              <span className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-widest uppercase bg-primary/10 px-6 py-3 rounded-full border border-primary/20 backdrop-blur-sm mb-4">
                <Map className="w-4 h-4" />
                {t('pages.courtsMap.label') || 'Facilities'}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                {t('pages.courtsMap.title') || 'Find Courts & Venues'}
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto mb-6">
                {t('pages.courtsMap.subtitle') || 'Discover pickleball courts and venues across Mexico on an interactive map.'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3">
                  <span className="text-2xl font-bold text-white">{locations.length}+</span>
                  <span className="text-white/70 text-sm ml-2">Locations</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3">
                  <span className="text-2xl font-bold text-white">32</span>
                  <span className="text-white/70 text-sm ml-2">States</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map + List Split Layout */}
        <div className="flex flex-col lg:flex-row flex-1" style={{ minHeight: '650px' }}>
          {/* Left: Location List Panel */}
          <div className="w-full lg:w-2/5 flex flex-col bg-slate-900 border-r border-slate-700/50">
            {/* Filter Controls */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase tracking-wide">
                    View Type
                  </label>
                  <Select value={viewType} onValueChange={(v) => setViewType(v as 'courts' | 'venues')}>
                    <SelectTrigger className="h-10 bg-slate-800 border-slate-600 text-white text-sm rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="courts" className="text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          Courts
                        </div>
                      </SelectItem>
                      <SelectItem value="venues" className="text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500" />
                          Venues
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block uppercase tracking-wide">
                    State / Region
                  </label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="h-10 bg-slate-800 border-slate-600 text-white text-sm rounded-lg">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 max-h-64">
                      <SelectItem value="all" className="text-white">All States</SelectItem>
                      {MEXICO_STATES.map((state) => (
                        <SelectItem key={state} value={state} className="text-white">{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-400">Courts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-xs text-slate-400">Venues</span>
                </div>
                <div className="ml-auto">
                  <span className="text-xs text-slate-500">{locations.length} found</span>
                </div>
              </div>
            </div>

            {/* Location List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader className="w-7 h-7 text-primary animate-spin" />
                  <p className="text-slate-400 text-sm">Loading locations...</p>
                </div>
              )}

              {error && !loading && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-400">Error</p>
                    <p className="text-xs text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {!loading && !error && locations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-slate-500" />
                  </div>
                  <p className="text-slate-400 font-semibold">No locations found</p>
                  <p className="text-slate-500 text-sm">Try adjusting your filters</p>
                </div>
              )}

              {!loading && locations.map((location) => (
                <div
                  key={location.id}
                  onClick={() => handleCardClick(location)}
                  className={`group cursor-pointer rounded-xl border transition-all duration-200 overflow-hidden ${
                    selectedLocation?.id === location.id
                      ? location.type === 'court'
                        ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20'
                        : 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                      : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="p-3 flex items-start gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      location.type === 'court' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {location.type === 'court' ? <Layers className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate transition-colors ${
                        selectedLocation?.id === location.id
                          ? location.type === 'court' ? 'text-green-400' : 'text-purple-400'
                          : 'text-white group-hover:text-slate-200'
                      }`}>
                        {location.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <p className="text-xs text-slate-400 truncate">
                          {location.city && location.state
                            ? `${location.city}, ${location.state}`
                            : location.state || 'Mexico'}
                        </p>
                      </div>
                      {location.address && (
                        <p className="text-xs text-slate-500 mt-1 truncate">{location.address}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className={`text-xs py-0 h-5 ${
                          location.type === 'court' ? 'border-green-500/40 text-green-400' : 'border-purple-500/40 text-purple-400'
                        }`}>
                          {location.type === 'court' ? 'Court' : 'Venue'}
                        </Badge>
                        {location.type === 'court' && location.details && (
                          <span className="text-xs text-slate-500">
                            {(location.details as Court).surface || ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded actions when selected */}
                  {selectedLocation?.id === location.id && (
                    <div className="px-3 pb-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs border-slate-600 text-slate-300 hover:text-white hover:border-slate-400"
                        onClick={(e) => { e.stopPropagation(); openDirections(location); }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Directions
                      </Button>
                      <Button
                        size="sm"
                        className={`flex-1 h-8 text-xs font-semibold text-slate-900 ${
                          location.type === 'court' ? 'bg-green-500 hover:bg-green-400' : 'bg-purple-500 hover:bg-purple-400'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Book Now
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Leaflet Map */}
          <div className="w-full lg:w-3/5 relative" style={{ minHeight: '400px' }}>
            <MapContainer
              center={MEXICO_CENTER}
              zoom={6}
              style={{ width: '100%', height: '100%', minHeight: '400px' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                subdomains="abcd"
                maxZoom={20}
              />
              <MapController center={mapCenter} zoom={mapZoom} />

              {locations.map((location) => {
                const isSelected = selectedLocation?.id === location.id;
                return (
                  <Marker
                    key={location.id}
                    ref={(el: L.Marker | null) => { markerRefs.current[location.id] = el; }}
                    position={[location.latitude, location.longitude]}
                    icon={location.type === 'court' ? createCourtIcon(isSelected) : createVenueIcon(isSelected)}
                    zIndexOffset={isSelected ? 1000 : 0}
                    eventHandlers={{ click: () => handleMarkerClick(location) }}
                  >
                    <Popup>
                      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '4px', maxWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                            backgroundColor: location.type === 'court' ? '#22C55E20' : '#8B5CF620',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: '18px' }}>{location.type === 'court' ? '🏸' : '🏢'}</span>
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                              {location.name}
                            </p>
                            <span style={{
                              fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '20px',
                              backgroundColor: location.type === 'court' ? '#22C55E20' : '#8B5CF620',
                              color: location.type === 'court' ? '#22C55E' : '#8B5CF6',
                            }}>
                              {location.type === 'court' ? 'Court' : 'Venue'}
                            </span>
                          </div>
                        </div>

                        {location.address && (
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px', lineHeight: 1.4 }}>
                            📍 {location.address}
                          </p>
                        )}
                        {location.city && location.state && (
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px' }}>
                            {location.city}, {location.state}
                          </p>
                        )}

                        {location.type === 'court' && location.details && (
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                            {(location.details as Court).surface && (
                              <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                                {(location.details as Court).surface}
                              </span>
                            )}
                            {(location.details as Court).court_type && (
                              <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                                {(location.details as Court).court_type}
                              </span>
                            )}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => openDirections(location)}
                            style={{ flex: 1, padding: '6px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', color: '#0f172a' }}
                          >
                            Directions
                          </button>
                          <button style={{
                            flex: 1, padding: '6px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer', color: 'white',
                            backgroundColor: location.type === 'court' ? '#22C55E' : '#8B5CF6',
                          }}>
                            Book Now
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Stats overlay */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm font-bold">{locations.filter(l => l.type === 'court').length}</span>
                <span className="text-slate-400 text-xs">courts</span>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm font-bold">{locations.filter(l => l.type === 'venue').length}</span>
                <span className="text-slate-400 text-xs">venues</span>
              </div>
            </div>

            {/* Reset view button */}
            <button
              onClick={() => { setMapCenter(MEXICO_CENTER); setMapZoom(6); setSelectedLocation(null); }}
              className="absolute bottom-8 right-4 z-[1000] bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-all flex items-center gap-2"
            >
              <Map className="w-4 h-4" />
              Reset View
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourtsVenuesMap;
