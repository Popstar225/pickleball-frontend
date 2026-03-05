import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Trash2,
  Edit,
  // Edit,
  Users,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type HandleAction = 'cancel' | 'change-format' | 'merge';

interface InsufficientEvent {
  id: string;
  name: string;
  current: number;
  minimum: number;
  capacity: number;
  format: string;
}

interface InsufficientEntriesModalProps {
  open: boolean;
  events: InsufficientEvent[];
  onAction?: (action: HandleAction, eventId: string, details?: any) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

export default function InsufficientEntriesModal({
  open,
  events,
  onAction,
  onClose,
  isLoading = false,
}: InsufficientEntriesModalProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id);
  const [selectedAction, setSelectedAction] = useState<HandleAction | null>(null);
  const [newFormat, setNewFormat] = useState('single-elimination');

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const shortfall = (selectedEvent?.minimum || 0) - (selectedEvent?.current || 0);

  const formatOptions = [
    { value: 'round-robin', label: 'Round Robin', minPlayers: 4 },
    { value: 'single-elimination', label: 'Single Elimination', minPlayers: 4 },
    { value: 'double-elimination', label: 'Double Elimination', minPlayers: 4 },
    { value: 'hybrid', label: 'Hybrid (Groups → Elimination)', minPlayers: 6 },
  ];

  const handleConfirm = () => {
    if (!selectedEventId || !selectedAction) return;

    if (selectedAction === 'change-format') {
      onAction?.(selectedAction, selectedEventId, { format: newFormat });
    } else {
      onAction?.(selectedAction, selectedEventId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-[#0d1117] border-white/[0.07]">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-1">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl text-white">Insufficient Entries</DialogTitle>
              <p className="text-sm text-white/40 mt-1">
                {events.length} {events.length === 1 ? 'event' : 'events'} below minimum
                registration
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 py-4">
          {/* Event Selection Tabs */}
          {events.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all shrink-0',
                    selectedEventId === event.id
                      ? 'bg-[#ace600] text-black'
                      : 'bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white',
                  )}
                >
                  {event.name}
                </button>
              ))}
            </div>
          )}

          {selectedEvent && (
            <div className="space-y-5">
              {/* Event Summary */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Current Registrations</span>
                  <span className="text-lg font-bold text-red-400">{selectedEvent.current}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Minimum Required</span>
                  <span className="text-lg font-bold text-white">{selectedEvent.minimum}</span>
                </div>
                <div className="h-px bg-white/[0.05]" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-red-400">Shortfall</span>
                  <span className="text-lg font-bold text-red-400">
                    +{shortfall} entries needed
                  </span>
                </div>
              </div>

              {/* Action Options */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">Choose an action:</p>

                {/* Option 1: Cancel Event */}
                <button
                  onClick={() => setSelectedAction('cancel')}
                  className={cn(
                    'w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all',
                    selectedAction === 'cancel'
                      ? 'bg-red-500/[0.10] border-red-500/30'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.12]',
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                      selectedAction === 'cancel' ? 'bg-red-500 border-red-500' : 'border-white/20',
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                      <p className="text-sm font-semibold text-red-400">Cancel Event</p>
                    </div>
                    <p className="text-xs text-white/40 mt-1">
                      Remove this event from tournament. Refund all entry fees.
                    </p>
                  </div>
                </button>

                {/* Option 2: Change Format */}
                <div
                  className={cn(
                    'rounded-xl border transition-all',
                    selectedAction === 'change-format'
                      ? 'bg-amber-500/[0.08] border-amber-500/30'
                      : 'bg-white/[0.02] border-white/[0.08]',
                  )}
                >
                  <button
                    onClick={() => setSelectedAction('change-format')}
                    className="w-full flex items-start gap-4 p-4 text-left"
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                        selectedAction === 'change-format'
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-white/20',
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Edit className="w-4 h-4 text-amber-400 shrink-0" />
                        <p className="text-sm font-semibold text-amber-400">Change Format</p>
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        Switch to a format with lower minimum requirements
                      </p>
                    </div>
                  </button>

                  {selectedAction === 'change-format' && (
                    <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] space-y-3">
                      <p className="text-xs text-white/50">Select new format:</p>
                      <div className="space-y-2">
                        {formatOptions.map((format) => {
                          const canUse = selectedEvent.current >= format.minPlayers;
                          return (
                            <button
                              key={format.value}
                              onClick={() => setNewFormat(format.value)}
                              disabled={!canUse}
                              className={cn(
                                'w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all text-sm',
                                newFormat === format.value && canUse
                                  ? 'bg-[#ace600]/10 border-[#ace600]/30'
                                  : canUse
                                    ? 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.12]'
                                    : 'bg-white/[0.01] border-white/[0.05] opacity-50 cursor-not-allowed',
                              )}
                            >
                              <span className="font-semibold text-white/70">{format.label}</span>
                              <span className="text-xs text-white/30">
                                Min: {format.minPlayers}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 3: Merge Events */}
                <button
                  onClick={() => setSelectedAction('merge')}
                  className={cn(
                    'w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all',
                    selectedAction === 'merge'
                      ? 'bg-blue-500/[0.10] border-blue-500/30'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.12]',
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                      selectedAction === 'merge'
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-white/20',
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Edit className="w-4 h-4 text-blue-400 shrink-0" />
                      <p className="text-sm font-semibold text-blue-400">Merge with Another</p>
                    </div>
                    <p className="text-xs text-white/40 mt-1">
                      Combine with a similar skill level to meet minimum entries
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex gap-2.5 px-6 pb-6 pt-4 border-t border-white/[0.06] flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-9 border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white text-sm font-semibold transition-all"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedAction || isLoading}
            className={cn(
              'flex-1 h-9 text-sm font-bold gap-2 transition-all',
              selectedAction && !isLoading
                ? 'bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.15)]'
                : 'bg-white/[0.05] border border-white/[0.06] text-white/20 cursor-not-allowed',
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Applying…
              </>
            ) : (
              <>
                <Users className="w-4 h-4" /> Apply Action
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
