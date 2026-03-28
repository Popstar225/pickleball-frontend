import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { AppDispatch, RootState } from '@/store';
import { Venue, Court, CourtReservation } from '@/types/api';
import {
  fetchVenuesByClub,
  fetchCourtsByVenue,
  checkCourtAvailability,
  createReservation,
} from '@/store/slices/reservationSlice';
import {
  X,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Check,
  Loader,
  AlertCircle,
  Shield,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PaymentService from '@/services/paymentService';

interface ReservationFlowProps {
  clubId: string;
  clubName: string;
  onClose: () => void;
}

type FlowStep = 'venue' | 'court' | 'date-time' | 'review' | 'payment' | 'confirmation';

const STEPS: { key: FlowStep; label: string; icon: React.ReactNode }[] = [
  { key: 'venue', label: 'Negocio', icon: <MapPin className="w-4 h-4" /> },
  { key: 'court', label: 'Cancha', icon: <MapPin className="w-4 h-4" /> },
  { key: 'date-time', label: 'Fecha y Hora', icon: <Clock className="w-4 h-4" /> },
  { key: 'review', label: 'Revisión', icon: <Check className="w-4 h-4" /> },
  { key: 'payment', label: 'Pago', icon: <DollarSign className="w-4 h-4" /> },
  { key: 'confirmation', label: 'Confirmación', icon: <Check className="w-4 h-4" /> },
];

export default function ReservationFlow({ clubId, clubName, onClose }: ReservationFlowProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { venues, courts, availableTimeSlots, loading, error } = useSelector(
    (state: RootState) => state.reservation,
  );

  const [currentStep, setCurrentStep] = useState<FlowStep>('venue');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimes, setSelectedTimes] = useState<Array<{ start: string; end: string }>>([]);
  const [reservationData, setReservationData] = useState<Partial<CourtReservation>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<{ paymentId: string; clientSecret: string } | null>(null);
  const [clubStripeKey, setClubStripeKey] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<any>(null);

  // Fetch venues when component mounts
  useEffect(() => {
    if (clubId && currentStep === 'venue') {
      dispatch(fetchVenuesByClub(clubId));
    }
  }, [clubId, dispatch]);

  // Fetch courts when venue is selected
  useEffect(() => {
    if (selectedVenue && currentStep === 'court') {
      dispatch(fetchCourtsByVenue(selectedVenue.id));
    }
  }, [selectedVenue, currentStep, dispatch]);

  // Check availability when court and date are selected
  useEffect(() => {
    if (selectedCourt && selectedDate && currentStep === 'date-time') {
      dispatch(
        checkCourtAvailability({
          courtId: selectedCourt.id,
          date: selectedDate,
        }),
      );
    }
  }, [selectedCourt, selectedDate, currentStep, dispatch]);

  const handleVenueSelect = useCallback((venue: Venue) => {
    setSelectedVenue(venue);
    setCurrentStep('court');
  }, []);

  const handleCourtSelect = useCallback((court: Court) => {
    setSelectedCourt(court);
    setCurrentStep('date-time');
  }, []);

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleTimeSlotSelect = useCallback((start: string, end: string) => {
    setSelectedTimes((prev) => {
      const exists = prev.find((t) => t.start === start && t.end === end);
      if (exists) {
        return prev.filter((t) => !(t.start === start && t.end === end));
      }
      return [...prev, { start, end }];
    });
  }, []);

  const handleGoToReview = useCallback(() => {
    if (selectedCourt && selectedDate && selectedTimes.length > 0) {
      setReservationData({
        court_id: selectedCourt.id,
        club_id: clubId,
        reservation_date: selectedDate,
      });
      setCurrentStep('review');
    }
  }, [selectedCourt, selectedDate, selectedTimes, selectedVenue, clubId]);

  const handleInitPayment = useCallback(async () => {
    if (!selectedCourt || !selectedDate || selectedTimes.length === 0) {
      toast.error('Por favor selecciona todos los campos requeridos');
      return;
    }
    setIsSubmitting(true);
    try {
      const rate =
        typeof selectedCourt.hourly_rate === 'string'
          ? parseFloat(selectedCourt.hourly_rate)
          : selectedCourt.hourly_rate || 0;

      // Calculate total amount: rate * count of selected time slots
      const totalAmount = rate * selectedTimes.length;
      const timeDesc = selectedTimes.map((t) => `${t.start}–${t.end}`).join(', ');

      const res = await PaymentService.createCourtRentalPayment({
        amount: Math.round(totalAmount * 100),
        court_id: selectedCourt.id,
        club_id: clubId,
        start_time: new Date(`${selectedDate}T${selectedTimes[0].start}`).toISOString(),
        end_time: new Date(`${selectedDate}T${selectedTimes[selectedTimes.length - 1].end}`).toISOString(),
        duration_hours: selectedTimes.length,
        description: `Cancha ${selectedCourt.name} — ${selectedDate} ${timeDesc}`,
      });
      setPaymentIntent({ paymentId: res.data.payment_id, clientSecret: res.data.client_secret });
      setClubStripeKey(res.data.stripe_publishable_key ?? null);
      setCurrentStep('payment');
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo iniciar el pago');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCourt, selectedDate, selectedTimes, clubId]);

  const handlePaymentSuccess = useCallback(async () => {
    if (!selectedCourt || !selectedDate || selectedTimes.length === 0) return;
    setIsSubmitting(true);
    try {
      const rate =
        typeof selectedCourt.hourly_rate === 'string'
          ? parseFloat(selectedCourt.hourly_rate)
          : selectedCourt.hourly_rate || 0;

      // Calculate total amount: rate * count of selected time slots
      const totalAmount = rate * selectedTimes.length;

      const payload: Partial<CourtReservation> = {
        court_id: selectedCourt.id,
        club_id: clubId,
        reservation_date: selectedDate,
        start_time: new Date(`${selectedDate}T${selectedTimes[0].start}`).toISOString(),
        end_time: new Date(`${selectedDate}T${selectedTimes[selectedTimes.length - 1].end}`).toISOString(),
        purpose: reservationData.purpose || 'Court Rental',
        hourly_rate: rate,
        total_amount: totalAmount,
        final_amount: totalAmount,
        duration_hours: selectedTimes.length,
        payment_status: 'completed',
        status: 'confirmed',
        ...reservationData,
      };

      const result = await dispatch(createReservation(payload)).unwrap();
      setConfirmedReservation(result);
      toast.success('¡Reserva confirmada!');
      setCurrentStep('confirmation');
    } catch (err: any) {
      toast.error(err?.message || 'Error al crear la reserva');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCourt, selectedDate, selectedTimes, reservationData, dispatch, clubId]);

  const goToPreviousStep = () => {
    const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].key);
    }
  };

  const goToNextStep = async () => {
    // Handle confirmation step separately (last step, should close)
    if (currentStep === 'confirmation') {
      onClose();
      return;
    }

    const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
    if (stepIndex < STEPS.length - 1) {
      if (currentStep === 'date-time') {
        handleGoToReview();
      } else if (currentStep === 'review') {
        await handleInitPayment();
      } else {
        setCurrentStep(STEPS[stepIndex + 1].key);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0d1117] border-b border-white/[0.07] p-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">Reserva una cancha</h1>
            <p className="text-sm text-white/40">{clubName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="border-b border-white/[0.07] p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <button
                  onClick={() => {
                    const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
                    if (index <= stepIndex) {
                      setCurrentStep(step.key);
                    }
                  }}
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border text-xs font-bold transition-all',
                    currentStep === step.key
                      ? 'bg-[#ace600] border-[#ace600] text-black'
                      : STEPS.findIndex((s) => s.key === currentStep) > index
                        ? 'bg-green-500/20 border-green-500/40 text-green-400'
                        : 'bg-white/[0.08] border-white/[0.1] text-white/40',
                  )}
                >
                  {index + 1}
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-px mx-2 transition-colors',
                      index < STEPS.findIndex((s) => s.key === currentStep)
                        ? 'bg-green-500/40'
                        : 'bg-white/[0.1]',
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[11px] text-white/30">
            {STEPS.map((step) => (
              <div key={step.key} className="text-center">
                {step.label}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader className="w-6 h-6 text-[#ace600] animate-spin" />
              <p className="text-sm text-white/40">Cargando...</p>
            </div>
          )}

          {!loading && currentStep === 'venue' && (
            <VenueStep venues={venues} selectedVenue={selectedVenue} onSelect={handleVenueSelect} />
          )}

          {!loading && currentStep === 'court' && selectedVenue && (
            <CourtStep courts={courts} selectedCourt={selectedCourt} onSelect={handleCourtSelect} />
          )}

          {!loading && currentStep === 'date-time' && selectedCourt && (
            <DateTimeStep
              courtName={selectedCourt.name}
              availableSlots={availableTimeSlots}
              selectedDate={selectedDate}
              selectedTimes={selectedTimes}
              onDateSelect={handleDateSelect}
              onTimeSelect={handleTimeSlotSelect}
            />
          )}

          {currentStep === 'review' && (
            <ReviewStep
              clubName={clubName}
              venueName={selectedVenue?.name}
              courtName={selectedCourt?.name}
              date={selectedDate}
              times={selectedTimes}
              rate={
                typeof selectedCourt?.hourly_rate === 'string'
                  ? parseFloat(selectedCourt.hourly_rate)
                  : selectedCourt?.hourly_rate
              }
            />
          )}

          {currentStep === 'payment' && paymentIntent && clubStripeKey && (
            <Elements
              stripe={loadStripe(clubStripeKey)}
              options={{
                clientSecret: paymentIntent.clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#ace600',
                    colorBackground: '#0d1117',
                    colorText: '#ffffff',
                    colorTextSecondary: '#9ca3af',
                    colorDanger: '#f87171',
                    borderRadius: '10px',
                  },
                  rules: {
                    '.Input': { border: '1px solid rgba(255,255,255,0.12)', backgroundColor: '#0d1117' },
                    '.Label': { color: '#9ca3af', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
                  },
                },
              }}
            >
              <FlowPaymentForm
                paymentId={paymentIntent.paymentId}
                amount={
                  (typeof selectedCourt?.hourly_rate === 'string'
                    ? parseFloat(selectedCourt.hourly_rate)
                    : selectedCourt?.hourly_rate || 0) * selectedTimes.length
                }
                currency="MXN"
                onSuccess={handlePaymentSuccess}
                onBack={() => setCurrentStep('review')}
              />
            </Elements>
          )}

          {currentStep === 'confirmation' && <ConfirmationStep reservation={confirmedReservation} />}
        </div>

        {/* Footer Navigation — hidden on payment step (form has its own buttons) */}
        {currentStep !== 'payment' && (
          <div className="border-t border-white/[0.07] p-6 flex gap-3 justify-between sticky bottom-0 bg-[#0d1117]">
            <button
              onClick={goToPreviousStep}
              disabled={currentStep === 'venue' || currentStep === 'confirmation' || isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border border-white/[0.1] bg-white/[0.04] text-white/60 hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </button>

            <button
              onClick={goToNextStep}
              disabled={
                (currentStep === 'venue' && !selectedVenue) ||
                (currentStep === 'court' && !selectedCourt) ||
                (currentStep === 'date-time' && (!selectedDate || selectedTimes.length === 0)) ||
                isSubmitting ||
                loading
              }
              className="inline-flex items-center gap-2 px-6 py-2 rounded-xl font-semibold bg-[#ace600] text-black hover:bg-[#c0f000] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {currentStep === 'review' ? (
                <>
                  {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : null}
                  Ir a pagar
                </>
              ) : currentStep === 'confirmation' ? (
                <>
                  <Check className="w-4 h-4" />
                  Listo
                </>
              ) : (
                <>
                  Continuar
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step Components ────────────────────────────────────────────────────────

function VenueStep({
  venues,
  selectedVenue,
  onSelect,
}: {
  venues: Venue[];
  selectedVenue: Venue | null;
  onSelect: (venue: Venue) => void;
}) {
  if (venues.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40 mb-2">No hay negocios disponibles</p>
        <p className="text-xs text-white/20">Este club no tiene negocios disponibles todavía</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white/60 mb-4">Selecciona un negocio</p>
      {venues.map((venue) => (
        <button
          key={venue.id}
          onClick={() => onSelect(venue)}
          className={cn(
            'w-full p-4 rounded-xl border transition-all text-left group',
            selectedVenue?.id === venue.id
              ? 'bg-[#ace600]/10 border-[#ace600]/40'
              : 'bg-white/[0.04] border-white/[0.07] hover:border-white/[0.12]',
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors">
              {venue.name}
            </h3>
            <span className="text-[11px] px-2 py-1 rounded-full bg-white/[0.08] text-white/60">
              {venue.number_of_courts} canchas
            </span>
          </div>
          <p className="text-sm text-white/40 flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            {venue.address}
          </p>
          <p className="text-sm text-white/40 mt-2">${venue.base_price_per_hour}/hora</p>
        </button>
      ))}
    </div>
  );
}

function CourtStep({
  courts,
  selectedCourt,
  onSelect,
}: {
  courts: Court[];
  selectedCourt: Court | null;
  onSelect: (court: Court) => void;
}) {
  if (courts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40 mb-2">No hay canchas disponibles</p>
        <p className="text-xs text-white/20">Este negocio no tiene canchas disponibles todavía</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white/60 mb-4">Selecciona una cancha</p>
      <div className="grid grid-cols-2 gap-3">
        {courts.map((court) => (
          <button
            key={court.id}
            onClick={() => onSelect(court)}
            className={cn(
              'p-4 rounded-xl border transition-all text-left',
              selectedCourt?.id === court.id
                ? 'bg-[#ace600]/10 border-[#ace600]/40'
                : 'bg-white/[0.04] border-white/[0.07] hover:border-white/[0.12]',
            )}
          >
            <h4 className="font-semibold text-white mb-2">{court.name}</h4>
            <p className="text-xs text-white/40 mb-2">{court.court_type}</p>
            <p className="text-sm font-bold text-[#ace600]">${court.hourly_rate}/hr</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function DateTimeStep({
  courtName,
  availableSlots,
  selectedDate,
  selectedTimes,
  onDateSelect,
  onTimeSelect,
}: {
  courtName: string;
  availableSlots: Array<{ start: string; end: string; available: boolean }>;
  selectedDate: string;
  selectedTimes: Array<{ start: string; end: string }>;
  onDateSelect: (date: string) => void;
  onTimeSelect: (start: string, end: string) => void;
}) {
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-white/60 mb-3">Selecciona una fecha</p>
        <div className="grid grid-cols-4 gap-2">
          {getNextDays().map((date) => (
            <button
              key={date}
              onClick={() => onDateSelect(date)}
              className={cn(
                'p-2 rounded-lg text-xs font-semibold text-center transition-all',
                selectedDate === date
                  ? 'bg-[#ace600] text-black'
                  : 'bg-white/[0.08] text-white/60 hover:bg-white/[0.12]',
              )}
            >
              {new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white/60">Selecciona uno o más horarios</p>
            <div className="flex gap-3 text-[10px]">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#ace600]"></div>
                <span className="text-white/40">Disponible</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500/50"></div>
                <span className="text-white/40">Reservado</span>
              </div>
            </div>
          </div>
          {availableSlots.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">Sin disponibilidad para esta fecha</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot, idx) => {
                const isSelected = selectedTimes.some((t) => t.start === slot.start && t.end === slot.end);
                const isReserved = !slot.available;
                return (
                  <button
                    key={idx}
                    disabled={isReserved}
                    onClick={() => onTimeSelect(slot.start, slot.end)}
                    className={cn(
                      'p-3 rounded-lg text-sm font-semibold transition-all',
                      isReserved
                        ? 'bg-red-500/10 text-red-400 cursor-not-allowed border border-red-500/20'
                        : isSelected
                          ? 'bg-[#ace600] text-black border-2 border-[#ace600]'
                          : 'bg-white/[0.08] text-white/60 hover:bg-white/[0.12]',
                    )}
                    title={isReserved ? 'Este horario ya está reservado' : ''}
                  >
                    <div className="flex flex-col items-center">
                      <span>{slot.start} - {slot.end}</span>
                      {isReserved && <span className="text-[9px] mt-0.5">Reservado</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {selectedTimes.length > 0 && (
            <div className="mt-4 p-3 bg-[#ace600]/10 border border-[#ace600]/20 rounded-lg">
              <p className="text-xs font-semibold text-[#ace600] mb-2">Horarios seleccionados: {selectedTimes.length}</p>
              <div className="flex flex-wrap gap-2">
                {selectedTimes.map((time, idx) => (
                  <span key={idx} className="text-xs bg-[#ace600]/20 text-[#ace600] px-2.5 py-1 rounded-full">
                    {time.start} - {time.end}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewStep({
  clubName,
  venueName,
  courtName,
  date,
  times,
  rate,
}: {
  clubName: string;
  venueName?: string;
  courtName?: string;
  date: string;
  times?: Array<{ start: string; end: string }>;
  rate?: number;
}) {
  // Calculate total based on count of selected times * rate
  const timeCount = times?.length || 0;
  const totalPrice = rate && timeCount > 0 ? rate * timeCount : 0;

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-white/[0.07]">
          <span className="text-white/60 text-sm">Club</span>
          <span className="font-semibold text-white">{clubName}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-white/[0.07]">
          <span className="text-white/60 text-sm">Negocio</span>
          <span className="font-semibold text-white">{venueName}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-white/[0.07]">
          <span className="text-white/60 text-sm">Cancha</span>
          <span className="font-semibold text-white">{courtName}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-white/[0.07]">
          <span className="text-white/60 text-sm">Fecha</span>
          <span className="font-semibold text-white">
            {new Date(date).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-white/[0.07]">
          <span className="text-white/60 text-sm">Horarios</span>
          <div className="text-right">
            {times && times.length > 0 ? (
              <div className="space-y-1">
                {times.map((time, idx) => (
                  <div key={idx} className="text-sm font-semibold text-white">
                    {time.start} - {time.end}
                  </div>
                ))}
              </div>
            ) : (
              <span className="font-semibold text-white">—</span>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-white/[0.07]">
          <span className="text-white/60 text-sm">Cantidad de Horarios</span>
          <span className="font-semibold text-white">{timeCount}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-white/[0.07]">
          <span className="text-white/60 text-sm">Precio por Horario</span>
          <span className="font-semibold text-white">${rate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm font-semibold">Total a Pagar</span>
          <span className="font-bold text-[#ace600] text-lg">${totalPrice.toFixed(2)}</span>
        </div>
      </div>
      <p className="text-xs text-white/40 text-center">
        Por favor, revisa los detalles cuidadosamente antes de confirmar
      </p>
    </div>
  );
}

// ─── Stripe inner payment form for ReservationFlow ───────────────────────────

function FlowPaymentForm({
  paymentId,
  amount,
  currency,
  onSuccess,
  onBack,
}: {
  paymentId: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsPaying(true);
    setPayError(null);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });
      if (error) {
        setPayError(error.message || 'El pago falló');
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        await PaymentService.confirmPayment(paymentId, { payment_intent_id: paymentIntent.id });
        onSuccess();
      }
    } catch (err: any) {
      setPayError(err?.message || 'Error al confirmar el pago');
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-5">
        <p className="text-sm text-white/60 mb-1">Total a pagar</p>
        <div className="text-4xl font-bold text-[#ace600]">
          ${amount.toFixed(2)} <span className="text-base text-white/40">{currency}</span>
        </div>
      </div>

      <PaymentElement />

      {payError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <p className="text-sm text-red-400">{payError}</p>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[11px] text-white/25">
        <Shield className="w-3 h-3" /> Pago seguro con cifrado SSL
      </div>

      <div className="flex gap-3 pt-2 border-t border-white/[0.07]">
        <button
          type="button"
          onClick={onBack}
          disabled={isPaying}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border border-white/[0.1] bg-white/[0.04] text-white/60 hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Atrás
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || isPaying}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-semibold bg-[#ace600] text-black hover:bg-[#c0f000] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isPaying
            ? <><Loader2 className="w-4 h-4 animate-spin" />Procesando…</>
            : `Pagar $${amount.toFixed(2)} ${currency}`}
        </button>
      </div>
    </form>
  );
}

function ConfirmationStep({ reservation }: { reservation?: any }) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-[#ace600]/20 border border-[#ace600]/40 flex items-center justify-center">
        <Check className="w-8 h-8 text-[#ace600]" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-1">¡Reserva confirmada!</h3>
        <p className="text-sm text-white/40">Tu cancha ha sido reservada exitosamente</p>
      </div>
      {reservation?.id && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 mt-4 text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-white/40">ID de reserva</span>
            <span className="font-mono font-bold text-white/80">
              #{String(reservation.id).slice(0, 8).toUpperCase()}
            </span>
          </div>
          {reservation.total_amount != null && (
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Total pagado</span>
              <span className="font-bold text-[#ace600]">${Number(reservation.total_amount).toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-white/30">Recibirás una confirmación por correo electrónico</p>
    </div>
  );
}
