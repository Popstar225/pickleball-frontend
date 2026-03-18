import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface MatchRecordingFormProps {
  tournamentId: string;
  eventId: string;
  matchId: string;
  player1Name: string;
  player2Name: string;
  onRecordingComplete?: (result: any) => void;
}

export function MatchRecordingForm({
  tournamentId,
  eventId,
  matchId,
  player1Name,
  player2Name,
  onRecordingComplete,
}: MatchRecordingFormProps) {
  const [setScores, setSetScores] = useState<Array<{ set: number; player1: number; player2: number }>>([
    { set: 1, player1: 0, player2: 0 },
  ]);
  const [winnerBy, setWinnerBy] = useState<'score' | 'walkover' | 'injury' | 'disqualification'>('score');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const recordScore = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/tournaments/${tournamentId}/events/${eventId}/matches/${matchId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            set_scores: setScores,
            winner_by: winnerBy,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to record match result');
      }

      const data = await response.json();
      setResult(data);

      if (onRecordingComplete) {
        onRecordingComplete(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error recording result');
    } finally {
      setLoading(false);
    }
  };

  const addSet = () => {
    setSetScores([...setScores, { set: setScores.length + 1, player1: 0, player2: 0 }]);
  };

  const removeSet = (index: number) => {
    setSetScores(setScores.filter((_, i) => i !== index));
  };

  const updateScore = (index: number, player: 'player1' | 'player2', score: number) => {
    const updated = [...setScores];
    updated[index][player] = score;
    setSetScores(updated);
  };

  if (result?.success) {
    return (
      <Card className="border-green-500">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-bold text-green-900">Match Result Recorded!</h3>
              <p className="text-sm text-green-700">
                {result.workflow?.winner_advanced && 'Winner automatically advanced to next round.'}
              </p>
              {result.workflow?.bracket_generated && (
                <p className="text-sm text-green-700 font-medium">✨ Bracket generated! Qualifiers advancing...</p>
              )}
            </div>
          </div>

          {result.workflow?.next_round_match && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Next Round Match Created</p>
              <p className="text-xs text-blue-700">Round {result.workflow.next_round_match.round}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Record Match Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Players Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900">{player1Name}</p>
            <p className="text-xs text-blue-700">Player 1</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-semibold text-red-900">{player2Name}</p>
            <p className="text-xs text-red-700">Player 2</p>
          </div>
        </div>

        {/* Set Scores */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Set Scores</h3>
            <Badge variant="outline">{setScores.length} sets</Badge>
          </div>

          {setScores.map((set, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Set {set.set}</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-300 block mb-1">{player1Name}</label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={set.player1}
                      onChange={e => updateScore(index, 'player1', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg text-center font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-center text-gray-300">-</div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-300 block mb-1">{player2Name}</label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={set.player2}
                      onChange={e => updateScore(index, 'player2', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg text-center font-bold"
                    />
                  </div>
                </div>
              </div>
              {setScores.length > 1 && (
                <button
                  onClick={() => removeSet(index)}
                  className="text-red-600 hover:text-red-900 p-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <Button
            onClick={addSet}
            variant="outline"
            className="w-full"
          >
            + Add Set
          </Button>
        </div>

        {/* Result Type */}
        <div>
          <h3 className="font-semibold mb-3">Result Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['score', 'walkover', 'injury', 'disqualification'] as const).map(type => (
              <button
                key={type}
                onClick={() => setWinnerBy(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  winnerBy === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={recordScore}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Recording...
            </>
          ) : (
            'Record Result'
          )}
        </Button>

        <p className="text-xs text-gray-300 text-center">
          ✨ After all group matches are recorded, the bracket will be automatically generated with qualifiers advanced!
        </p>
      </CardContent>
    </Card>
  );
}

export default MatchRecordingForm;
