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
  clearTournamentEvents,
  clearEventGroups,
  clearEventMatches,
  clearEventRegistrations,
} from '@/store/slices/tournamentsSlice';

import GroupManagement from '@/components/tournament/GroupManagement';
import GroupStandings from '@/components/tournament/GroupStandings';
import MatchManagement from '@/components/tournament/MatchManagement';
import QualifierSelection from '@/components/tournament/QualifierSelection';
import TournamentBracket from '@/components/tournament/TournamentBracket';
import BracketMatchScoreModal from '@/components/tournament/BracketMatchScoreModal';
import TournamentStatusTimeline, {
  Stage as TimelineStage,
} from '@/components/tournament/TournamentStatusTimeline';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { markTournamentAsComplete } from '@/services/tournamentBracketService';

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

interface PlayerMark {
  user_id: string;
  full_name: string;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  win_percentage: number;
  ranking: number;
}

interface PlayerMarksResponse {
  success: boolean;
  eventId: string;
  player_marks: PlayerMark[];
  total_players: number;
}

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

  // ── Qualifier extraction state (for QualifierSelection component) ──
  const [extractedQualifiers, setExtractedQualifiers] = useState<any[]>([]);

  // ── Bracket data state ──
  const [bracketRawData, setBracketRawData] = useState<any>(null);
  const [bracketLoading, setBracketLoading] = useState(false);
  const [isGeneratingBracket, setIsGeneratingBracket] = useState(false);
  const [bracketError, setBracketError] = useState<string | null>(null);
  const [qualifierError, setQualifierError] = useState<string | null>(null);

  // ── Tournament completion state ──
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isTournamentComplete, setIsTournamentComplete] = useState(false);
  const [playerMarks, setPlayerMarks] = useState<PlayerMark[]>([]);
  const [loadingPlayerMarks, setLoadingPlayerMarks] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);


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

  /* ── Clear stale state and load fresh data when tournamentId changes ── */
  useEffect(() => {
    if (tournamentId) {
      // Clear stale data from any previously viewed tournament to prevent
      // auto-select picking up old event IDs and causing 404 on groups fetch
      setSelectedEvent(null);
      dispatch(clearTournamentEvents());
      dispatch(clearEventGroups());
      dispatch(clearEventMatches());
      dispatch(clearEventRegistrations());

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

  /* ── Auto-select event when only one exists ── */
  /* Guard: only select events that belong to the current tournament to avoid stale-state 404s */
  useEffect(() => {
    if (
      !selectedEvent &&
      tournamentEvents?.length === 1 &&
      tournamentEvents[0]?.tournament_id === tournamentId
    ) {
      setSelectedEvent(tournamentEvents[0]);
    }
  }, [tournamentEvents, selectedEvent, tournamentId]);

  /* ── Load groups, matches, and registrations when event is selected ── */
  /* Guard: event.tournament_id must match current tournamentId before any fetch */
  useEffect(() => {
    if (
      tournamentId &&
      selectedEvent?.id &&
      selectedEvent?.tournament_id === tournamentId
    ) {
      console.log('[Dashboard] Loading event data:', {
        tournamentId,
        eventId: selectedEvent.id,
      });

      dispatch(fetchEventGroups({ tournamentId, eventId: selectedEvent.id } as any))
        .then(() => console.log('[Dashboard] ✓ Groups loaded'))
        .catch((err: any) => console.error('[Dashboard] ✗ Failed to load groups:', err));

      dispatch(fetchEventMatches({ tournamentId, eventId: selectedEvent.id } as any))
        .then((result) => {
          console.log('[Dashboard] ✓ Matches loaded', result);
        })
        .catch((err: any) => console.error('[Dashboard] ✗ Failed to load matches:', err));

      dispatch(fetchEventRegistrations({ tournamentId, eventId: selectedEvent.id } as any))
        .then(() => console.log('[Dashboard] ✓ Registrations loaded'))
        .catch((err: any) => console.error('[Dashboard] ✗ Failed to load registrations:', err));
    }
  }, [tournamentId, selectedEvent?.id, dispatch]);


  // ── Qualifier handlers ──
  const fetchAndSetQualifiers = async () => {
    if (!tournamentId || !selectedEvent?.id) return;
    setQualifierError(null);
    try {
      const response = await api.get(
        `/tournaments/${tournamentId}/events/${selectedEvent.id}/qualifiers`,
      );
      const rawQualifiers: any[] = (response as any)?.qualifiers || [];
      const transformed = rawQualifiers.map((q: any) => ({
        userId: q.user_id,
        userName: q.user_name,
        position: q.seed_position,
        groupId: q.group_id,
        groupNumber: q.group_number,
        matchesWon: q.matches_won || 0,
        qualified: true,
      }));
      setExtractedQualifiers(transformed);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Error al obtener clasificados';
      setQualifierError(msg);
      console.error('Failed to fetch qualifiers:', err);
    }
  };

  // Expose as the component prop (strategy ignored — we always fetch top-N from backend)
  const handleExtractQualifiers = async (_strategy: string) => {
    await fetchAndSetQualifiers();
  };

  // Auto-load qualifiers AND bracket status when the clasificados tab becomes active
  useEffect(() => {
    if (activeTab === 'qualifiers' && tournamentId && selectedEvent?.id) {
      fetchAndSetQualifiers();
      loadBracketData(); // needed to detect if bracket already exists (bracketExists flag)
    }
  }, [activeTab, tournamentId, selectedEvent?.id]);

  const handleConfirmAdvancement = async () => {
    if (!tournamentId || !selectedEvent?.id) return;
    // If bracket was already auto-generated (last group match triggers it), just navigate
    if (bracketExists) {
      setActiveTab('bracket');
      return;
    }
    setBracketError(null);
    setIsGeneratingBracket(true);
    try {
      await api.post(
        `/tournaments/${tournamentId}/events/${selectedEvent.id}/generate-bracket`,
        { advance_count: 2 },
      );
      await loadBracketData();
      setActiveTab('bracket');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Error al generar bracket';
      setBracketError(msg);
      console.error('Failed to generate bracket:', err);
    } finally {
      setIsGeneratingBracket(false);
    }
  };

  // ── Fetch bracket data ──
  const loadBracketData = async () => {
    if (!tournamentId || !selectedEvent?.id) return;
    setBracketLoading(true);
    try {
      const response = await api.get(
        `/tournaments/${tournamentId}/events/${selectedEvent.id}/bracket`,
      );
      setBracketRawData(response);
    } catch (err) {
      console.error('Failed to load bracket:', err);
    } finally {
      setBracketLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bracket' && tournamentId && selectedEvent?.id) {
      loadBracketData();
    }
  }, [activeTab, tournamentId, selectedEvent?.id]);

  // Bracket match score modal state
  const [bracketModal, setBracketModal] = useState<{
    matchId: string;
    player1: { id: string; name: string };
    player2: { id: string; name: string };
  } | null>(null);

  const handleBracketMatchClick = (
    matchId: string,
    player1: { id: string; name: string },
    player2: { id: string; name: string },
  ) => {
    setBracketModal({ matchId, player1, player2 });
  };

  const handleBracketScoreSubmit = async (payload: {
    matchId: string;
    winnerId: string;
    loserId: string;
    setScores: any[];
    winnerBy: string;
    reason?: string;
  }) => {
    if (!tournamentId || !selectedEvent?.id) return;
    await api.put(
      `/tournaments/${tournamentId}/events/${selectedEvent.id}/matches/${payload.matchId}`,
      {
        winner_id: payload.winnerId,
        loser_id: payload.loserId,
        set_scores: payload.setScores,
        winner_by: payload.winnerBy,
        ...(payload.reason ? { walkover_reason: payload.reason } : {}),
      },
    );
    await loadBracketData();
  };

  // bracketRawData is the source of truth: matches[] from the real API
  const bracketExists = ((bracketRawData as any)?.matches?.length ?? 0) > 0;

  // Only count group_stage matches for completion — bracket matches must not count
  const groupStageMatchesOnly = (eventMatches ?? []).filter(
    (m: any) => m.match_type === 'group_stage' || (m.group_id && !m.match_type),
  );
  const allGroupMatchesDone =
    groupStageMatchesOnly.length > 0 &&
    groupStageMatchesOnly.every((m: any) => m.status === 'completed');

  // Check if all bracket matches are completed
  const allBracketMatchesDone =
    bracketExists &&
    ((bracketRawData as any)?.matches?.length ?? 0) > 0 &&
    ((bracketRawData as any)?.matches?.every((m: any) => m.status === 'completed') ?? false);

  // Current stage
  const getCurrentStage = (): StageKey => {
    if (!selectedEvent) return 'planning';
    if (!eventGroups?.length) return 'groups';
    if (!eventMatches?.length) return 'standings';
    if (!allGroupMatchesDone) return 'matches';
    if (!bracketExists) return 'qualifiers';
    if (!allBracketMatchesDone) return 'bracket';
    return 'completed';
  };
  const currentStage = getCurrentStage();

  const isStageCompleted = (key: StageKey) =>
    (key === 'groups' && (eventGroups?.length ?? 0) > 0) ||
    (key === 'standings' && (eventMatches?.some((m: any) => m.status === 'completed') ?? false)) ||
    (key === 'matches' && allGroupMatchesDone) ||
    (key === 'qualifiers' && bracketExists) ||
    (key === 'bracket' && allBracketMatchesDone) ||
    (key === 'completed' && allBracketMatchesDone);

  // Build stages with progress information for timeline
  const buildStagesWithProgress = (): TimelineStage[] => {
    const totalMatches = eventMatches?.length || 0;
    const completedMatches = eventMatches?.filter((m: any) => m.status === 'completed').length || 0;
    const registrations = eventRegistrations?.length || 0;

    // Calculate bracket progress from bracketRawData (flat matches[])
    const rawBracketMatches: any[] = (bracketRawData as any)?.matches ?? [];
    const bracketTotalMatches = rawBracketMatches.length;
    const bracketCompletedMatches = rawBracketMatches.filter(
      (m: any) => m.status === 'completed',
    ).length;

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
        } else if (stage.key === 'qualifiers') {
          const qualifiersAdvanced = extractedQualifiers.length;
          progress = {
            current: qualifiersAdvanced,
            total: qualifiersAdvanced || 1,
            percent: qualifiersAdvanced > 0 ? 100 : 0,
            label: qualifiersAdvanced > 0
              ? `${qualifiersAdvanced} jugadores clasificados`
              : 'Extrayendo clasificados...',
          };
        } else if (stage.key === 'bracket') {
          // Show bracket tournament progress
          progress = {
            current: bracketCompletedMatches,
            total: Math.max(bracketTotalMatches, 1),
            percent: bracketTotalMatches > 0 ? (bracketCompletedMatches / bracketTotalMatches) * 100 : 0,
            label:
              bracketTotalMatches === 0
                ? 'Esperando bracket...'
                : `${bracketCompletedMatches}/${bracketTotalMatches} partidos completados`,
          };
        } else if (stage.key === 'completed') {
          // Tournament completion stage
          progress = {
            current: 1,
            total: 1,
            percent: 100,
            label: '¡Torneo finalizado exitosamente!',
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
    if (!selectedEvent?.id || !tournamentId) return;

    // Transform MatchManagement local format → backend API format
    const apiData: any = {};

    if (data.status === 'played' || data.set1) {
      // Score-based result
      const set_scores: any[] = [];
      if (data.set1) set_scores.push({ set: 1, player1: data.set1.p1, player2: data.set1.p2 });
      if (data.set2) set_scores.push({ set: 2, player1: data.set2.p1, player2: data.set2.p2 });
      if (data.set3) set_scores.push({ set: 3, player1: data.set3.p1, player2: data.set3.p2 });
      apiData.winner_by = 'score';
      apiData.set_scores = set_scores;
      if (data.winner?.id) apiData.winner_id = data.winner.id;
    } else if (data.status === 'walkover') {
      apiData.winner_by = 'walkover';
      if (data.winner?.id) apiData.winner_id = data.winner.id;
      if (data.notes) apiData.walkover_reason = data.notes;
    } else if (data.status === 'withdrawal') {
      apiData.winner_by = 'withdrawal';
      if (data.winner?.id) apiData.winner_id = data.winner.id;
      if (data.notes) apiData.withdrawal_reason = data.notes;
    } else if (data.status === 'disqualified') {
      apiData.winner_by = 'disqualification';
      if (data.winner?.id) apiData.winner_id = data.winner.id;
      if (data.notes) apiData.disqualification_reason = data.notes;
    }

    const result: any = await api.put(
      `/tournaments/${tournamentId}/events/${selectedEvent.id}/matches/${matchId}`,
      apiData,
    );

    dispatch(fetchEventMatches({ tournamentId, eventId: selectedEvent.id }));

    // Backend auto-generates bracket when last group match is recorded
    if (result?.workflow?.bracket_generated) {
      await loadBracketData();
    }
  };

  // Fetch player marks/rankings for completed tournament
  const fetchPlayerMarks = async () => {
    if (!selectedEvent?.id || !tournamentId) return;
    setLoadingPlayerMarks(true);
    try {
      const response = await api.get<PlayerMarksResponse>(
        `/tournaments/${tournamentId}/events/${selectedEvent.id}/player-marks`,
      );
      console.log('[DEBUG] Player marks response:', response);
      if (response?.player_marks && Array.isArray(response.player_marks)) {
        console.log('[DEBUG] Setting player marks:', response.player_marks);
        setPlayerMarks(response.player_marks);
      } else {
        console.warn('[DEBUG] No player_marks array in response');
      }
    } catch (err) {
      console.error('Failed to fetch player marks:', err);
    } finally {
      setLoadingPlayerMarks(false);
    }
  };

  const handleMarkTournamentComplete = async () => {
    if (!selectedEvent?.id || !tournamentId || allBracketMatchesDone === false) return;

    setIsMarkingComplete(true);
    setCompletionError(null);
    try {
      const result = await markTournamentAsComplete(tournamentId, selectedEvent.id);
      console.log('[DEBUG] Mark complete result:', result);
      if (result?.success) {
        setIsTournamentComplete(true);
        // Update local event status immediately so the header badge reflects "completed"
        setSelectedEvent((prev: any) => ({ ...prev, status: 'completed' }));
        // Refresh events list from server
        dispatch(fetchTournamentEvents({ tournamentId, limit: 20 } as any));
        // Fetch and display player marks
        await fetchPlayerMarks();
        console.log('Tournament marked as complete');
      } else {
        const errorMsg = result?.error || 'Failed to mark tournament as complete';
        console.error('Tournament completion failed:', errorMsg);
        setCompletionError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error marking tournament complete';
      console.error('Error marking tournament complete:', err);
      setCompletionError(errorMsg);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const groups = eventGroups || [];
  const regs = eventRegistrations || [];
  const events = tournamentEvents || [];

  // Calculate completed matches BEFORE using it in tabEnabled
  const completedMatches = (eventMatches || []).filter((m: any) => m.status === 'completed').length;

  // Tab enabled states
  const tabEnabled: Record<TabKey, boolean> = {
    overview: true,
    groups: !!selectedEvent, // Can generate groups once event is selected
    standings: !!eventGroups?.length, // Can view standings after groups are generated
    matches: !!eventGroups?.length && selectedEvent?.status !== 'draft', // Can record matches after groups exist
    qualifiers: completedMatches > 0 && !!eventGroups?.length, // Can select qualifiers only after matches are completed
    bracket: extractedQualifiers.length > 0, // Can view bracket only after qualifiers are selected
  };

  // Transform API match format → MatchManagement MatchRecord format
  const matches = (eventMatches || []).map((m: any) => {
    const scores: any[] = Array.isArray(m.setScores) ? m.setScores : [];
    const isCompleted = m.status === 'completed';
    return {
      id: m.id,
      player1: { id: m.player1?.id || null, name: m.player1?.name || 'TBD', ranking: m.player1?.ranking ?? m.player1?.ranking_points ?? null },
      player2: { id: m.player2?.id || null, name: m.player2?.name || 'TBD', ranking: m.player2?.ranking ?? m.player2?.ranking_points ?? null },
      status: isCompleted ? 'played' : m.status,
      winner: isCompleted && m.player1 && m.player2
        ? undefined // winner shown via score, not name
        : undefined,
      set1: scores[0] ? { p1: scores[0].player1, p2: scores[0].player2 } : undefined,
      set2: scores[1] ? { p1: scores[1].player1, p2: scores[1].player2 } : undefined,
      set3: scores[2] ? { p1: scores[2].player1, p2: scores[2].player2 } : undefined,
    };
  });

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
              selectedEvent.status === 'completed'
                ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                : selectedEvent.status === 'in_progress' || selectedEvent.status === 'registration_open'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-sky-500/10 border-sky-500/20 text-sky-400',
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                selectedEvent.status === 'completed'
                  ? 'bg-violet-400'
                  : selectedEvent.status === 'in_progress'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-sky-400',
              )}
            />
            {selectedEvent.status === 'completed'
              ? 'COMPLETADO'
              : selectedEvent.status?.replace(/_/g, ' ').toUpperCase() || 'ACTIVO'}
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
        <>
          <TournamentStatusTimeline
            stages={stagesWithProgress}
            currentStage={currentStage}
            horizontalLayout={true}
            showProgressLabels={true}
          />

        </>
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
        <div className="space-y-5">
          {groupStageMatchesOnly.length === 0 ? (
            <EmptyPanel
              icon={Swords}
              title="Sin partidos programados"
              sub="Los partidos aparecerán aquí una vez que se generen los grupos"
            />
          ) : (() => {
            // Group matches by group_id
            const groupMap = new Map<string, { groupNumber: number; rawMatches: any[] }>();
            groupStageMatchesOnly.forEach((m: any) => {
              const gid = m.group_id || 'ungrouped';
              if (!groupMap.has(gid)) {
                const grp = (eventGroups ?? []).find((g: any) => g.id === gid);
                groupMap.set(gid, { groupNumber: grp?.group_number ?? 0, rawMatches: [] });
              }
              groupMap.get(gid)!.rawMatches.push(m);
            });

            // Sort sections by group number
            const sections = Array.from(groupMap.entries())
              .sort(([, a], [, b]) => a.groupNumber - b.groupNumber);

            return sections.map(([gid, { groupNumber, rawMatches }]) => {
              const groupMatchRecords = rawMatches.map((m: any) => {
                const scores: any[] = Array.isArray(m.setScores) ? m.setScores : [];
                const isCompleted = m.status === 'completed';
                return {
                  id: m.id,
                  player1: { id: m.player1?.id || null, name: m.player1?.name || 'TBD', ranking: m.player1?.ranking ?? m.player1?.ranking_points ?? null },
                  player2: { id: m.player2?.id || null, name: m.player2?.name || 'TBD', ranking: m.player2?.ranking ?? m.player2?.ranking_points ?? null },
                  status: isCompleted ? 'played' : m.status,
                  winner: undefined as any,
                  set1: scores[0] ? { p1: scores[0].player1, p2: scores[0].player2 } : undefined,
                  set2: scores[1] ? { p1: scores[1].player1, p2: scores[1].player2 } : undefined,
                  set3: scores[2] ? { p1: scores[2].player1, p2: scores[2].player2 } : undefined,
                };
              });
              const doneCount = groupMatchRecords.filter(m => m.status !== 'pending').length;
              const allDone = doneCount === groupMatchRecords.length;

              return (
                <div key={gid} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
                  {/* Group header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-xs font-black text-[#ace600]">
                        {groupNumber || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white/80">
                          {groupNumber ? `Grupo ${groupNumber}` : 'Sin grupo'}
                        </p>
                        <p className="text-[10px] text-white/25">
                          {groupMatchRecords.length} partidos · {doneCount} completados
                        </p>
                      </div>
                    </div>
                    {allDone && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Completo
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <MatchManagement
                      eventId={selectedEvent?.id || ''}
                      matches={groupMatchRecords}
                      onMatchUpdate={handleMatchUpdate}
                      hideHeader
                    />
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Qualifiers */}
      {activeTab === 'qualifiers' && (
        <div className="space-y-3">
          {qualifierError && (
            <div className="flex items-start gap-3 p-3.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-400">Error al obtener clasificados</p>
                <p className="text-[11px] text-red-400/70 mt-0.5">{qualifierError}</p>
              </div>
            </div>
          )}
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
              qualifiers={extractedQualifiers}
              advanceCount={2}
              onExtractQualifiers={handleExtractQualifiers}
              onConfirmAdvancement={handleConfirmAdvancement}
            />
          )}
        </div>
      )}

      {/* Bracket */}
      {activeTab === 'bracket' && (() => {
        const hasGroupMatches = groupStageMatchesOnly.length > 0;
        const hasBracket = bracketExists;

        if (!hasGroupMatches && !hasBracket) {
          return (
            <EmptyPanel
              icon={Trophy}
              title="Sin partidos aún"
              sub="Los partidos aparecerán aquí una vez que se generen los grupos"
            />
          );
        }

        return (
          <div className="space-y-5">
            {/* ── Group stage + elimination bracket (both rendered inside TournamentBracket) ── */}
            <TournamentBracket
              bracketData={bracketRawData}
              onMatchClick={handleBracketMatchClick}
              groupMatches={groupStageMatchesOnly}
              groups={eventGroups ?? []}
            />

            {/* ── Bracket score modal ── */}
            {bracketModal && (
              <BracketMatchScoreModal
                matchId={bracketModal.matchId}
                player1={bracketModal.player1}
                player2={bracketModal.player2}
                matchFormat={selectedEvent?.sets_format ?? 'best_of_3_to_11'}
                onSubmit={handleBracketScoreSubmit}
                onClose={() => setBracketModal(null)}
              />
            )}

            {/* ── Generate bracket prompt (all group matches done but no bracket yet) ── */}
            {!hasBracket && !bracketLoading && allGroupMatchesDone && (
              <div className="flex flex-col items-center justify-center py-14 gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
                {bracketError && (
                  <div className="flex items-start gap-2 px-4 py-2.5 bg-red-500/[0.08] border border-red-500/20 rounded-xl w-full max-w-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-red-400/80">{bracketError}</p>
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#ace600]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white/50 mb-1">Bracket no generado</p>
                  <p className="text-xs text-white/25 max-w-[220px] leading-relaxed">
                    Todos los partidos de grupos han finalizado. Genera el bracket de eliminación.
                  </p>
                </div>
                <button
                  onClick={handleConfirmAdvancement}
                  disabled={isGeneratingBracket}
                  className="inline-flex items-center gap-2 h-9 px-5 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_14px_rgba(172,230,0,0.18)] transition-all disabled:opacity-60"
                >
                  {isGeneratingBracket ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trophy className="w-3.5 h-3.5" />
                  )}
                  {isGeneratingBracket ? 'Generando…' : 'Generar Bracket'}
                </button>
              </div>
            )}

            {/* ── Bracket loading spinner ── */}
            {bracketLoading && (
              <div className="flex items-center justify-center py-16 gap-3 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
                <Loader2 className="w-4 h-4 text-[#ace600] animate-spin" />
                <span className="text-xs text-white/30">Cargando bracket…</span>
              </div>
            )}

            {/* ── Mark Complete Button ── */}
            {hasBracket && allBracketMatchesDone && !isTournamentComplete && (
              <div className="flex flex-col items-center justify-center gap-3 pt-4">
                {completionError && (
                  <div className="w-full flex items-start gap-2 px-4 py-3 bg-red-500/[0.08] border border-red-500/20 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400/80">{completionError}</p>
                  </div>
                )}
                <button
                  onClick={handleMarkTournamentComplete}
                  disabled={isMarkingComplete}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-[#ace600] hover:from-emerald-600 hover:to-[#b8f000] text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-60"
                >
                  {isMarkingComplete ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4" />
                      ¡Finalizar Torneo!
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ── Tournament Complete Alert + Rankings ── */}
            {isTournamentComplete && (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-6 px-4 bg-emerald-500/[0.08] border border-emerald-500/30 rounded-2xl">
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <Trophy className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-sm font-bold text-emerald-400">¡Torneo Finalizado!</p>
                    <p className="text-xs text-emerald-400/70 mt-1">El tournament ha sido marcado como completado</p>
                  </div>
                </div>

                {loadingPlayerMarks ? (
                  <div className="flex items-center justify-center py-8 gap-3 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
                    <Loader2 className="w-4 h-4 text-[#ace600] animate-spin" />
                    <span className="text-xs text-white/30">Cargando clasificación…</span>
                  </div>
                ) : playerMarks && playerMarks.length > 0 ? (
                  <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.07]">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Medal className="w-4 h-4 text-[#ace600]" />
                        Clasificación Final
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/[0.07]">
                            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/50 bg-white/[0.02]">#</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/50 bg-white/[0.02]">Jugador</th>
                            <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-white/50 bg-white/[0.02]">Partidos</th>
                            <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-white/50 bg-white/[0.02]">Ganados</th>
                            <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-white/50 bg-white/[0.02]">Perdidos</th>
                            <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-white/50 bg-white/[0.02]">% Victorias</th>
                          </tr>
                        </thead>
                        <tbody>
                          {playerMarks.map((player, idx) => (
                            <tr key={player.user_id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-3">
                                <div className="flex items-center justify-center">
                                  {idx === 0 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-400">🥇</span>
                                  ) : idx === 1 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-400/20 border border-gray-400/30 text-xs font-bold text-gray-300">🥈</span>
                                  ) : idx === 2 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 border border-amber-700/30 text-xs font-bold text-amber-600">🥉</span>
                                  ) : (
                                    <span className="text-xs font-semibold text-white/50">{idx + 1}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <span className="text-xs font-semibold text-white">{player.full_name}</span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                <span className="text-xs text-white/70">{player.matches_played}</span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                <span className="text-xs font-semibold text-[#4ade80]">{player.matches_won}</span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                <span className="text-xs text-white/50">{player.matches_lost}</span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 text-xs font-bold text-[#ace600]">
                                  {player.win_percentage}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 px-4 bg-white/[0.02] border border-white/[0.07] rounded-2xl">
                    <p className="text-xs text-white/40">No hay datos de clasificación disponibles</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default ClubTournamentDashboard;
