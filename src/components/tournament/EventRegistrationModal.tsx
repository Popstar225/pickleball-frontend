/**
 * EventRegistrationModal.tsx
 *
 * Modal for registering player for a specific tournament event
 * Handles eligibility checking, partner selection, and registration
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  Trophy,
  Lock,
  Info,
  AlertTriangle,
  Heart,
  // XMarkIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import PlayerRegistrationService, {
  type EligibilityCheckResult,
} from '@/services/playerRegistrationService';
import type { RootState } from '@/store';
import type { TournamentEvent } from '@/types/api';
import { cn } from '@/lib/utils';

interface EventRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: TournamentEvent | null;
  tournamentId: string;
  onRegistrationSuccess?: (registrationId: string, status: 'confirmed' | 'waitlist') => void;
}

type RegistrationStep =
  | 'eligibility-check'
  | 'partner-selection'
  | 'confirmation'
  | 'payment'
  | 'success';

export function EventRegistrationModal({
  open,
  onOpenChange,
  event,
  tournamentId,
  onRegistrationSuccess,
}: EventRegistrationModalProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  // State
  const [step, setStep] = useState<RegistrationStep>('eligibility-check');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityCheckResult | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [availablePartners, setAvailablePartners] = useState<any[]>([]);
  const [registrationId, setRegistrationId] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<'confirmed' | 'waitlist'>(
    'confirmed',
  );

  // Check eligibility on mount/event change
  useEffect(() => {
    if (open && event && user) {
      checkEligibility();
    }
  }, [open, event?.id, user?.id]);

  // Load available partners when step changes
  useEffect(() => {
    if (step === 'partner-selection' && event?.modality !== 'Singles' && user) {
      loadAvailablePartners();
    }
  }, [step, event?.modality, user?.id]);

  const checkEligibility = async () => {
    if (!event || !user) return;

    try {
      setLoading(true);
      setError(null);

      const result = await PlayerRegistrationService.checkEligibility(
        tournamentId,
        event.id,
        user.id,
      );

      setEligibilityResult(result);

      if (result.eligible) {
        // Proceed to next step based on event modality
        setStep(event.modality === 'Singles' ? 'confirmation' : 'partner-selection');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error checking eligibility';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePartners = async () => {
    if (!event || !user) return;

    try {
      const partners = await PlayerRegistrationService.findAvailablePartners(
        tournamentId,
        event.id,
        user.id,
      );
      setAvailablePartners(Array.isArray(partners) ? partners : []);
    } catch (err) {
      console.error('Failed to load partners:', err);
    }
  };

  const handleRegister = async () => {
    if (!event || !user) return;

    try {
      setLoading(true);
      setError(null);

      const registrationData = {
        user_id: user.id,
        partner_user_id: selectedPartnerId || undefined,
        ranking_points: user.skill_level,
        skill_block: event.skill_block,
        gender: event.gender,
        modality: event.modality,
        entry_fee: 50,
      };

      console.log('++++++++++++++++++++++++++++++++++++++++Registering for event:', event);

      const response = await PlayerRegistrationService.registerForEvent(
        tournamentId,
        event.id,
        registrationData,
      );

      setRegistrationId(response.registration.id);
      setRegistrationStatus(response.registration.status as 'confirmed' | 'waitlist');
      setStep('success');

      toast.success(
        response.registration.status === 'confirmed'
          ? '¡Registrado exitosamente!'
          : '¡Agregado a la lista de espera!',
      );

      onRegistrationSuccess?.(
        response.registration.id,
        response.registration.status as 'confirmed' | 'waitlist',
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error during registration';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('eligibility-check');
    setError(null);
    setSelectedPartnerId('');
    setEligibilityResult(null);
    onOpenChange(false);
  };

  if (!event || !user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-[#0d1117] border border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Registrarse en Evento</DialogTitle>
          <DialogDescription className="text-white/50">
            {event.skill_block} - {event.gender} - {event.modality}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6 max-h-[500px] overflow-y-auto">
          {/* STEP 1: ELIGIBILITY CHECK */}
          {step === 'eligibility-check' && (
            <div className="space-y-4">
              <div className="text-center">
                {loading && (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#ace600]" />
                    <p className="text-sm text-white/60">Verificando elegibilidad...</p>
                  </>
                )}
              </div>

              {eligibilityResult && !loading && (
                <>
                  <div
                    className={cn(
                      'p-4 rounded-lg border',
                      eligibilityResult.eligible
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'bg-red-500/10 border-red-500/20',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {eligibilityResult.eligible ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p
                          className={cn(
                            'font-semibold text-sm',
                            eligibilityResult.eligible ? 'text-emerald-400' : 'text-red-400',
                          )}
                        >
                          {eligibilityResult.eligible
                            ? '¡Eres elegible para este evento!'
                            : 'No eres elegible para este evento'}
                        </p>
                        {eligibilityResult.reasons.length > 0 && (
                          <ul className="mt-2 space-y-1 text-xs text-white/60">
                            {eligibilityResult.reasons.map((reason, i) => (
                              <li key={i} className="flex gap-2">
                                <span>•</span> {reason}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {eligibilityResult.warnings.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs font-semibold text-amber-400 mb-2">Advertencias:</p>
                      <ul className="space-y-1">
                        {eligibilityResult.warnings.map((warning, i) => (
                          <li key={i} className="text-xs text-amber-300/80">
                            • {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Penalties Info */}
                  {eligibilityResult.penalties.length > 0 && (
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-xs font-semibold text-yellow-400 mb-2">
                        Penalidades Activas:
                      </p>
                      <ul className="space-y-2">
                        {eligibilityResult.penalties.map((penalty) => (
                          <li key={penalty.id} className="text-xs text-yellow-300/80">
                            <span className="font-semibold capitalize">{penalty.penalty_type}</span>
                            : {penalty.reason}
                            {penalty.expires_date && (
                              <div className="text-[10px] text-yellow-300/60 mt-1">
                                Vence: {new Date(penalty.expires_date).toLocaleDateString('es-MX')}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Event Info */}
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-xs font-semibold text-white/50 mb-3">
                      Información del Evento
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40">Capacidad:</span>
                        <span className="text-white/70 font-mono">
                          {eligibilityResult.eventInfo?.current_participants || 0}/
                          {eligibilityResult.eventInfo?.max_participants}
                        </span>
                      </div>
                      {eligibilityResult.eventInfo?.registration_deadline && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/40">Límite de Registro:</span>
                          <span className="text-white/70">
                            {new Date(
                              eligibilityResult.eventInfo.registration_deadline,
                            ).toLocaleDateString('es-MX')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {error && !loading && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400/90">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PARTNER SELECTION */}
          {step === 'partner-selection' && event.modality !== 'Singles' && (
            <div className="space-y-4">
              <p className="text-sm text-white/60">Selecciona tu compañero para los dobles:</p>

              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#ace600]" />
                </div>
              )}

              {!loading && availablePartners.length === 0 && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-400">
                    No hay compañeros disponibles en este momento.
                  </p>
                </div>
              )}

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availablePartners.map((partner) => (
                  <div
                    key={partner.id}
                    onClick={() => setSelectedPartnerId(partner.id)}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      selectedPartnerId === partner.id
                        ? 'bg-[#ace600]/10 border-[#ace600]/50'
                        : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.12]',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white/80">{partner.full_name}</p>
                        <p className="text-xs text-white/40">{partner.skill_level}</p>
                      </div>
                      {selectedPartnerId === partner.id && (
                        <CheckCircle2 className="w-5 h-5 text-[#ace600]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION */}
          {step === 'confirmation' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <p className="text-xs font-semibold text-white/50 mb-3 uppercase tracking-wider">
                  Resumen de Registro
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Evento:</span>
                    <span className="text-white/80 font-semibold">
                      {event.skill_block} {event.gender} {event.modality}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Cuota:</span>
                    <span className="text-white/80 font-semibold">$50</span>
                  </div>
                  {selectedPartnerId && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/60">Compañero:</span>
                      <span className="text-white/80 font-semibold">
                        {availablePartners.find((p) => p.id === selectedPartnerId)?.full_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-[#ace600]/10 to-[#ace600]/5 border border-[#ace600]/20">
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-[#ace600] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white text-sm mb-1">
                      Completación del Registro
                    </p>
                    <p className="text-xs text-white/60">
                      Por favor completa el pago para finalizar tu registro en el evento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <p className="text-xs font-semibold text-white/50 mb-4 uppercase tracking-wider">
                  Detalles del Pago
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Cuota del Evento</span>
                    <span className="text-white/80">$50.00</span>
                  </div>
                  <div className="border-t border-white/[0.08] pt-3 flex justify-between items-center">
                    <span className="font-semibold text-white">Total</span>
                    <span className="text-lg font-bold text-[#ace600]">$50.00</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300/80">
                  El pago se procesará de forma segura. Tu registro será confirmado inmediatamente.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">
                  {registrationStatus === 'confirmed'
                    ? '¡Pago Completado!'
                    : '¡Agregado a la Lista de Espera!'}
                </p>
                <p className="text-sm text-white/60 mt-2">
                  {registrationStatus === 'confirmed'
                    ? 'Tu registro ha sido confirmado y el pago procesado. ¡Estás listo para competir!'
                    : 'Has sido agregado a la lista de espera. Serás notificado cuando haya un lugar disponible.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 justify-end">
          {step !== 'success' && (
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          )}

          {step === 'eligibility-check' && eligibilityResult?.eligible && !loading && (
            <Button
              onClick={() =>
                event.modality === 'Singles'
                  ? setStep('confirmation')
                  : setStep('partner-selection')
              }
              className="bg-[#ace600] hover:bg-[#c0f000] text-black"
            >
              Continuar
            </Button>
          )}

          {step === 'partner-selection' && (
            <Button
              onClick={() => setStep('confirmation')}
              disabled={!selectedPartnerId}
              className="bg-[#ace600] hover:bg-[#c0f000] text-black disabled:opacity-50"
            >
              Continuar
            </Button>
          )}

          {step === 'confirmation' && (
            <Button
              onClick={() => setStep('payment')}
              className="bg-[#ace600] hover:bg-[#c0f000] text-black"
            >
              Continuar al Pago
            </Button>
          )}

          {step === 'payment' && (
            <Button
              onClick={handleRegister}
              disabled={loading}
              className="bg-[#ace600] hover:bg-[#c0f000] text-black"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                'Completar Pago'
              )}
            </Button>
          )}

          {step === 'success' && (
            <Button onClick={handleClose} className="bg-[#ace600] hover:bg-[#c0f000] text-black">
              Listo
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EventRegistrationModal;
