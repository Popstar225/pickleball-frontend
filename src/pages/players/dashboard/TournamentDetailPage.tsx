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
  Loader2,
  ChevronLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/payment/StripeProvider';
import { PaymentForm } from '@/components/payment/PaymentForm';
import PaymentService from '@/services/paymentService';
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
  entry_fee?: number; // in cents; defaults to 5000 (MXN $50.00)
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

// ---------------------------------------------------------------------------
// EventPaymentDialog — two-step Stripe checkout for a single tournament event
// Pattern mirrors MembershipSelector:
//   Step 1: event "plan card" with entry fee + features + CTA (API call on click)
//   Step 2: horizontal summary strip + Elements > PaymentForm + back button
// ---------------------------------------------------------------------------
interface EventPaymentDialogProps {
  event: EventDetail;
  tournament: Tournament;
  onSuccess: () => void;
  onClose: () => void;
}

const EventPaymentDialog: React.FC<EventPaymentDialogProps> = ({
  event,
  tournament,
  onSuccess,
  onClose,
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    clientSecret: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // entry_fee is in cents. Fall back to MXN $50.00 if not provided by backend.
  const entryFee = event.entry_fee ?? 5000;
  const entryFeeFormatted = (entryFee / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 });
  const eventLabel = `${event.skill_block} ${event.gender}'s ${event.modality}`;
  const isFull = event.current_participants >= event.max_participants;

  // Matches MembershipSelector.handleSelectPlan — API call fires on CTA click
  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await PaymentService.createTournamentRegistrationPayment({
        tournament_event_id: event.event_id,
      });
      if (!res.success || !res.data) throw new Error('No se pudo crear la solicitud de pago');
      setPaymentData({ paymentId: res.data.payment_id, clientSecret: res.data.client_secret });
      setShowPayment(true);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el evento');
    } finally {
      setLoading(false);
    }
  };

  // Matches MembershipSelector.handlePaymentSuccess
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!paymentData) return;
    try {
      await PaymentService.confirmTournamentRegistrationPayment(
        paymentData.paymentId,
        paymentIntentId,
      );
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al confirmar la inscripción');
    }
  };

  const handleClose = () => {
    setShowPayment(false);
    setPaymentData(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'font-["DM_Sans",sans-serif] bg-[#06080E] border border-[#ace600]/[0.12]',
          'rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8),0_0_80px_rgba(172,230,0,0.04)]',
          'max-w-md p-0 overflow-hidden',
          '[&>button]:text-white/30 [&>button]:hover:text-white [&>button]:border-none',
        )}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-[#ace600]/[0.07]">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-[8px] bg-[#ace600]/[0.08] border border-[#ace600]/[0.15] flex items-center justify-center flex-shrink-0">
                <Trophy className="w-3.5 h-3.5 text-[#ace600]" />
              </div>
              <DialogTitle className="font-sans font-extrabold text-[18px] text-white tracking-tight">
                Inscripción al Evento
              </DialogTitle>
            </div>
            <DialogDescription className="text-white/35 text-[13px] ml-9">
              {tournament.name}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-3.5 bg-[#FF5A1F]/[0.08] border border-[#FF5A1F]/[0.25] rounded-xl">
              <AlertCircle className="w-4 h-4 text-[#FF5A1F] flex-shrink-0" />
              <p className="text-[13px] text-[#FF5A1F]">{error}</p>
            </div>
          )}

          {/* ── Payment step (mirrors MembershipSelector payment section) ── */}
          {showPayment && paymentData ? (
            <div className="space-y-4">
              {/* Horizontal summary strip — matches MembershipSelector */}
              <div className="flex items-center justify-between p-4 bg-[#ace600]/[0.05] border border-[#ace600]/[0.15] rounded-xl">
                <div>
                  <p className="font-sans font-extrabold text-[14px] text-white">{eventLabel}</p>
                  <p className="text-[12px] text-white/40 mt-0.5">{tournament.name}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-sans font-extrabold text-[22px] leading-none text-[#ace600]">
                    ${entryFeeFormatted}
                  </p>
                  <p className="text-[11px] text-white/30 mt-0.5">MXN / evento</p>
                </div>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
                <PaymentForm
                  paymentId={paymentData.paymentId}
                  clientSecret={paymentData.clientSecret}
                  amount={entryFee}
                  currency="mxn"
                  description={`${eventLabel} — ${(entryFee / 100).toFixed(2)} MXN`}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => { setError(err); setShowPayment(false); }}
                />
              </Elements>

              <Button
                onClick={() => setShowPayment(false)}
                variant="ghost"
                className="w-full text-white/40 hover:text-white hover:bg-white/[0.05] rounded-xl gap-2 text-[13px]"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Volver al evento
              </Button>
            </div>
          ) : (
            /* ── Plan card (mirrors MembershipSelector plan card) ── */
            <div className="relative rounded-2xl p-5 border bg-[#ace600]/[0.05] border-[#ace600]/[0.3] overflow-hidden">
              {/* Popular ribbon */}
              <div className="absolute top-3 right-[-34px] bg-[#ace600] text-black px-10 py-0.5 rotate-45 font-sans text-[9px] font-extrabold tracking-[1px]">
                EVENT
              </div>

              {/* Icon + type label */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-[9px] bg-[#ace600]/[0.08] border border-[#ace600]/[0.15] flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-[#ace600]" />
                </div>
                <span className="text-[10px] font-bold font-sans tracking-[1.5px] uppercase text-[#ace600]">
                  Inscripción
                </span>
              </div>

              {/* Event name + description */}
              <h3 className="font-sans font-extrabold text-[16px] text-white mb-0.5">{eventLabel}</h3>
              <p className="text-[12px] text-white/35 mb-4 leading-relaxed">
                {isFull
                  ? 'El evento está lleno — se te añadirá a la lista de espera'
                  : `${event.max_participants - event.current_participants} lugares disponibles de ${event.max_participants}`}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1.5 mb-5">
                <span className="font-sans font-extrabold text-[34px] leading-none tracking-tight text-[#ace600]">
                  ${entryFeeFormatted}
                </span>
                <span className="text-[12px] text-white/30">MXN</span>
                <span className="text-[12px] text-white/25">/ evento</span>
              </div>

              <div className="h-px bg-white/[0.06] mb-4" />

              {/* Features */}
              <ul className="space-y-2.5 mb-5">
                {[
                  `Categoría: ${event.skill_block}`,
                  `Género: ${event.gender}`,
                  `Modalidad: ${event.modality}`,
                  'Inscripción oficial al torneo',
                  isFull ? 'Lugar en lista de espera' : 'Lugar confirmado al pagar',
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-[12px] text-white/60">
                    <div className="w-4 h-4 rounded-full bg-[#ace600]/[0.1] border border-[#ace600]/[0.2] flex items-center justify-center flex-shrink-0 mt-px">
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#ace600]" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                onClick={handleRegister}
                disabled={loading}
                className="w-full rounded-xl font-sans font-extrabold text-[13px] gap-2 bg-[#ace600] text-black hover:bg-[#c0f000] shadow-[0_4px_18px_rgba(172,230,0,0.25)] disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                ) : (
                  `Inscribirse · $${entryFeeFormatted} MXN`
                )}
              </Button>
            </div>
          )}

          {/* Security note */}
          {!showPayment && (
            <div className="flex items-center justify-center gap-2 text-[11px] text-white/20">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Pagos procesados de forma segura con Stripe
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// EventCard
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// TournamentDetailPage
// ---------------------------------------------------------------------------
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

  // The event currently awaiting payment
  const [paymentEvent, setPaymentEvent] = useState<EventDetail | null>(null);

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

  // Step 1: open the Stripe payment dialog for the selected event
  const handleRegister = (eventId: string) => {
    const event = events.find((e) => e.event_id === eventId);
    if (event) {
      setError(null);
      setPaymentEvent(event);
    }
  };

  // Step 2: called by EventPaymentDialog after Stripe + confirmTournamentRegistrationPayment succeed
  const handlePaymentSuccess = async () => {
    setPaymentEvent(null);
    await loadTournamentDetails();
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
      {/* STRIPE PAYMENT DIALOG */}
      {paymentEvent && tournament && (
        <EventPaymentDialog
          event={paymentEvent}
          tournament={tournament}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPaymentEvent(null)}
        />
      )}

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
