import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Users, Search, MapPin, Trophy, Filter, X,
  Mail, Phone, Lock, Zap, Loader2, AlertCircle,
  Navigation2, CheckCircle, Loader,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/payment/StripeProvider';
import { PaymentForm } from '@/components/payment/PaymentForm';
import {
  searchNearbyPlayers, getCurrentLocation,
  type PlayerFinderResult,
} from '@/services/playerFinderService';
import PaymentService from '@/services/paymentService';
import { RootState, AppDispatch } from '@/store';
import { updateUser } from '@/store/slices/authSlice';
import {
  upsertConversation,
  setActiveConversation,
} from '@/store/slices/messagesSlice';

// ─── Constants ────────────────────────────────────────────────────────────────
const MEXICO_CENTER: [number, number] = [23.6345, -102.5528];
const FEATURE_PRICE = 200;

const SKILL_LEVELS_FILTER = [
  { value: 'all', label: 'Todos los niveles' },
  { value: '2.5', label: '2.5' },
  { value: '3.0', label: '3.0' },
  { value: '3.5', label: '3.5' },
  { value: '4.0', label: '4.0' },
  { value: '4.5', label: '4.5' },
  { value: '5.0', label: '5.0+' },
];

const RADIUS_OPTIONS = [
  { value: 'all', label: 'Todo México' },
  { value: '25',  label: '25 km' },
  { value: '50',  label: '50 km' },
  { value: '100', label: '100 km' },
  { value: '250', label: '250 km' },
  { value: '500', label: '500 km' },
];

// ─── Leaflet helpers ──────────────────────────────────────────────────────────
function getSkillColor(skillLevel: string): string {
  const level = parseFloat(skillLevel);
  if (level >= 5.0) return '#EF4444';
  if (level >= 4.0) return '#F59E0B';
  if (level >= 3.0) return '#84CC16';
  return '#3B82F6';
}

function createPlayerIcon(color: string, isSelected: boolean): L.DivIcon {
  const size = isSelected ? 44 : 36;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 36 44">
    <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.4"/></filter>
    <path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 26 18 26S36 30 36 18C36 8.06 27.94 0 18 0z"
      fill="${color}" stroke="white" stroke-width="2" filter="url(#shadow)"/>
    <circle cx="18" cy="17" r="7" fill="white" opacity="0.9"/>
    <path d="M18 12a5 5 0 1 0 0 10A5 5 0 0 0 18 12z" fill="${color}"/>
  </svg>`;
  return L.divIcon({
    html: svg, className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
}

function createUserIcon(): L.DivIcon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="12" fill="#3B82F6" stroke="white" stroke-width="3"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
  </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [28, 28], iconAnchor: [14, 14] });
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

// ─── Payment Gate Modal ───────────────────────────────────────────────────────
interface PaymentGateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function PaymentGateModal({ open, onClose, onSuccess }: PaymentGateModalProps) {
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [paymentData, setPaymentData] = useState<{ paymentId: string; clientSecret: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await PaymentService.createPlayerFeaturePayment('nearby_search');
      if (!res.success || !res.data) throw new Error('No se pudo crear la solicitud de pago');
      setPaymentData({ paymentId: res.data.payment_id, clientSecret: res.data.client_secret });
      setStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!paymentData) return;
    try {
      await PaymentService.confirmPlayerFeaturePayment(paymentData.paymentId, paymentIntentId);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al confirmar el pago');
    }
  };

  const handleClose = () => {
    setStep('info');
    setPaymentData(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-[#0d1117] border-white/[0.1] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-[#ace600]" />
            Desbloquear Buscador de Jugadores
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Accede al mapa interactivo y encuentra jugadores cerca de ti
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'payment' && paymentData ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#ace600]/10 border border-[#ace600]/30 rounded-xl">
              <p className="font-semibold text-white">Pago único de ${FEATURE_PRICE} MXN</p>
              <p className="text-sm text-white/60">Acceso de por vida a la función</p>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
              <PaymentForm
                paymentId={paymentData.paymentId}
                clientSecret={paymentData.clientSecret}
                amount={FEATURE_PRICE * 100}
                currency="mxn"
                description={`Buscador de jugadores — $${FEATURE_PRICE} MXN`}
                onSuccess={handlePaymentSuccess}
                onError={(err) => { setError(err); setStep('info'); }}
              />
            </Elements>
            <Button
              onClick={() => setStep('info')}
              variant="outline"
              className="w-full border-white/[0.1] text-white/60"
            >
              Volver
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-br from-[#ace600]/20 to-[#ace600]/5 border border-[#ace600]/30 rounded-xl">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-4xl font-bold text-white">${FEATURE_PRICE}</span>
                <span className="text-white/60">MXN</span>
              </div>
              <p className="text-sm text-[#ace600] font-semibold">Pago único · Acceso de por vida</p>
            </div>
            <div className="space-y-3">
              {[
                { icon: MapPin,  text: 'Mapa interactivo con jugadores cercanos' },
                { icon: Users,   text: 'Ve jugadores por radio, nivel y ciudad' },
                { icon: Trophy,  text: 'Conecta directamente para partidos y torneos' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-lg border border-white/[0.08]">
                  <div className="p-1.5 bg-[#ace600]/10 rounded-lg shrink-0">
                    <Icon className="w-4 h-4 text-[#ace600]" />
                  </div>
                  <span className="text-sm text-white/70">{text}</span>
                </div>
              ))}
            </div>
            <Button
              className="w-full bg-[#ace600] text-black hover:bg-[#c0f000] font-bold"
              size="lg"
              onClick={handlePay}
              disabled={loading}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando…</>
                : <><Zap className="w-4 h-4 mr-2" /> Desbloquear por ${FEATURE_PRICE} MXN</>
              }
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PlayerSearchPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);

  // Access gate
  const [accessState, setAccessState] = useState<'checking' | 'locked' | 'granted'>('checking');
  const [showPayModal, setShowPayModal] = useState(false);

  // Map + player state
  const [players, setPlayers]             = useState<PlayerFinderResult[]>([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [userLocation, setUserLocation]   = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedRadius, setSelectedRadius]         = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [selectedPlayer, setSelectedPlayer]         = useState<PlayerFinderResult | null>(null);
  const [mapCenter, setMapCenter]         = useState<[number, number]>(MEXICO_CENTER);
  const [mapZoom, setMapZoom]             = useState(6);
  const [showFilters, setShowFilters]     = useState(false);

  const playerCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const markerRefs     = useRef<Record<string, L.Marker | null>>({});

  // ── Access check ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const status = user?.membership_status;
    if (status && ['active', 'basic', 'pro', 'premium'].includes(status)) {
      setAccessState('granted');
    } else {
      setAccessState('checking');
      searchNearbyPlayers({ latitude: MEXICO_CENTER[0], longitude: MEXICO_CENTER[1], radius_km: 1, limit: 1 })
        .then(() => setAccessState('granted'))
        .catch((err) => {
          const st = (err as any)?.response?.status ?? (err as any)?.status;
          setAccessState(st === 401 || st === 403 ? 'locked' : 'granted');
        });
    }
  }, [isAuthenticated, user?.membership_status, navigate]);

  // ── Location ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (accessState !== 'granted') return;
    getCurrentLocation()
      .then((coords) => {
        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setMapCenter([coords.latitude, coords.longitude]);
        setMapZoom(10);
      })
      .catch(() => setLocationError('Acceso a ubicación denegado. Mostrando todos los jugadores en México.'));
  }, [accessState]);

  // ── Player fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (accessState !== 'granted') return;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const isAll = selectedRadius === 'all' || !userLocation;
        const params = isAll
          ? { latitude: MEXICO_CENTER[0], longitude: MEXICO_CENTER[1], radius_km: 5000, skill_level: selectedSkillLevel !== 'all' ? selectedSkillLevel : undefined, limit: 200 }
          : { latitude: userLocation!.latitude, longitude: userLocation!.longitude, radius_km: parseInt(selectedRadius), skill_level: selectedSkillLevel !== 'all' ? selectedSkillLevel : undefined, limit: 100 };
        const res = await searchNearbyPlayers(params);
        if (res.success) setPlayers(res.data);
        else { setError(res.message || 'Error al buscar jugadores'); setPlayers([]); }
      } catch (err: any) {
        setError(err?.message || 'Error al buscar jugadores');
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(run, 300);
    return () => clearTimeout(t);
  }, [accessState, userLocation, selectedRadius, selectedSkillLevel]);

  const filteredPlayers = players.filter((p) =>
    !searchTerm || (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleMarkerClick = (player: PlayerFinderResult) => {
    setSelectedPlayer(player);
    playerCardRefs.current[player.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleCardClick = (player: PlayerFinderResult) => {
    setSelectedPlayer(player);
    setMapCenter([player.latitude, player.longitude]);
    setMapZoom(14);
    setTimeout(() => markerRefs.current[player.id]?.openPopup(), 150);
  };

  const handlePaymentSuccess = () => {
    dispatch(updateUser({ membership_status: 'basic' as any }));
    setAccessState('granted');
  };

  const handleContact = (player: PlayerFinderResult) => {
    dispatch(
      upsertConversation({
        partner_id: player.id,
        partner_name: player.full_name || 'Jugador',
        partner_type: 'player',
        partner_photo: player.profile_photo ?? null,
        last_message: '',
        last_message_at: new Date().toISOString(),
        last_message_is_mine: false,
        unread_count: 0,
      }),
    );
    dispatch(setActiveConversation(player.id));
    navigate('/players/dashboard/messages');
  };

  // ── Checking spinner ────────────────────────────────────────────────────────
  if (accessState === 'checking') {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-[#ace600] animate-spin" />
          <p className="text-white/50 text-sm">Verificando acceso…</p>
        </div>
      </div>
    );
  }

  // ── Locked screen ───────────────────────────────────────────────────────────
  if (accessState === 'locked') {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="w-24 h-24 rounded-full bg-[#ace600]/10 border border-[#ace600]/30 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-[#ace600]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#0d1117] border-2 border-white/[0.06] flex items-center justify-center">
                <Lock className="w-4 h-4 text-white/50" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Función bloqueada</h2>
              <p className="text-white/50 leading-relaxed">
                Desbloquea el buscador de jugadores por un pago único de ${FEATURE_PRICE} MXN y encuentra compañeros de juego cerca de ti.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Mapa interactivo', 'Filtros por nivel', 'Buscar por radio', 'Contacto directo'].map((f) => (
                <span key={f} className="text-xs px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/60">{f}</span>
              ))}
            </div>
            <Button
              className="w-full bg-[#ace600] text-black hover:bg-[#c0f000] font-bold py-6 text-base"
              onClick={() => setShowPayModal(true)}
            >
              <Zap className="w-5 h-5 mr-2" />
              Desbloquear por ${FEATURE_PRICE} MXN
            </Button>
            <p className="text-xs text-white/30">Pago único · Sin suscripción</p>
          </div>
        </div>
        <PaymentGateModal
          open={showPayModal}
          onClose={() => setShowPayModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      </>
    );
  }

  // ── Full feature ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[22px] font-bold text-white tracking-tight">Buscar Jugadores</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
              {filteredPlayers.length} resultado{filteredPlayers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-white/50">
            {userLocation ? (
              <span className="inline-flex items-center gap-1 text-green-400">
                <CheckCircle className="w-3 h-3" /> Ubicación detectada
              </span>
            ) : locationError ? (
              <span className="inline-flex items-center gap-1 text-yellow-400">
                <AlertCircle className="w-3 h-3" /> {locationError}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-blue-400">
                <Navigation2 className="w-3 h-3 animate-pulse" /> Detectando ubicación…
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold border transition-all',
            showFilters
              ? 'bg-[#ace600]/10 border-[#ace600]/30 text-[#ace600]'
              : 'bg-white/[0.04] border-white/[0.08] text-white/65 hover:text-white hover:bg-white/[0.07]',
          )}
        >
          <Filter className="w-3.5 h-3.5" /> Filtros
        </button>
      </div>

      {/* ── Search + Filter Panel ─────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4 space-y-3">
        {/* Name search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-9 bg-white/[0.04] border border-white/[0.09] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#ace600]/50 transition-colors"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/[0.05]">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">Radio de búsqueda</label>
              <Select value={selectedRadius} onValueChange={setSelectedRadius}>
                <SelectTrigger className="h-10 bg-white/[0.04] border-white/[0.09] text-white text-sm rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1117] border-white/[0.1]">
                  {RADIUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-white hover:bg-white/[0.05]">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">Nivel de habilidad</label>
              <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                <SelectTrigger className="h-10 bg-white/[0.04] border-white/[0.09] text-white text-sm rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1117] border-white/[0.1]">
                  {SKILL_LEVELS_FILTER.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-white hover:bg-white/[0.05]">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Color legend */}
        <div className="flex flex-wrap gap-4">
          {([['#3B82F6', '2.5–3.0'], ['#84CC16', '3.0–4.0'], ['#F59E0B', '4.0–5.0'], ['#EF4444', '5.0+']] as const).map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[11px] text-white/40">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Map + List Split ───────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col lg:flex-row" style={{ height: '620px' }}>

        {/* Left: Player List */}
        <div className="w-full lg:w-2/5 flex flex-col border-b lg:border-b-0 lg:border-r border-white/[0.07] max-h-[300px] lg:max-h-none">
          {/* list scroll area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader className="w-7 h-7 text-[#ace600] animate-spin" />
                <p className="text-white/40 text-sm">Buscando jugadores…</p>
              </div>
            )}

            {error && !loading && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {!loading && !error && filteredPlayers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Users className="w-10 h-10 text-white/[0.08]" />
                <p className="text-white/40 text-sm text-center">No se encontraron jugadores</p>
              </div>
            )}

            {!loading && filteredPlayers.map((player) => {
              const isSelected = selectedPlayer?.id === player.id;
              const color = getSkillColor(player.skill_level);
              return (
                <div
                  key={player.id}
                  ref={(el) => { playerCardRefs.current[player.id] = el; }}
                  onClick={() => handleCardClick(player)}
                  className={cn(
                    'group relative cursor-pointer rounded-xl border transition-all duration-200',
                    isSelected
                      ? 'border-[#ace600]/40 bg-[#ace600]/[0.05] shadow-lg shadow-[#ace600]/5'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]',
                  )}
                >
                  <div className="p-3 flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-white font-bold text-sm"
                        style={{ borderColor: color, backgroundColor: `${color}20` }}
                      >
                        {(player.full_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0d1117]"
                        style={{ backgroundColor: color }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate">
                        {player.full_name || '—'}
                      </p>
                      {(player.city || player.state) && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-white/30 shrink-0" />
                          <p className="text-xs text-white/40 truncate">
                            {player.city && player.state
                              ? `${player.city}, ${player.state}`
                              : player.state || player.city}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
                        >
                          {player.skill_level || 'N/A'}
                        </span>
                        <Badge variant="outline" className="text-xs border-white/[0.08] text-white/40 py-0 h-5">
                          {player.distance_km} km
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className={cn('w-2 h-2 rounded-full', player.membership_status === 'active' ? 'bg-green-400' : 'bg-white/[0.12]')} />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleContact(player); }}
                        className="w-7 h-7 rounded-lg bg-[#ace600]/10 border border-[#ace600]/30 flex items-center justify-center hover:bg-[#ace600]/20 transition-colors"
                        title="Enviar mensaje"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#ace600]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Leaflet Map */}
        <div className="flex-1 relative" style={{ isolation: 'isolate', minHeight: '300px' }}>
          <MapContainer
            center={MEXICO_CENTER}
            zoom={6}
            style={{ width: '100%', height: '100%', minHeight: '300px' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd"
              maxZoom={20}
            />
            <MapController center={mapCenter} zoom={mapZoom} />

            {userLocation && (
              <Marker
                position={[userLocation.latitude, userLocation.longitude]}
                icon={createUserIcon()}
              />
            )}

            {filteredPlayers.map((player) => {
              const color = getSkillColor(player.skill_level);
              const isSelected = selectedPlayer?.id === player.id;
              return (
                <Marker
                  key={player.id}
                  ref={(el: L.Marker | null) => { markerRefs.current[player.id] = el; }}
                  position={[player.latitude, player.longitude]}
                  icon={createPlayerIcon(color, isSelected)}
                  zIndexOffset={isSelected ? 1000 : 0}
                  eventHandlers={{ click: () => handleMarkerClick(player) }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '4px', minWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: `${color}20`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', color }}>
                          {(player.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                            {player.full_name}
                          </p>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                            <span style={{ padding: '1px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}>
                              {player.skill_level}
                            </span>
                            <span style={{ padding: '1px 8px', borderRadius: '99px', fontSize: '11px', color: '#64748b', border: '1px solid #e2e8f0' }}>
                              {player.distance_km} km
                            </span>
                          </div>
                        </div>
                      </div>
                      {(player.city || player.state) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>📍</span>
                          <span style={{ fontSize: '11px', color: '#334155' }}>
                            {player.city && player.state
                              ? `${player.city}, ${player.state}`
                              : player.state || player.city}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <button style={{ flex: 1, padding: '5px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', color: '#0f172a' }}>
                          Perfil
                        </button>
                        <button
                          style={{ flex: 1, padding: '5px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: 'none', backgroundColor: '#ace600', cursor: 'pointer', color: '#0f172a' }}
                          onClick={() => handleContact(player)}
                        >
                          Conectar
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Stats overlay */}
          <div className="absolute top-3 right-3 z-[1000] bg-[#0d1117]/90 backdrop-blur-sm border border-white/[0.1] rounded-xl px-3 py-2 flex items-center gap-2 pointer-events-none">
            <Users className="w-4 h-4 text-[#ace600]" />
            <span className="text-white text-sm font-bold">{filteredPlayers.length}</span>
            <span className="text-white/40 text-xs">cercanos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
