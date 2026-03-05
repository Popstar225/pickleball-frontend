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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StateAutocomplete } from '@/components/ui/StateAutocomplete';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  AlertTriangle,
  MapPin,
  Calendar,
  Users,
  Trophy,
  Settings,
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  Plus,
  X,
} from 'lucide-react';

/* ─── types ── */
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
  format_config: {
    groupSize?: number;
    qualifiersPerGroup?: number;
    groupsStaged?: boolean;
  };
  events: TournamentEvent[];
  judges?: Array<{ name: string; email: string }>; // optional array of judge objects
}

interface FederationTournamentCreationFormProps {
  onSuccess?: (tournament: any) => void;
  onCancel?: () => void;
}

/* ─── shared styles ── */
const labelCls = 'text-[11px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block';
const inputCls =
  'h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:border-white/20 focus-visible:ring-0 transition-colors';
const selTrigger =
  'h-9 bg-white/[0.04] border-white/[0.08] text-white/70 text-sm focus:ring-0 focus:border-white/20 transition-colors';
const selContent = 'bg-[#161c25] border-white/[0.08] rounded-xl shadow-2xl';
const selItem = 'text-white/70 focus:bg-white/[0.06] focus:text-white';

/* ─── step config ── */
type Step = 'general' | 'technical' | 'format' | 'review';
const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: MapPin },
  { id: 'technical', label: 'Events', icon: Trophy },
  { id: 'format', label: 'Format', icon: Settings },
  { id: 'review', label: 'Review', icon: ClipboardList },
];

/* ─── field group ── */
function FieldGroup({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

/* ─── review row ── */
function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-white/[0.05] last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-widest text-white/30">{label}</span>
      <span className="text-sm font-semibold text-white/70 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

/* ─── skill block color ── */
function blockColor(block: string) {
  const n = parseFloat(block);
  if (n >= 5.0) return 'text-[#ace600] bg-[#ace600]/10 border-[#ace600]/20';
  if (n >= 4.5) return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
  if (n >= 4.0) return 'text-violet-400 bg-violet-400/10 border-violet-400/20';
  if (n >= 3.5) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  return 'text-white/40 bg-white/[0.05] border-white/[0.08]';
}

/* ══════════════════════════════════════════════════════════════════ */

export const FederationTournamentCreationForm: React.FC<FederationTournamentCreationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { validEvents, loading, loadingEvents, error, success, createdTournament } = useSelector(
    (state: RootState) => state.tournamentSetup,
  );

  const [currentStep, setCurrentStep] = useState<Step>('general');
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
  } = useForm<TournamentFormData>({
    mode: 'onChange',
    defaultValues: {
      format: 'hybrid',
      events: [],
      name: '',
      venue_name: '',
      city: '',
      state: '',
      start_date: '',
      end_date: '',
      registration_start: '',
      registration_end: '',
      contact_email: '',
      contact_phone: '',
      format_config: { groupSize: 4, qualifiersPerGroup: 2, groupsStaged: true },
      judges: [] as Array<{ name: string; email: string }>,
    },
  });

  const format = watch('format');
  const selectedEvents = watch('events') as any[];
  const name = watch('name');

  const getErr = (obj: any): string | null => {
    if (!obj) return null;
    if (typeof obj === 'string') return obj;
    return obj.message ?? null;
  };

  useEffect(() => {
    if (validEvents.length === 0) dispatch(fetchValidTournamentEvents());
  }, [dispatch, validEvents.length]);

  useEffect(() => {
    if (success && createdTournament && onSuccess) onSuccess(createdTournament);
  }, [success, createdTournament, onSuccess]);

  const stepOrder: Step[] = ['general', 'technical', 'format', 'review'];
  const stepIndex = stepOrder.indexOf(currentStep);

  const handleNext = async () => {
    const fields: Record<Step, string[]> = {
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
      format: ['format', 'format_config'],
      review: [],
    };
    const valid = await trigger(fields[currentStep] as any);
    if (valid && stepIndex < stepOrder.length - 1) setCurrentStep(stepOrder[stepIndex + 1]);
  };

  const handlePrev = () => {
    if (stepIndex > 0) setCurrentStep(stepOrder[stepIndex - 1]);
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
    dispatch(createTournamentWithSetup({ ...data, tournament_type: 'admin', judges }));
  };

  /* ── loading events ── */
  if (loadingEvents) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
        <p className="text-sm text-white/25">Loading tournament options…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 p-1">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Create National Tournament</h1>
        <p className="text-sm text-white/35 mt-0.5">
          Federation-level tournament — automatically published upon creation
        </p>
      </div>

      {/* ── Stepper ── */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const isActive = step.id === currentStep;
          const isCompleted = stepOrder.indexOf(step.id) < stepIndex;
          const Icon = step.icon;
          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                    isCompleted
                      ? 'bg-[#ace600]/10 border-[#ace600]/30'
                      : isActive
                        ? 'bg-[#ace600] border-[#ace600]'
                        : 'bg-white/[0.04] border-white/[0.08]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ace600]" />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-white/25'}`} />
                  )}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:block ${
                    isActive ? 'text-white' : isCompleted ? 'text-[#ace600]/70' : 'text-white/25'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-3 transition-all ${
                    stepOrder.indexOf(STEPS[i + 1].id) <= stepIndex
                      ? 'bg-[#ace600]/30'
                      : 'bg-white/[0.07]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex gap-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* ── Form card ── */}
      <Card className="bg-[#0d1117] border-white/[0.07] rounded-2xl overflow-hidden p-0">
        <CardHeader className="px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            {(() => {
              const s = STEPS.find((s) => s.id === currentStep)!;
              const I = s.icon;
              return <I className="w-4 h-4 text-white/30" />;
            })()}
            <span className="text-sm font-semibold text-white/60">
              {STEPS.find((s) => s.id === currentStep)?.label}
            </span>
            <Badge
              variant="outline"
              className="ml-auto border-white/[0.06] bg-white/[0.04] text-white/25 text-[10px]"
            >
              Step {stepIndex + 1} of {STEPS.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ── General ── */}
            {currentStep === 'general' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Tournament Name *" error={getErr(errors.name)}>
                    <Input
                      {...register('name', { required: 'Required' })}
                      placeholder="National Championship 2024"
                      className={inputCls}
                    />
                  </FieldGroup>
                  <FieldGroup label="Venue Name *" error={getErr(errors.venue_name)}>
                    <Input
                      {...register('venue_name', { required: 'Required' })}
                      placeholder="National Sports Arena"
                      className={inputCls}
                    />
                  </FieldGroup>
                </div>

                <FieldGroup label="Venue Address">
                  <Input
                    {...register('venue_address')}
                    placeholder="Street address (optional)"
                    className={inputCls}
                  />
                </FieldGroup>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="City *" error={getErr(errors.city)}>
                    <Input
                      {...register('city', { required: 'Required' })}
                      placeholder="City"
                      className={inputCls}
                    />
                  </FieldGroup>
                  <FieldGroup label="State *" error={getErr(errors.state)}>
                    <Controller
                      name="state"
                      control={control}
                      rules={{ required: 'Required' }}
                      render={({ field }) => (
                        <StateAutocomplete
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Search and select state..."
                          required
                        />
                      )}
                    />
                  </FieldGroup>
                </div>

                <Separator className="bg-white/[0.05]" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Start Date *" error={getErr(errors.start_date)}>
                    <Input
                      {...register('start_date', { required: 'Required' })}
                      type="datetime-local"
                      className={`${inputCls} [color-scheme:dark]`}
                    />
                  </FieldGroup>
                  <FieldGroup label="End Date *" error={getErr(errors.end_date)}>
                    <Input
                      {...register('end_date', { required: 'Required' })}
                      type="datetime-local"
                      className={`${inputCls} [color-scheme:dark]`}
                    />
                  </FieldGroup>
                  <FieldGroup label="Registration Opens">
                    <Input
                      {...register('registration_start')}
                      type="datetime-local"
                      className={`${inputCls} [color-scheme:dark]`}
                    />
                  </FieldGroup>
                  <FieldGroup label="Registration Closes">
                    <Input
                      {...register('registration_end')}
                      type="datetime-local"
                      className={`${inputCls} [color-scheme:dark]`}
                    />
                  </FieldGroup>
                </div>

                <Separator className="bg-white/[0.05]" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Entry Fee ($)">
                    <Input
                      {...register('entry_fee', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className={inputCls}
                    />
                  </FieldGroup>
                  <FieldGroup label="Max Participants">
                    <Input
                      {...register('max_participants', { valueAsNumber: true })}
                      type="number"
                      placeholder="e.g. 512"
                      className={inputCls}
                    />
                  </FieldGroup>
                  <FieldGroup label="Contact Email *" error={getErr(errors.contact_email)}>
                    <Input
                      {...register('contact_email', { required: 'Required' })}
                      type="email"
                      placeholder="contact@federation.org"
                      className={inputCls}
                    />
                  </FieldGroup>
                  <FieldGroup label="Contact Phone *" error={getErr(errors.contact_phone)}>
                    <Input
                      {...register('contact_phone', { required: 'Required' })}
                      type="tel"
                      placeholder="(555) 123-4567"
                      className={inputCls}
                    />
                  </FieldGroup>
                </div>

                <FieldGroup label="Description">
                  <Textarea
                    {...register('description')}
                    placeholder="Details about this national tournament…"
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:border-white/20 focus-visible:ring-0 resize-none min-h-[90px] transition-colors"
                  />
                </FieldGroup>

                <FieldGroup label="Judges (Arbiters)">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      placeholder="Judge name"
                      value={judgeName}
                      onChange={(e) => setJudgeName(e.target.value)}
                      className={inputCls}
                    />
                    <div className="flex gap-2 sm:col-span-2">
                      <Input
                        placeholder="Judge email"
                        type="email"
                        value={judgeEmail}
                        onChange={(e) => setJudgeEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addJudge())}
                        className={inputCls}
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
                    <div className="flex flex-wrap gap-2 mt-3">
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
                </FieldGroup>
              </div>
            )}

            {/* ── Events ── */}
            {currentStep === 'technical' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/40">
                    Select skill blocks, genders, and modalities to include.
                  </p>
                  {selectedEvents?.length > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-[#ace600]/[0.08] border-[#ace600]/20 text-[#ace600] text-[10px] font-bold"
                    >
                      {selectedEvents.length} selected
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                  {validEvents.map((event) => (
                    <Controller
                      key={event.key}
                      name="events"
                      control={control}
                      render={({ field }) => {
                        const isChecked =
                          field.value?.some((e: any) => e?.key === event.key) || false;
                        return (
                          <label
                            className={`flex items-center gap-4 p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-[#ace600]/[0.04] border-[#ace600]/30'
                                : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.04]'
                            }`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const cur = (field.value as any[]) || [];
                                field.onChange(
                                  checked
                                    ? [...cur, event]
                                    : cur.filter((e: any) => e?.key !== event.key),
                                );
                              }}
                              className="border-white/[0.2] data-[state=checked]:bg-[#ace600] data-[state=checked]:border-[#ace600] data-[state=checked]:text-black"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white/80 leading-tight">
                                {event.label}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-bold border ${blockColor(event.block)}`}
                                >
                                  {event.block}
                                </Badge>
                                <span className="text-[11px] text-white/30 capitalize">
                                  {event.gender}
                                </span>
                                <span className="text-[11px] text-white/20">·</span>
                                <span className="text-[11px] text-white/30 capitalize">
                                  {event.modality}
                                </span>
                              </div>
                            </div>
                          </label>
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Format ── */}
            {currentStep === 'format' && (
              <div className="space-y-5">
                <FieldGroup label="Tournament Format *">
                  <Controller
                    name="format"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={selTrigger}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={selContent}>
                          <SelectItem value="hybrid" className={selItem}>
                            Hybrid (Groups + Elimination)
                          </SelectItem>
                          <SelectItem value="single_elimination" className={selItem}>
                            Single Elimination
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FieldGroup>

                {format === 'hybrid' && (
                  <div className="space-y-4 p-4 bg-white/[0.02] border border-white/[0.07] rounded-xl">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                      Hybrid Configuration
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldGroup label="Group Size (2–6)">
                        <Input
                          {...register('format_config.groupSize', { valueAsNumber: true })}
                          type="number"
                          min="2"
                          max="6"
                          className={inputCls}
                        />
                      </FieldGroup>
                      <FieldGroup label="Qualifiers Per Group">
                        <Input
                          {...register('format_config.qualifiersPerGroup', { valueAsNumber: true })}
                          type="number"
                          min="1"
                          className={inputCls}
                        />
                      </FieldGroup>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Controller
                        name="format_config.groupsStaged"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-white/[0.2] data-[state=checked]:bg-[#ace600] data-[state=checked]:border-[#ace600] data-[state=checked]:text-black"
                          />
                        )}
                      />
                      <span className="text-sm text-white/60">Stage tournaments by groups</span>
                    </label>
                  </div>
                )}

                {format === 'single_elimination' && (
                  <div className="space-y-4 p-4 bg-white/[0.02] border border-white/[0.07] rounded-xl">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                      Bracket Configuration
                    </p>
                    <FieldGroup label="Bracket Size">
                      <Select defaultValue="64">
                        <SelectTrigger className={selTrigger}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={selContent}>
                          {['4', '8', '16', '32', '64', '128'].map((n) => (
                            <SelectItem key={n} value={n} className={selItem}>
                              {n} players
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldGroup>
                  </div>
                )}
              </div>
            )}

            {/* ── Review ── */}
            {currentStep === 'review' && (
              <div className="space-y-5">
                {/* Auto-publish notice */}
                <div className="flex items-start gap-3 p-4 bg-[#ace600]/[0.06] border border-[#ace600]/20 rounded-xl">
                  <Info className="w-4 h-4 text-[#ace600] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#ace600]/80 leading-relaxed">
                    This national tournament will be{' '}
                    <strong className="text-[#ace600]">automatically published</strong> and open for
                    registration immediately upon creation.
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.05]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                      Tournament Summary
                    </p>
                  </div>
                  <div className="px-4">
                    <ReviewRow label="Name" value={name || '—'} />
                    <ReviewRow
                      label="Venue"
                      value={`${watch('venue_name') || '—'}, ${watch('city') || '—'}, ${watch('state') || '—'}`}
                    />
                    <ReviewRow
                      label="Dates"
                      value={
                        watch('start_date')
                          ? `${new Date(watch('start_date')).toLocaleDateString()} – ${new Date(watch('end_date')).toLocaleDateString()}`
                          : '—'
                      }
                    />
                    <ReviewRow
                      label="Format"
                      value={
                        format === 'hybrid' ? 'Hybrid (Groups + Elimination)' : 'Single Elimination'
                      }
                    />
                    <ReviewRow
                      label="Events"
                      value={
                        <span className="flex items-center gap-1.5">
                          <span>{selectedEvents?.length || 0} selected</span>
                          {(selectedEvents?.length || 0) > 0 && (
                            <Badge
                              variant="outline"
                              className="bg-[#ace600]/[0.08] border-[#ace600]/20 text-[#ace600] text-[10px]"
                            >
                              ✓
                            </Badge>
                          )}
                        </span>
                      }
                    />
                    <ReviewRow
                      label="Status"
                      value={
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Will be Published
                        </span>
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex gap-2.5 mt-6 pt-5 border-t border-white/[0.06]">
              {currentStep !== 'general' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  className="border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white h-9 text-sm font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1.5" /> Previous
                </Button>
              )}

              {currentStep !== 'review' ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-9 bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold shadow-[0_0_14px_rgba(172,230,0,0.15)] hover:shadow-[0_0_24px_rgba(172,230,0,0.28)] transition-all"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white h-9 text-sm font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-9 bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold shadow-[0_0_14px_rgba(172,230,0,0.15)] hover:shadow-[0_0_24px_rgba(172,230,0,0.28)] transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Creating…
                      </>
                    ) : (
                      <>
                        <Trophy className="w-3.5 h-3.5 mr-2" strokeWidth={2.5} /> Create & Publish
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FederationTournamentCreationForm;
