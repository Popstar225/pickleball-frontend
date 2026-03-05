import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock, Users, Zap, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StartTournamentConfirmationModalProps {
  open: boolean;
  tournamentName: string;
  eventCount: number;
  totalRegistrations: number;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function StartTournamentConfirmationModal({
  open,
  tournamentName,
  eventCount,
  totalRegistrations,
  onConfirm,
  onCancel,
  isLoading = false,
}: StartTournamentConfirmationModalProps) {
  const [understood, setUnderstood] = useState(false);

  const confirmationPoints = [
    {
      icon: Lock,
      title: 'Registration Closes',
      description: 'No new players can register after tournament starts',
    },
    {
      icon: Zap,
      title: 'Brackets Generated',
      description: 'Groups and brackets will be automatically created based on entries',
    },
    {
      icon: Calendar,
      title: 'Format Locked',
      description: 'Event formats, sets, and rules cannot be changed',
    },
    {
      icon: Users,
      title: 'Slots Locked',
      description:
        'Event capacity and max participants are finalized. Waitlist activates if exceeded.',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl bg-[#0d1117] border-white/[0.07]">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-1">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl text-white">Final Confirmation</DialogTitle>
              <p className="text-sm text-white/40 mt-1">
                Starting "{tournamentName}" — this action cannot be undone
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 py-4">
          {/* Tournament Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                Events
              </p>
              <p className="text-2xl font-bold text-white">{eventCount}</p>
              <p className="text-xs text-white/30 mt-1">active events</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                Registrations
              </p>
              <p className="text-2xl font-bold text-white">{totalRegistrations}</p>
              <p className="text-xs text-white/30 mt-1">total entries</p>
            </div>
          </div>

          {/* What Happens When You Start */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <h4 className="text-sm font-bold text-white">What Happens When You Start</h4>
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
              I understand that starting the tournament will lock the format, close registration,
              and generate brackets.{' '}
              <span className="text-white/70 font-semibold">This cannot be undone</span>.
            </p>
          </button>

          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400 mb-1">Critical Action</p>
              <p className="text-xs text-red-400/70">
                Once started, tournament settings cannot be modified. Ensure all event details are
                correct before proceeding.
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
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!understood || isLoading}
            className={cn(
              'flex-1 h-9 text-sm font-bold gap-2 transition-all',
              understood && !isLoading
                ? 'bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.15)]'
                : 'bg-white/[0.05] border border-white/[0.06] text-white/20 cursor-not-allowed',
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Starting…
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Start Tournament Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
