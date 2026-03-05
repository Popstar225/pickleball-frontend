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
  fetchTournaments,
  deleteTournament,
  updateTournamentStatus,
  publishTournament,
} from '@/store/slices/tournamentsSlice';
import TournamentCreation from './TournamentCreation';
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

const TournamentManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { tournaments, loading, error } = useSelector((state: RootState) => state.tournaments);
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
    const params: TournamentsQueryParams = { page: 1, limit: 50 };
    if (statusFilter !== 'all') params.status = statusFilter as any;
    if (typeFilter !== 'all') params.tournament_type = typeFilter as any;
    // club users only view their own
    if (user?.user_type === 'club') {
      params.myTournaments = 'true';
    }
    dispatch(fetchTournaments(params));

    console.log('[TournamentManagement] Rendered with tournaments:', tournaments);
  }

  const filtered = tournaments.filter(
    (t) =>
      (t?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t?.venue_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t?.city ?? '').toLowerCase().includes(search.toLowerCase()),
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
      console.log('[TournamentManagement] Publishing tournament:', toPublish.id);
      await dispatch(publishTournament(toPublish.id)).unwrap();
      console.log('[TournamentManagement] Tournament published successfully');
      setToPublish(null);
      setIsPublishing(false);
      load();
    } catch (err: any) {
      console.error('[TournamentManagement] Publish failed:', err);
      setIsPublishing(false);
      alert(`Failed to publish tournament: ${err.message || err}`);
    }
  }

  const canManage = (t: Tournament) => {
    if (user?.user_type === 'admin') return true;
    if (user?.user_type === 'state')
      return t.organizer_type === 'state' || t.tournament_type === 'local';
    if (user?.user_type === 'club') return t.organizer_type === 'club';
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Tournaments</h1>
          <p className="text-sm text-white/35 mt-0.5">Create and manage your competitions</p>
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
            <TournamentCreation
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
            <span className="text-sm font-semibold text-white/60">Your Tournaments</span>
          </div>
          {!loading && (
            <span className="text-[11px] font-semibold text-white/25 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded-full">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>

        {/* loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
            <p className="text-sm text-white/25">Loading tournaments…</p>
          </div>
        )}

        {/* empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/50 font-semibold text-sm mb-1">No tournaments found</p>
            <p className="text-white/20 text-xs max-w-xs">
              {search || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Create your first tournament to get started.'}
            </p>
            {!search && statusFilter === 'all' && typeFilter === 'all' && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-5 flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold px-4 py-2 rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Tournament
              </button>
            )}
          </div>
        )}

        {/* table */}
        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Tournament', 'Type', 'Status', 'Dates', 'Venue', 'Participants', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white/25 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr
                    key={t.id}
                    className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
                  >
                    {/* name */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white text-sm leading-tight">{t.name}</div>
                      <div className="text-[11px] text-white/30 mt-0.5 capitalize">
                        {t.category?.replace('_', ' ')}
                      </div>
                    </td>

                    {/* type */}
                    <td className="px-5 py-3.5">
                      <TypeBadge type={t.tournament_type} />
                    </td>

                    {/* status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={t.status} />
                    </td>

                    {/* dates */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-white/60 text-xs">
                        <Calendar className="w-3 h-3 text-white/25 flex-shrink-0" />
                        {formatDate(t.start_date)} – {formatDate(t.end_date)}
                      </div>
                      <div className="flex items-center gap-1.5 text-white/25 text-[11px] mt-0.5">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        Reg: {formatDate(t.registration_deadline)}
                      </div>
                    </td>

                    {/* venue */}
                    <td className="px-5 py-3.5">
                      <div className="text-white/60 text-xs font-medium leading-tight">
                        {t.venue_name}
                      </div>
                      <div className="flex items-center gap-1 text-white/25 text-[11px] mt-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {t.city}, {t.state}
                      </div>
                    </td>

                    {/* participants */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-white/25" />
                        <span className="text-white/60 text-xs font-medium">
                          {t.current_participants ?? 0}
                          <span className="text-white/25"> / {t.max_participants}</span>
                        </span>
                      </div>
                      {/* mini progress bar */}
                      <div className="mt-1.5 w-20 h-1 rounded-full bg-white/[0.07] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#ace600]/60 transition-all"
                          style={{
                            width: `${Math.min(100, ((t.current_participants ?? 0) / t.max_participants) * 100)}%`,
                          }}
                        />
                      </div>
                    </td>

                    {/* actions */}
                    <td className="px-5 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl p-1 w-48"
                        >
                          <DropdownMenuItem
                            onClick={() => navigate(`/clubs/dashboard/tournaments/${t.id}`)}
                            className="flex items-center gap-2.5 text-white/60 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/clubs/dashboard/tournaments/${t.id}/manage`)}
                            className="flex items-center gap-2.5 text-white/60 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5" /> Manage Events
                          </DropdownMenuItem>

                          {canManage(t) && (
                            <>
                              <div className="h-px bg-white/[0.06] my-1" />
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/clubs/dashboard/tournaments/${t.id}/edit`)
                                }
                                className="flex items-center gap-2.5 text-white/60 hover:text-white focus:text-white hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit Tournament
                              </DropdownMenuItem>

                              {t.status === 'draft' && (
                                <DropdownMenuItem
                                  onClick={() => handleStatus(t.id, 'pending_validation')}
                                  className="flex items-center gap-2.5 text-amber-400 hover:text-amber-300 focus:text-amber-300 hover:bg-amber-500/[0.06] focus:bg-amber-500/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Request Approval
                                </DropdownMenuItem>
                              )}

                              {t.status === 'approved' && (
                                <DropdownMenuItem
                                  onClick={() => handlePublish(t)}
                                  className="flex items-center gap-2.5 text-[#ace600] hover:text-[#c0f000] focus:text-[#c0f000] hover:bg-[#ace600]/[0.06] focus:bg-[#ace600]/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                                >
                                  <Rocket className="w-3.5 h-3.5" /> Publish Tournament
                                </DropdownMenuItem>
                              )}

                              {t.status === 'published' && (
                                <DropdownMenuItem
                                  onClick={() => handleStatus(t.id, 'cancelled')}
                                  className="flex items-center gap-2.5 text-amber-400 hover:text-amber-300 focus:text-amber-300 hover:bg-amber-500/[0.06] focus:bg-amber-500/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" /> Cancel
                                </DropdownMenuItem>
                              )}

                              <div className="h-px bg-white/[0.06] my-1" />
                              <DropdownMenuItem
                                onClick={() => setToDelete(t)}
                                className="flex items-center gap-2.5 text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-red-500/[0.06] focus:bg-red-500/[0.06] rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Publish dialog ───────────────────────────────────────────────── */}
      <Dialog open={!!toPublish} onOpenChange={(v) => !v && !isPublishing && setToPublish(null)}>
        <DialogContent className="bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm p-0 shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="w-11 h-11 rounded-2xl bg-[#ace600]/[0.08] border border-[#ace600]/15 flex items-center justify-center mb-4">
              <Rocket className="w-5 h-5 text-[#ace600]" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Publish Tournament</h2>
            <p className="text-sm text-white/35 leading-relaxed mb-4">
              Publish <span className="text-white/60 font-medium">"{toPublish?.name}"</span> to make
              it available for player registration?
            </p>

            {toPublish && (
              <div className="space-y-2.5 mb-6 p-3 bg-[#ace600]/[0.05] border border-[#ace600]/10 rounded-lg">
                <div className="flex justify-between items-start text-xs">
                  <span className="text-white/50">Tournament Dates:</span>
                  <span className="text-white/80 font-medium">
                    {formatDate(toPublish.start_date)} – {formatDate(toPublish.end_date)}
                  </span>
                </div>
                <div className="flex justify-between items-start text-xs">
                  <span className="text-white/50">Venue:</span>
                  <span className="text-white/80 font-medium text-right">
                    {toPublish.venue_name}, {toPublish.city}
                  </span>
                </div>
                <div className="flex justify-between items-start text-xs">
                  <span className="text-white/50">Registration Deadline:</span>
                  <span className="text-white/80 font-medium">
                    {formatDate(toPublish.registration_deadline)}
                  </span>
                </div>
                <div className="flex justify-between items-start text-xs">
                  <span className="text-white/50">Max Participants:</span>
                  <span className="text-white/80 font-medium">{toPublish.max_participants}</span>
                </div>
              </div>
            )}

            <div className="p-3 bg-[#ace600]/[0.05] border border-[#ace600]/10 rounded-lg mb-6">
              <p className="text-xs text-[#ace600] leading-relaxed">
                ✓ Players will be able to register immediately after publication
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 px-6 pb-6">
            <button
              onClick={() => setToPublish(null)}
              disabled={isPublishing}
              className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmPublish}
              disabled={isPublishing}
              className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold transition-all shadow-[0_0_16px_rgba(172,230,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket className="w-3.5 h-3.5" />
                  Publish
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete dialog ─────────────────────────────────────────────────── */}
      <Dialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <DialogContent className="bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm p-0 shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="w-11 h-11 rounded-2xl bg-red-500/[0.08] border border-red-500/15 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Delete Tournament</h2>
            <p className="text-sm text-white/35 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="text-white/60 font-medium">"{toDelete?.name}"</span>? This action
              cannot be undone.
            </p>
          </div>
          <div className="flex gap-2.5 px-6 pb-6">
            <button
              onClick={() => setToDelete(null)}
              className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 h-9 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-bold transition-all shadow-[0_0_16px_rgba(239,68,68,0.2)]"
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex gap-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default TournamentManagement;
