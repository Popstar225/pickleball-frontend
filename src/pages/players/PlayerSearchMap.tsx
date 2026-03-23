import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  AlertCircle,
  Search,
  Loader,
  Trophy,
  Users,
  CheckCircle,
  Navigation2,
  Phone,
  Mail,
  Home,
  Lock,
  LogIn,
  Zap,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/payment/StripeProvider';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { searchNearbyPlayers, getCurrentLocation, type PlayerFinderResult } from '@/services/playerFinderService';
import PaymentService from '@/services/paymentService';
import { RootState } from '@/store';
import { updateUser } from '@/store/slices/authSlice';

const MEXICO_CENTER: [number, number] = [23.6345, -102.5528];
const FEATURE_PRICE = 200; // MXN one-time

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
    html: svg,
    className: '',
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
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// ─── Payment Gate Modal ───────────────────────────────────────────────────────

interface PaymentGateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function PaymentGateModal({ open, onClose, onSuccess }: PaymentGateModalProps) {
  const { t } = useTranslation();
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
      <DialogContent className="max-w-lg bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-primary" />
            {t('pages.playerSearchMap.paymentModal.title')}
          </DialogTitle>
          <DialogDescription className="text-slate-200">
            {t('pages.playerSearchMap.paymentModal.description')}
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
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
              <p className="font-semibold text-white">{t('pages.playerSearchMap.paymentModal.paymentLabel', { price: FEATURE_PRICE })}</p>
              <p className="text-sm text-slate-200">{t('pages.playerSearchMap.paymentModal.paymentSub')}</p>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
              <PaymentForm
                paymentId={paymentData.paymentId}
                clientSecret={paymentData.clientSecret}
                amount={FEATURE_PRICE * 100}
                currency="mxn"
                description={t('pages.playerSearchMap.paymentModal.paymentLabel', { price: FEATURE_PRICE })}
                onSuccess={handlePaymentSuccess}
                onError={(err) => { setError(err); setStep('info'); }}
              />
            </Elements>
            <Button onClick={() => setStep('info')} variant="outline" className="w-full border-slate-600 text-slate-300">
              {t('pages.playerSearchMap.paymentModal.back')}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Price card */}
            <div className="text-center p-6 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-4xl font-bold text-white">${FEATURE_PRICE}</span>
                <span className="text-slate-200">MXN</span>
              </div>
              <p className="text-sm text-primary font-semibold">{t('pages.playerSearchMap.paymentModal.priceSub')}</p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {[
                { icon: MapPin, text: t('pages.playerSearchMap.paymentModal.feature1') },
                { icon: Users,  text: t('pages.playerSearchMap.paymentModal.feature2') },
                { icon: Trophy, text: t('pages.playerSearchMap.paymentModal.feature3') },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
                  <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-slate-300">{text}</span>
                </div>
              ))}
            </div>

            <Button className="w-full bg-primary text-black hover:bg-primary/90 font-bold" size="lg" onClick={handlePay} disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('pages.playerSearchMap.paymentModal.processing')}</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" /> {t('pages.playerSearchMap.paymentModal.unlockButton', { price: FEATURE_PRICE })}</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Lock Gate (full-page overlay) ───────────────────────────────────────────

function LoginGate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Lock className="w-9 h-9 text-slate-200" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('pages.playerSearchMap.loginGate.title')}</h2>
          <p className="text-slate-200">{t('pages.playerSearchMap.loginGate.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="bg-primary text-black hover:bg-primary/90 font-bold" onClick={() => navigate('/login')}>
            <LogIn className="w-4 h-4 mr-2" /> {t('pages.playerSearchMap.loginGate.login')}
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => navigate('/register')}>
            {t('pages.playerSearchMap.loginGate.register')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PlayerSearchMap = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Feature access: 'checking' | 'locked' | 'granted'
  const [accessState, setAccessState] = useState<'checking' | 'locked' | 'granted'>('checking');
  const [showPayModal, setShowPayModal] = useState(false);

  const [players, setPlayers] = useState<PlayerFinderResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedRadius, setSelectedRadius] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerFinderResult | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(MEXICO_CENTER);
  const [mapZoom, setMapZoom] = useState(6);

  const playerListRef = useRef<HTMLDivElement>(null);
  const playerCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  // ── Access check ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setAccessState('checking'); // will render LoginGate below
      return;
    }
    // Users with active or premium membership have access; others must pay
    const status = user?.membership_status;
    if (status && ['active', 'basic', 'pro', 'premium'].includes(status)) {
      setAccessState('granted');
    } else {
      // Still attempt an API call — maybe they've paid for the feature without annual membership
      setAccessState('checking');
      searchNearbyPlayers({ latitude: MEXICO_CENTER[0], longitude: MEXICO_CENTER[1], radius_km: 1, limit: 1 })
        .then(() => setAccessState('granted'))
        .catch((err) => {
          const status = (err as any)?.response?.status ?? (err as any)?.status;
          if (status === 401 || status === 403) {
            setAccessState('locked');
          } else {
            // Unknown error — grant access and let the main fetch handle it
            setAccessState('granted');
          }
        });
    }
  }, [isAuthenticated, user?.membership_status]);

  // ── Location ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (accessState !== 'granted') return;
    getCurrentLocation()
      .then((coords) => {
        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setMapCenter([coords.latitude, coords.longitude]);
        setMapZoom(10);
      })
      .catch(() => {
        setLocationError('Acceso a ubicación denegado. Mostrando todos los jugadores en México.');
      });
  }, [accessState]);

  // ── Player fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (accessState !== 'granted') return;
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        const isAllMexico = selectedRadius === 'all' || !userLocation;
        const params = isAllMexico
          ? { latitude: MEXICO_CENTER[0], longitude: MEXICO_CENTER[1], radius_km: 5000, skill_level: selectedSkillLevel !== 'all' ? selectedSkillLevel : undefined, limit: 200 }
          : { latitude: userLocation!.latitude, longitude: userLocation!.longitude, radius_km: parseInt(selectedRadius), skill_level: selectedSkillLevel !== 'all' ? selectedSkillLevel : undefined, limit: 100 };
        const response = await searchNearbyPlayers(params);
        if (response.success) {
          setPlayers(response.data);
        } else {
          setError(response.message || 'Failed to fetch nearby players');
          setPlayers([]);
        }
      } catch (err: any) {
        const httpStatus = err?.response?.status ?? err?.status;
        if (httpStatus === 401 || httpStatus === 403) {
          setAccessState('locked');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load players');
          setPlayers([]);
        }
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchPlayers, 300);
    return () => clearTimeout(timer);
  }, [accessState, userLocation, selectedRadius, selectedSkillLevel]);

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
    // Optimistically mark the user as having access
    dispatch(updateUser({ membership_status: 'basic' as any }));
    setAccessState('granted');
  };

  // ── Gate screens ──────────────────────────────────────────────────────────
  if (!isAuthenticated) return <LoginGate />;

  if (accessState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-primary animate-spin" />
          <p className="text-slate-200 text-sm">{t('pages.playerSearchMap.checking')}</p>
        </div>
      </div>
    );
  }

  if (accessState === 'locked') {
    return (
      <>
        <div className="min-h-screen flex flex-col bg-slate-950 items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Icon */}
            <div className="relative mx-auto w-24 h-24">
              <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                <Lock className="w-4 h-4 text-slate-200" />
              </div>
            </div>

            {/* Text */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('pages.playerSearchMap.lockedScreen.title')}</h2>
              <p className="text-slate-200 leading-relaxed">
                {t('pages.playerSearchMap.lockedScreen.description', { price: FEATURE_PRICE })}
              </p>
            </div>

            {/* Feature preview chips */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                t('pages.playerSearchMap.lockedScreen.feature1'),
                t('pages.playerSearchMap.lockedScreen.feature2'),
                t('pages.playerSearchMap.lockedScreen.feature3'),
                t('pages.playerSearchMap.lockedScreen.feature4'),
              ].map((f) => (
                <span key={f} className="text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200">
                  {f}
                </span>
              ))}
            </div>

            <Button
              className="w-full bg-primary text-black hover:bg-primary/90 font-bold text-base py-6"
              onClick={() => setShowPayModal(true)}
            >
              <Zap className="w-5 h-5 mr-2" />
              {t('pages.playerSearchMap.lockedScreen.unlockButton', { price: FEATURE_PRICE })}
            </Button>

            <p className="text-xs text-slate-300">{t('pages.playerSearchMap.lockedScreen.paymentInfo')}</p>
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

  // ── Full feature ──────────────────────────────────────────────────────────
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
                <MapPin className="w-4 h-4" />
                {t('pages.playerSearchMap.label') || 'Player Finder'}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                {t('pages.playerSearchMap.title') || 'Find Nearby Players'}
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto mb-6">
                {t('pages.playerSearchMap.subtitle') || 'Discover fellow pickleball players on an interactive map.'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {userLocation ? (
                  <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-5 py-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300">{t('pages.playerSearchMap.locationDetected')}</span>
                  </div>
                ) : locationError ? (
                  <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-5 py-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-300">{locationError}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-5 py-2">
                    <Navigation2 className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-sm text-blue-300">{t('pages.playerSearchMap.detectingLocation')}</span>
                  </div>
                )}
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-5 py-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-semibold">{t('pages.playerSearchMap.playersFound', { count: players.length })}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map + List Split Layout */}
        <div className="flex flex-col lg:flex-row flex-1" style={{ minHeight: '650px' }}>
          {/* Left: Player List Panel */}
          <div className="w-full lg:w-2/5 flex flex-col bg-slate-900 border-r border-slate-700/50">
            {/* Filter Controls */}
            <div className="p-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-200 mb-1.5 block uppercase tracking-wide">
                    {t('pages.playerSearchMap.searchRadius')}
                  </label>
                  <Select value={selectedRadius} onValueChange={setSelectedRadius}>
                    <SelectTrigger className="h-10 bg-slate-800 border-slate-600 text-white text-sm rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all" className="text-white">{t('pages.playerSearchMap.allMexico')}</SelectItem>
                      <SelectItem value="25" className="text-white">25 km</SelectItem>
                      <SelectItem value="50" className="text-white">50 km</SelectItem>
                      <SelectItem value="100" className="text-white">100 km</SelectItem>
                      <SelectItem value="250" className="text-white">250 km</SelectItem>
                      <SelectItem value="500" className="text-white">500 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-200 mb-1.5 block uppercase tracking-wide">
                    {t('pages.playerSearchMap.skillLevel')}
                  </label>
                  <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                    <SelectTrigger className="h-10 bg-slate-800 border-slate-600 text-white text-sm rounded-lg">
                      <SelectValue placeholder={t('pages.playerSearchMap.allLevels')} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all" className="text-white">{t('pages.playerSearchMap.allLevels')}</SelectItem>
                      <SelectItem value="2.5" className="text-white">2.5</SelectItem>
                      <SelectItem value="3.0" className="text-white">3.0</SelectItem>
                      <SelectItem value="3.5" className="text-white">3.5</SelectItem>
                      <SelectItem value="4.0" className="text-white">4.0</SelectItem>
                      <SelectItem value="4.5" className="text-white">4.5</SelectItem>
                      <SelectItem value="5.0" className="text-white">5.0+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-3">
                {([['#3B82F6', '2.5–3.0'], ['#84CC16', '3.0–4.0'], ['#F59E0B', '4.0–5.0'], ['#EF4444', '5.0+']] as const).map(([color, label]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-slate-200">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Player List */}
            <div ref={playerListRef} className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader className="w-7 h-7 text-primary animate-spin" />
                  <p className="text-slate-200 text-sm">{t('pages.playerSearchMap.searching')}</p>
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

              {!loading && !error && players.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                    <Search className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-slate-200 font-semibold">{t('pages.playerSearchMap.noPlayers')}</p>
                  <p className="text-slate-300 text-sm">{t('pages.playerSearchMap.noPlayersHint')}</p>
                </div>
              )}

              {!loading && players.map((player) => (
                <div
                  key={player.id}
                  ref={(el) => { playerCardRefs.current[player.id] = el; }}
                  onClick={() => handleCardClick(player)}
                  className={`group cursor-pointer rounded-xl border transition-all duration-200 overflow-hidden ${
                    selectedPlayer?.id === player.id
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                      : 'border-slate-700/50 bg-slate-800/50 hover:border-primary/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="p-3 flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={player.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`}
                        alt={player.full_name}
                        onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`; }}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-slate-600 group-hover:border-primary/50 transition-colors"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800"
                        style={{ backgroundColor: getSkillColor(player.skill_level) }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate transition-colors ${
                        selectedPlayer?.id === player.id ? 'text-primary' : 'text-white group-hover:text-primary'
                      }`}>
                        {player.full_name}
                      </p>
                      {player.email && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-300 flex-shrink-0" />
                          <p className="text-xs text-slate-200 truncate">{player.email}</p>
                        </div>
                      )}
                      {player.phone && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-300 flex-shrink-0" />
                          <p className="text-xs text-slate-200 truncate">{player.phone}</p>
                        </div>
                      )}
                      {player.address && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Home className="w-3 h-3 text-slate-300 flex-shrink-0" />
                          <p className="text-xs text-slate-200 truncate">{player.address}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-300 flex-shrink-0" />
                        <p className="text-xs text-slate-200 truncate">
                          {player.city && player.state ? `${player.city}, ${player.state}` : player.state || t('pages.playerSearchMap.unknown')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{
                          backgroundColor: `${getSkillColor(player.skill_level)}20`,
                          color: getSkillColor(player.skill_level),
                          border: `1px solid ${getSkillColor(player.skill_level)}40`,
                        }}>
                          {player.skill_level || 'N/A'}
                        </span>
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-200 py-0 h-5">
                          {player.distance_km} km
                        </Badge>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      player.membership_status === 'active' ? 'bg-green-400' : 'bg-slate-500'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Leaflet Map */}
          <div className="w-full lg:w-3/5 relative" style={{ minHeight: '400px', isolation: 'isolate' }}>
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

              {userLocation && (
                <Marker
                  position={[userLocation.latitude, userLocation.longitude]}
                  icon={createUserIcon()}
                />
              )}

              {players.map((player) => {
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
                      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '4px', minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <img
                            src={player.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`}
                            alt={player.full_name}
                            onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.id}`; }}
                            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: `2px solid ${color}` }}
                          />
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', margin: 0 }}>{player.full_name}</p>
                            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>
                              {player.city && player.state ? `${player.city}, ${player.state}` : player.state || t('pages.playerSearchMap.unknown')}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}>
                            {t('pages.playerSearchMap.level')} {player.skill_level}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                            {t('pages.playerSearchMap.kmAway', { km: player.distance_km })}
                          </span>
                        </div>
                        {player.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>✉</span>
                            <span style={{ fontSize: '11px', color: '#334155' }}>{player.email}</span>
                          </div>
                        )}
                        {player.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>📞</span>
                            <span style={{ fontSize: '11px', color: '#334155' }}>{player.phone}</span>
                          </div>
                        )}
                        {player.address && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>📍</span>
                            <span style={{ fontSize: '11px', color: '#334155' }}>{player.address}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <button style={{ flex: 1, padding: '5px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', color: '#0f172a' }}>
                            {t('pages.playerSearchMap.profile')}
                          </button>
                          <button style={{ flex: 1, padding: '5px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: 'none', backgroundColor: '#84CC16', cursor: 'pointer', color: '#0f172a' }}>
                            {t('pages.playerSearchMap.connect')}
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Stats overlay */}
            <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 flex items-center gap-2 pointer-events-none">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-white text-sm font-bold">{players.length}</span>
              <span className="text-slate-200 text-xs">{t('pages.playerSearchMap.nearby')}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlayerSearchMap;
