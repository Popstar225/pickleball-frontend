import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  AlertTriangle,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
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

const ITEMS_PER_PAGE = 15;

/* ─── shared select/input styles ── */
const selTrigger = 'h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white/70 px-3 focus:border-white/20 transition-colors w-full';
const selContent = 'bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl';
const selItem    = 'text-white/70 focus:bg-white/[0.06] focus:text-white';
const inputCls   = 'h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/20 focus:border-white/20 transition-colors';
const labelCls   = 'text-[11px] font-semibold uppercase tracking-widest text-white/35 mb-1.5 block';

/* ─── helpers ── */
function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function initials(m: ClubMember) {
  return `${m.firstName?.[0] ?? ''}${m.lastName?.[0] ?? ''}`.toUpperCase();
}

/* ─── Status pill ── */
function StatusPill({ status }: { status: string }) {
  const { t } = useTranslation();
  const cfg =
    (status === 'premium' || status === 'active') ? { label: t('club_dashboard.members.status_active'),   dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/[0.08]' } :
    status === 'expired'                          ? { label: 'Expirado',                                   dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/[0.08]' } :
                                                    { label: t('club_dashboard.members.status_inactive'),  dot: 'bg-white/20',    text: 'text-white/35',    bg: 'bg-white/[0.05]' };
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
  onSubmit: (d: { userId: string }) => Promise<void>;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const [userId, setUserId] = useState('');
  const reset = () => setUserId('');

  const handleClose = (v: boolean) => { if (!v) reset(); onOpenChange(v); };
  const handleSubmit = async () => {
    if (!userId.trim()) return;
    await onSubmit({ userId: userId.trim() });
    reset(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <h2 className="text-base font-bold text-white">{t('club_dashboard.members.add_new_title')}</h2>
          <p className="text-xs text-white/35 mt-1">{t('club_dashboard.members.add_new_desc')}</p>
        </div>
        <div className="px-6 py-5">
          <label className={labelCls}>{t('club_dashboard.members.user_id_label')} <span className="text-[#ace600]">*</span></label>
          <Input
            placeholder={t('club_dashboard.members.user_id_placeholder')}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="flex gap-2.5 px-6 pb-6 pt-2 border-t border-white/[0.06]">
          <button onClick={() => handleClose(false)} disabled={loading} className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-semibold transition-all disabled:opacity-40">
            {t('club_dashboard.members.cancel')}
          </button>
          <button onClick={handleSubmit} disabled={!userId.trim() || loading} className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold transition-all shadow-[0_0_16px_rgba(172,230,0,0.2)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" strokeWidth={2.5} />}
            {t('club_dashboard.members.add')}
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
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
      <DialogContent className="bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm p-0 shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="w-11 h-11 rounded-2xl bg-red-500/[0.08] border border-red-500/15 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-base font-bold text-white mb-1">{t('club_dashboard.members.delete_title')}</h2>
          <p className="text-sm text-white/35 leading-relaxed">
            {t('club_dashboard.members.delete_desc')}{' '}
            <span className="text-white/60 font-medium">"{memberName}"</span>. {t('club_dashboard.members.delete_undone')}
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
  const [currentPage, setCurrentPage]     = useState(1);
  const [showAdd, setShowAdd]             = useState(false);
  const [deleteDialog, setDeleteDialog]   = useState<{ open: boolean; id: string | null; name: string }>({ open: false, id: null, name: '' });

  const refreshMembers = useCallback(() => {
    dispatch(fetchClubMembers({ limit: 200 }));
  }, [dispatch]);

  useEffect(() => {
    refreshMembers();
    dispatch(fetchClubStatistics());
    return () => {
      setShowAdd(false);
      setDeleteDialog({ open: false, id: null, name: '' });
      dispatch(clearError());
    };
  }, [dispatch]);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch  = !search       || `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchStatus  = !filterStatus || m.membershipStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const displayed  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const displayStats = {
    total:   stats?.totalMembers  ?? members.length,
    active:  stats?.activeMembers ?? members.filter((m) => m.membershipStatus === 'premium').length,
    free:    members.filter((m) => m.membershipStatus === 'free').length,
    expired: members.filter((m) => m.membershipStatus === 'expired').length,
  };

  const handleAddMember = useCallback(async (data: { userId: string }) => {
    await dispatch(addClubMember(data)).unwrap();
    toast.success('Miembro agregado exitosamente');
    refreshMembers();
    dispatch(fetchClubStatistics());
  }, [dispatch, refreshMembers]);

  const handleEditMember = (member: ClubMember) => {
    const next = member.membershipStatus === 'premium' ? 'free' : 'premium';
    dispatch(updateClubMember({ memberId: member.id, membershipStatus: next }))
      .unwrap()
      .then(() => { toast.success('Estado actualizado'); refreshMembers(); })
      .catch(() => toast.error('Error al actualizar el miembro'));
  };

  const handleRemoveMember = useCallback(async () => {
    if (!deleteDialog.id) return;
    try {
      await dispatch(removeClubMember(deleteDialog.id)).unwrap();
      toast.success('Miembro eliminado exitosamente');
      setDeleteDialog({ open: false, id: null, name: '' });
      refreshMembers();
      dispatch(fetchClubStatistics());
    } catch { toast.error('Error al eliminar el miembro'); }
  }, [dispatch, refreshMembers, deleteDialog.id]);

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
      {/* {membersError && (
        <div className="flex gap-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{membersError}</p>
        </div>
      )} */}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total"     value={displayStats.total}   loading={statsLoading} accent />
        <StatCard label="Premium"   value={displayStats.active}  loading={statsLoading} />
        <StatCard label="Gratuitos" value={displayStats.free}    loading={statsLoading} />
        <StatCard label="Expirados" value={displayStats.expired} loading={statsLoading} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
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
            {[['all','Todos los estados'],['premium','Premium'],['free','Gratuito'],['expired','Expirado']].map(([v,l]) => (
              <SelectItem key={v} value={v} className={selItem}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">

        {/* Table header bar */}
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
        {!membersLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/50 font-semibold text-sm mb-1">No hay miembros</p>
            <p className="text-white/20 text-xs max-w-xs">
              {search || filterStatus ? 'Intenta ajustar los filtros de búsqueda.' : 'Agrega tu primer miembro para comenzar.'}
            </p>
            {!search && !filterStatus && (
              <button onClick={() => setShowAdd(true)} className="mt-5 flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold px-4 py-2 rounded-lg transition-all">
                <Plus className="w-3.5 h-3.5" /> Agregar Miembro
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!membersLoading && displayed.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Miembro', 'Teléfono', 'Nivel', 'Afiliación', 'Ingreso', ''].map((col) => (
                    <th key={col} className="text-left text-[10px] font-bold uppercase tracking-widest text-white/25 px-4 py-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {displayed.map((member) => {
                  const isPremium = member.membershipStatus === 'premium';
                  return (
                    <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors">

                      {/* Member */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[10px] font-black text-[#ace600] flex-shrink-0">
                            {initials(member)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white/90 truncate leading-tight">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-[11px] text-white/35 truncate">{member.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-sm text-white/45 whitespace-nowrap">
                        {member.phone || '—'}
                      </td>

                      {/* Level */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isPremium ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#ace600]/[0.08] border border-[#ace600]/20 text-[#ace600]">
                            <Star className="w-2.5 h-2.5" /> Premium
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-white/30">
                            {member.level || '—'}
                          </span>
                        )}
                      </td>

                      {/* Membership status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusPill status={member.membershipStatus} />
                      </td>

                      {/* Join date */}
                      <td className="px-4 py-3 text-sm text-white/45 whitespace-nowrap">
                        {formatDate(member.joinDate)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl p-1 w-44">
                            <DropdownMenuItem
                              onClick={() => handleEditMember(member)}
                              className="flex items-center gap-2.5 text-white/60 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              {isPremium ? 'Quitar premium' : 'Activar premium'}
                            </DropdownMenuItem>
                            <div className="h-px bg-white/[0.06] my-1" />
                            <DropdownMenuItem
                              onClick={() => setDeleteDialog({ open: true, id: member.id, name: `${member.firstName} ${member.lastName}` })}
                              className="flex items-center gap-2.5 text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-red-500/[0.06] focus:bg-red-500/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
