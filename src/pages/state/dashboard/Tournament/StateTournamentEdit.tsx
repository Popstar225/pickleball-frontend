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
import {
  Calendar,
  MapPin,
  Trophy,
  AlertTriangle,
  Banknote,
  Phone,
  Mail,
  ScrollText,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import { fetchTournament, updateTournament } from '@/store/slices/tournamentsSlice';
import type { Tournament } from '@/types/api';
import { Mexico } from '@/constants/constants';

interface StateTournamentEditProps {
  tournamentId: string;
}

const ALLOWED_STATUSES = [
  'draft',
  'pending_validation',
  'approved',
  'rejected',
  'published',
  'in_progress',
  'completed',
  'cancelled',
];

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

/* ═══════════════════════════════════════════════════════════════════ */

const StateTournamentEdit: React.FC<StateTournamentEditProps> = ({ tournamentId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentTournament, loading: updateLoading } = useSelector(
    (state: RootState) => state.tournaments,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState<Partial<Tournament> | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTournament();
  }, [tournamentId]);

  async function loadTournament() {
    setLoading(true);
    try {
      await dispatch(fetchTournament(tournamentId)).unwrap();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentTournament) {
      const t = (currentTournament as any)?.data ?? currentTournament;
      if (t && typeof t === 'object') {
        setForm(t);
      }
    }
  }, [currentTournament]);

  const canEdit = form && user && (user.user_type === 'admin' || user.user_type === 'state');

  const set = (field: keyof Tournament, value: any) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  async function handleSubmit() {
    if (!form || !form.id) return;

    if (new Date(form.start_date || '') >= new Date(form.end_date || '')) {
      alert('End date must be after start date.');
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        updateTournament({
          id: form.id,
          data: {
            name: form.name,
            tournament_type: form.tournament_type,
            category: form.category,
            description: form.description,
            venue_name: form.venue_name,
            venue_address: form.venue_address,
            state: form.state,
            city: form.city,
            start_date: form.start_date,
            end_date: form.end_date,
            registration_deadline: form.registration_deadline,
            entry_fee: form.entry_fee,
            max_participants: form.max_participants,
            rules: form.rules,
            contact_email: form.contact_email,
            contact_phone: form.contact_phone,
            status: form.status,
          },
        }),
      );

      alert('Tournament updated successfully!');
      navigate(`/state/dashboard/tournaments/${form.id}`);
    } catch (err: any) {
      alert(`Failed to update: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-24">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-white/40">Tournament not found</p>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="text-center py-24">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <p className="text-white/40">You don't have permission to edit this tournament</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-white">Edit Tournament</h1>
        <div />
      </div>

      {/* Form */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-8 space-y-8">
        {/* Basic Info */}
        <section>
          <SectionHeading icon={Trophy}>Basic Information</SectionHeading>
          <div className="space-y-4">
            <Field label="Tournament Name" required>
              <input
                className={inputBase}
                value={form.name || ''}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Tournament name"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <Select
                  value={form.tournament_type || ''}
                  onValueChange={(v) => set('tournament_type', v)}
                >
                  <SelectTrigger className={selectTrigger}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl">
                    {['state', 'national'].map((t) => (
                      <SelectItem key={t} value={t} className="text-white/80 focus:bg-white/[0.06]">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Category">
                <Select value={form.category || ''} onValueChange={(v) => set('category', v)}>
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
                      <SelectItem key={v} value={v} className="text-white/80 focus:bg-white/[0.06]">
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Description">
              <textarea
                className={`${inputBase} resize-none py-2 min-h-20`}
                value={form.description || ''}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe your tournament"
              />
            </Field>
          </div>
        </section>

        {/* Venue */}
        <section>
          <SectionHeading icon={MapPin}>Venue & Location</SectionHeading>
          <div className="space-y-4">
            <Field label="Venue Name">
              <input
                className={inputBase}
                value={form.venue_name || ''}
                onChange={(e) => set('venue_name', e.target.value)}
                placeholder="Venue name"
              />
            </Field>

            <Field label="Address">
              <input
                className={inputBase}
                value={form.venue_address || ''}
                onChange={(e) => set('venue_address', e.target.value)}
                placeholder="Full address"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="State">
                <Select value={form.state || ''} onValueChange={(v) => set('state', v)}>
                  <SelectTrigger className={selectTrigger}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl max-h-60">
                    {Mexico.map((m) => (
                      <SelectItem
                        key={m.state}
                        value={m.state}
                        className="text-white/80 focus:bg-white/[0.06]"
                      >
                        {m.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="City">
                <input
                  className={inputBase}
                  value={form.city || ''}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="City"
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Dates */}
        <section>
          <SectionHeading icon={Calendar}>Dates & Deadlines</SectionHeading>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <input
                  className={inputBase}
                  type="datetime-local"
                  value={
                    form.start_date ? new Date(form.start_date).toISOString().slice(0, 16) : ''
                  }
                  onChange={(e) => set('start_date', e.target.value)}
                />
              </Field>

              <Field label="End Date">
                <input
                  className={inputBase}
                  type="datetime-local"
                  value={form.end_date ? new Date(form.end_date).toISOString().slice(0, 16) : ''}
                  onChange={(e) => set('end_date', e.target.value)}
                />
              </Field>
            </div>

            <Field label="Registration Deadline">
              <input
                className={inputBase}
                type="datetime-local"
                value={
                  form.registration_deadline
                    ? new Date(form.registration_deadline).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) => set('registration_deadline', e.target.value)}
              />
            </Field>
          </div>
        </section>

        {/* Financial */}
        <section>
          <SectionHeading icon={Banknote}>Details</SectionHeading>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Entry Fee (MXN)">
                <div className={iconInputWrap}>
                  <Banknote className={`${iconCls}`} />
                  <input
                    className={inputWithIcon}
                    type="number"
                    value={form.entry_fee || ''}
                    onChange={(e) => set('entry_fee', parseFloat(e.target.value))}
                  />
                </div>
              </Field>

              <Field label="Max Participants">
                <input
                  className={inputBase}
                  type="number"
                  value={form.max_participants || ''}
                  onChange={(e) => set('max_participants', parseInt(e.target.value))}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <SectionHeading icon={Mail}>Contact</SectionHeading>
          <div className="space-y-4">
            <Field label="Email">
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

            <Field label="Phone">
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
          <SectionHeading icon={ScrollText}>Rules</SectionHeading>
          <Field label="Tournament Rules">
            <textarea
              className={`${inputBase} resize-none py-2 min-h-32`}
              value={form.rules || ''}
              onChange={(e) => set('rules', e.target.value)}
              placeholder="Enter rules"
            />
          </Field>
        </section>

        {/* Status */}
        <section>
          <SectionHeading icon={Trophy}>Status</SectionHeading>
          <Field label="Tournament Status">
            <Select value={form.status || 'draft'} onValueChange={(v) => set('status', v)}>
              <SelectTrigger className={selectTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl">
                {ALLOWED_STATUSES.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    className="text-white/80 focus:bg-white/[0.06] capitalize"
                  >
                    {s.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </section>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 h-11 rounded-lg border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 h-11 rounded-lg bg-[#ace600] hover:bg-[#c0f000] disabled:opacity-60 text-black font-bold transition-all flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default StateTournamentEdit;
