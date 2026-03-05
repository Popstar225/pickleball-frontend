import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  Users,
  Swords,
  CheckCircle2,
  Target,
  Star,
  Layers,
  ChevronRight,
  Medal,
} from 'lucide-react';

import { AppDispatch, RootState } from '@/store';
import {
  fetchTournaments,
  fetchEventGroups,
  fetchEventMatches,
} from '@/store/slices/tournamentsSlice';
import GroupStandings from '@/components/tournament/GroupStandings';
import SingleEliminationBracket from '@/components/tournament/SingleEliminationBracket';

/* ─── types ── */
type Tab = 'tournaments' | 'details';

/* ─── position display ── */
function PositionDisplay({ pos }: { pos: number }) {
  if (pos === 1) return <span className="text-2xl">🥇</span>;
  if (pos === 2) return <span className="text-2xl">🥈</span>;
  if (pos === 3) return <span className="text-2xl">🥉</span>;
  if (pos <= 4) return <span className="text-2xl font-bold text-white">{pos}</span>;
  return <span className="text-lg text-white/25">—</span>;
}

/* ─── position badge ── */
function PositionBadge({ pos }: { pos: number }) {
  if (pos === 1)
    return (
      <Badge
        variant="outline"
        className="bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600] text-[10px] font-bold hover:bg-[#ace600]/10"
      >
        <Star className="w-3 h-3 mr-1 fill-[#ace600]" /> Champion
      </Badge>
    );
  if (pos === 2)
    return (
      <Badge
        variant="outline"
        className="bg-sky-500/10 border-sky-500/20 text-sky-400 text-[10px] font-bold hover:bg-sky-500/10"
      >
        <Star className="w-3 h-3 mr-1" /> Runner-up
      </Badge>
    );
  if (pos <= 4)
    return (
      <Badge
        variant="outline"
        className="bg-violet-500/10 border-violet-500/20 text-violet-400 text-[10px] font-bold hover:bg-violet-500/10"
      >
        <Medal className="w-3 h-3 mr-1" /> Finalist
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="bg-white/[0.05] border-white/[0.08] text-white/35 text-[10px] font-bold hover:bg-white/[0.05]"
    >
      In Groups
    </Badge>
  );
}

/* ─── stat tile ── */
function StatTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">{label}</p>
      <div className="flex items-center justify-center">{children}</div>
    </div>
  );
}

/* ─── skill block color ── */
function blockColor(block: string) {
  const n = parseFloat(block);
  if (n >= 5.0) return 'text-[#ace600] bg-[#ace600]/10 border-[#ace600]/20';
  if (n >= 4.5) return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
  if (n >= 4.0) return 'text-violet-400 bg-violet-400/10 border-violet-400/20';
  if (n >= 3.5) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  return 'text-white/40 bg-white/[0.05] border-white/[0.08]';
}

/* ══════════════════════════════════════════════════════════════════ */

const PlayerTournamentView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('tournaments');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { tournaments, eventGroups, loading, error } = useSelector(
    (state: RootState) => state.tournaments,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  /* ── Load player's tournaments on mount ── */
  useEffect(() => {
    dispatch(
      fetchTournaments({
        limit: 100,
      } as any),
    ).catch((err: any) => console.error('Failed to load tournaments:', err));
  }, [dispatch]);

  /* ── Load groups and matches when event is selected ── */
  useEffect(() => {
    if (selectedTournamentId && selectedEventId) {
      dispatch(
        fetchEventGroups({
          tournamentId: selectedTournamentId,
          eventId: selectedEventId,
        } as any),
      ).catch((err: any) => console.error('Failed to load groups:', err));

      dispatch(
        fetchEventMatches({
          tournamentId: selectedTournamentId,
          eventId: selectedEventId,
        } as any),
      ).catch((err: any) => console.error('Failed to load matches:', err));
    }
  }, [selectedTournamentId, selectedEventId, dispatch]);

  const playerTournaments = tournaments
    .flatMap((tournament: any) =>
      (tournament.events || []).map((event: any) => ({
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        eventId: event.id,
        eventName: event.skill_block || 'Unknown Event',
        modality: event.modality || 'Mixed',
        gameType: event.game_type || 'Doubles',
        totalPlayers: event.registrations?.length || 0,
        groupAttempted: false,
        qualified: false,
        groupNumber: -1,
        position: 999,
      })),
    )
    .filter((t) => t.totalPlayers > 0);

  const selectedTournament = playerTournaments.find(
    (t) => t.tournamentId === selectedTournamentId && t.eventId === selectedEventId,
  );

  const handleSelectTournament = (t: (typeof playerTournaments)[0]) => {
    setSelectedTournamentId(t.tournamentId);
    setSelectedEventId(t.eventId);
    setActiveTab('details');
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'tournaments', label: 'Active Tournaments', icon: Trophy },
    { id: 'details', label: 'Details', icon: Layers },
  ];

  return (
    <div className="space-y-6 p-1">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Mis Torneos</h1>
          <p className="text-sm text-white/35 mt-0.5">Sigue tu progreso y resultados</p>
        </div>
        {playerTournaments.length > 0 && (
          <Badge
            variant="outline"
            className="bg-white/[0.04] border-white/[0.08] text-white/40 text-[11px] font-semibold"
          >
            {playerTournaments.length} torneo{playerTournaments.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* ── Main card ── */}
      <Card className="bg-[#0d1117] border-white/[0.07] rounded-2xl overflow-hidden p-0">
        {/* Tab bar */}
        <CardHeader className="p-0 border-b border-white/[0.06]">
          <div className="flex">
            {TABS.map(({ id, label, icon: Icon }) => {
              const disabled = id === 'details' && !selectedTournament;
              return (
                <button
                  key={id}
                  onClick={() => !disabled && setActiveTab(id)}
                  disabled={disabled}
                  className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold border-b-2 -mb-px whitespace-nowrap transition-all flex-shrink-0 ${
                    activeTab === id
                      ? 'text-[#ace600] border-[#ace600]'
                      : disabled
                        ? 'text-white/15 border-transparent cursor-not-allowed'
                        : 'text-white/30 border-transparent hover:text-white/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* ── Tournaments tab ── */}
          {activeTab === 'tournaments' && (
            <>
              {playerTournaments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
                    <Trophy className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-white/50 font-semibold text-sm mb-1">Sin torneos activos</p>
                  <p className="text-white/20 text-xs max-w-xs">
                    Aún no estás registrado en ningún torneo.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {playerTournaments.map((t) => {
                    const isSelected =
                      selectedTournamentId === t.tournamentId && selectedEventId === t.eventId;
                    return (
                      <button
                        key={`${t.tournamentId}-${t.eventId}`}
                        onClick={() => handleSelectTournament(t)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#ace600]/[0.04] border-[#ace600]/25'
                            : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.04]'
                        }`}
                      >
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${
                                isSelected
                                  ? 'bg-[#ace600]/10 border-[#ace600]/20'
                                  : 'bg-white/[0.04] border-white/[0.08]'
                              }`}
                            >
                              <Trophy
                                className={`w-4 h-4 ${isSelected ? 'text-[#ace600]' : 'text-white/25'}`}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white/85 leading-tight truncate">
                                {t.tournamentName}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-bold border ${blockColor(t.eventName)}`}
                                >
                                  {t.eventName}
                                </Badge>
                                <span className="text-[11px] text-white/25 capitalize">
                                  {t.modality}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {t.qualified ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/10"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                                Clasificado
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-sky-500/10 border-sky-500/20 text-sky-400 text-[10px] font-bold hover:bg-sky-500/10"
                              >
                                En Grupos
                              </Badge>
                            )}
                            <ChevronRight
                              className={`w-3.5 h-3.5 transition-colors ${isSelected ? 'text-[#ace600]/50' : 'text-white/15'}`}
                            />
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 pt-3 border-t border-white/[0.05]">
                          <div className="flex items-center gap-1.5 text-xs text-white/35">
                            <Layers className="w-3 h-3 text-white/20" />
                            <span>Grupo {t.groupNumber >= 0 ? t.groupNumber + 1 : '—'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-white/35">
                            <Users className="w-3 h-3 text-white/20" />
                            <span>{t.totalPlayers} jugadores</span>
                          </div>
                          {t.position <= 4 && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400/70">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Pos. {t.position}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── Details tab ── */}
          {activeTab === 'details' && selectedTournament && (
            <div className="space-y-5">
              {/* Summary header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white/85 leading-tight">
                    {selectedTournament.tournamentName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold border ${blockColor(selectedTournament.eventName)}`}
                    >
                      {selectedTournament.eventName}
                    </Badge>
                    <span className="text-[11px] text-white/30 capitalize">
                      {selectedTournament.modality}
                    </span>
                  </div>
                </div>
                <PositionBadge pos={selectedTournament.position} />
              </div>

              {/* Stat tiles */}
              <div className="grid grid-cols-3 gap-3">
                <StatTile label="Ranking">
                  <PositionDisplay pos={selectedTournament.position} />
                </StatTile>
                <StatTile label="Grupo">
                  <span className="text-2xl font-bold text-white">
                    {selectedTournament.groupNumber >= 0 ? (
                      selectedTournament.groupNumber + 1
                    ) : (
                      <span className="text-white/25 text-lg">—</span>
                    )}
                  </span>
                </StatTile>
                <StatTile label="Estado">
                  {selectedTournament.qualified ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Clasificado
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-sky-400">En Grupos</span>
                  )}
                </StatTile>
              </div>

              {/* Group standings */}
              {selectedTournament.groupNumber >= 0 && (
                <>
                  <Separator className="bg-white/[0.05]" />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5 text-white/35" />
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-white/35">
                        Grupo {selectedTournament.groupNumber + 1} — Clasificación
                      </p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4">
                      <GroupStandings
                        groupName={`Group ${selectedTournament.groupNumber + 1}`}
                        groupNumber={selectedTournament.groupNumber + 1}
                        advanceCount={2}
                        tournamentId={selectedTournament.tournamentId}
                        eventId={selectedTournament.eventId}
                        groupId={
                          eventGroups.find(
                            (g: any) => g.group_number === selectedTournament.groupNumber + 1,
                          )?.id
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Knockout stage */}
              {selectedTournament.qualified && (
                <>
                  <Separator className="bg-white/[0.05]" />
                  <div>
                    <div className="flex items-center gap-3 mb-4 p-3.5 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-400">Fase Eliminatoria</p>
                        <p className="text-[11px] text-emerald-400/60">
                          Avanzaste al cuadro de eliminación directa
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4">
                      <SingleEliminationBracket
                        eventId={selectedTournament.eventId}
                        eventName={selectedTournament.eventName}
                        bracketMatches={[]}
                        totalRounds={4}
                        onRecordResult={async () => {}}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Details placeholder */}
          {activeTab === 'details' && !selectedTournament && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-white/50 font-semibold text-sm mb-1">Selecciona un torneo</p>
              <p className="text-white/20 text-xs">
                Elige un torneo de la lista para ver los detalles.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerTournamentView;
