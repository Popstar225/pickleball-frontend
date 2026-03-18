/**
 * Player Active Tournaments Page
 *
 * Shows a player's tournament dashboard with:
 *   Tab 1 — Active: ongoing/upcoming registrations with phase, group, standings, match info
 *   Tab 2 — History: completed tournaments with final positions and stats
 *
 * Route: /players/dashboard/tournaments-view
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Clock,
  Loader2,
  ChevronRight,
  RefreshCw,
  Swords,
  CheckCircle2,
  XCircle,
  Layers,
  Star,
  Crown,
  Medal,
  AlertCircle,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { RootState } from '@/store';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

interface TournamentInfo {
  id: string;
  name: string;
  type: 'local' | 'state' | 'national';
  start_date: string;
  end_date: string;
  city: string;
  state: string;
  venue_name: string;
  status: string;
  is_endorsed: boolean;
}

interface EventInfo {
  id: string;
  skill_block: string;
  gender: string;
  modality: string;
  format: string | null;
}

interface StandingInfo {
  position: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  sets_won: number;
  sets_lost: number;
  points_for: number;
  points_against: number;
  qualified: boolean;
}

interface UpcomingMatch {
  id: string;
  scheduled_time: string;
  opponent_name: string;
  match_type: string;
}

interface RecentMatch {
  id: string;
  opponent_name: string;
  date: string;
  won: boolean;
  score: string | null;
  status: string;
}

interface ActiveRegistration {
  registrationId: string;
  status: 'confirmed' | 'waitlist';
  payment_status: string;
  registered_at: string;
  tournament: TournamentInfo;
  event: EventInfo;
  phase: 'registration' | 'in_progress' | 'group_stage' | 'knockout' | 'completed';
  group: { id: string; group_number: number } | null;
  standing: StandingInfo | null;
  upcoming_match: UpcomingMatch | null;
  recent_matches: RecentMatch[];
}

interface HistoryRegistration extends ActiveRegistration {
  final_position: number | null;
  result: string;
  points_earned: number;
}

interface DashboardStats {
  total_registrations: number;
  active_count: number;
  history_count: number;
  total_matches: number;
  wins: number;
  losses: number;
}

interface DashboardData {
  active: ActiveRegistration[];
  history: HistoryRegistration[];
  stats: DashboardStats;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const SKILL_COLOR: Record<string, string> = {
  '2.5': 'text-white/50 bg-white/[0.06] border-white/[0.1]',
  '3.5': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  '4.5': 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  '5+': 'text-[#ace600] bg-[#ace600]/10 border-[#ace600]/20',
};

const TYPE_COLOR: Record<string, string> = {
  local: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  state: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  national: 'text-[#ace600] bg-[#ace600]/10 border-[#ace600]/20',
};

const TYPE_LABEL: Record<string, string> = {
  local: 'Local',
  state: 'Estatal',
  national: 'Nacional',
};

const PHASE_CONFIG: Record<
  string,
  { label: string; cls: string; dot: string }
> = {
  registration: {
    label: 'Inscripción',
    cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    dot: 'bg-emerald-500 animate-pulse',
  },
  in_progress: {
    label: 'En Progreso',
    cls: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    dot: 'bg-sky-500',
  },
  group_stage: {
    label: 'Fase de Grupos',
    cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    dot: 'bg-amber-500',
  },
  knockout: {
    label: 'Eliminatoria',
    cls: 'text-[#ace600] bg-[#ace600]/10 border-[#ace600]/20',
    dot: 'bg-[#ace600] animate-pulse',
  },
  completed: {
    label: 'Completado',
    cls: 'text-white/60 bg-white/[0.04] border-white/[0.07]',
    dot: 'bg-white/20',
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function eventLabel(event: EventInfo) {
  const genderMap: Record<string, string> = { M: 'Varonil', F: 'Femenil', Mixed: 'Mixto' };
  const modalityMap: Record<string, string> = {
    Singles: 'Singles',
    Doubles: 'Dobles',
    Mixed: 'Dobles Mixto',
  };
  return `${event.skill_block} ${genderMap[event.gender] ?? event.gender} ${modalityMap[event.modality] ?? event.modality}`;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function PhaseBadge({ phase }: { phase: string }) {
  const cfg = PHASE_CONFIG[phase] ?? PHASE_CONFIG.registration;
  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border',
        cfg.cls,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </Badge>
  );
}

function PositionIcon({ position }: { position: number }) {
  if (position === 1) return <Crown className="w-5 h-5 text-amber-400" />;
  if (position === 2) return <Medal className="w-5 h-5 text-slate-200" />;
  if (position <= 4) return <Medal className="w-5 h-5 text-amber-600/70" />;
  return <span className="text-sm font-bold text-white/65">#{position}</span>;
}

function StandingRow({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex flex-col items-center bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-2 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/88 mb-1">{label}</p>
      <div className="text-lg font-bold text-white leading-none">{value}</div>
      {sub && <p className="text-[10px] text-white/50 mt-0.5">{sub}</p>}
    </div>
  );
}

function MatchResultChip({ match }: { match: RecentMatch }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs',
        match.won
          ? 'bg-emerald-500/[0.06] border-emerald-500/15 text-emerald-400'
          : match.status === 'walkover'
            ? 'bg-amber-500/[0.06] border-amber-500/15 text-amber-400'
            : 'bg-red-500/[0.06] border-red-500/15 text-red-400',
      )}
    >
      {match.won ? (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
      ) : match.status === 'walkover' ? (
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <XCircle className="w-3.5 h-3.5 shrink-0" />
      )}
      <span className="font-semibold truncate max-w-[120px]">{match.opponent_name}</span>
      {match.score && (
        <span className="font-mono text-[11px] opacity-70 ml-auto shrink-0">{match.score}</span>
      )}
    </div>
  );
}

// ─── Active Registration Card ────────────────────────────────────────────────

function ActiveCard({
  reg,
  onViewDetails,
}: {
  reg: ActiveRegistration;
  onViewDetails: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const t = reg.tournament;
  const e = reg.event;
  const hasGroupData = !!reg.group && !!reg.standing;
  const hasUpcoming = !!reg.upcoming_match;
  const hasRecent = reg.recent_matches.length > 0;

  return (
    <div
      className={cn(
        'bg-[#0d1117] border rounded-2xl overflow-hidden transition-all duration-200',
        reg.phase === 'knockout'
          ? 'border-[#ace600]/25'
          : reg.phase === 'group_stage'
            ? 'border-amber-500/20'
            : 'border-white/[0.07] hover:border-white/[0.12]',
      )}
    >
      {/* Phase accent line */}
      {reg.phase === 'knockout' && <div className="h-px w-full bg-[#ace600]" />}
      {reg.phase === 'group_stage' && <div className="h-px w-full bg-amber-500/60" />}
      {reg.phase === 'registration' && <div className="h-px w-full bg-emerald-500/50" />}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <PhaseBadge phase={reg.phase} />
              {reg.status === 'waitlist' && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border-amber-500/20 rounded-full"
                >
                  Lista de Espera
                </Badge>
              )}
              {t.is_endorsed && (
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border-emerald-500/20 rounded-full"
                >
                  ✓ Avalado
                </Badge>
              )}
            </div>
            <h3 className="text-base font-bold text-white/85 leading-tight">{t.name}</h3>
            <p className="text-xs text-white/65 mt-0.5">
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] font-bold border rounded-full mr-1',
                  TYPE_COLOR[t.type] ?? TYPE_COLOR.local,
                )}
              >
                {TYPE_LABEL[t.type] ?? t.type}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] font-bold border rounded-full',
                  SKILL_COLOR[e.skill_block] ?? SKILL_COLOR['3.5'],
                )}
              >
                {eventLabel(e)}
              </Badge>
            </p>
          </div>
          {/* Position if in standings */}
          {hasGroupData && reg.standing && (
            <div className="shrink-0 text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <PositionIcon position={reg.standing.position} />
              </div>
              <p className="text-[10px] text-white/88 mt-1">en grupo</p>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-white/65 min-w-0">
            <Calendar className="w-3 h-3 shrink-0 text-white/50" />
            <span className="truncate">
              {formatDate(t.start_date)} – {formatDate(t.end_date)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/65 min-w-0">
            <MapPin className="w-3 h-3 shrink-0 text-white/50" />
            <span className="truncate">{t.venue_name || `${t.city}, ${t.state}`}</span>
          </div>
          {reg.group && (
            <div className="flex items-center gap-1.5 text-xs text-white/65 min-w-0">
              <Layers className="w-3 h-3 shrink-0 text-white/50" />
              <span>Grupo {reg.group.group_number}</span>
            </div>
          )}
        </div>

        {/* Upcoming match callout */}
        {hasUpcoming && reg.upcoming_match && (
          <div className="mb-4 flex items-center gap-3 p-3 bg-sky-500/[0.06] border border-sky-500/15 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Swords className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-sky-400">Próximo partido</p>
              <p className="text-sm font-semibold text-white/95 truncate">
                vs {reg.upcoming_match.opponent_name}
              </p>
              <p className="text-[11px] text-sky-400/60">
                {formatDate(reg.upcoming_match.scheduled_time)}{' '}
                {formatTime(reg.upcoming_match.scheduled_time)}
              </p>
            </div>
          </div>
        )}

        {/* Standing tiles (visible only when expanded or has upcoming match) */}
        {hasGroupData && reg.standing && (expanded || hasUpcoming) && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/88 mb-2">
              Posición en grupo
            </p>
            <div className="grid grid-cols-4 gap-2">
              <StandingRow label="Pos." value={reg.standing.position} />
              <StandingRow
                label="G / P"
                value={`${reg.standing.matches_won}/${reg.standing.matches_lost}`}
              />
              <StandingRow
                label="Sets"
                value={`${reg.standing.sets_won}-${reg.standing.sets_lost}`}
              />
              <StandingRow
                label="Pts"
                value={`${reg.standing.points_for}-${reg.standing.points_against}`}
              />
            </div>
            {reg.standing.qualified && (
              <div className="mt-2 flex items-center gap-2 p-2.5 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <p className="text-xs font-bold text-emerald-400">Clasificado a fase eliminatoria</p>
              </div>
            )}
          </div>
        )}

        {/* Recent matches (visible when expanded) */}
        {hasRecent && expanded && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/88 mb-2">
              Partidos recientes
            </p>
            <div className="space-y-1.5">
              {reg.recent_matches.map((m) => (
                <MatchResultChip key={m.id} match={m} />
              ))}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.05]">
          {(hasGroupData || hasRecent) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((v) => !v)}
              className="h-8 px-3 text-xs text-white/65 hover:text-white/70 hover:bg-white/[0.05] gap-1.5 transition-all"
            >
              {expanded ? 'Menos' : 'Ver más'}
              <ChevronRight
                className={cn('w-3 h-3 transition-transform', expanded && 'rotate-90')}
              />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(t.id)}
            className="h-8 px-3 ml-auto text-xs border-white/[0.08] bg-transparent hover:bg-white/[0.05] text-white/65 hover:text-white/70 gap-1.5 transition-all"
          >
            Torneo <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── History Card ────────────────────────────────────────────────────────────

function HistoryCard({ reg }: { reg: HistoryRegistration }) {
  const t = reg.tournament;
  const e = reg.event;

  const resultColor =
    reg.result === 'Champion'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : reg.result === 'Runner-up'
        ? 'text-slate-200 bg-slate-500/10 border-slate-500/20'
        : reg.result === 'Semifinalist'
          ? 'text-violet-400 bg-violet-500/10 border-violet-500/20'
          : 'text-white/65 bg-white/[0.04] border-white/[0.07]';

  return (
    <div className="flex items-center gap-4 p-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl hover:border-white/[0.11] transition-all group">
      {/* Position indicator */}
      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
        {reg.final_position ? (
          <PositionIcon position={reg.final_position} />
        ) : (
          <Trophy className="w-4 h-4 text-white/50" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-sm font-semibold text-white/88 truncate group-hover:text-white transition-colors">
            {t.name}
          </p>
          <Badge
            variant="outline"
            className={cn('text-[10px] font-bold border rounded-full shrink-0', resultColor)}
          >
            {reg.result}
          </Badge>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={cn(
              'text-[10px] font-bold border rounded-full px-1.5 py-0.5 inline-flex',
              SKILL_COLOR[e.skill_block] ?? SKILL_COLOR['3.5'],
            )}
          >
            {eventLabel(e)}
          </span>
          <span className="flex items-center gap-1 text-xs text-white/60">
            <Calendar className="w-3 h-3" />
            {formatDate(t.start_date)}
          </span>
          {t.city && (
            <span className="flex items-center gap-1 text-xs text-white/60">
              <MapPin className="w-3 h-3" />
              {t.city}
            </span>
          )}
        </div>
      </div>

      {/* Points earned */}
      {reg.points_earned > 0 && (
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-[#ace600] leading-none">+{reg.points_earned}</p>
          <p className="text-[10px] text-white/88">pts</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

type Tab = 'active' | 'history';

export default function PlayerActiveTournamentsPage() {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);

  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>('/players/tournament-dashboard');
      const body = (res as any)?.data ?? res;
      setData(body?.data ?? body);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = data?.stats;
  const active = data?.active ?? [];
  const history = data?.history ?? [];

  const tabCls = cn(
    'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all',
    'data-[state=active]:bg-[#ace600] data-[state=active]:text-black data-[state=active]:shadow-[0_0_12px_rgba(172,230,0,0.18)]',
    'data-[state=inactive]:text-white/35 data-[state=inactive]:hover:text-white/60',
  );

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Mi Panel de Torneos</h1>
            {stats && active.length > 0 && (
              <Badge
                variant="outline"
                className="gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-sky-500/10 border-sky-500/20 text-sky-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse inline-block shrink-0" />
                {active.length} activo{active.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <p className="text-xs text-white/60">Sigue tu progreso, grupos y resultados</p>
        </div>

        <div className="flex items-center gap-5 sm:gap-6">
          {stats &&
            [
              { label: 'Partidos', value: stats.total_matches, color: 'text-white/50' },
              { label: 'Victorias', value: stats.wins, color: 'text-[#ace600]' },
              { label: 'Derrotas', value: stats.losses, color: 'text-red-400/60' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={cn('text-2xl font-bold leading-none mb-0.5', color)}>{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                  {label}
                </p>
              </div>
            ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            disabled={loading}
            className="h-8 w-8 p-0 text-white/88 hover:text-white/60 hover:bg-white/[0.05]"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex">
        <div className="h-auto p-1 gap-1 rounded-2xl bg-[#0d1117] border border-white/[0.07] inline-flex">
          {(
            [
              { id: 'active' as Tab, label: 'Activos', icon: Swords, count: active.length },
              { id: 'history' as Tab, label: 'Historial', icon: Clock, count: history.length },
            ] as const
          ).map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              data-state={activeTab === id ? 'active' : 'inactive'}
              onClick={() => setActiveTab(id)}
              className={tabCls}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {count > 0 && (
                <span className="ml-0.5 text-[10px] px-1.5 py-px rounded-full bg-black/20">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
          <p className="text-xs text-white/88">Cargando torneos…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Error al cargar</p>
            <p className="text-xs text-red-400/60 mt-0.5">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            className="ml-auto h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reintentar
          </Button>
        </div>
      )}

      {/* ━━━ ACTIVE TAB ━━━ */}
      {!loading && !error && activeTab === 'active' && (
        <>
          {active.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <Swords className="w-7 h-7 text-white/10" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white/65 mb-1">
                  No tienes torneos activos
                </p>
                <p className="text-xs text-white/50 max-w-[280px] leading-relaxed">
                  Inscríbete en un torneo desde la sección de Torneos para ver tu progreso aquí.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/players/dashboard/tournaments')}
                className="h-9 px-4 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold gap-1.5 shadow-[0_0_12px_rgba(172,230,0,0.15)]"
              >
                <Trophy className="w-3.5 h-3.5" /> Explorar Torneos
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {active.map((reg) => (
                <ActiveCard
                  key={reg.registrationId}
                  reg={reg}
                  onViewDetails={(id) => navigate(`/players/dashboard/tournaments/${id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ━━━ HISTORY TAB ━━━ */}
      {!loading && !error && activeTab === 'history' && (
        <>
          {history.length === 0 ? (
            <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="p-8 flex flex-col items-center text-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#ace600]/[0.07] border border-[#ace600]/15 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-[#ace600]/50" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white/60 mb-1">
                    Historial de Torneos
                  </h3>
                  <p className="text-sm text-white/88 max-w-[340px] leading-relaxed">
                    Aquí aparecerán los torneos completados. Una vez que termines una competencia
                    podrás ver tus resultados y posición final.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md">
                  {[
                    {
                      icon: Crown,
                      label: 'Posiciones finales',
                      color: 'text-amber-400',
                      bg: 'bg-amber-500/10 border-amber-500/15',
                    },
                    {
                      icon: Star,
                      label: 'Premios ganados',
                      color: 'text-[#ace600]',
                      bg: 'bg-[#ace600]/10 border-[#ace600]/15',
                    },
                    {
                      icon: TrendingUp,
                      label: 'Estadísticas',
                      color: 'text-sky-400',
                      bg: 'bg-sky-500/10 border-sky-500/15',
                    },
                  ].map(({ icon: Icon, label, color, bg }) => (
                    <div
                      key={label}
                      className={cn('flex items-center gap-2 p-3 rounded-xl border', bg)}
                    >
                      <Icon className={cn('w-4 h-4 shrink-0', color)} />
                      <span className="text-xs font-semibold text-white/65">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary bar */}
              {stats && stats.history_count > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    {
                      label: 'Torneos jugados',
                      value: stats.history_count,
                      icon: Trophy,
                      color: 'text-white/60',
                    },
                    {
                      label: 'Total partidos',
                      value: stats.total_matches,
                      icon: Swords,
                      color: 'text-white/60',
                    },
                    {
                      label: 'Victorias',
                      value: stats.wins,
                      icon: CheckCircle2,
                      color: 'text-[#ace600]',
                    },
                    {
                      label: 'Derrotas',
                      value: stats.losses,
                      icon: XCircle,
                      color: 'text-red-400/60',
                    },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div
                      key={label}
                      className="bg-[#0d1117] border border-white/[0.07] rounded-xl p-4 flex items-center gap-3"
                    >
                      <Icon className={cn('w-4 h-4 shrink-0', color)} />
                      <div>
                        <p className={cn('text-xl font-bold leading-none mb-0.5', color)}>
                          {value}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                          {label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {history.map((reg) => (
                <HistoryCard key={reg.registrationId} reg={reg} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
