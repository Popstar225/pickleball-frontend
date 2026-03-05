import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  CheckCircle2,
  Globe,
  MapPin,
  Trophy,
  Clock,
  AlertCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Check,
  X,
  Calendar,
  Users,
  Building2,
  Zap,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import { fetchTournaments, approveTournament } from '@/store/slices/tournamentsSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Status config ────────────────────────────────────────────────────────────
const statusCfg: Record<string, { label: string; cls: string; dot: string }> = {
  pending_validation: {
    label: 'Pend. Aprobación',
    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-500 animate-pulse',
  },
  approved: {
    label: 'Aprobado',
    cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    dot: 'bg-sky-500',
  },
  state_approved: {
    label: 'Ap. Estatal',
    cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    dot: 'bg-sky-500',
  },
  published: {
    label: 'Publicado',
    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  in_progress: {
    label: 'En Progreso',
    cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    dot: 'bg-violet-500 animate-pulse',
  },
  completed: {
    label: 'Completado',
    cls: 'bg-white/[0.05] text-white/35 border-white/[0.08]',
    dot: 'bg-white/25',
  },
  cancelled: {
    label: 'Cancelado',
    cls: 'bg-red-500/10 text-red-400 border-red-500/20',
    dot: 'bg-red-500',
  },
};

const scopeCfg: Record<string, { label: string; cls: string }> = {
  local: { label: 'Local', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  state: { label: 'Estatal', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  national: { label: 'Nacional', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusCfg[status] ?? {
    label: status,
    cls: 'bg-white/[0.05] text-white/35 border-white/[0.08]',
    dot: 'bg-white/25',
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border',
        cfg.cls,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </Badge>
  );
}

function ScopeBadge({ scope }: { scope: string }) {
  const cfg = scopeCfg[scope] ?? {
    label: scope,
    cls: 'bg-white/[0.05] text-white/35 border-white/[0.08]',
  };
  return (
    <Badge
      variant="outline"
      className={cn('text-[10px] font-bold uppercase tracking-wider rounded-full border', cfg.cls)}
    >
      {cfg.label}
    </Badge>
  );
}

const FILTER_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'approved', label: 'Aprobados' },
] as const;

type FilterKey = 'all' | 'pending' | 'approved';

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FederationTournamentManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { tournaments, loading } = useSelector((s: RootState) => s.tournaments);

  const [selected, setSelected] = useState<any>(null);
  const [dialogOpen, setDialog] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('pending');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    dispatch(fetchTournaments({ limit: 100 }));
  }, [dispatch]);

  const safe = Array.isArray(tournaments) ? tournaments : [];

  const filtered = safe
    .filter((t: any) => {
      if (filter === 'pending')
        return t.status === 'pending_validation' || t.status === 'state_approved';
      if (filter === 'approved') return ['approved', 'state_approved'].includes(t.status);
      return true;
    })
    .filter((t: any) => ['pending_validation', 'state_approved', 'approved'].includes(t.status));

  const handleApprove = (t: any) => {
    setSelected(t);
    setDialog(true);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setApproving(true);
    try {
      await dispatch(approveTournament({ id: selected.id })).unwrap();
      setDialog(false);
      setSelected(null);
      dispatch(fetchTournaments({ limit: 100 }));
      toast.success('Torneo aprobado exitosamente');
    } catch (err: any) {
      toast.error(`Error al aprobar: ${err?.message}`);
    } finally {
      setApproving(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const statCards = [
    {
      label: 'Total',
      value: safe.filter((t: any) =>
        ['pending_validation', 'approved', 'state_approved'].includes(t.status),
      ).length,
      icon: Trophy,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      label: 'Pendientes',
      value: safe.filter((t: any) => t.status === 'pending_validation').length,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Aprobados',
      value: safe.filter((t: any) => ['approved', 'state_approved'].includes(t.status)).length,
      icon: CheckCircle2,
      color: 'text-[#ace600]',
      bg: 'bg-[#ace600]/10 border-[#ace600]/20',
    },
    {
      label: 'A publicar',
      value: safe.filter((t: any) => ['approved', 'state_approved'].includes(t.status)).length,
      icon: Zap,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
  ];

  const thCls =
    'text-[10px] font-bold uppercase tracking-widest text-white/25 px-5 py-3.5 text-left font-normal';

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 p-1">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Validación de Torneos</h1>
            <Badge
              variant="outline"
              className="gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse inline-block" />
              Federación
            </Badge>
          </div>
          <p className="text-xs text-white/30">
            Revisa y aprueba solicitudes de torneos de los clubes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(fetchTournaments({ limit: 100 }))}
            disabled={loading}
            className="h-9 rounded-xl border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white hover:border-white/[0.12] transition-all"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loading && 'animate-spin')} /> Actualizar
          </Button>
          <Button
            size="sm"
            disabled
            className="h-9 rounded-xl bg-slate-600 text-slate-400 font-bold cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Nuevo Torneo
          </Button>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                {label}
              </p>
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center border', bg)}>
                <Icon className={cn('w-3.5 h-3.5', color)} />
              </div>
            </div>
            <p className={cn('text-2xl font-bold leading-none', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-[#0d1117] border border-white/[0.07] rounded-2xl w-fit">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all',
              filter === key
                ? 'bg-[#ace600] text-black shadow-[0_0_12px_rgba(172,230,0,0.18)]'
                : 'text-white/35 hover:text-white/60',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
            <p className="text-xs text-white/25">Cargando torneos…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white/10" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white/40 mb-1">No hay torneos</p>
              <p className="text-xs text-white/20">Ajusta los filtros o crea un nuevo torneo</p>
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className={thCls}>Torneo</th>
                  <th className={cn(thCls, 'hidden sm:table-cell')}>Alcance</th>
                  <th className={cn(thCls, 'hidden md:table-cell')}>Ubicación</th>
                  <th className={cn(thCls, 'hidden lg:table-cell')}>Fechas</th>
                  <th className={thCls}>Estado</th>
                  <th className={thCls} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((t: any) => (
                  <tr
                    key={t.id}
                    className="group border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Tournament name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[11px] font-bold text-[#ace600] shrink-0">
                          {t.name
                            ?.split(' ')
                            .map((w: string) => w[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase() || '??'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white/75 truncate group-hover:text-white transition-colors">
                            {t.name}
                          </p>
                          {t.organizer_name && (
                            <p className="text-[11px] text-white/30 truncate">
                              por {t.organizer_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Scope */}
                    <td className="hidden sm:table-cell px-5 py-3.5">
                      <ScopeBadge scope={t.tournament_type || 'local'} />
                    </td>

                    {/* Location */}
                    <td className="hidden md:table-cell px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-white/20 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-white/55 truncate">{t.city || '—'}</p>
                          <p className="text-[11px] text-white/25">{t.state}</p>
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="hidden lg:table-cell px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-white/20 shrink-0" />
                        <div>
                          <p className="text-xs text-white/55">
                            {new Date(t.start_date).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-[11px] text-white/25">
                            {new Date(t.end_date).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={t.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-xl text-white/25 hover:text-white hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
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
                            onClick={() => navigate(`/tournaments/${t.id}`)}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.06] cursor-pointer focus:bg-white/[0.06] focus:text-white"
                          >
                            <Eye className="w-3.5 h-3.5" /> Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/tournaments/${t.id}/edit`)}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.06] cursor-pointer focus:bg-white/[0.06] focus:text-white"
                          >
                            <Edit className="w-3.5 h-3.5" /> Editar
                          </DropdownMenuItem>
                          {t.status === 'pending_validation' && (
                            <>
                              <DropdownMenuSeparator className="bg-white/[0.05] my-1" />
                              <DropdownMenuItem
                                onClick={() => handleApprove(t)}
                                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-[#ace600] hover:text-[#c0f000] hover:bg-[#ace600]/[0.08] cursor-pointer focus:bg-[#ace600]/[0.08] focus:text-[#c0f000]"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar torneo
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Approve confirmation dialog ──────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          if (!approving) {
            setDialog(v);
            if (!v) setSelected(null);
          }
        }}
      >
        <DialogContent
          className={cn(
            'bg-[#0d1117] border border-white/[0.08] rounded-2xl shadow-2xl p-0 gap-0 max-w-md',
            '[&>button:last-child]:hidden',
          )}
        >
          <DialogHeader className="flex flex-row items-center gap-3 px-6 py-5 border-b border-white/[0.06] space-y-0">
            <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#ace600]" />
            </div>
            <DialogTitle className="text-base font-bold text-white">
              Aprobar Solicitud de Torneo
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="px-6 py-5 space-y-4">
              {/* Tournament summary */}
              <div className="flex items-start gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[11px] font-bold text-[#ace600] shrink-0">
                  {selected.name
                    ?.split(' ')
                    .map((w: string) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white/85 mb-2">{selected.name}</p>
                  <div className="space-y-1">
                    {[
                      {
                        icon: MapPin,
                        val: `${selected.city || ''}${selected.city && selected.state ? ', ' : ''}${selected.state || '—'}`,
                      },
                      {
                        icon: Calendar,
                        val: `${new Date(selected.start_date).toLocaleDateString('es-MX')} – ${new Date(selected.end_date).toLocaleDateString('es-MX')}`,
                      },
                      {
                        icon: Users,
                        val: selected.max_participants
                          ? `${selected.max_participants} lugares`
                          : 'Cupo sin límite',
                      },
                    ].map(({ icon: Icon, val }) => (
                      <div key={val} className="flex items-center gap-2 text-xs text-white/35">
                        <Icon className="w-3 h-3 shrink-0 text-white/20" />
                        {val}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Green info */}
              <div className="flex items-start gap-3 p-3.5 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-400/80 leading-relaxed">
                  Aprobar este torneo permitirá que el club lo publique y habilite las inscripciones
                  de jugadores.
                </p>
              </div>

              {/* Amber warning */}
              <div className="flex items-start gap-3 p-3.5 bg-amber-500/[0.05] border border-amber-500/15 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400/70 leading-relaxed">
                  El club será responsable de publicar el torneo después de la aprobación. Verifica
                  que todos los detalles sean correctos.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="px-6 py-4 border-t border-white/[0.06] flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialog(false);
                setSelected(null);
              }}
              disabled={approving}
              className="flex-1 h-9 rounded-xl border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={approving}
              className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold gap-1.5 shadow-[0_0_14px_rgba(172,230,0,0.18)] transition-all"
            >
              {approving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Aprobando…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar Torneo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
