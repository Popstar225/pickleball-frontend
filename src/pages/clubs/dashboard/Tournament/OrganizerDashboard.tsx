/**
 * Organizer Tournament Dashboard
 *
 * Comprehensive dashboard for tournament organizers including:
 * - Tournament overview and status
 * - Event registration summary with traffic light indicators
 * - Registration counts and capacity
 * - Quick actions for event management
 * - Start tournament validation and confirmation
 *
 * @author Pickleball Federation Team
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  Settings,
  AlertCircle,
  Users,
  TrendingUp,
  FileText,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface Tournament {
  id: string;
  name: string;
  status: string;
  start_date: string;
  location: string;
}

interface EventSummary {
  id: string;
  skill_block: string;
  gender: string;
  modality: string;
  registrations: number;
  max: number;
  minimum: number;
  status: 'full' | 'partial' | 'insufficient' | 'no_registrations';
  alert: boolean;
}

interface OrganizerDashboardData {
  tournament: Tournament;
  events: EventSummary[];
  summary: {
    total_events: number;
    full: number;
    partial: number;
    insufficient: number;
    no_registrations: number;
    ready_to_start: boolean;
  };
}

const statusConfig = {
  full: {
    icon: CheckCircle2,
    label: 'Full',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    dotColor: 'bg-emerald-500',
  },
  partial: {
    icon: Clock,
    label: 'Partial',
    bgColor: 'bg-sky-500/10',
    textColor: 'text-sky-400',
    borderColor: 'border-sky-500/20',
    dotColor: 'bg-sky-500',
  },
  insufficient: {
    icon: AlertTriangle,
    label: 'Insufficient',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    dotColor: 'bg-amber-500',
  },
  no_registrations: {
    icon: AlertCircle,
    label: 'No Registrations',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/20',
    dotColor: 'bg-red-500',
  },
};

const EventCard: React.FC<{
  event: EventSummary;
  onViewRegistrations: (eventId: string) => void;
  onSettings: (eventId: string) => void;
}> = ({ event, onViewRegistrations, onSettings }) => {
  const capacity = (event.registrations / event.max) * 100;
  const config = statusConfig[event.status];
  const Icon = config.icon;

  return (
    <Card className={cn('border', config.borderColor, config.bgColor)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              {event.skill_block} {event.gender}'s {event.modality}
            </h3>
            <p className="text-xs text-white/40 mt-1">
              {event.registrations}/{event.max} | Min: {event.minimum}
            </p>
          </div>

          <Badge className={cn(config.bgColor, config.textColor, config.borderColor)}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {/* Capacity Bar */}
        <div className="mb-3">
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={cn('h-full', config.dotColor)}
              style={{ width: `${Math.min(capacity, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-white/30 mt-1">{capacity.toFixed(0)}%</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onViewRegistrations(event.id)}
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs border-white/[0.08] hover:bg-white/[0.05]"
          >
            View
          </Button>
          <Button
            onClick={() => onSettings(event.id)}
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs border-white/[0.08] hover:bg-white/[0.05]"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>

        {/* Alert */}
        {event.alert && (
          <div className="mt-2 p-2 bg-red-500/[0.06] border border-red-500/15 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-red-400 leading-tight">
              {event.status === 'no_registrations'
                ? 'No registrations yet. Consider canceling if needed.'
                : 'Minimum participants not met. Event may need cancellation or format change.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const OrganizerDashboard: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<OrganizerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [tournamentId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = (await api.get(
        `/tournaments/${tournamentId}/dashboard`,
      )) as ApiResponse<OrganizerDashboardData>;
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTournament = async () => {
    try {
      setStarting(true);
      await api.post(`/tournaments/${tournamentId}/start`, {});
      setShowStartConfirm(false);
      await loadDashboard();
    } catch (err: any) {
      setError(err.message || 'Failed to start tournament');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-white/40">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-white/60">Tournament not found</p>
      </div>
    );
  }

  const { tournament, events, summary } = data;

  return (
    <div className="space-y-6 pb-10">
      {/* ERROR BANNER */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{tournament.name}</h1>
          <p className="text-sm text-white/40">
            {tournament.location} • {new Date(tournament.start_date).toLocaleDateString()}
          </p>
        </div>

        <Button onClick={() => navigate(-1)} variant="outline" className="border-white/[0.08]">
          Back
        </Button>
      </div>

      {/* STATUS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#0d1117] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1">
                Total Events
              </p>
              <p className="text-2xl font-bold text-white">{summary.total_events}</p>
            </div>
            <FileText className="w-8 h-8 text-white/10" />
          </div>
        </div>

        <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-1">
                Full
              </p>
              <p className="text-2xl font-bold text-emerald-400">{summary.full}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
          </div>
        </div>

        <div className="bg-sky-500/[0.06] border border-sky-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400/60 mb-1">
                Partial
              </p>
              <p className="text-2xl font-bold text-sky-400">{summary.partial}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-sky-500/30" />
          </div>
        </div>

        <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/60 mb-1">
                Issues
              </p>
              <p className="text-2xl font-bold text-amber-400">
                {summary.insufficient + summary.no_registrations}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-500/30" />
          </div>
        </div>

        <div
          className={cn(
            'rounded-xl p-4 border',
            summary.ready_to_start
              ? 'bg-[#ace600]/[0.06] border-[#ace600]/20'
              : 'bg-red-500/[0.06] border-red-500/20',
          )}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1">
              Ready to Start
            </p>
            <p
              className={cn(
                'text-lg font-bold',
                summary.ready_to_start ? 'text-[#ace600]' : 'text-red-400',
              )}
            >
              {summary.ready_to_start ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </div>

      {/* START BUTTON */}
      {summary.ready_to_start && (
        <Button
          onClick={() => setShowStartConfirm(true)}
          className="w-full h-11 bg-[#ace600] hover:bg-[#c0f000] text-black font-bold text-sm gap-2"
        >
          <Play className="w-4 h-4" />
          Start Tournament
        </Button>
      )}

      {/* EVENTS GRID */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">Events</h2>

        {events.length === 0 ? (
          <div className="text-center py-10 bg-[#0d1117] border border-white/[0.08] rounded-xl">
            <p className="text-white/40">No events created yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewRegistrations={(id) =>
                  navigate(
                    `/clubs/dashboard/tournaments/${tournamentId}/events/${id}/registrations`,
                  )
                }
                onSettings={(id) =>
                  navigate(`/clubs/dashboard/tournaments/${tournamentId}/events/${id}/settings`)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* START CONFIRMATION DIALOG */}
      <AlertDialog open={showStartConfirm} onOpenChange={setShowStartConfirm}>
        <AlertDialogContent className="bg-[#0d1117] border-white/[0.08]">
          <AlertDialogTitle className="text-white">Start Tournament</AlertDialogTitle>
          <AlertDialogDescription className="text-white/60">
            Once started, the tournament cannot be modified. Groups and brackets will be generated.
            Are you sure you want to proceed?
          </AlertDialogDescription>

          <div className="bg-[#161c25] border border-white/[0.08] rounded-lg p-3 my-3">
            <p className="text-xs font-semibold text-white/60 mb-2">This will:</p>
            <ul className="space-y-1 text-xs text-white/40">
              <li className="flex items-start gap-2">
                <span className="text-[#ace600] mt-0.5">✓</span>
                <span>Lock all event configurations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ace600] mt-0.5">✓</span>
                <span>Generate groups and brackets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ace600] mt-0.5">✓</span>
                <span>Create match schedule</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ace600] mt-0.5">✓</span>
                <span>Close registration</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <AlertDialogCancel className="border-white/[0.08]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStartTournament}
              disabled={starting}
              className="bg-[#ace600] hover:bg-[#c0f000] text-black font-bold"
            >
              {starting ? 'Starting...' : 'Start Tournament'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrganizerDashboard;
