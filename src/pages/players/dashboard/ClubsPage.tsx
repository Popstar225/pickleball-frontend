import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { AppDispatch, RootState } from '@/store';
import { Club as APIClub } from '@/types/api';
import { Input } from '@/components/ui/input';
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
  if (!rating) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
      <span className="text-xs font-bold text-amber-400">{rating.toFixed(1)}</span>
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

  // Handle join club
  const handleJoinClub = useCallback(
    async (clubId: string) => {
      setJoiningClubId(clubId);
      try {
        await dispatch(joinClub(clubId)).unwrap();
      } catch (err) {
        console.error('Failed to join club:', err);
      } finally {
        setJoiningClubId(null);
      }
    },
    [dispatch],
  );

  // Handle leave club
  const handleLeaveClub = useCallback(
    async (clubId: string) => {
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
                  <div className="flex items-start gap-4">
                    <ClubLogo logo={club.logo} name={club.name} size="lg" />
                    <div>
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
                        <p className="text-xs text-white/35 mt-2 leading-relaxed max-w-md">
                          {club.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinClub(club.id)}
                    disabled={joiningClubId === club.id}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(172,230,0,0.15)] transition-all shrink-0"
                  >
                    {joiningClubId === club.id ? (
                      <>
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                        Uniéndose...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" /> Unirme al Club
                      </>
                    )}
                  </button>
                </div>

                {/* ── Details grid ────────────────────────────────────────── */}
                {(club.court_types || club.contact_phone || club.contact_email || club.website) && (
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
