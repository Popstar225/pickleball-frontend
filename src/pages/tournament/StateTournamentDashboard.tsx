import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  Users,
  Swords,
  Target,
  AlertTriangle,
  Loader2,
  BarChart3,
  ChevronRight,
  Layers,
  CheckCircle2,
} from 'lucide-react';

import { AppDispatch, RootState } from '@/store';
import {
  fetchTournaments,
  fetchTournamentEvents,
  fetchEventGroups,
  fetchEventMatches,
} from '@/store/slices/tournamentsSlice';
import GroupStandings from '@/components/tournament/GroupStandings';
import QualifierSelection from '@/components/tournament/QualifierSelection';
import SingleEliminationBracket from '@/components/tournament/SingleEliminationBracket';

/* ─── tab config ── */
type Tab = 'overview' | 'standings' | 'qualifiers' | 'bracket';

const TABS: {
  id: Tab;
  label: string;
  icon: React.ElementType;
  needsTournament?: boolean;
  needsGroups?: boolean;
}[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'standings', label: 'Standings', icon: Layers, needsTournament: true, needsGroups: true },
  { id: 'qualifiers', label: 'Qualifiers', icon: Target, needsTournament: true },
  { id: 'bracket', label: 'Bracket', icon: Swords, needsTournament: true },
];

/* ─── status config ── */
function statusCfg(status: string) {
  if (status === 'in_progress' || status === 'registration_open')
    return {
      dot: 'bg-emerald-400',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/[0.08]',
      border: 'border-emerald-500/20',
    };
  if (status === 'completed')
    return {
      dot: 'bg-white/30',
      text: 'text-white/40',
      bg: 'bg-white/[0.05]',
      border: 'border-white/[0.08]',
    };
  return {
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-500/[0.08]',
    border: 'border-amber-500/20',
  };
}

function StatusBadge({ status }: { status: string }) {
  const c = statusCfg(status);
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-bold uppercase tracking-widest hover:bg-transparent ${c.bg} ${c.border} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.dot}`} />
      {status.replace(/_/g, ' ')}
    </Badge>
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

/* ── stat pill ── */
function StatPill({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-white/40">
      <Icon className="w-3 h-3 text-white/20" />
      <span className="font-semibold text-white/60">{value}</span>
      <span>{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */

const StateTournamentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { tournaments, eventGroups, loading, error } = useSelector(
    (state: RootState) => state.tournaments,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const activeTournament = tournaments.find((t: any) => t.id === selectedTournamentId);

  /* ── Load state tournaments on mount ── */
  useEffect(() => {
    dispatch(
      fetchTournaments({
        organizer_type: 'state',
        state: user?.state,
        limit: 50,
      } as any),
    ).catch((err: any) => console.error('Failed to load tournaments:', err));
  }, [dispatch, user?.state]);

  /* ── Load events when tournament is selected ── */
  useEffect(() => {
    if (selectedTournamentId) {
      dispatch(
        fetchTournamentEvents({
          tournamentId: selectedTournamentId,
          limit: 20,
        } as any),
      ).catch((err: any) => console.error('Failed to load events:', err));
    }
  }, [selectedTournamentId, dispatch]);

  /* ── Load groups and matches when event is selected ── */
  useEffect(() => {
    if (selectedTournamentId && activeEvent) {
      dispatch(
        fetchEventGroups({
          tournamentId: selectedTournamentId,
          eventId: activeEvent,
        } as any),
      ).catch((err: any) => console.error('Failed to load groups:', err));

      dispatch(
        fetchEventMatches({
          tournamentId: selectedTournamentId,
          eventId: activeEvent,
        } as any),
      ).catch((err: any) => console.error('Failed to load matches:', err));
    }
  }, [selectedTournamentId, activeEvent, dispatch]);

  /* ── loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
        <p className="text-sm text-white/25">Loading tournaments…</p>
      </div>
    );
  }

  const isTabDisabled = (tab: (typeof TABS)[number]) => {
    if (tab.needsTournament && !activeTournament) return true;
    if (tab.needsGroups && (!eventGroups || eventGroups.length === 0)) return true;
    return false;
  };

  return (
    <div className="space-y-6 p-1">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">State Tournaments</h1>
          <p className="text-sm text-white/35 mt-0.5">
            Manage tournaments within {user?.state || 'your state'}
          </p>
        </div>
        {activeTournament && (
          <Badge
            variant="outline"
            className="bg-[#ace600]/[0.08] border-[#ace600]/20 text-[#ace600] text-[11px] font-semibold"
          >
            <Trophy className="w-3 h-3 mr-1.5" />
            {activeTournament.name}
          </Badge>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex gap-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* ── Main card ── */}
      <Card className="bg-[#0d1117] border-white/[0.07] rounded-2xl overflow-hidden p-0">
        {/* Tab bar */}
        <CardHeader className="p-0 border-b border-white/[0.06]">
          <div className="flex overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => {
              const disabled = isTabDisabled(TABS.find((t) => t.id === id)!);
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
          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Tournament grid */}
              {tournaments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
                    <Trophy className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-white/50 font-semibold text-sm mb-1">No tournaments found</p>
                  <p className="text-white/20 text-xs">Create a tournament to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tournaments.map((tournament: any) => {
                    const isSelected = selectedTournamentId === tournament.id;
                    return (
                      <button
                        key={tournament.id}
                        onClick={() => setSelectedTournamentId(tournament.id)}
                        className={`text-left p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#ace600]/[0.04] border-[#ace600]/30'
                            : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5">
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
                            <p className="text-sm font-bold text-white/85 leading-tight">
                              {tournament.name}
                            </p>
                          </div>
                          <StatusBadge status={tournament.status || 'pending'} />
                        </div>
                        <div className="flex items-center gap-4">
                          <StatPill
                            icon={Users}
                            value={tournament.registrations?.length || 0}
                            label="players"
                          />
                          <StatPill
                            icon={Layers}
                            value={tournament.events?.length || 0}
                            label="events"
                          />
                        </div>
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] text-[#ace600]/70 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Selected
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Event list for selected tournament */}
              {selectedTournamentId && activeTournament && (
                <>
                  <Separator className="bg-white/[0.05]" />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-4 h-4 text-white/25" />
                      <p className="text-sm font-semibold text-white/50">
                        Events — {activeTournament.name}
                      </p>
                      <Badge
                        variant="outline"
                        className="ml-auto border-white/[0.06] bg-white/[0.04] text-white/25 text-[10px]"
                      >
                        {activeTournament.events?.length || 0}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {activeTournament.events?.map((event: any) => {
                        const isActive = activeEvent === event.id;
                        return (
                          <button
                            key={event.id}
                            onClick={() => setActiveEvent(event.id)}
                            className={`w-full text-left flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                              isActive
                                ? 'bg-[#ace600]/[0.04] border-[#ace600]/25'
                                : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14]'
                            }`}
                          >
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold border flex-shrink-0 ${blockColor(event.skill_block)}`}
                            >
                              {event.skill_block}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white/60 capitalize">
                                {event.modality} · {event.gender}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-white/30 flex-shrink-0">
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3" /> {event.groups?.length || 0} groups
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {event.registrations?.length || 0}
                              </span>
                              <ChevronRight
                                className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-[#ace600]/50' : 'text-white/15'}`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigate shortcuts */}
                    {activeEvent && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('standings')}
                          disabled={!eventGroups || eventGroups.length === 0}
                          className="flex-1 h-8 border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white text-xs font-semibold disabled:opacity-30"
                        >
                          <Layers className="w-3 h-3 mr-1.5" /> Standings
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('qualifiers')}
                          className="flex-1 h-8 border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white text-xs font-semibold"
                        >
                          <Target className="w-3 h-3 mr-1.5" /> Qualifiers
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('bracket')}
                          className="flex-1 h-8 border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white text-xs font-semibold"
                        >
                          <Swords className="w-3 h-3 mr-1.5" /> Bracket
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Standings ── */}
          {activeTab === 'standings' && (
            <div className="space-y-4">
              {eventGroups && eventGroups.length > 0 ? (
                eventGroups.map((group: any, idx: number) => (
                  <div
                    key={group.id}
                    className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white/40">{idx + 1}</span>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/35">
                          Group {idx + 1}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-white/[0.06] bg-white/[0.04] text-white/25 text-[10px]"
                      >
                        {group.standings?.length || 0} players
                      </Badge>
                    </div>
                    <div className="p-4">
                      <GroupStandings
                        groupName={`Group ${idx + 1}`}
                        groupNumber={idx + 1}
                        advanceCount={2}
                        tournamentId={selectedTournamentId || undefined}
                        eventId={activeEvent || undefined}
                        groupId={group.id}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
                    <Layers className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-white/50 font-semibold text-sm mb-1">No groups yet</p>
                  <p className="text-white/20 text-xs">
                    No groups have been generated for this event.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Qualifiers ── */}
          {activeTab === 'qualifiers' && activeTournament && (
            <QualifierSelection
              eventId={activeEvent || ''}
              eventName={
                activeTournament.events?.find((e: any) => e.id === activeEvent)?.skill_block || ''
              }
              groups={eventGroups || []}
              qualifiers={[]}
              advanceCount={2}
              onExtractQualifiers={async (strategy) => {
                console.log('Extract:', strategy);
              }}
              onConfirmAdvancement={async () => {
                setActiveTab('bracket');
              }}
            />
          )}

          {/* ── Bracket ── */}
          {activeTab === 'bracket' && activeTournament && (
            <SingleEliminationBracket
              eventId={activeEvent || ''}
              eventName={
                activeTournament.events?.find((e: any) => e.id === activeEvent)?.skill_block || ''
              }
              bracketMatches={[]}
              totalRounds={4}
              onRecordResult={async (matchId, winnerId, score) => {
                console.log('Result:', { matchId, winnerId, score });
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StateTournamentDashboard;
