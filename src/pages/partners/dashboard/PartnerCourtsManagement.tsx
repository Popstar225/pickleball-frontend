'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCourts, deleteCourt } from '@/store/slices/courtsSlice';
import type { Court } from '@/types/api';
import CourtActionModal from '@/pages/clubs/dashboard/ActionModals/CourtActionModal';
import CourtDetailModal from '@/components/courts/CourtDetailModal';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle, Plus, Trash2, Edit2, Eye, ChevronLeft, ChevronRight,
  Loader2, Search, X, BarChart3, CheckCircle2, Wrench, Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { COURT_SURFACES as SURFACE_LABEL, COURT_SURFACE_OPTIONS } from '@/constants/constants';

// ─── constants ────────────────────────────────────────────────────────────────
const COURT_TYPE_LABEL: Record<string, string> = {
  indoor: 'Cubierta', outdoor: 'Abierta', covered: 'Techada',
};

const inputCls =
  'h-10 rounded-xl text-sm bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20 ' +
  'focus-visible:ring-0 focus-visible:border-[#ace600]/50 transition-all';

const selectTriggerCls =
  'h-10 rounded-xl text-sm bg-white/[0.04] border-white/[0.09] text-white ' +
  'focus:ring-0 focus:border-[#ace600]/50 transition-all data-[placeholder]:text-white/20';

// ─── main ─────────────────────────────────────────────────────────────────────
export default function PartnerCourtsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { courts, loading, error } = useSelector((s: RootState) => s.courts);

  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [detailCourt,   setDetailCourt]   = useState<Court | null>(null);
  const [isDetailOpen,  setIsDetailOpen]  = useState(false);
  const [search,        setSearch]        = useState('');
  const [filterType,    setFilterType]    = useState('');
  const [filterSurface, setFilterSurface] = useState('');
  const [page,          setPage]          = useState(1);
  const PER_PAGE = 12;

  const loadCourts = () => {
    dispatch(fetchCourts({
      search:     search || undefined,
      court_type: (filterType    || undefined) as any,
      surface:    (filterSurface || undefined) as any,
      page,
      limit: PER_PAGE,
    }) as any);
  };

  useEffect(() => { loadCourts(); }, [dispatch, search, filterType, filterSurface, page]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => { setSelectedCourt(null); setIsModalOpen(true); };
  const openEdit   = (c: Court) => { setSelectedCourt(c); setIsModalOpen(true); };
  const openDetail = (c: Court) => { setDetailCourt(c); setIsDetailOpen(true); };

  const handleClose = () => { setIsModalOpen(false); setSelectedCourt(null); };
  const handleSaved = () => { handleClose(); loadCourts(); };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cancha? Esta acción no se puede deshacer.')) return;
    try {
      await dispatch(deleteCourt(id));
      toast.success('Cancha eliminada');
      loadCourts();
    } catch {
      toast.error('No se pudo eliminar la cancha');
    }
  };

  // ── local filter ──────────────────────────────────────────────────────────
  const filtered = Array.isArray(courts) ? courts.filter(c => {
    const s = search.toLowerCase();
    const matchSearch = !s || c.name?.toLowerCase().includes(s) || c.description?.toLowerCase().includes(s);
    const matchType    = !filterType    || filterType    === 'all' || c.court_type === filterType;
    const matchSurface = !filterSurface || filterSurface === 'all' || c.surface    === filterSurface;
    return matchSearch && matchType && matchSurface;
  }) : [];

  const totalPages    = Math.ceil(filtered.length / PER_PAGE);
  const paginatedList = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total:        filtered.length,
    available:    filtered.filter(c => c.is_available && !c.is_maintenance).length,
    maintenance:  filtered.filter(c => c.is_maintenance).length,
    avgRating:    filtered.length
      ? (filtered.reduce((s, c) => s + (typeof c.average_rating === 'number' ? c.average_rating : 0), 0) / filtered.length)
      : null,
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[22px] font-bold text-white tracking-tight">Gestión de Canchas</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
              {filtered.length} canchas
            </span>
          </div>
          <p className="text-xs text-white/25">Administra las canchas de tu venue</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_14px_rgba(172,230,0,0.18)] transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Nueva Cancha
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Total', value: stats.total, icon: BarChart3, color: 'text-[#ace600]' },
          { label: 'Disponibles', value: stats.available, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Mantenimiento', value: stats.maintenance, icon: Wrench, color: 'text-amber-400' },
          {
            label: 'Rating Prom.',
            value: stats.avgRating !== null ? stats.avgRating.toFixed(1) : '—',
            icon: Star,
            color: 'text-amber-400',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-white/25">
              <Icon className={cn('w-3.5 h-3.5', color)} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <p className={cn('text-xl font-bold leading-none', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
          <Input
            className={cn(inputCls, 'pl-10 pr-9')}
            placeholder="Buscar canchas…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
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

        <Select value={filterType} onValueChange={v => { setFilterType(v); setPage(1); }}>
          <SelectTrigger className={cn(selectTriggerCls, 'w-[160px]')}>
            <SelectValue placeholder="Tipo de cancha" />
          </SelectTrigger>
          <SelectContent className="bg-[#161c25] border-white/[0.08] rounded-xl shadow-2xl">
            <SelectItem value="all" className="text-white/70 focus:bg-white/[0.06] focus:text-white">Todos los tipos</SelectItem>
            <SelectItem value="indoor"   className="text-white/70 focus:bg-white/[0.06] focus:text-white">Cubierta</SelectItem>
            <SelectItem value="outdoor"  className="text-white/70 focus:bg-white/[0.06] focus:text-white">Abierta</SelectItem>
            <SelectItem value="covered"  className="text-white/70 focus:bg-white/[0.06] focus:text-white">Techada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSurface} onValueChange={v => { setFilterSurface(v); setPage(1); }}>
          <SelectTrigger className={cn(selectTriggerCls, 'w-[160px]')}>
            <SelectValue placeholder="Superficie" />
          </SelectTrigger>
          <SelectContent className="bg-[#161c25] border-white/[0.08] rounded-xl shadow-2xl">
            <SelectItem value="all" className="text-white/70 focus:bg-white/[0.06] focus:text-white">Todas</SelectItem>
            {COURT_SURFACE_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value} className="text-white/70 focus:bg-white/[0.06] focus:text-white">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* ── Content ── */}
      {loading && paginatedList.length === 0 ? (
        <div className="flex items-center justify-center h-56">
          <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
        </div>

      ) : paginatedList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white/10" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/35 mb-1">Sin canchas encontradas</p>
            <p className="text-xs text-white/20 mb-4">
              {search || filterType || filterSurface ? 'Prueba con otros filtros' : 'Crea tu primera cancha para comenzar'}
            </p>
            {!search && !filterType && !filterSurface && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Nueva Cancha
              </button>
            )}
          </div>
        </div>

      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {paginatedList.map(court => {
              const rating = typeof court.average_rating === 'number' ? court.average_rating
                : typeof court.average_rating === 'string' ? parseFloat(court.average_rating) : null;
              return (
                <div
                  key={court.id}
                  className="group bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.13] transition-all"
                >
                  {/* status accent line */}
                  <div className={cn(
                    'h-0.5 bg-gradient-to-r to-transparent',
                    court.is_maintenance
                      ? 'from-amber-400/60 via-amber-400/30'
                      : court.is_available
                        ? 'from-[#ace600]/60 via-[#ace600]/30'
                        : 'from-red-400/60 via-red-400/30',
                  )} />

                  <div className="p-4">
                    {/* name + status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors truncate">
                          {court.name}
                        </p>
                        <p className="text-[11px] text-white/30 mt-0.5">
                          {COURT_TYPE_LABEL[court.court_type] ?? court.court_type}
                          {' · '}
                          {SURFACE_LABEL[court.surface] ?? court.surface}
                        </p>
                      </div>
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0',
                        court.is_maintenance
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : court.is_available
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400',
                      )}>
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          court.is_maintenance ? 'bg-amber-400 animate-pulse' :
                          court.is_available ? 'bg-emerald-400' : 'bg-red-400',
                        )} />
                        {court.is_maintenance ? 'Mant.' : court.is_available ? 'Disponible' : 'No disp.'}
                      </span>
                    </div>

                    {/* description */}
                    {court.description && (
                      <p className="text-xs text-white/25 line-clamp-2 mb-3">{court.description}</p>
                    )}

                    {/* meta grid */}
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-0.5">Tarifa/Hora</p>
                        <p className="text-[11px] font-bold text-white/70">
                          {court.hourly_rate ? `$${Number(court.hourly_rate).toLocaleString('en-US')}` : '—'}
                        </p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-0.5">Capacidad</p>
                        <p className="text-[11px] font-bold text-white/70">
                          {court.capacity ? `${court.capacity} pers.` : '—'}
                        </p>
                      </div>
                    </div>

                    {/* badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {rating !== null && !isNaN(rating) && (
                        <Badge variant="outline" className="text-[10px] bg-amber-400/10 border-amber-400/20 text-amber-400 gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />{rating.toFixed(1)}
                        </Badge>
                      )}
                      {court.has_lighting && (
                        <Badge variant="outline" className="text-[10px] bg-sky-400/10 border-sky-400/20 text-sky-400">Ilum.</Badge>
                      )}
                      {court.is_featured && (
                        <Badge variant="outline" className="text-[10px] bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">Destacada</Badge>
                      )}
                    </div>

                    {/* actions */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openDetail(court)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-xl text-[11px] font-bold border border-[#ace600]/20 bg-[#ace600]/[0.05] hover:bg-[#ace600]/[0.10] text-[#ace600] transition-all"
                      >
                        <Eye className="w-3 h-3" /> Ver
                      </button>
                      <button
                        onClick={() => openEdit(court)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-xl text-[11px] font-bold border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-white/50 hover:text-white transition-all"
                      >
                        <Edit2 className="w-3 h-3" /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(court.id)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/[0.05] hover:bg-red-500/[0.12] text-red-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/[0.05] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cn(
                    'w-8 h-8 rounded-xl text-[11px] font-bold border transition-all',
                    n === page
                      ? 'bg-[#ace600] border-[#ace600] text-black shadow-[0_0_8px_rgba(172,230,0,0.15)]'
                      : 'border-white/[0.07] text-white/30 hover:text-white hover:bg-white/[0.05]',
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/[0.05] transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      <CourtActionModal
        isOpen={isModalOpen}
        court={selectedCourt}
        mode={selectedCourt ? 'edit' : 'view'}
        onClose={handleClose}
        onSaveSuccess={handleSaved}
      />

      <CourtDetailModal
        court={detailCourt}
        open={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setDetailCourt(null); }}
        onEdit={c => { setIsDetailOpen(false); openEdit(c); }}
      />
    </div>
  );
}
