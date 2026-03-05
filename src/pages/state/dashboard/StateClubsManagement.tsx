import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Search,
  Filter,
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
  Users,
  CheckCircle2,
  Star,
  Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppDispatch, RootState } from '@/store';
import { fetchClubs, updateClub, deleteClub } from '@/store/slices/clubsSlice';
import ClubActionModal from '@/pages/admin/dashboard/ActionModals/ClubActionModal';
import { cn } from '@/lib/utils';

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  pending: {
    label: 'Pendiente',
    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400 animate-pulse',
  },
  approved: {
    label: 'Aprobado',
    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  active: {
    label: 'Activo',
    cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    dot: 'bg-sky-400',
  },
  inactive: {
    label: 'Inactivo',
    cls: 'bg-red-500/10 text-red-400 border-red-500/20',
    dot: 'bg-red-400',
  },
  suspended: {
    label: 'Suspendido',
    cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    dot: 'bg-violet-400',
  },
};
const MEMBERSHIP_CFG: Record<string, { label: string; cls: string }> = {
  free: { label: 'Gratis', cls: 'bg-white/[0.04] text-white/30 border-white/[0.08]' },
  basic: { label: 'Básico', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  pro: { label: 'Pro', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  premium: { label: 'Premium', cls: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
};
const STATUS_OPTIONS = ['pending', 'approved', 'active', 'inactive', 'suspended'];
const MEMBERSHIP_OPTIONS = ['free', 'basic', 'pro', 'premium'];

// ─── Atoms ────────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? {
    label: status,
    cls: 'bg-white/[0.05] text-white/30 border-white/[0.08]',
    dot: 'bg-white/20',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap',
        c.cls,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
      {c.label}
    </span>
  );
}
function MembershipPill({ membership }: { membership: string }) {
  const c = MEMBERSHIP_CFG[membership] ?? {
    label: membership,
    cls: 'bg-white/[0.05] text-white/30 border-white/[0.08]',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap',
        c.cls,
      )}
    >
      {c.label}
    </span>
  );
}
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600] hover:opacity-70 transition-opacity"
    >
      {label} <X className="w-3 h-3" />
    </button>
  );
}

const inputCls = cn(
  'h-10 rounded-xl text-sm',
  'bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20',
  'focus-visible:ring-0 focus-visible:border-[#ace600]/50 transition-all',
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StateClubsManagement() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { clubs, loading, pagination } = useSelector((s: RootState) => s.clubs);
  const { user: currentUser } = useSelector((s: RootState) => s.auth);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', membership_status: 'all' });
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  useEffect(() => {
    const params: any = { page, limit, state: currentUser?.state };
    if (search) params.search = search;
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.membership_status !== 'all') params.membership_status = filters.membership_status;
    dispatch(fetchClubs(params));
  }, [dispatch, page, limit, search, filters, currentUser?.state]);

  const clearFilters = () => {
    setSearch('');
    setFilters({ status: 'all', membership_status: 'all' });
    setPage(1);
  };
  const openModal = (club: any, mode: 'view' | 'edit') => {
    setSelectedClub(club);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este club?')) return;
    try {
      await dispatch(deleteClub(id)).unwrap();
      toast({ title: 'Club eliminado', description: 'El club ha sido eliminado correctamente' });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'No se pudo eliminar el club',
        variant: 'destructive',
      });
    }
  };

  const clubList = clubs ?? [];
  const totalPages = Math.max(1, Math.ceil((pagination?.total ?? 0) / limit));
  const activeCount = clubList.filter((c: any) => c.status === 'active').length;
  const approvedCount = clubList.filter((c: any) => c.status === 'approved').length;
  const proCount = clubList.filter((c: any) => c.membership_status === 'pro').length;
  const hasFilters = !!(search || filters.status !== 'all' || filters.membership_status !== 'all');

  const pageNums = (() => {
    const start = Math.max(1, page - 2);
    return Array.from({ length: Math.min(5, totalPages - start + 1) }, (_, i) => start + i);
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-[#ace600]" />
          <h1 className="text-[22px] font-bold text-white tracking-tight">Gestión de Clubes</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
            {pagination?.total ?? 0} total
          </span>
        </div>
        <p className="text-xs text-white/25">Administra los clubes en tu estado</p>
      </div>

      {/* ── Stat strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          {
            label: 'Total de Clubes',
            value: pagination?.total ?? 0,
            color: 'text-white',
            bg: 'bg-white/[0.04] border-white/[0.08]',
            icon: Building2,
          },
          {
            label: 'Activos',
            value: activeCount,
            color: 'text-sky-400',
            bg: 'bg-sky-500/10 border-sky-500/20',
            icon: CheckCircle2,
          },
          {
            label: 'Aprobados',
            value: approvedCount,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
            icon: CheckCircle2,
          },
          {
            label: 'Plan Pro',
            value: proCount,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
            icon: Star,
          },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div
            key={label}
            className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">
                {label}
              </p>
              <p className={cn('text-[22px] font-bold leading-none', color)}>{value}</p>
            </div>
            <div
              className={cn(
                'w-8 h-8 rounded-xl border flex items-center justify-center shrink-0',
                bg,
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', color)} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4 space-y-3">
        {/* Search row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
            <input
              className={cn(inputCls, 'pl-10 pr-9 w-full border rounded-xl px-3 outline-none')}
              placeholder="Buscar club…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white transition-all shrink-0"
            >
              <X className="w-3.5 h-3.5" /> Limpiar
            </button>
          )}
        </div>

        {/* Pill filter rows */}
        <div className="space-y-2.5">
          {/* Status pills */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1.5">
              Estado
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['all', ...STATUS_OPTIONS].map((s) => {
                const active = filters.status === s;
                const c = STATUS_CFG[s];
                return (
                  <button
                    key={s}
                    onClick={() => {
                      setFilters((f) => ({ ...f, status: s }));
                      setPage(1);
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all',
                      active
                        ? s === 'all'
                          ? 'bg-[#ace600] border-[#ace600] text-black shadow-[0_0_8px_rgba(172,230,0,0.15)]'
                          : cn(c?.cls ?? '')
                        : 'bg-white/[0.03] border-white/[0.07] text-white/30 hover:text-white/55 hover:border-white/[0.12]',
                    )}
                  >
                    {active && c && (
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
                    )}
                    {s === 'all' ? 'Todos' : (c?.label ?? s)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Membership pills */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1.5">
              Membresía
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['all', ...MEMBERSHIP_OPTIONS].map((m) => {
                const active = filters.membership_status === m;
                const c = MEMBERSHIP_CFG[m];
                return (
                  <button
                    key={m}
                    onClick={() => {
                      setFilters((f) => ({ ...f, membership_status: m }));
                      setPage(1);
                    }}
                    className={cn(
                      'inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all',
                      active
                        ? m === 'all'
                          ? 'bg-[#ace600] border-[#ace600] text-black shadow-[0_0_8px_rgba(172,230,0,0.15)]'
                          : cn(c?.cls ?? '')
                        : 'bg-white/[0.03] border-white/[0.07] text-white/30 hover:text-white/55 hover:border-white/[0.12]',
                    )}
                  >
                    {m === 'all' ? 'Todos' : (c?.label ?? m)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.05]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
              Activos:
            </span>
            {search && <FilterChip label={`"${search}"`} onRemove={() => setSearch('')} />}
            {filters.status !== 'all' && (
              <FilterChip
                label={`Estado: ${STATUS_CFG[filters.status]?.label ?? filters.status}`}
                onRemove={() => setFilters((f) => ({ ...f, status: 'all' }))}
              />
            )}
            {filters.membership_status !== 'all' && (
              <FilterChip
                label={`Plan: ${MEMBERSHIP_CFG[filters.membership_status]?.label ?? filters.membership_status}`}
                onRemove={() => setFilters((f) => ({ ...f, membership_status: 'all' }))}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Results table ────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <p className="text-xs font-bold text-white/40">
            {pagination?.total ?? 0} club{(pagination?.total ?? 0) !== 1 ? 's' : ''} encontrado
            {(pagination?.total ?? 0) !== 1 ? 's' : ''}
          </p>
          {/* Per-page selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/20 hidden sm:inline">Por página:</span>
            <div className="flex gap-1">
              {[5, 10, 25, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setLimit(n);
                    setPage(1);
                  }}
                  className={cn(
                    'h-6 px-2.5 rounded-lg text-[10px] font-bold border transition-all',
                    limit === n
                      ? 'bg-[#ace600] border-[#ace600] text-black'
                      : 'bg-white/[0.03] border-white/[0.07] text-white/25 hover:text-white/50',
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-[#ace600] animate-spin" />
          </div>
        ) : clubList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white/10" />
            </div>
            <p className="text-sm text-white/25">No se encontraron clubes</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Club', 'Ubicación', 'Estado', 'Membresía', 'Coordinador', 'Creado', ''].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest text-white/20"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {clubList.map((club: any) => (
                    <tr key={club.id} className="group hover:bg-white/[0.02] transition-colors">
                      {/* Club name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[10px] font-black text-[#ace600] shrink-0 select-none">
                            {(club.name ?? '?')
                              .split(' ')
                              .map((w: string) => w[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="font-semibold text-white/80 group-hover:text-white transition-colors text-xs truncate max-w-[140px]">
                            {club.name}
                          </span>
                        </div>
                      </td>
                      {/* Location */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-white/30">
                          <MapPin className="w-3 h-3 text-white/15 shrink-0" />
                          {club.city || '—'}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusPill status={club.status ?? 'pending'} />
                      </td>
                      {/* Membership */}
                      <td className="py-3 px-4">
                        <MembershipPill membership={club.membership_status ?? 'free'} />
                      </td>
                      {/* Coordinator */}
                      <td className="py-3 px-4 text-[11px] text-white/30 truncate max-w-[120px]">
                        {club.coordinator_name || '—'}
                      </td>
                      {/* Date */}
                      <td className="py-3 px-4 text-[11px] text-white/25 whitespace-nowrap">
                        {new Date(club.created_at).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      {/* Actions */}
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.08] text-white/30 hover:text-white transition-all">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#13181f] border-white/[0.08] rounded-xl shadow-xl min-w-[140px] p-1"
                          >
                            <DropdownMenuItem
                              onClick={() => openModal(club, 'view')}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.06] cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openModal(club, 'edit')}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.06] cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Editar
                            </DropdownMenuItem>
                            <div className="h-px bg-white/[0.06] my-1" />
                            <DropdownMenuItem
                              onClick={() => handleDelete(club.id)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.06] gap-3 flex-wrap">
              <p className="text-[11px] text-white/25">
                Página <span className="text-white/50 font-semibold">{page}</span> de{' '}
                <span className="text-white/50 font-semibold">{totalPages}</span>
              </p>
              <div className="flex items-center gap-1">
                {/* First */}
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-white/[0.05]"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                {/* Prev */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-white/[0.05]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {/* Page numbers */}
                {pageNums.map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all',
                      n === page
                        ? 'bg-[#ace600] border-[#ace600] text-black shadow-[0_0_8px_rgba(172,230,0,0.15)]'
                        : 'border-white/[0.07] text-white/30 hover:text-white hover:bg-white/[0.05]',
                    )}
                  >
                    {n}
                  </button>
                ))}
                {/* Next */}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-white/[0.05]"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                {/* Last */}
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-white/[0.05]"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {selectedClub && (
        <ClubActionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedClub(null);
          }}
          club={selectedClub}
          mode={modalMode}
          onSaveSuccess={() => {
            setIsModalOpen(false);
            setSelectedClub(null);
            dispatch(fetchClubs({ page, limit, state: currentUser?.state }));
          }}
        />
      )}
    </div>
  );
}
