import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import TournamentStartValidation from '@/components/tournament/TournamentStartValidation';
import StartTournamentConfirmationModal from '@/components/tournament/StartTournamentConfirmationModal';
import InsufficientEntriesModal from '@/components/tournament/InsufficientEntriesModal';
import { ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { fetchTournament, startTournament } from '@/store/slices/tournamentsSlice';
import { RootState, AppDispatch } from '@/store';

export default function TournamentStart() {
  const navigate = useNavigate();
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const {
    currentTournament,
    loading: reduxLoading,
    error: reduxError,
  } = useSelector((state: RootState) => state.tournaments);

  // Local state
  const [validationPassed, setValidationPassed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // Fetch tournament data on mount or when tournamentId changes
  useEffect(() => {
    if (!tournamentId) {
      setStartError('No tournament ID provided');
      return;
    }

    // Fetch tournament details (includes events in response)
    dispatch(fetchTournament(tournamentId)).catch(() => {
      setStartError('Failed to load tournament details');
    });
  }, [tournamentId, dispatch]);

  // Extract events from tournament data
  const tournamentEvents = (currentTournament as any)?.events || [];
  const registrations = (currentTournament as any)?.registrations || [];

  // Process events to identify insufficient entries
  const insufficientEvents = tournamentEvents
    .filter((event: any) => {
      const minimum = event.minimum_participants || 2;
      const current = event.current_participants || 0;
      return current < minimum;
    })
    .map((event: any) => ({
      id: event.id,
      name: `${event.skill_block} ${event.gender}'s ${event.modality}`,
      current: event.current_participants || 0,
      minimum: event.minimum_participants || 2,
      capacity: event.max_participants || 32,
      format: event.format || 'hybrid',
    }));

  // Calculate total registrations from registrations array
  const totalRegistrations = registrations.length;

  // Group registrations by event
  const registrationsByEvent = tournamentEvents.map((event: any) => ({
    eventId: event.id,
    eventName: `${event.skill_block} ${event.gender}'s ${event.modality}`,
    registrations: registrations.filter((reg: any) => reg.tournament_event_id === event.id),
  }));

  // Group registrations by group_id for each event
  const groupsByEvent = tournamentEvents.map((event: any) => {
    const eventRegs = registrations.filter((reg: any) => reg.tournament_event_id === event.id);
    const groupMap = new Map<string, any[]>();
    eventRegs.forEach((reg: any) => {
      if (!groupMap.has(reg.group_id)) {
        groupMap.set(reg.group_id, []);
      }
      groupMap.get(reg.group_id)!.push(reg);
    });
    return {
      eventId: event.id,
      eventName: `${event.skill_block} ${event.gender}'s ${event.modality}`,
      groups: Array.from(groupMap.entries()).map(([groupId, regs]) => ({
        groupId,
        playerCount: regs.length,
        players: regs,
      })),
      expectedGroups: event.number_of_groups || 0,
      targetGroupSize: event.target_group_size || 0,
    };
  });

  // Validation checks
  const validationChecks = {
    allEventsActive: tournamentEvents.every((e: any) => e.is_active === true),
    allRegistrationConfirmed: registrations.every((r: any) => r.status === 'confirmed'),
    allPaymentsPaid: registrations.every((r: any) => r.payment_status === 'paid'),
    allPlayersGrouped: registrations.every(
      (r: any) => r.group_id !== null && r.group_id !== undefined,
    ),
    insufficientEntries: insufficientEvents.length > 0,
    allGroupsFormed: groupsByEvent.every((g: any) => g.groups.length === g.expectedGroups),
    registrationDeadlinePassed: (currentTournament as any)?.registration_deadline
      ? new Date((currentTournament as any).registration_deadline) <= new Date()
      : false,
  };

  // Helper function to safely format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Helper function to check if registration deadline has passed
  const isRegistrationDeadlinePassed = () => {
    const deadline = (currentTournament as any)?.registration_deadline;
    if (!deadline) return false;
    try {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) return false;
      return deadlineDate <= new Date();
    } catch {
      return false;
    }
  };

  // Overall validation status
  const isFullyValid =
    validationChecks.allEventsActive &&
    validationChecks.allRegistrationConfirmed &&
    validationChecks.allPaymentsPaid &&
    validationChecks.allPlayersGrouped &&
    !validationChecks.insufficientEntries &&
    validationChecks.allGroupsFormed &&
    validationChecks.registrationDeadlinePassed;

  const handleValidationChange = (isValid: boolean) => {
    // Use comprehensive validation combined with component validation
    const combinedValid = isValid && isFullyValid;
    setValidationPassed(combinedValid);
  };

  const handleStartTournament = () => {
    // If there are insufficient entries, show modal first
    if (insufficientEvents.length > 0) {
      setShowInsufficientModal(true);
    } else {
      setShowConfirmation(true);
    }
  };

  const handleConfirmStart = async () => {
    if (!tournamentId) return;

    setIsStarting(true);
    setStartError(null);

    try {
      await dispatch(
        startTournament({
          id: tournamentId,
          params: {
            generateGroups: true,
            generateBrackets: true,
          },
        }),
      ).unwrap();

      // Success - navigate to tournament details or next page
      setShowConfirmation(false);
      navigate(`/tournaments/${tournamentId}`);
    } catch (error: any) {
      setStartError(error.message || 'Failed to start tournament');
    } finally {
      setIsStarting(false);
    }
  };

  const handleInsufficientAction = (action: any, eventId: string, details?: any) => {
    console.log('Insufficient action:', { action, eventId, details });
    // After handling insufficient entries, show confirmation
    setShowInsufficientModal(false);
    setShowConfirmation(true);
  };

  // Display loading or error state if no tournament data
  if (reduxLoading && !currentTournament) {
    return (
      <div className="min-h-screen bg-[#0d1117] p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-white/60">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (!currentTournament && !reduxLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-red-400">Tournament Not Found</h3>
              <p className="text-red-300/80 mt-1">
                {startError || 'Could not load tournament data'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Error Alert */}
        {(startError || reduxError) && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Error</p>
              <p className="text-sm text-red-300/80 mt-1">{startError || reduxError}</p>
            </div>
            {startError && (
              <button
                onClick={() => setStartError(null)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">{currentTournament?.name}</h1>
          <p className="text-white/40 mt-2">
            Tournament Start Workflow - Validation & Confirmation
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Validation Component */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#ace600] text-black flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-lg font-bold text-white">Pre-Flight Validation</h2>
            </div>
            {tournamentId && (
              <TournamentStartValidation
                tournamentId={tournamentId}
                tournament={currentTournament}
                onValidationChange={handleValidationChange}
                onStartTournament={handleStartTournament}
              />
            )}
            {/* Validation Checklist */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-bold text-white mb-3">Validation Checks</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center font-bold text-xs ${validationChecks.allEventsActive ? 'bg-emerald-500/30 text-emerald-400' : 'bg-red-500/30 text-red-400'}`}
                  >
                    {validationChecks.allEventsActive ? '✓' : '✗'}
                  </span>
                  <span
                    className={
                      validationChecks.allEventsActive ? 'text-emerald-300' : 'text-red-300'
                    }
                  >
                    All events active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center font-bold text-xs ${validationChecks.allRegistrationConfirmed ? 'bg-emerald-500/30 text-emerald-400' : 'bg-red-500/30 text-red-400'}`}
                  >
                    {validationChecks.allRegistrationConfirmed ? '✓' : '✗'}
                  </span>
                  <span
                    className={
                      validationChecks.allRegistrationConfirmed
                        ? 'text-emerald-300'
                        : 'text-red-300'
                    }
                  >
                    All registrations confirmed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center font-bold text-xs ${validationChecks.allPaymentsPaid ? 'bg-emerald-500/30 text-emerald-400' : 'bg-red-500/30 text-red-400'}`}
                  >
                    {validationChecks.allPaymentsPaid ? '✓' : '✗'}
                  </span>
                  <span
                    className={
                      validationChecks.allPaymentsPaid ? 'text-emerald-300' : 'text-red-300'
                    }
                  >
                    All payments completed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center font-bold text-xs ${validationChecks.allPlayersGrouped ? 'bg-emerald-500/30 text-emerald-400' : 'bg-red-500/30 text-red-400'}`}
                  >
                    {validationChecks.allPlayersGrouped ? '✓' : '✗'}
                  </span>
                  <span
                    className={
                      validationChecks.allPlayersGrouped ? 'text-emerald-300' : 'text-red-300'
                    }
                  >
                    All players grouped
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center font-bold text-xs ${!validationChecks.insufficientEntries ? 'bg-emerald-500/30 text-emerald-400' : 'bg-red-500/30 text-red-400'}`}
                  >
                    {!validationChecks.insufficientEntries ? '✓' : '✗'}
                  </span>
                  <span
                    className={
                      !validationChecks.insufficientEntries ? 'text-emerald-300' : 'text-red-300'
                    }
                  >
                    Sufficient entries
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center font-bold text-xs ${validationChecks.allGroupsFormed ? 'bg-emerald-500/30 text-emerald-400' : 'bg-red-500/30 text-red-400'}`}
                  >
                    {validationChecks.allGroupsFormed ? '✓' : '✗'}
                  </span>
                  <span
                    className={
                      validationChecks.allGroupsFormed ? 'text-emerald-300' : 'text-red-300'
                    }
                  >
                    Groups formed correctly
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center font-bold text-xs ${validationChecks.registrationDeadlinePassed ? 'bg-emerald-500/30 text-emerald-400' : 'bg-amber-500/30 text-amber-400'}`}
                  >
                    {validationChecks.registrationDeadlinePassed ? '✓' : '○'}
                  </span>
                  <span
                    className={
                      validationChecks.registrationDeadlinePassed
                        ? 'text-emerald-300'
                        : 'text-amber-300'
                    }
                  >
                    Registration deadline passed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Tournament Data Summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* Summary Stats */}
            <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Tournament Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-white/40 text-sm">Total Players</p>
                  <p className="text-3xl font-bold text-white">{totalRegistrations}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-white/40 text-sm">Confirmed</p>
                  <p
                    className={`text-3xl font-bold ${registrations.filter((r: any) => r.status === 'confirmed').length === totalRegistrations ? 'text-emerald-400' : 'text-amber-400'}`}
                  >
                    {registrations.filter((r: any) => r.status === 'confirmed').length}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-white/40 text-sm">Payments Paid</p>
                  <p
                    className={`text-3xl font-bold ${registrations.filter((r: any) => r.payment_status === 'paid').length === totalRegistrations ? 'text-emerald-400' : 'text-amber-400'}`}
                  >
                    {registrations.filter((r: any) => r.payment_status === 'paid').length}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-white/40 text-sm">Validation</p>
                  <p
                    className={`text-3xl font-bold ${isFullyValid ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {isFullyValid ? '✓' : '✗'}
                  </p>
                </div>
              </div>
            </div>

            {/* Events Configuration */}
            {tournamentEvents.length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Events & Format Configuration</h3>
                <div className="space-y-4">
                  {tournamentEvents.map((event: any) => (
                    <div
                      key={event.id}
                      className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-4 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-white/40">Event</p>
                          <p className="text-sm font-semibold text-white">
                            {event.skill_block} {event.gender}'s {event.modality}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Status</p>
                          <p
                            className={`text-sm font-semibold ${event.is_active ? 'text-emerald-400' : 'text-red-400'}`}
                          >
                            {event.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Format</p>
                          <p className="text-sm font-semibold text-white">{event.format}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Participants</p>
                          <p className="text-sm font-semibold text-white">
                            {event.current_participants} / {event.max_participants}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Groups</p>
                          <p className="text-sm font-semibold text-white">
                            {event.number_of_groups} groups ({event.target_group_size} per group)
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Advance</p>
                          <p className="text-sm font-semibold text-white">
                            {event.advance_from_group} per group
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-white/40">Match Format</p>
                          <p className="text-sm font-semibold text-white">
                            {event.sets_format} ({event.points_per_set}pts/set, {event.win_margin}pt
                            margin)
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-white/40">Playoff Strategy</p>
                          <p className="text-sm font-semibold text-white capitalize">
                            {event.playoff_strategy}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Groups & Players Breakdown */}
            {groupsByEvent.length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Groups & Players Breakdown</h3>
                <div className="space-y-4">
                  {groupsByEvent.map((eventGroup: any) => (
                    <div
                      key={eventGroup.eventId}
                      className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-white">{eventGroup.eventName}</p>
                        <span className="text-xs bg-white/10 px-2 py-1 rounded">
                          {eventGroup.groups.length} / {eventGroup.expectedGroups} groups
                        </span>
                      </div>
                      <div className="space-y-2">
                        {eventGroup.groups.map((group: any, idx: number) => (
                          <div
                            key={group.groupId}
                            className="bg-white/[0.04] border border-white/[0.06] rounded p-3 space-y-2"
                          >
                            <p className="text-xs font-semibold text-white/60">
                              Group {idx + 1} • {group.playerCount} players
                            </p>
                            <div className="space-y-1">
                              {group.players.map((player: any) => (
                                <div
                                  key={player.id}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span className="text-white/80">{player.user.full_name}</span>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-xs ${player.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}
                                    >
                                      {player.status}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-xs ${player.payment_status === 'paid' ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'}`}
                                    >
                                      {player.payment_status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Registrations List */}
            {registrations.length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">
                  All Registered Players ({registrations.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {registrations.map((reg: any, idx: number) => (
                    <div
                      key={reg.id}
                      className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-3 grid grid-cols-6 gap-2 items-center text-xs"
                    >
                      <div>
                        <p className="text-white/40">#{idx + 1}</p>
                        <p className="text-white font-semibold">{reg.user.full_name}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Skill</p>
                        <p className="text-white">{reg.user.skill_level}</p>
                      </div>
                      <div>
                        <p className="text-white/40">Event</p>
                        <p className="text-white">
                          {reg.skill_block} {reg.gender}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-2 py-1 rounded-sm font-semibold ${reg.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}
                        >
                          {reg.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-2 py-1 rounded-sm font-semibold ${reg.payment_status === 'paid' ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'}`}
                        >
                          {reg.payment_status}
                        </span>
                      </div>
                      <div>
                        <p className="text-white/40">Group</p>
                        <p className="text-white font-mono">
                          {reg.group_id?.substring(0, 8) || '—'}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validation Issues Alert */}
        {!isFullyValid && (
          <div className="bg-red-500/[0.12] border border-red-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-400">Validation Issues Found</h3>
                <p className="text-sm text-red-300/80 mt-1">
                  Please resolve the following issues before starting the tournament.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {!validationChecks.allEventsActive && (
                <div className="bg-white/[0.04] border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-300">✗ Inactive Events</p>
                  <p className="text-xs text-red-300/70 mt-1">Some events are not active</p>
                </div>
              )}
              {!validationChecks.allRegistrationConfirmed && (
                <div className="bg-white/[0.04] border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-300">✗ Unconfirmed Registrations</p>
                  <p className="text-xs text-red-300/70 mt-1">
                    {registrations.filter((r: any) => r.status !== 'confirmed').length}{' '}
                    registration(s) not confirmed
                  </p>
                </div>
              )}
              {!validationChecks.allPaymentsPaid && (
                <div className="bg-white/[0.04] border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-300">✗ Incomplete Payments</p>
                  <p className="text-xs text-red-300/70 mt-1">
                    {registrations.filter((r: any) => r.payment_status !== 'paid').length}{' '}
                    payment(s) pending
                  </p>
                </div>
              )}
              {!validationChecks.allPlayersGrouped && (
                <div className="bg-white/[0.04] border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-300">✗ Ungrouped Players</p>
                  <p className="text-xs text-red-300/70 mt-1">
                    {registrations.filter((r: any) => !r.group_id).length} player(s) not assigned to
                    groups
                  </p>
                </div>
              )}
              {validationChecks.insufficientEntries && (
                <div className="bg-white/[0.04] border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-300">✗ Insufficient Entries</p>
                  <p className="text-xs text-red-300/70 mt-1">
                    {insufficientEvents.length} event(s) below minimum participants
                  </p>
                </div>
              )}
              {!validationChecks.allGroupsFormed && (
                <div className="bg-white/[0.04] border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-300">✗ Incomplete Group Formation</p>
                  <p className="text-xs text-red-300/70 mt-1">
                    Some events don't have all expected groups formed
                  </p>
                </div>
              )}
              {!validationChecks.registrationDeadlinePassed && (
                <div className="bg-white/[0.04] border border-amber-500/20 rounded-lg p-3">
                  <p className="text-sm font-semibold text-amber-300">
                    ⊘ Registration Deadline Pending
                  </p>
                  <p className="text-xs text-amber-300/70 mt-1">
                    Registration deadline:{' '}
                    {formatDate((currentTournament as any)?.registration_deadline)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Ready to Start?</h3>
            <p className="text-sm text-white/40 mt-1">
              {validationPassed
                ? 'All validations passed. You can start the tournament.'
                : 'Complete all validations before starting.'}
            </p>
          </div>
          <Button
            onClick={handleStartTournament}
            disabled={!validationPassed || reduxLoading || isStarting}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isStarting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isStarting ? 'Starting...' : 'Start Tournament'}
            {!isStarting && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Tournament Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Organizer Info */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Tournament Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/40">Type</p>
                <p className="text-sm font-semibold text-white capitalize">
                  {(currentTournament as any)?.tournament_type} •{' '}
                  {(currentTournament as any)?.category}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40">Organizer</p>
                <p className="text-sm font-semibold text-white">
                  {(currentTournament as any)?.organizer_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40">Venue</p>
                <p className="text-sm font-semibold text-white">
                  {(currentTournament as any)?.venue_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40">Location</p>
                <p className="text-sm font-semibold text-white">
                  {(currentTournament as any)?.city}, {(currentTournament as any)?.state}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Schedule Info */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Schedule</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/40">Start Date</p>
                <p className="text-sm font-semibold text-white">
                  {formatDate((currentTournament as any)?.start_date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40">End Date</p>
                <p className="text-sm font-semibold text-white">
                  {formatDate((currentTournament as any)?.end_date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40">Registration Deadline</p>
                <p className="text-sm font-semibold text-white">
                  {formatDate((currentTournament as any)?.registration_deadline)}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40">Status</p>
                <p className="text-sm font-semibold text-white capitalize">
                  {(currentTournament as any)?.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* State Display */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/30 mb-4">
            Component State
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-white/40">Validation</p>
              <p
                className={`text-sm font-bold ${validationPassed ? 'text-emerald-400' : 'text-amber-400'}`}
              >
                {validationPassed ? 'PASSED' : 'PENDING'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-white/40">Confirmation Modal</p>
              <p
                className={`text-sm font-bold ${showConfirmation ? 'text-blue-400' : 'text-white/40'}`}
              >
                {showConfirmation ? 'OPEN' : 'CLOSED'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-white/40">Insufficient Modal</p>
              <p
                className={`text-sm font-bold ${showInsufficientModal ? 'text-red-400' : 'text-white/40'}`}
              >
                {showInsufficientModal ? 'OPEN' : 'CLOSED'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-white/40">Starting</p>
              <p
                className={`text-sm font-bold ${isStarting ? 'text-orange-400' : 'text-white/40'}`}
              >
                {isStarting ? 'IN PROGRESS' : 'IDLE'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StartTournamentConfirmationModal
        open={showConfirmation}
        tournamentName={currentTournament?.name || 'Tournament'}
        eventCount={tournamentEvents.length}
        totalRegistrations={totalRegistrations}
        onConfirm={handleConfirmStart}
        onCancel={() => setShowConfirmation(false)}
        isLoading={isStarting}
      />

      <InsufficientEntriesModal
        open={showInsufficientModal}
        events={insufficientEvents}
        onAction={handleInsufficientAction}
        onClose={() => setShowInsufficientModal(false)}
      />
    </div>
  );
}
