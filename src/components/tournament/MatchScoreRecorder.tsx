/**
 * Match Score Recorder Component
 *
 * Allows coaches to record match scores with validation
 * Features: Score validation, special status handling, winner auto-calculation
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MatchScoreRecorderProps {
  matchId: string;
  player1Name: string;
  player1Id: string;
  player2Name: string;
  player2Id: string;
  onSubmit: (data: ScoreSubmissionData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ScoreSubmissionData {
  set1: { player1: number; player2: number };
  set2: { player1: number; player2: number };
  set3?: { player1: number; player2: number };
  winnerId: string;
  winner_by: 'score' | 'walkover' | 'injury' | 'dq' | 'withdrawal' | 'retirement';
  reason_details?: string;
}

interface SetScore {
  player1: number;
  player2: number;
}

const MIN_WIN_SCORE = 11;
const MIN_WIN_MARGIN = 2;
const SPECIAL_STATUSES = ['score', 'walkover', 'injury', 'dq', 'withdrawal', 'retirement'];

const MatchScoreRecorder: React.FC<MatchScoreRecorderProps> = ({
  matchId,
  player1Name,
  player1Id,
  player2Name,
  player2Id,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [set1, setSet1] = useState<SetScore>({ player1: 0, player2: 0 });
  const [set2, setSet2] = useState<SetScore>({ player1: 0, player2: 0 });
  const [set3, setSet3] = useState<SetScore>({ player1: 0, player2: 0 });
  const [specialStatus, setSpecialStatus] = useState<string>('score');
  const [reason, setReason] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Auto-calculate winner based on scores
  const calculateWinner = (): { winnerId: string; message: string } | null => {
    if (specialStatus !== 'score') {
      return null; // For special statuses, user will select winner separately
    }

    const set1Win = set1.player1 > set1.player2 ? 1 : 2;
    const set2Win = set2.player1 > set2.player2 ? 1 : 2;

    // Best of 3: need 2 sets to win
    let winsPlayer1 = 0;
    let winsPlayer2 = 0;

    if (set1Win === 1) winsPlayer1++;
    else winsPlayer2++;

    if (set2Win === 1) winsPlayer1++;
    else winsPlayer2++;

    if (winsPlayer1 === 2) {
      return { winnerId: '1', message: `${player1Name} wins 2-0` };
    }
    if (winsPlayer2 === 2) {
      return { winnerId: '2', message: `${player2Name} wins 2-0` };
    }

    // If tied 1-1, need set 3
    if (set3.player1 === 0 && set3.player2 === 0) {
      return null; // Need set 3
    }

    const set3Win = set3.player1 > set3.player2 ? 1 : 2;
    if (set3Win === 1) {
      return { winnerId: '1', message: `${player1Name} wins 2-1` };
    } else {
      return { winnerId: '2', message: `${player2Name} wins 2-1` };
    }
  };

  // Validate scores
  const validateScores = (): boolean => {
    const newErrors: string[] = [];

    // Check set 1
    if (!isValidSetScore(set1.player1, set1.player2)) {
      newErrors.push('Set 1: Invalid score. Score must be ≥11 with 2-point margin');
    }

    // Check set 2
    if (!isValidSetScore(set2.player1, set2.player2)) {
      newErrors.push('Set 2: Invalid score. Score must be ≥11 with 2-point margin');
    }

    // Check if set 3 is needed
    const set1Win = set1.player1 > set1.player2 ? 1 : 2;
    const set2Win = set2.player1 > set2.player2 ? 1 : 2;

    if (set1Win !== set2Win) {
      // Need set 3
      if (set3.player1 === 0 && set3.player2 === 0) {
        newErrors.push('Set 3 required: Sets are tied 1-1');
      } else if (!isValidSetScore(set3.player1, set3.player2)) {
        newErrors.push('Set 3: Invalid score. Score must be ≥11 with 2-point margin');
      }
    } else {
      // Set 3 should not be entered if sets already decided
      if (set3.player1 > 0 || set3.player2 > 0) {
        newErrors.push('Set 3 not needed: Match already decided');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const isValidSetScore = (p1: number, p2: number): boolean => {
    // Check if at least one player reached minimum
    const player1Min = p1 >= MIN_WIN_SCORE;
    const player2Min = p2 >= MIN_WIN_SCORE;

    if (!player1Min && !player2Min) return false;

    // Check margin
    const margin = Math.abs(p1 - p2);
    return margin >= MIN_WIN_MARGIN;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateScores()) {
      return;
    }

    const winner = calculateWinner();

    if (specialStatus === 'score' && !winner) {
      setErrors(['Unable to determine winner. Please check scores.']);
      return;
    }

    try {
      const data: ScoreSubmissionData = {
        set1,
        set2,
        winnerId:
          specialStatus === 'score'
            ? winner?.winnerId === '1'
              ? player1Id
              : player2Id
            : player1Id,
        winner_by: specialStatus as any,
        set3: set3.player1 > 0 || set3.player2 > 0 ? set3 : undefined,
        reason_details: reason || undefined,
      };

      setSuccessMessage('Submitting score...');
      await onSubmit(data);
      setSuccessMessage('✓ Match score recorded successfully!');
    } catch (error) {
      setErrors(['Failed to submit score. Please try again.']);
    }
  };

  const winner = calculateWinner();
  const needsSet3 =
    set1.player1 !== 0 &&
    set2.player1 !== 0 &&
    (set1.player1 > set1.player2 ? 1 : 2) !== (set2.player1 > set2.player2 ? 1 : 2);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-1">
          {errors.map((error, idx) => (
            <div key={idx} className="flex gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex gap-2 text-sm text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          {successMessage}
        </div>
      )}

      {/* Status Selection */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
          Resultado del Partido
        </label>
        <select
          value={specialStatus}
          onChange={(e) => setSpecialStatus(e.target.value)}
          className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm focus:border-[#ace600] focus:outline-none"
        >
          {SPECIAL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status === 'score' ? 'Completar por Marcador' : status.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Score Input Sections - Only show if status is "score" */}
      {specialStatus === 'score' && (
        <div className="space-y-3">
          {/* Set 1 */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Set 1</p>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                max="99"
                value={set1.player1}
                onChange={(e) => setSet1({ ...set1, player1: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="flex-1 px-2 py-1.5 bg-white/[0.05] border border-white/10 rounded text-white text-sm focus:border-[#ace600] focus:outline-none"
              />
              <span className="text-white/30 text-xs font-bold">-</span>
              <input
                type="number"
                min="0"
                max="99"
                value={set1.player2}
                onChange={(e) => setSet1({ ...set1, player2: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="flex-1 px-2 py-1.5 bg-white/[0.05] border border-white/10 rounded text-white text-sm focus:border-[#ace600] focus:outline-none"
              />
            </div>
            <div className="flex gap-2 text-[10px] text-white/25 mt-1">
              <span className="flex-1">{player1Name}</span>
              <span className="flex-1 text-right">{player2Name}</span>
            </div>
          </div>

          {/* Set 2 */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Set 2</p>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                max="99"
                value={set2.player1}
                onChange={(e) => setSet2({ ...set2, player1: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="flex-1 px-2 py-1.5 bg-white/[0.05] border border-white/10 rounded text-white text-sm focus:border-[#ace600] focus:outline-none"
              />
              <span className="text-white/30 text-xs font-bold">-</span>
              <input
                type="number"
                min="0"
                max="99"
                value={set2.player2}
                onChange={(e) => setSet2({ ...set2, player2: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="flex-1 px-2 py-1.5 bg-white/[0.05] border border-white/10 rounded text-white text-sm focus:border-[#ace600] focus:outline-none"
              />
            </div>
            <div className="flex gap-2 text-[10px] text-white/25 mt-1">
              <span className="flex-1">{player1Name}</span>
              <span className="flex-1 text-right">{player2Name}</span>
            </div>
          </div>

          {/* Set 3 - Conditional */}
          {needsSet3 && (
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
                Set 3 (Desempate)
              </p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={set3.player1}
                  onChange={(e) => setSet3({ ...set3, player1: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="flex-1 px-2 py-1.5 bg-white/[0.05] border border-white/10 rounded text-white text-sm focus:border-[#ace600] focus:outline-none"
                />
                <span className="text-white/30 text-xs font-bold">-</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={set3.player2}
                  onChange={(e) => setSet3({ ...set3, player2: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="flex-1 px-2 py-1.5 bg-white/[0.05] border border-white/10 rounded text-white text-sm focus:border-[#ace600] focus:outline-none"
                />
              </div>
              <div className="flex gap-2 text-[10px] text-white/25 mt-1">
                <span className="flex-1">{player1Name}</span>
                <span className="flex-1 text-right">{player2Name}</span>
              </div>
            </div>
          )}

          {/* Winner Preview */}
          {winner && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <p className="text-sm font-bold text-emerald-400">✓ {winner.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Special Status Reason */}
      {specialStatus !== 'score' && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
            Razón (Opcional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Lesión en el tobillo..."
            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm focus:border-[#ace600] focus:outline-none resize-none"
            rows={2}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm font-bold hover:bg-white/[0.08] transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2',
            isLoading
              ? 'bg-white/20 text-white/50 cursor-not-allowed'
              : 'bg-[#ace600] text-black hover:bg-[#ace600]/90',
          )}
        >
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Guardando...' : 'Guardar Marcador'}
        </button>
      </div>
    </form>
  );
};

export default MatchScoreRecorder;
