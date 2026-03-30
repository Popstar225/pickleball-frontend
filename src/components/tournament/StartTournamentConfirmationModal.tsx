import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Lock,
  Users,
  Zap,
  Calendar,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ShieldX,
  BadgeCheck,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface CoachCredential {
  credential_number: string;
  verification_code: string;
  player_name: string;
  nrtp_level: string;
  affiliation_status: string;
  expiry_date: string;
}

interface StartTournamentConfirmationModalProps {
  open: boolean;
  tournamentId: string;
  tournamentName: string;
  eventCount: number;
  totalRegistrations: number;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function StartTournamentConfirmationModal({
  open,
  tournamentId,
  tournamentName,
  eventCount,
  totalRegistrations,
  onConfirm,
  onCancel,
  isLoading = false,
}: StartTournamentConfirmationModalProps) {
  const [understood, setUnderstood] = useState(false);

  // Credential verification state
  const [credential, setCredential] = useState<CoachCredential | null>(null);
  const [credentialLoading, setCredentialLoading] = useState(false);
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [credentialVerified, setCredentialVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Fetch credential when modal opens
  useEffect(() => {
    if (!open) return;
    setCredential(null);
    setCredentialError(null);
    setCodeInput('');
    setCredentialVerified(false);
    setVerifyError(null);
    setUnderstood(false);

    setCredentialLoading(true);
    api
      .get<any>(`/tournaments/${tournamentId}/coach-credential`)
      .then((res) => {
        if (res?.success && res?.data) {
          setCredential(res.data);
        } else {
          setCredentialError(res?.message || 'No se encontró credencial digital activa.');
        }
      })
      .catch(() => setCredentialError('Error al cargar la credencial del árbitro asignado.'))
      .finally(() => setCredentialLoading(false));
  }, [open]);

  const handleVerifyCode = () => {
    if (!credential) return;
    if (codeInput.trim().toUpperCase() === credential.verification_code?.toUpperCase()) {
      setCredentialVerified(true);
      setVerifyError(null);
    } else {
      setCredentialVerified(false);
      setVerifyError('Código incorrecto. Verifica tu credencial digital.');
    }
  };

  const canStart = understood && credentialVerified && !isLoading;

  const confirmationPoints = [
    {
      icon: Lock,
      title: 'Inscripción Cerrada',
      description: 'No se podrán registrar nuevos jugadores una vez iniciado el torneo',
    },
    {
      icon: Zap,
      title: 'Llaves Generadas',
      description: 'Los grupos y brackets se crearán automáticamente según las inscripciones',
    },
    {
      icon: Calendar,
      title: 'Formato Bloqueado',
      description: 'El formato de eventos, sets y reglas no podrán modificarse',
    },
    {
      icon: Users,
      title: 'Cupos Bloqueados',
      description:
        'La capacidad máxima de cada evento queda fija. La lista de espera se activa si se excede.',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl bg-[#0d1117] border-white/[0.07] flex flex-col max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-1">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl text-white">Confirmación Final</DialogTitle>
              <p className="text-sm text-white/40 mt-1">
                Iniciando "{tournamentName}" — esta acción no puede deshacerse
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="space-y-5 py-4 overflow-y-auto flex-1 pr-1">

          {/* Tournament Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                Eventos
              </p>
              <p className="text-2xl font-bold text-white">{eventCount}</p>
              <p className="text-xs text-white/30 mt-1">eventos activos</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                Inscripciones
              </p>
              <p className="text-2xl font-bold text-white">{totalRegistrations}</p>
              <p className="text-xs text-white/30 mt-1">participantes totales</p>
            </div>
          </div>

          {/* What Happens */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <h4 className="text-sm font-bold text-white">¿Qué sucede al iniciar?</h4>
            </div>
            <div className="space-y-2.5 pl-6">
              {confirmationPoints.map(({ icon: Icon, title, description }, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── DIGITAL CREDENTIAL VERIFICATION ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-[#ace600] shrink-0" />
              <h4 className="text-sm font-bold text-white">Verificación de Credencial Digital</h4>
            </div>

            {credentialLoading && (
              <div className="flex items-center gap-2 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                <p className="text-sm text-white/40">Cargando credencial...</p>
              </div>
            )}

            {credentialError && !credentialLoading && (
              <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/20 rounded-xl">
                <ShieldX className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{credentialError}</p>
              </div>
            )}

            {credential && !credentialLoading && (
              <div className="space-y-3">
                {/* Credential card */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/40">Titular</p>
                      <p className="text-sm font-semibold text-white">{credential.player_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/40">Nivel</p>
                      <p className="text-sm font-semibold text-white">{credential.nrtp_level ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/40">N° Credencial</p>
                      <p className="text-sm font-mono text-[#ace600]">{credential.credential_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/40">Estado</p>
                      <span
                        className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded',
                          credential.affiliation_status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400',
                        )}
                      >
                        {credential.affiliation_status === 'active' ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Code input */}
                {!credentialVerified ? (
                  <div className="space-y-2">
                    <p className="text-xs text-white/50">
                      Ingresa tu código de verificación de 8 caracteres para confirmar tu identidad
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <KeyRound className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={8}
                          value={codeInput}
                          onChange={(e) => {
                            setCodeInput(e.target.value.toUpperCase());
                            setVerifyError(null);
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                          placeholder="Ej: DPDTFCOD"
                          className="w-full h-10 bg-white/[0.04] border border-white/[0.10] rounded-lg pl-9 pr-4 text-sm font-mono text-white placeholder-white/20 tracking-widest focus:outline-none focus:border-[#ace600]/40 focus:bg-white/[0.06] transition-all uppercase"
                        />
                      </div>
                      <Button
                        onClick={handleVerifyCode}
                        disabled={codeInput.length < 8}
                        className="h-10 px-4 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-white text-sm font-semibold rounded-lg disabled:opacity-40 transition-all"
                      >
                        Verificar
                      </Button>
                    </div>
                    {verifyError && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5">
                        <ShieldX className="w-3.5 h-3.5 shrink-0" />
                        {verifyError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/[0.07] border border-emerald-500/20 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-400">Credencial verificada</p>
                      <p className="text-xs text-emerald-400/60 font-mono tracking-widest mt-0.5">
                        {credential.verification_code}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirmation Checkbox */}
          <button
            onClick={() => setUnderstood((p) => !p)}
            className={cn(
              'w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all',
              understood
                ? 'bg-[#ace600]/[0.05] border-[#ace600]/20'
                : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.12]',
            )}
          >
            <div
              className={cn(
                'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                understood ? 'bg-[#ace600] border-[#ace600]' : 'border-white/20',
              )}
            >
              {understood && <CheckCircle2 className="w-3 h-3 text-black" />}
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Entiendo que iniciar el torneo bloqueará el formato, cerrará las inscripciones y
              generará los brackets.{' '}
              <span className="text-white/70 font-semibold">Esta acción no puede deshacerse</span>.
            </p>
          </button>

          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400 mb-1">Acción Crítica</p>
              <p className="text-xs text-red-400/70">
                Una vez iniciado, la configuración del torneo no podrá modificarse. Asegúrate de
                que todos los detalles de los eventos sean correctos antes de continuar.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex gap-2.5 px-6 pb-6 pt-4 border-t border-white/[0.06] flex-shrink-0">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 h-9 border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white text-sm font-semibold transition-all"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!canStart}
            className={cn(
              'flex-1 h-9 text-sm font-bold gap-2 transition-all',
              canStart
                ? 'bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.15)]'
                : 'bg-white/[0.05] border border-white/[0.06] text-white/20 cursor-not-allowed',
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Iniciando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Iniciar Torneo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
