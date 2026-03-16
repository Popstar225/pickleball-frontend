import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { AppDispatch, RootState } from '@/store';
import { Club as APIClub } from '@/types/api';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/payment/StripeProvider';
import PaymentService from '@/services/paymentService';
import ReservationFlow from '@/components/reservations/ReservationFlow';
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
  X,
  LogOut,
  UserPlus,
  ChevronRight,
  Wifi,
  Loader,
  CreditCard,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { cn, getImageUrl } from '@/lib/utils';
import { fetchClubs, fetchMyClubs, joinClub, leaveClub } from '@/store/slices/clubsSlice';
import { get } from 'http';
import { getFullImageUrl } from '@/common/tools';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Club extends APIClub {
  rating?: number;
  court_types?: string[] | Record<string, any>;
}

interface MyClub {
  id: string;
  name: string;
  location: string;
  members: number;
  joinedDate: string;
  status: string;
  logo?: string;
  rating: number;
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Initials({ name, size = 'md' }: { name?: string; size?: 'sm' | 'md' | 'lg' }) {
  const letters = (name || 'Club')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={cn(
        'rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center font-black text-[#ace600] shrink-0 select-none',
        size === 'sm'
          ? 'w-9 h-9 text-[11px]'
          : size === 'lg'
            ? 'w-12 h-12 text-sm rounded-2xl'
            : 'w-10 h-10 text-xs',
      )}
    >
      {letters}
    </div>
  );
}

function ClubLogo({
  logo,
  name,
  size = 'lg',
}: {
  logo?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [showFallback, setShowFallback] = useState(false);

  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  if (!logo || showFallback) {
    return <Initials name={name} size={size} />;
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-[#ace600]/20 flex items-center justify-center shrink-0 select-none overflow-hidden bg-white/5',
        sizeClasses[size],
      )}
    >
      <img
        src={getFullImageUrl(logo)}
        alt={name || 'Club'}
        className="w-full h-full object-cover"
        onError={() => setShowFallback(true)}
      />
    </div>
  );
}

function StarRating({ rating }: { rating?: number }) {
  const num = typeof rating === 'number' ? rating : parseFloat(rating as any);
  if (!num || isNaN(num)) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
      <span className="text-xs font-bold text-amber-400">{num.toFixed(1)}</span>
    </span>
  );
}

function MetaChip({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-white/30">
      <Icon className="w-3 h-3 text-white/20 shrink-0" />
      {children}
    </span>
  );
}

function FacilityTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.05] border border-white/[0.08] text-white/35">
      {label}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest">{children}</h2>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  loading,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 px-4 py-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-semibold border border-[#ace600]/20 bg-[#ace600]/5 text-[#ace600] hover:bg-[#ace600]/10 hover:border-[#ace600]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <span>← Anterior</span>
      </button>

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-white/40">Página</span>
        <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <span className="text-sm font-bold text-white/80">{currentPage}</span>
          <span className="text-xs text-white/30">/ {totalPages}</span>
        </div>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-semibold border border-[#ace600]/20 bg-[#ace600]/5 text-[#ace600] hover:bg-[#ace600]/10 hover:border-[#ace600]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <span>Siguiente →</span>
      </button>
    </div>
  );
}

const inputCls = cn(
  'h-10 rounded-xl text-sm',
  'bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20',
  'focus-visible:ring-0 focus-visible:border-[#ace600]/50 focus-visible:bg-[#ace600]/[0.03]',
  'transition-all',
);

const CLUB_TYPE_LABEL: Record<string, string> = {
  recreational: 'Recreativo',
  competitive: 'Competitivo',
  training: 'Entrenamiento',
  mixed: 'Mixto',
};

// ─── Club Detail Dialog ────────────────────────────────────────────────────────
function ClubDetailDialog({
  club,
  isJoined,
  onClose,
  onJoin,
}: {
  club: Club;
  isJoined: boolean;
  onClose: () => void;
  onJoin: (club: Club) => void;
}) {
  const courtTypesArray: string[] = Array.isArray(club.court_types)
    ? club.court_types
    : club.court_types && typeof club.court_types === 'object'
      ? Object.values(club.court_types as Record<string, string>)
      : [];

  const offerings = [
    club.offers_training && 'Entrenamiento',
    club.offers_tournaments && 'Torneos',
    club.offers_equipment && 'Equipamiento',
  ].filter(Boolean) as string[];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0d1117] border border-white/[0.07] text-white p-0 max-w-xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ── Header ── */}
        <div className="relative flex-shrink-0">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-br from-[#ace600]/10 to-[#ace600]/5 border-b border-white/[0.06]" />
          {/* Logo */}
          <div className="absolute left-6 -bottom-5">
            <ClubLogo logo={club.logo} name={club.name} size="lg" />
          </div>
          {/* Badges top-right */}
          <div className="absolute top-3 right-4 flex items-center gap-2">
            {club.is_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                ✓ Verificado
              </span>
            )}
            {club.subscription_plan === 'premium' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600]">
                Premium
              </span>
            )}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-6 pt-8 pb-6 space-y-5">
          {/* Name + type + rating */}
          <div>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">{club.name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                    {CLUB_TYPE_LABEL[club.club_type] ?? club.club_type}
                  </span>
                  {club.rating !== undefined && <StarRating rating={club.rating} />}
                  <MetaChip icon={MapPin}>
                    {club.city}, {club.state}
                  </MetaChip>
                </div>
              </div>
              {club.membership_fee !== undefined && (
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Membresía</p>
                  <p className="text-xl font-black text-[#ace600] leading-tight">
                    ${club.membership_fee.toLocaleString()}
                    <span className="text-xs font-normal text-white/30 ml-1">MXN</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Miembros', value: `${club.member_count}${club.max_members ? `/${club.max_members}` : ''}` },
              { label: 'Canchas', value: club.court_count || '—' },
              { label: 'Torneos', value: club.total_tournaments ?? '—' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center"
              >
                <p className="text-base font-black text-white">{value}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {club.description && (
            <p className="text-xs text-white/45 leading-relaxed">{club.description}</p>
          )}

          {/* Offerings */}
          {offerings.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2">
                Servicios
              </p>
              <div className="flex flex-wrap gap-1.5">
                {offerings.map((o) => (
                  <span
                    key={o}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ace600]/8 border border-[#ace600]/20 text-[#ace600]/70"
                  >
                    {o}
                  </span>
                ))}
                {courtTypesArray.map((t, i) => (
                  <FacilityTag key={i} label={t} />
                ))}
              </div>
            </div>
          )}

          {/* Info grid: contact + extra */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact */}
            {(club.contact_email || club.contact_phone || club.contact_whatsapp || club.website) && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                  Contacto
                </p>
                {club.contact_email && (
                  <a
                    href={`mailto:${club.contact_email}`}
                    className="flex items-center gap-2 text-[11px] text-white/35 hover:text-white/60 transition-colors truncate"
                  >
                    <Mail className="w-3 h-3 shrink-0 text-white/15" />
                    {club.contact_email}
                  </a>
                )}
                {club.contact_phone && (
                  <a
                    href={`tel:${club.contact_phone}`}
                    className="flex items-center gap-2 text-[11px] text-white/35 hover:text-white/60 transition-colors"
                  >
                    <Phone className="w-3 h-3 shrink-0 text-white/15" />
                    {club.contact_phone}
                  </a>
                )}
                {club.website && (
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[11px] text-[#ace600]/50 hover:text-[#ace600] transition-colors"
                  >
                    <Globe className="w-3 h-3 shrink-0" />
                    Sitio web
                  </a>
                )}
              </div>
            )}

            {/* Extra */}
            <div className="space-y-2">
              {club.address && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                    Dirección
                  </p>
                  <p className="text-[11px] text-white/35 leading-relaxed">{club.address}</p>
                </>
              )}
              {club.founded_date && (
                <p className="text-[11px] text-white/25">
                  Fundado:{' '}
                  {new Date(club.founded_date).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              )}
              {club.court_rental_fee !== undefined && (
                <p className="text-[11px] text-white/30">
                  Renta de cancha:{' '}
                  <span className="text-white/50 font-semibold">
                    ${club.court_rental_fee.toLocaleString()} MXN/hr
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Rules / dress code */}
          {(club.club_rules || club.dress_code) && (
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-3">
              {club.club_rules && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1.5">
                    Reglamento
                  </p>
                  <p className="text-xs text-white/35 leading-relaxed">{club.club_rules}</p>
                </div>
              )}
              {club.dress_code && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1.5">
                    Código de vestimenta
                  </p>
                  <p className="text-xs text-white/35">{club.dress_code}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.06] bg-[#0a0e14] flex-shrink-0">
          <button
            onClick={onClose}
            className="text-sm text-white/30 hover:text-white/55 transition-colors"
          >
            Cerrar
          </button>
          {!isJoined && (
            <button
              onClick={() => {
                onClose();
                onJoin(club);
              }}
              className="inline-flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] active:scale-[0.98] text-black text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-150 shadow-[0_0_18px_rgba(172,230,0,0.2)] hover:shadow-[0_0_28px_rgba(172,230,0,0.35)]"
            >
              <UserPlus className="w-4 h-4" />
              Unirme al Club
            </button>
          )}
          {isJoined && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600]">
              ✓ Ya eres miembro
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Club Join Payment Form ────────────────────────────────────────────────────
function ClubJoinPaymentForm({
  paymentId,
  amount,
  onSuccess,
  onBack,
}: {
  paymentId: string;
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);
    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });
      if (stripeError) {
        setError(stripeError.message || 'Pago fallido');
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        await PaymentService.confirmPayment(paymentId, { payment_intent_id: paymentIntent.id });
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Pago fallido');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-semibold text-white/40 mb-3">Detalles de Pago</p>
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && (
        <div className="flex gap-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-red-400">{error}</p>
        </div>
      )}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          disabled={processing}
          className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/55 transition-colors disabled:opacity-40"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Regresar
        </button>
        <button
          onClick={handlePay}
          disabled={processing || !stripe || !elements}
          className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] active:scale-[0.98] text-black text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-150 disabled:opacity-50 shadow-[0_0_18px_rgba(172,230,0,0.2)] hover:shadow-[0_0_28px_rgba(172,230,0,0.35)]"
        >
          <div className={`w-3.5 h-3.5 border-2 border-black/25 border-t-black rounded-full animate-spin ${processing ? '' : 'hidden'}`} />
          <CreditCard className={`w-4 h-4 ${processing ? 'hidden' : ''}`} />
          Pagar ${amount.toLocaleString()} MXN
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PlayerClubsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { clubs, myClubs, loading, error, joinError, pagination } = useSelector(
    (state: RootState) => state.clubs,
  );

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [joiningClubId, setJoiningClubId] = useState<string | null>(null);
  const [leavingClubId, setLeavingClubId] = useState<string | null>(null);
  const [detailClub, setDetailClub] = useState<Club | null>(null);
  const [joinPaymentClub, setJoinPaymentClub] = useState<Club | null>(null);
  const [joinPaymentInfo, setJoinPaymentInfo] = useState<{ payment_id: string; client_secret: string; amount: number } | null>(null);
  const [joinPaymentLoading, setJoinPaymentLoading] = useState(false);
  const [showReservationFlow, setShowReservationFlow] = useState(false);
  const [selectedClubForReservation, setSelectedClubForReservation] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const LIMIT = 10; // Items per page

  // Fetch clubs and user's clubs on mount
  useEffect(() => {
    dispatch(fetchMyClubs());
  }, [dispatch]);

  // Fetch clubs with filters and pagination
  useEffect(() => {
    const params: any = { page, limit: LIMIT };
    if (search) params.search = search;
    if (location) params.location = location;
    dispatch(fetchClubs(params));
  }, [search, location, page, dispatch]);

  // Reset to page 1 when search or location changes
  useEffect(() => {
    setPage(1);
  }, [search, location]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Show error toast when join error occurs
  useEffect(() => {
    if (joinError) {
      toast.error(joinError);
    }
  }, [joinError]);

  // Filter available clubs (exclude already joined clubs)
  const myClubIds = myClubs.map((c) => c.id);
  const availableClubs = clubs.filter((club) => !myClubIds.includes(club.id)) as Club[];

  // Handle join club — open payment dialog first
  const handleJoinClub = useCallback(
    async (club: Club) => {
      setJoinPaymentClub(club);
      setJoinPaymentLoading(true);
      try {
        const feeInCents = Math.round((club.membership_fee || 200) * 100);
        const res = await PaymentService.createPaymentIntent({
          amount: feeInCents,
          payment_type: 'membership_fee',
          currency: 'mxn',
          club_id: club.id,
          description: `Membresía - ${club.name}`,
        });
        setJoinPaymentInfo({
          payment_id: res.data.payment_id,
          client_secret: res.data.client_secret,
          amount: res.data.amount / 100,
        });
      } catch (err: any) {
        toast.error(err.message || 'Error al iniciar el pago');
        setJoinPaymentClub(null);
      } finally {
        setJoinPaymentLoading(false);
      }
    },
    [],
  );

  // Handle leave club
  const handleLeaveClub = useCallback(
    async (clubId: string) => {
      if (!clubId) return;
      setLeavingClubId(clubId);
      try {
        await dispatch(leaveClub(clubId)).unwrap();
      } catch (err) {
        console.error('Failed to leave club:', err);
      } finally {
        setLeavingClubId(null);
      }
    },
    [dispatch],
  );

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Buscar Clubes</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
            {myClubs.length} unidos
          </span>
        </div>
        <p className="text-xs text-white/25">
          Encuentra y únete a clubes de pickleball cerca de ti
        </p>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
            <Input
              className={cn(inputCls, 'pl-10 pr-9')}
              placeholder="Buscar clubes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
            <Input
              className={cn(inputCls, 'pl-10 pr-9')}
              placeholder="Filtrar por ubicación…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            {location && (
              <button
                onClick={() => setLocation('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── My clubs ────────────────────────────────────────────────────────── */}
      <div>
        <SectionHeading>Mis Clubes</SectionHeading>
        {myClubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white/10" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white/35 mb-1">
                No te has unido a ningún club
              </p>
              <p className="text-xs text-white/20 leading-relaxed max-w-[220px]">
                Explora y únete a clubes de pickleball debajo
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myClubs.map((club) => (
              <div
                key={club.id}
                className="group bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4 hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <ClubLogo logo={club.logo} name={club.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors truncate">
                        {club.name || 'Unknown Club'}
                      </p>
                      {club.rating && <StarRating rating={club.rating} />}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                      {club.location && <MetaChip icon={MapPin}>{club.location}</MetaChip>}
                      {club.members !== undefined && (
                        <MetaChip icon={Users}>{club.members} miembros</MetaChip>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-white/20">
                        {club.joinedDate
                          ? `Miembro desde ${new Date(club.joinedDate).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}`
                          : 'Miembro'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedClubForReservation({
                              id: club.id,
                              name: club.name || 'Club',
                            });
                            setShowReservationFlow(true);
                          }}
                          className="inline-flex items-center gap-1 h-6 px-2.5 rounded-lg text-[11px] font-bold border border-[#ace600]/20 bg-[#ace600]/[0.06] text-[#ace600] hover:bg-[#ace600]/[0.12] transition-all"
                        >
                          <Calendar className="w-3 h-3" /> Reservar
                        </button>
                        <button
                          onClick={() => handleLeaveClub(club.id)}
                          disabled={leavingClubId === club.id}
                          className="inline-flex items-center gap-1 h-6 px-2.5 rounded-lg text-[11px] font-bold border border-red-500/20 bg-red-500/[0.06] text-red-400 hover:bg-red-500/[0.12] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {leavingClubId === club.id ? (
                            <>
                              <Loader className="w-3 h-3 animate-spin" />
                              Saliendo...
                            </>
                          ) : (
                            <>
                              <LogOut className="w-3 h-3" /> Abandonar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Available clubs ──────────────────────────────────────────────────── */}
      <div>
        <SectionHeading>Clubes Disponibles</SectionHeading>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
            <Loader className="w-6 h-6 text-[#ace600] animate-spin" />
            <p className="text-sm text-white/35">Cargando clubes...</p>
          </div>
        )}

        {!loading && availableClubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white/10" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white/35 mb-1">No se encontraron clubes</p>
              <p className="text-xs text-white/20 leading-relaxed max-w-[200px]">
                Intenta ajustar tus criterios de búsqueda
              </p>
            </div>
            {(search || location) && (
              <button
                onClick={() => {
                  setSearch('');
                  setLocation('');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#ace600]/60 hover:text-[#ace600] transition-colors"
              >
                <X className="w-3 h-3" /> Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {availableClubs.map((club) => (
              <div
                key={club.id}
                className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all"
              >
                {/* ── Club header ─────────────────────────────────────────── */}
                <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
                  <div
                    className="flex items-start gap-4 flex-1 min-w-0 cursor-pointer"
                    onClick={() => setDetailClub(club)}
                  >
                    <ClubLogo logo={club.logo} name={club.name} size="lg" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h3 className="text-sm font-bold text-white/85">{club.name}</h3>
                        <StarRating rating={club.rating} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <MetaChip icon={MapPin}>
                          {club.city}, {club.state}
                        </MetaChip>
                        <MetaChip icon={Users}>{club.member_count || 0} miembros</MetaChip>
                      </div>
                      {club.description && (
                        <p className="text-xs text-white/35 mt-2 leading-relaxed max-w-md line-clamp-2">
                          {club.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setDetailClub(club)}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold border border-white/[0.10] bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white transition-all shrink-0"
                  >
                    Ver Club <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* ── Membership fee preview ──────────────────────────────── */}
                {club.membership_fee !== undefined && (
                  <div className="border-t border-white/[0.05] px-5 py-3 flex items-center justify-between">
                    <span className="text-[11px] text-white/30">Cuota de membresía</span>
                    <span className="text-sm font-bold text-[#ace600]">
                      ${club.membership_fee.toLocaleString()} MXN
                    </span>
                  </div>
                )}

                {/* ── Details grid (REMOVED — see detail dialog) */}
                {false && (club.court_types || club.contact_phone || club.contact_email || club.website) && (
                  <div className="border-t border-white/[0.05] px-5 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Facilities */}
                      {club.court_types && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2.5">
                            Instalaciones
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.isArray(club.court_types) ? (
                              club.court_types.map((f, i) => <FacilityTag key={i} label={f} />)
                            ) : (
                              <FacilityTag label="Canchas disponibles" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact */}
                      {(club.contact_phone || club.contact_email || club.website) && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2.5">
                            Contacto
                          </p>
                          {club.contact_phone && (
                            <a
                              href={`tel:${club.contact_phone}`}
                              className="flex items-center gap-2 text-[11px] text-white/30 hover:text-white/60 transition-colors"
                            >
                              <Phone className="w-3 h-3 shrink-0 text-white/15" />
                              {club.contact_phone}
                            </a>
                          )}
                          {club.contact_email && (
                            <a
                              href={`mailto:${club.contact_email}`}
                              className="flex items-center gap-2 text-[11px] text-white/30 hover:text-white/60 transition-colors truncate"
                            >
                              <Mail className="w-3 h-3 shrink-0 text-white/15" />
                              {club.contact_email}
                            </a>
                          )}
                          {club.website && (
                            <a
                              href={club.website}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 text-[11px] text-[#ace600]/50 hover:text-[#ace600] transition-colors"
                            >
                              <Globe className="w-3 h-3 shrink-0" />
                              Sitio web
                            </a>
                          )}
                        </div>
                      )}

                      {/* Court info */}
                      {club.court_count && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2.5">
                            Instalaciones
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-white/35">
                            <Wifi className="w-3 h-3 text-white/15" />
                            {club.court_count} canchas
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination Controls ──────────────────────────────────────── */}
        {!loading && pagination && availableClubs.length > 0 && (
          <PaginationControls
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={setPage}
            loading={loading}
          />
        )}
      </div>

      {/* ── Club Detail Dialog ───────────────────────────────────────────── */}
      {detailClub && (
        <ClubDetailDialog
          club={detailClub}
          isJoined={myClubs.some((c) => c.id === detailClub.id)}
          onClose={() => setDetailClub(null)}
          onJoin={handleJoinClub}
        />
      )}

      {/* ── Club Join Payment Dialog ─────────────────────────────────────── */}
      <Dialog
        open={!!joinPaymentClub}
        onOpenChange={(open) => {
          if (!open) {
            setJoinPaymentClub(null);
            setJoinPaymentInfo(null);
          }
        }}
      >
        <DialogContent className="bg-[#0d1117] border border-white/[0.07] text-white p-0 max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-7 pt-6 pb-5 border-b border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-[#ace600]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">Unirse al Club</h2>
                <p className="text-[11px] text-white/30 mt-0.5">Completa el pago para unirte</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-7 py-6 space-y-5">
            {/* Club summary */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Resumen</p>
              <div className="flex items-center gap-3">
                <ClubLogo logo={joinPaymentClub?.logo} name={joinPaymentClub?.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{joinPaymentClub?.name}</p>
                  <p className="text-[11px] text-white/35">
                    {joinPaymentClub?.city}, {joinPaymentClub?.state}
                  </p>
                </div>
              </div>
              {joinPaymentInfo && (
                <div className="flex justify-between items-baseline pt-2 border-t border-white/[0.06]">
                  <span className="text-[11px] text-white/35">Cuota de membresía</span>
                  <span className="font-bold text-[#ace600] text-xl">
                    ${joinPaymentInfo.amount.toLocaleString()}{' '}
                    <span className="text-sm font-normal text-white/30">MXN</span>
                  </span>
                </div>
              )}
            </div>

            {/* Loading or Stripe form */}
            {joinPaymentLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-[#ace600] animate-spin" />
              </div>
            ) : joinPaymentInfo ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: joinPaymentInfo.client_secret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#ace600',
                      colorBackground: '#161c25',
                      colorText: '#ffffff',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <ClubJoinPaymentForm
                  paymentId={joinPaymentInfo.payment_id}
                  amount={joinPaymentInfo.amount}
                  onSuccess={async () => {
                    const club = joinPaymentClub;
                    setJoinPaymentClub(null);
                    setJoinPaymentInfo(null);
                    if (club) {
                      setJoiningClubId(club.id);
                      try {
                        await dispatch(joinClub(club.id)).unwrap();
                        toast.success(`Te uniste a ${club.name}`);
                      } catch (err) {
                        console.error('Failed to join club after payment:', err);
                      } finally {
                        setJoiningClubId(null);
                      }
                    }
                  }}
                  onBack={() => {
                    setJoinPaymentClub(null);
                    setJoinPaymentInfo(null);
                  }}
                />
              </Elements>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Reservation Flow Modal ──────────────────────────────────────── */}
      {showReservationFlow && selectedClubForReservation && (
        <ReservationFlow
          clubId={selectedClubForReservation.id}
          clubName={selectedClubForReservation.name}
          onClose={() => {
            setShowReservationFlow(false);
            setSelectedClubForReservation(null);
          }}
        />
      )}
    </div>
  );
}
