import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchCourts } from '../../../store/slices/courtsSlice';
import { fetchCourtsByVenue } from '../../../store/slices/reservationSlice';
import CourtActionModal from './ActionModals/CourtActionModal';
import { useToast } from '@/hooks/use-toast';
import { Court } from '../../../types/api';
import {
  Search, MoreHorizontal, MapPin, DollarSign,
  Edit, Trash2, Eye, ChevronLeft, ChevronRight,
  Loader2, X, Download, Upload, Plus, RefreshCw,
  Layers, CheckCircle2, XCircle, LayoutGrid,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { COURT_SURFACES, COURT_SURFACE_COLORS } from '@/constants/constants';

// ─── Constants ────────────────────────────────────────────────────────────────
const COURT_TYPES: Record<string, string> = {
  indoor: 'Cubierta', outdoor: 'Aire Libre', covered: 'Techada',
};
const TYPE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  indoor:  { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  outdoor: { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400'  },
  covered: { bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    text: 'text-sky-400'    },
};
const SURFACE_DOT = COURT_SURFACE_COLORS;

// ─── Atoms ────────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type?: string }) {
  const s = TYPE_STYLES[type ?? ''] ?? { bg: 'bg-white/[0.04]', border: 'border-white/[0.08]', text: 'text-white/30' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest', s.bg, s.border, s.text)}>
      {COURT_TYPES[type ?? ''] ?? type ?? '—'}
    </span>
  );
}

function SurfaceBadge({ surface }: { surface?: string }) {
  const dot = SURFACE_DOT[surface ?? ''] ?? 'bg-white/20';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-white/45 font-medium">
      <span className={cn('w-2 h-2 rounded-full shrink-0', dot)} />
      {COURT_SURFACES[surface ?? ''] ?? surface ?? '—'}
    </span>
  );
}

function AvailBadge({ available }: { available: boolean }) {
  return available ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Disponible
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-white/[0.04] border-white/[0.08] text-white/25 text-[10px] font-black uppercase tracking-widest">
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

// ─── Select style helpers ─────────────────────────────────────────────────────
const selTrigger = 'h-9 bg-white/[0.04] border-white/[0.08] text-white/60 text-sm focus:border-[#ace600]/30 focus:ring-0 rounded-xl';
const selContent = 'bg-[#0d1117] border-white/[0.09] rounded-xl shadow-2xl';
const selItem    = 'text-white/60 focus:bg-white/[0.06] focus:text-white rounded-lg';

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CourtsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const venueId = searchParams.get('venueId');

  const { courts, loading, pagination } = useSelector((state: RootState) => state.courts);

  const [selectedCourt,   setSelectedCourt]   = useState<Court | null>(null);
  const [modalMode,       setModalMode]       = useState<'view' | 'edit' | 'create'>('view');
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [searchTerm,      setSearchTerm]      = useState('');
  const [courtTypeFilter, setCourtTypeFilter] = useState('');
  const [surfaceFilter,   setSurfaceFilter]   = useState('');
  const [availableFilter, setAvailableFilter] = useState('');
  const [clubFilter,      setClubFilter]      = useState('');

  const currentPage = pagination?.page  ?? 1;
  const pageLimit   = pagination?.limit ?? 10;

  const buildParams = (overrides: Record<string, any> = {}) => {
    const p: Record<string, any> = { page: currentPage, limit: pageLimit, ...overrides };
    if (searchTerm)      p.search       = searchTerm;
    if (courtTypeFilter) p.court_type   = courtTypeFilter;
    if (surfaceFilter)   p.surface      = surfaceFilter;
    if (availableFilter) p.is_available = availableFilter;
    if (clubFilter)      p.club_id      = clubFilter;
    return p;
  };

  useEffect(() => {
    if (venueId) {
      // If venueId is present, fetch courts for that venue from the API
      dispatch(fetchCourtsByVenue(venueId) as any);
    } else {
      // Otherwise fetch all courts with filters
      dispatch(fetchCourts(buildParams()));
    }
  }, [dispatch, venueId, currentPage, pageLimit, searchTerm, courtTypeFilter, surfaceFilter, availableFilter, clubFilter]);

  const handleCreateCourt = useCallback(() => { setSelectedCourt(null); setModalMode('create'); setIsModalOpen(true); }, []);
  const handleViewCourt   = useCallback((c: Court) => navigate(`/admin/dashboard/courts/${c.id}`), [navigate]);
  const handleEditCourt   = useCallback((c: Court) => { setSelectedCourt(c); setModalMode('edit');   setIsModalOpen(true); }, []);
  const handleDeleteCourt = useCallback((c: Court) => { setSelectedCourt(c); setModalMode('edit');   setIsModalOpen(true); }, []);
  const handleModalClose  = useCallback(() => { setIsModalOpen(false); setTimeout(() => setSelectedCourt(null), 300); }, []);

  const handleSaveSuccess = useCallback(() => {
    toast({ title: 'Éxito', description: 'Cancha actualizada correctamente' });
    dispatch(fetchCourts(buildParams()));
    handleModalClose();
  }, [dispatch, currentPage, pageLimit, searchTerm, courtTypeFilter, surfaceFilter, availableFilter, handleModalClose, toast]);

  const handlePageChange  = (p: number) => {
    if (p > 0 && p <= (pagination?.pages ?? 1)) dispatch(fetchCourts(buildParams({ page: p })));
  };
  const handleLimitChange = (limit: string) => {
    dispatch(fetchCourts(buildParams({ page: 1, limit: Number(limit) })));
  };
  const clearFilters = () => {
    setSearchTerm(''); setCourtTypeFilter(''); setSurfaceFilter('');
    setAvailableFilter(''); setClubFilter('');
  };

  const hasFilters = !!(searchTerm || courtTypeFilter || surfaceFilter || availableFilter || clubFilter);

  const clubOptions = useMemo(() => {
    const m = new Map<string, string>();
    if (Array.isArray(courts))
      courts.forEach(c => { if (c.club_id && c.club_name) m.set(c.club_id, c.club_name); });
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }));
  }, [courts]);

  const courtsArray    = Array.isArray(courts) ? courts : [];
  
  const paginationData = pagination ?? { page: currentPage, limit: pageLimit, total: 0, pages: 0 };
  const availCount     = courtsArray.filter(c => c.is_available).length;

  return (
    <div className="space-y-5">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[22px] font-black text-white tracking-tight">Gestión de Canchas</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <LayoutGrid className="w-2.5 h-2.5" />
              {paginationData.total}
            </span>
          </div>
          <p className="text-xs text-white/25">Administra todas las canchas disponibles</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => dispatch(fetchCourts(buildParams()))}
            disabled={loading}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white text-xs font-bold disabled:opacity-40 transition-all">
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            Actualizar
          </button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white text-xs font-bold transition-all">
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white text-xs font-bold transition-all">
            <Upload className="w-3.5 h-3.5" /> Importar
          </button>
          <button
            onClick={handleCreateCourt}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-black bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_16px_rgba(172,230,0,0.18)] hover:shadow-[0_0_24px_rgba(172,230,0,0.30)] transition-all">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} /> Nueva Cancha
          </button>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Total" value={paginationData.total} accent="text-[#ace600]" />
        <StatCard label="Disponibles" value={availCount} accent="text-emerald-400" />
        <StatCard label="No disponibles" value={courtsArray.length - availCount} accent="text-red-400" />
        <StatCard label="Página" value={`${paginationData.page} / ${paginationData.pages || 1}`} />
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar canchas por nombre…"
            className="pl-9 pr-8 h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:border-[#ace600]/30 focus-visible:ring-0 rounded-xl"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Select value={courtTypeFilter || 'all'} onValueChange={v => setCourtTypeFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className={cn(selTrigger, 'sm:w-40')}><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent className={selContent}>
            <SelectItem value="all" className={selItem}>Todos los tipos</SelectItem>
            {Object.entries(COURT_TYPES).map(([v, l]) => <SelectItem key={v} value={v} className={selItem}>{l}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={surfaceFilter || 'all'} onValueChange={v => setSurfaceFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className={cn(selTrigger, 'sm:w-40')}><SelectValue placeholder="Superficie" /></SelectTrigger>
          <SelectContent className={selContent}>
            <SelectItem value="all" className={selItem}>Todas</SelectItem>
            {Object.entries(COURT_SURFACES).map(([v, l]) => <SelectItem key={v} value={v} className={selItem}>{l}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={availableFilter || 'all'} onValueChange={v => setAvailableFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className={cn(selTrigger, 'sm:w-44')}><SelectValue placeholder="Disponibilidad" /></SelectTrigger>
          <SelectContent className={selContent}>
            <SelectItem value="all" className={selItem}>Todas</SelectItem>
            <SelectItem value="true" className={selItem}>Disponibles</SelectItem>
            <SelectItem value="false" className={selItem}>No disponibles</SelectItem>
          </SelectContent>
        </Select>

        {clubOptions.length > 0 && (
          <Select value={clubFilter || 'all'} onValueChange={v => setClubFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className={cn(selTrigger, 'sm:w-44')}><SelectValue placeholder="Club" /></SelectTrigger>
            <SelectContent className={selContent}>
              <SelectItem value="all" className={selItem}>Todos los clubs</SelectItem>
              {clubOptions.map(c => <SelectItem key={c.id} value={c.id} className={selItem}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {hasFilters && (
          <button onClick={clearFilters}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/35 hover:text-white text-xs font-bold transition-all">
            <X className="w-3.5 h-3.5" /> Limpiar
          </button>
        )}
      </div>

      {/* ── Table card ───────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        {/* Table header row */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-white/20" />
            <span className="text-xs font-black text-white/30 uppercase tracking-widest">Canchas</span>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              <span className="text-[11px] text-white/20 font-semibold">
                {paginationData.total === 0 ? 0 : (paginationData.page - 1) * paginationData.limit + 1}
                –{Math.min(paginationData.page * paginationData.limit, paginationData.total)} de {paginationData.total}
              </span>
            )}
            <Select value={String(paginationData.limit)} onValueChange={handleLimitChange}>
              <SelectTrigger className="h-7 w-16 bg-white/[0.04] border-white/[0.08] text-[11px] text-white/40 focus:ring-0 focus:border-[#ace600]/30 px-2 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={selContent}>
                {[5, 10, 20, 50, 100].map(n => (
                  <SelectItem key={n} value={String(n)} className={selItem}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-5 h-5 text-[#ace600] animate-spin" />
            <p className="text-xs text-white/20">Cargando canchas…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && courtsArray.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Layers className="w-6 h-6 text-white/10" />
            </div>
            <div>
              <p className="text-sm font-bold text-white/30 mb-1">No se encontraron canchas</p>
              <p className="text-xs text-white/15 max-w-xs">
                {hasFilters ? 'Intenta ajustar los filtros de búsqueda.' : 'Crea tu primera cancha para comenzar.'}
              </p>
            </div>
            {hasFilters && (
              <button onClick={clearFilters}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/30 hover:text-white text-xs font-bold transition-all">
                <X className="w-3.5 h-3.5" /> Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && courtsArray.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
                {['Cancha', 'Club', 'Tipo', 'Superficie', 'Tarifa/hr', 'Estado', ''].map(h => (
                  <TableHead key={h} className="text-[10px] font-black uppercase tracking-widest text-white/20 h-10 px-4">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {courtsArray.map(court => (
                <TableRow key={court.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group cursor-pointer">

                  {/* Name */}
                  <TableCell className="py-3.5 px-4">
                    <p className="font-bold text-white/80 text-sm leading-tight group-hover:text-white transition-colors">
                      {court.name}
                    </p>
                    {court.description && (
                      <p className="text-[11px] text-white/25 mt-0.5 max-w-[180px] truncate">{court.description}</p>
                    )}
                  </TableCell>

                  {/* Club */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-white/40 font-medium">
                      <MapPin className="w-3 h-3 text-white/20 shrink-0" />
                      {court.club_name || '—'}
                    </div>
                  </TableCell>

                  {/* Type */}
                  <TableCell className="py-3.5 px-4">
                    <TypeBadge type={court.court_type} />
                  </TableCell>

                  {/* Surface */}
                  <TableCell className="py-3.5 px-4">
                    <SurfaceBadge surface={court.surface} />
                  </TableCell>

                  {/* Rate */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-xs font-bold text-white/60">
                      <DollarSign className="w-3 h-3 text-white/20" />
                      {court.hourly_rate ? Number(court.hourly_rate).toFixed(2) : '—'}
                    </div>
                  </TableCell>

                  {/* Availability */}
                  <TableCell className="py-3.5 px-4">
                    <AvailBadge available={!!court.is_available} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3.5 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-white/20 hover:text-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end"
                        className="bg-[#0d1117] border-white/[0.09] rounded-xl shadow-2xl p-1 w-44">
                        <DropdownMenuItem onClick={() => handleViewCourt(court)}
                          className="flex items-center gap-2.5 text-white/55 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer">
                          <Eye className="w-3.5 h-3.5" /> Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditCourt(court)}
                          className="flex items-center gap-2.5 text-white/55 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer">
                          <Edit className="w-3.5 h-3.5" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/[0.06] my-1" />
                        <DropdownMenuItem onClick={() => handleDeleteCourt(court)}
                          className="flex items-center gap-2.5 text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-red-500/[0.06] focus:bg-red-500/[0.06] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {!loading && paginationData.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.05]">
            <p className="text-xs text-white/20 font-semibold">
              {courtsArray.length} de {paginationData.total} canchas
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/30 hover:text-white flex items-center justify-center disabled:opacity-25 transition-all">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: paginationData.pages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => handlePageChange(page)}
                  className={cn(
                    'w-7 h-7 rounded-lg text-xs font-black transition-all',
                    page === currentPage
                      ? 'bg-[#ace600] text-black shadow-[0_0_10px_rgba(172,230,0,0.2)]'
                      : 'border border-white/[0.08] bg-white/[0.04] text-white/30 hover:text-white hover:bg-white/[0.08]',
                  )}>
                  {page}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === paginationData.pages}
                className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/30 hover:text-white flex items-center justify-center disabled:opacity-25 transition-all">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <CourtActionModal
        isOpen={isModalOpen}
        court={selectedCourt}
        mode={modalMode as 'view' | 'edit' | 'create'}
        onClose={handleModalClose}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}