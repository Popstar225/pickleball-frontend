import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Filter, MoreHorizontal, CheckCircle2, XCircle,
  Eye, Download, Upload, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, Mail, MapPin, Edit, Trash2, AlertCircle,
  X, ShieldCheck, Ban, Loader2, Building2, Phone, Award, Plus,
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { fetchClubs, updateClub, deleteClub } from '@/store/slices/clubsSlice';
import { RootState, AppDispatch } from '@/store';

// ─── Types ────────────────────────────────────────────────────────────────────
type SubscriptionPlan = 'basic' | 'pro' | 'premium';
type SortField = 'name' | 'contact_email' | 'createdAt' | 'state';
type SortOrder = 'asc' | 'desc';

interface Club {
  id: string; name: string; contact_person?: string; contact_email: string;
  contact_phone?: string; state?: string; city?: string; address?: string;
  website?: string; subscription_plan: SubscriptionPlan; membership_status: string;
  is_verified: boolean; is_active: boolean; is_featured?: boolean;
  member_count?: number; court_count?: number; average_rating?: string;
  total_tournaments?: number; createdAt: string;
}

interface PaginationData { page: number; limit: number; total: number; pages: number }

// ─── Constants ────────────────────────────────────────────────────────────────
const PLAN_STYLES: Record<SubscriptionPlan, { bg: string; border: string; text: string; label: string }> = {
  basic:   { bg: 'bg-white/[0.04]',  border: 'border-white/[0.08]',  text: 'text-white/40',   label: 'Básico'   },
  pro:     { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400',  label: 'Pro'      },
  premium: { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400',   label: 'Premium'  },
};

const selTrigger = 'h-9 bg-white/[0.04] border-white/[0.08] text-white/60 text-sm focus:border-[#ace600]/30 focus:ring-0 rounded-xl';
const selContent = 'bg-[#0d1117] border-white/[0.09] rounded-xl shadow-2xl';
const selItem    = 'text-white/60 focus:bg-white/[0.06] focus:text-white rounded-lg';

// ─── Atoms ────────────────────────────────────────────────────────────────────
function PlanPill({ plan }: { plan: SubscriptionPlan }) {
  const s = PLAN_STYLES[plan] ?? PLAN_STYLES.basic;
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest', s.bg, s.border, s.text)}>
      {s.label}
    </span>
  );
}

function InitialsAvatar({ name, active }: { name: string; active: boolean }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '—';
  return (
    <div className="relative shrink-0">
      <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
        <span className="text-[11px] font-black text-[#ace600]">{initials}</span>
      </div>
      {active && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#080c10]" />}
    </div>
  );
}

function SortTh({ label, field, current, order, onSort }: {
  label: string; field: SortField; current: SortField; order: SortOrder; onSort: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/20 h-10 px-4">
      <button onClick={() => onSort(field)}
        className={cn('flex items-center gap-1.5 hover:text-white/60 transition-colors', active && 'text-[#ace600]')}>
        {label}
        {active ? (order === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
      </button>
    </TableHead>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full border bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600] text-[10px] font-black uppercase tracking-widest">
      {label}
      <button onClick={onRemove}
        className="w-4 h-4 rounded-full bg-[#ace600]/20 hover:bg-[#ace600]/40 flex items-center justify-center transition-all">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClubsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { clubs: reduxClubs, loading: reduxLoading, error: reduxError, pagination: reduxPagination } =
    useSelector((state: RootState) => state.clubs);

  const [actionLoading,  setActionLoading]  = useState(false);
  const [actionError,    setActionError]    = useState<string | null>(null);
  const [successMsg,     setSuccessMsg]     = useState<string | null>(null);
  const [pagination,     setPagination]     = useState<PaginationData>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search,         setSearch]         = useState('');
  const [stateFilter,    setStateFilter]    = useState('all');
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [memberFilter,   setMemberFilter]   = useState('all');
  const [sortField,      setSortField]      = useState<SortField>('createdAt');
  const [sortOrder,      setSortOrder]      = useState<SortOrder>('desc');

  const loadData = useCallback(() => {
    dispatch(fetchClubs({ page: pagination.page, limit: pagination.limit } as any))
      .catch(() => setActionError('Error al cargar los clubes'));
  }, [dispatch, pagination.page, pagination.limit]);

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (reduxPagination) setPagination(p => ({ ...p, total: reduxPagination.total, pages: reduxPagination.pages }));
  }, [reduxPagination]);

  const clubs = useMemo(() => (reduxClubs as any) as Club[], [reduxClubs]);
  const uniqueStates = useMemo(() => Array.from(new Set(clubs.map(c => c.state ?? '').filter(Boolean))).sort(), [clubs]);

  const flash = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };

  const filtered = useMemo(() => {
    let r = [...clubs];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(c => c.name?.toLowerCase().includes(q) || c.contact_person?.toLowerCase().includes(q) || c.contact_email?.toLowerCase().includes(q) || c.state?.toLowerCase().includes(q));
    }
    if (stateFilter    !== 'all')       r = r.filter(c => c.state === stateFilter);
    if (statusFilter   === 'active')    r = r.filter(c => c.is_active);
    if (statusFilter   === 'inactive')  r = r.filter(c => !c.is_active);
    if (verifiedFilter === 'verified')  r = r.filter(c => c.is_verified);
    if (verifiedFilter === 'pending')   r = r.filter(c => !c.is_verified);
    if (memberFilter   !== 'all')       r = r.filter(c => c.subscription_plan === memberFilter);
    return r;
  }, [clubs, search, stateFilter, statusFilter, verifiedFilter, memberFilter]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    let av = (a as any)[sortField] ?? '', bv = (b as any)[sortField] ?? '';
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortOrder === 'asc' ? -1 : 1;
    if (av > bv) return sortOrder === 'asc' ?  1 : -1;
    return 0;
  }), [filtered, sortField, sortOrder]);

  const paginated = useMemo(() => sorted.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit), [sorted, pagination]);

  useEffect(() => {
    const total = sorted.length, pages = Math.ceil(total / pagination.limit);
    setPagination(p => ({ ...p, total, pages, page: Math.min(p.page, Math.max(1, pages)) }));
  }, [sorted, pagination.limit]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  const clearFilters = () => {
    setSearch(''); setStateFilter('all'); setStatusFilter('all');
    setVerifiedFilter('all'); setMemberFilter('all');
    setPagination(p => ({ ...p, page: 1 }));
  };
  const hasFilters = !!(search || stateFilter !== 'all' || statusFilter !== 'all' || verifiedFilter !== 'all' || memberFilter !== 'all');

  const handleVerify = async (id: string, current: boolean) => {
    setActionLoading(true); setActionError(null);
    try { await dispatch(updateClub({ id, data: { is_verified: !current } })).unwrap(); flash(`Club ${!current ? 'verificado' : 'verificación revocada'} exitosamente`); loadData(); }
    catch (e: any) { setActionError(e.message || 'Error al actualizar la verificación'); }
    finally { setActionLoading(false); }
  };

  const handleActivate = async (id: string, current: boolean) => {
    setActionLoading(true); setActionError(null);
    try { await dispatch(updateClub({ id, data: { is_active: !current } })).unwrap(); flash(`Club ${!current ? 'activado' : 'desactivado'} exitosamente`); loadData(); }
    catch (e: any) { setActionError(e.message || 'Error al actualizar el estado'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este club? Esta acción no se puede deshacer.')) return;
    setActionLoading(true); setActionError(null);
    try { await dispatch(deleteClub(id)).unwrap(); flash('Club eliminado exitosamente'); loadData(); }
    catch (e: any) { setActionError(e.message || 'Error al eliminar el club'); }
    finally { setActionLoading(false); }
  };

  const stats = useMemo(() => ({
    total:    clubs.length,
    verified: clubs.filter(c => c.is_verified).length,
    active:   clubs.filter(c => c.is_active).length,
    premium:  clubs.filter(c => c.subscription_plan === 'premium').length,
  }), [clubs]);

  return (
    <div className="space-y-5">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[22px] font-black text-white tracking-tight">Gestión de Clubes</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
              En vivo · {stats.total}
            </span>
          </div>
          <p className="text-xs text-white/25">Administra y supervisa todos los clubes del sistema</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={loadData} disabled={reduxLoading}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white text-xs font-bold disabled:opacity-40 transition-all">
            <RefreshCw className={cn('w-3.5 h-3.5', reduxLoading && 'animate-spin')} /> Actualizar
          </button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white text-xs font-bold transition-all">
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
          <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white text-xs font-bold transition-all">
            <Upload className="w-3.5 h-3.5" /> Importar
          </button>
          <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-black bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_16px_rgba(172,230,0,0.18)] hover:shadow-[0_0_24px_rgba(172,230,0,0.30)] transition-all">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} /> Nuevo Club
          </button>
        </div>
      </div>

      {/* ── Alerts ───────────────────────────────────────────────────────────── */}
      {(actionError || reduxError) && (
        <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/20 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-0.5">Error</p>
            <p className="text-xs text-red-400/60">{actionError || reduxError}</p>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-400/40 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-3 p-4 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="flex-1 text-xs text-emerald-400/80 font-medium self-center">{successMsg}</p>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400/40 hover:text-emerald-400 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: 'Total',       value: stats.total,    accent: 'text-[#ace600]' },
          { label: 'Verificados', value: stats.verified, accent: 'text-emerald-400' },
          { label: 'Activos',     value: stats.active,   accent: 'text-sky-400' },
          { label: 'Premium',     value: stats.premium,  accent: 'text-amber-400' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3.5 hover:border-white/[0.12] transition-colors">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">{label}</p>
            <p className={cn('text-2xl font-black leading-none', accent)}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, contacto, email o estado…"
            className="w-full pl-9 pr-8 h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/80 text-sm placeholder:text-white/20 outline-none focus:border-[#ace600]/30 transition-all" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className={selTrigger}><div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-white/20" /><SelectValue placeholder="Todos los estados" /></div></SelectTrigger>
            <SelectContent className={selContent}>
              <SelectItem value="all" className={selItem}>Todos los estados</SelectItem>
              {uniqueStates.map(s => <SelectItem key={s} value={s} className={selItem}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
            <SelectTrigger className={selTrigger}><div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-white/20" /><SelectValue placeholder="Verificación" /></div></SelectTrigger>
            <SelectContent className={selContent}>
              <SelectItem value="all"      className={selItem}>Todos</SelectItem>
              <SelectItem value="verified" className={selItem}>Verificados</SelectItem>
              <SelectItem value="pending"  className={selItem}>Pendientes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={selTrigger}><div className="flex items-center gap-2"><Filter className="w-3.5 h-3.5 text-white/20" /><SelectValue placeholder="Estado" /></div></SelectTrigger>
            <SelectContent className={selContent}>
              <SelectItem value="all"      className={selItem}>Todos</SelectItem>
              <SelectItem value="active"   className={selItem}>Activos</SelectItem>
              <SelectItem value="inactive" className={selItem}>Inactivos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={memberFilter} onValueChange={setMemberFilter}>
            <SelectTrigger className={selTrigger}><div className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-white/20" /><SelectValue placeholder="Membresía" /></div></SelectTrigger>
            <SelectContent className={selContent}>
              <SelectItem value="all"     className={selItem}>Todas</SelectItem>
              <SelectItem value="basic"   className={selItem}>Básica</SelectItem>
              <SelectItem value="pro"     className={selItem}>Pro</SelectItem>
              <SelectItem value="premium" className={selItem}>Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.05]">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Filtros:</span>
            {search         && <FilterChip label={`"${search}"`}  onRemove={() => setSearch('')} />}
            {stateFilter    !== 'all' && <FilterChip label={stateFilter}       onRemove={() => setStateFilter('all')} />}
            {verifiedFilter !== 'all' && <FilterChip label={verifiedFilter === 'verified' ? 'Verificados' : 'Pendientes'} onRemove={() => setVerifiedFilter('all')} />}
            {statusFilter   !== 'all' && <FilterChip label={statusFilter   === 'active'  ? 'Activos'     : 'Inactivos'}  onRemove={() => setStatusFilter('all')} />}
            {memberFilter   !== 'all' && <FilterChip label={PLAN_STYLES[memberFilter as SubscriptionPlan]?.label ?? memberFilter} onRemove={() => setMemberFilter('all')} />}
            <button onClick={clearFilters} className="text-[10px] font-black text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors">Limpiar todo</button>
          </div>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-white/20" />
            <span className="text-xs font-black text-white/25 uppercase tracking-widest">Clubes</span>
          </div>
          <div className="flex items-center gap-3">
            {!reduxLoading && (
              <span className="text-[11px] text-white/20 font-semibold">
                {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
              </span>
            )}
            <Select value={String(pagination.limit)} onValueChange={v => setPagination(p => ({ ...p, limit: Number(v), page: 1 }))}>
              <SelectTrigger className="h-7 w-16 bg-white/[0.04] border-white/[0.08] text-[11px] text-white/40 focus:ring-0 focus:border-[#ace600]/30 px-2 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent className={selContent}>
                {[5,10,20,50,100].map(n => <SelectItem key={n} value={String(n)} className={selItem}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {reduxLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
            <p className="text-xs text-white/20">Cargando clubes…</p>
          </div>
        )}

        {!reduxLoading && paginated.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white/10" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white/25 mb-1">No se encontraron clubes</p>
              <p className="text-xs text-white/15">{hasFilters ? 'Intenta ajustar los filtros de búsqueda.' : 'Crea el primer club para comenzar.'}</p>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/30 hover:text-white text-xs font-bold transition-all">
                <X className="w-3.5 h-3.5" /> Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!reduxLoading && paginated.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
                <SortTh label="Club"      field="name"          current={sortField} order={sortOrder} onSort={handleSort} />
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/20 h-10 px-4">Contacto</TableHead>
                <SortTh label="Email"     field="contact_email" current={sortField} order={sortOrder} onSort={handleSort} />
                <SortTh label="Estado"    field="state"         current={sortField} order={sortOrder} onSort={handleSort} />
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/20 h-10 px-4">Membresía</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/20 h-10 px-4">Verificación</TableHead>
                <SortTh label="Registro"  field="createdAt"     current={sortField} order={sortOrder} onSort={handleSort} />
                <TableHead className="w-12 px-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map(club => (
                <TableRow key={club.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">

                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={club.name} active={club.is_active} />
                      <div>
                        <p className="text-xs font-bold text-white/80 group-hover:text-white transition-colors leading-tight">{club.name}</p>
                        {(club.city || club.state) && <p className="text-[11px] text-white/25 mt-0.5">{[club.city, club.state].filter(Boolean).join(', ')}</p>}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-4">
                    <p className="text-xs text-white/45 font-medium">{club.contact_person || '—'}</p>
                    {club.contact_phone && <p className="text-[11px] text-white/25 flex items-center gap-1 mt-0.5"><Phone className="w-2.5 h-2.5" />{club.contact_phone}</p>}
                  </TableCell>

                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-white/40 font-medium">
                      <Mail className="w-3 h-3 text-white/20" />{club.contact_email}
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-white/40 font-medium">
                      <MapPin className="w-3 h-3 text-white/20" />{club.state || '—'}
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-4"><PlanPill plan={club.subscription_plan} /></TableCell>

                  <TableCell className="py-3.5 px-4">
                    {club.is_verified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" /> Verificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-amber-500/10 border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                        <XCircle className="w-3 h-3" /> Pendiente
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="py-3.5 px-4">
                    <span className="text-[11px] text-white/35 font-medium">
                      {new Date(club.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </TableCell>

                  <TableCell className="py-3.5 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-white/20 hover:text-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0d1117] border-white/[0.09] rounded-xl shadow-2xl p-1 w-48">
                        <DropdownMenuLabel className="text-[10px] font-black text-white/20 uppercase tracking-widest px-3 py-1.5">Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/[0.05] my-1" />
                        <DropdownMenuItem className="flex items-center gap-2.5 text-white/55 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer">
                          <Eye className="w-3.5 h-3.5" /> Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2.5 text-white/55 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer">
                          <Edit className="w-3.5 h-3.5" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/[0.05] my-1" />
                        <DropdownMenuItem onClick={() => handleVerify(club.id, club.is_verified)} disabled={actionLoading}
                          className="flex items-center gap-2.5 text-white/55 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer">
                          {club.is_verified ? <><Ban className="w-3.5 h-3.5" /> Revocar verificación</> : <><ShieldCheck className="w-3.5 h-3.5" /> Verificar club</>}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleActivate(club.id, club.is_active)} disabled={actionLoading}
                          className="flex items-center gap-2.5 text-white/55 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-bold cursor-pointer">
                          {club.is_active ? <><Ban className="w-3.5 h-3.5" /> Desactivar</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Activar</>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/[0.05] my-1" />
                        <DropdownMenuItem onClick={() => handleDelete(club.id)} disabled={actionLoading}
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
        {!reduxLoading && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.05]">
            <p className="text-xs text-white/20 font-semibold">Página {pagination.page} de {pagination.pages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPagination(p => ({ ...p, page: 1 }))} disabled={pagination.page === 1}
                className="h-7 px-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/25 hover:text-white text-[11px] font-bold disabled:opacity-25 transition-all">Primera</button>
              <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}
                className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/25 hover:text-white flex items-center justify-center disabled:opacity-25 transition-all">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pg = i + 1;
                if (pagination.pages > 5) {
                  if (pagination.page <= 3) pg = i + 1;
                  else if (pagination.page >= pagination.pages - 2) pg = pagination.pages - 4 + i;
                  else pg = pagination.page - 2 + i;
                }
                return (
                  <button key={i} onClick={() => setPagination(p => ({ ...p, page: pg }))}
                    className={cn('w-7 h-7 rounded-lg text-xs font-black transition-all',
                      pagination.page === pg
                        ? 'bg-[#ace600] text-black shadow-[0_0_10px_rgba(172,230,0,0.2)]'
                        : 'border border-white/[0.08] bg-white/[0.04] text-white/25 hover:text-white hover:bg-white/[0.08]'
                    )}>{pg}</button>
                );
              })}
              <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.pages}
                className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/25 hover:text-white flex items-center justify-center disabled:opacity-25 transition-all">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setPagination(p => ({ ...p, page: p.pages }))} disabled={pagination.page === pagination.pages}
                className="h-7 px-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/25 hover:text-white text-[11px] font-bold disabled:opacity-25 transition-all">Última</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}