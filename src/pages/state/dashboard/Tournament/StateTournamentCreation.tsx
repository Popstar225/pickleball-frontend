import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { StateAutocomplete } from '@/components/ui/StateAutocomplete';
import {
  Plus,
  Calendar,
  MapPin,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Banknote,
  Phone,
  Mail,
  ScrollText,
} from 'lucide-react';

import { AppDispatch, RootState } from '@/store';
import { createTournament } from '@/store/slices/tournamentsSlice';
import type { CreateTournamentRequest, TournamentOrganizerPermissions } from '@/types/api';
import { Mexico } from '@/constants/constants';

interface StateTournamentCreationProps {
  onTournamentCreated?: (tournamentId: string) => void;
}

const EMPTY_FORM: CreateTournamentRequest = {
  name: '',
  tournament_type: 'state',
  category: 'singles',
  description: '',
  organizer_type: 'state',
  venue_name: '',
  venue_address: '',
  state: '',
  city: '',
  start_date: '',
  end_date: '',
  registration_deadline: '',
  entry_fee: 0,
  max_participants: 128,
  rules: '',
  contact_email: '',
  contact_phone: '',
};

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-6 h-6 rounded-md bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3 h-3 text-[#ace600]" />
      </div>
      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/35">
        {children}
      </span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-white/40 mb-1.5">
        {label}
        {required && <span className="text-[#ace600]/80 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-white/20 leading-relaxed">{hint}</p>}
    </div>
  );
}

const inputBase =
  'w-full h-10 rounded-lg bg-[#ffffff07] border border-white/[0.07] text-sm text-white placeholder:text-white/20 px-3 outline-none transition-all duration-150 focus:border-[#ace600]/40 focus:bg-[#ace600]/[0.03] focus:ring-0';

const iconInputWrap = 'relative';
const iconCls =
  'absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none';
const inputWithIcon = `${inputBase} pl-8`;

const selectTrigger =
  'w-full h-10 rounded-lg bg-[#ffffff07] border border-white/[0.07] px-3 text-sm text-white data-[placeholder]:text-white/20 outline-none focus:border-[#ace600]/40 focus:bg-[#ace600]/[0.03] transition-all duration-150';

/* ─── component ───────────────────────────────────────────────────────────── */

const StateTournamentCreation: React.FC<StateTournamentCreationProps> = ({
  onTournamentCreated,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state: RootState) => state.tournaments);
  const { user } = useSelector((state: RootState) => state.auth);

  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState<TournamentOrganizerPermissions['data'] | null>(
    null,
  );
  const [permLoading, setPermLoading] = useState(false);
  const [form, setForm] = useState<CreateTournamentRequest>(EMPTY_FORM);

  useEffect(() => {
    loadPermissions();
  }, []);

  const getAllowedTypes = (): ('local' | 'state' | 'national')[] => {
    switch (user?.user_type) {
      case 'admin':
        return ['state', 'national'];
      case 'state':
        return ['state'];
      default:
        return ['state'];
    }
  };

  async function loadPermissions() {
    setPermLoading(true);
    try {
      const canCreate = ['state', 'admin'].includes(user?.user_type || '');
      const maxMap: Record<string, number> = { admin: 1000, state: 500 };
      setPermissions({
        can_create_tournaments: canCreate,
        allowed_tournament_types: getAllowedTypes(),
        max_participants_limit: maxMap[user?.user_type || ''] ?? 128,
        max_teams_limit: 32,
        can_create_paid_events: true,
        can_create_state_level: true,
        can_create_national_level: user?.user_type === 'admin',
        requires_approval: false,
        approval_required_by: undefined,
        current_subscription_level: 'premium',
        upgrade_required_for: [],
      });
    } finally {
      setPermLoading(false);
    }
  }

  const set = (field: keyof CreateTournamentRequest, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit() {
    if (!form.name || !form.venue_name || !form.state) {
      alert('Please fill in all required fields.');
      return;
    }
    if (new Date(form.start_date) >= new Date(form.end_date)) {
      alert('End date must be after start date.');
      return;
    }
    if (new Date(form.registration_deadline) >= new Date(form.start_date)) {
      alert('Registration deadline must be before start date.');
      return;
    }
    if (
      form.max_participants &&
      form.max_participants > (permissions?.max_participants_limit ?? 128)
    ) {
      alert(`Max participants limit is ${permissions?.max_participants_limit}.`);
      return;
    }
    try {
      const result = await dispatch(createTournament(form)).unwrap();
      setOpen(false);
      setForm(EMPTY_FORM);
      if (onTournamentCreated && result && typeof result === 'object' && 'id' in result) {
        onTournamentCreated((result as any).id);
      } else {
        navigate('/state/dashboard/tournaments');
      }
    } catch {}
  }

  const canCreate = permissions?.can_create_tournaments ?? false;

  const typeDesc: Record<string, string> = {
    state: 'Federal Entity level',
    national: 'Country · Annual Main Event',
  };

  const typeBadge: Record<string, string> = {
    state: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    national: 'bg-[#ace600]/10 text-[#ace600] border-[#ace600]/20',
  };

  /* access denied */
  if (!canCreate && !permLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-yellow-500/8 border border-yellow-500/15 flex items-center justify-center mb-5">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Access Restricted</h3>
        <p className="text-white/30 text-sm max-w-xs leading-relaxed">
          Only state organizations and administrators can create state-level tournaments.
        </p>
        <span className="mt-5 text-[11px] text-white/25 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-full">
          Role: {user?.user_type || 'unknown'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Permissions strip */}
      {permissions && (
        <div className="bg-[#111827] border border-white/[0.07] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
              <Trophy className="w-2.5 h-2.5 text-white/40" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/30">
              Your Permissions
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Role', value: user?.user_type ?? '—', cap: true },
              { label: 'Max Participants', value: String(permissions.max_participants_limit) },
              {
                label: 'Paid Events',
                value: permissions.can_create_paid_events ? 'Allowed' : 'Disabled',
              },
              { label: 'Needs Approval', value: permissions.requires_approval ? 'Yes' : 'No' },
            ].map(({ label, value, cap }) => (
              <div
                key={label}
                className="bg-white/[0.025] border border-white/[0.05] rounded-xl px-3.5 py-3"
              >
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-1">
                  {label}
                </p>
                <p className={`text-sm font-semibold text-white/70 ${cap ? 'capitalize' : ''}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
              Types:
            </span>
            <div className="flex gap-1.5">
              {permissions.allowed_tournament_types.map((t) => (
                <span
                  key={t}
                  className={`text-[10px] font-bold capitalize px-2.5 py-0.5 rounded-full border ${typeBadge[t] ?? 'bg-white/5 text-white/40 border-white/10'}`}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA button */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
        }}
      >
        <DialogTrigger asChild>
          <button
            disabled={!canCreate || permLoading}
            className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] active:scale-[0.98] text-black text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(172,230,0,0.18)] hover:shadow-[0_0_32px_rgba(172,230,0,0.32)]"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Create Tournament
          </button>
        </DialogTrigger>

        {/* ── DIALOG ──────────────────────────────────────────────────── */}
        <DialogContent
          className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-[680px] w-full shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden"
          style={{ maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Dialog header */}
          <div className="px-7 pt-6 pb-5 border-b border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#ace600]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">
                  Create State Tournament
                </h2>
                <p className="text-[11px] text-white/30 mt-0.5">
                  Events will be created within this tournament
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable form */}
          <div className="overflow-y-auto flex-1 px-7 py-6 space-y-8">
            {/* Basic info */}
            <section>
              <SectionHeading icon={Trophy}>Basic Information</SectionHeading>
              <div className="space-y-4">
                <Field label="Tournament Name" required>
                  <input
                    className={inputBase}
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="e.g. State Championship 2025"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tournament Type" required>
                    <Select
                      value={form.tournament_type}
                      onValueChange={(v) => set('tournament_type', v)}
                    >
                      <SelectTrigger className={selectTrigger}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl">
                        {permissions?.allowed_tournament_types.map((t) => (
                          <SelectItem
                            key={t}
                            value={t}
                            className="text-white/80 focus:bg-white/[0.06] focus:text-white rounded-lg"
                          >
                            <div className="py-0.5">
                              <div className="font-semibold capitalize text-sm text-white">{t}</div>
                              <div className="text-[10px] text-white/35 mt-0.5">{typeDesc[t]}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Category" required>
                    <Select value={form.category} onValueChange={(v) => set('category', v)}>
                      <SelectTrigger className={selectTrigger}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl">
                        {[
                          { v: 'singles', l: 'Singles' },
                          { v: 'doubles', l: 'Doubles' },
                          { v: 'mixed_doubles', l: 'Mixed Doubles' },
                          { v: 'team', l: 'Team' },
                        ].map(({ v, l }) => (
                          <SelectItem
                            key={v}
                            value={v}
                            className="text-white/80 focus:bg-white/[0.06] focus:text-white rounded-lg"
                          >
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Max Participants"
                    hint={`Your limit: ${permissions?.max_participants_limit ?? 128}`}
                  >
                    <input
                      className={inputBase}
                      type="number"
                      value={form.max_participants || ''}
                      onChange={(e) => set('max_participants', parseInt(e.target.value))}
                      placeholder="128"
                    />
                  </Field>

                  <Field label="Entry Fee (MXN)">
                    <div className={iconInputWrap}>
                      <Banknote className={`${iconCls}`} />
                      <input
                        className={inputWithIcon}
                        type="number"
                        value={form.entry_fee || ''}
                        onChange={(e) => set('entry_fee', parseFloat(e.target.value))}
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                  </Field>
                </div>

                <Field label="Description">
                  <textarea
                    className={`${inputBase} resize-none py-2 min-h-24`}
                    value={form.description || ''}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Describe your tournament..."
                  />
                </Field>
              </div>
            </section>

            {/* Venue & Location */}
            <section>
              <SectionHeading icon={MapPin}>Venue & Location</SectionHeading>
              <div className="space-y-4">
                <Field label="Venue Name" required>
                  <input
                    className={inputBase}
                    value={form.venue_name}
                    onChange={(e) => set('venue_name', e.target.value)}
                    placeholder="e.g. City Sports Complex"
                  />
                </Field>

                <Field label="Venue Address">
                  <input
                    className={inputBase}
                    value={form.venue_address || ''}
                    onChange={(e) => set('venue_address', e.target.value)}
                    placeholder="Full address"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="State" required>
                    <Select value={form.state} onValueChange={(v) => set('state', v)}>
                      <SelectTrigger className={selectTrigger}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl max-h-60">
                        {Mexico.map((m) => (
                          <SelectItem
                            key={m.state}
                            value={m.state}
                            className="text-white/80 focus:bg-white/[0.06] focus:text-white rounded-lg"
                          >
                            {m.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="City" required>
                    <input
                      className={inputBase}
                      value={form.city}
                      onChange={(e) => set('city', e.target.value)}
                      placeholder="e.g. Mexico City"
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Dates & Deadlines */}
            <section>
              <SectionHeading icon={Calendar}>Dates & Deadlines</SectionHeading>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start Date" required>
                    <input
                      className={inputBase}
                      type="datetime-local"
                      value={form.start_date}
                      onChange={(e) => set('start_date', e.target.value)}
                    />
                  </Field>

                  <Field label="End Date" required>
                    <input
                      className={inputBase}
                      type="datetime-local"
                      value={form.end_date}
                      onChange={(e) => set('end_date', e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Registration Deadline" required>
                  <input
                    className={inputBase}
                    type="datetime-local"
                    value={form.registration_deadline}
                    onChange={(e) => set('registration_deadline', e.target.value)}
                  />
                </Field>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <SectionHeading icon={Mail}>Contact Information</SectionHeading>
              <div className="space-y-4">
                <Field label="Contact Email">
                  <div className={iconInputWrap}>
                    <Mail className={`${iconCls}`} />
                    <input
                      className={inputWithIcon}
                      type="email"
                      value={form.contact_email || ''}
                      onChange={(e) => set('contact_email', e.target.value)}
                      placeholder="contact@tournament.com"
                    />
                  </div>
                </Field>

                <Field label="Contact Phone">
                  <div className={iconInputWrap}>
                    <Phone className={`${iconCls}`} />
                    <input
                      className={inputWithIcon}
                      type="tel"
                      value={form.contact_phone || ''}
                      onChange={(e) => set('contact_phone', e.target.value)}
                      placeholder="+52 1234567890"
                    />
                  </div>
                </Field>
              </div>
            </section>

            {/* Rules */}
            <section>
              <SectionHeading icon={ScrollText}>Rules & Guidelines</SectionHeading>
              <Field label="Tournament Rules">
                <textarea
                  className={`${inputBase} resize-none py-2 min-h-32`}
                  value={form.rules || ''}
                  onChange={(e) => set('rules', e.target.value)}
                  placeholder="Enter tournament rules and guidelines..."
                />
              </Field>
            </section>
          </div>

          {/* Dialog footer */}
          <div className="flex gap-3 px-7 py-5 border-t border-white/[0.06] flex-shrink-0 bg-[#0a0e14]">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 h-10 rounded-lg border border-white/[0.08] text-white/80 hover:text-white hover:bg-white/[0.04] transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-10 rounded-lg bg-[#ace600] hover:bg-[#c0f000] disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              )}
              Create Tournament
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StateTournamentCreation;
