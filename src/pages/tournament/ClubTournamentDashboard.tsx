/**
 * Club Tournament Dashboard — full management for club organizers
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Trophy,
  Users,
  Swords,
  Target,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Layers,
  ListChecks,
  Medal,
  BarChart3,
} from 'lucide-react';

import { AppDispatch, RootState } from '@/store';
import {
  fetchTournament,
  fetchTournamentEvents,
  fetchEventGroups,
  fetchEventMatches,
  fetchEventRegistrations,
  generateGroups,
} from '@/store/slices/tournamentsSlice';

import GroupManagement from '@/components/tournament/GroupManagement';
import GroupStandings from '@/components/tournament/GroupStandings';
import MatchManagement from '@/components/tournament/MatchManagement';
import QualifierSelection from '@/components/tournament/QualifierSelection';
import SingleEliminationBracket from '@/components/tournament/SingleEliminationBracket';
import TournamentStatusTimeline, {
  Stage as TimelineStage,
} from '@/components/tournament/TournamentStatusTimeline';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
type StageKey =
  | 'planning'
  | 'groups'
  | 'standings'
  | 'matches'
  | 'qualifiers'
  | 'bracket'
  | 'completed';
type TabKey = 'overview' | 'groups' | 'standings' | 'matches' | 'qualifiers' | 'bracket';

interface Stage {
  key: StageKey;
  label: string;
  desc: string;
}
const STAGES: Stage[] = [
  { key: 'planning', label: 'Planificación', desc: 'Configuración e inscripciones' },
  { key: 'groups', label: 'Grupos', desc: 'Generar grupos balanceados' },
  { key: 'standings', label: 'Tabla', desc: 'Resultados round-robin' },
  { key: 'matches', label: 'Partidos', desc: 'Registrar resultados' },
  { key: 'qualifiers', label: 'Clasificados', desc: 'Avanzar a eliminatoria' },
  { key: 'bracket', label: 'Bracket', desc: 'Eliminación directa' },
  { key: 'completed', label: 'Completado', desc: 'Torneo finalizado' },
];

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Resumen', icon: BarChart3 },
  { key: 'groups', label: 'Grupos', icon: Layers },
  { key: 'standings', label: 'Tabla', icon: ListChecks },
  { key: 'matches', label: 'Partidos', icon: Swords },
  { key: 'qualifiers', label: 'Clasificados', icon: Medal },
  { key: 'bracket', label: 'Bracket', icon: Trophy },
];

const modalityCls: Record<string, string> = {
  Singles: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Doubles: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Mixed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1 truncate">
          {label}
        </p>
        <p className={cn('text-[22px] font-bold leading-none', color)}>{value}</p>
        <p className="text-[10px] text-white/20 mt-1">{sub}</p>
      </div>
      <div
        className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shrink-0', bg)}
      >
        <Icon className={cn('w-4 h-4', color)} />
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-6 h-6 rounded-md bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3 text-[#ace600]" />
      </div>
      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/30">
        {children}
      </span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ElementType;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <Icon className="w-5 h-5 text-white/10" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white/35 mb-1">{title}</p>
        {sub && <p className="text-xs text-white/20 max-w-[220px] leading-relaxed">{sub}</p>}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-white/25">{label}</span>
      <span className="text-xs font-semibold text-white/70">{value}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const ClubTournamentDashboard: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { tournamentEvents, eventGroups, eventMatches, eventRegistrations, loading, error } =
    useSelector((s: RootState) => s.tournaments);

  // Redirect or show error if no tournament ID
  if (!tournamentId) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-6 bg-red-500/[0.06] border border-red-500/15 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-400 mb-1">Tournament ID Required</p>
            <p className="text-xs text-red-400/70">Please select a tournament to manage</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Load tournament and its events on mount ── */
  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournament(tournamentId)).catch((err: any) =>
        console.error('Failed to load tournament:', err),
      );

      dispatch(
        fetchTournamentEvents({
          tournamentId,
          limit: 20,
        } as any),
      ).catch((err: any) => console.error('Failed to load events:', err));
    }
  }, [tournamentId, dispatch]);

  console.log({ tournamentEvents, eventGroups, eventMatches, eventRegistrations });
  /* ── Load groups, matches, and registrations when event is selected ── */
  useEffect(() => {
    if (tournamentId && selectedEvent?.id) {
      dispatch(fetchEventGroups({ tournamentId, eventId: selectedEvent.id } as any)).catch(
        (err: any) => console.error('Failed to load groups:', err),
      );

      dispatch(fetchEventMatches({ tournamentId, eventId: selectedEvent.id } as any)).catch(
        (err: any) => console.error('Failed to load matches:', err),
      );

      dispatch(fetchEventRegistrations({ tournamentId, eventId: selectedEvent.id } as any)).catch(
        (err: any) => console.error('Failed to load registrations:', err),
      );
    }
  }, [tournamentId, selectedEvent?.id, dispatch]);

  // Current stage
  const getCurrentStage = (): StageKey => {
    if (!selectedEvent) return 'planning';
    if (!eventGroups?.length) return 'groups';
    if (!eventMatches?.length) return 'standings';
    const done = eventMatches.filter((m: any) => m.status === 'completed').length;
    if (done === 0) return 'matches';
    if (done < eventMatches.length) return 'matches';
    return 'qualifiers';
  };
  const currentStage = getCurrentStage();

  const isStageCompleted = (key: StageKey) =>
    (key === 'groups' && (eventGroups?.length ?? 0) > 0) ||
    (key === 'matches' && (eventMatches?.length ?? 0) > 0) ||
    (key === 'qualifiers' && (eventMatches?.some((m: any) => m.status === 'completed') ?? false));

  // Build stages with progress information for timeline
  const buildStagesWithProgress = (): TimelineStage[] => {
    const totalMatches = eventMatches?.length || 0;
    const completedMatches = eventMatches?.filter((m: any) => m.status === 'completed').length || 0;
    const registrations = eventRegistrations?.length || 0;

    return STAGES.map((stage) => {
      const isActive = stage.key === currentStage;
      const isCompleted = isStageCompleted(stage.key);

      let progress = undefined;
      if (isActive) {
        // Calculate progress based on current stage
        if (stage.key === 'groups') {
          progress = {
            current: Math.min(eventGroups?.length || 0, 1),
            total: 1,
            percent: eventGroups?.length ? 100 : 0,
            label: eventGroups?.length ? 'Grupos generados' : 'Esperando generación...',
          };
        } else if (stage.key === 'matches') {
          progress = {
            current: completedMatches,
            total: totalMatches,
            percent: totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0,
            label: `${completedMatches}/${totalMatches} partidos completados`,
          };
        } else if (stage.key === 'planning') {
          progress = {
            current: registrations,
            total: Math.max(registrations, 1),
            percent: registrations > 0 ? 100 : 50,
            label: `${registrations} jugadores inscritos`,
          };
        }
      }

      return {
        key: stage.key,
        label: stage.label,
        description: stage.desc,
        completed: isCompleted,
        isActive: isActive,
        progress: progress,
      };
    });
  };

  const stagesWithProgress = buildStagesWithProgress();

  const handleGenerateGroups = async () => {
    if (!selectedEvent?.id) return;
    try {
      await dispatch(
        generateGroups({ tournamentId: tournamentId || '', eventId: selectedEvent.id }),
      ).unwrap();
      dispatch(fetchEventGroups({ tournamentId: tournamentId || '', eventId: selectedEvent.id }));
      dispatch(fetchEventMatches({ tournamentId: tournamentId || '', eventId: selectedEvent.id }));
    } catch (e) {
      /* handled via error state */
    }
  };

  const handleMatchUpdate = async (matchId: string, data: any) => {
    if (selectedEvent?.id)
      dispatch(fetchEventMatches({ tournamentId: tournamentId || '', eventId: selectedEvent.id }));
  };

  // Tab enabled states
  const tabEnabled: Record<TabKey, boolean> = {
    overview: true,
    groups: !!selectedEvent,
    standings: !!eventGroups?.length,
    matches: !!eventMatches?.length,
    qualifiers: !!eventGroups?.length,
    bracket: true,
  };

  const groups = eventGroups || [];
  const matches = eventMatches || [];
  const regs = eventRegistrations || [];
  const events = tournamentEvents || [];

  const completedMatches = matches.filter((m: any) => m.status === 'completed').length;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[22px] font-bold text-white tracking-tight">Gestión del Torneo</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
              Club
            </span>
          </div>
          <p className="text-xs text-white/25">
            {selectedEvent
              ? `${selectedEvent.skill_block} · ${selectedEvent.modality} · ${selectedEvent.gender}`
              : 'Selecciona un evento para administrar'}
          </p>
        </div>

        {selectedEvent && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider',
              selectedEvent.status === 'in_progress' || selectedEvent.status === 'registration_open'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-sky-500/10 border-sky-500/20 text-sky-400',
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full animate-pulse',
                selectedEvent.status === 'in_progress' ? 'bg-emerald-400' : 'bg-sky-400',
              )}
            />
            {selectedEvent.status?.replace(/_/g, ' ').toUpperCase() || 'ACTIVO'}
          </span>
        )}
      </div>

      {/* ── Error banner ────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 p-3.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400/90">{error}</p>
        </div>
      )}

      {/* ── Tournament Status Timeline ────────────────────────────────────── */}
      {selectedEvent && (
        <TournamentStatusTimeline
          stages={stagesWithProgress}
          currentStage={currentStage}
          horizontalLayout={true}
          showProgressLabels={true}
        />
      )}

      {/* ── Event selector (when none selected) ─────────────────────────────── */}
      {!selectedEvent && events.length > 0 && (
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <SectionHeading icon={Layers}>Selecciona un Evento</SectionHeading>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {events.map((event: any) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="group text-left flex items-center gap-3.5 p-4 bg-white/[0.02] border border-white/[0.07] rounded-xl hover:border-[#ace600]/30 hover:bg-[#ace600]/[0.03] transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[11px] font-black text-white/30 shrink-0 select-none group-hover:bg-[#ace600]/10 group-hover:border-[#ace600]/20 group-hover:text-[#ace600] transition-all">
                  {event.skill_block?.slice(0, 2).toUpperCase() || '??'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors truncate">
                    {event.skill_block}
                  </p>
                  <div className="flex gap-1.5 mt-1.5">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full border',
                        modalityCls[event.modality] ??
                          'bg-white/[0.05] text-white/25 border-white/[0.08]',
                      )}
                    >
                      {event.modality}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/25">
                      {event.gender}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-[#ace600]/60 shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Stat strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          icon={Users}
          label="Inscritos"
          value={regs.length}
          sub="jugadores"
          color="text-sky-400"
          bg="bg-sky-500/10 border-sky-500/20"
        />
        <StatCard
          icon={Target}
          label="Grupos"
          value={groups.length}
          sub="generados"
          color="text-violet-400"
          bg="bg-violet-500/10 border-violet-500/20"
        />
        <StatCard
          icon={Swords}
          label="Partidos"
          value={`${completedMatches}/${matches.length}`}
          sub="completados"
          color="text-[#ace600]"
          bg="bg-[#ace600]/10 border-[#ace600]/20"
        />
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto pb-px">
        {TABS.map(({ key, label, icon: Icon }) => {
          const enabled = tabEnabled[key];
          const active = activeTab === key;
          const isDone = isStageCompleted(key as StageKey);
          return (
            <button
              key={key}
              onClick={() => enabled && setActiveTab(key)}
              disabled={!enabled}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap shrink-0 transition-all',
                active
                  ? 'bg-[#ace600] text-black shadow-[0_0_10px_rgba(172,230,0,0.15)]'
                  : !enabled
                    ? 'bg-white/[0.02] border border-white/[0.05] text-white/15 cursor-not-allowed'
                    : 'bg-[#0d1117] border border-white/[0.07] text-white/35 hover:text-white/65 hover:border-white/[0.12]',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {!active && isDone && (
                <CheckCircle2
                  className={cn('w-3 h-3', active ? 'text-black/40' : 'text-[#ace600]')}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab panels ──────────────────────────────────────────────────────── */}

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {!selectedEvent ? (
            <EmptyPanel
              icon={Target}
              title="Selecciona un evento"
              sub="Elige un evento arriba para ver los detalles del torneo"
            />
          ) : (
            <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <SectionHeading icon={Trophy}>Detalles del Evento</SectionHeading>
              </div>
              <div className="px-5 pb-4">
                <InfoRow label="Categoría" value={selectedEvent.skill_block} />
                <InfoRow
                  label="Modalidad"
                  value={
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full border text-[10px] font-bold',
                        modalityCls[selectedEvent.modality] ??
                          'bg-white/[0.05] text-white/30 border-white/[0.08]',
                      )}
                    >
                      {selectedEvent.modality}
                    </span>
                  }
                />
                <InfoRow label="Género" value={selectedEvent.gender} />
                <InfoRow label="Formato" value={selectedEvent.format ?? '—'} />
                <InfoRow label="Inscritos" value={`${regs.length} jugadores`} />
                <InfoRow
                  label="Etapa Actual"
                  value={
                    <span className="inline-flex items-center gap-1.5 text-[#ace600] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
                      {STAGES.find((s) => s.key === currentStage)?.label}
                    </span>
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Groups */}
      {activeTab === 'groups' && selectedEvent && (
        <div>
          {selectedEvent.number_of_groups === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-5 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <Target className="w-6 h-6 text-white/10" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white/35 mb-1">Sin grupos generados</p>
                <p className="text-xs text-white/20 max-w-[200px] leading-relaxed">
                  Genera grupos balanceados a partir de los jugadores inscritos
                </p>
              </div>
              <button
                onClick={handleGenerateGroups}
                disabled={loading}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_14px_rgba(172,230,0,0.18)] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generando…
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    Generar Grupos
                  </>
                )}
              </button>
            </div>
          ) : (
            <GroupManagement
              tournamentId={tournamentId || ''}
              eventId={selectedEvent.id}
              eventName={selectedEvent.name}
              eventStatus={selectedEvent.status}
            />
          )}
        </div>
      )}

      {/* Standings */}
      {activeTab === 'standings' && (
        <div className="space-y-3">
          {groups.length === 0 ? (
            <EmptyPanel
              icon={ListChecks}
              title="Genera los grupos primero"
              sub="La tabla de posiciones estará disponible una vez que se generen los grupos"
            />
          ) : (
            groups.map((group: any, idx: number) => (
              <div
                key={group.id}
                className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-xs font-black text-[#ace600]">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/80">Grupo {idx + 1}</p>
                      <p className="text-xs text-white/25">
                        {group.standings?.length || 0} jugadores · {group.matches?.length || 0}{' '}
                        partidos
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <GroupStandings
                    groupName={`Grupo ${idx + 1}`}
                    groupNumber={idx + 1}
                    advanceCount={2}
                    tournamentId={tournamentId}
                    eventId={selectedEvent?.id}
                    groupId={group.id}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Matches */}
      {activeTab === 'matches' && (
        <div>
          {matches.length === 0 ? (
            <EmptyPanel
              icon={Swords}
              title="Sin partidos programados"
              sub="Los partidos aparecerán aquí una vez que se generen los grupos"
            />
          ) : (
            <MatchManagement
              eventId={selectedEvent?.id || ''}
              matches={matches}
              onMatchUpdate={handleMatchUpdate}
            />
          )}
        </div>
      )}

      {/* Qualifiers */}
      {activeTab === 'qualifiers' && (
        <div>
          {groups.length === 0 ? (
            <EmptyPanel
              icon={Medal}
              title="Genera los grupos primero"
              sub="La selección de clasificados estará disponible una vez que se generen los grupos"
            />
          ) : (
            <QualifierSelection
              eventId={selectedEvent?.id || ''}
              eventName={`${selectedEvent?.skill_block} ${selectedEvent?.modality}` || ''}
              groups={groups}
              qualifiers={[]}
              advanceCount={2}
              onExtractQualifiers={async (strategy) => {}}
              onConfirmAdvancement={async () => {
                setActiveTab('bracket');
              }}
            />
          )}
        </div>
      )}

      {/* Bracket */}
      {activeTab === 'bracket' && (
        <SingleEliminationBracket
          eventId={selectedEvent?.id || ''}
          eventName={`${selectedEvent?.skill_block} ${selectedEvent?.modality}` || ''}
          bracketMatches={[]}
          totalRounds={4}
          onRecordResult={async (matchId, winnerId, score) => {}}
        />
      )}
    </div>
  );
};

export default ClubTournamentDashboard;
