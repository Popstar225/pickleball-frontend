import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Users,
  Trophy,
  Settings,
  Play,
  CheckCircle,
  Target,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Zap,
  BarChart3,
  Shield,
  Swords,
  Star,
  Clock,
  Hash,
  TrendingUp,
  Eye,
  Filter,
  Search,
} from 'lucide-react';

import { AppDispatch, RootState } from '@/store';
import {
  fetchTournamentEvents,
  fetchTournamentEvent,
  createTournamentEvent,
  generateGroups,
  fetchEventStandings,
  fetchEventRegistrations,
  registerForEvent,
  fetchEventGroups,
  fetchEventMatches,
  createTournamentMatch,
  recordMatchResult,
  finalizeGroup,
  checkRegistrationEligibility,
} from '@/store/slices/tournamentsSlice';
import { fetchClubProfile } from '@/store/slices/clubDashboardSlice';

import type {
  TournamentEvent,
  CreateTournamentEventRequest,
  RegisterForEventRequest,
  CreateTournamentMatchRequest,
  RecordMatchResultRequest,
  TournamentOrganizerPermissions,
} from '@/types/api';

interface TournamentEventManagementProps {
  tournamentId: string;
}

/* ─── Status config ── */
const EVENT_STATUS: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  draft: { label: 'Draft', dot: 'bg-white/30', text: 'text-white/50', bg: 'bg-white/[0.06]' },
  published: {
    label: 'Published',
    dot: 'bg-sky-400',
    text: 'text-sky-300',
    bg: 'bg-sky-500/[0.08]',
  },
  ongoing: {
    label: 'Ongoing',
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

const GROUP_STATUS: Record<string, { label: string; text: string; bg: string }> = {
  pending: { label: 'Pending', text: 'text-white/40', bg: 'bg-white/[0.05]' },
  in_progress: { label: 'In Progress', text: 'text-amber-400', bg: 'bg-amber-500/[0.08]' },
  completed: { label: 'Completed', text: 'text-emerald-400', bg: 'bg-emerald-500/[0.08]' },
};

/* ─── Small reusable pieces ── */
function StatusPill({ status }: { status: string }) {
  const cfg = EVENT_STATUS[status] ?? EVENT_STATUS.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/[0.06] ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function GroupPill({ status }: { status: string }) {
  const cfg = GROUP_STATUS[status] ?? GROUP_STATUS.pending;
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

/* ─── StatCard Component ── */
function StatCard({
  icon: Icon,
  label,
  value,
  meta,
  color,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  meta: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-lg p-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
          {label}
        </span>
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${color}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="flex items-end gap-2 justify-between">
        <div>
          <p className="text-lg font-bold text-white leading-none mb-1">{value}</p>
          <p className="text-[10px] text-white/30">{meta}</p>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-0.5 text-[10px] font-semibold ${
              trend === 'up'
                ? 'text-emerald-400'
                : trend === 'down'
                  ? 'text-red-400'
                  : 'text-amber-400'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            {trend === 'up' ? '+' : trend === 'down' ? '-' : '→'}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── EmptyState Component ── */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-white/15" />
      </div>
      <p className="text-sm font-semibold text-white/50 mb-2">{title}</p>
      <p className="text-xs text-white/25 max-w-xs mb-6 leading-relaxed">{description}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold px-4 py-2 rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

const TABS = [
  { id: 'events', label: 'Events', icon: Trophy },
  { id: 'registrations', label: 'Registrations', icon: Users },
  { id: 'groups', label: 'Groups', icon: BarChart3 },
  { id: 'matches', label: 'Matches', icon: Swords },
];

/* ─── Select styles shared ── */
const selTrigger =
  'h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white/70 px-3 focus:border-white/20 transition-colors w-full';
const selContent = 'bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl';
const selItem = 'text-white/70 focus:bg-white/[0.06] focus:text-white';
const inputCls =
  'h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/20 focus:border-white/20 transition-colors';
const labelCls = 'text-[11px] font-semibold uppercase tracking-widest text-white/35 mb-1.5 block';

/* ══════════════════════════════════════════════════════════════════ */

const TournamentEventManagement: React.FC<TournamentEventManagementProps> = ({ tournamentId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tournamentEvents, eventRegistrations, eventGroups, eventMatches, loading, error } =
    useSelector((state: RootState) => state.tournaments);
  const { profile } = useSelector((state: any) => state.clubDashboard);

  const [activeTab, setActiveTab] = useState('events');
  const [selectedEvent, setSelectedEvent] = useState<TournamentEvent | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [organizerPermissions, setOrganizerPermissions] = useState<
    TournamentOrganizerPermissions['data'] | null
  >(null);

  const [eventFormData, setEventFormData] = useState<CreateTournamentEventRequest>({
    skill_block: '2.5',
    gender: 'M',
    modality: 'Singles',
    max_participants: 64,
    minimum_participants: 8,
    format: 'hybrid',
    sets_format: 'best_of_3',
    seeding_method: 'ranking',
  });

  console.log('Event Registrations:', eventRegistrations);
  const [registrationData, setRegistrationData] = useState<RegisterForEventRequest>({
    user_id: '',
  });
  const [matchData, setMatchData] = useState<CreateTournamentMatchRequest>({
    player1_id: '',
    player2_id: '',
    match_format: 'best_of_3',
  });
  const [showRecordResultDialog, setShowRecordResultDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [matchResult, setMatchResult] = useState({ winner_id: '', score: '' });
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [registrationFilter, setRegistrationFilter] = useState('all');
  const [searchRegistrations, setSearchRegistrations] = useState('');

  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentEvents({ tournamentId }));
      loadPermissions();
    }
    if (!profile) dispatch(fetchClubProfile());
  }, [tournamentId, dispatch, profile]);

  // Debug: Log tournament events whenever they change
  useEffect(() => {
    if (tournamentEvents && tournamentEvents.length > 0) {
      console.log('Tournament Events Loaded:', tournamentEvents);
    } else if (!loading) {
      console.log('No tournament events found. Loading state:', loading);
    }
  }, [tournamentEvents, loading]);

  async function loadPermissions() {
    setOrganizerPermissions({
      can_create_tournaments: true,
      allowed_tournament_types: ['local', 'state', 'national'],
      max_participants_limit: 128,
      max_teams_limit: 16,
      can_create_paid_events: true,
      can_create_state_level: true,
      can_create_national_level: false,
      requires_approval: false,
      current_subscription_level: 'premium',
      upgrade_required_for: [],
    });
  }

  function selectEvent(event: TournamentEvent) {
    setSelectedEvent(event);
    dispatch(fetchTournamentEvent({ tournamentId, eventId: event.id }));
    dispatch(fetchEventRegistrations({ tournamentId, eventId: event.id }));
    if (event.groupsGenerated) {
      dispatch(fetchEventGroups({ tournamentId, eventId: event.id }));
      dispatch(fetchEventStandings({ tournamentId, eventId: event.id }));
    }
  }

  async function handleCreateEvent() {
    try {
      await dispatch(createTournamentEvent({ tournamentId, eventData: eventFormData })).unwrap();
      // Immediately re-fetch events to ensure UI is up-to-date
      dispatch(fetchTournamentEvents({ tournamentId }));
      setShowCreateDialog(false);
      setEventFormData({
        skill_block: '2.5',
        gender: 'M',
        modality: 'Singles',
        max_participants: 64,
        minimum_participants: 8,
        format: 'hybrid',
        sets_format: 'best_of_3',
        seeding_method: 'ranking',
      });
    } catch {}
  }

  async function handleGenerateGroups() {
    if (!selectedEvent) return;
    await dispatch(generateGroups({ tournamentId, eventId: selectedEvent.id }));
    dispatch(fetchTournamentEvent({ tournamentId, eventId: selectedEvent.id }));
    dispatch(fetchEventGroups({ tournamentId, eventId: selectedEvent.id }));
  }

  async function handleRegister() {
    if (!selectedEvent) return;
    try {
      const elig = await dispatch(checkRegistrationEligibility(registrationData.user_id)).unwrap();
      if ((elig as any)?.eligible) {
        await dispatch(
          registerForEvent({ tournamentId, eventId: selectedEvent.id, registrationData }),
        ).unwrap();
        setShowRegisterDialog(false);
        dispatch(fetchEventRegistrations({ tournamentId, eventId: selectedEvent.id }));
      }
    } catch {}
  }

  async function handleCreateMatch() {
    if (!selectedEvent) return;
    await dispatch(createTournamentMatch({ tournamentId, eventId: selectedEvent.id, matchData }));
    setShowMatchDialog(false);
    dispatch(fetchEventMatches({ tournamentId, eventId: selectedEvent.id }));
  }

  async function handleFinalizeGroup(groupId: string) {
    if (!selectedEvent) return;
    await dispatch(finalizeGroup({ tournamentId, eventId: selectedEvent.id, groupId }));
    dispatch(fetchEventGroups({ tournamentId, eventId: selectedEvent.id }));
  }

  async function handleRecordMatchResult() {
    if (!selectedMatch || !matchResult.winner_id) return;
    try {
      await dispatch(
        recordMatchResult({
          tournamentId,
          eventId: selectedEvent?.id || '',
          matchId: selectedMatch.id,
          data: {
            winner_id: matchResult.winner_id,
            score: matchResult.score,
          },
        } as any),
      ).unwrap();
      setShowRecordResultDialog(false);
      setSelectedMatch(null);
      setMatchResult({ winner_id: '', score: '' });
      dispatch(fetchEventMatches({ tournamentId, eventId: selectedEvent?.id || '' }));
    } catch (err) {
      console.error('Failed to record match result:', err);
    }
  }

  /* ─── Calculated stats ── */
  const totalRegistrations = eventRegistrations.length;
  const confirmedRegistrations = eventRegistrations.filter(
    (r: any) => r.status === 'confirmed',
  ).length;
  const pendingRegistrations = eventRegistrations.filter((r: any) => r.status === 'pending').length;
  const completedMatches = eventMatches.filter((m: any) => m.status === 'completed').length;
  const totalMatches = eventMatches.length;
  const registrationRate =
    selectedEvent && selectedEvent.max_participants
      ? Math.round((totalRegistrations / selectedEvent.max_participants) * 100)
      : 0;

  /* ─── Filtered registrations ── */
  const filteredRegistrations = eventRegistrations.filter((reg: any) => {
    const matchesFilter = registrationFilter === 'all' || reg.status === registrationFilter;
    const matchesSearch =
      !searchRegistrations ||
      reg.player?.name?.toLowerCase().includes(searchRegistrations.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  /* ── Skill block color ── */
  const skillColor = (s: string) => {
    const n = parseFloat(s);
    if (n >= 5.0) return 'text-[#ace600] bg-[#ace600]/10';
    if (n >= 4.5) return 'text-sky-400 bg-sky-400/10';
    if (n >= 4.0) return 'text-violet-400 bg-violet-400/10';
    if (n >= 3.5) return 'text-amber-400 bg-amber-400/10';
    return 'text-white/50 bg-white/[0.05]';
  };

  /* ── Render ── */
  return (
    <div className="space-y-6 p-1">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Event Management</h1>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600]">
              {tournamentEvents.length} {tournamentEvents.length === 1 ? 'Event' : 'Events'}
            </span>
          </div>
          <p className="text-sm text-white/35 mt-0.5">
            Configure events, groups, registrations & matches
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] active:scale-[0.98] text-black text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-[0_0_18px_rgba(172,230,0,0.18)] hover:shadow-[0_0_28px_rgba(172,230,0,0.32)]">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              New Event
            </button>
          </DialogTrigger>

          {/* ── Create event dialog ── */}
          <DialogContent className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-md shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
              <h2 className="text-base font-bold text-white">Create Tournament Event</h2>
              <p className="text-xs text-white/35 mt-1">Define skill block, format, and capacity</p>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {/* Skill block */}
                <div>
                  <label className={labelCls}>Skill Block</label>
                  <Select
                    value={eventFormData.skill_block}
                    onValueChange={(v) => setEventFormData({ ...eventFormData, skill_block: v })}
                  >
                    <SelectTrigger className={selTrigger}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={selContent}>
                      {['2.5', '3.5', '4.5', '5+'].map((s) => (
                        <SelectItem key={s} value={s} className={selItem}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Gender */}
                <div>
                  <label className={labelCls}>Gender</label>
                  <Select
                    value={eventFormData.gender}
                    onValueChange={(v: any) => setEventFormData({ ...eventFormData, gender: v })}
                  >
                    <SelectTrigger className={selTrigger}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={selContent}>
                      {['male', 'female', 'mixed'].map((g) => (
                        <SelectItem
                          key={g}
                          value={
                            g === 'mixed'
                              ? g.charAt(0).toUpperCase() + g.slice(1)
                              : g.charAt(0).toUpperCase()
                          }
                          className={selItem}
                        >
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Modality */}
              <div>
                <label className={labelCls}>Modality</label>
                <Select
                  value={eventFormData.modality}
                  onValueChange={(v: any) => setEventFormData({ ...eventFormData, modality: v })}
                >
                  <SelectTrigger className={selTrigger}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selContent}>
                    {['Singles', 'Doubles', 'Mixed'].map((m) => (
                      <SelectItem key={m} value={m} className={selItem}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Format */}
              <div>
                <label className={labelCls}>Format</label>
                <Select
                  value={eventFormData.format}
                  onValueChange={(v: any) => setEventFormData({ ...eventFormData, format: v })}
                >
                  <SelectTrigger className={selTrigger}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selContent}>
                    <SelectItem value="hybrid" className={selItem}>
                      Hybrid
                    </SelectItem>
                    <SelectItem value="single_elimination" className={selItem}>
                      Single Elimination
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Sets format */}
              <div>
                <label className={labelCls}>Sets Format</label>
                <Select
                  value={eventFormData.sets_format}
                  onValueChange={(v: any) => setEventFormData({ ...eventFormData, sets_format: v })}
                >
                  <SelectTrigger className={selTrigger}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selContent}>
                    <SelectItem value="best_of_3" className={selItem}>
                      Best of 3
                    </SelectItem>
                    <SelectItem value="best_of_5" className={selItem}>
                      Best of 5
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Participants */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Max Participants</label>
                  <Input
                    type="number"
                    value={eventFormData.max_participants}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        max_participants: parseInt(e.target.value),
                      })
                    }
                    className={inputCls}
                    min={1}
                    max={organizerPermissions?.max_participants_limit ?? 64}
                  />
                  <p className="text-[10px] text-white/25 mt-1">
                    Limit: {organizerPermissions?.max_participants_limit ?? 64}
                  </p>
                </div>
                <div>
                  <label className={labelCls}>Min Participants</label>
                  <Input
                    type="number"
                    value={eventFormData.minimum_participants}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        minimum_participants: parseInt(e.target.value),
                      })
                    }
                    className={inputCls}
                    min={2}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 px-6 pb-6 pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold transition-all shadow-[0_0_16px_rgba(172,230,0,0.2)]"
              >
                Create Event
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Permissions bar ── */}
      {organizerPermissions && (
        <div className="flex flex-wrap gap-3 p-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] rounded-lg border border-white/[0.06]">
            <Star className="w-3 h-3 text-[#ace600]" />
            <span className="text-[11px] font-semibold text-white/50">
              <span className="text-white/80 capitalize">
                {organizerPermissions.current_subscription_level}
              </span>{' '}
              plan
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] rounded-lg border border-white/[0.06]">
            <Users className="w-3 h-3 text-white/30" />
            <span className="text-[11px] font-semibold text-white/50">
              Up to{' '}
              <span className="text-white/80">{organizerPermissions.max_participants_limit}</span>{' '}
              participants
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] rounded-lg border border-white/[0.06]">
            <Shield className="w-3 h-3 text-white/30" />
            <span className="text-[11px] font-semibold text-white/50">
              {organizerPermissions.requires_approval ? (
                'Approval required'
              ) : (
                <span className="text-emerald-400">No approval needed</span>
              )}
            </span>
          </div>
          {organizerPermissions.can_create_paid_events && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ace600]/[0.06] rounded-lg border border-[#ace600]/20">
              <Zap className="w-3 h-3 text-[#ace600]" />
              <span className="text-[11px] font-semibold text-[#ace600]/80">
                Paid events enabled
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-white/[0.06]">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold transition-all border-b-2 -mb-px ${
                activeTab === id
                  ? 'text-[#ace600] border-[#ace600]'
                  : 'text-white/35 border-transparent hover:text-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {id === 'events' && tournamentEvents.length > 0 && (
                <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40">
                  {tournamentEvents.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Events tab ── */}
        {activeTab === 'events' && (
          <div className="p-5">
            {/* Debug info */}
            <div className="mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.07]">
              <p className="text-xs text-white/50">
                <span className="font-semibold">Events Count:</span> {tournamentEvents?.length || 0}{' '}
                |<span className="font-semibold ml-3">Loading:</span> {loading ? 'Yes' : 'No'} |
                <span className="font-semibold ml-3">TournamentId:</span> {tournamentId}
              </p>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
                <p className="text-sm text-white/25">Loading events…</p>
              </div>
            )}
            {!loading && tournamentEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-white/50 font-semibold text-sm mb-1">No events yet</p>
                <p className="text-white/20 text-xs max-w-xs mb-5">
                  Create your first event to begin structuring this tournament.
                </p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold px-4 py-2 rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Event
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {(tournamentEvents as TournamentEvent[]).map((event) => {
                const fillPct = Math.min(
                  100,
                  ((event.current_participants ?? event.participantCount ?? 0) /
                    event.max_participants) *
                    100,
                );
                const isSelected = selectedEvent?.id === event.id;
                return (
                  <button
                    key={event.id}
                    onClick={() => {
                      selectEvent(event);
                      setActiveTab('registrations');
                    }}
                    className={`text-left p-4 rounded-xl border transition-all group ${
                      isSelected
                        ? 'bg-[#ace600]/[0.04] border-[#ace600]/40'
                        : 'bg-white/[0.02] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span
                          className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${skillColor(event.skill_block)}`}
                        >
                          {event.skill_block}
                        </span>
                      </div>
                      <StatusPill status={event.registration_status || 'open'} />
                    </div>

                    {/* Name */}
                    <div className="mb-3">
                      <p className="text-sm font-bold text-white leading-tight capitalize">
                        {event.modality} —{' '}
                        {event.gender === 'M'
                          ? 'Male'
                          : event.gender === 'F'
                            ? 'Female'
                            : event.gender}
                      </p>
                      <p className="text-[11px] text-white/35 mt-0.5 capitalize">
                        {event.format.replace(/_/g, ' ')} · {event.sets_format.replace(/_/g, ' ')}
                      </p>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5 text-white/50 text-xs">
                        <Users className="w-3 h-3" />
                        <span className="font-medium">
                          {event.current_participants ?? event.participantCount ?? 0}
                          <span className="text-white/25">/{event.max_participants}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/50 text-xs">
                        <Hash className="w-3 h-3" />
                        <span className="font-medium">
                          {event.number_of_groups ?? event.groupCount ?? 0}{' '}
                          <span className="text-white/25">groups</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1 rounded-full bg-white/[0.07] overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full bg-[#ace600]/60 transition-all"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      {event.groupsGenerated ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateGroups();
                          }}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          <Play className="w-3 h-3" /> Regenerate Groups
                        </button>
                      ) : (
                        <span className="text-[11px] text-white/20">Groups pending</span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-all ${isSelected ? 'text-[#ace600]' : 'text-white/20 group-hover:text-white/40'}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Registrations tab ── */}
        {activeTab === 'registrations' && (
          <div className="p-5 space-y-4">
            {/* Selected event with stats */}
            {selectedEvent && (
              <div className="space-y-3">
                {/* Event header banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-[#ace600]/10 to-white/[0.02] border border-white/[0.07] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#ace600]/20 border border-[#ace600]/30 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-[#ace600]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white capitalize">
                        {selectedEvent.skill_block} {selectedEvent.modality}
                        <span className="text-white/40 ml-2">•</span>
                        <span className="text-white/40 ml-2 font-normal text-xs">
                          {selectedEvent.gender}
                        </span>
                      </p>
                      <p className="text-[11px] text-white/35">
                        {selectedEvent.format.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEventDetailsModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] text-white/50 hover:text-white text-xs font-semibold rounded-lg transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] active:scale-95 text-black text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-[0_0_12px_rgba(172,230,0,0.15)]">
                          <Plus className="w-3.5 h-3.5" /> Register Player
                        </button>
                      </DialogTrigger>
                      <DialogContent className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm shadow-2xl overflow-hidden">
                        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                          <h2 className="text-base font-bold text-white">Register Player</h2>
                          <p className="text-xs text-white/35 mt-1">Add a player to this event</p>
                        </div>
                        <div className="px-6 py-5 space-y-3">
                          <div>
                            <label className={labelCls}>User ID</label>
                            <Input
                              value={registrationData.user_id}
                              onChange={(e) =>
                                setRegistrationData({
                                  ...registrationData,
                                  user_id: e.target.value,
                                })
                              }
                              placeholder="Enter user ID"
                              className={inputCls}
                            />
                          </div>
                          {selectedEvent.modality !== 'Singles' && (
                            <div>
                              <label className={labelCls}>
                                Partner User ID{' '}
                                <span className="normal-case text-white/20">(optional)</span>
                              </label>
                              <Input
                                value={(registrationData as any).partner_user_id || ''}
                                onChange={(e) =>
                                  setRegistrationData({
                                    ...registrationData,
                                    partner_user_id: e.target.value,
                                  } as any)
                                }
                                placeholder="Enter partner ID"
                                className={inputCls}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2.5 px-6 pb-6 pt-2 border-t border-white/[0.06]">
                          <button
                            onClick={() => setShowRegisterDialog(false)}
                            className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 text-sm font-semibold transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleRegister}
                            className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold transition-all"
                          >
                            Register
                          </button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Quick stats for selected event */}
                <div className="grid grid-cols-4 gap-2">
                  <StatCard
                    icon={Users}
                    label="Registrations"
                    value={totalRegistrations}
                    meta={`${registrationRate}% capacity`}
                    color="bg-sky-500/10 border-sky-500/20 text-sky-400"
                    trend={totalRegistrations > 0 ? 'up' : 'neutral'}
                  />
                  <StatCard
                    icon={CheckCircle}
                    label="Confirmed"
                    value={confirmedRegistrations}
                    meta={`${totalRegistrations > 0 ? Math.round((confirmedRegistrations / totalRegistrations) * 100) : 0}% of total`}
                    color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  />
                  <StatCard
                    icon={Swords}
                    label="Pending"
                    value={pendingRegistrations}
                    meta={`waiting`}
                    color="bg-amber-500/10 border-amber-500/20 text-amber-400"
                  />
                  <StatCard
                    icon={Target}
                    label="Capacity"
                    value={`${registrationRate}%`}
                    meta={`of ${selectedEvent.max_participants}`}
                    color="bg-violet-500/10 border-violet-500/20 text-violet-400"
                  />
                </div>
              </div>
            )}

            {/* Registrations filter bar */}
            {eventRegistrations.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                  <input
                    type="text"
                    placeholder="Search players…"
                    value={searchRegistrations}
                    onChange={(e) => setSearchRegistrations(e.target.value)}
                    className={`${inputCls} pl-9 w-full`}
                  />
                </div>
                <select
                  value={registrationFilter}
                  onChange={(e) => setRegistrationFilter(e.target.value)}
                  className={`${selTrigger} min-w-[140px]`}
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
            )}

            {/* Registrations table */}
            {filteredRegistrations.length > 0 && (
              <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {['Player', 'Partner', 'Status', 'Date'].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/25"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredRegistrations as any[]).map((reg, i) => {
                      const last = i === filteredRegistrations.length - 1;
                      const statusColor =
                        reg.status === 'confirmed'
                          ? 'text-emerald-400 bg-emerald-500/[0.08]'
                          : reg.status === 'withdrawn'
                            ? 'text-red-400 bg-red-500/[0.08]'
                            : 'text-amber-400 bg-amber-500/[0.08]';
                      return (
                        <tr
                          key={reg.id}
                          className={`hover:bg-white/[0.02] transition-colors ${!last ? 'border-b border-white/[0.04]' : ''}`}
                        >
                          <td className="px-4 py-3 text-white/80 text-xs font-medium">
                            {reg.player.name}
                          </td>
                          <td className="px-4 py-3 text-white/40 text-xs">
                            {reg.partner?.name || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize ${statusColor}`}
                            >
                              {reg.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/30 text-xs">
                            {new Date(reg.registeredAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {selectedEvent && eventRegistrations.length === 0 && (
              <EmptyState
                icon={Users}
                title="No registrations yet"
                description="Players will appear here once they register for this event"
                action={() => setShowRegisterDialog(true)}
                actionLabel="Register Player"
              />
            )}

            {selectedEvent &&
              filteredRegistrations.length === 0 &&
              eventRegistrations.length > 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Filter className="w-8 h-8 text-white/10 mb-3" />
                  <p className="text-sm text-white/30">No matches found</p>
                  <p className="text-xs text-white/20 mt-1">Try adjusting your filters</p>
                </div>
              )}
          </div>
        )}

        {/* ── Groups tab ── */}
        {activeTab === 'groups' && (
          <div className="p-5 space-y-4">
            {!selectedEvent && (
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center">
                <p className="text-xs text-white/30">Select an event from the Events tab first</p>
              </div>
            )}

            {selectedEvent && !(selectedEvent.number_of_groups > 0) && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-5">
                  <Target className="w-7 h-7 text-white/20" />
                </div>
                <p className="text-white/60 font-semibold text-sm mb-1">Groups not generated</p>
                <p className="text-white/25 text-xs mb-6 max-w-xs">
                  Once enough players are registered, generate groups to begin the round-robin
                  phase.
                </p>
                <button
                  onClick={handleGenerateGroups}
                  className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_18px_rgba(172,230,0,0.18)]"
                >
                  <Play className="w-4 h-4" /> Generate Groups
                </button>
              </div>
            )}

            {selectedEvent &&
              (selectedEvent.number_of_groups || selectedEvent.groupCount || 0) > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white capitalize">
                        {selectedEvent.skill_block} {selectedEvent.modality}
                      </p>
                      <p className="text-[11px] text-white/35">
                        {selectedEvent?.number_of_groups} groups generated
                      </p>
                    </div>
                    <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.08] text-white/70 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all">
                          <Plus className="w-3.5 h-3.5" /> Create Match
                        </button>
                      </DialogTrigger>
                      <DialogContent className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm shadow-2xl overflow-hidden">
                        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                          <h2 className="text-base font-bold text-white">Create Match</h2>
                          <p className="text-xs text-white/35 mt-1">
                            Schedule a new match for this event
                          </p>
                        </div>
                        <div className="px-6 py-5 space-y-3">
                          {[
                            ['Player 1 ID', 'player1_id', 'player1_id'],
                            ['Player 2 ID', 'player2_id', 'player2_id'],
                            ['Group ID', 'group_id', 'group_id (optional)'],
                          ].map(([lbl, key, ph]) => (
                            <div key={key}>
                              <label className={labelCls}>{lbl}</label>
                              <Input
                                value={(matchData as any)[key] || ''}
                                onChange={(e) =>
                                  setMatchData({ ...matchData, [key]: e.target.value } as any)
                                }
                                placeholder={ph}
                                className={inputCls}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2.5 px-6 pb-6 pt-2 border-t border-white/[0.06]">
                          <button
                            onClick={() => setShowMatchDialog(false)}
                            className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 text-sm font-semibold transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateMatch}
                            className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold transition-all"
                          >
                            Create
                          </button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(eventGroups as any[]).map((group) => {
                      const pct = group.completionPercent ?? 0;
                      return (
                        <div
                          key={group.id}
                          className="p-4 bg-white/[0.02] border border-white/[0.07] rounded-xl hover:border-white/15 transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/60">
                                {group.groupNumber}
                              </div>
                              <span className="text-sm font-semibold text-white/80">
                                Group {group.groupNumber}
                              </span>
                            </div>
                            <GroupPill status={group.status} />
                          </div>
                          <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3 h-3" />
                              {group.playerCount} players
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {group.matchesCompleted}/{group.totalMatches} matches
                            </span>
                          </div>
                          <div className="mb-3">
                            <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
                              <span>Progress</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#ace600]/60 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          {group.status !== 'completed' && (
                            <button
                              onClick={() => handleFinalizeGroup(group.id)}
                              className="w-full flex items-center justify-center gap-2 h-8 rounded-lg bg-emerald-500/[0.08] hover:bg-emerald-500/[0.14] border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-all"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Finalize Group
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
          </div>
        )}

        {/* ── Matches tab ── */}
        {activeTab === 'matches' && (
          <div className="p-5">
            {!selectedEvent && (
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center">
                <p className="text-xs text-white/30">Select an event from the Events tab first</p>
              </div>
            )}

            {selectedEvent && eventMatches.length === 0 && (
              <EmptyState
                icon={Swords}
                title="No matches scheduled yet"
                description="Matches will be created once groups are generated"
                action={handleGenerateGroups}
                actionLabel="Generate Groups"
              />
            )}

            {selectedEvent && eventMatches.length > 0 && (
              <div className="bg-white/[0.01] border border-white/[0.06] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {['Match', 'Status', 'Score', 'Action'].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/25"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(eventMatches as any[]).map((match, i) => {
                      const last = i === eventMatches.length - 1;
                      const done = match.status === 'completed';
                      const score =
                        match.setScores?.length > 0
                          ? match.setScores.map((s: any) => `${s.player1}–${s.player2}`).join(', ')
                          : '—';
                      return (
                        <tr
                          key={match.id}
                          className={`hover:bg-white/[0.02] transition-colors ${!last ? 'border-b border-white/[0.04]' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <div className="text-white/80 text-xs font-medium">
                              {match.player1.name}
                            </div>
                            <div className="text-white/30 text-[11px]">vs {match.player2.name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${done ? 'text-emerald-400 bg-emerald-500/[0.08]' : 'text-amber-400 bg-amber-500/[0.08]'}`}
                            >
                              {done ? 'Completed' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/50 text-xs font-mono">{score}</td>
                          <td className="px-4 py-3">
                            {!done && (
                              <button
                                onClick={() => {
                                  setSelectedMatch(match);
                                  setShowRecordResultDialog(true);
                                }}
                                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#ace600] hover:text-[#c0f000] transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Record Result
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Record Match Result Dialog ── */}
      <Dialog open={showRecordResultDialog} onOpenChange={setShowRecordResultDialog}>
        <DialogContent className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-md shadow-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
            <h2 className="text-base font-bold text-white">Record Match Result</h2>
            <p className="text-xs text-white/35 mt-1">Enter the match outcome and score</p>
          </div>
          {selectedMatch && (
            <div className="px-6 py-5 space-y-4">
              {/* Match overview */}
              <div className="p-3 bg-white/[0.02] border border-white/[0.07] rounded-xl">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                  Match
                </p>
                <p className="text-sm text-white/80 font-medium">
                  {selectedMatch.player1?.name} vs {selectedMatch.player2?.name}
                </p>
              </div>

              {/* Winner selection */}
              <div>
                <label className={labelCls}>Match Winner</label>
                <Select
                  value={matchResult.winner_id}
                  onValueChange={(v) => setMatchResult({ ...matchResult, winner_id: v })}
                >
                  <SelectTrigger className={selTrigger}>
                    <SelectValue placeholder="Select winner" />
                  </SelectTrigger>
                  <SelectContent className={selContent}>
                    <SelectItem value={selectedMatch.player1?.id || ''} className={selItem}>
                      {selectedMatch.player1?.name}
                    </SelectItem>
                    <SelectItem value={selectedMatch.player2?.id || ''} className={selItem}>
                      {selectedMatch.player2?.name}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Score */}
              <div>
                <label className={labelCls}>Score (e.g., "11-9, 11-8")</label>
                <Input
                  value={matchResult.score}
                  onChange={(e) => setMatchResult({ ...matchResult, score: e.target.value })}
                  placeholder="11-9, 11-8, 11-6"
                  className={inputCls}
                />
              </div>

              {/* Info */}
              <div className="p-3 bg-emerald-500/[0.05] border border-emerald-500/12 rounded-xl">
                <p className="text-[11px] text-emerald-400/70 leading-relaxed">
                  Mark this match as completed. The winner will advance if applicable.
                </p>
              </div>
            </div>
          )}
          <div className="flex gap-2.5 px-6 pb-6 pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => setShowRecordResultDialog(false)}
              className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleRecordMatchResult}
              disabled={!matchResult.winner_id}
              className="flex-1 h-9 rounded-xl bg-emerald-500/70 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold transition-all"
            >
              Save Result
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Event Details Modal ── */}
      <Dialog open={showEventDetailsModal} onOpenChange={setShowEventDetailsModal}>
        <DialogContent className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                <h2 className="text-base font-bold text-white">{selectedEvent.skill_block}</h2>
                <p className="text-xs text-white/35 mt-1">
                  {selectedEvent.modality} • {selectedEvent.gender}
                </p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-xs text-white/40">Format</span>
                    <span className="text-xs font-semibold text-white/80 capitalize">
                      {selectedEvent.format.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-xs text-white/40">Sets</span>
                    <span className="text-xs font-semibold text-white/80 capitalize">
                      {selectedEvent.sets_format.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-xs text-white/40">Capacity</span>
                    <span className="text-xs font-semibold text-white/80">
                      {selectedEvent.current_participants || 0}/{selectedEvent.max_participants}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-xs text-white/40">Groups</span>
                    <span className="text-xs font-semibold text-white/80">
                      {selectedEvent.number_of_groups || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-white/40">Status</span>
                    <span className="text-xs font-semibold text-[#ace600]">Active</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5 px-6 pb-6 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => setShowEventDetailsModal(false)}
                  className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Global loading ── */}
      {loading && (
        <div className="flex items-center justify-center gap-2.5 py-4">
          <Loader2 className="w-4 h-4 text-[#ace600] animate-spin" />
          <span className="text-xs text-white/30">Updating…</span>
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex gap-3 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-red-400 font-medium">{error}</p>
            <button
              onClick={() =>
                selectedEvent &&
                dispatch(fetchEventRegistrations({ tournamentId, eventId: selectedEvent.id }))
              }
              className="text-[10px] text-red-400/60 hover:text-red-400 mt-1 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentEventManagement;
