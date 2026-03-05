import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Rocket,
} from 'lucide-react';

import { AppDispatch, RootState } from '@/store';
import {
  fetchTournamentsByState,
  deleteTournament,
  updateTournamentStatus,
  publishTournament,
} from '@/store/slices/tournamentsSlice';
import StateTournamentCreation from './StateTournamentCreation.tsx';
import type { Tournament, TournamentsQueryParams } from '@/types/api';

/* ─── status config ───────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  draft: { label: 'Draft', dot: 'bg-white/30', text: 'text-white/50', bg: 'bg-white/[0.06]' },
  pending_validation: {
    label: 'Awaiting Approval',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-500/[0.08]',
  },
  approved: {
    label: 'Approved',
    dot: 'bg-blue-400',
    text: 'text-blue-300',
    bg: 'bg-blue-500/[0.08]',
  },
  rejected: {
    label: 'Rejected',
    dot: 'bg-red-400',
    text: 'text-red-400',
    bg: 'bg-red-500/[0.08]',
  },
  published: {
    label: 'Published',
    dot: 'bg-sky-400',
    text: 'text-sky-300',
    bg: 'bg-sky-500/[0.08]',
  },
  in_progress: {
    label: 'In Progress',
    dot: 'bg-[#ace600]',
    text: 'text-[#ace600]',
    bg: 'bg-[#ace600]/[0.08]',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/[0.08]',
  },
  cancelled: {
    label: 'Cancelled',
    dot: 'bg-red-400',
    text: 'text-red-400',
    bg: 'bg-red-500/[0.08]',
  },
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  local: { label: 'Local', color: 'text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20' },
  state: { label: 'State', color: 'text-sky-400 bg-sky-500/[0.08] border-sky-500/20' },
  national: { label: 'National', color: 'text-[#ace600] bg-[#ace600]/[0.08] border-[#ace600]/20' },
};

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/[0.06] ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.local;
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ─── main ────────────────────────────────────────────────────────────────── */

const StateTournamentManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    pendingApprovals: tournaments,
    loading,
    error,
  } = useSelector((state: RootState) => state.tournaments);
  const { user } = useSelector((state: RootState) => state.auth);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [toDelete, setToDelete] = useState<Tournament | null>(null);
  const [toPublish, setToPublish] = useState<Tournament | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    load();
  }, [statusFilter, typeFilter]);

  function load() {
    const params: any = { page: 1, limit: 100 };
    // State users view all tournaments in their state (from fetchTournamentsByState)
    dispatch(
      fetchTournamentsByState({
        state: user?.state || '',
        limit: 100,
        page: 1,
      }),
    );

    console.log('[StateTournamentManagement] Loaded tournaments for state:', user?.state);
  }

  const filtered = tournaments.filter(
    (t) =>
      (statusFilter === 'all' || t?.status === statusFilter) &&
      (typeFilter === 'all' || t?.tournament_type === typeFilter) &&
      ((t?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (t?.venue_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (t?.city ?? '').toLowerCase().includes(search.toLowerCase())),
  );

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await dispatch(deleteTournament(toDelete.id)).unwrap();
      setToDelete(null);
      load();
    } catch {}
  }

  async function handleStatus(id: string, status: string) {
    try {
      await dispatch(updateTournamentStatus({ id, status })).unwrap();
      load();
    } catch {}
  }

  async function handlePublish(t: Tournament) {
    setToPublish(t);
  }

  async function confirmPublish() {
    if (!toPublish) return;
    setIsPublishing(true);
    try {
      console.log('[StateTournamentManagement] Publishing tournament:', toPublish.id);
      await dispatch(publishTournament(toPublish.id)).unwrap();
      console.log('[StateTournamentManagement] Tournament published successfully');
      setToPublish(null);
      setIsPublishing(false);
      load();
    } catch (err: any) {
      console.error('[StateTournamentManagement] Publish failed:', err);
      setIsPublishing(false);
      alert(`Failed to publish tournament: ${err.message || err}`);
    }
  }

  const canManage = (t: Tournament) => {
    if (user?.user_type === 'admin') return true;
    if (user?.user_type === 'state') return true; // State can manage all state-level tournaments
    return false;
  };

  /* filter pill */
  const selectTrigger =
    'h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white/70 px-3 focus:border-white/20 transition-colors w-full sm:w-44';
  const selectContent = 'bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl';

  return (
    <div className="space-y-6 p-1">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">State Tournaments</h1>
          <p className="text-sm text-white/35 mt-0.5">
            Manage and oversee tournaments in {user?.state}
          </p>
        </div>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] active:scale-[0.98] text-black text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-[0_0_18px_rgba(172,230,0,0.18)] hover:shadow-[0_0_28px_rgba(172,230,0,0.32)]">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              New Tournament
            </button>
          </DialogTrigger>
          <DialogContent
            className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-[680px] shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden"
            style={{ maxHeight: '88vh' }}
          >
            <StateTournamentCreation
              onTournamentCreated={(id) => {
                setShowCreate(false);
                load();
                navigate(`/tournaments/${id}/manage`);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tournaments, venues, cities…"
            className="w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg pl-8 pr-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* status */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={selectTrigger}>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className={selectContent}>
            {[
              'all',
              'draft',
              'pending_validation',
              'approved',
              'rejected',
              'published',
              'in_progress',
              'completed',
              'cancelled',
            ].map((s) => {
              const labels: Record<string, string> = {
                all: 'All Status',
                draft: 'Draft',
                pending_validation: 'Awaiting Approval',
                approved: 'Approved',
                rejected: 'Rejected',
                published: 'Published',
                in_progress: 'In Progress',
                completed: 'Completed',
                cancelled: 'Cancelled',
              };
              return (
                <SelectItem
                  key={s}
                  value={s}
                  className="text-white/70 focus:bg-white/[0.06] focus:text-white capitalize"
                >
                  {labels[s]}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* type */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className={selectTrigger}>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className={selectContent}>
            {['all', 'local', 'state', 'national'].map((t) => (
              <SelectItem
                key={t}
                value={t}
                className="text-white/70 focus:bg-white/[0.06] focus:text-white capitalize"
              >
                {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Table card ────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        {/* card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-white/30" />
            <span className="text-sm font-semibold text-white/60">Tournaments</span>
          </div>
          {!loading && (
            <span className="text-[11px] font-semibold text-white/25 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded-full">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>

        {/* loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
          </div>
        )}

        {/* no results */}
        {!loading && filtered.length === 0 && (
          <div className="px-5 py-12 text-center">
            <Trophy className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/40">No tournaments found</p>
          </div>
        )}

        {/* table */}
        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                    Tournament
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="text-white/90 font-medium line-clamp-1">{t.name}</p>
                          <p className="text-[11px] text-white/30">{t.venue_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <TypeBadge type={t.tournament_type} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-white/60 text-[12px]">
                        <Calendar className="w-3.5 h-3.5 text-white/20" />
                        <span className="whitespace-nowrap">
                          {formatDate(t.start_date)} - {formatDate(t.end_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-white/60 text-[12px]">
                        <MapPin className="w-3.5 h-3.5 text-white/20" />
                        <span>
                          {t.city}, {t.state}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/tournaments/${t.id}`)}
                          className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5 text-white/40 hover:text-white/70" />
                        </button>
                        {canManage(t) && (
                          <>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors">
                                  <MoreHorizontal className="w-3.5 h-3.5 text-white/40" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-[#161c25] border border-white/[0.08] rounded-lg shadow-xl"
                              >
                                {t.status === 'approved' && (
                                  <DropdownMenuItem
                                    onClick={() => handlePublish(t)}
                                    className="text-white/70 hover:text-white focus:bg-white/[0.06] cursor-pointer flex items-center gap-2"
                                  >
                                    <Rocket className="w-3.5 h-3.5" />
                                    Publish
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => setToDelete(t)}
                                  className="text-red-400/70 hover:text-red-400 focus:bg-red-500/10 cursor-pointer flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation ───────────────────────────────────────────── */}
      {toDelete && (
        <Dialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
          <DialogContent className="max-w-md bg-[#0d1117] border border-white/[0.08]">
            <DialogHeader>
              <DialogTitle className="text-white">Delete Tournament?</DialogTitle>
              <DialogDescription className="text-white/60">
                This action cannot be undone. The tournament "{toDelete.name}" will be permanently
                deleted.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setToDelete(null)}
                className="flex-1 px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-white rounded-lg hover:bg-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Publish Confirmation ──────────────────────────────────────────── */}
      {toPublish && (
        <Dialog open={!!toPublish} onOpenChange={() => setToPublish(null)}>
          <DialogContent className="max-w-md bg-[#0d1117] border border-white/[0.08]">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Rocket className="w-5 h-5 text-[#ace600]" />
                Publish Tournament?
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Once published, the tournament "{toPublish.name}" will be visible to all players.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setToPublish(null)}
                className="flex-1 px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-white rounded-lg hover:bg-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPublish}
                disabled={isPublishing}
                className="flex-1 px-4 py-2 bg-[#ace600] text-black rounded-lg hover:bg-[#c0f000] transition-colors font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
                Publish
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StateTournamentManagement;
