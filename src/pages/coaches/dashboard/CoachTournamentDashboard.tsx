import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { errorMonitor } from 'events';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Zap,
  ChevronDown,
  Filter,
  Loader2,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import MatchScoringModal from '@/components/tournament/MatchScoringModal';
import { ScoreSubmissionData } from '@/components/tournament/MatchScoreRecorder';

/**
 * Coach Tournament Dashboard
 *
 * Displays:
 * - My Assignments (matches assigned as coach/referee)
 * - Upcoming Matches (next 7 days)
 * - Action Items (what needs to be done)
 * - Quick Stats
 */

interface CoachStats {
  coachMatches: number;
  refereeMatches: number;
  totalMatches: number;
  completedMatches: number;
  upcomingMatches: number;
  tournaments: number;
}

interface ActionItem {
  id: string;
  type: 'score_entry' | 'score_correction' | 'upcoming_match' | 'standings_recalc';
  priority: 'critical' | 'high' | 'normal';
  title: string;
  description: string;
  dueDate?: string;
  matchId?: string;
  correctionId?: string;
  groupId?: string;
}

interface AssignedMatch {
  id: string;
  scheduled_time: string;
  status: string;
  player1: { id: string; full_name: string };
  player2: { id: string; full_name: string };
  tournament: { name: string };
}

// ─── STAT CARD COMPONENT ───────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl px-4 py-3 flex items-center gap-3 hover:border-white/[0.12] transition-colors">
      <div
        className={cn(
          'w-10 h-10 rounded-lg border flex items-center justify-center shrink-0',
          color === 'critical'
            ? 'bg-red-500/10 border-red-500/30'
            : color === 'success'
              ? 'bg-[#ace600]/10 border-[#ace600]/30'
              : 'bg-blue-500/10 border-blue-500/30',
        )}
      >
        <Icon className={cn('w-5 h-5', color === 'critical' ? 'text-red-400' : 'text-[#ace600]')} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
        <p className="text-xs text-white/50">{sub}</p>
      </div>
    </div>
  );
}

// ─── ACTION ITEM COMPONENT ────────────────────────────────────────────────
function ActionItemCard({ item }: { item: ActionItem }) {
  const getPriorityColor = () => {
    switch (item.priority) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'high':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'score_entry':
        return <Zap className="w-4 h-4" />;
      case 'score_correction':
        return <AlertCircle className="w-4 h-4" />;
      case 'upcoming_match':
        return <Calendar className="w-4 h-4" />;
      case 'standings_recalc':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={cn(
        'bg-[#0d1117] border rounded-lg px-4 py-3 flex items-start gap-3 hover:border-white/[0.15] transition-colors',
        getPriorityColor(),
      )}
    >
      <div className="mt-0.5 shrink-0">{getTypeIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm leading-tight">{item.title}</p>
        <p className="text-xs text-white/60 mt-1">{item.description}</p>
        {item.dueDate && (
          <p className="text-xs text-white/40 mt-2">
            {new Date(item.dueDate).toLocaleDateString()}{' '}
            {new Date(item.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
      <button className="text-xs font-bold text-white/60 hover:text-white shrink-0 px-3 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">
        Actuar
      </button>
    </div>
  );
}

// ─── MATCH CARD COMPONENT ─────────────────────────────────────────────────
function MatchCard({ match, onSelectScore }: { match: AssignedMatch; onSelectScore: (match: AssignedMatch) => void }) {
  const scheduledTime = new Date(match.scheduled_time);
  const isToday = scheduledTime.toDateString() === new Date().toDateString();
  const isPastDue = scheduledTime < new Date() && match.status !== 'completed';
  const canRecord = scheduledTime <= new Date() && match.status !== 'completed'; // Can record if time passed and not completed

  return (
    <div
      className={cn(
        'bg-[#0d1117] border rounded-lg px-4 py-3 transition-colors',
        canRecord
          ? 'hover:border-white/[0.15] hover:bg-[#161B22] cursor-pointer'
          : 'border-white/[0.03] opacity-50 cursor-not-allowed',
        isPastDue ? 'border-red-500/30' : 'border-white/[0.07]',
      )}
      onClick={() => canRecord && onSelectScore(match)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm leading-tight mb-1">
            {match.player1?.full_name} vs {match.player2?.full_name}
          </p>
          <p className="text-xs text-white/60">{match.tournament?.name}</p>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-3.5 h-3.5 text-white/40" />
            <p className={cn('text-xs font-medium', isPastDue ? 'text-red-400' : 'text-white/70')}>
              {isToday ? 'Hoy' : scheduledTime.toLocaleDateString()}{' '}
              {scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right space-y-1">
          <span
            className={cn(
              'inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider',
              match.status === 'completed'
                ? 'bg-[#ace600]/10 text-[#ace600]'
                : match.status === 'in_progress'
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'bg-white/5 text-white/60',
            )}
          >
            {match.status === 'scheduled'
              ? 'Programado'
              : match.status === 'in_progress'
                ? 'En curso'
                : 'Terminado'}
          </span>
          {canRecord && (
            <div className="text-[9px] text-[#ace600] font-semibold">Click para registrar</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD COMPONENT ─────────────────────────────────────────────
export default function CoachTournamentDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'items'>('overview');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<CoachStats | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [assignments, setAssignments] = useState<AssignedMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Scoring modal state
  const [selectedMatch, setSelectedMatch] = useState<AssignedMatch | null>(null);
  const [isScoringOpen, setIsScoringOpen] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [scoreSuccess, setScoreSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await api.get<any>('/coaches/me/tournament-dashboard');

        if (data.success) {
          setStats(data.data.stats);
          setActionItems([
            ...data.data.actionItems.critical,
            ...data.data.actionItems.high,
            ...data.data.actionItems.normal,
          ]);
          // Load pending matches (assignments for coaches)
          setAssignments(data.data.pendingMatches || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Handle score submission
  const handleScoreSubmit = async (scoreData: ScoreSubmissionData) => {
    if (!selectedMatch) return;

    try {
      setIsSubmittingScore(true);
      setScoreError(null);
      setScoreSuccess(null);

      // Call the appropriate API endpoint based on match outcome
      if (scoreData.winner_by === 'score') {
        // Normal score entry
        await api.post(`/matches/${selectedMatch.id}/score`, {
          sets: [
            { player1_score: scoreData.set1.player1, player2_score: scoreData.set1.player2 },
            { player1_score: scoreData.set2.player1, player2_score: scoreData.set2.player2 },
            ...(scoreData.set3
              ? [{ player1_score: scoreData.set3.player1, player2_score: scoreData.set3.player2 }]
              : []),
          ],
        });
      } else {
        // Special outcome
        await api.post(`/matches/${selectedMatch.id}/special-outcome`, {
          outcome: scoreData.winner_by,
          reason: scoreData.reason_details,
          winner_id: scoreData.winnerId,
        });
      }

      setScoreSuccess('¡Marcador registrado correctamente!');

      // Close modal after short delay
      setTimeout(() => {
        setIsScoringOpen(false);
        setSelectedMatch(null);
        // Reload dashboard data
        window.location.reload();
      }, 1500);
    } catch (err) {
      setScoreError(err instanceof Error ? err.message : 'Error al registrar el marcador');
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const handleSelectMatch = (match: AssignedMatch) => {
    setSelectedMatch(match);
    setIsScoringOpen(true);
    setScoreError(null);
    setScoreSuccess(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#ace600] animate-spin" />
      </div>
    );
  }

  const criticalItems = actionItems.filter((item) => item.priority === 'critical');
  const highItems = actionItems.filter((item) => item.priority === 'high');
  const normalItems = actionItems.filter((item) => item.priority === 'normal');

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Torneo Dashboard</h1>
          <p className="text-white/60 text-sm mt-1">
            Gestiona tus asignaciones de árbitro y partidos
          </p>
        </div>
      </div>

      {/* QUICK STATS */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            icon={Trophy}
            label="Total Partidos"
            value={stats.totalMatches}
            sub={`${stats.completedMatches} completados`}
            color="success"
          />
          <StatCard
            icon={Calendar}
            label="Próximos"
            value={stats.upcomingMatches}
            sub="En 7 días"
            color="success"
          />
          <StatCard
            icon={Zap}
            label="Árbitro"
            value={stats.refereeMatches}
            sub="Asignados"
            color="normal"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completados"
            value={stats.completedMatches}
            sub="Esta temporada"
            color="success"
          />
          <StatCard
            icon={AlertCircle}
            label="Pendientes"
            value={criticalItems.length}
            sub="Acción requerida"
            color={criticalItems.length > 0 ? 'critical' : 'success'}
          />
          <StatCard
            icon={Trophy}
            label="Torneos"
            value={stats.tournaments}
            sub="Organizador"
            color="normal"
          />
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-2 border-b border-white/[0.07]">
        {['overview', 'assignments', 'items'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              'px-4 py-3 font-semibold text-sm border-b-2 transition-colors',
              activeTab === tab
                ? 'text-[#ace600] border-[#ace600]'
                : 'text-white/60 border-transparent hover:text-white/80',
            )}
          >
            {tab === 'overview' && 'Resumen'}
            {tab === 'assignments' && 'Asignaciones'}
            {tab === 'items' && `Elementos de Acción (${actionItems.length})`}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* ACTION ITEMS PREVIEW */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Elementos de Acción Pendientes</h2>
              <Filter className="w-4 h-4 text-white/40" />
            </div>

            {criticalItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-red-400/70">
                  CRÍTICO ({criticalItems.length})
                </p>
                {criticalItems.slice(0, 2).map((item) => (
                  <ActionItemCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {highItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-400/70">
                  ALTO ({highItems.length})
                </p>
                {highItems.slice(0, 2).map((item) => (
                  <ActionItemCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {actionItems.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 bg-[#0d1117] border border-white/[0.07] rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-[#ace600]/50 mb-2" />
                <p className="text-white/60 text-sm font-medium">¡Sin elementos pendientes!</p>
              </div>
            )}
          </div>

          {/* TOURNAMENT STATS */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Resumen Esta Semana</h2>

            <div className="bg-[#0d1117] border border-white/[0.07] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <p className="text-white/70 font-medium">Partidos Esta Semana</p>
                <p className="text-2xl font-bold text-[#ace600]">{stats?.upcomingMatches || 0}</p>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <p className="text-white/70 font-medium">Completados</p>
                <p className="text-2xl font-bold text-white">{stats?.completedMatches || 0}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-white/70 font-medium">Tasa de Finalización</p>
                <p className="text-2xl font-bold text-blue-400">
                  {stats && stats.totalMatches > 0
                    ? Math.round((stats.completedMatches / stats.totalMatches) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>

            <button className="w-full bg-[#ace600] text-black font-bold py-3 rounded-lg hover:bg-[#b8e500] transition-colors">
              Ver Mis Asignaciones ComplEtas
            </button>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Mis Asignaciones de Partidos</h2>
          <div className="grid gap-3">
            {assignments.length > 0 ? (
              assignments.map((match) => <MatchCard key={match.id} match={match} onSelectScore={handleSelectMatch} />)
            ) : (
              <div className="text-center py-16 text-white/60">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No hay asignaciones de partidos</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="space-y-6">
          {criticalItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-red-400/70">
                Crítico ({criticalItems.length})
              </h3>
              <div className="grid gap-2">
                {criticalItems.map((item) => (
                  <ActionItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {highItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-yellow-400/70">
                Alto ({highItems.length})
              </h3>
              <div className="grid gap-2">
                {highItems.map((item) => (
                  <ActionItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {normalItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400/70">
                Normal ({normalItems.length})
              </h3>
              <div className="grid gap-2">
                {normalItems.map((item) => (
                  <ActionItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {scoreError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          {scoreError}
        </div>
      )}

      {/* Score Recording Modal */}
      {selectedMatch && (
        <MatchScoringModal
          isOpen={isScoringOpen}
          matchId={selectedMatch.id}
          player1Name={selectedMatch.player1?.full_name || 'Jugador 1'}
          player1Id={selectedMatch.player1?.id || ''}
          player2Name={selectedMatch.player2?.full_name || 'Jugador 2'}
          player2Id={selectedMatch.player2?.id || ''}
          scheduledTime={selectedMatch.scheduled_time}
          eventName={selectedMatch.tournament?.name}
          onClose={() => {
            setIsScoringOpen(false);
            setSelectedMatch(null);
            setScoreError(null);
            setScoreSuccess(null);
          }}
          onSubmitScore={handleScoreSubmit}
          isSubmitting={isSubmittingScore}
        />
      )}
    </div>
  );
}
