import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCourts, deleteCourt, fetchCourtsByVenue } from '@/store/slices/courtsSlice';
import { fetchVenuesByClub } from '@/store/slices/venuesSlice';
import { fetchClubProfile } from '@/store/slices/clubDashboardSlice';
import type { Court } from '../../../types/api';
import CourtActionModal from './ActionModals/CourtActionModal';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle, Plus, Trash2, Edit2, Eye,
  ChevronLeft, ChevronRight, Loader2, LayoutGrid,
  ArrowLeft, Star, DollarSign, Users, Wrench, Search, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import CourtDetailModal from '@/components/courts/CourtDetailModal';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const selTrigger = 'h-9 bg-white/[0.04] border-white/[0.08] text-white/60 text-sm focus:border-[#ace600]/30 focus:ring-0 rounded-xl';
const selContent = 'bg-[#0d1117] border-white/[0.09] rounded-xl shadow-2xl';
const selItem    = 'text-white/60 focus:bg-white/[0.06] focus:text-white rounded-lg';

const COURT_TYPE_LABEL: Record<string, string> = {
  indoor: 'Cubierta', outdoor: 'Abierta', covered: 'Techada',
};
const SURFACE_LABEL: Record<string, string> = {
  concrete: 'Concreto', asphalt: 'Asfalto', synthetic: 'Sintético',
  grass: 'Pasto', clay: 'Arcilla',
};
const TYPE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  indoor:  { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  outdoor: { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400'  },
  covered: { bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    text: 'text-sky-400'    },
};
const SURFACE_DOT: Record<string, string> = {
  concrete: 'bg-slate-400', asphalt: 'bg-slate-500', synthetic: 'bg-sky-400',
  grass: 'bg-emerald-400', clay: 'bg-orange-400',
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
function TypePill({ type }: { type?: string }) {
  const s = TYPE_STYLES[type ?? ''] ?? { bg: 'bg-white/[0.04]', border: 'border-white/[0.08]', text: 'text-white/25' };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest', s.bg, s.border, s.text)}>
      {COURT_TYPE_LABEL[type ?? ''] ?? type ?? '—'}
    </span>
  );
}

function SurfaceDot({ surface }: { surface?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-white/35 font-medium">
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', SURFACE_DOT[surface ?? ''] ?? 'bg-white/20')} />
      {SURFACE_LABEL[surface ?? ''] ?? surface ?? '—'}
    </span>
  );
}

function AvailPill({ available, maintenance }: { available: boolean; maintenance?: boolean }) {
  if (maintenance) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Mantenimiento
    </span>
  );
  return available ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Disponible
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-white/[0.04] border-white/[0.08] text-white/25 text-[10px] font-black uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-white/20" /> No disponible
    </span>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3.5 hover:border-white/[0.12] transition-colors">
      <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">{label}</p>
      <p className={cn('text-2xl font-black leading-none', accent ?? 'text-white')}>{value}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClubsCourtManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { courts, loading, error } = useSelector((state: RootState) => state.courts);
  const { venues }  = useSelector((state: RootState) => state.venues);
  const { profile } = useSelector((state: RootState) => state.clubDashboard);

  const venueId     = searchParams.get('venueId');
  const currentVenue = venueId ? venues.find(v => v.id === venueId) : null;

  const [selectedCourt,  setSelectedCourt]  = useState<Court | null>(null);
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [detailCourt,    setDetailCourt]    = useState<Court | null>(null);
  const [isDetailOpen,   setIsDetailOpen]   = useState(false);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterType,     setFilterType]     = useState('');
  const [filterSurface,  setFilterSurface]  = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [isLoadingVenue, setIsLoadingVenue] = useState(false);
  const itemsPerPage = 9;

  useEffect(() => {
    if (!profile?.id) dispatch(fetchClubProfile());
  }, [profile?.id, dispatch]);

  useEffect(() => {
    if (venueId && profile?.id && !venues.some(v => v.id === venueId)) {
      setIsLoadingVenue(true);
      dispatch(fetchVenuesByClub({ clubId: profile.id, page: 1, limit: 100 }))
        .finally(() => setIsLoadingVenue(false));
    }
  }, [venueId, profile?.id, venues.length, dispatch]);

  useEffect(() => {
    if (venueId) {
      dispatch(fetchCourtsByVenue(venueId) as any);
    } else {
      dispatch(fetchCourts({
        search: searchTerm || undefined,
        court_type: (filterType || undefined) as any,
        surface: (filterSurface || undefined) as any,
        page: currentPage,
        limit: itemsPerPage,
      }) as any);
    }
  }, [dispatch, venueId, currentPage, searchTerm, filterType, filterSurface]);

  const handleViewCourt   = (c: Court) => { setDetailCourt(c); setIsDetailOpen(true); };
  const handleEditCourt   = (c: Court) => { setSelectedCourt(c); setIsModalOpen(true); };
  const handleCreateCourt = ()          => { setSelectedCourt(null); setIsModalOpen(true); };
  const handleCloseModal  = ()          => { setIsModalOpen(false); setSelectedCourt(null); };

  const handleSaveSuccess = () => {
    handleCloseModal();
    venueId
      ? dispatch(fetchCourtsByVenue(venueId) as any)
      : dispatch(fetchCourts({ search: searchTerm || undefined, court_type: filterType as any, surface: filterSurface as any, page: currentPage, limit: itemsPerPage }) as any);
  };

  const handleDelete = async (courtId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta cancha?')) return;
    try {
      await dispatch(deleteCourt(courtId));
      toast.success('Cancha eliminada exitosamente');
      venueId
        ? dispatch(fetchCourtsByVenue(venueId) as any)
        : dispatch(fetchCourts({ page: currentPage, limit: itemsPerPage }) as any);
    } catch {
      toast.error('Error al eliminar la cancha');
    }
  };

  const displayCourts  = Array.isArray(courts) ? courts : [];
  const totalPages     = Math.ceil(displayCourts.length / itemsPerPage);
  const displayedCourts = displayCourts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const availCount     = displayCourts.filter(c => c.is_available).length;
  const maintCount     = displayCourts.filter(c => c.is_maintenance).length;
  const avgRating      = displayCourts.length > 0
    ? (displayCourts.reduce((s, c) => s + (typeof c.average_rating === 'number' ? c.average_rating : 0), 0) / displayCourts.length).toFixed(1)
    : '—';
  const hasFilters = !!(searchTerm || filterType || filterSurface);

  return (
    <div className="space-y-5">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
        <div>
          {venueId && (
            <button onClick={() => navigate('/clubs/dashboard/venues')}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/25 hover:text-[#ace600] transition-colors mb-2">
              <ArrowLeft className="w-3 h-3" /> Volver a Negocios
            </button>
          )}
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[22px] font-black text-white tracking-tight">
              {currentVenue ? `Canchas — ${currentVenue.name}` : 'Gestión de Canchas'}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <LayoutGrid className="w-2.5 h-2.5" />
              {displayCourts.length}
            </span>
          </div>
          <p className="text-xs text-white/25">
            {currentVenue
              ? `Administra las canchas de ${currentVenue.name}`
              : 'Administra las canchas de pickleball de tu club'}
          </p>
        </div>

        <button onClick={handleCreateCourt}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-black bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_16px_rgba(172,230,0,0.18)] hover:shadow-[0_0_24px_rgba(172,230,0,0.30)] transition-all">
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          Nueva Cancha
        </button>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/20 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-0.5">Error</p>
            <p className="text-xs text-red-400/70">{error}</p>
          </div>
        </div>
      )}

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Total"           value={displayCourts.length} accent="text-[#ace600]" />
        <StatCard label="Disponibles"     value={availCount}           accent="text-emerald-400" />
        <StatCard label="Mantenimiento"   value={maintCount}           accent="text-amber-400" />
        <StatCard label="Rating Promedio" value={avgRating}            accent="text-sky-400" />
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
          <input
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar canchas por nombre…"
            className="w-full pl-9 pr-8 h-9 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/80 text-sm placeholder:text-white/20 outline-none focus:border-[#ace600]/30 transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Select value={filterType || 'all'} onValueChange={v => { setFilterType(v === 'all' ? '' : v); setCurrentPage(1); }}>
          <SelectTrigger className={cn(selTrigger, 'sm:w-40')}><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent className={selContent}>
            <SelectItem value="all" className={selItem}>Todos los tipos</SelectItem>
            <SelectItem value="indoor"   className={selItem}>Cubierta</SelectItem>
            <SelectItem value="outdoor"  className={selItem}>Abierta</SelectItem>
            <SelectItem value="covered"  className={selItem}>Techada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSurface || 'all'} onValueChange={v => { setFilterSurface(v === 'all' ? '' : v); setCurrentPage(1); }}>
          <SelectTrigger className={cn(selTrigger, 'sm:w-44')}><SelectValue placeholder="Superficie" /></SelectTrigger>
          <SelectContent className={selContent}>
            <SelectItem value="all"       className={selItem}>Todas las superficies</SelectItem>
            <SelectItem value="concrete"  className={selItem}>Concreto</SelectItem>
            <SelectItem value="asphalt"   className={selItem}>Asfalto</SelectItem>
            <SelectItem value="synthetic" className={selItem}>Sintético</SelectItem>
            <SelectItem value="grass"     className={selItem}>Pasto</SelectItem>
            <SelectItem value="clay"      className={selItem}>Arcilla</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <button onClick={() => { setSearchTerm(''); setFilterType(''); setFilterSurface(''); setCurrentPage(1); }}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/35 hover:text-white text-xs font-bold transition-all">
            <X className="w-3.5 h-3.5" /> Limpiar
          </button>
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      {loading || isLoadingVenue ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
          <p className="text-xs text-white/20">
            {isLoadingVenue ? `Cargando información del negocio…` : 'Cargando canchas…'}
          </p>
        </div>

      ) : displayedCourts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-white/[0.07] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-white/10" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white/25 mb-1">
              {venueId ? `No hay canchas para ${currentVenue?.name ?? 'este negocio'}` : 'No hay canchas disponibles'}
            </p>
            <p className="text-xs text-white/15">
              {venueId ? 'Esta locación aún no tiene canchas registradas' : 'Crea tu primera cancha para comenzar'}
            </p>
          </div>
          <button onClick={handleCreateCourt}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-black bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.15)] transition-all">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            {venueId ? 'Agregar Cancha' : 'Nueva Cancha'}
          </button>
        </div>

      ) : (
        <>
          {/* ── Court cards grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedCourts.map(court => (
              <div key={court.id}
                className="group bg-[#0d1117] border border-white/[0.07] hover:border-white/[0.14] rounded-2xl overflow-hidden transition-all duration-200">
                {/* accent bar */}
                <div className={cn('h-0.5 bg-gradient-to-r via-transparent to-transparent',
                  court.is_maintenance ? 'from-amber-400/40' :
                  court.is_available  ? 'from-[#ace600]/35' : 'from-red-400/30'
                )} />

                <div className="p-5">
                  {/* Name + actions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-white/85 text-sm leading-tight truncate group-hover:text-white transition-colors mb-1.5">
                        {court.name}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <TypePill type={court.court_type} />
                        <SurfaceDot surface={(court as any).surface ?? (court as any).surface_type} />
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">

                      <button onClick={() => handleEditCourt(court)} title="Editar"
                        className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-white/25 hover:text-white flex items-center justify-center transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(court.id)} title="Eliminar"
                        className="w-7 h-7 rounded-lg border border-red-500/15 bg-red-500/[0.04] hover:bg-red-500/[0.10] text-red-400/40 hover:text-red-400 flex items-center justify-center transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {court.description && (
                    <p className="text-[11px] text-white/25 leading-relaxed line-clamp-2 mb-3">{court.description}</p>
                  )}

                  {/* Mini stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1 mb-0.5">
                        <DollarSign className="w-2.5 h-2.5 text-white/15" />
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Tarifa/hr</span>
                      </div>
                      <p className="text-xs font-black text-white/70">
                        {(court as any).hourly_rate ? `$${(court as any).hourly_rate}` : '—'}
                      </p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Users className="w-2.5 h-2.5 text-white/15" />
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Capacidad</span>
                      </div>
                      <p className="text-xs font-black text-white/70">
                        {(court as any).capacity ? `${(court as any).capacity} pers.` : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Status pills */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/[0.04]">
                    <AvailPill available={!!court.is_available} maintenance={!!court.is_maintenance} />
                    {court.average_rating && typeof court.average_rating === 'number' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-amber-400/10 border-amber-400/20 text-amber-400 text-[10px] font-black">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {court.average_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-white/20 font-semibold">
                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, displayCourts.length)} de {displayCourts.length} canchas
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/30 hover:text-white flex items-center justify-center disabled:opacity-25 transition-all">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={cn('w-7 h-7 rounded-lg text-xs font-black transition-all',
                      page === currentPage
                        ? 'bg-[#ace600] text-black shadow-[0_0_10px_rgba(172,230,0,0.2)]'
                        : 'border border-white/[0.08] bg-white/[0.04] text-white/30 hover:text-white hover:bg-white/[0.08]'
                    )}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/30 hover:text-white flex items-center justify-center disabled:opacity-25 transition-all">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      <CourtActionModal
        isOpen={isModalOpen}
        court={selectedCourt}
        mode={selectedCourt ? 'edit' : 'view'}
        onClose={handleCloseModal}
        onSaveSuccess={handleSaveSuccess}
      />
      <CourtDetailModal
        court={detailCourt}
        open={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setDetailCourt(null); }}
        onEdit={c => { setIsDetailOpen(false); handleEditCourt(c); }}
      />
    </div>
  );
}