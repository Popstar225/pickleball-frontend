import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Trophy,
  MapPin,
  Calendar,
  ScrollText,
  ChevronLeft,
  Loader2,
  Check,
  X,
  Mail,
  Phone,
  Banknote,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import { fetchTournament, updateTournamentDetails } from '@/store/slices/tournamentsSlice';
import type { Tournament, CreateTournamentRequest } from '@/types/api';

interface TournamentEditProps {
  tournamentId: string;
}

// ─── Shared style tokens ──────────────────────────────────────────────────────
const inputCls =
  'w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white ' +
  'placeholder:text-white/20 px-3 outline-none transition-all duration-150 ' +
  'focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03]';

const selectTriggerCls =
  'w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 text-sm text-white ' +
  'focus:border-[#ace600]/50 transition-all duration-150';

const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5';

// ─── Atoms ────────────────────────────────────────────────────────────────────
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
      <label className={labelCls}>
        {label}
        {required && <span className="text-[#ace600]/70 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-white/20">{hint}</p>}
    </div>
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
      <div className="w-6 h-6 rounded-md bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3 h-3 text-[#ace600]" />
      </div>
      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/30">
        {children}
      </span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const TournamentEdit: React.FC<TournamentEditProps> = ({ tournamentId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentTournament, loading } = useSelector((state: RootState) => state.tournaments);
  const { user } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState<CreateTournamentRequest | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tournamentId) dispatch(fetchTournament(tournamentId));
  }, [tournamentId, dispatch]);

  useEffect(() => {
    const t = (currentTournament as any)?.data;
    if (currentTournament) {
      setForm({
        name: t.name,
        tournament_type: t.tournament_type,
        category: t.category,
        description: t.description || '',
        organizer_type: t.organizer_type,
        venue_name: t.venue_name,
        venue_address: t.venue_address || '',
        state: t.state,
        city: t.city,
        latitude: t.latitude,
        longitude: t.longitude,
        start_date: t.start_date?.split('T')[0] ?? '',
        end_date: t.end_date?.split('T')[0] ?? '',
        registration_deadline: t.registration_deadline?.split('T')[0] ?? '',
        entry_fee: t.entry_fee || 0,
        max_participants: t.max_participants || 64,
        max_teams: t.max_teams || 0,
        skill_levels: t.skill_levels || [],
        age_categories: t.age_categories || [],
        gender_categories: t.gender_categories || [],
        tournament_format: t.tournament_format || '',
        points_to_win: t.points_to_win || 0,
        win_by: t.win_by || 0,
        rules: t.rules || '',
        contact_email: t.contact_email || '',
        contact_phone: t.contact_phone || '',
      } as CreateTournamentRequest);
    }
  }, [currentTournament]);

  const canEdit = () => {
    const t = (currentTournament as any)?.data;
    if (!t || !user) return false;
    console.log('Checking edit permissions for user', t, user);
    if (user.user_type === 'admin') return true;
    if (user.user_type === 'state')
      return t.organizer_type === 'state' || t.tournament_type === 'local';
    if (user.user_type === 'club') {
      // Club users can edit club tournaments
      return t.organizer_type === 'club';
    }
    return false;
  };

  const set = (field: keyof CreateTournamentRequest, value: any) =>
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const handleSubmit = async () => {
    if (!form || !currentTournament) return;
    setSaving(true);
    setError(null);
    try {
      await dispatch(
        updateTournamentDetails({ id: currentTournament.id, updates: { ...form } as any }),
      ).unwrap();
      navigate(`/tournaments/${currentTournament.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading / not ready ───────────────────────────────────────────────────
  if (loading || !form) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
        <p className="text-sm text-white/25">Loading tournament…</p>
      </div>
    );
  }

  if (!canEdit()) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/[0.08] border border-red-500/15 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-white/50 font-semibold text-sm mb-1">Access Denied</p>
        <p className="text-white/20 text-xs">You don't have permission to edit this tournament.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-5 text-xs text-white/30 hover:text-white/55 transition-colors flex items-center gap-1.5"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Go back
        </button>
      </div>
    );
  }

  const duration =
    form.start_date && form.end_date && new Date(form.end_date) > new Date(form.start_date)
      ? Math.ceil(
          (new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / 86400000,
        )
      : null;

  return (
    <div className="space-y-5 p-1">
      {/* back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/55 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Back to Tournament
      </button>

      {/* ── Page heading ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Edit Tournament</h1>
          <p className="text-xs text-white/30 mt-0.5">
            {currentTournament?.name && (
              <span className="text-white/50">{currentTournament.name}</span>
            )}
          </p>
        </div>
        {/* action buttons – duplicated here for quick access on tall pages */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            disabled={saving}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs font-semibold transition-all disabled:opacity-40"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-1.5 h-8 px-4 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold transition-all disabled:opacity-50 shadow-[0_0_14px_rgba(172,230,0,0.15)]"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Form card ─────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-6 py-6 space-y-8">
        {/* Basics */}
        <section>
          <SectionHeading icon={Trophy}>Basic Information</SectionHeading>
          <div className="space-y-4">
            <Field label="Tournament Name" required>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Summer Open 2025"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Type" required>
                <Select
                  value={form.tournament_type}
                  onValueChange={(v) => set('tournament_type', v)}
                >
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl">
                    {[
                      { v: 'local', l: 'Local', s: 'City / Area level' },
                      { v: 'state', l: 'State', s: 'Federal Entity level' },
                      { v: 'national', l: 'National', s: 'Country ·a Annual Main Event' },
                    ].map(({ v, l, s }) => (
                      <SelectItem
                        key={v}
                        value={v}
                        className="text-white/70 focus:bg-white/[0.06] focus:text-white"
                      >
                        <div>
                          <div className="font-semibold text-sm text-white">{l}</div>
                          <div className="text-[10px] text-white/35">{s}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Category" required>
                <Select value={form.category} onValueChange={(v) => set('category', v)}>
                  <SelectTrigger className={selectTriggerCls}>
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
                        className="text-white/70 focus:bg-white/[0.06] focus:text-white"
                      >
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Max Participants">
                <input
                  className={inputCls}
                  type="number"
                  value={form.max_participants || ''}
                  onChange={(e) => set('max_participants', parseInt(e.target.value))}
                  min={1}
                />
              </Field>
              <Field label="Entry Fee (MXN)">
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                  <input
                    className={`${inputCls} pl-8`}
                    type="number"
                    value={form.entry_fee || ''}
                    onChange={(e) => set('entry_fee', parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                  />
                </div>
              </Field>
            </div>

            <Field label="Description">
              <textarea
                className={`${inputCls} h-auto py-2.5 resize-none`}
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Brief overview…"
              />
            </Field>
          </div>
        </section>

        {/* Venue */}
        <section>
          <SectionHeading icon={MapPin}>Venue</SectionHeading>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Venue Name" required>
                <input
                  className={inputCls}
                  value={form.venue_name}
                  onChange={(e) => set('venue_name', e.target.value)}
                  placeholder="Club or facility name"
                />
              </Field>
              <Field label="Address">
                <input
                  className={inputCls}
                  value={form.venue_address}
                  onChange={(e) => set('venue_address', e.target.value)}
                  placeholder="Street address"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="State" required>
                <input
                  className={inputCls}
                  value={form.state}
                  onChange={(e) => set('state', e.target.value)}
                  placeholder="e.g. Jalisco"
                />
              </Field>
              <Field label="City" required>
                <input
                  className={inputCls}
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="e.g. Guadalajara"
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Dates */}
        <section>
          <SectionHeading icon={Calendar}>Dates</SectionHeading>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Start Date" required>
              <input
                className={inputCls}
                type="date"
                value={form.start_date}
                onChange={(e) => set('start_date', e.target.value)}
              />
            </Field>
            <Field label="End Date" required>
              <input
                className={inputCls}
                type="date"
                value={form.end_date}
                onChange={(e) => set('end_date', e.target.value)}
              />
            </Field>
            <Field label="Registration Deadline" required hint="Must close before start date">
              <input
                className={inputCls}
                type="date"
                value={form.registration_deadline}
                onChange={(e) => set('registration_deadline', e.target.value)}
              />
            </Field>
          </div>
          {duration && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-[#ace600]/[0.06] border border-[#ace600]/15 rounded-lg px-3 py-1.5">
              <Calendar className="w-3 h-3 text-[#ace600]" />
              <span className="text-[11px] font-bold text-[#ace600]">
                {duration}-day tournament
              </span>
            </div>
          )}
        </section>

        {/* Contact & Rules */}
        <section>
          <SectionHeading icon={ScrollText}>Contact &amp; Rules</SectionHeading>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact Email">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                  <input
                    className={`${inputCls} pl-8`}
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => set('contact_email', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
              </Field>
              <Field label="Contact Phone">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                  <input
                    className={`${inputCls} pl-8`}
                    value={form.contact_phone}
                    onChange={(e) => set('contact_phone', e.target.value)}
                    placeholder="+52 55 0000 0000"
                  />
                </div>
              </Field>
            </div>
            <Field label="Rules &amp; Regulations">
              <textarea
                className={`${inputCls} h-auto py-2.5 resize-none`}
                rows={4}
                value={form.rules}
                onChange={(e) => set('rules', e.target.value)}
                placeholder="Tournament rules and regulations…"
              />
            </Field>
          </div>
        </section>
      </div>

      {/* error */}
      {error && (
        <div className="flex gap-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* ── Footer actions ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-[#0a0e14] border border-white/[0.06] rounded-2xl">
        <button
          onClick={() => navigate(-1)}
          disabled={saving}
          className="text-sm text-white/30 hover:text-white/55 transition-colors disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] active:scale-[0.98] text-black text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-150 disabled:opacity-50 shadow-[0_0_18px_rgba(172,230,0,0.2)] hover:shadow-[0_0_28px_rgba(172,230,0,0.35)]"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Check className="w-4 h-4" /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TournamentEdit;
