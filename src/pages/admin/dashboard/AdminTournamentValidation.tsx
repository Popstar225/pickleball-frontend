import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Calendar,
  Users,
  XCircle,
  Trophy,
  X,
  List,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import { fetchTournaments, approveTournament } from '@/store/slices/tournamentsSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const cn = (...cls: (string | undefined | null | false)[]) => cls.filter(Boolean).join(' ');
const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { label: 'Todos', value: 'all', icon: List, accent: 'slate' },
  { label: 'Pendientes', value: 'pending_validation', icon: Clock, accent: 'amber' },
  { label: 'Aprobados', value: 'approved', icon: CheckCircle2, accent: 'emerald' },
  { label: 'Rechazados', value: 'rejected', icon: XCircle, accent: 'red' },
  { label: 'Completados', value: 'completed', icon: Trophy, accent: 'sky' },
];

const TYPE_LABELS: Record<string, string> = {
  state: 'Estatal',
  club: 'Club',
  federation: 'Federación',
  regional: 'Regional',
};

const ACCENT: Record<string, { tab: string; pill: string; bg: string }> = {
  slate: {
    tab: 'text-white/60',
    pill: 'bg-white/[0.06] text-white/40 border-white/[0.09]',
    bg: 'bg-white/[0.05] border-white/[0.08]',
  },
  amber: {
    tab: 'text-amber-400',
    pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  emerald: {
    tab: 'text-emerald-400',
    pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  red: {
    tab: 'text-red-400',
    pill: 'bg-red-500/10 text-red-400 border-red-500/20',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  sky: {
    tab: 'text-sky-400',
    pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    bg: 'bg-sky-500/10 border-sky-500/20',
  },
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Pill({ children, cls }: { children: React.ReactNode; cls: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap',
        cls,
      )}
    >
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  color,
  bg,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">
          {label}
        </p>
        <p className={cn('text-[22px] font-bold leading-none', color)}>{value}</p>
      </div>
      <div
        className={cn('w-8 h-8 rounded-xl border flex items-center justify-center shrink-0', bg)}
      >
        <Icon className={cn('w-3.5 h-3.5', color)} />
      </div>
    </div>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────
function ActionDialog({
  open,
  onClose,
  tournament,
  actionType,
  rejectionReason,
  setRejectionReason,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  tournament: any;
  actionType: string;
  rejectionReason: string;
  setRejectionReason: (v: string) => void;
  onConfirm: () => void;
}) {
  if (!open || !tournament) return null;
  const isApprove = actionType === 'approve';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1117] border border-white/[0.09] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'w-7 h-7 rounded-xl border flex items-center justify-center',
                isApprove
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-red-500/10 border-red-500/20',
              )}
            >
              {isApprove ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400" />
              )}
            </div>
            <h2 className="text-sm font-bold text-white">
              {isApprove ? 'Aprobar' : 'Rechazar'} torneo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.08] text-white/30 hover:text-white transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[10px] font-black text-[#ace600] shrink-0 select-none">
              {initials(tournament.name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{tournament.name}</p>
              <p className="text-[11px] text-white/30 mt-0.5">
                {tournament.city}, {tournament.state} · {tournament.organizer_name}
              </p>
            </div>
          </div>

          {isApprove ? (
            <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl px-4 py-3">
              <p className="text-xs text-emerald-300 leading-relaxed">
                Este torneo estatal será aprobado y podrá ser publicado por la delegación.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                Motivo del rechazo <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explica por qué este torneo está siendo rechazado…"
                rows={4}
                className="w-full bg-white/[0.04] border border-white/[0.09] focus:border-[#ace600]/40 rounded-xl px-3.5 py-3 text-xs text-white placeholder:text-white/20 outline-none resize-none transition-colors"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!isApprove && !rejectionReason.trim()}
            className={cn(
              'flex-1 h-9 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed',
              isApprove
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                : 'bg-red-500 hover:bg-red-400 text-white',
            )}
          >
            {isApprove ? 'Confirmar aprobación' : 'Confirmar rechazo'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminTournamentValidationPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { tournaments: allTournaments, loading } = useSelector(
    (s: RootState) => s.tournaments,
  );

  const [activeTab, setActiveTab] = useState('all');
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('approve');

  const stateTournaments = Array.isArray(allTournaments) ? allTournaments : [];

  const filteredTournaments =
    activeTab === 'all'
      ? stateTournaments
      : stateTournaments.filter((t) => t.status === activeTab);

  function load() {
    dispatch(fetchTournaments({ limit: 100 } as any));
  }

  useEffect(() => {
    load();
  }, []);

  const handleReview = (tournament: any, action: string) => {
    setSelectedTournament(tournament);
    setActionType(action);
    setRejectionReason('');
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedTournament) return;
    if (actionType === 'reject' && !rejectionReason.trim()) return;
    try {
      await dispatch(
        approveTournament({
          id: selectedTournament.id,
          rejectionReason: actionType === 'reject' ? rejectionReason : undefined,
        }),
      ).unwrap();
      setIsDialogOpen(false);
      setSelectedTournament(null);
      setRejectionReason('');
      load();
    } catch (err: any) {
      alert(`Error al ${actionType === 'approve' ? 'aprobar' : 'rechazar'} torneo: ${err.message || err}`);
    }
  };

  const counts = {
    all: stateTournaments.length,
    pending_validation: stateTournaments.filter((t) => t.status === 'pending_validation').length,
    approved: stateTournaments.filter((t) => t.status === 'approved').length,
    rejected: stateTournaments.filter((t) => (t.status as string) === 'rejected').length,
    completed: stateTournaments.filter((t) => t.status === 'completed').length,
  };

  const currentTab = STATUS_TABS.find((t) => t.value === activeTab)!;
  const acc = ACCENT[currentTab.accent];

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────*/}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-[#ace600]" />
          <h1 className="text-[22px] font-bold text-white tracking-tight">Validación de Torneos</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
            {stateTournaments.length} total
          </span>
        </div>
        <p className="text-xs text-white/25">
          Revisa y gestiona todos los torneos enviados para aprobación federativa
        </p>
      </div>

      {/* ── Stat strip ──────────────────────────────────────────────────────*/}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          label="Pendientes"
          value={counts.pending_validation}
          color="text-amber-400"
          bg="bg-amber-500/10 border-amber-500/20"
          icon={Clock}
        />
        <StatCard
          label="Aprobados"
          value={counts.approved}
          color="text-emerald-400"
          bg="bg-emerald-500/10 border-emerald-500/20"
          icon={CheckCircle2}
        />
        <StatCard
          label="Rechazados"
          value={counts.rejected}
          color="text-red-400"
          bg="bg-red-500/10 border-red-500/20"
          icon={XCircle}
        />
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────────*/}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-1.5 flex gap-1">
        {STATUS_TABS.map(({ label, value, icon: Icon, accent }) => {
          const a = ACCENT[accent];
          const active = activeTab === value;
          return (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-[11px] font-bold transition-all',
                active
                  ? cn('bg-white/[0.06] border border-white/[0.09]', a.tab)
                  : 'text-white/25 hover:text-white/50',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span
                className={cn(
                  'inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black border',
                  active ? a.pill : 'bg-white/[0.05] text-white/20 border-white/[0.07]',
                )}
              >
                {counts[value as keyof typeof counts]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Table panel ─────────────────────────────────────────────────────*/}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
          <currentTab.icon className={cn('w-3.5 h-3.5', acc.tab)} />
          <p className="text-xs font-bold text-white/40">
            {filteredTournaments.length} torneo{filteredTournaments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 rounded-full border-2 border-[#ace600]/30 border-t-[#ace600] animate-spin" />
          </div>
        )}

        {!loading && filteredTournaments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white/10" />
            </div>
            <p className="text-sm text-white/25">
              {activeTab === 'pending_validation'
                ? 'No hay torneos pendientes'
                : activeTab === 'approved'
                  ? 'No hay torneos aprobados'
                  : 'No hay torneos rechazados'}
            </p>
          </div>
        )}

        {!loading && filteredTournaments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {[
                    'Torneo',
                    'Organizador',
                    'Ubicación',
                    'Fechas',
                    'Detalles',
                    activeTab === 'all'
                      ? 'Estado'
                      : activeTab === 'pending_validation'
                        ? 'Acciones'
                        : activeTab === 'rejected'
                          ? 'Motivo'
                          : activeTab === 'completed'
                            ? ''
                            : '',
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest text-white/20"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredTournaments.map((t) => (
                  <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[10px] font-black text-[#ace600] shrink-0 select-none">
                          {initials(t.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-white/80 group-hover:text-white transition-colors text-xs truncate max-w-[140px]">
                            {t.name}
                          </p>
                          <Pill cls="mt-0.5 bg-sky-500/10 text-sky-400 border-sky-500/20">
                            {TYPE_LABELS[t.tournament_type] ?? t.tournament_type}
                          </Pill>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-white/35">
                        <Building2 className="w-3 h-3 text-white/15 shrink-0" />
                        <span className="truncate max-w-[130px]">{t.organizer_name}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-white/30">
                        <MapPin className="w-3 h-3 text-white/15 shrink-0" />
                        {t.city}, {t.state}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-start gap-1.5 text-[11px] text-white/30">
                        <Calendar className="w-3 h-3 text-white/15 shrink-0 mt-0.5" />
                        <div>
                          <p>
                            {new Date(t.start_date).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                          <p className="text-white/20">
                            →{' '}
                            {new Date(t.end_date).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <p className="inline-flex items-center gap-1 text-[11px] text-white/30">
                          <Users className="w-3 h-3 text-white/15" />
                          {t.max_participants || '—'} slots
                        </p>
                        {t.entry_fee && (
                          <p className="text-[11px] text-[#ace600]/60 font-semibold">
                            ${t.entry_fee} MXN
                          </p>
                        )}
                      </div>
                    </td>

                    {activeTab === 'all' && (
                      <td className="py-3 px-4">
                        {(t.status as string) === 'pending_validation' && (
                          <Pill cls={ACCENT.amber.pill}>
                            <Clock className="w-2.5 h-2.5" /> Pendiente
                          </Pill>
                        )}
                        {(t.status as string) === 'approved' && (
                          <Pill cls={ACCENT.emerald.pill}>
                            <CheckCircle2 className="w-2.5 h-2.5" /> Aprobado
                          </Pill>
                        )}
                        {(t.status as string) === 'rejected' && (
                          <Pill cls={ACCENT.red.pill}>
                            <XCircle className="w-2.5 h-2.5" /> Rechazado
                          </Pill>
                        )}
                        {t.status === 'completed' && (
                          <Pill cls={ACCENT.sky.pill}>
                            <Trophy className="w-2.5 h-2.5" /> Completado
                          </Pill>
                        )}
                        {!['pending_validation', 'approved', 'rejected', 'completed'].includes(t.status as string) && (
                          <Pill cls="bg-white/[0.05] text-white/30 border-white/[0.07]">
                            {t.status}
                          </Pill>
                        )}
                      </td>
                    )}

                    {activeTab === 'pending_validation' && (
                      <td className="py-3 px-4">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleReview(t, 'approve')}
                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Aprobar
                          </button>
                          <button
                            onClick={() => handleReview(t, 'reject')}
                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[10px] font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            <XCircle className="w-3 h-3" /> Rechazar
                          </button>
                        </div>
                      </td>
                    )}

                    {activeTab === 'rejected' && (
                      <td className="py-3 px-4 max-w-[200px]">
                        <p className="text-[11px] text-white/25 leading-relaxed line-clamp-2">
                          {t.rejection_reason || '—'}
                        </p>
                      </td>
                    )}

                    {(activeTab === 'approved' || activeTab === 'completed') && <td className="py-3 px-4" />}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ActionDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedTournament(null);
          setRejectionReason('');
        }}
        tournament={selectedTournament}
        actionType={actionType}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
