import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  Users,
  CreditCard,
  Info,
  Lock,
  ArrowLeft,
  Zap,
  Check,
  AlertTriangle,
  ChevronRight,
  User,
  Mail,
  Star,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { TournamentEvent, EligibilityCheckResult, ApiResponse } from '@/types/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Props ────────────────────────────────────────────────────────────────────
interface PlayerSinglesRegistrationProps {
  tournamentId: string;
  userId: string;
  userName: string;
  skillLevel: string;
  userEmail: string;
  onRegistrationComplete?: (registrationId: string, paymentRequired: boolean) => void;
  onPaymentRequired?: (amount: number, registrationId: string) => void;
}

type Step =
  | 'event-selection'
  | 'eligibility-check'
  | 'partner-selection'
  | 'payment-review'
  | 'confirmation';

const STEPS: Step[] = [
  'event-selection',
  'eligibility-check',
  'partner-selection',
  'payment-review',
  'confirmation',
];
const STEP_LABELS = ['Evento', 'Elegibilidad', 'Compañero', 'Pago', 'Confirmación'];

// ─── Shared atoms ─────────────────────────────────────────────────────────────
function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-6 h-6 rounded-md bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3 text-[#ace600]" />
      </div>
      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/30">
        {children}
      </span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-white/30 font-medium">{label}</span>
      <span className="text-xs text-white/70 font-semibold text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  // show toast when message changes; component itself renders nothing.
  useEffect(() => {
    toast.error(msg);
  }, [msg]);

  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PlayerSinglesRegistration({
  tournamentId,
  userId,
  userName,
  skillLevel,
  userEmail,
  onRegistrationComplete,
  onPaymentRequired,
}: PlayerSinglesRegistrationProps) {
  const [step, setStep] = useState<Step>('event-selection');
  const [events, setEvents] = useState<TournamentEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registering, setRegistering] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<TournamentEvent | null>(null);
  const [eventEntryFee, setEventEntryFee] = useState(50);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityCheckResult | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [availablePartners, setAvailablePartners] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank-transfer'>('card');
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [registrationResponse, setRegistrationResponse] = useState<any>(null);

  useEffect(() => {
    fetchAvailableEvents();
  }, [tournamentId]);

  // Auto-check eligibility when reaching eligibility-check step
  useEffect(() => {
    if (step === 'eligibility-check' && selectedEvent && !eligibilityResult) {
      checkEligibility();
    }
  }, [step, selectedEvent?.id]);

  const fetchAvailableEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<any>>(`/tournaments/${tournamentId}/events`);
      const data = Array.isArray(response)
        ? response
        : Array.isArray((response as any).events)
          ? (response as any).events
          : [];
      setEvents(data as TournamentEvent[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!selectedEvent || !userId) return;

    try {
      const params = new URLSearchParams({ user_id: userId });
      const response = await api.get<any>(
        `/tournaments/${tournamentId}/events/${selectedEvent.id}/check-eligibility?${params}`,
      );
      const eligibilityData = response?.data || response;
      setEligibilityResult(eligibilityData);
      handleEligibilityComplete(eligibilityData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error checking eligibility';
      setError(message);
    }
  };

  const handleEventSelect = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setEligibilityResult(null);
      setEventEntryFee(50);
      setError(null);
      setStep('eligibility-check');
    }
  };

  const handleEligibilityComplete = (result: EligibilityCheckResult) => {
    setEligibilityResult(result);
  };

  const handleProceedToRegistration = async () => {
    console.log('➡️ Proceeding to registration with eligibility result:', eligibilityResult);
    if (!selectedEvent || !eligibilityResult?.eligible) {
      toast('Eligibility check required before registration!');
      return;
    }

    try {
      setRegistering(true);
      setError(null);

      // Create registration request with all required fields
      const registrationPayload = {
        user_id: userId,
        partner_user_id: selectedEvent.modality !== 'Singles' ? selectedPartnerId : undefined,
        ranking_points: parseFloat(skillLevel) || 0,
        // Event details required by database
        skill_block: selectedEvent.skill_block,
        gender: selectedEvent.gender,
        modality: selectedEvent.modality,
        entry_fee: eventEntryFee,
      };

      console.log('📤 Sending registration payload:', registrationPayload);

      // Call backend registration endpoint
      const response = await api.post<any>(
        `/tournaments/${tournamentId}/events/${selectedEvent.id}/register`,
        registrationPayload,
      );

      // Legacy code also does `const registration = (regRes as any).data;`
      // But based on controller response, the data should be in response.registration
      const registrationData = (response as any).registration || (response as any).data;

      if (registrationData && registrationData.id) {
        setRegistrationResponse(registrationData);
        // Move to payment review
        setStep('payment-review');
        toast.success('¡Inscripción registrada! Procede al pago.');
      } else {
        setError('Registration failed: Invalid response from server');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMsg);
      console.error('🔴 Registration error:', errorMsg);
    } finally {
      setRegistering(false);
    }
  };

  const fetchAvailablePartners = async () => {
    try {
      const res = await api.get<ApiResponse<any>>(
        `/tournaments/${tournamentId}/available-partners?user_id=${userId}&event_id=${selectedEvent?.id}`,
      );
      setAvailablePartners(res.data as any);
    } catch {
      /* silent */
    }
  };

  const handlePaymentSubmit = async () => {
    if (!agreementAccepted) {
      setError('Acepta los términos y condiciones para continuar');
      return;
    }
    try {
      setRegistering(true);
      setError(null);
      const payload = {
        user_id: userId,
        partner_user_id: selectedEvent?.modality !== 'Singles' ? selectedPartnerId : undefined,
        ranking_points: selectedEvent?.skill_block || '3.5',
        entry_fee: eventEntryFee,
        payment_status: 'pending',
      };
      const regRes = await api.post<ApiResponse<any>>(
        `/tournaments/${tournamentId}/events/${selectedEvent?.id}/register`,
        payload,
      );
      const registration = (regRes as any).registration;
      setRegistrationResponse(registration);
      onPaymentRequired?.(eventEntryFee, registration?.id);

      await api.post<ApiResponse<any>>('/payments', {
        user_id: userId,
        tournament_id: tournamentId,
        registration_id: registration?.id,
        amount: eventEntryFee,
        payment_method: paymentMethod,
        payment_type: 'tournament_entry',
        status: 'confirm',
      });
      setSuccess(true);
      onRegistrationComplete?.(registration?.id, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar pago');
    } finally {
      setRegistering(false);
    }
  };

  const handleBack = () => {
    if (step === 'payment-review') {
      if (selectedEvent?.modality === 'Singles') {
        setStep('eligibility-check');
      } else {
        setStep('partner-selection');
      }
    } else if (step === 'partner-selection') {
      setStep('eligibility-check');
    } else if (step === 'eligibility-check') {
      setStep('event-selection');
      setSelectedEvent(null);
      setEligibilityResult(null);
    }
  };

  const handleReset = () => {
    setStep('event-selection');
    setSelectedEvent(null);
    setEligibilityResult(null);
    setSelectedPartnerId('');
    setSuccess(false);
    setRegistrationResponse(null);
    setError(null);
    setAgreementAccepted(false);
  };

  const serviceFee = eventEntryFee * 0.05;
  const total = eventEntryFee + serviceFee;
  const currentIdx = STEPS.indexOf(step);

  // ── Success screen ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="bg-[#080c14] border border-white/[0.07] rounded-2xl overflow-hidden">
        {/* Success header */}
        <div className="h-1 bg-[#ace600]" />
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">¡Inscripción Completa!</h3>
              <p className="text-xs text-white/30">Tu lugar ha sido reservado</p>
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-1">
            <SectionHeading icon={Trophy}>Detalle de Inscripción</SectionHeading>
            <InfoRow
              label="Evento"
              value={`${selectedEvent?.skill_block} ${selectedEvent?.gender} ${selectedEvent?.modality}`}
            />
            <InfoRow label="Jugador" value={userName} />
            <InfoRow label="Email" value={userEmail} />
            <InfoRow
              label="ID Registro"
              value={
                <span className="font-mono text-[10px]">{registrationResponse?.id ?? '—'}</span>
              }
            />
            <InfoRow label="Cuota de Entrada" value={`$${eventEntryFee.toFixed(2)} MXN`} />
          </div>

          {/* Status badges */}
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Inscrito
            </Badge>
            <Badge
              variant="outline"
              className="gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 border-amber-500/20 text-amber-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Pago Pendiente
            </Badge>
          </div>

          {/* Info banners */}
          <div className="flex items-start gap-3 p-3.5 bg-sky-500/[0.06] border border-sky-500/15 rounded-xl">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-xs text-sky-400/80 leading-relaxed">
              Inscripción confirmada. Se ha enviado un enlace de pago a <strong>{userEmail}</strong>
              . Completa el pago para asegurar tu lugar.
            </p>
          </div>
          <div className="flex items-start gap-3 p-3.5 bg-amber-500/[0.05] border border-amber-500/15 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-400/70 leading-relaxed">
              <strong>Importante:</strong> Completa el pago en las próximas 24 horas o tu lugar
              podría ser liberado.
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs transition-all"
            >
              Inscribir Otro Evento
            </Button>
            <Button className="h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold gap-1.5 shadow-[0_0_12px_rgba(172,230,0,0.15)] transition-all">
              <CreditCard className="w-3.5 h-3.5" /> Pagar Ahora
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Progress bar ──────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const done = currentIdx > i;
            const active = currentIdx === i;
            // Skip partner-selection step visually if singles
            const isPartnerStep = s === 'partner-selection';
            return (
              <div
                key={s}
                className={cn('flex items-center', i < STEPS.length - 1 ? 'flex-1' : '')}
              >
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
                      done
                        ? 'bg-[#ace600] text-black'
                        : active
                          ? 'bg-[#ace600]/20 border-2 border-[#ace600] text-[#ace600]'
                          : 'bg-white/[0.05] border border-white/[0.08] text-white/20',
                    )}
                  >
                    {done ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-[9px] font-bold uppercase tracking-wider hidden sm:block',
                      active ? 'text-[#ace600]' : done ? 'text-white/40' : 'text-white/15',
                    )}
                  >
                    {STEP_LABELS[i]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-px mx-2 transition-all',
                      done ? 'bg-[#ace600]/40' : 'bg-white/[0.06]',
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Global error ──────────────────────────────────────────────────────── */}
      {error && <ErrorBanner msg={error} />}

      {/* ────────────────────────────────────────────────────────────────────────
          STEP 1 — Event selection
      ──────────────────────────────────────────────────────────────────────── */}
      {step === 'event-selection' && (
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 space-y-5">
          <SectionHeading icon={Trophy}>Selecciona un Evento</SectionHeading>

          {/* Player card */}
          <div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-xs font-bold text-[#ace600] shrink-0">
              {userName
                ?.split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white/80 truncate">{userName}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[11px] text-white/30 flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" />
                  {skillLevel}
                </span>
                <span className="text-[11px] text-white/30 flex items-center gap-1">
                  <Mail className="w-2.5 h-2.5" />
                  {userEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Events */}
          {loading ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
              <p className="text-xs text-white/25">Cargando eventos…</p>
            </div>
          ) : events.filter((e) => e.modality === 'Singles').length === 0 ? (
            <div className="flex items-start gap-3 p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <AlertCircle className="w-4 h-4 text-white/25 shrink-0 mt-0.5" />
              <p className="text-xs text-white/35">
                No hay eventos disponibles para inscripción en este momento.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {events
                .filter((e) => e.modality === 'Singles')
                .map((event) => {
                  const isFull = event.current_participants >= event.max_participants;
                  const isOpen = event.registration_status === 'open' || !event.registration_status;
                  const fillPct = event.max_participants
                    ? Math.round((event.current_participants / event.max_participants) * 100)
                    : 0;

                  return (
                    <button
                      key={event.id}
                      onClick={() => isOpen && handleEventSelect(event.id)}
                      disabled={!isOpen}
                      className={cn(
                        'group w-full text-left p-4 rounded-2xl border transition-all',
                        isOpen
                          ? 'bg-white/[0.02] border-white/[0.07] hover:border-[#ace600]/30 hover:bg-[#ace600]/[0.03] cursor-pointer'
                          : 'bg-white/[0.01] border-white/[0.04] cursor-not-allowed opacity-40',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-sm font-bold text-white/75 group-hover:text-white transition-colors">
                            {event.skill_block} {event.gender} {event.modality}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0',
                              isOpen
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20',
                            )}
                          >
                            {isOpen ? 'Abierto' : 'Cerrado'}
                          </Badge>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#ace600] shrink-0 mt-0.5 transition-colors" />
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                        {[
                          {
                            icon: Users,
                            val: `${event.current_participants ?? 0}/${event.max_participants ?? 0} inscritos`,
                          },
                          { icon: CreditCard, val: '$50 MXN' },
                        ].map(({ icon: Icon, val }, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-white/30">
                            <Icon className="w-3 h-3 text-white/20" />
                            {val}
                          </div>
                        ))}
                      </div>

                      <div className="h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            fillPct >= 90
                              ? 'bg-red-500'
                              : fillPct >= 70
                                ? 'bg-amber-500'
                                : 'bg-[#ace600]',
                          )}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>

                      {isFull && (
                        <p className="text-[11px] text-amber-400/70 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Evento lleno — podrías quedar en lista de espera
                        </p>
                      )}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          STEP 2 — Eligibility check result
      ──────────────────────────────────────────────────────────────────────── */}
      {step === 'eligibility-check' && selectedEvent && (
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 space-y-5">
          <SectionHeading icon={CheckCircle2}>Verificación de Elegibilidad</SectionHeading>

          {!eligibilityResult ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
              <p className="text-xs text-white/25">Verificando elegibilidad…</p>
            </div>
          ) : (
            <div className="space-y-4">
              {eligibilityResult.eligible ? (
                <div className="flex items-start gap-3 p-4 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-emerald-400">
                    ¡Eres elegible para este evento!
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-400 mb-1">
                      No eres elegible para este evento
                    </p>
                    <p className="text-xs text-red-400/70">
                      {eligibilityResult.reasons?.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {eligibilityResult.playerInfo && (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <InfoRow
                    label="Nivel de Juego"
                    value={eligibilityResult.playerInfo.skill_block}
                  />
                  <InfoRow
                    label="Membresía"
                    value={eligibilityResult.playerInfo.membership_status || 'Activa'}
                  />
                  {eligibilityResult.warnings?.length > 0 && (
                    <InfoRow label="Advertencias" value={eligibilityResult.warnings.join(', ')} />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Atrás
            </Button>
            {eligibilityResult?.eligible && (
              <Button
                onClick={() => setStep('payment-review')}
                className="flex-1 h-9 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold gap-1.5 shadow-[0_0_12px_rgba(172,230,0,0.15)] transition-all"
              >
                Continuar al Pago <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          STEP 3 — Payment review
      ──────────────────────────────────────────────────────────────────────── */}
      {step === 'payment-review' && selectedEvent && (
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 space-y-5">
          <SectionHeading icon={CreditCard}>Revisión de Pago</SectionHeading>

          {/* Order summary */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">
              Resumen del Pedido
            </p>
            <InfoRow
              label="Evento"
              value={`${selectedEvent.skill_block} ${selectedEvent.gender}`}
            />
            <InfoRow label="Modalidad" value={selectedEvent.modality} />
            <div className="my-2 h-px bg-white/[0.05]" />
            <InfoRow label="Cuota de Entrada" value={`$${eventEntryFee.toFixed(2)}`} />
            <InfoRow
              label="Cargo de Servicio (5%)"
              value={<span className="text-amber-400">${serviceFee.toFixed(2)}</span>}
            />
            <div className="mt-2 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-white/25">
                Total
              </span>
              <span className="text-lg font-bold text-[#ace600]">${total.toFixed(2)} MXN</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
              Método de Pago
            </p>
            {(
              [
                {
                  key: 'card',
                  label: 'Tarjeta Crédito / Débito',
                  sub: 'Visa, Mastercard, American Express',
                  icon: CreditCard,
                },
                {
                  key: 'bank-transfer',
                  label: 'Transferencia Bancaria',
                  sub: 'ACH o Wire Transfer (2-3 días hábiles)',
                  icon: Lock,
                },
              ] as {
                key: 'card' | 'bank-transfer';
                label: string;
                sub: string;
                icon: React.ElementType;
              }[]
            ).map(({ key, label, sub, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPaymentMethod(key)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                  paymentMethod === key
                    ? 'bg-[#ace600]/[0.06] border-[#ace600]/30'
                    : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.13]',
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all',
                    paymentMethod === key
                      ? 'bg-[#ace600]/10 border-[#ace600]/20'
                      : 'bg-white/[0.04] border-white/[0.07]',
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4',
                      paymentMethod === key ? 'text-[#ace600]' : 'text-white/25',
                    )}
                  />
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-semibold transition-colors',
                      paymentMethod === key ? 'text-white' : 'text-white/60',
                    )}
                  >
                    {label}
                  </p>
                  <p className="text-[11px] text-white/25">{sub}</p>
                </div>
                <div
                  className={cn(
                    'ml-auto w-4 h-4 rounded-full border-2 shrink-0 transition-all',
                    paymentMethod === key ? 'border-[#ace600] bg-[#ace600]' : 'border-white/20',
                  )}
                />
              </button>
            ))}
          </div>

          {/* Terms */}
          <button
            onClick={() => setAgreementAccepted((p) => !p)}
            className={cn(
              'w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all',
              agreementAccepted
                ? 'bg-[#ace600]/[0.05] border-[#ace600]/20'
                : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.12]',
            )}
          >
            <div
              className={cn(
                'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                agreementAccepted ? 'bg-[#ace600] border-[#ace600]' : 'border-white/20',
              )}
            >
              {agreementAccepted && <Check className="w-3 h-3 text-black" />}
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Acepto las <span className="text-white/70 font-semibold">reglas del torneo</span> y
              los <span className="text-white/70 font-semibold">términos y condiciones</span>.
              Entiendo que el pago es no reembolsable 48 horas antes del inicio.
            </p>
          </button>

          {/* Security note */}
          <div className="flex items-center gap-2.5 text-xs text-white/20">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            Tu información de pago está protegida con cifrado SSL
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Atrás
            </Button>
            <Button
              onClick={handlePaymentSubmit}
              disabled={registering || !agreementAccepted}
              className={cn(
                'flex-1 h-9 rounded-xl text-xs font-bold gap-1.5 transition-all',
                agreementAccepted && !registering
                  ? 'bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.15)]'
                  : 'bg-white/[0.05] border border-white/[0.06] text-white/20 cursor-not-allowed',
              )}
            >
              {registering ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando…
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5" /> Proceder al Pago — ${total.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
