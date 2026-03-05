import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Settings,
  Eye,
  Zap,
  Play,
  MoreHorizontal,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Copy,
  Trash2,
  Edit,
  Plus,
  X,
  RefreshCw,
  Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { AppDispatch, RootState } from '@/store';
import { fetchTournaments, publishTournament } from '@/store/slices/tournamentsSlice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Tournament } from '@/types/api';

// ─── Status config ─────────────────────────────────────────────────────────────
const S: Record<string, { label: string; dot: string; cls: string; pulse?: boolean }> = {
  draft: {
    label: 'Borrador',
    dot: 'bg-white/20',
    cls: 'bg-white/[0.04] text-white/30 border-white/[0.07]',
  },
  pending_validation: {
    label: 'Pend. Aprobación',
    dot: 'bg-amber-400',
    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    pulse: true,
  },
  approved: {
    label: 'Aprobado',
    dot: 'bg-sky-400',
    cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  published: {
    label: 'Publicado',
    dot: 'bg-emerald-400',
    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  in_progress: {
    label: 'En Progreso',
    dot: 'bg-[#ace600]',
    cls: 'bg-[#ace600]/10 text-[#ace600] border-[#ace600]/20',
    pulse: true,
  },
  completed: {
    label: 'Completado',
    dot: 'bg-violet-400',
    cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  cancelled: {
    label: 'Cancelado',
    dot: 'bg-red-400',
    cls: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const c = S[status] ?? {
    label: status,
    dot: 'bg-white/20',
    cls: 'bg-white/[0.04] text-white/30 border-white/[0.07]',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0',
        c.cls,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot, c.pulse && 'animate-pulse')} />
      {c.label}
    </span>
  );
}

function MetaChip({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-white/30">
      <Icon className="w-3 h-3 text-white/15 shrink-0" />
      {children}
    </span>
  );
}

function InlineBtn({
  onClick,
  icon: Icon,
  children,
  lime,
}: {
  onClick: () => void;
  icon: React.ElementType;
  children: React.ReactNode;
  lime?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 h-6 px-2.5 rounded-lg text-[11px] font-bold transition-all',
        lime
          ? 'bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_8px_rgba(172,230,0,0.14)]'
          : 'bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.09]',
      )}
    >
      <Icon className="w-3 h-3" />
      {children}
    </button>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface OrganizerTournamentDashboardProps {
  organizerType?: 'state' | 'club' | 'admin';
  showCreateButton?: boolean;
  onCreateNew?: () => void;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function OrganizerTournamentDashboard({
  organizerType = 'admin',
  showCreateButton = true,
  onCreateNew,
}: OrganizerTournamentDashboardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { tournaments = [], loading } = useSelector((s: RootState) => s.tournaments);
  const { user } = useSelector((s: RootState) => s.auth);

  const [search, setSearch] = useState('');
  const [activeStatus, setStatus] = useState('all');
  const [selTour, setSelTour] = useState<Tournament | null>(null);
  const [delOpen, setDelOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toPublish, setToPublish] = useState<Tournament | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const buildParams = () => {
    const p: any = {
      limit: 100,
      myTournaments: 'true', // Filter to show only tournaments created by the user
    };
    if (organizerType === 'admin') p.tournament_type = 'national';
    else if (organizerType === 'state') {
      p.tournament_type = 'state';
      p.state = user?.state;
    } else if (organizerType === 'club') {
      p.tournament_type = 'local';
    }
    return p;
  };

  useEffect(() => {
    dispatch(fetchTournaments(buildParams()) as any);
  }, [organizerType, user?.state, user?.city]);

  const safe = Array.isArray(tournaments) ? tournaments : [];

  const filtered = useMemo(() => {
    let r = [...safe];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (t) => t.name?.toLowerCase().includes(q) || t.venue_name?.toLowerCase().includes(q),
      );
    }
    if (activeStatus !== 'all') r = r.filter((t) => t.status === activeStatus);
    return r.sort(
      (a, b) =>
        new Date(b.created_at || b.start_date || 0).getTime() -
        new Date(a.created_at || a.start_date || 0).getTime(),
    );
  }, [safe, search, activeStatus]);

  const baseUrl =
    organizerType === 'club'
      ? '/clubs/dashboard/tournaments'
      : organizerType === 'state'
        ? '/state/dashboard/tournaments'
        : '/admin/dashboard/tournaments';

  const handleDeleteConfirm = async () => {
    if (!selTour) return;
    setDeleting(true);
    try {
      toast.success('Torneo eliminado');
      dispatch(fetchTournaments(buildParams()) as any);
      setDelOpen(false);
      setSelTour(null);
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const handlePublish = (t: Tournament) => {
    setToPublish(t);
  };

  const confirmPublish = async () => {
    if (!toPublish) return;
    setIsPublishing(true);
    try {
      await dispatch(publishTournament(toPublish.id) as any).unwrap();
      setToPublish(null);
      setIsPublishing(false);
      toast.success('Torneo publicado correctamente');
      dispatch(fetchTournaments(buildParams()) as any);
    } catch (err: any) {
      setIsPublishing(false);
      toast.error(`Error al publicar: ${err.message || err}`);
    }
  };

  const stats = [
    {
      label: 'Total',
      v: safe.length,
      col: 'text-white/50',
      icon: Trophy,
      bg: 'bg-white/[0.04] border-white/[0.07]',
    },
    {
      label: 'Pendientes',
      v: safe.filter((t: any) => t.status === 'pending_validation').length,
      col: 'text-amber-400',
      icon: Clock,
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'En progreso',
      v: safe.filter((t: any) => t.status === 'in_progress').length,
      col: 'text-[#ace600]',
      icon: Zap,
      bg: 'bg-[#ace600]/10 border-[#ace600]/20',
    },
    {
      label: 'Completados',
      v: safe.filter((t: any) => t.status === 'completed').length,
      col: 'text-violet-400',
      icon: CheckCircle2,
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-[22px] font-bold text-white tracking-tight">Gestión de Torneos</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
              {organizerType === 'club'
                ? 'Club'
                : organizerType === 'state'
                  ? 'Estatal'
                  : 'Federación'}
            </span>
          </div>
          <p className="text-xs text-white/25">Administra y monitorea el progreso de tus torneos</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => dispatch(fetchTournaments(buildParams()) as any)}
            disabled={loading}
            className="h-9 px-3 rounded-xl text-xs text-white/30 hover:text-white hover:bg-white/[0.06] border border-white/[0.07] inline-flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            Actualizar
          </button>
          {showCreateButton && (
            <button
              onClick={onCreateNew}
              className="h-9 px-4 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold inline-flex items-center gap-1.5 shadow-[0_0_16px_rgba(172,230,0,0.2)] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Torneo
            </button>
          )}
        </div>
      </div>

      {/* ── Stat strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stats.map(({ label, v, col, icon: Icon, bg }) => (
          <div
            key={label}
            className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1 truncate">
                {label}
              </p>
              <p className={cn('text-[22px] font-bold leading-none', col)}>{v}</p>
            </div>
            <div
              className={cn(
                'w-8 h-8 rounded-xl border flex items-center justify-center shrink-0',
                bg,
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', col)} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o sede…"
            className="h-10 pl-10 pr-9 rounded-xl text-sm bg-[#0d1117] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:border-[#ace600]/40 transition-all"
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

        {/* Status pill tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-px">
          {(['all', ...Object.keys(S)] as string[]).map((s) => {
            const cfg = S[s];
            const isAll = s === 'all';
            const count = isAll ? safe.length : safe.filter((t: any) => t.status === s).length;
            const active = activeStatus === s;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap shrink-0 transition-all',
                  active
                    ? 'bg-[#ace600] text-black shadow-[0_0_10px_rgba(172,230,0,0.15)]'
                    : 'bg-[#0d1117] border border-white/[0.07] text-white/30 hover:text-white/55 hover:border-white/[0.12]',
                )}
              >
                {!isAll && cfg && (
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      active ? 'bg-black/30' : cfg.dot,
                    )}
                  />
                )}
                {isAll ? 'Todos' : cfg?.label}
                <span
                  className={cn(
                    'text-[10px] font-mono px-1.5 py-px rounded-full',
                    active ? 'bg-black/15 text-black/50' : 'bg-white/[0.06] text-white/20',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Loading ──────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-5 h-5 text-[#ace600] animate-spin" />
          <p className="text-xs text-white/20">Cargando torneos…</p>
        </div>
      )}

      {/* ── Empty ────────────────────────────────────────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white/10" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/30 mb-1">
              {search || activeStatus !== 'all' ? 'Sin resultados' : 'Sin torneos aún'}
            </p>
            <p className="text-xs text-white/18 max-w-[200px] leading-relaxed">
              {search || activeStatus !== 'all'
                ? 'Prueba ajustando los filtros'
                : 'Crea un torneo para comenzar'}
            </p>
          </div>
          {(search || activeStatus !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setStatus('all');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#ace600]/60 hover:text-[#ace600] transition-colors"
            >
              <X className="w-3 h-3" /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* ── List ─────────────────────────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((t) => {
            const canStart = ['approved', 'published'].includes(t.status);
            const canManage = ['published', 'in_progress'].includes(t.status);
            const fillPct =
              t.max_participants && t.current_participants !== undefined
                ? Math.min(Math.round((t.current_participants / t.max_participants) * 100), 100)
                : null;

            return (
              <div
                key={t.id}
                className="group bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4 hover:border-white/[0.12] transition-all"
              >
                <div className="flex gap-3">
                  {/* Initials */}
                  <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[11px] font-black text-[#ace600] shrink-0 select-none mt-0.5">
                    {t.name
                      ?.split(' ')
                      .map((w: string) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || '??'}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Row 1 */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h3 className="text-sm font-bold text-white/70 group-hover:text-white/90 transition-colors truncate">
                          {t.name}
                        </h3>
                        <StatusPill status={t.status} />
                      </div>

                      {/* Action menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white/15 hover:text-white/60 hover:bg-white/[0.07] opacity-0 group-hover:opacity-100 transition-all shrink-0 -mt-0.5">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 bg-[#13181f] border border-white/[0.09] rounded-xl shadow-2xl p-1"
                        >
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-2 py-1.5">
                            Acciones
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/[0.06] my-1" />
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`${baseUrl}/${t.id}`, { state: { tournament: t } })
                            }
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-white/50 hover:text-white hover:bg-white/[0.07] cursor-pointer focus:bg-white/[0.07] focus:text-white"
                          >
                            <Eye className="w-3.5 h-3.5" /> Ver detalles
                          </DropdownMenuItem>
                          {canStart && (
                            <DropdownMenuItem
                              onClick={() => navigate(`/tournaments/${t.id}/start`)}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-[#ace600] hover:text-[#c0f000] hover:bg-[#ace600]/[0.08] cursor-pointer focus:bg-[#ace600]/[0.08]"
                            >
                              <Play className="w-3.5 h-3.5" /> Iniciar torneo
                            </DropdownMenuItem>
                          )}
                          {canManage && (
                            <DropdownMenuItem
                              onClick={() =>
                                organizerType === 'club'
                                  ? navigate(`/clubs/dashboard/tournaments/view/${t.id}`)
                                  : navigate(`${baseUrl}/${t.id}/manage`)
                              }
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-white/50 hover:text-white hover:bg-white/[0.07] cursor-pointer focus:bg-white/[0.07] focus:text-white"
                            >
                              <Settings className="w-3.5 h-3.5" /> Gestionar
                            </DropdownMenuItem>
                          )}
                          {['in_progress', 'completed'].includes(t.status) && (
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`${baseUrl}/${t.id}`, { state: { tab: 'results' } })
                              }
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-white/50 hover:text-white hover:bg-white/[0.07] cursor-pointer focus:bg-white/[0.07] focus:text-white"
                            >
                              <Zap className="w-3.5 h-3.5" /> Resultados
                            </DropdownMenuItem>
                          )}
                          {['draft', 'approved'].includes(t.status) && (
                            <>
                              <DropdownMenuSeparator className="bg-white/[0.06] my-1" />
                              <DropdownMenuItem
                                onClick={() => navigate(`${baseUrl}/${t.id}/edit`)}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-white/50 hover:text-white hover:bg-white/[0.07] cursor-pointer focus:bg-white/[0.07] focus:text-white"
                              >
                                <Edit className="w-3.5 h-3.5" /> Editar
                              </DropdownMenuItem>
                            </>
                          )}
                          {['draft', 'approved', 'completed'].includes(t.status) && (
                            <DropdownMenuItem
                              onClick={() => toast.success('Torneo duplicado')}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-white/50 hover:text-white hover:bg-white/[0.07] cursor-pointer focus:bg-white/[0.07] focus:text-white"
                            >
                              <Copy className="w-3.5 h-3.5" /> Duplicar
                            </DropdownMenuItem>
                          )}
                          {t.status === 'draft' && (
                            <>
                              <DropdownMenuSeparator className="bg-white/[0.06] my-1" />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelTour(t);
                                  setDelOpen(true);
                                }}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] cursor-pointer focus:bg-red-500/[0.08]"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Eliminar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Row 2: meta */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2.5">
                      {t.venue_name && <MetaChip icon={MapPin}>{t.venue_name}</MetaChip>}
                      {t.start_date && (
                        <MetaChip icon={Calendar}>
                          {new Date(t.start_date).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                          {t.end_date &&
                            t.end_date !== t.start_date &&
                            ` – ${new Date(t.end_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`}
                        </MetaChip>
                      )}
                      {t.current_participants !== undefined && (
                        <MetaChip icon={Users}>
                          {t.current_participants}
                          {t.max_participants ? `/${t.max_participants}` : ''} participantes
                        </MetaChip>
                      )}
                    </div>

                    {/* Capacity bar */}
                    {fillPct !== null && (
                      <div className="h-px bg-white/[0.05] rounded-full overflow-hidden mb-2.5">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-700',
                            fillPct >= 90
                              ? 'bg-red-500'
                              : fillPct >= 70
                                ? 'bg-amber-500'
                                : 'bg-[#ace600]',
                          )}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    )}

                    {/* Inline CTAs */}
                    {(canStart ||
                      canManage ||
                      ['in_progress', 'completed'].includes(t.status) ||
                      t.status === 'approved') && (
                      <div className="flex flex-wrap gap-1.5">
                        {t.status === 'approved' && (
                          <InlineBtn lime icon={Rocket} onClick={() => handlePublish(t)}>
                            Publicar
                          </InlineBtn>
                        )}
                        {canStart && (
                          <InlineBtn
                            lime
                            icon={Play}
                            onClick={() => navigate(`/tournaments/${t.id}/start`)}
                          >
                            Iniciar
                          </InlineBtn>
                        )}
                        {canManage && (
                          <InlineBtn
                            icon={Settings}
                            onClick={() =>
                              organizerType === 'club'
                                ? navigate(`/clubs/dashboard/tournaments/view/${t.id}`)
                                : navigate(`${baseUrl}/${t.id}/manage`)
                            }
                          >
                            Gestionar
                          </InlineBtn>
                        )}
                        {['in_progress', 'completed'].includes(t.status) && (
                          <InlineBtn
                            icon={Zap}
                            onClick={() =>
                              navigate(`${baseUrl}/${t.id}`, { state: { tab: 'results' } })
                            }
                          >
                            Resultados
                          </InlineBtn>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Publish dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={!!toPublish}
        onOpenChange={(v) => {
          if (!isPublishing && !v) {
            setToPublish(null);
          }
        }}
      >
        <DialogContent className="bg-[#0d1117] border border-white/[0.09] rounded-2xl p-0 gap-0 max-w-sm shadow-2xl [&>button:last-child]:hidden">
          <DialogHeader className="flex flex-row items-center gap-3 px-5 py-4 border-b border-white/[0.06] space-y-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Rocket className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <DialogTitle className="text-sm font-bold text-white">Publicar Torneo</DialogTitle>
          </DialogHeader>
          <div className="px-5 py-4 space-y-4">
            <p className="text-sm text-white/40 leading-relaxed">
              Publicar <span className="text-white/70 font-semibold">'{toPublish?.name}'</span>{' '}
              permitirá a los jugadores inscribirse en este torneo.
            </p>
            {toPublish && (
              <div className="space-y-2 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  Detalles del Torneo
                </p>
                <div className="space-y-1.5 text-xs text-white/40">
                  {toPublish.start_date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-white/20" />
                      {new Date(toPublish.start_date).toLocaleDateString('es-MX')}
                    </p>
                  )}
                  {toPublish.venue_name && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-white/20" />
                      {toPublish.venue_name}
                    </p>
                  )}
                  {toPublish.registration_deadline && (
                    <p className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-white/20" />
                      Límite:{' '}
                      {new Date(toPublish.registration_deadline).toLocaleDateString('es-MX')}
                    </p>
                  )}
                  {toPublish.max_participants && (
                    <p className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-white/20" />
                      Máx: {toPublish.max_participants} participantes
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 bg-emerald-500/[0.05] border border-emerald-500/12 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60 shrink-0 mt-px" />
              <p className="text-[11px] text-emerald-400/55 leading-relaxed">
                Los jugadores podrán registrarse una vez publicado el torneo.
              </p>
            </div>
          </div>
          <DialogFooter className="px-5 py-4 border-t border-white/[0.06] flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setToPublish(null)}
              disabled={isPublishing}
              className="flex-1 h-8 rounded-xl border-white/[0.08] bg-transparent hover:bg-white/[0.06] text-white/35 hover:text-white text-xs transition-all"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={confirmPublish}
              disabled={isPublishing}
              className="flex-1 h-8 rounded-xl bg-emerald-500/70 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 transition-all disabled:opacity-60"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Publicando…
                </>
              ) : (
                <>
                  <Rocket className="w-3.5 h-3.5" />
                  Publicar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete dialog ────────────────────────────────────────────────────── */}
      <Dialog
        open={delOpen}
        onOpenChange={(v) => {
          if (!deleting) {
            setDelOpen(v);
            if (!v) setSelTour(null);
          }
        }}
      >
        <DialogContent className="bg-[#0d1117] border border-white/[0.09] rounded-2xl p-0 gap-0 max-w-sm shadow-2xl [&>button:last-child]:hidden">
          <DialogHeader className="flex flex-row items-center gap-3 px-5 py-4 border-b border-white/[0.06] space-y-0">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </div>
            <DialogTitle className="text-sm font-bold text-white">Eliminar Torneo</DialogTitle>
          </DialogHeader>
          <div className="px-5 py-4 space-y-3">
            <p className="text-sm text-white/40 leading-relaxed">
              ¿Eliminar <span className="text-white/70 font-semibold">"{selTour?.name}"</span>? Esta
              acción no se puede deshacer.
            </p>
            <div className="flex items-start gap-2 p-3 bg-red-500/[0.05] border border-red-500/12 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5 text-red-400/60 shrink-0 mt-px" />
              <p className="text-[11px] text-red-400/55 leading-relaxed">
                Se eliminarán todos los eventos e inscripciones relacionados permanentemente.
              </p>
            </div>
          </div>
          <DialogFooter className="px-5 py-4 border-t border-white/[0.06] flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDelOpen(false)}
              disabled={deleting}
              className="flex-1 h-8 rounded-xl border-white/[0.08] bg-transparent hover:bg-white/[0.06] text-white/35 hover:text-white text-xs transition-all"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex-1 h-8 rounded-xl bg-red-500/70 hover:bg-red-500 text-white text-xs font-bold gap-1.5 transition-all"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Eliminando…
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrganizerTournamentDashboard;
