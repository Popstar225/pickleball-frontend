/**
 * Coach Tournament View — read-only dashboard for coaches
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users,
  Trophy,
  Target,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Medal,
  TrendingUp,
  Star,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import {
  fetchTournaments,
  fetchEventGroups,
  fetchEventMatches,
} from '@/store/slices/tournamentsSlice';
import { fetchCoachTeamRegistrations } from '@/store/slices/coachDashboardSlice';
import GroupStandings from '@/components/tournament/GroupStandings';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CoachPlayerTournament {
  playerId: string;
  playerName: string;
  tournamentName: string;
  tournamentId?: string;
  eventName: string;
  eventId?: string;
  groupId?: string;
  groupNumber: number;
  position: number;
  qualified: boolean;
  matchRecord: { wins: number; losses: number };
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Initials({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const letters = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={cn(
        'rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center font-black text-[#ace600] shrink-0 select-none',
        size === 'sm'
          ? 'w-8 h-8 text-[11px]'
          : size === 'lg'
            ? 'w-12 h-12 text-sm rounded-2xl'
            : 'w-9 h-9 text-[11px]',
      )}
    >
      {letters}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1 truncate">
          {label}
        </p>
        <p className={cn('text-[22px] font-bold leading-none', color)}>{value}</p>
      </div>
      <div
        className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shrink-0', bg)}
      >
        <Icon className={cn('w-4 h-4', color)} />
      </div>
    </div>
  );
}

function QualifiedPill({ qualified }: { qualified: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0',
        qualified
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          : 'bg-white/[0.04] text-white/30 border-white/[0.07]',
      )}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full', qualified ? 'bg-emerald-400' : 'bg-white/20')}
      />
      {qualified ? 'Clasificado' : 'En Grupos'}
    </span>
  );
}

function PositionPill({ position }: { position: number }) {
  if (position === 1)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 border border-amber-400/25 text-amber-300">
        <Medal className="w-3 h-3" />
        Campeón
      </span>
    );
  if (position === 2)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-400/10 border border-slate-400/25 text-slate-300">
        <Medal className="w-3 h-3" />
        Subcampeón
      </span>
    );
  if (position <= 4)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 border border-orange-500/20 text-orange-400">
        <Star className="w-3 h-3" />
        Finalista
      </span>
    );
  return null;
}

function MiniStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1.5">
        {label}
      </p>
      <div className="text-[17px] font-bold text-white leading-none">{children}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const CoachTournamentView: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<CoachPlayerTournament | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { tournaments } = useSelector((s: RootState) => s.tournaments);
  const { user } = useSelector((s: RootState) => s.auth);
  const {
    teamRegistrations,
    teamRegistrationsLoading,
    teamRegistrationsError,
    teamRegistrationsJudgeInfo,
    teamRegistrationsTournamentsCount,
    teamRegistrationsTotal,
  } = useSelector((s: RootState) => s.coachDashboard);

  /* ── Load coach's tournaments & registrations on mount ── */
  useEffect(() => {
    dispatch(
      fetchTournaments({
        limit: 100,
      } as any),
    ).catch((err: any) => console.error('Failed to load tournaments:', err));

    dispatch(fetchCoachTeamRegistrations() as any).catch((err: any) =>
      console.error('Failed to load coach registrations:', err),
    );
  }, [dispatch]);

  // Map backend registrations into the shape the component expects
  const coachPlayerTournaments: CoachPlayerTournament[] = teamRegistrations.map(
    (registration: any) => ({
      playerId: registration.user_id || registration.user?.id || '',
      playerName: registration.user?.full_name || '',
      tournamentName: registration.tournament_name || '',
      tournamentId: registration.tournament_id || '',
      eventName: `${registration.skill_block} ${registration.gender}'s ${registration.modality}`,
      eventId: registration.tournament_event_id || '',
      groupId: registration.group_id || '',
      groupNumber: 0,
      position: registration.final_position || 0,
      qualified: registration.final_position ? registration.final_position <= 2 : false,
      matchRecord: { wins: 0, losses: 0 },
    }),
  );

  const playersByTournament = coachPlayerTournaments.reduce(
    (acc, p) => {
      if (!acc[p.tournamentName]) acc[p.tournamentName] = [];
      acc[p.tournamentName].push(p);
      return acc;
    },
    {} as Record<string, CoachPlayerTournament[]>,
  );

  const totalWins = coachPlayerTournaments.reduce((s, p) => s + p.matchRecord.wins, 0);
  const totalGames = coachPlayerTournaments.reduce(
    (s, p) => s + p.matchRecord.wins + p.matchRecord.losses,
    0,
  );
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  const stats = {
    total: coachPlayerTournaments.length,
    qualified: coachPlayerTournaments.filter((p) => p.qualified).length,
    inFinals: coachPlayerTournaments.filter((p) => p.position <= 2).length,
  };

  // ── Player detail view ───────────────────────────────────────────────────────
  if (selectedPlayer) {
    const total = selectedPlayer.matchRecord.wins + selectedPlayer.matchRecord.losses;
    const winPct = total > 0 ? Math.round((selectedPlayer.matchRecord.wins / total) * 100) : 0;

    return (
      <div className="space-y-5">
        {/* Back */}
        <button
          onClick={() => setSelectedPlayer(null)}
          className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-white/65 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Volver al equipo
        </button>

        {/* Player hero card */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="h-0.5 bg-[#ace600]" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-3">
                <Initials name={selectedPlayer.playerName} size="lg" />
                <div>
                  <h2 className="text-base font-bold text-white">{selectedPlayer.playerName}</h2>
                  <p className="text-xs text-white/30 mt-0.5">
                    {selectedPlayer.tournamentName} · {selectedPlayer.eventName}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <PositionPill position={selectedPlayer.position} />
                <QualifiedPill qualified={selectedPlayer.qualified} />
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <MiniStat label="Posición Final">
                {selectedPlayer.position === 1
                  ? '🥇 1°'
                  : selectedPlayer.position === 2
                    ? '🥈 2°'
                    : selectedPlayer.position === 3
                      ? '🥉 3°'
                      : `${selectedPlayer.position}°`}
              </MiniStat>
              <MiniStat label="Grupo">Grupo {selectedPlayer.groupNumber}</MiniStat>
              <MiniStat label="Récord">
                <span>
                  <span className="text-emerald-400">{selectedPlayer.matchRecord.wins}G</span>
                  <span className="text-white/25 mx-1">–</span>
                  <span className="text-red-400">{selectedPlayer.matchRecord.losses}P</span>
                </span>
              </MiniStat>
              <MiniStat label="% Victorias">
                <span className={winPct >= 60 ? 'text-[#ace600]' : 'text-white'}>{winPct}%</span>
              </MiniStat>
            </div>

            {/* Win rate bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                  Tasa de Victoria
                </span>
                <span className="text-[10px] font-mono text-white/25">{winPct}%</span>
              </div>
              <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    winPct >= 70
                      ? 'bg-[#ace600]'
                      : winPct >= 50
                        ? 'bg-emerald-500'
                        : 'bg-amber-500',
                  )}
                  style={{ width: `${winPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Qualification banner */}
        {selectedPlayer.qualified && (
          <div className="flex items-start gap-3 p-4 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-2xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-400 mb-0.5">
                Avanzó a Eliminación Directa
              </p>
              <p className="text-xs text-emerald-400/60 leading-relaxed">
                {selectedPlayer.playerName} clasificó desde el Grupo {selectedPlayer.groupNumber} al
                bracket de eliminación directa.
              </p>
            </div>
          </div>
        )}

        {/* Group standings */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
            <div className="w-7 h-7 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
              <Trophy className="w-3.5 h-3.5 text-[#ace600]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white/80">
                Tabla — Grupo {selectedPlayer.groupNumber}
              </p>
              <p className="text-xs text-white/25">Grupo de {selectedPlayer.playerName}</p>
            </div>
          </div>
          <div className="p-5">
            <GroupStandings
              groupName={`Grupo ${selectedPlayer.groupNumber}`}
              groupNumber={selectedPlayer.groupNumber}
              advanceCount={2}
              tournamentId={selectedPlayer.tournamentId}
              eventId={selectedPlayer.eventId}
              groupId={selectedPlayer.groupId}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Team overview ────────────────────────────────────────────────────────────
  // show loading indicator if registrations are being fetched
  if (teamRegistrationsLoading) {
    return <p className="text-white/40">Loading jugadores...</p>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Torneos del Equipo</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
            Coach
          </span>
        </div>
        <p className="text-xs text-white/25">Monitorea el progreso de tus jugadores en torneos</p>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard
          icon={Users}
          label="Jugadores"
          value={stats.total}
          color="text-sky-400"
          bg="bg-sky-500/10 border-sky-500/20"
        />
        <StatCard
          icon={Target}
          label="Clasificados"
          value={stats.qualified}
          color="text-emerald-400"
          bg="bg-emerald-500/10 border-emerald-500/20"
        />
        <StatCard
          icon={Trophy}
          label="Finalistas"
          value={stats.inFinals}
          color="text-amber-400"
          bg="bg-amber-500/10 border-amber-500/20"
        />
        <StatCard
          icon={TrendingUp}
          label="% Victorias"
          value={`${winRate}%`}
          color="text-[#ace600]"
          bg="bg-[#ace600]/10 border-[#ace600]/20"
        />
      </div>

      {/* Empty state */}
      {teamRegistrationsError ? (
        <p className="text-red-400 text-sm">{teamRegistrationsError}</p>
      ) : Object.keys(playersByTournament).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white/10" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/35 mb-1">Sin jugadores en torneos</p>
            <p className="text-xs text-white/20 max-w-[210px] leading-relaxed">
              Cuando tus jugadores se inscriban a torneos aparecerán aquí
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(playersByTournament).map(([tournamentName, players]) => {
            const qualCount = players.filter((p) => p.qualified).length;
            const qualPct = Math.round((qualCount / players.length) * 100);

            return (
              <div
                key={tournamentName}
                className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden"
              >
                {/* Tournament header */}
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[11px] font-black text-[#ace600] select-none shrink-0">
                      {tournamentName
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white/80 truncate">{tournamentName}</p>
                      <p className="text-xs text-white/25">
                        {players.length} jugador{players.length !== 1 ? 'es' : ''} · {qualCount}{' '}
                        clasificado{qualCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Qualification rate bar */}
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] font-mono text-white/20">{qualPct}% clasif.</span>
                    <div className="w-20 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ace600] rounded-full transition-all"
                        style={{ width: `${qualPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Player rows */}
                <div className="divide-y divide-white/[0.04]">
                  {players.map((player) => {
                    const pTotal = player.matchRecord.wins + player.matchRecord.losses;
                    const pPct =
                      pTotal > 0 ? Math.round((player.matchRecord.wins / pTotal) * 100) : 0;

                    return (
                      <button
                        key={player.playerId}
                        onClick={() => setSelectedPlayer(player)}
                        className="group w-full text-left flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-all"
                      >
                        {/* Avatar */}
                        <Initials name={player.playerName} size="sm" />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors truncate">
                              {player.playerName}
                            </span>
                            <QualifiedPill qualified={player.qualified} />
                            <PositionPill position={player.position} />
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                            <span className="text-[11px] text-white/25">
                              Grupo {player.groupNumber} · Pos. {player.position}
                            </span>
                            <span className="text-[11px] text-white/20 truncate">
                              {player.eventName}
                            </span>
                            <span className="text-[11px] font-mono">
                              <span className="text-emerald-400">{player.matchRecord.wins}G</span>
                              <span className="text-white/20"> – </span>
                              <span className="text-red-400">{player.matchRecord.losses}P</span>
                              <span className="text-white/20 ml-1">({pPct}%)</span>
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/40 shrink-0 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoachTournamentView;
