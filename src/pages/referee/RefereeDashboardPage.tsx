/**
 * Referee Dashboard Page
 *
 * Landing page for referees showing:
 * - Today's assigned matches (ready to score)
 * - Upcoming matches (next 7 days)
 * - Completed matches history
 *
 * Route: /referee/dashboard
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trophy,
  ChevronRight,
  Swords,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface RefereeMatch {
  id: string;
  scheduled_time: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  player1: { id: string; full_name: string };
  player2: { id: string; full_name: string };
  tournament: { id: string; name: string };
  event?: { skill_block: string; gender: string; modality: string };
  group?: { group_number: number };
  set_scores?: Array<{ set: number; player1: number; player2: number }>;
  winner_id?: string;
}

function statusLabel(s: string) {
  if (s === 'completed') return 'Terminado';
  if (s === 'in_progress') return 'En curso';
  return 'Programado';
}

function statusColor(s: string) {
  if (s === 'completed') return 'bg-[#ace600]/10 text-[#ace600] border-[#ace600]/20';
  if (s === 'in_progress') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  return 'bg-white/5 text-white/50 border-white/10';
}

function ScoreChip({ sets, winnerId, p1Id }: { sets?: RefereeMatch['set_scores']; winnerId?: string; p1Id: string }) {
  if (!sets || sets.length === 0) return null;
  return (
    <div className="flex gap-1 mt-1">
      {sets.map((s) => (
        <span
          key={s.set}
          className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded',
            (s.player1 > s.player2 ? p1Id === winnerId : p1Id !== winnerId)
              ? 'bg-[#ace600]/10 text-[#ace600]'
              : 'bg-white/5 text-white/40',
          )}
        >
          {s.player1}-{s.player2}
        </span>
      ))}
    </div>
  );
}

function MatchRow({ match, canScore }: { match: RefereeMatch; canScore: boolean }) {
  const navigate = useNavigate();
  const dt = new Date(match.scheduled_time);
  const isToday = dt.toDateString() === new Date().toDateString();
  const isPast = dt < new Date();

  return (
    <div
      className={cn(
        'bg-[#0d1117] border rounded-xl px-4 py-3 transition-colors',
        canScore
          ? 'border-[#ace600]/30 hover:border-[#ace600]/60 cursor-pointer hover:bg-[#111]/80'
          : 'border-white/[0.07] hover:border-white/[0.12]',
      )}
      onClick={() => canScore && navigate(`/referee/match/${match.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm">
            {match.player1?.full_name} <span className="text-white/30 font-normal">vs</span> {match.player2?.full_name}
          </p>
          <p className="text-xs text-white/50 mt-0.5">{match.tournament?.name}</p>
          {match.event && (
            <p className="text-[10px] text-white/30 mt-0.5">
              {match.event.skill_block} · {match.event.gender === 'M' ? 'Varonil' : 'Femenil'} · {match.event.modality}
              {match.group && ` · Grupo ${match.group.group_number}`}
            </p>
          )}
          <ScoreChip sets={match.set_scores} winnerId={match.winner_id} p1Id={match.player1?.id} />
        </div>

        <div className="shrink-0 text-right space-y-1.5">
          <span className={cn('inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border', statusColor(match.status))}>
            {statusLabel(match.status)}
          </span>
          <div className={cn('flex items-center gap-1 justify-end text-xs', isPast && match.status !== 'completed' ? 'text-red-400' : 'text-white/40')}>
            <Clock className="w-3 h-3" />
            {isToday ? 'Hoy ' : dt.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) + ' '}
            {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
          {canScore && (
            <div className="flex items-center gap-1 text-[10px] text-[#ace600] font-bold justify-end">
              <Swords className="w-3 h-3" /> Registrar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RefereeDashboardPage() {
  const [today, setToday] = useState<RefereeMatch[]>([]);
  const [upcoming, setUpcoming] = useState<RefereeMatch[]>([]);
  const [completed, setCompleted] = useState<RefereeMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Re-uses the coach tournament dashboard endpoint since referees are stored as tournament judges
        const data = await api.get<any>('/coaches/me/tournament-dashboard');
        if (data.success) {
          const all: RefereeMatch[] = data.data?.pendingMatches || [];
          const now = new Date();
          const todayStr = now.toDateString();

          setToday(all.filter((m) => new Date(m.scheduled_time).toDateString() === todayStr && m.status !== 'completed'));
          setUpcoming(all.filter((m) => new Date(m.scheduled_time) > now && new Date(m.scheduled_time).toDateString() !== todayStr));

          // Get completed matches from tournament data too
          const completedFromData = data.data?.pendingMatches?.filter((m: RefereeMatch) => m.status === 'completed') || [];
          setCompleted(completedFromData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los partidos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0e14]">
        <Loader2 className="w-8 h-8 text-[#ace600] animate-spin" />
      </div>
    );
  }

  const allPending = [...today, ...upcoming];

  return (
    <div className="min-h-screen bg-[#0a0e14] px-4 py-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Panel de Árbitro</h1>
          <p className="text-white/50 text-sm mt-1">Mis partidos asignados</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-[#ace600]" />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Hoy', value: today.length, color: 'text-[#ace600]' },
          { label: 'Próximos', value: upcoming.length, color: 'text-blue-400' },
          { label: 'Completados', value: completed.length, color: 'text-white/60' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0d1117] border border-white/[0.07] rounded-xl px-3 py-3 text-center">
            <p className={cn('text-2xl font-black', s.color)}>{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Today - needs score entry */}
      {today.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#ace600]" />
            <h2 className="font-bold text-white text-sm uppercase tracking-widest">Hoy — Requieren marcador</h2>
          </div>
          <div className="space-y-2">
            {today.map((m) => (
              <MatchRow key={m.id} match={m} canScore={true} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-white text-sm uppercase tracking-widest">Próximos 7 días</h2>
          </div>
          <div className="space-y-2">
            {upcoming.slice(0, 8).map((m) => (
              <MatchRow key={m.id} match={m} canScore={false} />
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white/40" />
            <h2 className="font-bold text-white/60 text-sm uppercase tracking-widest">Partidos Completados</h2>
          </div>
          <div className="space-y-2">
            {completed.slice(0, 10).map((m) => (
              <MatchRow key={m.id} match={m} canScore={false} />
            ))}
          </div>
        </section>
      )}

      {allPending.length === 0 && completed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[#ace600]/30" />
          <p className="text-white/40 font-medium">No tienes partidos asignados</p>
          <p className="text-white/25 text-sm">Cuando seas asignado como árbitro aparecerán aquí</p>
        </div>
      )}

      {/* Quick link to score entry */}
      {allPending.length > 0 && (
        <div className="bg-[#ace600]/5 border border-[#ace600]/20 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[#ace600] font-bold text-sm">{allPending.length} partido(s) pendiente(s)</p>
            <p className="text-white/40 text-xs mt-0.5">Toca un partido de hoy para registrar el marcador</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#ace600]" />
        </div>
      )}
    </div>
  );
}
