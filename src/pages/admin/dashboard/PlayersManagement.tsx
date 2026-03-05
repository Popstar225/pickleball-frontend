import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchAdminUsers, updateUser, deleteUser } from '../../../store/slices/usersSlice';
import UserActionModal from './ActionModals/UserActionModal';
import { useToast } from '@/hooks/use-toast';
import { User } from '../../../types/api';
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Eye,
  UserPlus,
  Download,
  Upload,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Trophy,
  Edit,
  Trash2,
  UserCheck,
  X,
  ShieldCheck,
  Ban,
  Activity,
  Clock,
  Users,
  Loader2,
  Zap,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const inputCls =
  'w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white ' +
  'placeholder:text-white/20 px-3 outline-none transition-all duration-150 ' +
  'focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03]';

const selectTriggerCls =
  'h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white ' +
  'focus:border-[#ace600]/50 transition-all data-[state=open]:border-[#ace600]/50';

// ─── Type helpers ─────────────────────────────────────────────────────────────
type UserType = 'player' | 'coach' | 'club' | 'partner' | 'state' | 'admin';
type MembershipStatus = 'basic' | 'pro' | 'premium' | 'free' | 'expired';
type SortField = 'full_name' | 'email' | 'created_at' | 'user_type';
type SortOrder = 'asc' | 'desc';

const userTypeCfg: Record<string, { label: string; cls: string }> = {
  player: { label: 'Jugador', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  coach: { label: 'Entrenador', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  club: { label: 'Club', cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  partner: { label: 'Socio', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  state: { label: 'Estado', cls: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  admin: { label: 'Admin', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const membershipCfg: Record<string, { label: string; cls: string }> = {
  free: { label: 'Gratis', cls: 'bg-white/[0.05] text-white/35 border-white/[0.08]' },
  basic: { label: 'Básico', cls: 'bg-white/[0.06] text-white/45 border-white/[0.1]' },
  pro: { label: 'Pro', cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  premium: { label: 'Premium', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  expired: { label: 'Expirado', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

function TypeBadge({ type }: { type: string }) {
  const cfg = userTypeCfg[type] ?? {
    label: type,
    cls: 'bg-white/[0.05] text-white/40 border-white/[0.08]',
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

function MemberBadge({ status }: { status: string }) {
  const cfg = membershipCfg[status] ?? {
    label: status,
    cls: 'bg-white/[0.05] text-white/35 border-white/[0.07]',
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
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PlayersManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, pagination } = useSelector((s: RootState) => s.users);
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const buildParams = useCallback(() => {
    const p: Record<string, string> = {
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
    };
    if (search.trim()) p.search = search.trim();
    if (userTypeFilter !== 'all') p.user_type = userTypeFilter;
    if (statusFilter === 'active') p.is_active = 'true';
    if (statusFilter === 'inactive') p.is_active = 'false';
    if (verifiedFilter === 'verified') p.is_verified = 'true';
    if (verifiedFilter === 'pending') p.is_verified = 'false';
    if (membershipFilter !== 'all') p.membership_status = membershipFilter;
    return p;
  }, [
    currentPage,
    itemsPerPage,
    search,
    userTypeFilter,
    statusFilter,
    verifiedFilter,
    membershipFilter,
  ]);

  const fetchUsers = useCallback(() => {
    dispatch(fetchAdminUsers(buildParams() as any));
  }, [buildParams, dispatch]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchUsers();
    }, 450);
    return () => clearTimeout(t);
  }, [search, userTypeFilter, statusFilter, verifiedFilter, membershipFilter]);

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

  const sortedUsers = useMemo(() => {
    if (!users) return [];
    return [...users].sort((a: any, b: any) => {
      let av = a[sortField],
        bv = b[sortField];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortField, sortOrder]);

  const hasFilters =
    search ||
    userTypeFilter !== 'all' ||
    statusFilter !== 'all' ||
    verifiedFilter !== 'all' ||
    membershipFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setUserTypeFilter('all');
    setStatusFilter('all');
    setVerifiedFilter('all');
    setMembershipFilter('all');
  };

  const pd = pagination ?? { page: currentPage, limit: itemsPerPage, total: 0, pages: 0 };

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openModal = (user: User, mode: 'view' | 'edit') => {
    setSelectedUser(user);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleSaveSuccess = () => {
    toast({ title: 'Éxito', description: `Usuario actualizado correctamente`, duration: 3000 });
    setIsModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  // ── Stats derived from current page ───────────────────────────────────────
  const activeCount = (users ?? []).filter((u: any) => u.is_active).length;
  const verifiedCount = (users ?? []).filter((u: any) => u.is_verified).length;
  const proCount = (users ?? []).filter((u: any) => u.membership_status === 'pro').length;

  const statCards = [
    {
      label: 'Total Usuarios',
      value: pd.total,
      icon: Users,
      color: 'text-sky-400',
      accent: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      label: 'Activos',
      value: activeCount,
      icon: Activity,
      color: 'text-emerald-400',
      accent: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Verificados',
      value: verifiedCount,
      icon: ShieldCheck,
      color: 'text-[#ace600]',
      accent: 'bg-[#ace600]/10 border-[#ace600]/20',
    },
    {
      label: 'Plan Pro',
      value: proCount,
      icon: Trophy,
      color: 'text-violet-400',
      accent: 'bg-violet-500/10 border-violet-500/20',
    },
  ];

  return (
    <div className="space-y-5 p-1">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Gestión de Usuarios</h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600] uppercase tracking-wider">
              <Zap className="w-2.5 h-2.5" /> En vivo
            </span>
          </div>
          <p className="text-xs text-white/30">
            Administra y supervisa todos los usuarios del sistema
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs font-semibold transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs font-semibold transition-all">
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
          <button className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs font-semibold transition-all">
            <Upload className="w-3.5 h-3.5" /> Importar
          </button>
          <button className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold transition-all shadow-[0_0_14px_rgba(172,230,0,0.18)]">
            <UserPlus className="w-3.5 h-3.5" /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
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

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 space-y-4">
        {/* search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
          <input
            className={`${inputCls} pl-9 pr-9`}
            placeholder="Buscar por nombre, email o usuario…"
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

        {/* filter dropdowns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: Filter,
              value: userTypeFilter,
              onChange: setUserTypeFilter,
              placeholder: 'Tipo de usuario',
              options: [
                { v: 'all', l: 'Todos los tipos' },
                { v: 'player', l: 'Jugadores' },
                { v: 'coach', l: 'Entrenadores' },
                { v: 'club', l: 'Clubes' },
                { v: 'partner', l: 'Socios' },
                { v: 'state', l: 'Estados' },
                { v: 'admin', l: 'Admins' },
              ],
            },
            {
              icon: UserCheck,
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
              icon: Activity,
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
              icon: Trophy,
              value: membershipFilter,
              onChange: setMembershipFilter,
              placeholder: 'Membresía',
              options: [
                { v: 'all', l: 'Todas' },
                { v: 'free', l: 'Gratis' },
                { v: 'basic', l: 'Básica' },
                { v: 'pro', l: 'Pro' },
                { v: 'premium', l: 'Premium' },
                { v: 'expired', l: 'Expirada' },
              ],
            },
          ].map(({ icon: Icon, value, onChange, placeholder, options }, i) => (
            <div key={i} className="relative">
              <Select value={value} onValueChange={onChange}>
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
            </div>
          ))}
        </div>

        {/* active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.05]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
              Filtros:
            </span>
            {search && <FilterChip label={`"${search}"`} onRemove={() => setSearch('')} />}
            {userTypeFilter !== 'all' && (
              <FilterChip
                label={userTypeCfg[userTypeFilter]?.label ?? userTypeFilter}
                onRemove={() => setUserTypeFilter('all')}
              />
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

      {/* ── Results bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-white/30">
        <p>
          Mostrando{' '}
          <span className="font-semibold text-white/60">
            {pd.total === 0 ? 0 : (pd.page - 1) * pd.limit + 1}
          </span>
          {' – '}
          <span className="font-semibold text-white/60">
            {Math.min(pd.page * pd.limit, pd.total)}
          </span>
          {' de '}
          <span className="font-semibold text-white/60">{pd.total}</span> usuarios
        </p>
        <div className="flex items-center gap-2">
          <span>Mostrar</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(v) => {
              setItemsPerPage(Number(v));
              setCurrentPage(1);
            }}
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

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {[
                  { label: 'Usuario', field: 'full_name' as SortField, always: true },
                  { label: 'Email', field: 'email' as SortField, always: false },
                  { label: 'Tipo', field: 'user_type' as SortField, always: true },
                  { label: 'Membresía', field: null, always: false },
                  { label: 'Estado', field: null, always: true },
                  { label: 'Registro', field: 'created_at' as SortField, always: false },
                  { label: '', field: null, always: true },
                ].map(({ label, field, always }, i) => (
                  <th
                    key={i}
                    className={`px-5 py-3.5 text-left ${always ? '' : 'hidden md:table-cell'}`}
                  >
                    {field ? (
                      <button
                        onClick={() => handleSort(field)}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/25 hover:text-white/50 transition-colors"
                      >
                        {label} <SortIcon field={field} />
                      </button>
                    ) : label ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                        {label}
                      </span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
                      <p className="text-xs text-white/25">Cargando usuarios…</p>
                    </div>
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                        <Search className="w-6 h-6 text-white/20" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/50 mb-1">
                          No se encontraron usuarios
                        </p>
                        <p className="text-xs text-white/25">
                          Intenta ajustar los filtros de búsqueda
                        </p>
                      </div>
                      {hasFilters && (
                        <button
                          onClick={clearFilters}
                          className="flex items-center gap-1.5 text-xs text-[#ace600] hover:opacity-80 transition-opacity"
                        >
                          <RefreshCw className="w-3 h-3" /> Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user: any) => (
                  <tr
                    key={user.id}
                    className="group border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-xs font-bold text-[#ace600]">
                            {initials(user.full_name)}
                          </div>
                          {user.is_active && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0d1117]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white/75 truncate group-hover:text-white transition-colors">
                            {user.full_name}
                          </p>
                          <p className="text-[11px] text-white/30">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="hidden md:table-cell px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                        <span className="text-sm text-white/50 truncate max-w-[180px]">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-5 py-3.5">
                      <TypeBadge type={user.user_type} />
                    </td>
                    {/* Membership */}
                    <td className="hidden md:table-cell px-5 py-3.5">
                      <MemberBadge status={user.membership_status} />
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {user.is_verified ? (
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
                          <Clock className="w-3.5 h-3.5 text-amber-400 xl:hidden" />
                        </div>
                      )}
                    </td>
                    {/* Date */}
                    <td className="hidden md:table-cell px-5 py-3.5">
                      <span className="text-xs text-white/30">{formatDate(user.created_at)}</span>
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
                          <DropdownMenuItem
                            onClick={() => openModal(user, 'view')}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.06] cursor-pointer focus:bg-white/[0.06] focus:text-white"
                          >
                            <Eye className="w-3.5 h-3.5" /> Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openModal(user, 'edit')}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.06] cursor-pointer focus:bg-white/[0.06] focus:text-white"
                          >
                            <Edit className="w-3.5 h-3.5" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.06] cursor-pointer focus:bg-white/[0.06] focus:text-white">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {user.is_verified ? 'Revocar verificación' : 'Verificar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.06] cursor-pointer focus:bg-white/[0.06] focus:text-white">
                            <Ban className="w-3.5 h-3.5" />
                            {user.is_active ? 'Desactivar' : 'Activar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/[0.05] my-1" />
                          <DropdownMenuItem
                            onClick={() => openModal(user, 'edit')}
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

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {pd.pages > 1 && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            Página <span className="font-semibold text-white/50">{pd.page}</span> de{' '}
            <span className="font-semibold text-white/50">{pd.pages}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pd.page === 1}
              className="h-8 px-3 rounded-xl border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.05] text-xs font-semibold disabled:opacity-25 transition-all"
            >
              Primera
            </button>
            <button
              onClick={() => handlePageChange(pd.page - 1)}
              disabled={pd.page === 1}
              className="w-8 h-8 rounded-xl border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.05] flex items-center justify-center disabled:opacity-25 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, pd.pages) }, (_, i) => {
                let p: number;
                if (pd.pages <= 5) p = i + 1;
                else if (pd.page <= 3) p = i + 1;
                else if (pd.page >= pd.pages - 2) p = pd.pages - 4 + i;
                else p = pd.page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      pd.page === p
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
              onClick={() => handlePageChange(pd.page + 1)}
              disabled={pd.page === pd.pages}
              className="w-8 h-8 rounded-xl border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.05] flex items-center justify-center disabled:opacity-25 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(pd.pages)}
              disabled={pd.page === pd.pages}
              className="h-8 px-3 rounded-xl border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.05] text-xs font-semibold disabled:opacity-25 transition-all"
            >
              Última
            </button>
          </div>
        </div>
      )}

      <UserActionModal
        isOpen={isModalOpen}
        user={selectedUser}
        mode={modalMode}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
