/**
 * Group Standings Component
 *
 * Displays group leaderboard with comprehensive ranking information.
 *
 * @author Tournament System
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { BarChart3, Trophy, Info, Loader2, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TiebreakerExplanation from '@/components/tournament/TiebreakerExplanation';
import { fetchEventGroup } from '@/store/slices/tournamentsSlice';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Standing {
  position: number;
  userId: string;
  userName: string;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  pointsFor: number;
  pointsAgainst: number;
  rankingPoints: number;
  qualified: boolean;
  headToHead?: any;
}

interface GroupStandingsProps {
  groupName?: string;
  groupNumber?: number;
  standings?: Standing[];
  advanceCount?: number;
  tournamentId?: string;
  eventId?: string;
  groupId?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const TIEBREAKER_CHAIN = [
  { order: 1, name: 'Matches Won', icon: '🏆' },
  { order: 2, name: 'Head-to-Head', icon: '🤝' },
  { order: 3, name: 'Set Difference', icon: '📊' },
  { order: 4, name: 'Ranking Points', icon: '⭐' },
  { order: 5, name: 'Point Difference', icon: '📈' },
  { order: 6, name: 'Points For', icon: '🎯' },
  { order: 7, name: 'Draw', icon: '🔄' },
];

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const cn = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ');

const diff = (a: number, b: number) => {
  const d = a - b;
  return d > 0 ? `+${d}` : `${d}`;
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const GroupStandings: React.FC<GroupStandingsProps> = ({
  groupName,
  groupNumber,
  standings: staticStandings,
  advanceCount = 2,
  tournamentId,
  eventId,
  groupId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, groupStandings } = useSelector((s: RootState) => s.tournaments);

  useEffect(() => {
    if (tournamentId && eventId && groupId) {
      dispatch(fetchEventGroup({ tournamentId, eventId, groupId } as any));
    }
  }, [tournamentId, eventId, groupId, dispatch]);

  const standings =
    (tournamentId && eventId && groupId ? groupStandings : null) || staticStandings || [];

  const usingApi = !!(tournamentId && eventId && groupId);

  // ── Loading ──
  if (usingApi && loading) {
    return (
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl flex items-center justify-center gap-3 py-20">
        <div className="w-5 h-5 rounded-full border-2 border-[#ace600]/30 border-t-[#ace600] animate-spin" />
        <p className="text-xs text-white/30">Cargando clasificación…</p>
      </div>
    );
  }

  // ── Error ──
  if (usingApi && error) {
    return (
      <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-red-400">Error al cargar clasificación</p>
          <p className="text-[11px] text-red-400/60 mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  // ── Empty ──
  if (standings.length === 0) {
    return (
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl flex flex-col items-center justify-center gap-3 py-20">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white/10" />
        </div>
        <p className="text-sm text-white/25">Sin datos de clasificación aún</p>
        <p className="text-xs text-white/15">Aparecerán una vez se hayan jugado partidos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        {/* ── Panel header ──────────────────────────────────────────────────*/}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#ace600]" />
            <p className="text-xs font-bold text-white/70">{groupName || `Grupo ${groupNumber}`}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
            <Trophy className="w-2.5 h-2.5" />
            Top {advanceCount} avanzan
          </span>
        </div>

        {/* ── Tiebreaker banner ─────────────────────────────────────────────*/}
        <div className="mx-5 mt-4 mb-4 bg-sky-500/[0.06] border border-sky-500/20 rounded-xl px-4 py-3">
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400 mb-2">
                Orden de desempate (aplicado en secuencia)
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                {TIEBREAKER_CHAIN.map((tb) => (
                  <div
                    key={tb.order}
                    className="flex items-center gap-1.5 text-[11px] text-sky-300/60"
                  >
                    <span className="text-white/20 font-bold w-3">{tb.order}.</span>
                    <span>{tb.icon}</span>
                    <span>{tb.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Standings table ───────────────────────────────────────────────*/}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Pos', 'Jugador', 'P/L', 'Sets', 'Puntos', 'Ranking', 'Estado'].map((h) => (
                  <th
                    key={h}
                    className={cn(
                      'py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest text-white/20',
                      h === 'Pos' || h === 'Jugador' ? 'text-left' : 'text-center',
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {standings.map((s, idx) => {
                const advancing = s.position <= advanceCount;
                return (
                  <tr
                    key={s.userId}
                    className={cn(
                      'group transition-colors',
                      advancing
                        ? 'bg-[#ace600]/[0.03] hover:bg-[#ace600]/[0.05]'
                        : 'hover:bg-white/[0.02]',
                    )}
                  >
                    {/* Position */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">
                          {MEDAL[s.position] ?? (
                            <span className="text-[11px] font-bold text-white/30 w-5 inline-block text-center">
                              {s.position}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Player */}
                    <td className="py-3 px-4">
                      <TiebreakerExplanation
                        playerName={s.userName}
                        position={s.position}
                        totalPlayers={standings.length}
                        standingsData={{
                          matchesWon: s.matchesWon,
                          matchesLost: s.matchesLost,
                          setsWon: s.setsWon,
                          setsLost: s.setsLost,
                          pointsFor: s.pointsFor,
                          pointsAgainst: s.pointsAgainst,
                          rankingPoints: s.rankingPoints,
                        }}
                      >
                        <span className="text-xs font-semibold text-white/70 group-hover:text-white hover:text-[#ace600] cursor-help transition-colors truncate max-w-[140px] block">
                          {s.userName}
                        </span>
                      </TiebreakerExplanation>
                    </td>

                    {/* Matches W-L */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs font-bold">
                        <span className="text-emerald-400">{s.matchesWon}</span>
                        <span className="text-white/20 mx-0.5">–</span>
                        <span className="text-red-400">{s.matchesLost}</span>
                      </span>
                    </td>

                    {/* Sets */}
                    <td className="py-3 px-4 text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[11px] text-white/40 cursor-help">
                              {s.setsWon}–{s.setsLost}
                              <span
                                className={cn(
                                  'ml-1 font-bold text-[10px]',
                                  s.setsWon - s.setsLost > 0
                                    ? 'text-emerald-400'
                                    : s.setsWon - s.setsLost < 0
                                      ? 'text-red-400'
                                      : 'text-white/20',
                                )}
                              >
                                ({diff(s.setsWon, s.setsLost)})
                              </span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#13181f] border-white/[0.08] text-white/70 text-xs rounded-xl">
                            Diferencia de sets (3.º desempate)
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>

                    {/* Points */}
                    <td className="py-3 px-4 text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[11px] text-white/40 cursor-help">
                              {s.pointsFor}–{s.pointsAgainst}
                              <span
                                className={cn(
                                  'ml-1 font-bold text-[10px]',
                                  s.pointsFor - s.pointsAgainst > 0
                                    ? 'text-emerald-400'
                                    : s.pointsFor - s.pointsAgainst < 0
                                      ? 'text-red-400'
                                      : 'text-white/20',
                                )}
                              >
                                ({diff(s.pointsFor, s.pointsAgainst)})
                              </span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#13181f] border-white/[0.08] text-white/70 text-xs rounded-xl">
                            Diferencia de puntos (5.º desempate)
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>

                    {/* Ranking */}
                    <td className="py-3 px-4 text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[11px] text-white/40 cursor-help font-mono">
                              {s.rankingPoints.toFixed(1)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#13181f] border-white/[0.08] text-white/70 text-xs rounded-xl">
                            Puntos de ranking (4.º desempate)
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {advancing ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
                          <Trophy className="w-2.5 h-2.5" /> Avanza
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-white/[0.04] border-white/[0.08] text-white/25">
                          Eliminado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Legend ────────────────────────────────────────────────────────*/}
        <div className="px-5 py-4 border-t border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {[
            ['P/L', 'Partidos Ganados – Partidos Perdidos'],
            ['Sets', 'Sets Ganados – Sets Perdidos (diferencia)'],
            ['Puntos', 'Puntos a Favor – Puntos en Contra (diferencia)'],
            ['Ranking', 'Puntos de ranking federativos al momento del registro'],
          ].map(([key, desc]) => (
            <p key={key} className="text-[10px] text-white/20">
              <span className="font-bold text-white/30">{key}</span> = {desc}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupStandings;
