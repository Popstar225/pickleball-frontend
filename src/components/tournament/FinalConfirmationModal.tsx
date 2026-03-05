/**
 * FinalConfirmationModal.tsx
 *
 * Final confirmation modal before starting tournament
 * Lists all consequences of starting and requires explicit confirmation
 */

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Lock } from 'lucide-react';

export function FinalConfirmationModal({ isOpen, isLoading, tournament, onConfirm, onCancel }) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Confirm Tournament Start
          </AlertDialogTitle>
          <AlertDialogDescription>
            {tournament && (
              <div className="mt-4 space-y-1">
                <p className="font-semibold text-gray-900">{tournament.name}</p>
                <p className="text-sm text-gray-600">
                  {tournament.total_events} event{tournament.total_events !== 1 ? 's' : ''} •{' '}
                  {tournament.total_registrations} registration
                  {tournament.total_registrations !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Consequences */}
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            Starting this tournament will trigger the following actions:
          </AlertDescription>
        </Alert>

        <div className="space-y-3 my-4">
          {/* Registration closes */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">Registration will close</p>
              <p className="text-xs text-gray-600">No more players can register for any event</p>
            </div>
          </div>

          {/* Groups/Brackets generated */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">
                Groups and brackets will be generated
              </p>
              <p className="text-xs text-gray-600">
                Automatic group assignments, seeding, and matchup creation
              </p>
            </div>
          </div>

          {/* Format locked */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">Tournament format will be locked</p>
              <p className="text-xs text-gray-600">
                Event formats, categories, and structure cannot be changed after start
              </p>
            </div>
          </div>

          {/* Slots locked */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">Participant slots will be locked</p>
              <p className="text-xs text-gray-600">
                No registrations or cancellations allowed for any event
              </p>
            </div>
          </div>

          {/* Results only */}
          <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-blue-900">
                You will only be able to enter match results
              </p>
              <p className="text-xs text-blue-700">
                Record scores, correct incorrect results, and track tournament progress
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4"
              id="confirm-checkbox"
              disabled={isLoading}
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                I understand and confirm to start this tournament
              </p>
              <p className="text-xs text-gray-600">This action cannot be undone</p>
            </div>
          </label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              const checkbox = document.getElementById('confirm-checkbox');
              if ((checkbox as HTMLInputElement)?.checked) {
                onConfirm();
              }
            }}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Starting Tournament...' : 'Start Tournament'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
