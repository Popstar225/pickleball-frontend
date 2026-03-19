import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Search,
  X,
  MoreHorizontal,
  Eye,
  Loader2,
  MapPin,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  CheckCircle2,
  Star,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { RootState } from '@/store';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Config ───────────────────────────────────────────────────────────────────
// membership_status values on Club model
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

// subscription_plan values on Club model
const PLAN_CFG: Record<string, { label: string; cls: string }> = {
  basic:   { label: 'Básico',   cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  premium: { label: 'Premium',  cls: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
};

const STATUS_OPTIONS = ['pending', 'approved', 'active', 'inactive', 'suspended'];

// ─── Atoms ────────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? {
    label: status,
    cls: 'bg-white/[0.05] text-white/30 border-white/[0.08]',
    dot: 'bg-white/20',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap', c.cls)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
      {c.label}
    </span>
  );
}

function PlanPill({ plan }: { plan: string }) {
  const c = PLAN_CFG[plan] ?? { label: plan || '—', cls: 'bg-white/[0.05] text-white/30 border-white/[0.08]' };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap', c.cls)}>
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StateClubsManagement() {
  const { user: currentUser } = useSelector((s: RootState) => s.auth);

  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<{ total: number; pages: number } | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form state for create/edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: '',
    name: '',
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    if (!currentUser?.state) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);
      if (filterStatus !== 'all') params.append('membership_status', filterStatus);

      const res: any = await api.get(`/states/clubs?${params}`);
      if (res?.success === false) {
        throw new Error(res?.message || 'Error al cargar clubes');
      }
      setClubs(res?.data?.clubs ?? []);
      setPagination(res?.pagination ?? null);
    } catch (e: any) {
      toast.error(e?.message || 'No se pudieron cargar los clubes');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.state, page, limit, search, filterStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('all');
    setPage(1);
  };

  const handleCreate = () => {
    setFormData({
      business_name: '',
      contact_person: '',
      email: '',
      phone: '',
      city: '',
      address: '',
      website: '',
      rfc: '',
      membership_status: 'basic',
      is_active: true,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (club: any) => {
    setFormData(club);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.business_name || !formData.email) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    setFormLoading(true);
    try {
      if (formData.id) {
        await api.put(`/states/clubs/${formData.id}`, formData);
        toast.success('Club actualizado correctamente');
      } else {
        const res: any = await api.post(`/states/clubs`, formData);
        if (res?.data?.temp_password) {
          toast.success(`Club creado. Contraseña temporal: ${res.data.temp_password}`);
        } else {
          toast.success('Club creado correctamente');
        }
      }
      setIsFormOpen(false);
      setFormData({});
      load();
    } catch (e: any) {
      toast.error(e?.message || 'Error al guardar el club');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/states/clubs/${deleteDialog.id}`);
      toast.success('Club eliminado correctamente');
      setDeleteDialog({ open: false, id: '', name: '' });
      load();
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo eliminar el club');
    } finally {
      setDeleteLoading(false);
    }
  };

  const clubList = clubs ?? [];
  const totalPages = Math.max(1, Math.ceil((pagination?.total ?? 0) / limit));
  const activeCount = clubList.filter((c: any) => c.is_active).length;
  const approvedCount = clubList.filter((c: any) => c.is_verified).length;
  const premiumCount = clubList.filter((c: any) => c.membership_status === 'premium').length;
  const hasFilters = !!(search || filterStatus !== 'all');

  const pageNums = (() => {
    const start = Math.max(1, page - 2);
    return Array.from({ length: Math.min(5, totalPages - start + 1) }, (_, i) => start + i);
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#ace600]" />
            <h1 className="text-[22px] font-bold text-white tracking-tight">Gestión de Clubes</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
              {pagination?.total ?? 0} total
            </span>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-xl text-xs font-semibold bg-[#ace600] border border-[#ace600] text-black hover:bg-[#ace600]/90 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Nueva Club
          </button>
        </div>
        <p className="text-xs text-white/25">Administra los clubes en tu estado</p>
      </div>

      {/* ── Stat strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: 'Total de Clubes', value: pagination?.total ?? 0, color: 'text-white',     bg: 'bg-white/[0.04] border-white/[0.08]',     icon: Building2   },
          { label: 'Activos',         value: activeCount,            color: 'text-sky-400',    bg: 'bg-sky-500/10 border-sky-500/20',         icon: CheckCircle2 },
          { label: 'Verificados',     value: approvedCount,          color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
          { label: 'Plan Premium',    value: premiumCount,           color: 'text-pink-400',   bg: 'bg-pink-500/10 border-pink-500/20',       icon: Star         },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">{label}</p>
              <p className={cn('text-[22px] font-bold leading-none', color)}>{value}</p>
            </div>
            <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center shrink-0', bg)}>
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
              className="h-10 rounded-xl text-sm bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20 focus:border-[#ace600]/50 outline-none pl-10 pr-9 w-full transition-all"
              placeholder="Buscar club…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white transition-all shrink-0">
              <X className="w-3.5 h-3.5" /> Limpiar
            </button>
          )}
        </div>

        {/* Status pills */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1.5">Estado</p>
          <div className="flex flex-wrap gap-1.5">
            {['all', ...STATUS_OPTIONS].map((s) => {
              const active = filterStatus === s;
              const c = STATUS_CFG[s];
              return (
                <button
                  key={s}
                  onClick={() => { setFilterStatus(s); setPage(1); }}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all',
                    active
                      ? s === 'all'
                        ? 'bg-[#ace600] border-[#ace600] text-black shadow-[0_0_8px_rgba(172,230,0,0.15)]'
                        : cn(c?.cls ?? '')
                      : 'bg-white/[0.03] border-white/[0.07] text-white/30 hover:text-white/55 hover:border-white/[0.12]',
                  )}
                >
                  {active && c && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />}
                  {s === 'all' ? 'Todos' : (c?.label ?? s)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active chips */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.05]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Activos:</span>
            {search && <FilterChip label={`"${search}"`} onRemove={() => setSearch('')} />}
            {filterStatus !== 'all' && (
              <FilterChip
                label={`Estado: ${STATUS_CFG[filterStatus]?.label ?? filterStatus}`}
                onRemove={() => setFilterStatus('all')}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Results table ────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <p className="text-xs font-bold text-white/40">
            {pagination?.total ?? 0} club{(pagination?.total ?? 0) !== 1 ? 's' : ''} encontrado{(pagination?.total ?? 0) !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/20 hidden sm:inline">Por página:</span>
            <div className="flex gap-1">
              {[5, 10, 25, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => { setLimit(n); setPage(1); }}
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
                    {['Club', 'Ubicación', 'Estado', 'Plan', 'Coordinador', 'Creado', ''].map((h) => (
                      <th key={h} className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest text-white/20">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {clubList.map((club: any) => (
                    <tr key={club.id} className="group hover:bg-white/[0.02] transition-colors">
                      {/* Club name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[10px] font-black text-[#ace600] shrink-0 select-none">
                            {(club.business_name ?? club.organization_name ?? '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white/80 group-hover:text-white transition-colors text-xs truncate max-w-[140px]">
                            {club.business_name || club.organization_name || club.full_name || '—'}
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
                      {/* Status — uses is_active field */}
                      <td className="py-3 px-4">
                        <StatusPill status={club.is_active ? 'active' : 'inactive'} />
                      </td>
                      {/* Plan — uses membership_status field */}
                      <td className="py-3 px-4">
                        <PlanPill plan={club.membership_status ?? 'basic'} />
                      </td>
                      {/* Contact person */}
                      <td className="py-3 px-4 text-[11px] text-white/30 truncate max-w-[120px]">
                        {club.contact_person || club.full_name || '—'}
                      </td>
                      {/* Date */}
                      <td className="py-3 px-4 text-[11px] text-white/25 whitespace-nowrap">
                        {club.createdAt
                          ? new Date(club.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      {/* Actions */}
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.08] text-white/30 hover:text-white transition-all">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#13181f] border-white/[0.08] rounded-xl shadow-xl min-w-[140px] p-1">
                            <DropdownMenuItem
                              onClick={() => handleEdit(club)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.06] cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(club)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.06] cursor-pointer transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" /> Editar
                            </DropdownMenuItem>
                            <div className="h-px bg-white/[0.06] my-1" />
                            <DropdownMenuItem
                              onClick={() => setDeleteDialog({ open: true, id: club.id, name: club.business_name || club.full_name || '' })}
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
                <button onClick={() => setPage(1)} disabled={page === 1} className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-white/[0.05]">
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-white/[0.05]">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
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
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-white/[0.05]">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-white/[0.05]">
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Edit Club Dialog ───────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={(v) => { if (!v) { setIsFormOpen(false); setFormData({}); } }}>
        <DialogContent className="bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-md p-0 shadow-2xl overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-[#ace600]/60 via-[#ace600]/30 to-transparent" />
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">{formData.id ? 'Editar Club' : 'Crear Nueva Club'}</h2>
              <p className="text-xs text-white/35">Completa la información del club</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">Nombre del Club*</label>
                <input
                  type="text"
                  value={formData.business_name || ''}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full h-9 rounded-xl text-sm bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20 focus:border-[#ace600]/50 outline-none px-3 transition-all"
                  placeholder="Ej: Elite Pickleball Club"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">Persona de Contacto</label>
                <input
                  type="text"
                  value={formData.contact_person || ''}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full h-9 rounded-xl text-sm bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20 focus:border-[#ace600]/50 outline-none px-3 transition-all"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">Email*</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-9 rounded-xl text-sm bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20 focus:border-[#ace600]/50 outline-none px-3 transition-all"
                  placeholder="club@example.com"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-9 rounded-xl text-sm bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20 focus:border-[#ace600]/50 outline-none px-3 transition-all"
                  placeholder="+52 XXX XXXX XXXX"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">Ciudad</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-9 rounded-xl text-sm bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20 focus:border-[#ace600]/50 outline-none px-3 transition-all"
                  placeholder="Ej: Guadalajara"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">Dirección</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full h-9 rounded-xl text-sm bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20 focus:border-[#ace600]/50 outline-none px-3 transition-all"
                  placeholder="Calle, número, ciudad"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">RFC</label>
                <input
                  type="text"
                  value={formData.rfc || ''}
                  onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                  className="w-full h-9 rounded-xl text-sm bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20 focus:border-[#ace600]/50 outline-none px-3 transition-all"
                  placeholder="RFC"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">Sitio Web</label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full h-9 rounded-xl text-sm bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20 focus:border-[#ace600]/50 outline-none px-3 transition-all"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5 block">Plan de Membresía</label>
                <select
                  value={formData.membership_status || 'basic'}
                  onChange={(e) => setFormData({ ...formData, membership_status: e.target.value })}
                  className="w-full h-9 rounded-xl text-sm bg-white/[0.04] border border-white/[0.09] text-white focus:border-[#ace600]/50 outline-none px-3 transition-all"
                >
                  <option value="basic">Básico</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="isActive" className="text-xs text-white/60 cursor-pointer">Club activo</label>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 px-6 pb-6">
            <button
              onClick={() => { setIsFormOpen(false); setFormData({}); }}
              disabled={formLoading}
              className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={formLoading}
              className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#ace600]/90 text-black text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {formData.id ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ───────────────────────────────────────────── */}
      <Dialog open={deleteDialog.open} onOpenChange={(v) => !v && setDeleteDialog({ open: false, id: '', name: '' })}>
        <DialogContent className="bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm p-0 shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="w-11 h-11 rounded-2xl bg-red-500/[0.08] border border-red-500/15 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">¿Eliminar club?</h2>
            <p className="text-sm text-white/35 leading-relaxed">
              Estás a punto de eliminar <span className="text-white/60 font-medium">"{deleteDialog.name}"</span>. Esta acción no puede deshacerse.
            </p>
          </div>
          <div className="flex gap-2.5 px-6 pb-6">
            <button
              onClick={() => setDeleteDialog({ open: false, id: '', name: '' })}
              disabled={deleteLoading}
              className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 h-9 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Eliminar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
