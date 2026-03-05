import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchCourts } from '../../../store/slices/courtsSlice';
import CourtActionModal from './ActionModals/CourtActionModal';
import { useToast } from '@/hooks/use-toast';
import { Court } from '../../../types/api';
import {
  Search,
  MoreHorizontal,
  MapPin,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Download,
  Upload,
  Plus,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* ─── constants ── */
const COURT_TYPES: Record<string, string> = {
  indoor: 'Cubierta',
  outdoor: 'Aire Libre',
  covered: 'Techada',
};

const COURT_SURFACES: Record<string, string> = {
  concrete: 'Concreto',
  asphalt: 'Asfalto',
  synthetic: 'Sintética',
  grass: 'Pasto',
  clay: 'Arcilla',
};

const TYPE_CLASSES: Record<string, string> = {
  indoor: 'bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/10',
  outdoor: 'bg-amber-500/10  text-amber-400  border-amber-500/20  hover:bg-amber-500/10',
  covered: 'bg-sky-500/10    text-sky-400    border-sky-500/20    hover:bg-sky-500/10',
};

const SURFACE_DOT: Record<string, string> = {
  concrete: 'bg-slate-400',
  asphalt: 'bg-slate-500',
  synthetic: 'bg-sky-400',
  grass: 'bg-emerald-400',
  clay: 'bg-orange-400',
};

/* ─── small presentational components ── */
function TypeBadge({ type }: { type?: string }) {
  const cls =
    TYPE_CLASSES[type ?? ''] ?? 'bg-white/5 text-white/40 border-white/10 hover:bg-white/5';
  return (
    <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest ${cls}`}>
      {COURT_TYPES[type ?? ''] ?? type ?? '—'}
    </Badge>
  );
}

function SurfaceBadge({ surface }: { surface?: string }) {
  const dot = SURFACE_DOT[surface ?? ''] ?? 'bg-white/20';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-white/50 font-medium">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
      {COURT_SURFACES[surface ?? ''] ?? surface ?? '—'}
    </span>
  );
}

function AvailBadge({ available }: { available: boolean }) {
  return available ? (
    <Badge
      variant="outline"
      className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10 text-[11px]"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
      Disponible
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-white/5 text-white/30 border-white/10 hover:bg-white/5 text-[11px]"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/20 mr-1.5" />
      No disponible
    </Badge>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="bg-[#0d1117] border-white/[0.07] rounded-xl">
      <CardContent className="px-4 py-3.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
          {label}
        </p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════════════ */

export default function CourtsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { courts, loading, pagination } = useSelector((state: RootState) => state.courts);

  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [courtTypeFilter, setCourtTypeFilter] = useState('');
  const [surfaceFilter, setSurfaceFilter] = useState('');
  const [availableFilter, setAvailableFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('');

  const currentPage = pagination?.page ?? 1;
  const pageLimit = pagination?.limit ?? 10;

  function buildParams(overrides: Record<string, any> = {}) {
    const p: Record<string, any> = { page: currentPage, limit: pageLimit, ...overrides };
    if (searchTerm) p.search = searchTerm;
    if (courtTypeFilter) p.court_type = courtTypeFilter;
    if (surfaceFilter) p.surface = surfaceFilter;
    if (availableFilter) p.is_available = availableFilter;
    if (clubFilter) p.club_id = clubFilter;
    return p;
  }

  useEffect(() => {
    dispatch(fetchCourts(buildParams()));
  }, [
    dispatch,
    currentPage,
    pageLimit,
    searchTerm,
    courtTypeFilter,
    surfaceFilter,
    availableFilter,
    clubFilter,
  ]);

  const handleCreateCourt = useCallback(() => {
    setSelectedCourt(null);
    setModalMode('create');
    setIsModalOpen(true);
  }, []);
  const handleViewCourt = useCallback(
    (c: Court) => navigate(`/admin/dashboard/courts/${c.id}`),
    [navigate],
  );
  const handleEditCourt = useCallback((c: Court) => {
    setSelectedCourt(c);
    setModalMode('edit');
    setIsModalOpen(true);
  }, []);
  const handleDeleteCourt = useCallback((c: Court) => {
    setSelectedCourt(c);
    setModalMode('edit');
    setIsModalOpen(true);
  }, []);
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCourt(null), 300);
  }, []);

  const handleSaveSuccess = useCallback(() => {
    toast({ title: 'Éxito', description: 'Cancha actualizada correctamente' });
    dispatch(fetchCourts(buildParams()));
    handleModalClose();
  }, [
    dispatch,
    currentPage,
    pageLimit,
    searchTerm,
    courtTypeFilter,
    surfaceFilter,
    availableFilter,
    handleModalClose,
    toast,
  ]);

  const handlePageChange = (p: number) => {
    if (p > 0 && p <= (pagination?.pages ?? 1)) dispatch(fetchCourts(buildParams({ page: p })));
  };

  const handleLimitChange = (limit: string) => {
    dispatch(fetchCourts(buildParams({ page: 1, limit: Number(limit) })));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCourtTypeFilter('');
    setSurfaceFilter('');
    setAvailableFilter('');
    setClubFilter('');
  };

  const hasFilters = !!(
    searchTerm ||
    courtTypeFilter ||
    surfaceFilter ||
    availableFilter ||
    clubFilter
  );

  const clubOptions = useMemo(() => {
    const m = new Map<string, string>();
    if (Array.isArray(courts))
      courts.forEach((c) => {
        if (c.club_id && c.club_name) m.set(c.club_id, c.club_name);
      });
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }));
  }, [courts]);

  const courtsArray = Array.isArray(courts) ? courts : [];
  const paginationData = pagination ?? { page: currentPage, limit: pageLimit, total: 0, pages: 0 };
  const availCount = courtsArray.filter((c) => c.is_available).length;

  /* ── select style helpers ── */
  const selTrigger =
    'h-9 bg-white/[0.04] border-white/[0.08] text-white/70 text-sm focus:border-white/20 focus:ring-0';
  const selContent = 'bg-[#161c25] border-white/[0.08] rounded-xl shadow-2xl';
  const selItem = 'text-white/70 focus:bg-white/[0.06] focus:text-white';

  /* ── render ── */
  return (
    <div className="space-y-6 p-1">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestión de Canchas</h1>
          <p className="text-sm text-white/35 mt-0.5">Administra todas las canchas disponibles</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(fetchCourts(buildParams()))}
            disabled={loading}
            className="border-white/[0.08] bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/[0.08] bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12]"
          >
            <Download className="w-3.5 h-3.5 mr-2" /> Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/[0.08] bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12]"
          >
            <Upload className="w-3.5 h-3.5 mr-2" /> Importar
          </Button>
          <Button
            size="sm"
            onClick={handleCreateCourt}
            className="bg-[#ace600] hover:bg-[#c0f000] text-black font-bold shadow-[0_0_18px_rgba(172,230,0,0.18)] hover:shadow-[0_0_28px_rgba(172,230,0,0.32)] transition-all"
          >
            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Nueva Cancha
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-[#0d1117] border-white/[0.07] rounded-xl">
          <CardContent className="px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
              Total
            </p>
            <p className="text-2xl font-bold text-[#ace600]">{paginationData.total}</p>
          </CardContent>
        </Card>
        <StatCard label="Disponibles" value={availCount} />
        <StatCard label="No disponibles" value={courtsArray.length - availCount} />
        <StatCard label="Páginas" value={`${paginationData.page} / ${paginationData.pages || 1}`} />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar canchas por nombre…"
            className="pl-8 pr-8 h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:border-white/20 focus-visible:ring-0"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Select
          value={courtTypeFilter || 'all'}
          onValueChange={(v) => setCourtTypeFilter(v === 'all' ? '' : v)}
        >
          <SelectTrigger className={`${selTrigger} sm:w-40`}>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className={selContent}>
            <SelectItem value="all" className={selItem}>
              Todos los tipos
            </SelectItem>
            {Object.entries(COURT_TYPES).map(([v, l]) => (
              <SelectItem key={v} value={v} className={selItem}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={surfaceFilter || 'all'}
          onValueChange={(v) => setSurfaceFilter(v === 'all' ? '' : v)}
        >
          <SelectTrigger className={`${selTrigger} sm:w-40`}>
            <SelectValue placeholder="Superficie" />
          </SelectTrigger>
          <SelectContent className={selContent}>
            <SelectItem value="all" className={selItem}>
              Todas
            </SelectItem>
            {Object.entries(COURT_SURFACES).map(([v, l]) => (
              <SelectItem key={v} value={v} className={selItem}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={availableFilter || 'all'}
          onValueChange={(v) => setAvailableFilter(v === 'all' ? '' : v)}
        >
          <SelectTrigger className={`${selTrigger} sm:w-44`}>
            <SelectValue placeholder="Disponibilidad" />
          </SelectTrigger>
          <SelectContent className={selContent}>
            <SelectItem value="all" className={selItem}>
              Todas
            </SelectItem>
            <SelectItem value="true" className={selItem}>
              Disponibles
            </SelectItem>
            <SelectItem value="false" className={selItem}>
              No disponibles
            </SelectItem>
          </SelectContent>
        </Select>

        {clubOptions.length > 0 && (
          <Select
            value={clubFilter || 'all'}
            onValueChange={(v) => setClubFilter(v === 'all' ? '' : v)}
          >
            <SelectTrigger className={`${selTrigger} sm:w-44`}>
              <SelectValue placeholder="Club" />
            </SelectTrigger>
            <SelectContent className={selContent}>
              <SelectItem value="all" className={selItem}>
                Todos los clubs
              </SelectItem>
              {clubOptions.map((c) => (
                <SelectItem key={c.id} value={c.id} className={selItem}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] h-9"
          >
            <X className="w-3.5 h-3.5 mr-2" /> Limpiar
          </Button>
        )}
      </div>

      {/* ── Table card ── */}
      <Card className="bg-[#0d1117] border-white/[0.07] rounded-2xl overflow-hidden p-0">
        {/* Card header */}
        <CardHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-white/[0.06] space-y-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-white/30" />
            <span className="text-sm font-semibold text-white/60">Canchas</span>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              <Badge
                variant="outline"
                className="border-white/[0.06] bg-white/[0.04] text-white/25 text-[11px] font-semibold"
              >
                {paginationData.total === 0
                  ? 0
                  : (paginationData.page - 1) * paginationData.limit + 1}
                –{Math.min(paginationData.page * paginationData.limit, paginationData.total)} de{' '}
                {paginationData.total}
              </Badge>
            )}
            <Select value={String(paginationData.limit)} onValueChange={handleLimitChange}>
              <SelectTrigger className="h-7 w-16 bg-white/[0.04] border-white/[0.08] text-xs text-white/50 focus:ring-0 focus:border-white/20 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={selContent}>
                {[5, 10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)} className={selItem}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
              <p className="text-sm text-white/25">Cargando canchas…</p>
            </div>
          )}

          {/* Empty */}
          {!loading && courtsArray.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-white/50 font-semibold text-sm mb-1">No se encontraron canchas</p>
              <p className="text-white/20 text-xs max-w-xs">
                {hasFilters
                  ? 'Intenta ajustar los filtros de búsqueda.'
                  : 'Crea tu primera cancha para comenzar.'}
              </p>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-4 text-white/35 hover:text-white/60"
                >
                  <X className="w-3.5 h-3.5 mr-2" /> Limpiar filtros
                </Button>
              )}
            </div>
          )}

          {/* Table */}
          {!loading && courtsArray.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
                  {['Cancha', 'Club', 'Tipo', 'Superficie', 'Tarifa/hr', 'Estado', ''].map((h) => (
                    <TableHead
                      key={h}
                      className="text-[10px] font-bold uppercase tracking-widest text-white/25 h-10"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {courtsArray.map((court) => (
                  <TableRow
                    key={court.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Name */}
                    <TableCell className="py-3.5">
                      <div className="font-semibold text-white/90 text-sm leading-tight">
                        {court.name}
                      </div>
                      {court.description && (
                        <div className="text-[11px] text-white/30 mt-0.5 max-w-[180px] truncate">
                          {court.description}
                        </div>
                      )}
                    </TableCell>

                    {/* Club */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-white/50">
                        <MapPin className="w-3 h-3 text-white/25 flex-shrink-0" />
                        {court.club_name || '—'}
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="py-3.5">
                      <TypeBadge type={court.court_type} />
                    </TableCell>

                    {/* Surface */}
                    <TableCell className="py-3.5">
                      <SurfaceBadge surface={court.surface} />
                    </TableCell>

                    {/* Rate */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-1 text-xs font-semibold text-white/70">
                        <DollarSign className="w-3 h-3 text-white/25" />
                        {court.hourly_rate ? Number(court.hourly_rate).toFixed(2) : '—'}
                      </div>
                    </TableCell>

                    {/* Availability */}
                    <TableCell className="py-3.5">
                      <AvailBadge available={!!court.is_available} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-white/25 hover:text-white/70 hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#161c25] border-white/[0.08] rounded-xl shadow-2xl p-1 w-44"
                        >
                          <DropdownMenuItem
                            onClick={() => handleViewCourt(court)}
                            className="flex items-center gap-2.5 text-white/60 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditCourt(court)}
                            className="flex items-center gap-2.5 text-white/60 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/[0.06] my-1" />
                          <DropdownMenuItem
                            onClick={() => handleDeleteCourt(court)}
                            className="flex items-center gap-2.5 text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-red-500/[0.06] focus:bg-red-500/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                          >
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

          {/* Pagination footer */}
          {!loading && paginationData.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
              <p className="text-xs text-white/25">
                {courtsArray.length} de {paginationData.total} canchas
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-7 h-7 border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>

                {Array.from({ length: paginationData.pages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                    className={`w-7 h-7 text-xs font-semibold transition-all ${
                      page === currentPage
                        ? 'bg-[#ace600] text-black border-[#ace600]/50 hover:bg-[#c0f000] shadow-[0_0_10px_rgba(172,230,0,0.2)]'
                        : 'border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === paginationData.pages}
                  className="w-7 h-7 border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Court Action Modal */}
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
