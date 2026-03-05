import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import {
  fetchClubMembers,
  addClubMember,
  updateClubMember,
  removeClubMember,
  fetchClubStatistics,
  clearError,
} from '@/store/slices/clubDashboardSlice';
import type { ClubMember } from '@/store/slices/clubDashboardSlice';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Calendar,
  AlertTriangle,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Mail,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 9;

/* ─── shared select/input styles ── */
const selTrigger = 'h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white/70 px-3 focus:border-white/20 transition-colors w-full';
const selContent = 'bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl';
const selItem    = 'text-white/70 focus:bg-white/[0.06] focus:text-white';
const inputCls   = 'h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/20 focus:border-white/20 transition-colors';
const labelCls   = 'text-[11px] font-semibold uppercase tracking-widest text-white/35 mb-1.5 block';

/* ─── helpers ── */
function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

function initials(m: ClubMember) {
  return `${m.firstName?.[0] ?? ''}${m.lastName?.[0] ?? ''}`.toUpperCase();
}

/* ─── Status pill ── */
function StatusPill({ status }: { status: string }) {
  const cfg =
    status === 'active'   ? { label: 'Activo',    dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/[0.08]' } :
    status === 'pending'  ? { label: 'Pendiente', dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/[0.08]' } :
                            { label: 'Inactivo',  dot: 'bg-white/20',    text: 'text-white/35',    bg: 'bg-white/[0.05]' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/[0.06] ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ─── Add member dialog ── */
function AddMemberDialog({
  open, onOpenChange, onSubmit, loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (d: { playerId: string; membershipFee: number; notes?: string }) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState({ playerId: '', membershipFee: 300, notes: '' });
  const reset = () => setForm({ playerId: '', membershipFee: 300, notes: '' });

  const handleClose = (v: boolean) => { if (!v) reset(); onOpenChange(v); };
  const handleSubmit = async () => {
    if (!form.playerId) return;
    await onSubmit({ playerId: form.playerId, membershipFee: form.membershipFee, notes: form.notes || undefined });
    reset(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <h2 className="text-base font-bold text-white">Agregar Nuevo Miembro</h2>
          <p className="text-xs text-white/35 mt-1">Invita a un jugador registrado a tu club</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>ID del Jugador <span className="text-[#ace600]">*</span></label>
            <Input
              placeholder="ID del jugador en la plataforma"
              value={form.playerId}
              onChange={(e) => setForm({ ...form, playerId: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Cuota de Membresía ($)</label>
            <Input
              type="number" min={0}
              value={form.membershipFee}
              onChange={(e) => setForm({ ...form, membershipFee: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Notas <span className="normal-case text-white/20">(opcional)</span></label>
            <Input
              placeholder="Observaciones adicionales..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
        <div className="flex gap-2.5 px-6 pb-6 pt-2 border-t border-white/[0.06]">
          <button onClick={() => handleClose(false)} disabled={loading} className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-semibold transition-all disabled:opacity-40">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={!form.playerId || loading} className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold transition-all shadow-[0_0_16px_rgba(172,230,0,0.2)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" strokeWidth={2.5} />}
            Agregar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Delete dialog ── */
function DeleteMemberDialog({
  open, onOpenChange, memberName, onConfirm, loading,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  memberName: string; onConfirm: () => void; loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
      <DialogContent className="bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm p-0 shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="w-11 h-11 rounded-2xl bg-red-500/[0.08] border border-red-500/15 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-base font-bold text-white mb-1">¿Eliminar miembro?</h2>
          <p className="text-sm text-white/35 leading-relaxed">
            Estás a punto de eliminar a{' '}
            <span className="text-white/60 font-medium">"{memberName}"</span>. Esta acción no puede deshacerse.
          </p>
        </div>
        <div className="flex gap-2.5 px-6 pb-6">
          <button onClick={() => onOpenChange(false)} disabled={loading} className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-semibold transition-all">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 h-9 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-bold transition-all shadow-[0_0_16px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Eliminar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Member card ── */
function MemberCard({ member, onEdit, onDelete }: {
  member: ClubMember; onEdit: (m: ClubMember) => void; onDelete: (m: ClubMember) => void;
}) {
  const isPremium = member.level?.toLowerCase() === 'premium';

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] hover:border-white/[0.15] rounded-xl p-4 transition-all group">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[11px] font-black text-[#ace600] flex-shrink-0">
            {initials(member)}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white/90 truncate leading-tight">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-[11px] text-white/35 truncate mt-0.5">{member.email}</p>
          </div>
        </div>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl p-1 w-40">
            <DropdownMenuItem
              onClick={() => onEdit(member)}
              className="flex items-center gap-2.5 text-white/60 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> Editar estado
            </DropdownMenuItem>
            <div className="h-px bg-white/[0.06] my-1" />
            <DropdownMenuItem
              onClick={() => onDelete(member)}
              className="flex items-center gap-2.5 text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-red-500/[0.06] focus:bg-red-500/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Fee + Last payment */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.05]">
          <p className="text-[10px] text-white/25 mb-0.5">Cuota</p>
          <p className="text-sm font-bold text-white/80">
            {member.membershipFee != null ? `$${member.membershipFee}` : '—'}
          </p>
        </div>
        <div className="bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.05]">
          <p className="text-[10px] text-white/25 mb-0.5">Último pago</p>
          <p className={`text-[11px] font-semibold ${member.lastPaymentDate ? 'text-[#ace600]' : 'text-white/25'}`}>
            {formatDate(member.lastPaymentDate)}
          </p>
        </div>
      </div>

      {/* Meta rows */}
      <div className="space-y-1.5 mb-3">
        {member.phone && (
          <div className="flex items-center gap-2 text-[11px] text-white/35">
            <Phone className="w-3 h-3 flex-shrink-0" /> {member.phone}
          </div>
        )}
        <div className="flex items-center gap-2 text-[11px] text-white/35">
          <Calendar className="w-3 h-3 flex-shrink-0" /> Desde {formatDate(member.joinDate)}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-white/[0.05]">
        <StatusPill status={member.membershipStatus} />
        {isPremium ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-[#ace600]/[0.08] border-[#ace600]/20 text-[#ace600]">
            <Star className="w-2.5 h-2.5" /> Premium
          </span>
        ) : (
          <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-white/[0.04] border-white/[0.07] text-white/30">
            {member.level || 'Básica'}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Stat card ── */
function StatCard({ label, value, loading, accent }: { label: string; value: number; loading: boolean; accent?: boolean }) {
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

export default function ClubMembersPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const {
    members = [],
    stats,
    membersLoading,
    membersError,
    statsLoading,
  } = useSelector((state: RootState) => state.clubDashboard);

  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterLevel, setFilterLevel]     = useState('');
  const [currentPage, setCurrentPage]     = useState(1);
  const [showAdd, setShowAdd]             = useState(false);
  const [deleteDialog, setDeleteDialog]   = useState<{ open: boolean; id: string | null; name: string }>({ open: false, id: null, name: '' });

  useEffect(() => {
    if (!clubId) return;
    dispatch(fetchClubMembers({ clubId, status: filterStatus || undefined }));
    dispatch(fetchClubStatistics());
    return () => {
      setShowAdd(false);
      setDeleteDialog({ open: false, id: null, name: '' });
      dispatch(clearError());
    };
  }, [dispatch, clubId, filterStatus]);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !search || `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchLevel  = !filterLevel || m.level?.toLowerCase() === filterLevel;
    return matchSearch && matchLevel;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const displayed  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const displayStats = {
    total:    stats?.totalMembers  ?? members.length,
    active:   stats?.activeMembers ?? members.filter((m) => m.membershipStatus === 'active').length,
    pending:  members.filter((m) => m.membershipStatus === 'pending').length,
    inactive: members.filter((m) => m.membershipStatus === 'inactive').length,
  };

  const handleAddMember = useCallback(async (data: { playerId: string; membershipFee: number; notes?: string }) => {
    await dispatch(addClubMember(data)).unwrap();
    toast.success('Miembro agregado exitosamente');
    dispatch(fetchClubMembers({ clubId: clubId!, status: filterStatus || undefined }));
    dispatch(fetchClubStatistics());
  }, [dispatch, clubId, filterStatus]);

  const handleEditMember = (member: ClubMember) => {
    const next = member.membershipStatus === 'active' ? 'inactive' : 'active';
    dispatch(updateClubMember({ memberId: member.id, membershipStatus: next }))
      .unwrap()
      .then(() => toast.success('Estado actualizado'))
      .catch(() => toast.error('Error al actualizar el miembro'));
  };

  const handleRemoveMember = useCallback(async () => {
    if (!deleteDialog.id) return;
    try {
      await dispatch(removeClubMember(deleteDialog.id)).unwrap();
      toast.success('Miembro eliminado exitosamente');
      setDeleteDialog({ open: false, id: null, name: '' });
      dispatch(fetchClubMembers({ clubId: clubId!, status: filterStatus || undefined }));
      dispatch(fetchClubStatistics());
    } catch { toast.error('Error al eliminar el miembro'); }
  }, [dispatch, clubId, filterStatus, deleteDialog.id]);

  /* ── Render ── */
  return (
    <div className="space-y-6 p-1">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestión de Miembros</h1>
          <p className="text-sm text-white/35 mt-0.5">Administra los miembros de tu club</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] active:scale-[0.98] text-black text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-[0_0_18px_rgba(172,230,0,0.18)] hover:shadow-[0_0_28px_rgba(172,230,0,0.32)]"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nuevo Miembro
        </button>
      </div>

      {/* Error */}
      {membersError && (
        <div className="flex gap-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{membersError}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total"     value={displayStats.total}    loading={statsLoading} accent />
        <StatCard label="Activos"   value={displayStats.active}   loading={statsLoading} />
        <StatCard label="Pendientes"value={displayStats.pending}  loading={statsLoading} />
        <StatCard label="Inactivos" value={displayStats.inactive} loading={statsLoading} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por nombre, email…"
            className="w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg pl-8 pr-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
          />
        </div>

        <Select value={filterStatus || 'all'} onValueChange={(v) => { setFilterStatus(v === 'all' ? '' : v); setCurrentPage(1); }}>
          <SelectTrigger className={`${selTrigger} sm:w-44`}><SelectValue placeholder="Todos los estados" /></SelectTrigger>
          <SelectContent className={selContent}>
            {[['all','Todos los estados'],['active','Activos'],['pending','Pendientes'],['inactive','Inactivos']].map(([v,l]) => (
              <SelectItem key={v} value={v} className={selItem}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterLevel || 'all'} onValueChange={(v) => { setFilterLevel(v === 'all' ? '' : v); setCurrentPage(1); }}>
          <SelectTrigger className={`${selTrigger} sm:w-44`}><SelectValue placeholder="Todos los niveles" /></SelectTrigger>
          <SelectContent className={selContent}>
            {[['all','Todos los niveles'],['premium','Premium'],['básica','Básica']].map(([v,l]) => (
              <SelectItem key={v} value={v} className={selItem}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table card */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/30" />
            <span className="text-sm font-semibold text-white/60">Miembros del Club</span>
          </div>
          {!membersLoading && (
            <span className="text-[11px] font-semibold text-white/25 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded-full">
              {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
            </span>
          )}
        </div>

        {/* Loading */}
        {membersLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
            <p className="text-sm text-white/25">Cargando miembros…</p>
          </div>
        )}

        {/* Empty */}
        {!membersLoading && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/50 font-semibold text-sm mb-1">No hay miembros</p>
            <p className="text-white/20 text-xs max-w-xs">
              {search || filterStatus || filterLevel ? 'Intenta ajustar los filtros de búsqueda.' : 'Agrega tu primer miembro para comenzar.'}
            </p>
            {!search && !filterStatus && !filterLevel && (
              <button onClick={() => setShowAdd(true)} className="mt-5 flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold px-4 py-2 rounded-lg transition-all">
                <Plus className="w-3.5 h-3.5" /> Agregar Miembro
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!membersLoading && displayed.length > 0 && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {displayed.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onEdit={handleEditMember}
                onDelete={(m) => setDeleteDialog({ open: true, id: m.id, name: `${m.firstName} ${m.lastName}` })}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!membersLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
            <p className="text-xs text-white/25">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length} miembros
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all border ${
                    page === currentPage
                      ? 'bg-[#ace600] text-black border-[#ace600]/50 shadow-[0_0_10px_rgba(172,230,0,0.2)]'
                      : 'border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddMemberDialog open={showAdd} onOpenChange={setShowAdd} onSubmit={handleAddMember} loading={membersLoading} />
      <DeleteMemberDialog
        open={deleteDialog.open}
        onOpenChange={(v) => { if (!v) setDeleteDialog({ open: false, id: null, name: '' }); }}
        memberName={deleteDialog.name}
        onConfirm={handleRemoveMember}
        loading={membersLoading}
      />
    </div>
  );
}