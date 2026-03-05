import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  AlertTriangle,
  Users,
  MapPin,
  Calendar,
  Settings,
  Trash2,
  Edit,
  Mail,
  Phone,
  ChevronLeft,
  Loader2,
  Trophy,
  BookOpen,
  ScrollText,
  Clock,
} from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import { fetchTournament, deleteTournament } from '@/store/slices/tournamentsSlice';
import type { Tournament } from '@/types/api';

interface StateTournamentDetailsProps {
  tournamentId: string;
}

/* ─── shared with the rest of the design system ── */
const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  draft: { label: 'Draft', dot: 'bg-white/30', text: 'text-white/50', bg: 'bg-white/[0.06]' },
  pending_validation: {
    label: 'Awaiting Approval',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-500/[0.08]',
  },
  approved: {
    label: 'Approved',
    dot: 'bg-blue-400',
    text: 'text-blue-300',
    bg: 'bg-blue-500/[0.08]',
  },
  rejected: {
    label: 'Rejected',
    dot: 'bg-red-400',
    text: 'text-red-400',
    bg: 'bg-red-500/[0.08]',
  },
  published: {
    label: 'Published',
    dot: 'bg-sky-400',
    text: 'text-sky-300',
    bg: 'bg-sky-500/[0.08]',
  },
  in_progress: {
    label: 'In Progress',
    dot: 'bg-[#ace600]',
    text: 'text-[#ace600]',
    bg: 'bg-[#ace600]/[0.08]',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/[0.08]',
  },
  cancelled: {
    label: 'Cancelled',
    dot: 'bg-red-400',
    text: 'text-red-400',
    bg: 'bg-red-500/[0.08]',
  },
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  local: { label: 'Local', color: 'text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20' },
  state: { label: 'State', color: 'text-sky-400 bg-sky-500/[0.08] border-sky-500/20' },
  national: { label: 'National', color: 'text-[#ace600] bg-[#ace600]/[0.08] border-[#ace600]/20' },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/[0.06] ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.state;
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function MetaPill({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] rounded-lg border border-white/[0.06]">
      <Icon className="w-3 h-3 text-white/30 flex-shrink-0" />
      <span className="text-[11px] font-medium text-white/55 whitespace-nowrap">{children}</span>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5 text-white/25" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */

const StateTournamentDetails: React.FC<StateTournamentDetailsProps> = ({ tournamentId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { currentTournament, loading, error } = useSelector(
    (state: RootState) => state.tournaments,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (tournamentId) dispatch(fetchTournament(tournamentId));
  }, [tournamentId, dispatch]);

  // Normalize possible { data: {...} } API shape
  const tRaw: any = currentTournament || null;
  const t: Tournament | null = tRaw ? (tRaw.data ?? tRaw) : null;

  const canManage = (t: Tournament | null) => {
    if (!t || !user) return false;
    if (user.user_type === 'admin') return true;
    if (user.user_type === 'state') return t.organizer_type === 'state';
    return false;
  };

  const handleDelete = async () => {
    if (!t) return;
    try {
      await dispatch(deleteTournament(t.id)).unwrap();
      navigate('/state/dashboard/tournaments');
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const fillPct = t ? Math.min(100, ((t.current_participants ?? 0) / t.max_participants) * 100) : 0;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
        <p className="text-sm text-white/25">Loading tournament…</p>
      </div>
    );
  }

  /* ── Not found ── */
  if (!t) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertTriangle className="w-6 h-6 text-red-400" />
        <p className="text-sm text-white/25">Tournament not found or no permission</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-3 text-[11px] font-medium text-[#ace600] hover:text-[#c0f000] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        {canManage(t) && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/state/dashboard/tournaments/${t.id}/edit`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 hover:text-white rounded-lg text-[11px] font-semibold transition-all"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-[11px] font-semibold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* ── Main ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Hero */}
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{t.name}</h1>
                <p className="text-[13px] text-white/40 mt-1">{t.description}</p>
              </div>
              <StatusPill status={t.status} />
            </div>
            <div className="flex flex-wrap gap-2">
              <TypeBadge type={t.tournament_type} />
              <MetaPill icon={Trophy}>{t.category}</MetaPill>
              <MetaPill icon={Calendar}>
                {formatDate(t.start_date)} — {formatDate(t.end_date)}
              </MetaPill>
            </div>
          </div>

          {/* Info Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Venue */}
            <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5">
              <Section icon={MapPin} title="Venue">
                <div className="space-y-2.5">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">
                      Name
                    </p>
                    <p className="text-sm text-white/80">{t.venue_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">
                      Location
                    </p>
                    <p className="text-sm text-white/80">
                      {t.city}, {t.state}
                    </p>
                  </div>
                </div>
              </Section>
            </div>

            {/* Dates */}
            <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5">
              <Section icon={Calendar} title="Schedule">
                <div className="space-y-2.5">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">
                      Dates
                    </p>
                    <p className="text-sm text-white/80">
                      {formatDate(t.start_date)} — {formatDate(t.end_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">
                      Registration Closes
                    </p>
                    <p className="text-sm text-white/80">{formatDate(t.registration_deadline)}</p>
                  </div>
                </div>
              </Section>
            </div>

            {/* Contact */}
            <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5">
              <Section icon={Mail} title="Contact">
                <div className="space-y-2.5">
                  {t.contact_email && (
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">
                        Email
                      </p>
                      <p className="text-sm text-white/80 break-all">{t.contact_email}</p>
                    </div>
                  )}
                  {t.contact_phone && (
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">
                        Phone
                      </p>
                      <p className="text-sm text-white/80">{t.contact_phone}</p>
                    </div>
                  )}
                </div>
              </Section>
            </div>

            {/* Financials */}
            <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5">
              <Section icon={Trophy} title="Details">
                <div className="space-y-2.5">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">
                      Entry Fee
                    </p>
                    <p className="text-sm text-white/80">
                      {t.entry_fee ? `$${t.entry_fee} MXN` : 'Free'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">
                      Max Participants
                    </p>
                    <p className="text-sm text-white/80">{t.max_participants}</p>
                  </div>
                </div>
              </Section>
            </div>
          </div>

          {/* Rules */}
          {t.rules && (
            <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5">
              <Section icon={ScrollText} title="Rules">
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                  {t.rules}
                </p>
              </Section>
            </div>
          )}
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-5">
          {/* Participants */}
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                Registrations
              </span>
              <Users className="w-3.5 h-3.5 text-white/20" />
            </div>
            <div className="mb-3">
              <div className="text-xl font-bold text-white">
                {t.current_participants ?? 0}/{t.max_participants}
              </div>
              <p className="text-[11px] text-white/40 mt-0.5">{Math.round(fillPct)}% Filled</p>
            </div>
            <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ace600] transition-all"
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-4">
              Status
            </div>
            <div className="space-y-2">
              {[
                { status: 'draft', label: 'Draft' },
                { status: 'pending_validation', label: 'Awaiting Approval' },
                { status: 'approved', label: 'Approved' },
                { status: 'published', label: 'Published' },
                { status: 'in_progress', label: 'In Progress' },
                { status: 'completed', label: 'Completed' },
              ].map(({ status, label }) => {
                const isActive = t.status === status;
                return (
                  <div
                    key={status}
                    className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                      isActive
                        ? 'bg-[#ace600]/10 text-[#ace600] border-[#ace600]/30'
                        : 'bg-white/[0.02] text-white/40 border-white/[0.06]'
                    }`}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete Dialog ── */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md bg-[#0d1117] border border-white/[0.08]">
            <div className="text-center py-6">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-white mb-2">Delete Tournament?</h2>
              <p className="text-sm text-white/60 mb-6">
                Are you sure you want to delete "{t.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-white rounded-lg hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StateTournamentDetails;
