import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Trophy,
  FileText,
  ChevronRight,
  Filter,
  Search,
  Loader2,
  ArrowUpRight,
  Download,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * State Delegate Tournament Dashboard
 *
 * Displays:
 * - Pending Approvals (tournaments awaiting state approval)
 * - In Progress (active state tournaments)
 * - Completed (past tournaments)
 * - Quick approval/rejection actions
 * - Tournament statistics
 */

interface Tournament {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  Organizer: {
    full_name: string;
    email: string;
  };
  TournamentEvents: Array<{ name: string }>;
}

interface TournamentStats {
  totalTournaments: number;
  pendingApproval: number;
  approved: number;
  active: number;
  completed: number;
  participants: number;
  matches: number;
}

// ─── STAT CARD COMPONENT ───────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: never;
  trend?: string;
  color: string;
}) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-lg px-4 py-4 hover:border-white/[0.12] transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs font-medium mt-2',
                color === 'critical' ? 'text-red-400' : 'text-[#ace600]',
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-lg border flex items-center justify-center shrink-0',
            color === 'critical'
              ? 'bg-red-500/10 border-red-500/30'
              : color === 'warning'
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-[#ace600]/10 border-[#ace600]/30',
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5',
              color === 'critical'
                ? 'text-red-400'
                : color === 'warning'
                  ? 'text-yellow-400'
                  : 'text-[#ace600]',
            )}
          />
        </div>
      </div>
    </div>
  );
}

// ─── TOURNAMENT CARD COMPONENT ────────────────────────────────────────────
function TournamentCard({
  tournament,
  status,
  onApprove,
  onReject,
}: {
  tournament: Tournament;
  status: 'pending' | 'active' | 'completed';
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const startDate = new Date(tournament.start_date);
  const endDate = new Date(tournament.end_date);

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'active':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'completed':
        return 'bg-[#ace600]/10 border-[#ace600]/30 text-[#ace600]';
      default:
        return 'bg-white/5 border-white/[0.07] text-white/60';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'pending':
        return 'Pendiente de Aprobación';
      case 'active':
        return 'En Progreso';
      case 'completed':
        return 'Completado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div
      className={cn(
        'bg-[#0d1117] border rounded-lg overflow-hidden flex flex-col',
        getStatusColor(),
      )}
    >
      <div className="px-4 py-3 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm leading-tight mb-1">{tournament.name}</h3>
          <p className="text-xs text-white/60">{tournament.Organizer.full_name}</p>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-xs text-white/50">
              <Calendar className="w-3.5 h-3.5" />
              {startDate.toLocaleDateString()}
            </div>
            {tournament.TournamentEvents && tournament.TournamentEvents.length > 0 && (
              <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/70">
                {tournament.TournamentEvents.length} evento
                {tournament.TournamentEvents.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {status === 'pending' && (
          <div className="flex gap-2 ml-3">
            <button
              onClick={() => onReject?.(tournament.id)}
              className="px-3 py-1.5 text-xs font-bold bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
            >
              Rechazar
            </button>
            <button
              onClick={() => onApprove?.(tournament.id)}
              className="px-3 py-1.5 text-xs font-bold bg-[#ace600]/20 text-[#ace600] rounded hover:bg-[#ace600]/30 transition-colors"
            >
              Aprobar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD COMPONENT ─────────────────────────────────────────────
export default function StateTournamentDashboard() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');

  const [stats, setStats] = useState<TournamentStats | null>(null);
  const [pendingTournaments, setPendingTournaments] = useState<Tournament[]>([]);
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [completedTournaments, setCompletedTournaments] = useState<Tournament[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/states/delegate/dashboard', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (!response.ok) throw new Error('Failed to load dashboard data');

        const data = await response.json();
        if (data.success) {
          setStats(data.data.stats);
          setPendingTournaments(data.data.pending);
          setActiveTournaments(data.data.active);
          setCompletedTournaments(data.data.completed);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleApprove = async (tournamentId: string) => {
    try {
      const response = await fetch(`/api/v1/states/delegate/tournaments/${tournamentId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approvalNotes: '' }),
      });

      if (response.ok) {
        // Refresh data
        setPendingTournaments(pendingTournaments.filter((t) => t.id !== tournamentId));
        const approved = pendingTournaments.find((t) => t.id === tournamentId);
        if (approved) setActiveTournaments([...activeTournaments, approved]);
      }
    } catch (err) {
      console.error('Error approving tournament:', err);
    }
  };

  const handleReject = async (tournamentId: string) => {
    const reason = prompt('Razón por la cual se solicitan cambios:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/v1/states/delegate/tournaments/${tournamentId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejectionReason: reason }),
      });

      if (response.ok) {
        setPendingTournaments(pendingTournaments.filter((t) => t.id !== tournamentId));
      }
    } catch (err) {
      console.error('Error rejecting tournament:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#ace600] animate-spin" />
      </div>
    );
  }

  const filteredTournaments = {
    pending: pendingTournaments.filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
    active: activeTournaments.filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
    completed: completedTournaments.filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Torneos Estatales</h1>
          <p className="text-white/60 text-sm mt-1">
            Aprueba, monitorea y gestiona torneos de tu estado
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#ace600] text-black font-bold rounded-lg hover:bg-[#b8e500] transition-colors">
          <Download className="w-4 h-4" />
          Exportar Reporte
        </button>
      </div>

      {/* QUICK STATS */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={AlertCircle}
            label="Pendiente"
            value={stats.pendingApproval as never}
            color={stats.pendingApproval > 0 ? 'warning' : 'normal'}
            trend={
              stats.pendingApproval > 0 ? `${stats.pendingApproval} requieren acción` : 'Sin acción'
            }
          />
          <StatCard
            icon={CheckCircle2}
            label="Aprobados"
            value={stats.approved as never}
            color="normal"
          />
          <StatCard
            icon={Trophy}
            label="En Progreso"
            value={stats.active as never}
            color="normal"
          />
          <StatCard
            icon={FileText}
            label="Completados"
            value={stats.completed as never}
            color="normal"
          />
        </div>
      )}

      {/* EXTENDED STATS */}
      {stats && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-lg px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
              Participantes Registrados
            </p>
            <p className="text-3xl font-bold text-[#ace600]">
              {stats.participants.toLocaleString()}
            </p>
          </div>
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-lg px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
              Partidos Jugados
            </p>
            <p className="text-3xl font-bold text-white">{stats.matches.toLocaleString()}</p>
          </div>
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-lg px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
              Torneos Totales
            </p>
            <p className="text-3xl font-bold text-blue-400">{stats.totalTournaments}</p>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTER */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Buscar torneos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d1117] border border-white/[0.07] rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/[0.15]"
          />
        </div>
        <button className="p-2.5 bg-[#0d1117] border border-white/[0.07] rounded-lg hover:border-white/[0.15] transition-colors">
          <Filter className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-white/[0.07]">
        {['pending', 'active', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              'px-4 py-3 font-semibold text-sm border-b-2 transition-colors relative',
              activeTab === tab
                ? 'text-[#ace600] border-[#ace600]'
                : 'text-white/60 border-transparent hover:text-white/80',
            )}
          >
            {tab === 'pending' && `Pendiente (${filteredTournaments.pending.length})`}
            {tab === 'active' && `En Progreso (${filteredTournaments.active.length})`}
            {tab === 'completed' && `Completado (${filteredTournaments.completed.length})`}
            {tab === 'pending' && filteredTournaments.pending.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {filteredTournaments.pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="space-y-3">
        {activeTab === 'pending' && (
          <>
            {filteredTournaments.pending.length > 0 ? (
              filteredTournaments.pending.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  status="pending"
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            ) : (
              <div className="text-center py-16 text-white/60">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>¡No hay torneos pendientes de aprobación!</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'active' && (
          <>
            {filteredTournaments.active.length > 0 ? (
              filteredTournaments.active.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} status="active" />
              ))
            ) : (
              <div className="text-center py-16 text-white/60">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No hay torneos en progreso</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'completed' && (
          <>
            {filteredTournaments.completed.length > 0 ? (
              filteredTournaments.completed.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} status="completed" />
              ))
            ) : (
              <div className="text-center py-16 text-white/60">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No hay torneos completados</p>
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
