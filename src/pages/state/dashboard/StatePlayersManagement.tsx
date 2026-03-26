import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Users,
  Search,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  AlertTriangle,
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
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { RootState } from '@/store';
import { api } from '@/lib/api';
import UserActionModal from '@/pages/admin/dashboard/ActionModals/UserActionModal';

/* ─── shared styles ── */
const selTrigger =
  'h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white/70 px-3 focus:border-white/20 transition-colors w-full';
const selContent = 'bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl';
const selItem = 'text-white/70 focus:bg-white/[0.06] focus:text-white';

/* ─── helpers ── */
function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function initials(name?: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/* ─── badge configs ── */
const typeCfg: Record<string, { label: string; color: string; bg: string; border: string }> = {
  player: { label: 'Jugador', color: 'text-blue-400', bg: 'bg-blue-500/[0.08]', border: 'border-blue-500/20' },
  coach: { label: 'Entrenador', color: 'text-purple-400', bg: 'bg-purple-500/[0.08]', border: 'border-purple-500/20' },
  club: { label: 'Club', color: 'text-emerald-400', bg: 'bg-emerald-500/[0.08]', border: 'border-emerald-500/20' },
  partner: { label: 'Socio', color: 'text-amber-400', bg: 'bg-amber-500/[0.08]', border: 'border-amber-500/20' },
};

const memberCfg: Record<string, { label: string; color: string; bg: string; border: string }> = {
  free: { label: 'Gratis', color: 'text-white/40', bg: 'bg-white/[0.04]', border: 'border-white/[0.07]' },
  basic: { label: 'Básico', color: 'text-sky-400', bg: 'bg-sky-500/[0.08]', border: 'border-sky-500/20' },
  pro: { label: 'Pro', color: 'text-amber-400', bg: 'bg-amber-500/[0.08]', border: 'border-amber-500/20' },
  premium: { label: 'Premium', color: 'text-[#ace600]', bg: 'bg-[#ace600]/[0.08]', border: 'border-[#ace600]/20' },
  expired: { label: 'Expirado', color: 'text-red-400', bg: 'bg-red-500/[0.08]', border: 'border-red-500/20' },
};

function Pill({ cfg }: { cfg: { label: string; color: string; bg: string; border: string } }) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

/* ─── Delete confirm dialog ── */
function DeleteDialog({
  open,
  name,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm p-0 shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="w-11 h-11 rounded-2xl bg-red-500/[0.08] border border-red-500/15 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-base font-bold text-white mb-1">¿Eliminar miembro?</h2>
          <p className="text-sm text-white/35 leading-relaxed">
            Estás a punto de eliminar a{' '}
            <span className="text-white/60 font-medium">"{name}"</span>. Esta acción no puede deshacerse.
          </p>
        </div>
        <div className="flex gap-2.5 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-semibold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-9 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Eliminar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Stat card ── */
function StatCard({
  label,
  value,
  accent,
  loading,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  loading: boolean;
}) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl px-4 py-3.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-[#ace600]' : 'text-white'}`}>
        {loading ? '—' : value}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */

export default function StatePlayersManagement() {
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<{ total: number; page: number; pages: number } | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [filterMembership, setFilterMembership] = useState('all');

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: any | null }>({ open: false, user: null });
  const [editForm, setEditForm] = useState<{ is_active: boolean; membership_status: string }>({ is_active: true, membership_status: 'free' });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: '',
    name: '',
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) params.append('search', search);
      if (filterType !== 'all') params.append('user_type', filterType);
      if (filterActive !== 'all') params.append('is_active', filterActive);
      if (filterMembership !== 'all') params.append('membership_status', filterMembership);

      const res: any = await api.get(`/states/members?${params}`);
      if (res?.success === false) {
        throw new Error(res?.message || 'Error al cargar miembros');
      }
      setMembers(res?.data?.users ?? []);
      setPagination(res?.pagination ?? null);
    } catch (e: any) {
      toast.error(e?.message || 'No se pudieron cargar los miembros');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filterType, filterActive, filterMembership]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.ceil((pagination?.total || 0) / limit);
  const activeCount = members.filter((u) => u.is_active).length;
  const verifiedCount = members.filter((u) => u.is_verified).length;

  const openViewModal = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const openEditDialog = (user: any) => {
    setEditForm({ is_active: user.is_active ?? true, membership_status: user.membership_status ?? 'free' });
    setEditDialog({ open: true, user });
  };

  const handleEditSave = async () => {
    if (!editDialog.user) return;
    setEditLoading(true);
    try {
      await api.put(`/states/members/${editDialog.user.id}`, editForm);
      toast.success('Miembro actualizado correctamente');
      setEditDialog({ open: false, user: null });
      load();
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo actualizar el miembro');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/states/members/${deleteDialog.id}`);
      toast.success('Miembro eliminado correctamente');
      setDeleteDialog({ open: false, id: '', name: '' });
      load();
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo eliminar el miembro');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-1">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Miembros del Estado</h1>
          <p className="text-sm text-white/35 mt-0.5">
            Administra todos los miembros registrados en{' '}
            <span className="text-white/60 font-medium">{currentUser?.state || 'tu estado'}</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={pagination?.total || 0} loading={loading} accent />
        <StatCard label="Activos" value={activeCount} loading={loading} />
        <StatCard label="Verificados" value={verifiedCount} loading={loading} />
        <StatCard label="Esta página" value={members.length} loading={loading} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre o email…"
            className="w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg pl-8 pr-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
          />
        </div>

        <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(1); }}>
          <SelectTrigger className={`${selTrigger} sm:w-40`}><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent className={selContent}>
            {[['all','Todos los tipos'],['player','Jugador'],['coach','Entrenador'],['club','Club'],['partner','Socio']].map(([v, l]) => (
              <SelectItem key={v} value={v} className={selItem}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterMembership} onValueChange={(v) => { setFilterMembership(v); setPage(1); }}>
          <SelectTrigger className={`${selTrigger} sm:w-40`}><SelectValue placeholder="Afiliación" /></SelectTrigger>
          <SelectContent className={selContent}>
            {[['all','Todas'],['free','Gratis'],['basic','Básico'],['pro','Pro'],['premium','Premium'],['expired','Expirado']].map(([v, l]) => (
              <SelectItem key={v} value={v} className={selItem}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterActive} onValueChange={(v) => { setFilterActive(v); setPage(1); }}>
          <SelectTrigger className={`${selTrigger} sm:w-36`}><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent className={selContent}>
            <SelectItem value="all" className={selItem}>Todos</SelectItem>
            <SelectItem value="true" className={selItem}>Activos</SelectItem>
            <SelectItem value="false" className={selItem}>Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table card */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/30" />
            <span className="text-sm font-semibold text-white/60">Miembros registrados</span>
          </div>
          {!loading && (
            <span className="text-[11px] font-semibold text-white/25 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded-full">
              {pagination?.total ?? members.length} en total
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
            <p className="text-sm text-white/25">Cargando miembros…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && members.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/50 font-semibold text-sm mb-1">Sin miembros</p>
            <p className="text-white/20 text-xs max-w-xs">
              No se encontraron miembros con los filtros seleccionados.
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && members.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Miembro', 'Tipo', 'Afiliación', 'Estado', 'Verificado', 'Registro', ''].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-[11px] font-bold uppercase tracking-widest text-white/25"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((user: any) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors group"
                  >
                    {/* Member */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[11px] font-black text-[#ace600] flex-shrink-0">
                          {initials(user.name || user.full_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white/90 font-semibold text-sm truncate leading-tight">
                            {user.name || user.full_name || '—'}
                          </p>
                          <p className="text-[11px] text-white/35 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <Pill cfg={typeCfg[user.user_type] ?? { label: user.user_type, color: 'text-white/40', bg: 'bg-white/[0.04]', border: 'border-white/[0.07]' }} />
                    </td>

                    {/* Membership */}
                    <td className="py-3 px-4">
                      <Pill cfg={memberCfg[user.membership_status ?? 'free'] ?? memberCfg.free} />
                    </td>

                    {/* Active */}
                    <td className="py-3 px-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-500/[0.08] border border-red-500/20 text-red-400">
                          <XCircle className="w-3 h-3" /> Inactivo
                        </span>
                      )}
                    </td>

                    {/* Verified */}
                    <td className="py-3 px-4">
                      {user.is_verified ? (
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-white/20" />
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-[11px] text-white/35 whitespace-nowrap">
                      {fmtDate(user.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl p-1 w-40"
                        >
                          <DropdownMenuItem
                            onClick={() => openViewModal(user)}
                            className="flex items-center gap-2.5 text-white/60 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(user)}
                            className="flex items-center gap-2.5 text-white/60 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Editar
                          </DropdownMenuItem>
                          <div className="h-px bg-white/[0.06] my-1" />
                          <DropdownMenuItem
                            onClick={() =>
                              setDeleteDialog({ open: true, id: user.id, name: user.name || user.full_name || '' })
                            }
                            className="flex items-center gap-2.5 text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-red-500/[0.06] focus:bg-red-500/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
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
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-3">
              <p className="text-xs text-white/25">
                Pág. {page} de {totalPages}
              </p>
              <Select value={limit.toString()} onValueChange={(v) => { setLimit(parseInt(v)); setPage(1); }}>
                <SelectTrigger className="w-28 h-7 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={selContent}>
                  {['5','10','25','50'].map((v) => (
                    <SelectItem key={v} value={v} className={selItem}>{v} por pág.</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all border ${
                      p === page
                        ? 'bg-[#ace600] text-black border-[#ace600]/50 shadow-[0_0_10px_rgba(172,230,0,0.2)]'
                        : 'border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View modal */}
      {selectedUser && (
        <UserActionModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
          user={selectedUser}
          mode="view"
          onSaveSuccess={() => { setIsModalOpen(false); setSelectedUser(null); }}
        />
      )}

      {/* Edit status dialog */}
      <Dialog open={editDialog.open} onOpenChange={(v) => !v && setEditDialog({ open: false, user: null })}>
        <DialogContent className="bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm p-0 shadow-2xl overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
                <Edit2 className="w-4 h-4 text-[#ace600]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Editar miembro</h2>
                <p className="text-[11px] text-white/35">{editDialog.user?.full_name || editDialog.user?.name}</p>
              </div>
            </div>

            {/* Membership status */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">Plan de Afiliación</label>
              <Select value={editForm.membership_status} onValueChange={(v) => setEditForm((p) => ({ ...p, membership_status: v }))}>
                <SelectTrigger className="h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white/70 focus:border-white/20 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl">
                  {[['free','Gratis'],['basic','Básico'],['pro','Pro'],['premium','Premium'],['expired','Expirado']].map(([v, l]) => (
                    <SelectItem key={v} value={v} className="text-white/70 focus:bg-white/[0.06] focus:text-white">{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
              <div>
                <p className="text-xs font-semibold text-white/70">Usuario Activo</p>
                <p className="text-[10px] text-white/25">El usuario puede acceder a la plataforma</p>
              </div>
              <button
                type="button"
                onClick={() => setEditForm((p) => ({ ...p, is_active: !p.is_active }))}
                style={{ background: editForm.is_active ? '#ace600' : 'rgba(255,255,255,0.1)', borderRadius: 999, height: 22, width: 40 }}
                className="relative shrink-0 transition-all duration-200 focus:outline-none"
              >
                <span
                  className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200"
                  style={{ transform: editForm.is_active ? 'translateX(18px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          </div>

          <div className="flex gap-2.5 px-6 pb-6">
            <button
              onClick={() => setEditDialog({ open: false, user: null })}
              disabled={editLoading}
              className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleEditSave}
              disabled={editLoading}
              className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              {editLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <DeleteDialog
        open={deleteDialog.open}
        name={deleteDialog.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: '', name: '' })}
        loading={deleteLoading}
      />
    </div>
  );
}
