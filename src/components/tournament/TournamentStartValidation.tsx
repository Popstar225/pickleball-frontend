import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle, AlertTriangle, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ValidationCheck {
  id: string;
  label: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  icon?: React.ElementType;
  severity?: 'red' | 'yellow';
}

interface TournamentStartValidationProps {
  tournamentId: string;
  tournament?: any; // Tournament data with events and registrations
  onStartTournament?: () => void;
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * Calculate tournament readiness validation checks based on real tournament data
 * Mirrors backend validation logic from TournamentStartService.validateTournamentReadiness
 */
function calculateValidationChecks(tournament: any): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  if (!tournament) {
    checks.push({
      id: 'loading',
      label: 'Loading Tournament Data',
      description: 'Fetching tournament information...',
      status: 'pending',
    });
    return checks;
  }

  const events = tournament.events || [];
  const registrations = tournament.registrations || [];

  // ===== CHECK 1: Tournament has events =====
  if (events.length === 0) {
    checks.push({
      id: 'min-events',
      label: 'Tournament Events',
      description: 'Tournament has no events defined',
      status: 'fail',
      severity: 'red',
    });
  } else {
    checks.push({
      id: 'min-events',
      label: 'Tournament Events',
      description: `Tournament has ${events.length} event${events.length !== 1 ? 's' : ''} configured`,
      status: 'pass',
    });
  }

  // ===== CHECK 2: Event-specific validations =====
  let insufficientEventsCount = 0;
  let oddParticipantsCount = 0;
  let smallGroupCount = 0;
  let eventWithIssues: string[] = [];

  events.forEach((event: any) => {
    const eventRegs = registrations.filter(
      (r: any) => r.tournament_event_id === event.id && r.status === 'confirmed',
    );
    const currentParticipants = eventRegs.length;
    const minimum = event.minimum_participants || 2;
    const name = `${event.skill_block} ${event.gender}'s ${event.modality}`;

    // Insufficient registrations
    if (
      currentParticipants < minimum &&
      event.registration_status !== 'cancelled' &&
      event.registration_status !== 'merged'
    ) {
      insufficientEventsCount++;
      eventWithIssues.push(`${name}: ${currentParticipants}/${minimum} registrations`);
    }

    // Odd number for single elimination
    if (event.format === 'single_elimination' && currentParticipants % 2 !== 0) {
      oddParticipantsCount++;
      eventWithIssues.push(
        `${name}: ${currentParticipants} participants (odd - byes will be assigned)`,
      );
    }

    // Small group size for hybrid
    if (event.format === 'hybrid' && event.number_of_groups > 0) {
      if (currentParticipants / event.number_of_groups < 3) {
        smallGroupCount++;
        eventWithIssues.push(
          `${name}: Average group size ${(currentParticipants / event.number_of_groups).toFixed(1)} (small)`,
        );
      }
    }
  });

  // Add event capacity check
  if (insufficientEventsCount > 0) {
    checks.push({
      id: 'event-capacity',
      label: 'Event Minimum Entries',
      description: `${insufficientEventsCount} event${insufficientEventsCount !== 1 ? 's' : ''} below minimum: ${eventWithIssues.filter((e) => e.includes('registrations')).join(', ')}`,
      status: 'fail',
      severity: 'red',
    });
  } else {
    const passingEvents = events.filter(
      (e: any) =>
        e.registration_status === 'cancelled' ||
        e.registration_status === 'merged' ||
        registrations.filter((r: any) => r.tournament_event_id === e.id && r.status === 'confirmed')
          .length >= (e.minimum_participants || 2),
    );
    checks.push({
      id: 'event-capacity',
      label: 'Event Minimum Entries',
      description: `All ${passingEvents.length} active event${passingEvents.length !== 1 ? 's' : ''} meet minimum enrollment`,
      status: 'pass',
    });
  }

  // ===== CHECK 3: Event formats configured =====
  let missingFormatCount = 0;
  events.forEach((event: any) => {
    if (!event.format || !event.sets_format) {
      missingFormatCount++;
    }
  });

  if (missingFormatCount > 0) {
    checks.push({
      id: 'event-format',
      label: 'Event Formats Confirmed',
      description: `${missingFormatCount} event${missingFormatCount !== 1 ? 's' : ''} missing format or rules configuration`,
      status: 'fail',
      severity: 'red',
    });
  } else {
    checks.push({
      id: 'event-format',
      label: 'Event Formats Confirmed',
      description: 'All events have format, sets, and rules configured',
      status: 'pass',
    });
  }

  // ===== CHECK 4: Events Status =====
  const activeEvents = events.filter((e: any) => e.is_active === true).length;
  const inactiveEvents = events.filter((e: any) => e.is_active === false).length;

  if (inactiveEvents > 0) {
    checks.push({
      id: 'events-active',
      label: 'Active Events',
      description: `${activeEvents} active, ${inactiveEvents} inactive event${inactiveEvents !== 1 ? 's' : ''}`,
      status: inactiveEvents > 0 ? 'warning' : 'pass',
      severity: 'yellow',
    });
  } else {
    checks.push({
      id: 'events-active',
      label: 'Active Events',
      description: `All ${activeEvents} event${activeEvents !== 1 ? 's' : ''} are active and ready`,
      status: 'pass',
    });
  }

  // ===== CHECK 5: Registration Status =====
  const confirmedRegs = registrations.filter((r: any) => r.status === 'confirmed').length;
  const unconfirmedRegs = registrations.filter(
    (r: any) => r.status !== 'confirmed' && r.status !== 'cancelled',
  ).length;

  if (unconfirmedRegs > 0) {
    checks.push({
      id: 'registrations-confirmed',
      label: 'Registration Confirmations',
      description: `${confirmedRegs} confirmed, ${unconfirmedRegs} unconfirmed registration${unconfirmedRegs !== 1 ? 's' : ''}`,
      status: 'warning',
      severity: 'yellow',
    });
  } else {
    checks.push({
      id: 'registrations-confirmed',
      label: 'Registration Confirmations',
      description: `All ${confirmedRegs} registration${confirmedRegs !== 1 ? 's' : ''} confirmed`,
      status: 'pass',
    });
  }

  // ===== CHECK 6: Payment Status =====
  const paidRegs = registrations.filter((r: any) => r.payment_status === 'paid').length;
  const unpaidRegs = registrations.filter(
    (r: any) => r.payment_status !== 'paid' && r.status !== 'cancelled',
  ).length;

  if (unpaidRegs > 0) {
    checks.push({
      id: 'payments-completed',
      label: 'Payment Status',
      description: `${paidRegs} paid ${unpaidRegs > 0 ? `, ${unpaidRegs} pending` : ''}`,
      status: 'warning',
      severity: 'yellow',
    });
  } else {
    checks.push({
      id: 'payments-completed',
      label: 'Payment Status',
      description: `All payments completed (${paidRegs} registration${paidRegs !== 1 ? 's' : ''})`,
      status: 'pass',
    });
  }

  // ===== CHECK 7: Group Formation (for hybrid) =====
  const hybridEvents = events.filter((e: any) => e.format === 'hybrid');
  if (hybridEvents.length > 0) {
    const groupsFormedCount = hybridEvents.filter((e: any) => e.number_of_groups > 0).length;
    if (groupsFormedCount < hybridEvents.length) {
      checks.push({
        id: 'groups-formed',
        label: 'Group Formation',
        description: `${groupsFormedCount}/${hybridEvents.length} hybrid event${hybridEvents.length !== 1 ? 's' : ''} have groups configured`,
        status: 'warning',
        severity: 'yellow',
      });
    } else {
      checks.push({
        id: 'groups-formed',
        label: 'Group Formation',
        description: `All ${groupsFormedCount} hybrid event${groupsFormedCount !== 1 ? 's' : ''} have groups configured`,
        status: 'pass',
      });
    }
  }

  // ===== CHECK 8: No Critical Issues =====
  const hasRedFlags = insufficientEventsCount > 0 || missingFormatCount > 0;
  if (hasRedFlags) {
    checks.push({
      id: 'no-red-flags',
      label: 'Critical Issues',
      description: 'Resolve red flag issues before starting',
      status: 'fail',
      severity: 'red',
    });
  } else {
    checks.push({
      id: 'no-red-flags',
      label: 'Critical Issues',
      description: 'No critical issues detected',
      status: 'pass',
    });
  }

  return checks;
}

export default function TournamentStartValidation({
  tournamentId,
  tournament,
  onStartTournament,
  onValidationChange,
}: TournamentStartValidationProps) {
  const [checks, setChecks] = useState<ValidationCheck[]>([]);
  const [isValidating, setIsValidating] = useState(true);
  const [allPassed, setAllPassed] = useState(false);

  // Calculate validation checks whenever tournament data changes
  useEffect(() => {
    setIsValidating(!tournament); // Show loading state if no tournament data

    if (tournament) {
      const calculatedChecks = calculateValidationChecks(tournament);
      setChecks(calculatedChecks);

      // Validation passes if there are no 'fail' status checks
      const passed = calculatedChecks.every((check) => check.status !== 'fail');
      setAllPassed(passed);
      setIsValidating(false);
      onValidationChange?.(passed);
    }
  }, [tournament, onValidationChange]);

  const getStatusIcon = (status: ValidationCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    }
  };

  const getStatusBg = (status: ValidationCheck['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-emerald-500/[0.06] border-emerald-500/15';
      case 'fail':
        return 'bg-red-500/[0.06] border-red-500/15';
      case 'warning':
        return 'bg-amber-500/[0.05] border-amber-500/15';
      case 'pending':
        return 'bg-blue-500/[0.06] border-blue-500/15';
    }
  };

  const getStatusText = (status: ValidationCheck['status']) => {
    switch (status) {
      case 'pass':
        return 'text-emerald-400';
      case 'fail':
        return 'text-red-400';
      case 'warning':
        return 'text-amber-400';
      case 'pending':
        return 'text-blue-400';
    }
  };

  const failedCount = checks.filter((c) => c.status === 'fail').length;
  const warningCount = checks.filter((c) => c.status === 'warning').length;

  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white">Pre-Flight Validation</h3>
          <p className="text-xs text-white/30 mt-1">
            Verify all tournament requirements before starting
          </p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1">
            Total Checks
          </p>
          <p className="text-lg font-bold text-white">{checks.length}</p>
        </div>
        <div className="bg-emerald-500/[0.05] border border-emerald-500/15 rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
            Passed
          </p>
          <p className="text-lg font-bold text-emerald-400">
            {checks.filter((c) => c.status === 'pass').length}
          </p>
        </div>
        <div
          className={cn(
            'rounded-xl p-3 border',
            failedCount > 0
              ? 'bg-red-500/[0.05] border-red-500/15'
              : 'bg-amber-500/[0.05] border-amber-500/15',
          )}
        >
          <p
            className={cn(
              'text-[10px] font-bold uppercase tracking-widest mb-1',
              failedCount > 0 ? 'text-red-400' : 'text-amber-400',
            )}
          >
            {failedCount > 0 ? 'Failed' : 'Warnings'}
          </p>
          <p
            className={cn('text-lg font-bold', failedCount > 0 ? 'text-red-400' : 'text-amber-400')}
          >
            {failedCount > 0 ? failedCount : warningCount}
          </p>
        </div>
      </div>

      {/* Validation Checks */}
      <div className="space-y-2.5">
        {isValidating ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            <p className="text-xs text-white/25">Validating tournament…</p>
          </div>
        ) : (
          checks.map((check) => (
            <div
              key={check.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border transition-all',
                getStatusBg(check.status),
              )}
            >
              <div className="shrink-0 mt-0.5">{getStatusIcon(check.status)}</div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-semibold', getStatusText(check.status))}>
                  {check.label}
                </p>
                <p className="text-xs text-white/40 mt-1">{check.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Issues Summary */}
      {failedCount > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
          <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">
              {failedCount} {failedCount === 1 ? 'issue' : 'issues'} to resolve
            </p>
            <p className="text-xs text-red-400/70 mt-1">
              Fix the highlighted items before starting the tournament
            </p>
          </div>
        </div>
      )}

      {warningCount > 0 && failedCount === 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/[0.05] border border-amber-500/15 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400">
              {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
            </p>
            <p className="text-xs text-amber-400/70 mt-1">Review before starting the tournament</p>
          </div>
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={onStartTournament}
        disabled={!allPassed || isValidating}
        className={cn(
          'w-full h-10 rounded-xl text-sm font-bold gap-2 transition-all',
          allPassed && !isValidating
            ? 'bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.15)]'
            : 'bg-white/[0.05] border border-white/[0.06] text-white/20 cursor-not-allowed',
        )}
      >
        {isValidating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Validating…
          </>
        ) : (
          <>
            <Play className="w-4 h-4" /> Start Tournament
          </>
        )}
      </Button>

      {!allPassed && (
        <p className="text-xs text-white/25 text-center">
          Resolve all issues to enable tournament start
        </p>
      )}
    </div>
  );
}
