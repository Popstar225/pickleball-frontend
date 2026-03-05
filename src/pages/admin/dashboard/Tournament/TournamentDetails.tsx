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

interface TournamentDetailsProps {
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
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.local;
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

const TournamentDetails: React.FC<TournamentDetailsProps> = ({ tournamentId }) => {
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
    if (user.user_type === 'state')
      return t.organizer_type === 'state' || t.tournament_type === 'local';
    if (user.user_type === 'club') return t.organizer_type === 'club';
    return false;
  };

  const handleDelete = async () => {
    if (!t) return;
    try {
      await dispatch(deleteTournament(t.id)).unwrap();
      navigate('/dashboard/tournaments');
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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
          <Trophy className="w-6 h-6 text-white/20" />
        </div>
        <p className="text-white/50 font-semibold text-sm mb-1">Tournament not found</p>
        <p className="text-white/20 text-xs mb-5">
          This tournament may have been removed or the ID is incorrect.
        </p>
        <button
          onClick={() => navigate('/tournaments')}
          className="flex items-center gap-2 text-xs font-semibold text-white/40 hover:text-white/70 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to tournaments
        </button>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className="space-y-5 p-1 max-w-4xl">
      {/* ── Back ── */}
      <button
        onClick={() => navigate('/tournaments')}
        className="flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> All tournaments
      </button>

      {/* ── Main card ── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        {/* Accent stripe */}
        <div className="h-px w-full bg-gradient-to-r from-[#ace600]/50 via-[#ace600]/15 to-transparent" />

        {/* Header */}
        <div className="px-6 pt-5 pb-5 border-b border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={t.tournament_type ?? 'local'} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                  {t.category}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                {t.name}
              </h1>
            </div>
            <div className="flex-shrink-0">
              <StatusPill status={t.status} />
            </div>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <MetaPill icon={Calendar}>
              {formatDate(t.start_date)} – {formatDate(t.end_date)}
            </MetaPill>
            {t.registration_deadline && (
              <MetaPill icon={Clock}>Reg. closes {formatDate(t.registration_deadline)}</MetaPill>
            )}
            <MetaPill icon={MapPin}>
              {t.city}, {t.state}
            </MetaPill>
            <MetaPill icon={Users}>
              {t.current_participants ?? 0} / {t.max_participants} participants
            </MetaPill>
          </div>
        </div>

        {/* Body: 3-col on large, stacked on small */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
          {/* Left — venue + participants + contact */}
          <div className="px-6 py-5 space-y-5">
            <Section icon={MapPin} title="Venue">
              <p className="text-sm font-semibold text-white/80 leading-tight">{t.venue_name}</p>
              <p className="text-xs text-white/35 mt-0.5">
                {t.city}, {t.state}
              </p>
            </Section>

            <Section icon={Users} title="Participants">
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-2xl font-bold text-white">{t.current_participants ?? 0}</span>
                <span className="text-sm text-white/30">/ {t.max_participants}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#ace600]/60 transition-all"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
              <p className="text-[11px] text-white/25 mt-1.5">
                {Math.round(fillPct)}% capacity filled
              </p>
            </Section>

            <Section icon={Mail} title="Contact">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-white/25" />
                  <span className="text-xs text-white/55">{t.contact_email || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-white/25" />
                  <span className="text-xs text-white/55">{t.contact_phone || '—'}</span>
                </div>
              </div>
            </Section>
          </div>

          {/* Center — description */}
          <div className="px-6 py-5">
            <Section icon={BookOpen} title="Description">
              {t.description ? (
                <p className="text-sm text-white/55 leading-relaxed whitespace-pre-wrap">
                  {t.description}
                </p>
              ) : (
                <p className="text-xs text-white/20 italic">No description provided.</p>
              )}
            </Section>
          </div>

          {/* Right — rules */}
          <div className="px-6 py-5">
            <Section icon={ScrollText} title="Rules">
              {t.rules ? (
                <p className="text-sm text-white/55 leading-relaxed whitespace-pre-wrap">
                  {t.rules}
                </p>
              ) : (
                <p className="text-xs text-white/20 italic">No rules provided.</p>
              )}
            </Section>
          </div>
        </div>

        {/* Action bar */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate(`/admin/dashboard/tournaments/${t.id}/manage`)}
            className="flex items-center gap-2 bg-[#ace600] hover:bg-[#c0f000] active:scale-[0.98] text-black text-sm font-bold px-4 py-2 rounded-xl transition-all duration-150 shadow-[0_0_18px_rgba(172,230,0,0.14)] hover:shadow-[0_0_28px_rgba(172,230,0,0.28)]"
          >
            <Settings className="w-4 h-4" strokeWidth={2.5} />
            Manage Events
          </button>

          {canManage(t) && (
            <button
              onClick={() => navigate(`/tournaments/${t.id}/edit`)}
              className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-white/70 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
          )}

          {canManage(t) && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 bg-red-500/[0.07] hover:bg-red-500/[0.13] border border-red-500/20 text-red-400 hover:text-red-300 text-sm font-semibold px-4 py-2 rounded-xl transition-all ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex gap-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(v) => !v && setShowDeleteDialog(false)}>
        <DialogContent className="bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm p-0 shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="w-11 h-11 rounded-2xl bg-red-500/[0.08] border border-red-500/15 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Delete Tournament</h2>
            <p className="text-sm text-white/35 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="text-white/60 font-medium">"{t.name}"</span>? This action cannot be
              undone.
            </p>
          </div>
          <div className="flex gap-2.5 px-6 pb-6">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 h-9 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-bold transition-all shadow-[0_0_16px_rgba(239,68,68,0.2)]"
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TournamentDetails;
