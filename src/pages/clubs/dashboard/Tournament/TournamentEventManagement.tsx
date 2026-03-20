import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getGenderLabel,
  getModalityLabel,
  getFormatLabel,
  getSetsFormatLabel,
  getRegistrationStatusLabel,
  parseRegistrationError,
} from '@/utils/formatters';
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
  AlertCircle,
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
  CalendarDays,
  Trash2,
} from 'lucide-react';

import { AppDispatch, RootState } from '@/store';
import {
  fetchTournamentEvents,
  fetchTournamentEvent,
  createTournamentEvent,
  deleteTournamentEvent,
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
  clearTournamentEvents,
  clearEventGroups,
  clearEventMatches,
  clearEventRegistrations,
} from '@/store/slices/tournamentsSlice';
import { fetchClubProfile } from '@/store/slices/clubDashboardSlice';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/payment/StripeProvider';
import { PaymentForm } from '@/components/payment/PaymentForm';
import PaymentService from '@/services/paymentService';

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
const EVENT_STATUS: Record<string, { labelKey: string; dot: string; text: string; bg: string }> = {
  draft: { labelKey: 'event_status.draft', dot: 'bg-white/30', text: 'text-white/50', bg: 'bg-white/[0.06]' },
  published: {
    labelKey: 'event_status.published',
    dot: 'bg-sky-400',
    text: 'text-sky-300',
    bg: 'bg-sky-500/[0.08]',
  },
  ongoing: {
    labelKey: 'event_status.ongoing',
    dot: 'bg-[#ace600]',
    text: 'text-[#ace600]',
    bg: 'bg-[#ace600]/[0.08]',
  },
  completed: {
    labelKey: 'event_status.completed',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/[0.08]',
  },
  cancelled: {
    labelKey: 'event_status.cancelled',
    dot: 'bg-red-400',
    text: 'text-red-400',
    bg: 'bg-red-500/[0.08]',
  },
};

const GROUP_STATUS: Record<string, { labelKey: string; text: string; bg: string }> = {
  pending: { labelKey: 'group_status.pending', text: 'text-white/40', bg: 'bg-white/[0.05]' },
  in_progress: { labelKey: 'group_status.in_progress', text: 'text-amber-400', bg: 'bg-amber-500/[0.08]' },
  completed: { labelKey: 'group_status.completed', text: 'text-emerald-400', bg: 'bg-emerald-500/[0.08]' },
};

/* ─── Small reusable pieces ── */
function StatusPill({ status }: { status: string }) {
  const { t } = useTranslation();
  const cfg = EVENT_STATUS[status] ?? EVENT_STATUS.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/[0.06] ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {t(cfg.labelKey)}
    </span>
  );
}

function GroupPill({ status }: { status: string }) {
  const { t } = useTranslation();
  const cfg = GROUP_STATUS[status] ?? GROUP_STATUS.pending;
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.text}`}
    >
      {t(cfg.labelKey)}
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
  // { id: 'registrations', label: 'Registrations', icon: Users },
  // { id: 'groups', label: 'Groups', icon: BarChart3 },
  // { id: 'matches', label: 'Matches', icon: Swords },
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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tournamentEvents, eventRegistrations, eventGroups, eventMatches, loading, error } =
    useSelector((state: RootState) => state.tournaments);
  const { profile } = useSelector((state: any) => state.clubDashboard);

  const [activeTab, setActiveTab] = useState('events');
  const [selectedEvent, setSelectedEvent] = useState<TournamentEvent | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TournamentEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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

  // Payment step state for the Register Player dialog
  const [registerStep, setRegisterStep] = useState<'form' | 'payment'>('form');
  const [regPaymentData, setRegPaymentData] = useState<{
    paymentId: string;
    clientSecret: string;
  } | null>(null);
  const [regPaymentError, setRegPaymentError] = useState<string | null>(null);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      setSelectedEvent(null);
      dispatch(clearTournamentEvents());
      dispatch(clearEventGroups());
      dispatch(clearEventMatches());
      dispatch(clearEventRegistrations());
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

  // Step 1: check eligibility then create Stripe payment intent
  async function handleRegister() {
    if (!selectedEvent) return;
    setRegPaymentError(null);
    setIsInitializingPayment(true);
    try {
      const elig = await dispatch(checkRegistrationEligibility(registrationData.user_id)).unwrap();
      if (!(elig as any)?.eligible) {
        // Parse the error message and get translation key and data
        const errorMsg = (elig as any)?.message || 'Player is not eligible for this event.';
        const { key, data } = parseRegistrationError(errorMsg);
        const translatedError = String(t(key, data));
        setRegPaymentError(translatedError);
        return;
      }
      const res = await PaymentService.createPaymentIntent({
        amount: 5000, // MXN $50.00 in cents — update when entry_fee is on TournamentEvent
        payment_type: 'tournament_registration',
        currency: 'mxn',
        description: `${selectedEvent.skill_block} ${selectedEvent.gender}'s ${selectedEvent.modality} — Registration`,
        metadata: {
          tournament_id: tournamentId,
          tournament_event_id: selectedEvent.id,
          player_user_id: registrationData.user_id,
        },
      });
      if (!res.success || !res.data) throw new Error('Failed to initialize payment');
      setRegPaymentData({ paymentId: res.data.payment_id, clientSecret: res.data.client_secret });
      setRegisterStep('payment');
    } catch (err: any) {
      // Parse error message for translation
      const errorMsg = err.message || 'Failed to proceed to payment';
      const { key, data } = parseRegistrationError(errorMsg);
      const translatedError = String(key === 'registration_errors.generic' ? t(key) : t(key, data));
      setRegPaymentError(translatedError);
    } finally {
      setIsInitializingPayment(false);
    }
  }

  // Step 2: after Stripe payment succeeds, complete the registration
  async function handleRegisterAfterPayment(paymentIntentId: string) {
    if (!selectedEvent) return;
    try {
      await dispatch(
        registerForEvent({
          tournamentId,
          eventId: selectedEvent.id,
          registrationData: { ...registrationData, stripe_payment_intent_id: paymentIntentId } as any,
        }),
      ).unwrap();
      setShowRegisterDialog(false);
      setRegisterStep('form');
      setRegPaymentData(null);
      setRegPaymentError(null);
      setRegistrationData({ user_id: '' });
      dispatch(fetchEventRegistrations({ tournamentId, eventId: selectedEvent.id }));
    } catch (err: any) {
      // Parse error message for translation
      const errorMsg = err.message || 'Registration failed after payment';
      const { key, data } = parseRegistrationError(errorMsg);
      const translatedError = String(
        key === 'registration_errors.generic'
          ? t('registration_errors.payment_failed')
          : t(key, data)
      );
      setRegPaymentError(translatedError);
    }
  }

  // Reset payment state whenever the dialog is closed
  function handleCloseRegisterDialog(open: boolean) {
    if (!open) {
      setRegisterStep('form');
      setRegPaymentData(null);
      setRegPaymentError(null);
    }
    setShowRegisterDialog(open);
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

  async function handleDeleteEvent() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await dispatch(deleteTournamentEvent({ tournamentId, eventId: deleteTarget.id })).unwrap();
      if (selectedEvent?.id === deleteTarget.id) setSelectedEvent(null);
      setDeleteTarget(null);
      dispatch(fetchTournamentEvents({ tournamentId }));
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
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

  console.log('++++++++++++++++', eventMatches);


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
            <h1 className="text-2xl font-bold text-white tracking-tight">{t('tournament_event_management.page_title')}</h1>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600]">
              {tournamentEvents.length} {tournamentEvents.length === 1 ? 'Evento' : 'Eventos'}
            </span>
          </div>
          <p className="text-sm text-white/35 mt-0.5">
            {t('tournament_event_management.page_subtitle')}
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] active:scale-[0.98] text-black text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-[0_0_18px_rgba(172,230,0,0.18)] hover:shadow-[0_0_28px_rgba(172,230,0,0.32)]">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              {t('tournament_event_management.new_event_btn')}
            </button>
          </DialogTrigger>

          {/* ── Create event dialog ── */}
          <DialogContent className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-md shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
              <h2 className="text-base font-bold text-white">{t('tournament_event_management.create_event_title')}</h2>
              <p className="text-xs text-white/35 mt-1">{t('tournament_event_management.create_event_desc')}</p>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {/* Skill block */}
                <div>
                  <label className={labelCls}>{t('tournament_event_management.field_skill_block')}</label>
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
                  <label className={labelCls}>{t('tournament_event_management.field_gender')}</label>
                  <Select
                    value={eventFormData.gender}
                    onValueChange={(v: any) => setEventFormData({ ...eventFormData, gender: v })}
                  >
                    <SelectTrigger className={selTrigger}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={selContent}>
                      <SelectItem value="M" className={selItem}>
                        {t('gender.male')}
                      </SelectItem>
                      <SelectItem value="F" className={selItem}>
                        {t('gender.female')}
                      </SelectItem>
                      <SelectItem value="MX" className={selItem}>
                        {t('gender.mixed')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Modality */}
              <div>
                <label className={labelCls}>{t('tournament_event_management.field_modality')}</label>
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
                        {m === 'Singles' ? t('tournament_event_management.modality_singles') : m === 'Doubles' ? t('tournament_event_management.modality_doubles') : t('tournament_event_management.modality_mixed')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Format */}
              <div>
                <label className={labelCls}>{t('tournament_event_management.field_format')}</label>
                <Select
                  value={eventFormData.format}
                  onValueChange={(v: any) => setEventFormData({ ...eventFormData, format: v })}
                >
                  <SelectTrigger className={selTrigger}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selContent}>
                    <SelectItem value="hybrid" className={selItem}>
                      {t('tournament_event_management.format_hybrid')}
                    </SelectItem>
                    <SelectItem value="single_elimination" className={selItem}>
                      {t('tournament_event_management.format_single_elimination')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Sets format */}
              <div>
                <label className={labelCls}>{t('tournament_event_management.field_sets_format')}</label>
                <Select
                  value={eventFormData.sets_format}
                  onValueChange={(v: any) => setEventFormData({ ...eventFormData, sets_format: v })}
                >
                  <SelectTrigger className={selTrigger}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selContent}>
                    <SelectItem value="best_of_3" className={selItem}>
                      {t('tournament_event_management.sets_best_of_3')}
                    </SelectItem>
                    <SelectItem value="best_of_5" className={selItem}>
                      {t('tournament_event_management.sets_best_of_5')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Participants */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t('tournament_event_management.field_max_participants')}</label>
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
                    {t('tournament_event_management.max_limit')}: {organizerPermissions?.max_participants_limit ?? 64}
                  </p>
                </div>
                <div>
                  <label className={labelCls}>{t('tournament_event_management.field_min_participants')}</label>
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
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreateEvent}
                className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold transition-all shadow-[0_0_16px_rgba(172,230,0,0.2)]"
              >
                {t('tournament_event_management.btn_create_event')}
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
                {t(`subscription.${organizerPermissions.current_subscription_level}`)}
              </span>{' '}
              {t('subscription.plan')}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] rounded-lg border border-white/[0.06]">
            <Users className="w-3 h-3 text-white/30" />
            <span className="text-[11px] font-semibold text-white/50">
              {t('permissions.up_to')}{' '}
              <span className="text-white/80">{organizerPermissions.max_participants_limit}</span>{' '}
              {t('permissions.participants')}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] rounded-lg border border-white/[0.06]">
            <Shield className="w-3 h-3 text-white/30" />
            <span className="text-[11px] font-semibold text-white/50">
              {organizerPermissions.requires_approval ? (
                t('permissions.approval_required')
              ) : (
                <span className="text-emerald-400">{t('permissions.no_approval_needed')}</span>
              )}
            </span>
          </div>
          {organizerPermissions.can_create_paid_events && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ace600]/[0.06] rounded-lg border border-[#ace600]/20">
              <Zap className="w-3 h-3 text-[#ace600]" />
              <span className="text-[11px] font-semibold text-[#ace600]/80">
                {t('permissions.paid_events_enabled')}
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
              {t(`tabs.${id}`)}
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
                <span className="font-semibold">Cantidad de Eventos:</span> {tournamentEvents?.length || 0}{' '}
                |<span className="font-semibold ml-3">Cargando:</span> {loading ? 'Sí' : 'No'} |
                <span className="font-semibold ml-3">ID de Torneo:</span> {tournamentId}
              </p>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
                <p className="text-sm text-white/25">{t('tournament_event_management.loading_events')}</p>
              </div>
            )}
            {!loading && tournamentEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-white/50 font-semibold text-sm mb-1">{t('tournament_event_management.no_events_title')}</p>
                <p className="text-white/20 text-xs max-w-xs mb-5">
                  {t('tournament_event_management.no_events_desc')}
                </p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold px-4 py-2 rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('tournament_event_management.btn_create_event')}
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
                      <p className="text-sm font-bold text-white leading-tight">
                        {getModalityLabel(event.modality)} —{' '}
                        {getGenderLabel(event.gender)}
                      </p>
                      <p className="text-[11px] text-white/35 mt-0.5">
                        {getFormatLabel(event.format)} · {getSetsFormatLabel(event.sets_format)}
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
                          <span className="text-white/25">{t('tournament_event_management.groups')}</span>
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
                          <Play className="w-3 h-3" /> {t('tournament_event_management.btn_regenerate_groups')}
                        </button>
                      ) : (
                        <span className="text-[11px] text-white/20">{t('tournament_event_management.groups_pending')}</span>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteError(null);
                            setDeleteTarget(event);
                          }}
                          className="p-1 rounded-md text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title={t('tournament_event_management.delete_event_tooltip')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-all ${isSelected ? 'text-[#ace600]' : 'text-white/20 group-hover:text-white/40'}`}
                        />
                      </div>
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
                      <p className="text-sm font-bold text-white">
                        {selectedEvent.skill_block} {getModalityLabel(selectedEvent.modality)}
                        <span className="text-white/40 ml-2">•</span>
                        <span className="text-white/40 ml-2 font-normal text-xs">
                          {getGenderLabel(selectedEvent.gender)}
                        </span>
                      </p>
                      <p className="text-[11px] text-white/35">
                        {getFormatLabel(selectedEvent.format)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEventDetailsModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] text-white/50 hover:text-white text-xs font-semibold rounded-lg transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> {t('tournament_event_management.btn_details')}
                    </button>
                    <Dialog open={showRegisterDialog} onOpenChange={handleCloseRegisterDialog}>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] active:scale-95 text-black text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-[0_0_12px_rgba(172,230,0,0.15)]">
                          <Plus className="w-3.5 h-3.5" /> {t('tournament_event_management.btn_register_player')}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm shadow-2xl overflow-hidden">
                        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                          <h2 className="text-base font-bold text-white">
                            {registerStep === 'form' ? t('tournament_event_management.register_player_title') : t('tournament_event_management.complete_payment_title')}
                          </h2>
                          <p className="text-xs text-white/35 mt-1">
                            {registerStep === 'form'
                              ? t('tournament_event_management.register_player_desc')
                              : `${selectedEvent.skill_block} ${selectedEvent.gender}'s ${selectedEvent.modality}`}
                          </p>
                        </div>

                        {registerStep === 'form' ? (
                          <>
                            <div className="px-6 py-5 space-y-3">
                              {regPaymentError && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <p>{regPaymentError}</p>
                                </div>
                              )}
                              <div>
                                <label className={labelCls}>{t('tournament_event_management.field_user_id')}</label>
                                <Input
                                  value={registrationData.user_id}
                                  onChange={(e) =>
                                    setRegistrationData({
                                      ...registrationData,
                                      user_id: e.target.value,
                                    })
                                  }
                                  placeholder={t('tournament_event_management.placeholder_user_id')}
                                  className={inputCls}
                                />
                              </div>
                              {selectedEvent.modality !== 'Singles' && (
                                <div>
                                  <label className={labelCls}>
                                    {t('tournament_event_management.field_partner_id')}{' '}
                                    <span className="normal-case text-white/20">({t('tournament_event_management.optional')})</span>
                                  </label>
                                  <Input
                                    value={(registrationData as any).partner_user_id || ''}
                                    onChange={(e) =>
                                      setRegistrationData({
                                        ...registrationData,
                                        partner_user_id: e.target.value,
                                      } as any)
                                    }
                                    placeholder={t('tournament_event_management.placeholder_partner_id')}
                                    className={inputCls}
                                  />
                                </div>
                              )}
                              {/* Entry fee preview */}
                              <div className="flex justify-between items-center px-3 py-2.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                                <span className="text-xs text-white/50">{t('tournament_event_management.entry_fee')}</span>
                                <span className="text-xs font-bold text-[#ace600]">MXN $50.00</span>
                              </div>
                            </div>
                            <div className="flex gap-2.5 px-6 pb-6 pt-2 border-t border-white/[0.06]">
                              <button
                                onClick={() => handleCloseRegisterDialog(false)}
                                className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 text-sm font-semibold transition-all"
                              >
                                {t('common.cancel')}
                              </button>
                              <button
                                onClick={handleRegister}
                                disabled={!registrationData.user_id.trim() || isInitializingPayment}
                                className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                              >
                                {isInitializingPayment ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    {t('tournament_event_management.btn_verifying')}
                                  </>
                                ) : (
                                  t('tournament_event_management.btn_continue_payment')
                                )}
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="px-6 py-5">
                              {regPaymentError && (
                                <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <p>{regPaymentError}</p>
                                </div>
                              )}
                              {regPaymentData ? (
                                <Elements
                                  stripe={stripePromise}
                                  options={{
                                    clientSecret: regPaymentData.clientSecret,
                                    appearance: { theme: 'night' },
                                  }}
                                >
                                  <PaymentForm
                                    paymentId={regPaymentData.paymentId}
                                    clientSecret={regPaymentData.clientSecret}
                                    amount={5000}
                                    currency="mxn"
                                    description={`${selectedEvent.skill_block} ${selectedEvent.gender}'s ${selectedEvent.modality} — Registration`}
                                    onSuccess={handleRegisterAfterPayment}
                                    onError={(err) => setRegPaymentError(err)}
                                  />
                                </Elements>
                              ) : (
                                <p className="text-sm text-white/40 text-center py-6">
                                  Preparando pago...
                                </p>
                              )}
                            </div>
                            <div className="px-6 pb-6 pt-2 border-t border-white/[0.06]">
                              <button
                                onClick={() => {
                                  setRegisterStep('form');
                                  setRegPaymentData(null);
                                  setRegPaymentError(null);
                                }}
                                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                              >
                                ← {t('tournament_event_management.btn_back_to_form')}
                              </button>
                            </div>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Quick stats for selected event */}
                <div className="grid grid-cols-4 gap-2">
                  <StatCard
                    icon={Users}
                    label={t('tournament_event_management.stat_registrations')}
                    value={totalRegistrations}
                    meta={`${registrationRate}% ${t('tournament_event_management.stat_capacity')}`}
                    color="bg-sky-500/10 border-sky-500/20 text-sky-400"
                    trend={totalRegistrations > 0 ? 'up' : 'neutral'}
                  />
                  <StatCard
                    icon={CheckCircle}
                    label={t('tournament_event_management.stat_confirmed')}
                    value={confirmedRegistrations}
                    meta={`${totalRegistrations > 0 ? Math.round((confirmedRegistrations / totalRegistrations) * 100) : 0}% ${t('tournament_event_management.of_total')}`}
                    color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  />
                  <StatCard
                    icon={Swords}
                    label={t('tournament_event_management.stat_pending')}
                    value={pendingRegistrations}
                    meta={t('tournament_event_management.stat_waiting')}
                    color="bg-amber-500/10 border-amber-500/20 text-amber-400"
                  />
                  <StatCard
                    icon={Target}
                    label={t('tournament_event_management.stat_capacity')}
                    value={`${registrationRate}%`}
                    meta={`${t('tournament_event_management.of')} ${selectedEvent.max_participants}`}
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
                    placeholder={t('tournament_event_management.search_players')}
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
                  <option value="all">{t('tournament_event_management.filter_all_status')}</option>
                  <option value="confirmed">{t('registration_status.confirmed')}</option>
                  <option value="pending">{t('registration_status.pending')}</option>
                  <option value="withdrawn">{t('registration_status.withdrawn')}</option>
                </select>
              </div>
            )}

            {/* Registrations table */}
            {filteredRegistrations.length > 0 && (
              <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {[t('tournament_event_management.table_player'), t('tournament_event_management.table_partner'), t('tournament_event_management.table_status'), t('tournament_event_management.table_date')].map((h) => (
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
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${statusColor}`}
                            >
                              {getRegistrationStatusLabel(reg.status)}
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
                title="Sin inscripciones aún"
                description="Los jugadores aparecerán aquí una vez que se inscriban en este evento"
                action={() => setShowRegisterDialog(true)}
                actionLabel="Inscribir Jugador"
              />
            )}

            {selectedEvent &&
              filteredRegistrations.length === 0 &&
              eventRegistrations.length > 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Filter className="w-8 h-8 text-white/10 mb-3" />
                  <p className="text-sm text-white/30">No se encontraron resultados</p>
                  <p className="text-xs text-white/20 mt-1">Intenta ajustar tus filtros</p>
                </div>
              )}
          </div>
        )}

        {/* ── Groups tab ── */}
        {activeTab === 'groups' && (
          <div className="p-5 space-y-4">
            {!selectedEvent && (
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center">
                <p className="text-xs text-white/30">Selecciona un evento desde la pestaña Eventos primero</p>
              </div>
            )}

            {selectedEvent && !(selectedEvent.number_of_groups > 0) && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-5">
                  <Target className="w-7 h-7 text-white/20" />
                </div>
                <p className="text-white/60 font-semibold text-sm mb-1">Grupos no generados</p>
                <p className="text-white/25 text-xs mb-6 max-w-xs">
                  Una vez que haya suficientes jugadores inscritos, genera los grupos para comenzar la fase de grupos.
                </p>
                <button
                  onClick={handleGenerateGroups}
                  className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_18px_rgba(172,230,0,0.18)]"
                >
                  <Play className="w-4 h-4" /> Generar Grupos
                </button>
              </div>
            )}

            {selectedEvent &&
              (selectedEvent.number_of_groups || selectedEvent.groupCount || 0) > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {selectedEvent.skill_block} {getModalityLabel(selectedEvent.modality)}
                      </p>
                      <p className="text-[11px] text-white/35">
                        {selectedEvent?.number_of_groups} grupos generados
                      </p>
                    </div>
                    <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.08] text-white/70 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all">
                          <Plus className="w-3.5 h-3.5" /> Crear Partido
                        </button>
                      </DialogTrigger>
                      <DialogContent className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm shadow-2xl overflow-hidden">
                        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                          <h2 className="text-base font-bold text-white">Crear Partido</h2>
                          <p className="text-xs text-white/35 mt-1">
                            Programa un nuevo partido para este evento
                          </p>
                        </div>
                        <div className="px-6 py-5 space-y-3">
                          {[
                            ['ID Jugador 1', 'player1_id', 'player1_id'],
                            ['ID Jugador 2', 'player2_id', 'player2_id'],
                            ['ID Grupo', 'group_id', 'group_id (opcional)'],
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
                            Cancelar
                          </button>
                          <button
                            onClick={handleCreateMatch}
                            className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold transition-all"
                          >
                            Crear
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
                                Grupo {group.groupNumber}
                              </span>
                            </div>
                            <GroupPill status={group.status} />
                          </div>
                          <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3 h-3" />
                              {group.playerCount} jugadores
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {group.matchesCompleted}/{group.totalMatches} partidos
                            </span>
                          </div>
                          <div className="mb-3">
                            <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
                              <span>Progreso</span>
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
                              <CheckCircle className="w-3.5 h-3.5" /> Finalizar Grupo
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
                <p className="text-xs text-white/30">Selecciona un evento desde la pestaña Eventos primero</p>
              </div>
            )}

            {selectedEvent && eventMatches.length > 0 && (
              <div className="flex justify-end mb-3">
                <button
                  onClick={() =>
                    navigate(
                      `/clubs/dashboard/tournaments/${tournamentId}/events/${selectedEvent.id}/schedule`,
                    )
                  }
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-[#ace600]/10 border border-[#ace600]/30 text-[#ace600] hover:bg-[#ace600]/20 rounded-lg transition-colors"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  Programar Horarios
                </button>
              </div>
            )}

            {selectedEvent && eventMatches.length === 0 && (
              <EmptyState
                icon={Swords}
                title="Sin partidos programados aún"
                description="Los partidos se crearán una vez que se generen los grupos"
                action={handleGenerateGroups}
                actionLabel="Generar Grupos"
              />
            )}

            {selectedEvent && eventMatches.length > 0 && (
              <div className="bg-white/[0.01] border border-white/[0.06] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {['Partido', 'Estado', 'Marcador', 'Acción'].map((h) => (
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
                              {done ? 'Completado' : 'Pendiente'}
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
                                <CheckCircle className="w-3.5 h-3.5" /> Registrar Resultado
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
            <h2 className="text-base font-bold text-white">Registrar Resultado del Partido</h2>
            <p className="text-xs text-white/35 mt-1">Ingresa el resultado y marcador del partido</p>
          </div>
          {selectedMatch && (
            <div className="px-6 py-5 space-y-4">
              {/* Match overview */}
              <div className="p-3 bg-white/[0.02] border border-white/[0.07] rounded-xl">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                  Partido
                </p>
                <p className="text-sm text-white/80 font-medium">
                  {selectedMatch.player1?.name} vs {selectedMatch.player2?.name}
                </p>
              </div>

              {/* Winner selection */}
              <div>
                <label className={labelCls}>Ganador del Partido</label>
                <Select
                  value={matchResult.winner_id}
                  onValueChange={(v) => setMatchResult({ ...matchResult, winner_id: v })}
                >
                  <SelectTrigger className={selTrigger}>
                    <SelectValue placeholder="Seleccionar ganador" />
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
                <label className={labelCls}>Marcador (ej., "11-9, 11-8")</label>
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
                  Marca este partido como completado. El ganador avanzará si aplica.
                </p>
              </div>
            </div>
          )}
          <div className="flex gap-2.5 px-6 pb-6 pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => setShowRecordResultDialog(false)}
              className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 text-sm font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleRecordMatchResult}
              disabled={!matchResult.winner_id}
              className="flex-1 h-9 rounded-xl bg-emerald-500/70 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold transition-all"
            >
              Guardar Resultado
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
                  {getModalityLabel(selectedEvent.modality)} • {getGenderLabel(selectedEvent.gender)}
                </p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-xs text-white/40">Formato</span>
                    <span className="text-xs font-semibold text-white/80">
                      {getFormatLabel(selectedEvent.format)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-xs text-white/40">Sets</span>
                    <span className="text-xs font-semibold text-white/80">
                      {getSetsFormatLabel(selectedEvent.sets_format)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-xs text-white/40">Capacidad</span>
                    <span className="text-xs font-semibold text-white/80">
                      {selectedEvent.current_participants || 0}/{selectedEvent.max_participants}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <span className="text-xs text-white/40">Grupos</span>
                    <span className="text-xs font-semibold text-white/80">
                      {selectedEvent.number_of_groups || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-white/40">Estado</span>
                    <span className="text-xs font-semibold text-[#ace600]">Activo</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5 px-6 pb-6 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => setShowEventDetailsModal(false)}
                  className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold transition-all"
                >
                  Cerrar
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
          <span className="text-xs text-white/30">Actualizando…</span>
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
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* ── Delete confirm dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteError(null); } }}>
        <DialogContent className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <DialogTitle className="text-base font-bold text-white">Eliminar Evento</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-white/35 mt-1">
              Esta acción no se puede deshacer.
            </DialogDescription>
          </div>
          <div className="px-6 py-5 space-y-4">
            {deleteTarget && (
              <p className="text-sm text-white/70">
                ¿Estás seguro de que deseas eliminar{' '}
                <span className="font-bold text-white">
                  {getModalityLabel(deleteTarget.modality)} — {deleteTarget.skill_block}
                </span>
                ? Todos los datos relacionados serán eliminados.
              </p>
            )}
            {deleteError && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/[0.08] border border-red-500/20 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{deleteError}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2.5 px-6 pb-6 pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
              disabled={deleting}
              className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 text-sm font-semibold transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteEvent}
              disabled={deleting}
              className="flex-1 h-9 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TournamentEventManagement;
