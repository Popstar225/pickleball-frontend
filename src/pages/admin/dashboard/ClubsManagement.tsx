import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchClubs, updateClub, deleteClub } from '../../../store/slices/clubsSlice';
import { Club as APIClub, ClubsQueryParams } from '../../../types/api';
import { useToast } from '@/hooks/use-toast';
import ClubActionModal from './ActionModals/ClubActionModal';
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Upload,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Edit,
  Trash2,
  X,
  ShieldCheck,
  Ban,
  Users,
  Loader2,
  Building2,
  Phone,
  Award,
  Zap,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const inputCls =
  'w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white ' +
  'placeholder:text-white/20 px-3 outline-none transition-all ' +
  'focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03]';

const selectTriggerCls =
  'h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white/60 ' +
  'focus:border-[#ace600]/50 transition-all data-[state=open]:border-[#ace600]/50';

type SortField = 'name' | 'contact_email' | 'created_at' | 'state';
type SortOrder = 'asc' | 'desc';

// ─── Membership badge ─────────────────────────────────────────────────────────
const membershipCfg: Record<string, { label: string; cls: string }> = {
  active: { label: 'Activo', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  expired: { label: 'Expirado', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  suspended: { label: 'Suspendido', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  basic: { label: 'Básico', cls: 'bg-white/[0.05] text-white/40 border-white/[0.08]' },
  pro: { label: 'Pro', cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  premium: { label: 'Premium', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

function MemberBadge({ status }: { status: string }) {
  const cfg = membershipCfg[status] ?? {
    label: status || 'Pendiente',
    cls: 'bg-white/[0.04] text-white/30 border-white/[0.06]',
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600]">
      {label}
      <button onClick={onRemove} className="hover:opacity-60 transition-opacity ml-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClubsManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    clubs: storeClubs,
    loading: storeLoading,
    pagination: storePagination,
  } = useSelector((s: RootState) => s.clubs);
  const { toast } = useToast();

  const [clubs, setClubs] = useState<APIClub[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [membershipFilter, setMembershipFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<APIClub | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadClubs = useCallback(
    (params?: ClubsQueryParams) => {
      setLoading(true);
      dispatch(
        fetchClubs({ page: pagination.page, limit: pagination.limit, ...(params || {}) } as any),
      )
        .unwrap()
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res || [];
          setClubs((data as any)?.clubs ?? data);
          const pag = res?.pagination || storePagination;
          if (pag) setPagination((p) => ({ ...p, total: pag.total, pages: pag.pages }));
        })
        .catch((err: any) => toast({ title: 'Error', description: err?.message }))
        .finally(() => setLoading(false));
    },
    [dispatch, pagination.page, pagination.limit, storePagination, toast],
  );

  useEffect(() => {
    loadClubs();
  }, []);

  // ── Filter + sort + paginate (client-side) ──────────────────────────────────
  const filteredClubs = useMemo(() => {
    let f = [...(clubs || [])];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          (c.contact_person as any)?.toLowerCase().includes(q) ||
          c.contact_email?.toLowerCase().includes(q) ||
          c.state?.toLowerCase().includes(q),
      );
    }
    if (stateFilter !== 'all') f = f.filter((c) => c.state === stateFilter);
    if (statusFilter === 'active') f = f.filter((c) => (c as any).is_active);
    if (statusFilter === 'inactive') f = f.filter((c) => !(c as any).is_active);
    if (verifiedFilter === 'verified') f = f.filter((c) => c.is_verified === true);
    if (verifiedFilter === 'pending') f = f.filter((c) => c.is_verified !== true);
    if (membershipFilter !== 'all') f = f.filter((c) => c.membership_status === membershipFilter);
    return f;
  }, [clubs, search, stateFilter, statusFilter, verifiedFilter, membershipFilter]);

  const sortedClubs = useMemo(() => {
    return [...filteredClubs].sort((a, b) => {
      let av: any = (a as any)[sortField],
        bv: any = (b as any)[sortField];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredClubs, sortField, sortOrder]);

  const paginatedClubs = useMemo(() => {
    const s = (pagination.page - 1) * pagination.limit;
    return sortedClubs.slice(s, s + pagination.limit);
  }, [sortedClubs, pagination.page, pagination.limit]);

  useEffect(() => {
    const total = sortedClubs.length;
    const pages = Math.ceil(total / pagination.limit) || 0;
    setPagination((p) => ({ ...p, total, pages, page: Math.min(p.page, Math.max(1, pages)) }));
  }, [sortedClubs, pagination.limit]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-white/20" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#ace600]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#ace600]" />
    );
  };

  const clearFilters = () => {
    setSearch('');
    setStateFilter('all');
    setStatusFilter('all');
    setVerifiedFilter('all');
    setMembershipFilter('all');
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const hasFilters =
    search ||
    stateFilter !== 'all' ||
    statusFilter !== 'all' ||
    verifiedFilter !== 'all' ||
    membershipFilter !== 'all';

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });

  const initials = (name = '') =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const uniqueStates = useMemo(
    () => Array.from(new Set((clubs || []).map((c) => c.state).filter(Boolean))).sort(),
    [clubs],
  );

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleVerifyToggle = async (club: APIClub) => {
    try {
      await dispatch(
        updateClub({ id: club.id, data: { is_verified: !club.is_verified } }),
      ).unwrap();
      toast({ title: 'Verificación actualizada' });
      loadClubs();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message });
    }
  };

  const handleActiveToggle = async (club: APIClub) => {
    try {
      const newActive = !(club as any).is_active;
      await dispatch(updateClub({ id: club.id, data: { is_active: newActive } })).unwrap();
      toast({ title: newActive ? 'Club activado' : 'Club desactivado' });
      loadClubs();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este club? Esta acción no se puede deshacer.')) return;
    try {
      await dispatch(deleteClub(id)).unwrap();
      toast({ title: 'Club eliminado' });
      loadClubs();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message });
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const verified = (clubs || []).filter((c) => c.is_verified).length;
  const active = (clubs || []).filter((c) => (c as any).is_active).length;
  const premium = (clubs || []).filter((c) => c.subscription_plan === 'premium').length;

  const statCards = [
    {
      label: 'Total Clubes',
      value: pagination.total || clubs.length,
      icon: Building2,
      color: 'text-sky-400',
      accent: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      label: 'Activos',
      value: active,
      icon: Zap,
      color: 'text-emerald-400',
      accent: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Verificados',
      value: verified,
      icon: ShieldCheck,
      color: 'text-[#ace600]',
      accent: 'bg-[#ace600]/10 border-[#ace600]/20',
    },
    {
      label: 'Premium',
      value: premium,
      icon: Award,
      color: 'text-amber-400',
      accent: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  const thCls =
    'text-[10px] font-bold uppercase tracking-widest text-white/25 px-5 py-3.5 text-left';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 p-1">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Gestión de Clubes</h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" /> En vivo
            </span>
          </div>
          <p className="text-xs text-white/30">
            Administra y supervisa todos los clubes del sistema
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadClubs()}
            disabled={loading}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs font-semibold transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
          <button className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs font-semibold transition-all">
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
          <button className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs font-semibold transition-all">
            <Upload className="w-3.5 h-3.5" /> Importar
          </button>
          <button
            onClick={() => {
              setSelectedClub(null);
              setModalMode('create');
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold transition-all shadow-[0_0_14px_rgba(172,230,0,0.18)]"
          >
            <Building2 className="w-3.5 h-3.5" /> Nuevo Club
          </button>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, accent }) => (
          <div key={label} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                {label}
              </p>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center border ${accent}`}
              >
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold leading-none ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
          <input
            className={`${inputCls} pl-9 pr-9`}
            placeholder="Buscar por nombre, contacto, email o estado…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: MapPin,
              value: stateFilter,
              onChange: setStateFilter,
              placeholder: 'Todos los estados',
              options: [
                { v: 'all', l: 'Todos los estados' },
                ...uniqueStates.map((s) => ({ v: s as string, l: s as string })),
              ],
            },
            {
              icon: ShieldCheck,
              value: verifiedFilter,
              onChange: setVerifiedFilter,
              placeholder: 'Verificación',
              options: [
                { v: 'all', l: 'Todos' },
                { v: 'verified', l: 'Verificados' },
                { v: 'pending', l: 'Pendientes' },
              ],
            },
            {
              icon: Filter,
              value: statusFilter,
              onChange: setStatusFilter,
              placeholder: 'Estado',
              options: [
                { v: 'all', l: 'Todos' },
                { v: 'active', l: 'Activos' },
                { v: 'inactive', l: 'Inactivos' },
              ],
            },
            {
              icon: Award,
              value: membershipFilter,
              onChange: setMembershipFilter,
              placeholder: 'Membresía',
              options: [
                { v: 'all', l: 'Todas' },
                { v: 'basic', l: 'Básica' },
                { v: 'pro', l: 'Pro' },
                { v: 'premium', l: 'Premium' },
              ],
            },
          ].map(({ icon: Icon, value, onChange, placeholder, options }, i) => (
            <Select key={i} value={value} onValueChange={onChange}>
              <SelectTrigger className={selectTriggerCls}>
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                  <SelectValue placeholder={placeholder} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl">
                {options.map(({ v, l }) => (
                  <SelectItem
                    key={v}
                    value={v}
                    className="text-white/70 focus:bg-white/[0.06] focus:text-white"
                  >
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.05]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
              Filtros:
            </span>
            {search && <FilterChip label={`"${search}"`} onRemove={() => setSearch('')} />}
            {stateFilter !== 'all' && (
              <FilterChip label={stateFilter} onRemove={() => setStateFilter('all')} />
            )}
            {verifiedFilter !== 'all' && (
              <FilterChip
                label={verifiedFilter === 'verified' ? 'Verificados' : 'Pendientes'}
                onRemove={() => setVerifiedFilter('all')}
              />
            )}
            {statusFilter !== 'all' && (
              <FilterChip
                label={statusFilter === 'active' ? 'Activos' : 'Inactivos'}
                onRemove={() => setStatusFilter('all')}
              />
            )}
            {membershipFilter !== 'all' && (
              <FilterChip
                label={membershipCfg[membershipFilter]?.label ?? membershipFilter}
                onRemove={() => setMembershipFilter('all')}
              />
            )}
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/55 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* ── Results bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-white/30">
        <p>
          Mostrando{' '}
          <span className="font-semibold text-white/60">
            {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
          </span>
          {' – '}
          <span className="font-semibold text-white/60">
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>
          {' de '}
          <span className="font-semibold text-white/60">{pagination.total}</span> clubes
        </p>
        <div className="flex items-center gap-2">
          <span>Mostrar</span>
          <Select
            value={pagination.limit.toString()}
            onValueChange={(v) => setPagination((p) => ({ ...p, limit: Number(v), page: 1 }))}
          >
            <SelectTrigger className="w-18 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/60 text-xs px-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl">
              {[5, 10, 20, 50, 100].map((n) => (
                <SelectItem
                  key={n}
                  value={n.toString()}
                  className="text-white/70 focus:bg-white/[0.06] focus:text-white"
                >
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className={thCls}>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1.5 hover:text-white/50 transition-colors"
                  >
                    Club <SortIcon field="name" />
                  </button>
                </th>
                <th className={`${thCls} hidden lg:table-cell`}>Contacto</th>
                <th className={`${thCls} hidden md:table-cell`}>
                  <button
                    onClick={() => handleSort('contact_email')}
                    className="flex items-center gap-1.5 hover:text-white/50 transition-colors"
                  >
                    Email <SortIcon field="contact_email" />
                  </button>
                </th>
                <th className={`${thCls} hidden lg:table-cell`}>
                  <button
                    onClick={() => handleSort('state')}
                    className="flex items-center gap-1.5 hover:text-white/50 transition-colors"
                  >
                    Estado <SortIcon field="state" />
                  </button>
                </th>
                <th className={`${thCls} hidden sm:table-cell`}>Membresía</th>
                <th className={thCls}>Verificación</th>
                <th className={`${thCls} hidden xl:table-cell`}>
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-1.5 hover:text-white/50 transition-colors"
                  >
                    Registro <SortIcon field="created_at" />
                  </button>
                </th>
                <th className={thCls} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
                      <p className="text-xs text-white/25">Cargando clubes…</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedClubs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white/20" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/50 mb-1">
                          No se encontraron clubes
                        </p>
                        <p className="text-xs text-white/25">
                          Intenta ajustar los filtros de búsqueda
                        </p>
                      </div>
                      {hasFilters && (
                        <button
                          onClick={clearFilters}
                          className="flex items-center gap-1.5 text-xs text-[#ace600] hover:opacity-75 transition-opacity"
                        >
                          <RefreshCw className="w-3 h-3" /> Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClubs.map((club) => (
                  <tr
                    key={club.id}
                    className="group border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Club name + avatar */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-xs font-bold text-[#ace600]">
                            {initials(club.name)}
                          </div>
                          {(club as any).is_active && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0d1117]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white/75 truncate group-hover:text-white transition-colors">
                            {club.name}
                          </p>
                          <p className="text-[11px] text-white/30">
                            {[club.city, club.state].filter(Boolean).join(', ') || '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact person */}
                    <td className="hidden lg:table-cell px-5 py-3.5">
                      <p className="text-sm text-white/55">{club.contact_person || '—'}</p>
                      {(club as any).contact_phone && (
                        <p className="text-[11px] text-white/30 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {(club as any).contact_phone}
                        </p>
                      )}
                    </td>

                    {/* Email */}
                    <td className="hidden md:table-cell px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                        <span className="text-sm text-white/50 truncate max-w-[160px]">
                          {club.contact_email || '—'}
                        </span>
                      </div>
                    </td>

                    {/* State */}
                    <td className="hidden lg:table-cell px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-white/20 flex-shrink-0" />
                        <span className="text-sm text-white/50">{club.state || '—'}</span>
                      </div>
                    </td>

                    {/* Membership */}
                    <td className="hidden sm:table-cell px-5 py-3.5">
                      <MemberBadge status={club.membership_status || 'pending'} />
                    </td>

                    {/* Verified */}
                    <td className="px-5 py-3.5">
                      {club.is_verified ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-xs text-emerald-400 font-medium hidden xl:inline">
                            Verificado
                          </span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 xl:hidden" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-xs text-amber-400 font-medium hidden xl:inline">
                            Pendiente
                          </span>
                          <XCircle className="w-3.5 h-3.5 text-amber-400 xl:hidden" />
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="hidden xl:table-cell px-5 py-3.5">
                      <span className="text-xs text-white/30">{formatDate(club.created_at)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 rounded-xl flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl p-1"
                        >
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-2 py-1.5">
                            Acciones
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/[0.05] my-1" />
                          {[
                            {
                              icon: Eye,
                              label: 'Ver perfil',
                              onClick: () => {
                                setSelectedClub(club);
                                setModalMode('view');
                                setModalOpen(true);
                              },
                            },
                            {
                              icon: Edit,
                              label: 'Editar',
                              onClick: () => {
                                setSelectedClub(club);
                                setModalMode('edit');
                                setModalOpen(true);
                              },
                            },
                          ].map(({ icon: Icon, label, onClick }) => (
                            <DropdownMenuItem
                              key={label}
                              onClick={onClick}
                              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.06] cursor-pointer focus:bg-white/[0.06] focus:text-white"
                            >
                              <Icon className="w-3.5 h-3.5" /> {label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator className="bg-white/[0.05] my-1" />
                          <DropdownMenuItem
                            onClick={() => handleVerifyToggle(club)}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.06] cursor-pointer focus:bg-white/[0.06] focus:text-white"
                          >
                            {club.is_verified ? (
                              <>
                                <Ban className="w-3.5 h-3.5" /> Revocar verificación
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5" /> Verificar club
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleActiveToggle(club)}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.06] cursor-pointer focus:bg-white/[0.06] focus:text-white"
                          >
                            {(club as any).is_active ? (
                              <>
                                <Ban className="w-3.5 h-3.5" /> Desactivar
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/[0.05] my-1" />
                          <DropdownMenuItem
                            onClick={() => handleDelete(club.id)}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] cursor-pointer focus:bg-red-500/[0.08] focus:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {pagination.pages > 1 && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            Página <span className="font-semibold text-white/50">{pagination.page}</span> de{' '}
            <span className="font-semibold text-white/50">{pagination.pages}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: 1 }))}
              disabled={pagination.page === 1}
              className="h-8 px-3 rounded-xl border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.05] text-xs font-semibold disabled:opacity-25 transition-all"
            >
              Primera
            </button>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="w-8 h-8 rounded-xl border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.05] flex items-center justify-center disabled:opacity-25 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let p: number;
                if (pagination.pages <= 5) p = i + 1;
                else if (pagination.page <= 3) p = i + 1;
                else if (pagination.page >= pagination.pages - 2) p = pagination.pages - 4 + i;
                else p = pagination.page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPagination((prev) => ({ ...prev, page: p }))}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      pagination.page === p
                        ? 'bg-[#ace600] text-black shadow-[0_0_12px_rgba(172,230,0,0.2)]'
                        : 'border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="w-8 h-8 rounded-xl border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.05] flex items-center justify-center disabled:opacity-25 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.pages }))}
              disabled={pagination.page === pagination.pages}
              className="h-8 px-3 rounded-xl border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.05] text-xs font-semibold disabled:opacity-25 transition-all"
            >
              Última
            </button>
          </div>
        </div>
      )}

      <ClubActionModal
        isOpen={modalOpen}
        club={selectedClub}
        mode={modalMode}
        onClose={() => {
          setModalOpen(false);
          setSelectedClub(null);
        }}
        onSaveSuccess={() => loadClubs()}
      />
    </div>
  );
}
