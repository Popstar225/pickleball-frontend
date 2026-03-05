/**
 * Match Scoring Modal Component
 *
 * Modal dialog for coaches to record match scores
 * Wraps MatchScoreRecorder with modal UI
 */

import React from 'react';
import { X, Clock, Users } from 'lucide-react';
import MatchScoreRecorder, { ScoreSubmissionData } from './MatchScoreRecorder';
import { cn } from '@/lib/utils';

export interface MatchScoringModalProps {
  isOpen: boolean;
  matchId: string;
  player1Name: string;
  player1Id: string;
  player2Name: string;
  player2Id: string;
  scheduledTime?: string;
  courtNumber?: string | number;
  eventName?: string;
  onClose: () => void;
  onSubmitScore: (data: ScoreSubmissionData) => Promise<void>;
  isSubmitting?: boolean;
}

const MatchScoringModal: React.FC<MatchScoringModalProps> = ({
  isOpen,
  matchId,
  player1Name,
  player1Id,
  player2Name,
  player2Id,
  scheduledTime,
  courtNumber,
  eventName,
  onClose,
  onSubmitScore,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-[#0d1117] border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Registrar Marcador</h2>
              {eventName && <p className="text-xs text-white/30 mt-1">{eventName}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/[0.05] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/40 hover:text-white/80" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            {/* Match Info */}
            <div className="space-y-3">
              {/* Players */}
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                <div className="flex-1 text-center">
                  <div className="w-10 h-10 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-xs font-black text-[#ace600]">
                      {player1Name.split(' ')[0]?.[0] || 'P'}
                      {player1Name.split(' ')[1]?.[0] || ''}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">{player1Name}</p>
                </div>

                <div className="text-white/20 text-xs font-bold">VS</div>

                <div className="flex-1 text-center">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-xs font-black text-blue-400">
                      {player2Name.split(' ')[0]?.[0] || 'P'}
                      {player2Name.split(' ')[1]?.[0] || ''}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">{player2Name}</p>
                </div>
              </div>

              {/* Match Details */}
              {(scheduledTime || courtNumber) && (
                <div className="flex flex-wrap gap-2 text-xs text-white/40">
                  {scheduledTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(scheduledTime).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                  {courtNumber && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Cancha {courtNumber}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Score Form */}
            <MatchScoreRecorder
              matchId={matchId}
              player1Name={player1Name}
              player1Id={player1Id}
              player2Name={player2Name}
              player2Id={player2Id}
              onSubmit={onSubmitScore}
              onCancel={onClose}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MatchScoringModal;
