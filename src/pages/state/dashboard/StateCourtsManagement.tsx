import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Grid3X3,
  Search,
  X,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  MapPin,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Layers,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppDispatch, RootState } from '@/store';
import { fetchStateCourts, deleteStateCourt } from '@/store/slices/stateDashboardSlice';
import CourtActionModal from '@/pages/admin/dashboard/ActionModals/CourtActionModal';

/* ─── constants ── */
const COURT_TYPES: Record<string, string> = {
  indoor: 'Interior',
  outdoor: 'Exterior',
  covered: 'Techado',
};

const COURT_SURFACES: Record<string, string> = {
  concrete: 'Concreto',
  acrylic: 'Acrílico',
  clay: 'Arcilla',
  synthetic: 'Sintético',
  wooden: 'Madera',
};

/* ─── shared styles ── */
const selTrigger =
  'h-9 bg-white/[0.04] border-white/[0.08] text-white/70 text-sm focus:ring-0 focus:border-white/20 transition-colors';
const selContent = 'bg-[#161c25] border-white/[0.08] rounded-xl shadow-2xl';
const selItem = 'text-white/70 focus:bg-white/[0.06] focus:text-white';

/* ─── type badge ── */
const TYPE_CLS: Record<string, string> = {
  indoor: 'text-sky-400    bg-sky-500/[0.08]    border-sky-500/20',
  outdoor: 'text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20',
  covered: 'text-amber-400  bg-amber-500/[0.08]  border-amber-500/20',
};

function TypeBadge({ type }: { type: string }) {
  const cls = TYPE_CLS[type] ?? 'text-white/40 bg-white/[0.05] border-white/[0.08]';
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-bold uppercase tracking-widest hover:bg-transparent ${cls}`}
    >
      {COURT_TYPES[type] ?? type}
    </Badge>
  );
}

/* ─── surface badge ── */
const SURFACE_DOT: Record<string, string> = {
  concrete: 'bg-slate-400',
  acrylic: 'bg-sky-400',
  clay: 'bg-red-400',
  synthetic: 'bg-violet-400',
  wooden: 'bg-amber-700',
};

function SurfaceBadge({ surface }: { surface: string }) {
  const dot = SURFACE_DOT[surface] ?? 'bg-white/20';
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/50">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
      {COURT_SURFACES[surface] ?? surface}
    </span>
  );
}

/* ─── status badge ── */
function StatusBadge({ status }: { status: string }) {
  return status === 'available' ? (
    <Badge
      variant="outline"
      className="bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/[0.08]"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
      Disponible
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-amber-500/[0.08] border-amber-500/20 text-amber-400 text-[10px] font-semibold hover:bg-amber-500/[0.08]"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5" />
      Mantenimiento
    </Badge>
  );
}

/* ─── filter chip ── */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#ace600]/[0.08] border border-[#ace600]/20 text-[#ace600] hover:bg-[#ace600]/[0.14] transition-colors"
    >
      {label}
      <X className="w-3 h-3" />
    </button>
  );
}

/* ─── stat card ── */
function StatCard({
  label,
  value,
  color = 'text-white',
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card className="bg-[#0d1117] border-white/[0.07] rounded-xl">
      <CardContent className="px-4 py-3.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
          {label}
        </p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════════════ */

export default function StateCourtsManagement() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const {
    courts,
    courtsLoading: loading,
    courtsPagination: pagination,
  } = useSelector((state: RootState) => state.stateDashboard);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ court_type: 'all', surface: 'all', status: 'all' });
  const [selectedCourt, setSelectedCourt] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  useEffect(() => {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (filters.court_type !== 'all') params.court_type = filters.court_type;
    if (filters.surface !== 'all') params.surface = filters.surface;
    if (filters.status !== 'all') params.status = filters.status;
    dispatch(fetchStateCourts(params));
  }, [dispatch, page, limit, search, filters]);

  const handleClearFilters = () => {
    setSearch('');
    setFilters({ court_type: 'all', surface: 'all', status: 'all' });
    setPage(1);
  };

  const openModal = (court: any, mode: 'view' | 'edit') => {
    setSelectedCourt(court);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleDelete = async (courtId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cancha?')) return;
    try {
      await dispatch(deleteStateCourt(courtId)).unwrap();
      toast({
        title: 'Cancha eliminada',
        description: 'La cancha ha sido eliminada correctamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo eliminar la cancha',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil((pagination?.total || 0) / limit) || 1;
  const availableCount = courts?.filter((c: any) => c.status === 'available')?.length || 0;
  const indoorCount = courts?.filter((c: any) => c.court_type === 'indoor')?.length || 0;
  const outdoorCount = courts?.filter((c: any) => c.court_type === 'outdoor')?.length || 0;
  const hasFilters = !!(
    search ||
    filters.court_type !== 'all' ||
    filters.surface !== 'all' ||
    filters.status !== 'all'
  );

  // visible page window
  const pageWindow = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return start + i;
  }).filter((p) => p <= totalPages);

  return (
    <div className="space-y-6 p-1">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-[#ace600]" />
            Gestión de Canchas
          </h1>
          <p className="text-sm text-white/35 mt-0.5">Administra las canchas en tu estado</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-[#0d1117] border-white/[0.07] rounded-xl">
          <CardContent className="px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
              Total
            </p>
            <p className="text-2xl font-bold text-[#ace600]">{pagination?.total || 0}</p>
          </CardContent>
        </Card>
        <StatCard label="Disponibles" value={availableCount} color="text-emerald-400" />
        <StatCard label="Interior" value={indoorCount} color="text-sky-400" />
        <StatCard label="Exterior" value={outdoorCount} color="text-amber-400" />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar cancha…"
            className="pl-8 pr-8 h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:border-white/20 focus-visible:ring-0"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Select
          value={filters.court_type}
          onValueChange={(v) => {
            setFilters((f) => ({ ...f, court_type: v }));
            setPage(1);
          }}
        >
          <SelectTrigger className={`${selTrigger} sm:w-40`}>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className={selContent}>
            <SelectItem value="all" className={selItem}>
              Todos los tipos
            </SelectItem>
            <SelectItem value="indoor" className={selItem}>
              Interior
            </SelectItem>
            <SelectItem value="outdoor" className={selItem}>
              Exterior
            </SelectItem>
            <SelectItem value="covered" className={selItem}>
              Techado
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.surface}
          onValueChange={(v) => {
            setFilters((f) => ({ ...f, surface: v }));
            setPage(1);
          }}
        >
          <SelectTrigger className={`${selTrigger} sm:w-40`}>
            <SelectValue placeholder="Superficie" />
          </SelectTrigger>
          <SelectContent className={selContent}>
            <SelectItem value="all" className={selItem}>
              Todas
            </SelectItem>
            <SelectItem value="concrete" className={selItem}>
              Concreto
            </SelectItem>
            <SelectItem value="acrylic" className={selItem}>
              Acrílico
            </SelectItem>
            <SelectItem value="clay" className={selItem}>
              Arcilla
            </SelectItem>
            <SelectItem value="synthetic" className={selItem}>
              Sintético
            </SelectItem>
            <SelectItem value="wooden" className={selItem}>
              Madera
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(v) => {
            setFilters((f) => ({ ...f, status: v }));
            setPage(1);
          }}
        >
          <SelectTrigger className={`${selTrigger} sm:w-40`}>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className={selContent}>
            <SelectItem value="all" className={selItem}>
              Todos
            </SelectItem>
            <SelectItem value="available" className={selItem}>
              Disponible
            </SelectItem>
            <SelectItem value="maintenance" className={selItem}>
              Mantenimiento
            </SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="h-9 border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white text-xs font-semibold"
          >
            <X className="w-3.5 h-3.5 mr-2" /> Limpiar
          </Button>
        )}
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {search && <FilterChip label={`Búsqueda: ${search}`} onRemove={() => setSearch('')} />}
          {filters.court_type !== 'all' && (
            <FilterChip
              label={`Tipo: ${COURT_TYPES[filters.court_type] ?? filters.court_type}`}
              onRemove={() => setFilters((f) => ({ ...f, court_type: 'all' }))}
            />
          )}
          {filters.surface !== 'all' && (
            <FilterChip
              label={`Superficie: ${COURT_SURFACES[filters.surface] ?? filters.surface}`}
              onRemove={() => setFilters((f) => ({ ...f, surface: 'all' }))}
            />
          )}
          {filters.status !== 'all' && (
            <FilterChip
              label={`Estado: ${filters.status === 'available' ? 'Disponible' : 'Mantenimiento'}`}
              onRemove={() => setFilters((f) => ({ ...f, status: 'all' }))}
            />
          )}
        </div>
      )}

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
                {pagination?.total || 0} resultados
              </Badge>
            )}
            <Select
              value={String(limit)}
              onValueChange={(v) => {
                setLimit(parseInt(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-20 bg-white/[0.04] border-white/[0.08] text-xs text-white/50 focus:ring-0 focus:border-white/20 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={selContent}>
                {[5, 10, 25, 50].map((n) => (
                  <SelectItem key={n} value={String(n)} className={selItem}>
                    {n} / pág
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
          {!loading && (!courts || courts.length === 0) && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
                <Grid3X3 className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-white/50 font-semibold text-sm mb-1">No se encontraron canchas</p>
              <p className="text-white/20 text-xs">
                {hasFilters ? 'Intenta ajustar los filtros.' : 'No hay canchas registradas aún.'}
              </p>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="mt-4 text-white/35 hover:text-white/60 text-xs"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" /> Limpiar filtros
                </Button>
              )}
            </div>
          )}

          {/* Table */}
          {!loading && courts && courts.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
                  {['Cancha', 'Ubicación', 'Tipo', 'Superficie', 'Estado', 'Club', ''].map((h) => (
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
                {courts.map((court: any, i: number) => (
                  <TableRow
                    key={court.id}
                    className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group ${i === courts.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <TableCell className="py-3.5">
                      <p className="text-sm font-semibold text-white/90 leading-tight">
                        {court.name}
                      </p>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="flex items-center gap-1.5 text-xs text-white/40">
                        <MapPin className="w-3 h-3 text-white/20 flex-shrink-0" />
                        {court.address && court.city ? `${court.address}, ${court.city}` : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <TypeBadge type={court.court_type || 'outdoor'} />
                    </TableCell>
                    <TableCell className="py-3.5">
                      <SurfaceBadge surface={court.surface || 'acrylic'} />
                    </TableCell>
                    <TableCell className="py-3.5">
                      <StatusBadge status={court.status || 'available'} />
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-white/40">
                      {court.club_name || '—'}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 text-white/25 hover:text-white/70 hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#161c25] border-white/[0.08] rounded-xl shadow-2xl p-1 w-40"
                        >
                          <DropdownMenuItem
                            onClick={() => openModal(court, 'view')}
                            className="flex items-center gap-2.5 text-white/60 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openModal(court, 'edit')}
                            className="flex items-center gap-2.5 text-white/60 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/[0.06] my-1" />
                          <DropdownMenuItem
                            onClick={() => handleDelete(court.id)}
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
          {!loading && courts && courts.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
              <p className="text-xs text-white/25">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="w-7 h-7 border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>

                {pageWindow.map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs font-semibold transition-all ${
                      p === page
                        ? 'bg-[#ace600] text-black border-[#ace600]/50 hover:bg-[#c0f000] shadow-[0_0_10px_rgba(172,230,0,0.2)]'
                        : 'border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {p}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-7 h-7 border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="w-7 h-7 border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modal ── */}
      {selectedCourt && (
        <CourtActionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCourt(null);
          }}
          court={selectedCourt}
          mode={modalMode}
          onSaveSuccess={() => {
            setIsModalOpen(false);
            setSelectedCourt(null);
            dispatch(fetchStateCourts({ page, limit }));
          }}
        />
      )}
    </div>
  );
}
