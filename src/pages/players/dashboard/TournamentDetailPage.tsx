/**
 * Player Tournament Detail View
 *
 * Comprehensive tournament information for players including:
 * - Tournament overview and key info
 * - Eligibility assessment
 * - Event selection and registration
 * - Partner selection for doubles
 * - Registration status tracking
 *
 * @author Pickleball Federation Team
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Trophy,
  MapPin,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
  Shield,
  Heart,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { RootState } from '@/store';
import { cn } from '@/lib/utils';

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface TournamentPlayerViewData {
  tournament: Tournament;
  events: EventDetail[];
  player: PlayerInfo;
}

interface Tournament {
  id: string;
  name: string;
  type: 'local' | 'state' | 'national';
  dates: {
    start: string;
    end: string;
    registration_deadline: string;
  };
  location: {
    venue: string;
    state: string;
    city: string;
  };
  is_endorsed: boolean;
}

interface EventDetail {
  event_id: string;
  skill_block: string;
  gender: string;
  modality: string;
  max_participants: number;
  current_participants: number;
  eligible: boolean;
  registered: boolean;
  status?: string;
  ineligibility_reasons: string[];
}

interface PlayerInfo {
  skill_level: string;
  gender: string;
  has_active_penalties: boolean;
}

const typeBadge: Record<string, string> = {
  local: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  state: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  national: 'bg-[#ace600]/10 text-[#ace600] border-[#ace600]/20',
};

const typeLabel: Record<string, string> = {
  local: 'Local (City/Area)',
  state: 'State (Federal Entity)',
  national: 'National Championship',
};

const EventCard: React.FC<{
  event: EventDetail;
  onRegister: (eventId: string) => void;
  isRegistering: boolean;
}> = ({ event, onRegister, isRegistering }) => {
  const capacityPercent = (event.current_participants / event.max_participants) * 100;
  const isFull = event.current_participants >= event.max_participants;

  return (
    <Card className="border-white/[0.08] bg-[#0d1117]">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Event Title */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                {event.skill_block} {event.gender}'s {event.modality}
              </h3>
              <p className="text-xs text-white/30 mt-0.5">
                {event.modality === 'Doubles' ? 'Teams' : 'Players'}: {event.current_participants}/
                {event.max_participants}
              </p>
            </div>

            {/* Status Badge */}
            {event.registered ? (
              <Badge className="bg-[#ace600]/10 text-[#ace600] border-[#ace600]/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Registered
              </Badge>
            ) : isFull ? (
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                <Clock className="w-3 h-3 mr-1" />
                Waitlist
              </Badge>
            ) : event.eligible ? (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Zap className="w-3 h-3 mr-1" />
                Available
              </Badge>
            ) : (
              <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                <XCircle className="w-3 h-3 mr-1" />
                Ineligible
              </Badge>
            )}
          </div>

          {/* Capacity Bar */}
          <div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  capacityPercent >= 100
                    ? 'bg-red-500'
                    : capacityPercent >= 80
                      ? 'bg-amber-500'
                      : 'bg-[#ace600]',
                )}
                style={{ width: `${Math.min(capacityPercent, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-white/25 mt-1">{capacityPercent.toFixed(0)}% Full</p>
          </div>

          {/* Ineligibility Reasons */}
          {!event.eligible && event.ineligibility_reasons.length > 0 && (
            <div className="space-y-1">
              {event.ineligibility_reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-red-400/70">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-white/[0.05]">
            {event.registered ? (
              <Button
                disabled
                size="sm"
                className="w-full h-8 bg-white/[0.05] text-white/50 text-xs font-semibold"
              >
                Already Registered
              </Button>
            ) : (
              <Button
                onClick={() => onRegister(event.event_id)}
                disabled={!event.eligible || isRegistering || isFull}
                variant={event.eligible && !isFull ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'w-full h-8 text-xs font-semibold',
                  event.eligible && !isFull ? 'bg-[#ace600] hover:bg-[#c0f000] text-black' : '',
                )}
              >
                {isRegistering ? 'Registering...' : isFull ? 'Join Waitlist' : 'Register'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TournamentDetailPage: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    loadTournamentDetails();
  }, [tournamentId]);

  const loadTournamentDetails = async () => {
    try {
      setLoading(true);
      const response = (await api.get(
        `/tournaments/${tournamentId}/player-view`,
      )) as ApiResponse<TournamentPlayerViewData>;

      setTournament(response.data.tournament);
      setEvents(response.data.events);
      setPlayerInfo(response.data.player);
    } catch (err: any) {
      setError(err.message || 'Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      setRegistering(eventId);
      await api.post('/registrations', {
        tournament_event_id: eventId,
      });

      // Reload to update status
      await loadTournamentDetails();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setRegistering(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-white/40">Loading tournament details...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-white/60">Tournament not found</p>
      </div>
    );
  }

  const daysUntilStart = Math.ceil(
    (new Date(tournament.dates.start).getTime() - Date.now()) / 86400000,
  );

  const eligibleEvents = events.filter((e) => e.eligible).length;
  const registeredEvents = events.filter((e) => e.registered).length;

  return (
    <div className="space-y-6 pb-10">
      {/* ERROR BANNER */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">{tournament.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn('border', typeBadge[tournament.type])}>
                {typeLabel[tournament.type]}
              </Badge>

              {tournament.is_endorsed && (
                <Badge className="bg-[#ace600]/10 text-[#ace600] border-[#ace600]/20">
                  <Shield className="w-3 h-3 mr-1" />
                  Endorsed
                </Badge>
              )}

              {daysUntilStart <= 7 && daysUntilStart > 0 && (
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                  <Zap className="w-3 h-3 mr-1" />
                  Registrations Closing Soon
                </Badge>
              )}
            </div>
          </div>

          <Button onClick={() => navigate(-1)} variant="outline" className="border-white/[0.08]">
            Back
          </Button>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0d1117] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-white/40" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Dates</p>
          </div>
          <p className="text-sm font-semibold text-white">
            {new Date(tournament.dates.start).toLocaleDateString()} -{' '}
            {new Date(tournament.dates.end).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-[#0d1117] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-white/40" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
              Location
            </p>
          </div>
          <p className="text-sm font-semibold text-white">{tournament.location.city}</p>
          <p className="text-[10px] text-white/40">{tournament.location.state}</p>
        </div>

        <div className="bg-[#0d1117] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-white/40" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
              Registration Closes
            </p>
          </div>
          <p className="text-sm font-semibold text-white">
            {new Date(tournament.dates.registration_deadline).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-[#0d1117] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-white/40" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
              Your Status
            </p>
          </div>
          <p className="text-sm font-semibold text-[#ace600]">{registeredEvents} Registered</p>
          <p className="text-[10px] text-white/40">{eligibleEvents} Eligible</p>
        </div>
      </div>

      {/* PLAYER INFO */}
      {playerInfo && (
        <div className="bg-[#0d1117] border border-white/[0.08] rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">Your Information</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-white/40 mb-1">Skill Level</p>
              <p className="text-sm font-semibold text-white">{playerInfo.skill_level}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 mb-1">Gender</p>
              <p className="text-sm font-semibold text-white">{playerInfo.gender}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 mb-1">Status</p>
              <div className="flex items-center gap-1">
                {playerInfo.has_active_penalties ? (
                  <>
                    <XCircle className="w-3 h-3 text-red-400" />
                    <p className="text-sm font-semibold text-red-400">Penalties</p>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <p className="text-sm font-semibold text-emerald-400">Good Standing</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVENTS */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">Available Events</h2>

        {events.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-white/40">No events available for this tournament yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {events.map((event) => (
              <EventCard
                key={event.event_id}
                event={event}
                onRegister={handleRegister}
                isRegistering={registering === event.event_id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentDetailPage;
