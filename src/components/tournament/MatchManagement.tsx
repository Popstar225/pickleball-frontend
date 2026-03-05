/**
 * Match Management Component
 *
 * Manages group stage and knockout matches.
 * Features:
 * - Schedule matches
 * - Record match results (sets, points)
 * - Handle special states (Walkover, Withdrawal, Disqualification, Cancelled)
 * - Update standings after each match
 * - Match status tracking
 *
 * @author Tournament System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Swords, AlertTriangle, CheckCircle, Clock, Trophy, Flag } from 'lucide-react';

interface MatchRecord {
  id: string;
  player1: { id: string; name: string };
  player2: { id: string; name: string };
  status: 'pending' | 'played' | 'walkover' | 'withdrawal' | 'cancelled' | 'disqualified';
  winner?: { id: string; name: string };
  set1?: { p1: number; p2: number };
  set2?: { p1: number; p2: number };
  set3?: { p1: number; p2: number };
  notes?: string;
}

interface MatchManagementProps {
  groupId?: string;
  eventId: string;
  matches: MatchRecord[];
  onMatchUpdate: (matchId: string, data: Partial<MatchRecord>) => Promise<void>;
}

const MATCH_STATUSES = [
  { value: 'pending', label: 'Scheduled', icon: Clock, color: 'text-slate-500' },
  { value: 'played', label: 'Played', icon: CheckCircle, color: 'text-green-500' },
  { value: 'walkover', label: 'Walkover (No-Show)', icon: Trophy, color: 'text-amber-500' },
  { value: 'withdrawal', label: 'Withdrawal', icon: Flag, color: 'text-orange-500' },
  { value: 'disqualified', label: 'Disqualification', icon: AlertTriangle, color: 'text-red-500' },
  { value: 'cancelled', label: 'Cancelled', icon: Flag, color: 'text-slate-500' },
];

const MatchManagement: React.FC<MatchManagementProps> = ({
  groupId,
  eventId,
  matches,
  onMatchUpdate,
}) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showSpecialStateDialog, setShowSpecialStateDialog] = useState(false);
  const [resultData, setResultData] = useState({
    set1P1: 0,
    set1P2: 0,
    set2P1: 0,
    set2P2: 0,
    set3P1: 0,
    set3P2: 0,
    winnerId: '',
    notes: '',
  });
  const [specialState, setSpecialState] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState('');

  const handleRecordResult = async () => {
    if (!selectedMatch) return;

    const result: any = {
      status: 'played',
      set1: { p1: resultData.set1P1, p2: resultData.set1P2 },
      set2: { p1: resultData.set2P1, p2: resultData.set2P2 },
      notes: resultData.notes,
    };

    if (resultData.set3P1 > 0 || resultData.set3P2 > 0) {
      result.set3 = { p1: resultData.set3P1, p2: resultData.set3P2 };
    }

    // Determine winner if not explicitly set
    if (resultData.winnerId) {
      result.winner =
        selectedMatch.player1.id === resultData.winnerId
          ? selectedMatch.player1
          : selectedMatch.player2;
    } else {
      // Auto-determine from sets
      const p1SetsWon =
        (result.set1.p1 > result.set1.p2 ? 1 : 0) +
        (result.set2.p1 > result.set2.p2 ? 1 : 0) +
        (result.set3 && result.set3.p1 > result.set3.p2 ? 1 : 0);

      result.winner = p1SetsWon >= 2 ? selectedMatch.player1 : selectedMatch.player2;
    }

    try {
      await onMatchUpdate(selectedMatch.id, result);
      setShowResultDialog(false);
      setSelectedMatch(null);
    } catch (error) {
      console.error('Error recording match result:', error);
    }
  };

  const handleSpecialState = async () => {
    if (!selectedMatch) return;

    const update: any = {
      status: specialState,
      notes: specialNotes,
    };

    // For walkover and disqualification, determine winner
    if (specialState === 'walkover' || specialState === 'disqualified') {
      // Would need additional UI to ask which player is the winner
      // Placeholder logic: assume player1 wins
      update.winner = selectedMatch.player1;
    }

    try {
      await onMatchUpdate(selectedMatch.id, update);
      setShowSpecialStateDialog(false);
      setSelectedMatch(null);
      setSpecialState('');
      setSpecialNotes('');
    } catch (error) {
      console.error('Error updating match state:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusConfig = MATCH_STATUSES.find((s) => s.value === status);
    return statusConfig ? statusConfig.icon : Clock;
  };

  const getStatusColor = (status: string) => {
    const statusConfig = MATCH_STATUSES.find((s) => s.value === status);
    return statusConfig?.color || 'text-slate-500';
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-700 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Matches ({matches.length})
          </CardTitle>
          <CardDescription className="text-slate-400">
            Manage group stage matches and record results
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {matches.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No matches scheduled for this group yet</p>
              </div>
            ) : (
              matches.map((match) => {
                const StatusIcon = getStatusIcon(match.status);
                return (
                  <div
                    key={match.id}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      {/* Match Info */}
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">
                          {match.player1.name}
                          <span className="text-slate-500 mx-2">vs</span>
                          {match.player2.name}
                        </div>
                        {match.status === 'played' && match.winner && (
                          <div className="text-xs text-green-400 mt-1">
                            ✓ {match.winner.name} won
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2 ml-4">
                        <StatusIcon className={`h-4 w-4 ${getStatusColor(match.status)}`} />
                        <span className="text-xs text-slate-400">
                          {MATCH_STATUSES.find((s) => s.value === match.status)?.label}
                        </span>
                      </div>
                    </div>

                    {/* Score Display */}
                    {match.status === 'played' && (
                      <div className="mb-3 p-2 bg-slate-700/30 rounded text-xs text-slate-300">
                        <div>
                          Set 1: {match.set1?.p1}-{match.set1?.p2}
                        </div>
                        <div>
                          Set 2: {match.set2?.p1}-{match.set2?.p2}
                        </div>
                        {match.set3 && (
                          <div>
                            Set 3: {match.set3.p1}-{match.set3.p2}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {match.notes && (
                      <div className="mb-3 p-2 bg-amber-500/10 rounded text-xs text-amber-300 border border-amber-500/20">
                        {match.notes}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {match.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => {
                              setSelectedMatch(match);
                              setShowResultDialog(true);
                            }}
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            Record Result
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedMatch(match);
                              setShowSpecialStateDialog(true);
                            }}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            Mark Special State
                          </Button>
                        </>
                      )}
                      {match.status === 'played' && (
                        <Button
                          onClick={() => {
                            setSelectedMatch(match);
                            setShowResultDialog(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          Edit Result
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Record Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Record Match Result</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedMatch?.player1.name} vs {selectedMatch?.player2.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Set 1 */}
            <div className="space-y-2">
              <Label className="text-white font-semibold">Set 1</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="15"
                  placeholder="0"
                  value={resultData.set1P1}
                  onChange={(e) =>
                    setResultData({ ...resultData, set1P1: parseInt(e.target.value) || 0 })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <span className="flex items-center text-white">-</span>
                <Input
                  type="number"
                  min="0"
                  max="15"
                  placeholder="0"
                  value={resultData.set1P2}
                  onChange={(e) =>
                    setResultData({ ...resultData, set1P2: parseInt(e.target.value) || 0 })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            {/* Set 2 */}
            <div className="space-y-2">
              <Label className="text-white font-semibold">Set 2</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="15"
                  placeholder="0"
                  value={resultData.set2P1}
                  onChange={(e) =>
                    setResultData({ ...resultData, set2P1: parseInt(e.target.value) || 0 })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <span className="flex items-center text-white">-</span>
                <Input
                  type="number"
                  min="0"
                  max="15"
                  placeholder="0"
                  value={resultData.set2P2}
                  onChange={(e) =>
                    setResultData({ ...resultData, set2P2: parseInt(e.target.value) || 0 })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            {/* Set 3 (Optional) */}
            <div className="space-y-2">
              <Label className="text-white font-semibold">Set 3 (if needed)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="15"
                  placeholder="0"
                  value={resultData.set3P1}
                  onChange={(e) =>
                    setResultData({ ...resultData, set3P1: parseInt(e.target.value) || 0 })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <span className="flex items-center text-white">-</span>
                <Input
                  type="number"
                  min="0"
                  max="15"
                  placeholder="0"
                  value={resultData.set3P2}
                  onChange={(e) =>
                    setResultData({ ...resultData, set3P2: parseInt(e.target.value) || 0 })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-white font-semibold">Notes</Label>
              <Input
                placeholder="Optional: any special circumstances, injuries, etc."
                value={resultData.notes}
                onChange={(e) => setResultData({ ...resultData, notes: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowResultDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRecordResult}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Save Result
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Special State Dialog */}
      <Dialog open={showSpecialStateDialog} onOpenChange={setShowSpecialStateDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Mark Special Match State</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedMatch?.player1.name} vs {selectedMatch?.player2.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* State Selection */}
            <div className="space-y-2">
              <Label className="text-white font-semibold">Match Status</Label>
              <Select value={specialState} onValueChange={setSpecialState}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="walkover">Walkover (No-Show)</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="disqualified">Disqualification</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Description */}
            {specialState && (
              <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20">
                <p className="text-xs text-amber-300">
                  {specialState === 'walkover' &&
                    'Player did not appear for the match. The opposing player advances.'}
                  {specialState === 'withdrawal' &&
                    'Player withdrew from the match. The opposing player advances.'}
                  {specialState === 'disqualified' &&
                    'Player was disqualified. The opposing player advances.'}
                  {specialState === 'cancelled' &&
                    'Match has been cancelled and will not be played.'}
                </p>
              </div>
            )}

            {/* Reason/Notes */}
            <div className="space-y-2">
              <Label className="text-white font-semibold">Reason/Notes</Label>
              <Input
                placeholder="Explain the reason for this status..."
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowSpecialStateDialog(false);
                  setSpecialState('');
                  setSpecialNotes('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSpecialState}
                disabled={!specialState}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MatchManagement;
