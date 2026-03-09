'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, MoreHorizontal, ChevronLeft, ChevronRight,
  Trash2, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown,
  Shield, X, UserCheck, UserX, Loader2,
  Users, Crown, TrendingUp, Activity, Zap,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { mockClubs } from '@/data/dashboardMockData';

// ─── Types ────────────────────────────────────────────────────────────────────
type UserRole         = 'admin' | 'manager' | 'moderator' | 'member';
type MembershipStatus = 'active' | 'inactive' | 'banned';
type SortField        = 'name' | 'email' | 'joined_date' | 'role';
type SortOrder        = 'asc' | 'desc';

interface Member {
  id: string; name: string; email: string; role: UserRole;
  club_name?: string; joined_date: string; status: MembershipStatus;
  is_verified: boolean; phone?: string; activity_date?: string;
}

// ─── Config tables ────────────────────────────────────────────────────────────
const ROLE_CFG: Record<UserRole, { label: string; textCls: string; bgCls: string; borderCls: string; dot: string }> = {
  admin:     { label: 'Admin',     textCls: 'text-rose-400',   bgCls: 'bg-rose-500/10',   borderCls: 'border-rose-500/25',   dot: 'bg-rose-400' },
  manager:   { label: 'Gerente',   textCls: 'text-violet-400', bgCls: 'bg-violet-500/10', borderCls: 'border-violet-500/25', dot: 'bg-violet-400' },
  moderator: { label: 'Moderador', textCls: 'text-sky-400',    bgCls: 'bg-sky-500/10',    borderCls: 'border-sky-500/25',    dot: 'bg-sky-400' },
  member:    { label: 'Miembro',   textCls: 'text-white/35',   bgCls: 'bg-white/[0.04]',  borderCls: 'border-white/[0.09]',  dot: 'bg-white/20' },
};
const STATUS_CFG: Record<MembershipStatus, { label: string; textCls: string; bgCls: string; borderCls: string; dot: string; pulse?: boolean }> = {
  active:   { label: 'Activo',    textCls: 'text-emerald-400', bgCls: 'bg-emerald-500/10', borderCls: 'border-emerald-500/25', dot: 'bg-emerald-400' },
  inactive: { label: 'Inactivo',  textCls: 'text-amber-400',   bgCls: 'bg-amber-500/10',   borderCls: 'border-amber-500/25',   dot: 'bg-amber-400', pulse: true },
  banned:   { label: 'Bloqueado', textCls: 'text-red-400',     bgCls: 'bg-red-500/10',     borderCls: 'border-red-500/25',     dot: 'bg-red-400' },
};

const ROLE_FILTERS    = ['all', 'admin', 'manager', 'moderator', 'member'] as const;
const STATUS_FILTERS  = ['all', 'active', 'inactive', 'banned'] as const;
const VERIFIED_FILTERS = ['all', 'verified', 'unverified'] as const;
const LIMIT = 10;

const fmtDate  = (d: string) => new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtShort = (d: string) => new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Pill({ label, textCls, bgCls, borderCls, dot, pulse }: {
  label: string; textCls: string; bgCls: string; borderCls: string; dot: string; pulse?: boolean;
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest whitespace-nowrap',
      textCls, bgCls, borderCls,
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot, pulse && 'animate-pulse')} />
      {label}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const letters = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[11px] font-black text-[#ace600] shrink-0 select-none">
      {letters || '?'}
    </div>
  );
}

function SortTh({ label, field, current, order, onClick }: {
  label: string; field: SortField; current: SortField; order: SortOrder; onClick: () => void;
}) {
  const active = field === current;
  return (
    <button onClick={onClick} className={cn(
      'inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors',
      active ? 'text-[#ace600]' : 'text-white/20 hover:text-white/45',
    )}>
      {label}
      {active ? (order === 'asc' ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />)
               : <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />}
    </button>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-bold bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600]">
      {label}
      <button onClick={onRemove} className="hover:opacity-60 transition-opacity ml-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StateMembers() {
  const [members,        setMembers]        = useState<Member[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [page,           setPage]           = useState(1);
  const [search,         setSearch]         = useState('');
  const [roleFilter,     setRoleFilter]     = useState('all');
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [sortField,      setSortField]      = useState<SortField>('joined_date');
  const [sortOrder,      setSortOrder]      = useState<SortOrder>('desc');

  const loadData = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const generated: Member[] = mockClubs.slice(0, 20).map((club: any, i: number) => ({
        id: `member-${i + 1}`,
        name: club.full_name || club.business_name || `Miembro ${i + 1}`,
        email: club.email,
        role: (['admin', 'manager', 'moderator', 'member'] as UserRole[])[i % 4],
        club_name: club.business_name,
        joined_date: club.created_at || new Date().toISOString(),
        status: (i % 10 === 0 ? 'inactive' : i % 9 === 0 ? 'banned' : 'active') as MembershipStatus,
        is_verified: i % 5 !== 0,
        phone: club.phone,
        activity_date: new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString(),
      }));
      setMembers(generated);
      setLoading(false);
    }, 300);
  }, []);

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    let r = [...members];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.club_name?.toLowerCase().includes(q));
    }
    if (roleFilter !== 'all')            r = r.filter(m => m.role === roleFilter);
    if (statusFilter !== 'all')          r = r.filter(m => m.status === statusFilter);
    if (verifiedFilter === 'verified')   r = r.filter(m => m.is_verified);
    if (verifiedFilter === 'unverified') r = r.filter(m => !m.is_verified);
    return r;
  }, [members, search, roleFilter, statusFilter, verifiedFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: any = a[sortField], bv: any = b[sortField];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / LIMIT));
  const curPage    = Math.min(page, totalPages);
  const paginated  = sorted.slice((curPage - 1) * LIMIT, curPage * LIMIT);

  const stats = useMemo(() => ({
    total:    members.length,
    admins:   filtered.filter(m => m.role === 'admin').length,
    managers: filtered.filter(m => m.role === 'manager').length,
    active:   filtered.filter(m => m.status === 'active').length,
    inactive: filtered.filter(m => m.status === 'inactive').length,
  }), [members, filtered]);

  const handleSort = (f: SortField) => {
    if (sortField === f) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortOrder('asc'); }
  };

  const clearAll = () => {
    setSearch(''); setRoleFilter('all');
    setStatusFilter('all'); setVerifiedFilter('all'); setPage(1);
  };
  const hasFilters = !!(search || roleFilter !== 'all' || statusFilter !== 'all' || verifiedFilter !== 'all');

  const assignRole   = (id: string, role: UserRole)           => setMembers(p => p.map(m => m.id === id ? { ...m, role }   : m));
  const changeStatus = (id: string, status: MembershipStatus) => setMembers(p => p.map(m => m.id === id ? { ...m, status } : m));
  const deleteMember = (id: string)                           => setMembers(p => p.filter(m => m.id !== id));

  const pageNums = (() => {
    const s = Math.max(1, Math.min(curPage - 2, totalPages - 4));
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => s + i);
  })();

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[22px] font-black text-white tracking-tight">Gestión de Miembros</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
              {stats.total} total
            </span>
          </div>
          <p className="text-xs text-white/25">Gestiona miembros, asigna roles y visualiza actividades</p>
        </div>
        <button onClick={loadData}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[11px] font-bold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/35 hover:text-white transition-all">
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          Actualizar
        </button>
      </div>

      {/* ── Stat strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { label: 'Total',     value: stats.total,    color: 'text-white/70',    iColor: 'text-white/30',    iBg: 'bg-white/[0.04] border-white/[0.08]',           Icon: Users      },
          { label: 'Admins',    value: stats.admins,   color: 'text-rose-400',    iColor: 'text-rose-400',    iBg: 'bg-rose-500/10 border-rose-500/20',              Icon: Crown      },
          { label: 'Gerentes',  value: stats.managers, color: 'text-violet-400',  iColor: 'text-violet-400',  iBg: 'bg-violet-500/10 border-violet-500/20',          Icon: Shield     },
          { label: 'Activos',   value: stats.active,   color: 'text-emerald-400', iColor: 'text-emerald-400', iBg: 'bg-emerald-500/10 border-emerald-500/20',        Icon: TrendingUp },
          { label: 'Inactivos', value: stats.inactive, color: 'text-amber-400',   iColor: 'text-amber-400',   iBg: 'bg-amber-500/10 border-amber-500/20',            Icon: Activity   },
        ].map(({ label, value, color, iColor, iBg, Icon }) => (
          <div key={label}
            className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 hover:border-white/[0.12] transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">{label}</p>
              <p className={cn('text-2xl font-black leading-none', color)}>{value}</p>
            </div>
            <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shrink-0', iBg)}>
              <Icon className={cn('w-4 h-4', iColor)} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter panel ────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
          <Input
            className="h-10 rounded-xl text-sm bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-[#ace600]/50 focus-visible:bg-[#ace600]/[0.03] transition-all pl-10 pr-10"
            placeholder="Buscar por nombre, email o club…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/55 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Pill filters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Role */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Rol</p>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_FILTERS.map(r => {
                const active = roleFilter === r;
                const cfg    = ROLE_CFG[r as UserRole];
                return (
                  <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
                    className={cn(
                      'inline-flex items-center gap-1.5 h-7 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                      active
                        ? r === 'all'
                          ? 'bg-[#ace600] border-[#ace600] text-black shadow-[0_0_8px_rgba(172,230,0,0.15)]'
                          : cn(cfg.bgCls, cfg.borderCls, cfg.textCls)
                        : 'bg-white/[0.02] border-white/[0.07] text-white/25 hover:text-white/55 hover:border-white/[0.12]',
                    )}>
                    {active && cfg && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />}
                    {r === 'all' ? 'Todos' : cfg?.label ?? r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Estado</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map(s => {
                const active = statusFilter === s;
                const cfg    = STATUS_CFG[s as MembershipStatus];
                return (
                  <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                    className={cn(
                      'inline-flex items-center gap-1.5 h-7 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                      active
                        ? s === 'all'
                          ? 'bg-[#ace600] border-[#ace600] text-black shadow-[0_0_8px_rgba(172,230,0,0.15)]'
                          : cn(cfg.bgCls, cfg.borderCls, cfg.textCls)
                        : 'bg-white/[0.02] border-white/[0.07] text-white/25 hover:text-white/55 hover:border-white/[0.12]',
                    )}>
                    {active && cfg && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />}
                    {s === 'all' ? 'Todos' : cfg?.label ?? s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verified */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Verificación</p>
            <div className="flex flex-wrap gap-1.5">
              {VERIFIED_FILTERS.map(v => {
                const active = verifiedFilter === v;
                return (
                  <button key={v} onClick={() => { setVerifiedFilter(v); setPage(1); }}
                    className={cn(
                      'inline-flex items-center h-7 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                      active
                        ? 'bg-[#ace600] border-[#ace600] text-black shadow-[0_0_8px_rgba(172,230,0,0.15)]'
                        : 'bg-white/[0.02] border-white/[0.07] text-white/25 hover:text-white/55 hover:border-white/[0.12]',
                    )}>
                    {v === 'all' ? 'Todos' : v === 'verified' ? 'Verificado' : 'No verificado'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active chips */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.05]">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Filtros:</span>
            {search && <FilterChip label={`"${search}"`} onRemove={() => setSearch('')} />}
            {roleFilter !== 'all'    && <FilterChip label={`Rol: ${ROLE_CFG[roleFilter as UserRole]?.label}`}         onRemove={() => setRoleFilter('all')} />}
            {statusFilter !== 'all'  && <FilterChip label={`Estado: ${STATUS_CFG[statusFilter as MembershipStatus]?.label}`} onRemove={() => setStatusFilter('all')} />}
            {verifiedFilter !== 'all'&& <FilterChip label={verifiedFilter === 'verified' ? 'Verificado' : 'No verificado'}  onRemove={() => setVerifiedFilter('all')} />}
            <button onClick={clearAll} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/45 transition-colors ml-1">
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* ── Table card ──────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">

        {/* Meta bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-[#ace600]" />
            <p className="text-[11px] font-bold text-white/35">
              <span className="text-white/60">{sorted.length}</span> resultado{sorted.length !== 1 ? 's' : ''}
              {hasFilters && <span className="text-white/20"> · filtrado de {members.length}</span>}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
            <p className="text-xs text-white/20">Cargando miembros…</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Users className="w-5 h-5 text-white/10" />
            </div>
            <p className="text-sm font-semibold text-white/25">Sin resultados</p>
            <p className="text-xs text-white/15">Ajusta los filtros para ver miembros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.04] hover:bg-transparent">
                  <TableHead className="py-3 px-5 w-[230px]">
                    <SortTh label="Nombre" field="name" current={sortField} order={sortOrder} onClick={() => handleSort('name')} />
                  </TableHead>
                  <TableHead className="py-3 px-4 hidden md:table-cell">
                    <SortTh label="Email" field="email" current={sortField} order={sortOrder} onClick={() => handleSort('email')} />
                  </TableHead>
                  <TableHead className="py-3 px-4 hidden lg:table-cell">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Club</span>
                  </TableHead>
                  <TableHead className="py-3 px-4">
                    <SortTh label="Rol" field="role" current={sortField} order={sortOrder} onClick={() => handleSort('role')} />
                  </TableHead>
                  <TableHead className="py-3 px-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Estado</span>
                  </TableHead>
                  <TableHead className="py-3 px-4 hidden xl:table-cell">
                    <SortTh label="Fecha" field="joined_date" current={sortField} order={sortOrder} onClick={() => handleSort('joined_date')} />
                  </TableHead>
                  <TableHead className="py-3 px-4 w-10" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.map(m => {
                  const rc = ROLE_CFG[m.role];
                  const sc = STATUS_CFG[m.status];
                  return (
                    <TableRow key={m.id}
                      className="border-white/[0.04] hover:bg-white/[0.02] transition-colors group">

                      {/* Name */}
                      <TableCell className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={m.name} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white/70 group-hover:text-white transition-colors truncate leading-tight">
                              {m.name}
                            </p>
                            {m.is_verified && (
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#ace600]/55">✓ verificado</span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="py-3 px-4 hidden md:table-cell">
                        <span className="text-[11px] text-white/30 truncate max-w-[180px] block font-medium">{m.email}</span>
                      </TableCell>

                      {/* Club */}
                      <TableCell className="py-3 px-4 hidden lg:table-cell">
                        <span className="text-[11px] text-white/30 truncate max-w-[130px] block">{m.club_name || '—'}</span>
                      </TableCell>

                      {/* Role */}
                      <TableCell className="py-3 px-4">
                        <Pill {...rc} />
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3 px-4">
                        <Pill {...sc} />
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-3 px-4 hidden xl:table-cell">
                        <div>
                          <p className="text-[11px] text-white/40 font-medium">{fmtDate(m.joined_date)}</p>
                          {m.activity_date && (
                            <p className="text-[10px] text-white/20 mt-0.5">↑ {fmtShort(m.activity_date)}</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.08] text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end"
                            className="bg-[#13181f] border-white/[0.08] rounded-xl shadow-2xl min-w-[190px] p-1">

                            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-white/20 px-3 py-2">
                              Asignar Rol
                            </DropdownMenuLabel>
                            {(['admin', 'manager', 'moderator'] as UserRole[]).map(role => {
                              const c = ROLE_CFG[role];
                              return (
                                <DropdownMenuItem key={role} onClick={() => assignRole(m.id, role)}
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs cursor-pointer hover:bg-white/[0.05] transition-colors">
                                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
                                  <span className={cn('font-bold', c.textCls)}>{c.label}</span>
                                </DropdownMenuItem>
                              );
                            })}

                            <DropdownMenuSeparator className="bg-white/[0.05] my-1" />

                            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-white/20 px-3 py-2">
                              Cambiar Estado
                            </DropdownMenuLabel>
                            {(['active', 'inactive', 'banned'] as MembershipStatus[]).map(status => {
                              const c = STATUS_CFG[status];
                              return (
                                <DropdownMenuItem key={status} onClick={() => changeStatus(m.id, status)}
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs cursor-pointer hover:bg-white/[0.05] transition-colors">
                                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
                                  <span className={cn('font-bold', c.textCls)}>{c.label}</span>
                                </DropdownMenuItem>
                              );
                            })}

                            <DropdownMenuSeparator className="bg-white/[0.05] my-1" />

                            <DropdownMenuItem onClick={() => deleteMember(m.id)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] cursor-pointer transition-colors">
                              <Trash2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-bold">Eliminar Miembro</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.05] flex-wrap gap-3">
            <p className="text-[11px] text-white/25">
              Mostrando{' '}
              <span className="text-white/50 font-bold">{(curPage - 1) * LIMIT + 1}–{Math.min(curPage * LIMIT, sorted.length)}</span>
              {' '}de <span className="text-white/50 font-bold">{sorted.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={curPage === 1}
                className="h-7 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-white/[0.05]">
                ««
              </button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={curPage === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-white/[0.05]">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {pageNums.map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border transition-all',
                    n === curPage
                      ? 'bg-[#ace600] border-[#ace600] text-black shadow-[0_0_8px_rgba(172,230,0,0.15)]'
                      : 'border-white/[0.07] text-white/30 hover:text-white hover:bg-white/[0.05]',
                  )}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={curPage >= totalPages}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-white/[0.05]">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={curPage >= totalPages}
                className="h-7 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-white/[0.05]">
                »»
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}