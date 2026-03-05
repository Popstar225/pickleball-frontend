/**
 * InsufficientEntriesDialog.tsx
 *
 * Dialog for handling events with insufficient entries
 * Allows user to: cancel, change format, or merge with another event
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Trash2, Shuffle, Combine } from 'lucide-react';

export function InsufficientEntriesDialog({
  isOpen,
  isLoading,
  event,
  otherEvents = [],
  onAction,
  onCancel,
}) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedTargetEvent, setSelectedTargetEvent] = useState(null);
  const [comments, setComments] = useState('');

  const handleConfirm = () => {
    if (!selectedAction) return;

    const payload: any = { comments };
    if (selectedAction === 'merge' && selectedTargetEvent) {
      payload.targetEventId = selectedTargetEvent;
    }

    onAction(selectedAction, payload);
    setSelectedAction(null);
    setSelectedTargetEvent(null);
    setComments('');
  };

  const handleClose = () => {
    setSelectedAction(null);
    setSelectedTargetEvent(null);
    setComments('');
    onCancel();
  };

  // Filter compatible events for merge (same skill/gender, different modality or similar)
  const compatibleEvents = otherEvents.filter(
    (e) =>
      e.id !== event?.id &&
      e.skill_block === event?.skill_block &&
      e.gender === event?.gender &&
      e.current_participants + event?.current_participants <= e.max_participants,
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Insufficient Entries
          </DialogTitle>
          <DialogDescription>
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="font-semibold text-orange-900 mb-1">
                {event?.skill_block} {event?.gender} {event?.modality}
              </p>
              <p className="text-sm text-orange-800">
                {event?.current_participants}/{event?.minimum_participants} minimum registrations
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        {!selectedAction ? (
          // Action selection
          <div className="space-y-4">
            <p className="text-sm text-gray-700 font-medium">Choose an action:</p>

            {/* Cancel Option */}
            <button
              onClick={() => setSelectedAction('cancel')}
              className="w-full p-4 border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 rounded-lg text-left transition-all"
              disabled={isLoading}
            >
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Cancel Event</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Refund all {event?.current_participants} participant
                    {event?.current_participants !== 1 ? 's' : ''} and remove the event
                  </p>
                </div>
              </div>
            </button>

            {/* Format Change Option */}
            <button
              onClick={() => setSelectedAction('format')}
              className="w-full p-4 border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 rounded-lg text-left transition-all"
              disabled={isLoading}
            >
              <div className="flex items-start gap-3">
                <Shuffle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Change Format</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Switch to Single Elimination (no minimum required due to bye matches)
                  </p>
                </div>
              </div>
            </button>

            {/* Merge Option */}
            {compatibleEvents.length > 0 && (
              <button
                onClick={() => setSelectedAction('merge')}
                className="w-full p-4 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg text-left transition-all"
                disabled={isLoading}
              >
                <div className="flex items-start gap-3">
                  <Combine className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Merge with Another Event</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Combine with a similar event and remove this one
                    </p>
                  </div>
                </div>
              </button>
            )}

            {compatibleEvents.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No compatible events available to merge with. Either cancel or change format.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          // Action details
          <div className="space-y-4">
            {selectedAction === 'cancel' && (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {event?.current_participants} player
                    {event?.current_participants !== 1 ? 's' : ''} will be refunded. This action
                    cannot be undone.
                  </AlertDescription>
                </Alert>
              </>
            )}

            {selectedAction === 'format' && (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Changing to Single Elimination format. Bye matches will handle odd participant
                    numbers.
                  </AlertDescription>
                </Alert>
              </>
            )}

            {selectedAction === 'merge' && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">
                    Merge into which event?
                  </label>
                  <Select value={selectedTargetEvent || ''} onValueChange={setSelectedTargetEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target event" />
                    </SelectTrigger>
                    <SelectContent>
                      {compatibleEvents.map((evt) => (
                        <SelectItem key={evt.id} value={evt.id}>
                          {evt.skill_block} {evt.gender} {evt.modality} ({evt.current_participants}/
                          {evt.max_participants})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTargetEvent && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {event?.current_participants} participant
                      {event?.current_participants !== 1 ? 's' : ''} will be transferred to the
                      selected event.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* Comments */}
            <div>
              <label className="text-sm font-medium text-gray-900 block mb-2">
                Comments (optional)
              </label>
              <Textarea
                placeholder="Add notes about this action..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {selectedAction ? 'Back' : 'Cancel'}
          </Button>
          {selectedAction && (
            <Button
              onClick={handleConfirm}
              disabled={isLoading || (selectedAction === 'merge' && !selectedTargetEvent)}
              variant={selectedAction === 'cancel' ? 'destructive' : 'default'}
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
