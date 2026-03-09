import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Loader2, Trophy } from 'lucide-react';

interface MatchForRecording {
  id: string;
  groupId: string;
  groupNumber: number;
  player1: { id: string; name: string };
  player2: { id: string; name: string };
  status: 'pending' | 'completed';
  setScores?: Array<{ set: number; player1: number; player2: number }>;
}

interface MatchBatchRecorderProps {
  tournamentId: string;
  eventId: string;
  onAllRecorded?: () => void;
}

export function MatchBatchRecorder({
  tournamentId,
  eventId,
  onAllRecorded,
}: MatchBatchRecorderProps) {
  const [matches, setMatches] = useState<MatchForRecording[]>([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, [eventId]);

  const fetchMatches = async () => {
    try {
      const response = await fetch(
        `/api/v1/tournaments/${tournamentId}/events/${eventId}/matches`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setMatches(data.matches || []);
      }
    } catch (err) {
      setError('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const currentMatch = matches[currentMatchIdx];
  const completedCount = Object.keys(results).length;
  const totalMatches = matches.length;
  const allDone = completedCount === totalMatches && totalMatches > 0;
  const progressPercent = totalMatches > 0 ? (completedCount / totalMatches) * 100 : 0;

  const recordCurrentMatch = async (player1Score: number, player2Score: number) => {
    if (!currentMatch) return;

    setRecording(true);
    try {
      // Determine winner
      let winner = 'player1';
      if (player2Score > player1Score) winner = 'player2';

      // Record match result
      const response = await fetch(
        `/api/v1/tournaments/${tournamentId}/events/${eventId}/matches/${currentMatch.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            set_scores: [
              { set: 1, player1: player1Score, player2: player2Score },
            ],
            winner_by: 'score',
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Store result
        setResults({
          ...results,
          [currentMatch.id]: {
            player1Score,
            player2Score,
            winner,
            bracketGenerated: data.workflow?.bracket_generated,
          },
        });

        // If this was the last match or bracket auto-generated
        if (completedCount + 1 === totalMatches || data.workflow?.bracket_generated) {
          if (onAllRecorded) onAllRecorded();
        }

        // Move to next match
        if (currentMatchIdx + 1 < totalMatches) {
          setCurrentMatchIdx(currentMatchIdx + 1);
        }
      }
    } catch (err) {
      setError('Failed to record match');
    } finally {
      setRecording(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Group matches by group
  const matchesByGroup = matches.reduce(
    (acc, match) => {
      if (!acc[match.groupId]) acc[match.groupId] = [];
      acc[match.groupId].push(match);
      return acc;
    },
    {} as Record<string, MatchForRecording[]>
  );

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recording Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">{completedCount}/{totalMatches} Matches</span>
              <span className="text-sm">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          {allDone && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ All matches recorded! Bracket should be generating...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Current Match Recording */}
      {!allDone && currentMatch && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="text-lg">
              Match {currentMatchIdx + 1}/{totalMatches}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Players */}
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Player 1 */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold">{currentMatch.player1.name}</p>
                <p className="text-xs text-gray-500">{currentMatch.player1.id.substring(0, 8)}</p>
              </div>

              <div className="text-center">
                <p className="text-gray-500 font-bold">vs</p>
              </div>

              {/* Player 2 */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold">{currentMatch.player2.name}</p>
                <p className="text-xs text-gray-500">{currentMatch.player2.id.substring(0, 8)}</p>
              </div>
            </div>

            {/* Quick Score Templates */}
            <div>
              <p className="text-sm font-medium mb-3">Quick Record:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => recordCurrentMatch(11, 9)}
                  disabled={recording}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg font-medium text-sm"
                >
                  P1: 11-9
                </button>
                <button
                  onClick={() => recordCurrentMatch(11, 7)}
                  disabled={recording}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg font-medium text-sm"
                >
                  P1: 11-7
                </button>
                <button
                  onClick={() => recordCurrentMatch(9, 11)}
                  disabled={recording}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 rounded-lg font-medium text-sm"
                >
                  P2: 11-9
                </button>
                <button
                  onClick={() => recordCurrentMatch(7, 11)}
                  disabled={recording}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 rounded-lg font-medium text-sm"
                >
                  P2: 11-7
                </button>
              </div>
            </div>

            {/* Custom Score Input */}
            <CustomScoreInput onSubmit={recordCurrentMatch} loading={recording} />
          </CardContent>
        </Card>
      )}

      {/* All Matches Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Matches by Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(matchesByGroup).map(([groupId, groupMatches]) => (
            <div key={groupId}>
              <p className="font-semibold mb-3">
                Group {groupMatches[0]?.groupNumber || 'Unknown'} ({groupMatches.length} matches)
              </p>
              <div className="space-y-2">
                {groupMatches.map((match) => {
                  const result = results[match.id];
                  return (
                    <div
                      key={match.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        result
                          ? 'bg-green-50 border border-green-200'
                          : currentMatchIdx === matches.indexOf(match)
                          ? 'bg-blue-50 border border-blue-300'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {match.player1.name} vs {match.player2.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {result ? (
                          <>
                            <span className="text-sm font-bold">
                              {result.player1Score}-{result.player2Score}
                            </span>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function CustomScoreInput({
  onSubmit,
  loading,
}: {
  onSubmit: (p1: number, p2: number) => void;
  loading: boolean;
}) {
  const [p1Score, setP1Score] = useState('');
  const [p2Score, setP2Score] = useState('');

  const handleSubmit = () => {
    if (p1Score && p2Score) {
      onSubmit(parseInt(p1Score), parseInt(p2Score));
      setP1Score('');
      setP2Score('');
    }
  };

  return (
    <div>
      <p className="text-sm font-medium mb-3">Or Enter Custom Score:</p>
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          max="15"
          value={p1Score}
          onChange={(e) => setP1Score(e.target.value)}
          placeholder="Player 1"
          className="flex-1 px-3 py-2 border rounded-lg text-center"
          disabled={loading}
        />
        <span className="flex items-center px-2">-</span>
        <input
          type="number"
          min="0"
          max="15"
          value={p2Score}
          onChange={(e) => setP2Score(e.target.value)}
          placeholder="Player 2"
          className="flex-1 px-3 py-2 border rounded-lg text-center"
          disabled={loading}
        />
        <Button onClick={handleSubmit} disabled={!p1Score || !p2Score || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Record
        </Button>
      </div>
    </div>
  );
}

export default MatchBatchRecorder;
