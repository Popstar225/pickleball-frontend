import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Clock } from 'lucide-react';

interface BracketMatch {
  id: string;
  bracket_position: number;
  player1: { id: string; name: string } | null;
  player2: { id: string; name: string } | null;
  winner_id?: string;
  status: 'completed' | 'pending';
  set_scores: Array<{ set: number; player1: number; player2: number }>;
}

interface BracketRound {
  round: number;
  match_count: number;
  matches: BracketMatch[];
}

interface BracketVisualizationProps {
  tournamentId: string;
  eventId: string;
  onBracketGenerated?: () => void;
}

export function BracketVisualization({ tournamentId, eventId, onBracketGenerated }: BracketVisualizationProps) {
  const [bracketData, setBracketData] = useState<Record<number, BracketRound[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRound, setActiveRound] = useState(1);

  useEffect(() => {
    fetchBracket();
    const interval = setInterval(fetchBracket, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [eventId]);

  const fetchBracket = async () => {
    try {
      const response = await fetch(
        `/api/v1/tournaments/${tournamentId}/events/${eventId}/bracket`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch bracket');
      }

      const data = await response.json();
      if (data.success) {
        setBracketData(data.bracket);
        setError(null);
        if (onBracketGenerated) onBracketGenerated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching bracket');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading bracket...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-red-500 text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!bracketData || Object.keys(bracketData).length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-gray-300 text-center">No bracket generated yet. Complete the group stage to auto-generate.</p>
        </CardContent>
      </Card>
    );
  }

  const rounds = Object.values(bracketData).flat();
  const maxRound = Math.max(...rounds.map(r => r.round)) || 1;

  return (
    <div className="space-y-6">
      {/* Round Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: maxRound }, (_, i) => i + 1).map(round => (
          <button
            key={round}
            onClick={() => setActiveRound(round)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeRound === round
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {round === maxRound ? 'Final' : round === maxRound - 1 ? 'Semi-Finals' : `Round ${round}`}
          </button>
        ))}
      </div>

      {/* Bracket Display */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeRound === maxRound
              ? 'Championship Final'
              : activeRound === maxRound - 1
              ? 'Semi-Finals'
              : `Round ${activeRound}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bracketData[activeRound]?.[0]?.matches?.map((match, idx) => (
              <BracketMatchCard key={match.id} match={match} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tournament Progress */}
      <TournamentProgress rounds={rounds} />
    </div>
  );
}

function BracketMatchCard({ match }: { match: BracketMatch }) {
  const getSetScoreDisplay = () => {
    if (!match.set_scores || match.set_scores.length === 0) return '-';

    return match.set_scores
      .map(set => `${set.player1}-${set.player2}`)
      .join(', ');
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="space-y-3">
        {/* Player 1 */}
        <div className={`flex items-center justify-between p-2 rounded ${
          match.winner_id === match.player1?.id ? 'bg-green-50' : ''
        }`}>
          <div>
            <p className="font-medium">{match.player1?.name || 'TBD'}</p>
            <p className="text-sm text-gray-300">{match.player1?.id?.substring(0, 8)}</p>
          </div>
          <div className="text-right">
            {match.status === 'completed' && match.winner_id === match.player1?.id && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
          </div>
        </div>

        <div className="text-center text-xs text-gray-200">vs</div>

        {/* Player 2 */}
        <div className={`flex items-center justify-between p-2 rounded ${
          match.winner_id === match.player2?.id ? 'bg-green-50' : ''
        }`}>
          <div>
            <p className="font-medium">{match.player2?.name || 'TBD'}</p>
            <p className="text-sm text-gray-300">{match.player2?.id?.substring(0, 8)}</p>
          </div>
          <div className="text-right">
            {match.status === 'completed' && match.winner_id === match.player2?.id && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
          </div>
        </div>

        {/* Match Status */}
        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <div className="flex gap-2">
            <Badge variant={match.status === 'completed' ? 'default' : 'secondary'}>
              {match.status === 'completed' ? 'Completed' : 'Pending'}
            </Badge>
          </div>
          <div className="text-gray-300">
            {match.status === 'completed' && match.set_scores && (
              <span>{getSetScoreDisplay()}</span>
            )}
            {match.status === 'pending' && (
              <Clock className="h-4 w-4 inline text-yellow-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TournamentProgress({ rounds }: { rounds: BracketRound[] }) {
  const totalMatches = rounds.reduce((sum, r) => sum + r.match_count, 0);
  const completedMatches = rounds.reduce((sum, r) => {
    const completed = r.matches?.filter(m => m.status === 'completed').length || 0;
    return sum + completed;
  }, 0);

  const progressPercent = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tournament Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Matches Completed</span>
            <span className="text-sm font-bold">{completedMatches}/{totalMatches}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-300 mt-1">{progressPercent}% Complete</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{completedMatches}</p>
            <p className="text-sm text-gray-300">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{totalMatches - completedMatches}</p>
            <p className="text-sm text-gray-300">Remaining</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BracketVisualization;
