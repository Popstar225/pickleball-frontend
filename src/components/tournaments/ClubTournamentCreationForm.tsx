/**
 * Club Tournament Creation Form Component
 */

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchValidTournamentEvents,
  createTournamentWithSetup,
} from '@/store/slices/tournamentSetupSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { StateAutocomplete } from '@/components/ui/StateAutocomplete';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trophy,
  MapPin,
  Calendar,
  Users,
  Mail,
  Phone,
  FileText,
  Settings,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertTriangle,
  Zap,
  Layers,
  Target,
  ClipboardList,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TournamentEvent {
  key: string;
  label: string;
  block: string;
  gender: string;
  modality: string;
}
interface TournamentFormData {
  name: string;
  venue_name: string;
  venue_address?: string;
  city: string;
  state: string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  entry_fee?: number;
  max_participants?: number;
  contact_email: string;
  contact_phone: string;
  description?: string;
  format: 'hybrid' | 'single_elimination';
  format_config: { groupSize?: number; qualifiersPerGroup?: number; groupsStaged?: boolean };
  events: TournamentEvent[];
  judges?: Array<{ name: string; email: string }>; // optional array of judge objects
}
interface Props {
  onSuccess?: (t: any) => void;
  onCancel?: () => void;
}

// ─── Steps config ─────────────────────────────────────────────────────────────
type StepKey = 'general' | 'technical' | 'format' | 'review';
const STEPS: { key: StepKey; label: string; icon: React.ElementType }[] = [
  { key: 'general', label: 'General', icon: FileText },
  { key: 'technical', label: 'Eventos', icon: Layers },
  { key: 'format', label: 'Formato', icon: Target },
  { key: 'review', label: 'Revisión', icon: ClipboardList },
];

// ─── Shared atoms ─────────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
      {children}
      {required && <span className="text-[#ace600] ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string | null }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] text-red-400/80 mt-1.5">
      <AlertTriangle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  );
}

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

const inputCls = cn(
  'h-10 rounded-xl text-sm px-3',
  'bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20',
  'focus-visible:ring-0 focus-visible:border-[#ace600]/50 focus-visible:bg-[#ace600]/[0.03]',
  'transition-all',
);

const textareaCls = cn(
  'w-full rounded-xl text-sm px-3 py-2.5 resize-none',
  'bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20',
  'focus:outline-none focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03]',
  'transition-all',
);

// ─── Modality color ───────────────────────────────────────────────────────────
const modalityCls: Record<string, string> = {
  Singles: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Doubles: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Mixed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const ClubTournamentCreationForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { validEvents, loading, loadingEvents, error, success, createdTournament } = useSelector(
    (s: RootState) => s.tournamentSetup,
  );

  const [step, setStep] = useState<StepKey>('general');
  const [judges, setJudges] = useState<Array<{ name: string; email: string }>>([]);
  const [judgeName, setJudgeName] = useState('');
  const [judgeEmail, setJudgeEmail] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    trigger,
    setValue,
  } = useForm<TournamentFormData>({
    mode: 'onChange',
    defaultValues: {
      format: 'hybrid',
      events: [],
      entry_fee: 0,
      format_config: { groupSize: 4, qualifiersPerGroup: 2, groupsStaged: true },
      judges: [] as Array<{ name: string; email: string }>,
    },
  });

  const format = watch('format');
  const selectedEvents = watch('events') ?? [];

  useEffect(() => {
    if (!validEvents.length) dispatch(fetchValidTournamentEvents());
  }, []);
  useEffect(() => {
    if (success && createdTournament) onSuccess?.(createdTournament);
  }, [success]);

  const err = (e: any) => e?.message ?? (typeof e === 'string' ? e : null);

  const STEP_KEYS: StepKey[] = ['general', 'technical', 'format', 'review'];
  const stepIdx = STEP_KEYS.indexOf(step);

  const handleNext = async () => {
    const fields: Record<StepKey, any[]> = {
      general: [
        'name',
        'venue_name',
        'city',
        'state',
        'start_date',
        'end_date',
        'contact_email',
        'contact_phone',
      ],
      technical: ['events'],
      format: ['format'],
      review: [],
    };
    const ok = await trigger(fields[step]);
    if (ok && stepIdx < STEP_KEYS.length - 1) setStep(STEP_KEYS[stepIdx + 1]);
  };

  const handlePrev = () => {
    if (stepIdx > 0) setStep(STEP_KEYS[stepIdx - 1]);
  };

  const addJudge = () => {
    if (
      judgeName.trim() &&
      judgeEmail.trim() &&
      !judges.some((j) => j.email === judgeEmail.trim())
    ) {
      setJudges([...judges, { name: judgeName.trim(), email: judgeEmail.trim() }]);
      setJudgeName('');
      setJudgeEmail('');
    }
  };

  const removeJudge = (email: string) => {
    setJudges(judges.filter((j) => j.email !== email));
  };

  const onSubmit = (data: TournamentFormData) => {
    dispatch(createTournamentWithSetup({ ...data, tournament_type: 'club', judges }));
  };

  // ── Loading events ───────────────────────────────────────────────────────────
  if (loadingEvents) {
    return (
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
        <p className="text-xs text-white/25">Cargando configuración del torneo…</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Crear Torneo Local</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
            Club
          </span>
        </div>
        <p className="text-xs text-white/25">
          Configura los detalles, eventos y formato de tu torneo
        </p>
      </div>

      {/* ── Step indicator ──────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4">
        <div className="flex items-center">
          {STEPS.map(({ key, label, icon: Icon }, i) => {
            const done = stepIdx > i;
            const active = step === key;
            return (
              <div
                key={key}
                className={cn('flex items-center', i < STEPS.length - 1 ? 'flex-1' : '')}
              >
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => done && setStep(key)}
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                      done
                        ? 'bg-[#ace600] text-black cursor-pointer hover:bg-[#c0f000]'
                        : active
                          ? 'bg-[#ace600]/15 border-2 border-[#ace600] text-[#ace600]'
                          : 'bg-white/[0.05] border border-white/[0.08] text-white/20 cursor-default',
                    )}
                  >
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </button>
                  <span
                    className={cn(
                      'text-[9px] font-bold uppercase tracking-wider hidden sm:block',
                      active ? 'text-[#ace600]' : done ? 'text-white/35' : 'text-white/15',
                    )}
                  >
                    {label}
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

      {/* ── Global error ────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 p-3.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400/90">{error}</p>
        </div>
      )}

      {/* ── Form ────────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 sm:p-6">
          {/* ── STEP 1: General ─────────────────────────────────────────────── */}
          {step === 'general' && (
            <div className="space-y-5">
              <SectionHeading icon={Trophy}>Información General</SectionHeading>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Nombre del Torneo</FieldLabel>
                  <Input
                    className={inputCls}
                    {...register('name', { required: 'El nombre es requerido' })}
                    placeholder="Ej. Campeonato de Primavera"
                  />
                  <FieldError msg={err(errors.name)} />
                </div>
                <div>
                  <FieldLabel required>Sede</FieldLabel>
                  <Input
                    className={inputCls}
                    {...register('venue_name', { required: 'La sede es requerida' })}
                    placeholder="Ej. Complejo Deportivo Centro"
                  />
                  <FieldError msg={err(errors.venue_name)} />
                </div>
              </div>

              <div>
                <FieldLabel>Dirección de la Sede</FieldLabel>
                <Input
                  className={inputCls}
                  {...register('venue_address')}
                  placeholder="Dirección completa (opcional)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Ciudad</FieldLabel>
                  <Input
                    className={inputCls}
                    {...register('city', { required: 'La ciudad es requerida' })}
                    placeholder="Ciudad"
                  />
                  <FieldError msg={err(errors.city)} />
                </div>
                <div>
                  <FieldLabel required>Estado</FieldLabel>
                  <Controller
                    name="state"
                    control={control}
                    rules={{ required: 'El estado es requerido' }}
                    render={({ field }) => (
                      <StateAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Busca y selecciona estado..."
                        required
                      />
                    )}
                  />
                  <FieldError msg={err(errors.state)} />
                </div>
              </div>

              <div className="h-px bg-white/[0.05]" />
              <SectionHeading icon={Calendar}>Fechas y Registro</SectionHeading>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Inicio del Torneo</FieldLabel>
                  <Input
                    className={inputCls}
                    type="datetime-local"
                    {...register('start_date', { required: 'La fecha de inicio es requerida' })}
                  />
                  <FieldError msg={err(errors.start_date)} />
                </div>
                <div>
                  <FieldLabel required>Fin del Torneo</FieldLabel>
                  <Input
                    className={inputCls}
                    type="datetime-local"
                    {...register('end_date', { required: 'La fecha de fin es requerida' })}
                  />
                  <FieldError msg={err(errors.end_date)} />
                </div>
                <div>
                  <FieldLabel required>Abre Inscripciones</FieldLabel>
                  <Input
                    className={inputCls}
                    type="datetime-local"
                    {...register('registration_start', { required: 'Fecha requerida' })}
                  />
                  <FieldError msg={err(errors.registration_start)} />
                </div>
                <div>
                  <FieldLabel required>Cierra Inscripciones</FieldLabel>
                  <Input
                    className={inputCls}
                    type="datetime-local"
                    {...register('registration_end', { required: 'Fecha requerida' })}
                  />
                  <FieldError msg={err(errors.registration_end)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Cuota de Inscripción ($)</FieldLabel>
                  <Input
                    className={inputCls}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('entry_fee', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <FieldLabel>Máx. Participantes</FieldLabel>
                  <Input
                    className={inputCls}
                    type="number"
                    placeholder="Ej. 128"
                    {...register('max_participants', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="h-px bg-white/[0.05]" />
              <SectionHeading icon={Mail}>Contacto</SectionHeading>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Email de Contacto</FieldLabel>
                  <Input
                    className={inputCls}
                    type="email"
                    placeholder="contacto@club.com"
                    {...register('contact_email', { required: 'El email es requerido' })}
                  />
                  <FieldError msg={err(errors.contact_email)} />
                </div>
                <div>
                  <FieldLabel required>Teléfono de Contacto</FieldLabel>
                  <Input
                    className={inputCls}
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...register('contact_phone', { required: 'El teléfono es requerido' })}
                  />
                  <FieldError msg={err(errors.contact_phone)} />
                </div>
              </div>

              <div>
                <FieldLabel>Descripción</FieldLabel>
                <textarea
                  className={textareaCls}
                  rows={3}
                  placeholder="Breve descripción de tu torneo…"
                  {...register('description')}
                />
              </div>

              <div className="h-px bg-white/[0.05]" />
              <SectionHeading icon={Users}>Árbitros (Jueces)</SectionHeading>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  className={inputCls}
                  placeholder="Nombre del árbitro"
                  value={judgeName}
                  onChange={(e) => setJudgeName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    className={inputCls}
                    placeholder="Email del árbitro"
                    type="email"
                    value={judgeEmail}
                    onChange={(e) => setJudgeEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addJudge())}
                  />
                  <Button
                    type="button"
                    onClick={addJudge}
                    className="px-3 bg-[#ace600]/20 border border-[#ace600]/30 text-[#ace600] rounded-lg hover:bg-[#ace600]/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {judges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {judges.map((judge) => (
                    <div
                      key={judge.email}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#ace600]/10 border border-[#ace600]/20 rounded-lg text-xs text-[#ace600]"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">{judge.name}</span>
                        <span className="text-[#ace600]/60 text-[10px]">{judge.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeJudge(judge.email)}
                        className="text-[#ace600]/60 hover:text-[#ace600] transition-colors ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Events ──────────────────────────────────────────────── */}
          {step === 'technical' && (
            <div className="space-y-5">
              <SectionHeading icon={Layers}>Selección de Eventos</SectionHeading>

              <p className="text-xs text-white/30 leading-relaxed -mt-2">
                Elige las categorías, géneros y modalidades para tu torneo.
              </p>

              {selectedEvents.length === 0 && (
                <div className="flex items-start gap-3 p-3.5 bg-amber-500/[0.05] border border-amber-500/15 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-400/80">
                    Selecciona al menos un evento para continuar
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {validEvents.map((event) => {
                  const checked = selectedEvents.some((e: any) => e?.key === event.key);
                  return (
                    <Controller
                      key={event.key}
                      name="events"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => {
                            const curr = (field.value as any[]) || [];
                            field.onChange(
                              checked
                                ? curr.filter((e: any) => e?.key !== event.key)
                                : [...curr, event],
                            );
                          }}
                          className={cn(
                            'w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all',
                            checked
                              ? 'bg-[#ace600]/[0.05] border-[#ace600]/25'
                              : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.04]',
                          )}
                        >
                          {/* Custom checkbox */}
                          <div
                            className={cn(
                              'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                              checked ? 'bg-[#ace600] border-[#ace600]' : 'border-white/20',
                            )}
                          >
                            {checked && <Check className="w-3 h-3 text-black" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                'text-sm font-semibold transition-colors',
                                checked ? 'text-white' : 'text-white/60',
                              )}
                            >
                              {event.label}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/30">
                                {event.block}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/30">
                                {event.gender}
                              </span>
                              <span
                                className={cn(
                                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                                  modalityCls[event.modality] ??
                                    'bg-white/[0.05] text-white/30 border-white/[0.08]',
                                )}
                              >
                                {event.modality}
                              </span>
                            </div>
                          </div>

                          {checked && (
                            <div className="w-5 h-5 rounded-full bg-[#ace600]/20 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-[#ace600]" />
                            </div>
                          )}
                        </button>
                      )}
                    />
                  );
                })}
              </div>

              {selectedEvents.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-5 h-5 rounded-full bg-[#ace600] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                  <p className="text-xs font-semibold text-[#ace600]">
                    {selectedEvents.length} evento{selectedEvents.length !== 1 ? 's' : ''}{' '}
                    seleccionado{selectedEvents.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Format ──────────────────────────────────────────────── */}
          {step === 'format' && (
            <div className="space-y-5">
              <SectionHeading icon={Target}>Formato del Torneo</SectionHeading>

              {/* Format picker cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    {
                      value: 'hybrid',
                      label: 'Híbrido',
                      sub: 'Grupos + Eliminación',
                      icon: Layers,
                      desc: 'Fase de grupos seguida de eliminación directa. Recomendado para torneos con muchos participantes.',
                    },
                    {
                      value: 'single_elimination',
                      label: 'Eliminación Directa',
                      sub: 'Single Elimination',
                      icon: Zap,
                      desc: 'Bracket de eliminación directa. Ideal para torneos rápidos con potencia de 2.',
                    },
                  ] as const
                ).map(({ value, label, sub, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('format', value)}
                    className={cn(
                      'text-left p-4 rounded-xl border transition-all',
                      format === value
                        ? 'bg-[#ace600]/[0.06] border-[#ace600]/30'
                        : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.13] hover:bg-white/[0.04]',
                    )}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center border transition-all',
                          format === value
                            ? 'bg-[#ace600]/10 border-[#ace600]/20'
                            : 'bg-white/[0.05] border-white/[0.08]',
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4',
                            format === value ? 'text-[#ace600]' : 'text-white/25',
                          )}
                        />
                      </div>
                      <div>
                        <p
                          className={cn(
                            'text-sm font-bold transition-colors',
                            format === value ? 'text-white' : 'text-white/60',
                          )}
                        >
                          {label}
                        </p>
                        <p className="text-[10px] text-white/25 font-mono">{sub}</p>
                      </div>
                      <div
                        className={cn(
                          'ml-auto w-4 h-4 rounded-full border-2 shrink-0 transition-all',
                          format === value ? 'border-[#ace600] bg-[#ace600]' : 'border-white/20',
                        )}
                      />
                    </div>
                    <p className="text-xs text-white/30 leading-relaxed">{desc}</p>
                  </button>
                ))}
              </div>

              {/* Hybrid config */}
              {format === 'hybrid' && (
                <div className="space-y-4 pt-1">
                  <div className="h-px bg-white/[0.05]" />
                  <SectionHeading icon={Settings}>Configuración Híbrida</SectionHeading>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Tamaño de Grupo (2–6)</FieldLabel>
                      <Input
                        className={inputCls}
                        type="number"
                        min="2"
                        max="6"
                        {...register('format_config.groupSize', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <FieldLabel>Clasificados por Grupo</FieldLabel>
                      <Input
                        className={inputCls}
                        type="number"
                        min="1"
                        {...register('format_config.qualifiersPerGroup', { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <Controller
                    name="format_config.groupsStaged"
                    control={control}
                    render={({ field }) => (
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={cn(
                          'w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                          field.value
                            ? 'bg-[#ace600]/[0.05] border-[#ace600]/20'
                            : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.12]',
                        )}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                            field.value ? 'bg-[#ace600] border-[#ace600]' : 'border-white/20',
                          )}
                        >
                          {field.value && <Check className="w-3 h-3 text-black" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white/70">Torneos por etapas</p>
                          <p className="text-xs text-white/30">
                            Organiza los grupos en etapas secuenciales
                          </p>
                        </div>
                      </button>
                    )}
                  />
                </div>
              )}

              {/* Single elimination info */}
              {format === 'single_elimination' && (
                <div className="flex items-start gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                  <Zap className="w-4 h-4 text-white/25 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white/60 mb-0.5">
                      Bracket de Eliminación Directa
                    </p>
                    <p className="text-xs text-white/30 leading-relaxed">
                      Tamaños de bracket disponibles: potencias de 2 (8, 16, 32, 64…). El sistema
                      generará el bracket automáticamente según los participantes inscritos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Review ──────────────────────────────────────────────── */}
          {step === 'review' && (
            <div className="space-y-5">
              <SectionHeading icon={ClipboardList}>Resumen del Torneo</SectionHeading>

              {/* Summary panels */}
              {[
                {
                  icon: Trophy,
                  title: 'Información General',
                  rows: [
                    { label: 'Nombre', value: watch('name') || '—' },
                    { label: 'Sede', value: watch('venue_name') || '—' },
                    {
                      label: 'Ciudad',
                      value: watch('city') ? `${watch('city')}, ${watch('state')}` : '—',
                    },
                    { label: 'Dirección', value: watch('venue_address') || 'No especificada' },
                  ],
                },
                {
                  icon: Calendar,
                  title: 'Fechas',
                  rows: [
                    {
                      label: 'Inicio Torneo',
                      value: watch('start_date')
                        ? new Date(watch('start_date')).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—',
                    },
                    {
                      label: 'Fin Torneo',
                      value: watch('end_date')
                        ? new Date(watch('end_date')).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—',
                    },
                    {
                      label: 'Abre Inscripciones',
                      value: watch('registration_start')
                        ? new Date(watch('registration_start')).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—',
                    },
                    {
                      label: 'Cierra Inscripciones',
                      value: watch('registration_end')
                        ? new Date(watch('registration_end')).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—',
                    },
                  ],
                },
                {
                  icon: Settings,
                  title: 'Formato y Eventos',
                  rows: [
                    {
                      label: 'Formato',
                      value:
                        format === 'hybrid'
                          ? 'Híbrido (Grupos + Eliminación)'
                          : 'Eliminación Directa',
                    },
                    {
                      label: 'Eventos',
                      value: `${selectedEvents.length} categoría${selectedEvents.length !== 1 ? 's' : ''} seleccionada${selectedEvents.length !== 1 ? 's' : ''}`,
                    },
                    {
                      label: 'Cuota',
                      value: watch('entry_fee') ? `$${watch('entry_fee')} MXN` : 'Gratuito',
                    },
                    {
                      label: 'Máx. Part.',
                      value: watch('max_participants')
                        ? String(watch('max_participants'))
                        : 'Sin límite',
                    },
                  ],
                },
              ].map(({ icon: Icon, title, rows }) => (
                <div
                  key={title}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.05]">
                    <div className="w-6 h-6 rounded-md bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
                      <Icon className="w-3 h-3 text-[#ace600]" />
                    </div>
                    <span className="text-xs font-bold text-white/50">{title}</span>
                  </div>
                  <div className="px-4 divide-y divide-white/[0.04]">
                    {rows.map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between py-2.5 gap-4">
                        <span className="text-xs text-white/25 shrink-0">{label}</span>
                        <span className="text-xs text-white/70 font-semibold text-right truncate">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Selected events list */}
              {selectedEvents.length > 0 && (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.05]">
                    <div className="w-6 h-6 rounded-md bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
                      <Layers className="w-3 h-3 text-[#ace600]" />
                    </div>
                    <span className="text-xs font-bold text-white/50">Eventos Seleccionados</span>
                  </div>
                  <div className="px-4 py-3 flex flex-wrap gap-2">
                    {selectedEvents.map((e: any) => (
                      <span
                        key={e.key}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-white/50"
                      >
                        <Check className="w-3 h-3 text-[#ace600]" />
                        {e.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Navigation ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mt-4">
          {step !== 'general' && (
            <button
              type="button"
              onClick={handlePrev}
              className="h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/45 hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
          )}

          <div className="flex-1" />

          {step !== 'review' ? (
            <button
              type="button"
              onClick={handleNext}
              className="h-10 px-5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_14px_rgba(172,230,0,0.18)] transition-all"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/45 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-10 px-6 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_14px_rgba(172,230,0,0.18)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creando…
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4" /> Crear Torneo
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default ClubTournamentCreationForm;
