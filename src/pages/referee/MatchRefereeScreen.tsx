/**
 * Match Referee Interface Component
 *
 * Referee-facing interface for recording match scores with:
 * - Real-time score input validation
 * - Set-by-set tracking (best of 3/5)
 * - Special outcome handling (WO, Injury, DQ)
 * - Automatic validation (2-point margin, max scores)
 * - Confirmation dialog before saving
 *
 * @author Pickleball Federation Team
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, Flag, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Match {
  id: string;
  event_type: string;
  player1_name: string;
  player2_name: string;
  format: 'best_of_3' | 'best_of_5';
  modality: 'singles' | 'doubles';
  status: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface SetScore {
  player1: number | null;
  player2: number | null;
}

interface ValidationError {
  setNumber: number;
  message: string;
}

const validateSet = (p1: number | null, p2: number | null): string | null => {
  if (p1 === null || p2 === null) return null;

  // At least one score must be exactly 11
  const hasEleven = p1 === 11 || p2 === 11;
  if (!hasEleven) {
    return 'Winning score must be exactly 11 (unless extended)';
  }

  // If 11, opponent must be 9 or less (2-point margin)
  if (p1 === 11 && p2 < 9) {
    return 'Valid (11-' + p2 + ')';
  }
  if (p2 === 11 && p1 < 9) {
    return 'Valid (11-' + p2 + ')';
  }

  // If 11, opponent is 9 or 10, need deuce checking
  if ((p1 === 11 && (p2 === 9 || p2 === 10)) || (p2 === 11 && (p1 === 9 || p1 === 10))) {
    // Check if one player is 2 points ahead
    const diff = Math.abs(p1 - p2);
    if (diff >= 2) {
      return null; // Valid
    }
  }

  // Otherwise invalid
  return 'Score must have 2-point margin (e.g., 11-9 or 13-11)';
};

const isValidScore = (p1: number | null, p2: number | null): boolean => {
  if (p1 === null || p2 === null) return false;

  if (p1 > 20 || p2 > 20) return false;

  const hasEleven = p1 === 11 || p2 === 11;
  if (!hasEleven) return false;

  const diff = Math.abs(p1 - p2);
  if (diff < 2) return false;

  return true;
};

export const MatchRefereeScreen: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [sets, setSets] = useState<SetScore[]>([{ player1: null, player2: null }]);
  const [specialOutcome, setSpecialOutcome] = useState<string | null>(null);
  const [specialOutcomeReason, setSpecialOutcomeReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const maxSets = match?.format === 'best_of_5' ? 5 : 3;

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  const loadMatch = async () => {
    try {
      setLoading(true);
      const response = (await api.get(`/matches/${matchId}`)) as ApiResponse<Match>;
      setMatch(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  const updateSetScore = (setIndex: number, player: 'player1' | 'player2', value: string) => {
    const num = value === '' ? null : Math.max(0, Math.min(20, parseInt(value) || 0));
    const newSets = [...sets];

    if (!newSets[setIndex]) {
      newSets[setIndex] = { player1: null, player2: null };
    }

    newSets[setIndex][player] = num;
    setSets(newSets);

    // Validate scores
    validateAllSets();
  };

  const validateAllSets = () => {
    const errors: ValidationError[] = [];

    sets.forEach((set, idx) => {
      const validationMsg = validateSet(set.player1, set.player2);
      if (validationMsg && !validationMsg.startsWith('Valid')) {
        errors.push({ setNumber: idx + 1, message: validationMsg });
      }
    });

    setValidationErrors(errors);
  };

  const addSet = () => {
    if (sets.length < maxSets) {
      // Validate last set is complete before adding new one
      const lastSet = sets[sets.length - 1];
      if (lastSet.player1 === null || lastSet.player2 === null) {
        setError('Complete the current set before adding another');
        return;
      }

      setSets([...sets, { player1: null, player2: null }]);
      validateAllSets();
    }
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
      validateAllSets();
    }
  };

  const canSave = () => {
    if (specialOutcome) return true; // Special outcomes don't need scores

    // At least one complete valid set
    const completeValidSets = sets.filter(
      (set) =>
        set.player1 !== null && set.player2 !== null && isValidScore(set.player1, set.player2),
    );

    if (completeValidSets.length === 0) return false;

    // Determine match winner
    const player1Wins = completeValidSets.filter((set) => set.player1 > set.player2).length;
    const player2Wins = completeValidSets.filter((set) => set.player2 > set.player1).length;

    const requiredWins = Math.ceil(sets.length / 2);

    return player1Wins >= requiredWins || player2Wins >= requiredWins;
  };

  const handleSave = async () => {
    if (!match) return;

    try {
      setSaving(true);

      if (specialOutcome) {
        await api.post(`/matches/${matchId}/special-outcome`, {
          outcome_type: specialOutcome,
          reason: specialOutcomeReason,
        });
      } else {
        const formatSets = sets.map((set) => ({
          player1_score: set.player1,
          player2_score: set.player2,
        }));

        await api.post(`/matches/${matchId}/score`, { sets: formatSets });
      }

      navigate(-1);
    } catch (err: any) {
      setError(err.message || 'Failed to save match result');
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-white/40">Loading match...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-white/60">Match not found</p>
      </div>
    );
  }

  const player1Wins = sets.filter(
    (set) => set.player1 !== null && set.player2 !== null && set.player1 > set.player2,
  ).length;
  const player2Wins = sets.filter(
    (set) => set.player1 !== null && set.player2 !== null && set.player2 > set.player1,
  ).length;

  return (
    <div className="min-h-screen bg-[#0d1117] space-y-4 pb-10">
      {/* HEADER */}
      <div className="sticky top-0 bg-[#0d1117]/95 backdrop-blur border-b border-white/[0.08] p-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="text-white/40 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-bold text-white flex-1 text-center">Record Match Score</h1>
          <div className="w-10" />
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="flex items-start gap-2 p-2 bg-red-500/[0.06] border border-red-500/15 rounded-lg mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* MATCH INFO */}
        <div className="bg-[#161c25] border border-white/[0.08] rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-white/40 mb-0.5">Player 1</p>
              <p className="text-sm font-bold text-white">{match.player1_name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 mb-0.5">Player 2</p>
              <p className="text-sm font-bold text-white">{match.player2_name}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div>
              <p className="text-white/40">Format</p>
              <p className="text-white font-semibold">{match.format.replace('best_of_', 'BO')}</p>
            </div>
            <div>
              <p className="text-white/40">Event</p>
              <p className="text-white font-semibold text-center">{match.event_type}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40">Type</p>
              <p className="text-white font-semibold capitalize">{match.modality}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* SPECIAL OUTCOME SECTION */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/25">
            Special Outcome
          </h3>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { value: 'walkover', label: 'Walkover', icon: Flag },
              { value: 'injury', label: 'Injury Retirement', icon: AlertTriangle },
              { value: 'disqualification', label: 'Disqualification', icon: X },
              { value: 'withdrawal', label: 'Withdrawal', icon: ArrowLeft },
            ].map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                onClick={() => {
                  setSpecialOutcome(specialOutcome === value ? null : value);
                  setValidationErrors([]);
                }}
                variant={specialOutcome === value ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-auto flex flex-col items-center justify-center gap-1 p-2 text-xs',
                  specialOutcome === value
                    ? 'bg-amber-500 hover:bg-amber-600 text-black'
                    : 'border-white/[0.08] text-white/60 hover:text-white',
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] leading-tight">{label}</span>
              </Button>
            ))}
          </div>

          {specialOutcome && (
            <div className="mt-2">
              <label className="block text-xs font-semibold text-white/60 mb-1">
                Reason (Required)
              </label>
              <Input
                placeholder="Enter reason for special outcome..."
                value={specialOutcomeReason}
                onChange={(e) => setSpecialOutcomeReason(e.target.value)}
                className="bg-[#0d1117] border-white/[0.08] text-white placeholder-white/20"
              />
            </div>
          )}
        </div>

        {/* SCORE ENTRY SECTION */}
        {!specialOutcome && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/25">
                Set-by-Set Score
              </h3>
              {sets.length < maxSets && (
                <Button
                  onClick={addSet}
                  variant="outline"
                  size="sm"
                  className="border-white/[0.08] text-xs h-7 gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Set
                </Button>
              )}
            </div>

            {/* SETS GRID */}
            {sets.map((set, idx) => (
              <div key={idx} className="space-y-2">
                <div className="bg-[#161c25] border border-white/[0.08] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-white/60">Set {idx + 1}</p>
                    {sets.length > 1 && (
                      <Button
                        onClick={() => removeSet(idx)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-white/40 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-white/40 mb-1">
                        {match.player1_name.split(' ')[0]}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={set.player1 ?? ''}
                        onChange={(e) => updateSetScore(idx, 'player1', e.target.value)}
                        placeholder="0"
                        className="bg-[#0d1117] border-white/[0.08] text-white text-2xl font-bold text-center h-14"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 mb-1">
                        {match.player2_name.split(' ')[0]}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={set.player2 ?? ''}
                        onChange={(e) => updateSetScore(idx, 'player2', e.target.value)}
                        placeholder="0"
                        className="bg-[#0d1117] border-white/[0.08] text-white text-2xl font-bold text-center h-14"
                      />
                    </div>
                  </div>

                  {/* SET STATUS */}
                  {set.player1 !== null && set.player2 !== null && (
                    <div className="mt-2">
                      {isValidScore(set.player1, set.player2) ? (
                        <div className="flex items-center gap-2 p-2 bg-emerald-500/[0.06] border border-emerald-500/15 rounded">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <p className="text-xs text-emerald-400">
                            {set.player1 > set.player2 ? 'P1' : 'P2'} wins
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 p-2 bg-red-500/[0.06] border border-red-500/15 rounded">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-400">
                            Invalid: Must have 2-point margin (e.g., 11-9 or 13-11)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* MATCH PROGRESS */}
            {sets.some((s) => s.player1 !== null && s.player2 !== null) && (
              <div className="flex items-center gap-4 p-3 bg-[#161c25] border border-white/[0.08] rounded-lg">
                <div className="flex-1">
                  <p className="text-[10px] text-white/40 mb-1">{match.player1_name}</p>
                  <p className="text-xl font-bold text-white">{player1Wins}</p>
                </div>
                <div className="text-white/40">vs</div>
                <div className="flex-1 text-right">
                  <p className="text-[10px] text-white/40 mb-1">{match.player2_name}</p>
                  <p className="text-xl font-bold text-white">{player2Wins}</p>
                </div>
              </div>
            )}

            {/* VALIDATION ERRORS */}
            {validationErrors.length > 0 && (
              <div className="space-y-2">
                {validationErrors.map((err, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 bg-red-500/[0.06] border border-red-500/15 rounded"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">
                      Set {err.setNumber}: {err.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SAVE BUTTON */}
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={!canSave() || saving}
          className={cn(
            'w-full h-12 font-bold text-base gap-2',
            canSave()
              ? 'bg-[#ace600] hover:bg-[#c0f000] text-black'
              : 'bg-white/[0.08] text-white/40 cursor-not-allowed',
          )}
        >
          <CheckCircle2 className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Match Result'}
        </Button>
      </div>

      {/* CONFIRMATION DIALOG */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-[#0d1117] border-white/[0.08]">
          <AlertDialogTitle className="text-white">Confirm Match Result</AlertDialogTitle>
          <AlertDialogDescription className="text-white/60">
            {specialOutcome
              ? `Record ${specialOutcome.replace('_', ' ')} outcome?`
              : 'Is the score correct? This action cannot be undone without organizer approval.'}
          </AlertDialogDescription>

          {!specialOutcome && (
            <div className="bg-[#161c25] border border-white/[0.08] rounded-lg p-3 my-3 space-y-1 text-xs">
              {sets.map((set, idx) => (
                <div key={idx} className="flex justify-between text-white/60">
                  <span>Set {idx + 1}:</span>
                  <span className="text-white font-semibold">
                    {set.player1} - {set.player2}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <AlertDialogCancel className="border-white/[0.08]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSave}
              disabled={saving}
              className="bg-[#ace600] hover:bg-[#c0f000] text-black font-bold"
            >
              {saving ? 'Saving...' : 'Confirm & Save'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MatchRefereeScreen;
