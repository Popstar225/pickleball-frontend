import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  ShieldAlert,
  Info,
  User,
  Layers,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { EligibilityCheckResult } from '@/types/api';

interface EligibilityCheckModalProps {
  open: boolean;
  tournamentId?: string;
  eventId: string;
  userId: string;
  partnerId?: string;
  onClose: () => void;
  onRegisterClick?: () => void;
  onEligibilityCheck?: (result: EligibilityCheckResult) => void;
}

/* ─── helpers ── */
const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1 block';

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function InfoCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5">
      <p className={labelCls}>{label}</p>
      <div className="text-sm font-semibold text-white/70">{children}</div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  iconBg = 'bg-white/[0.06]',
  iconColor = 'text-white/40',
  children,
}: {
  icon: React.ElementType;
  title: string;
  iconBg?: string;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/35">{title}</p>
      </div>
      {children}
    </div>
  );
}

function MembershipBadge({ status }: { status: string }) {
  const isPremium = status === 'premium';
  return (
    <Badge
      variant="outline"
      className={
        isPremium
          ? 'bg-[#ace600]/[0.08] border-[#ace600]/20 text-[#ace600] text-[10px] font-bold hover:bg-[#ace600]/[0.08]'
          : 'bg-white/[0.05] border-white/[0.08] text-white/40 text-[10px] font-bold hover:bg-white/[0.05]'
      }
    >
      {status}
    </Badge>
  );
}

function RegStatusBadge({ status }: { status: string }) {
  const isOpen = status === 'open';
  return (
    <Badge
      variant="outline"
      className={
        isOpen
          ? 'bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/[0.08]'
          : 'bg-white/[0.05] border-white/[0.08] text-white/40 text-[10px] font-bold hover:bg-white/[0.05]'
      }
    >
      {status}
    </Badge>
  );
}

/* ══════════════════════════════════════════════════════════════════ */

export default function EligibilityCheckModal({
  open,
  tournamentId,
  eventId,
  userId,
  partnerId,
  onClose,
  onRegisterClick,
  onEligibilityCheck,
}: EligibilityCheckModalProps) {
  const [result, setResult] = useState<EligibilityCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && userId && eventId) checkEligibility();
  }, [open, userId, eventId, partnerId]);

  const checkEligibility = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!tournamentId) {
        setError('Tournament ID is required');
        return;
      }

      const params = new URLSearchParams({ user_id: userId });
      if (partnerId) params.append('partner_id', partnerId);

      const response = (await api.get<any>(
        `/tournaments/${tournamentId}/events/${eventId}/check-eligibility?${params}`,
      )) as any;

      const eligibilityData = response?.data || response;
      setResult(eligibilityData);

      // Notify parent component of the eligibility result
      onEligibilityCheck?.(eligibilityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  const hasPenalties =
    result?.penalties?.suspended ||
    result?.penalties?.disqualified ||
    (result?.penalties?.warnings?.length ?? 0) > 0;

  /* ── eligibility outcome config ── */
  const outcome = loading
    ? null
    : result?.eligible
      ? {
          icon: CheckCircle2,
          label: 'Eligible to Register',
          bg: 'bg-emerald-500/[0.06]',
          border: 'border-emerald-500/15',
          text: 'text-emerald-400',
          dot: 'bg-emerald-400',
        }
      : {
          icon: XCircle,
          label: 'Eligibility Issues Found',
          bg: 'bg-red-500/[0.06]',
          border: 'border-red-500/15',
          text: 'text-red-400',
          dot: 'bg-red-400',
        };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0 bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-lg shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden max-h-[90vh] flex flex-col">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                loading
                  ? 'bg-white/[0.06] border-white/[0.08]'
                  : result?.eligible
                    ? 'bg-emerald-500/[0.08] border-emerald-500/20'
                    : 'bg-red-500/[0.08] border-red-500/20'
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
              ) : result?.eligible ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white leading-tight">
                {loading
                  ? 'Checking Eligibility…'
                  : result?.eligible
                    ? "You're Eligible!"
                    : 'Eligibility Issues Found'}
              </DialogTitle>
              <p className="text-[11px] text-white/35 mt-0.5">
                {loading
                  ? 'Verifying your tournament eligibility…'
                  : 'Review your eligibility details below'}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
              <p className="text-xs text-white/25">Checking eligibility details…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex gap-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Outcome banner */}
              {outcome && (
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${outcome.bg} ${outcome.border}`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${outcome.dot}`} />
                  <p className={`text-sm font-bold ${outcome.text}`}>{outcome.label}</p>
                </div>
              )}

              {/* Player info */}
              {result.playerInfo && (
                <SectionCard
                  icon={User}
                  title="Your Information"
                  iconBg="bg-sky-500/10"
                  iconColor="text-sky-400"
                >
                  <InfoGrid>
                    <InfoCell label="Name">{result.playerInfo.full_name}</InfoCell>
                    <InfoCell label="Skill Level">{result.playerInfo.skill_level}</InfoCell>
                    <InfoCell label="Gender">
                      <span className="capitalize">{result.playerInfo.gender}</span>
                    </InfoCell>
                    <InfoCell label="Membership">
                      <MembershipBadge status={result.playerInfo.membership_status} />
                    </InfoCell>
                  </InfoGrid>
                </SectionCard>
              )}

              {result.playerInfo && (result.eventInfo || result.partnerInfo) && (
                <Separator className="bg-white/[0.05]" />
              )}

              {/* Event requirements */}
              {result.eventInfo && (
                <SectionCard
                  icon={Layers}
                  title="Event Requirements"
                  iconBg="bg-violet-500/10"
                  iconColor="text-violet-400"
                >
                  <InfoGrid>
                    <InfoCell label="Skill Block">{result.eventInfo.skill_block}</InfoCell>
                    <InfoCell label="Gender">{result.eventInfo.gender}</InfoCell>
                    <InfoCell label="Registrations">
                      <span>
                        {result.eventInfo.current_participants}
                        <span className="text-white/30">/{result.eventInfo.max_participants}</span>
                      </span>
                    </InfoCell>
                    <InfoCell label="Status">
                      <RegStatusBadge status={result.eventInfo.registration_status} />
                    </InfoCell>
                  </InfoGrid>
                  {/* Fill bar */}
                  <div className="mt-1">
                    <div className="w-full h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#ace600]/60"
                        style={{
                          width: `${Math.min(100, (result.eventInfo.current_participants / result.eventInfo.max_participants) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </SectionCard>
              )}

              {result.eventInfo && result.partnerInfo && <Separator className="bg-white/[0.05]" />}

              {/* Partner info */}
              {result.partnerInfo && (
                <SectionCard
                  icon={Users}
                  title="Partner Information"
                  iconBg="bg-amber-500/10"
                  iconColor="text-amber-400"
                >
                  <InfoGrid>
                    <InfoCell label="Name">{result.partnerInfo.full_name}</InfoCell>
                    <InfoCell label="Eligibility">
                      <Badge
                        variant="outline"
                        className={
                          result.partnerInfo.is_eligible
                            ? 'bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/[0.08]'
                            : 'bg-red-500/[0.08] border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/[0.08]'
                        }
                      >
                        {result.partnerInfo.is_eligible ? 'Eligible' : 'Not Eligible'}
                      </Badge>
                    </InfoCell>
                  </InfoGrid>
                </SectionCard>
              )}

              {/* Eligibility issues */}
              {!result.eligible && result.reasons.length > 0 && (
                <div className="bg-red-500/[0.06] border border-red-500/15 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-red-400">
                      Eligibility Issues
                    </p>
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {result.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-red-400/80">
                        <span className="w-1 h-1 rounded-full bg-red-400/50 flex-shrink-0 mt-1.5" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Penalties */}
              {hasPenalties && (
                <div className="bg-amber-500/[0.06] border border-amber-500/15 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                      Penalties on Record
                    </p>
                  </div>
                  <div className="space-y-2">
                    {result.penalties?.suspended && (
                      <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2">
                        <p className="text-xs font-bold text-red-400 mb-0.5">Active Suspension</p>
                        <p className="text-xs text-white/40">{result.penalties.suspended.reason}</p>
                      </div>
                    )}
                    {result.penalties?.disqualified && (
                      <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2">
                        <p className="text-xs font-bold text-red-400 mb-0.5">Disqualification</p>
                        <p className="text-xs text-white/40">
                          {result.penalties.disqualified.reason}
                        </p>
                      </div>
                    )}
                    {(result.penalties?.warnings?.length ?? 0) > 0 && (
                      <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2">
                        <p className="text-xs font-bold text-amber-400 mb-0.5">
                          {result.penalties!.warnings.length} Warning
                          {result.penalties!.warnings.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-white/40">
                          Warnings are on record but do not block registration.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="bg-sky-500/[0.06] border border-sky-500/15 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-sky-400">
                      Notes
                    </p>
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {result.warnings.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-sky-400/70">
                        <span className="w-1 h-1 rounded-full bg-sky-400/40 flex-shrink-0 mt-1.5" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="flex gap-2.5 px-6 pb-6 pt-4 border-t border-white/[0.06] flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-9 border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white text-sm font-semibold"
          >
            Close
          </Button>
          {result?.eligible && (
            <Button
              onClick={onRegisterClick}
              className="flex-1 h-9 bg-[#ace600] hover:bg-[#c0f000] text-black text-sm font-bold gap-2 shadow-[0_0_16px_rgba(172,230,0,0.2)] hover:shadow-[0_0_28px_rgba(172,230,0,0.32)] transition-all"
            >
              <Trophy className="w-4 h-4" strokeWidth={2.5} />
              Proceed to Registration
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
