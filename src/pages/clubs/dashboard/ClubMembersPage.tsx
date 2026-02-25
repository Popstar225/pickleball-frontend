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
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Loader2,
  Star,
  UserCheck,
  Activity,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const ACCENT = '#ace600';
const ITEMS_PER_PAGE = 9;

// ─── Add Member Dialog ────────────────────────────────────────────────────────
function AddMemberDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (d: { playerId: string; membershipFee: number; notes?: string }) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState({ playerId: '', membershipFee: 300, notes: '' });
  const reset = () => setForm({ playerId: '', membershipFee: 300, notes: '' });

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleSubmit = async () => {
    if (!form.playerId) return;
    await onSubmit({
      playerId: form.playerId,
      membershipFee: form.membershipFee,
      notes: form.notes || undefined,
    });
    reset();
    onOpenChange(false);
  };

  const inputCls =
    'bg-[#111827] border-white/10 text-[#f0f4ff] placeholder:text-white/20 focus-visible:border-[#ace600] focus-visible:ring-[#ace600]';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#111827] border-white/10 text-[#f0f4ff] sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-white">Agregar Nuevo Miembro</DialogTitle>
          <DialogDescription className="text-[#4a5a72]">
            Invita a un jugador registrado a tu club
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs text-[#4a5a72] font-medium">ID del Jugador *</label>
            <Input
              placeholder="ID del jugador en la plataforma"
              value={form.playerId}
              onChange={(e) => setForm({ ...form, playerId: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-[#4a5a72] font-medium">Cuota de Membresía ($)</label>
            <Input
              type="number"
              min={0}
              value={form.membershipFee}
              onChange={(e) => setForm({ ...form, membershipFee: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-[#4a5a72] font-medium">Notas (opcional)</label>
            <Input
              placeholder="Observaciones adicionales..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={loading}
            className="border-white/10 text-[#4a5a72] hover:text-white bg-transparent hover:bg-white/5"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.playerId || loading}
            className="bg-[#ace600] text-black hover:bg-[#d4f000] font-semibold"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus size={16} className="mr-2" />
            )}
            Agregar Miembro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────
function DeleteMemberDialog({
  open,
  onOpenChange,
  memberName,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  memberName: string;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#111827] border-white/10 text-[#f0f4ff]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">¿Eliminar miembro?</AlertDialogTitle>
          <AlertDialogDescription className="text-[#4a5a72]">
            Estás a punto de eliminar a{' '}
            <span className="font-semibold text-white">{memberName}</span>. Esta acción no puede
            deshacerse.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            className="border-white/10 text-[#4a5a72] hover:text-white bg-transparent hover:bg-white/5"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white border-0"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────
function MemberCard({
  member,
  onEdit,
  onDelete,
}: {
  member: ClubMember;
  onEdit: (m: ClubMember) => void;
  onDelete: (m: ClubMember) => void;
}) {
  const isPremium = member.level?.toLowerCase() === 'premium';
  const isActive = member.membershipStatus === 'active';
  const isPending = member.membershipStatus === 'pending';

  const formatDate = (d?: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-[#111827] border border-white/10 hover:border-[#ace600]/30 rounded-lg p-5 transition-all">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
            style={{ background: 'rgba(172,230,0,0.1)', color: ACCENT }}
          >
            {member.firstName?.[0]}
            {member.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white truncate">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-sm text-[#4a5a72] truncate">{member.email}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1 shrink-0 ml-2">
          <button
            onClick={() => onEdit(member)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[#4a5a72] hover:text-white"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(member)}
            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-[11px] text-[#4a5a72] mb-1">Cuota</div>
          <div className="font-semibold text-white">
            {member.membershipFee != null ? `$${member.membershipFee}` : '—'}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-[11px] text-[#4a5a72] mb-1">Último Pago</div>
          <div
            className="font-semibold text-sm"
            style={{ color: member.lastPaymentDate ? ACCENT : '#4a5a72' }}
          >
            {formatDate(member.lastPaymentDate)}
          </div>
        </div>
      </div>

      {/* Phone row */}
      {member.phone && (
        <div className="flex items-center gap-1.5 text-xs text-[#4a5a72] mb-4">
          <Phone size={11} />
          {member.phone}
        </div>
      )}

      {/* Joined date */}
      <div className="flex items-center gap-1.5 text-xs text-[#4a5a72] mb-4">
        <Calendar size={11} />
        Miembro desde {formatDate(member.joinDate)}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {/* Status badge */}
        <Badge
          variant="outline"
          className={`text-[11px] ${
            isActive
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : isPending
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                : 'bg-white/5 text-[#4a5a72] border-white/10'
          }`}
        >
          {isActive ? 'Activo' : isPending ? 'Pendiente' : 'Inactivo'}
        </Badge>

        {/* Level badge */}
        {isPremium ? (
          <Badge
            variant="outline"
            className="text-[11px]"
            style={{
              background: 'rgba(172,230,0,0.1)',
              borderColor: 'rgba(172,230,0,0.3)',
              color: ACCENT,
            }}
          >
            <Star size={10} className="mr-1" />
            Premium
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[11px] bg-white/5 text-[#4a5a72] border-white/10"
          >
            {member.level || 'Básica'}
          </Badge>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
    name: string;
  }>({ open: false, id: null, name: '' });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!clubId) return;
    dispatch(fetchClubMembers({ clubId, status: filterStatus || undefined }));
    dispatch(fetchClubStatistics());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, clubId, filterStatus]);

  // ── Client-side filter + paginate ──────────────────────────────────────────
  const filtered = members.filter((m) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q);
    const matchLevel = !filterLevel || m.level?.toLowerCase() === filterLevel;
    return matchSearch && matchLevel;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const displayed = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const displayStats = {
    total: stats?.totalMembers ?? members.length,
    active: stats?.activeMembers ?? members.filter((m) => m.membershipStatus === 'active').length,
    pending: members.filter((m) => m.membershipStatus === 'pending').length,
    inactive: members.filter((m) => m.membershipStatus === 'inactive').length,
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddMember = useCallback(
    async (data: { playerId: string; membershipFee: number; notes?: string }) => {
      await dispatch(addClubMember(data)).unwrap();
      toast.success('Miembro agregado exitosamente');
      dispatch(fetchClubMembers({ clubId: clubId!, status: filterStatus || undefined }));
      dispatch(fetchClubStatistics());
    },
    [dispatch, clubId, filterStatus],
  );

  const handleEditMember = (member: ClubMember) => {
    // Toggle status as the primary edit action (extend as needed)
    const next = member.membershipStatus === 'active' ? 'inactive' : 'active';
    dispatch(updateClubMember({ memberId: member.id, membershipStatus: next }))
      .unwrap()
      .then(() => toast.success('Estado actualizado'))
      .catch(() => toast.error('Error al actualizar el miembro'));
  };

  const openDelete = (member: ClubMember) => {
    setDeleteDialog({ open: true, id: member.id, name: `${member.firstName} ${member.lastName}` });
  };

  const handleRemoveMember = useCallback(async () => {
    if (!deleteDialog.id) return;
    try {
      await dispatch(removeClubMember(deleteDialog.id)).unwrap();
      toast.success('Miembro eliminado exitosamente');
      setDeleteDialog({ open: false, id: null, name: '' });
      dispatch(fetchClubMembers({ clubId: clubId!, status: filterStatus || undefined }));
      dispatch(fetchClubStatistics());
    } catch {
      toast.error('Error al eliminar el miembro');
    }
  }, [dispatch, clubId, filterStatus, deleteDialog.id]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080c14] text-[#f0f4ff] p-6">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gestión de Miembros</h1>
            <p className="text-[#4a5a72]">Administra los miembros de tu club de pickleball</p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-[#ace600] text-black hover:bg-[#d4f000] font-semibold"
          >
            <Plus size={18} className="mr-2" />
            Nuevo Miembro
          </Button>
        </div>

        {/* ── Error Alert ──────────────────────────────────────────── */}
        {membersError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-red-500 font-semibold">Error</p>
              <p className="text-red-400 text-sm">{membersError}</p>
            </div>
          </div>
        )}

        {/* ── Filters ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Input
            placeholder="Buscar miembros..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111827] border-white/10 text-[#f0f4ff] placeholder:text-white/20 focus-visible:border-[#ace600] focus-visible:ring-[#ace600]"
          />

          <Select
            value={filterStatus}
            onValueChange={(v) => {
              setFilterStatus(v === 'all' ? '' : v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="bg-[#111827] border-white/10 text-[#f0f4ff]">
              <SelectValue placeholder="Estado del miembro" />
            </SelectTrigger>
            <SelectContent className="bg-[#111827] text-white border-white/10">
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterLevel}
            onValueChange={(v) => {
              setFilterLevel(v === 'all' ? '' : v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="bg-[#111827] border-white/10 text-[#f0f4ff]">
              <SelectValue placeholder="Nivel de membresía" />
            </SelectTrigger>
            <SelectContent className="bg-[#111827] text-white border-white/10">
              <SelectItem value="all">Todos los niveles</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="básica">Básica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Stats ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: displayStats.total },
            { label: 'Activos', value: displayStats.active },
            { label: 'Pendientes', value: displayStats.pending },
            { label: 'Inactivos', value: displayStats.inactive },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#111827] border border-white/10 rounded-lg p-4">
              <div className="text-sm text-[#4a5a72] mb-1">{label}</div>
              <div className="text-2xl font-bold" style={{ color: ACCENT }}>
                {statsLoading ? '—' : value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Members Grid ─────────────────────────────────────────── */}
        {membersLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin mb-3" style={{ color: ACCENT }} />
            <p className="text-[#4a5a72]">Cargando miembros...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#111827] border border-white/10 rounded-lg">
            <p className="text-[#4a5a72] mb-2">No hay miembros disponibles</p>
            <p className="text-sm text-[#4a5a72]">Agrega tu primer miembro para comenzar</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {displayed.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onEdit={handleEditMember}
                  onDelete={openDelete}
                />
              ))}
            </div>

            {/* ── Pagination ─────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-[#4a5a72]">
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}{' '}
                  miembros
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-white/10 text-[#4a5a72] hover:text-white bg-transparent"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      style={
                        page === currentPage
                          ? { background: ACCENT, color: 'black' }
                          : { borderColor: 'rgba(255,255,255,0.1)', color: '#4a5a72' }
                      }
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-white/10 text-[#4a5a72] hover:text-white bg-transparent"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Dialogs ───────────────────────────────────────────────── */}
      <DeleteMemberDialog
        open={deleteDialog.open}
        onOpenChange={(v) => {
          if (!v) setDeleteDialog({ open: false, id: null, name: '' });
        }}
        memberName={deleteDialog.name}
        onConfirm={handleRemoveMember}
        loading={membersLoading}
      />
      <AddMemberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddMember}
        loading={membersLoading}
      />
    </div>
  );
}
