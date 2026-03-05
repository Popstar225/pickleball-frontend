/**
 * Single Elimination Bracket Component
 *
 * Visualizes single elimination bracket with:
 * - Round structure (R16, Quarterfinals, Semifinals, Finals)
 * - Seeding/bye assignments
 * - Match scheduling
 * - Result recording
 * - Winner progression
 *
 * @author Tournament System
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BracketSeedingExplanation, {
  SeededPlayer,
} from '@/components/tournament/BracketSeedingExplanation';
import { Trophy, ChevronRight } from 'lucide-react';

interface BracketMatch {
  id: string;
  roundNumber: number;
  matchNumber: number;
  player1?: { id: string; name: string; seed: number };
  player2?: { id: string; name: string; seed: number };
  isBye?: boolean;
  winner?: { id: string; name: string };
  status: 'pending' | 'played' | 'walkover' | 'cancelled';
  score?: string;
}

interface SingleEliminationBracketProps {
  eventId: string;
  eventName: string;
  bracketMatches: BracketMatch[];
  totalRounds: number;
  onRecordResult: (matchId: string, winnerId: string, score?: string) => Promise<void>;
}

const ROUND_NAMES: { [key: number]: string } = {
  1: 'Round of 16',
  2: 'Quarterfinals',
  3: 'Semifinals',
  4: 'Finals',
};

const SingleEliminationBracket: React.FC<SingleEliminationBracketProps> = ({
  eventId,
  eventName,
  bracketMatches,
  totalRounds,
  onRecordResult,
}) => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [recordingWinnerId, setRecordingWinnerId] = useState<string | null>(null);

  // Extract seeded players from first round (root bracket)
  const seededPlayers = useMemo(() => {
    const firstRoundMatches = bracketMatches.filter((m) => m.roundNumber === 1);
    const players: SeededPlayer[] = [];

    firstRoundMatches.forEach((match) => {
      if (match.player1) {
        players.push({
          id: match.player1.id,
          name: match.player1.name,
          seed: match.player1.seed,
          source: `Seed #${match.player1.seed} - Qualificado del grupo`,
          hasBye: match.player2 === undefined,
          byeReason:
            match.player2 === undefined
              ? 'Este seed avanza automáticamente a la siguiente ronda'
              : undefined,
        });
      }
      if (match.player2) {
        players.push({
          id: match.player2.id,
          name: match.player2.name,
          seed: match.player2.seed,
          source: `Seed #${match.player2.seed} - Qualificado del grupo`,
          hasBye: false,
        });
      }
    });

    return players.sort((a, b) => a.seed - b.seed);
  }, [bracketMatches]);

  const totalQualifiers = seededPlayers.length;

  // Group matches by round
  const matchesByRound: { [key: number]: BracketMatch[] } = {};
  for (let i = 1; i <= totalRounds; i++) {
    matchesByRound[i] = bracketMatches.filter((m) => m.roundNumber === i);
  }

  const handleRecordWinner = async (matchId: string, winnerId: string) => {
    setRecordingWinnerId(winnerId);
    try {
      await onRecordResult(matchId, winnerId);
      setSelectedMatch(null);
    } catch (error) {
      console.error('Error recording winner:', error);
    } finally {
      setRecordingWinnerId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-700 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Single Elimination Bracket
          </CardTitle>
          <CardDescription className="text-slate-400">{eventName}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Seeding Explanation */}
          {seededPlayers.length > 0 && (
            <div className="mb-8 p-4 bg-[#0d1117] border border-white/[0.06] rounded-2xl">
              <BracketSeedingExplanation players={seededPlayers} bracketSize={totalQualifiers} />
            </div>
          )}

          <div className="space-y-8 overflow-x-auto">
            {/* Rounds */}
            {Array.from({ length: totalRounds }).map((_, roundIdx) => {
              const roundNumber = roundIdx + 1;
              const roundMatches = matchesByRound[roundNumber] || [];
              const roundName = ROUND_NAMES[roundNumber] || `Round ${roundNumber}`;

              return (
                <div key={roundNumber} className="min-w-max">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                    {roundName}
                    <span className="text-slate-600 ml-2">
                      ({roundMatches.length} match{roundMatches.length !== 1 ? 'es' : ''})
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {roundMatches.map((match) => (
                      <div
                        key={match.id}
                        className={`p-4 rounded-lg border ${
                          match.status === 'played'
                            ? 'border-green-500/30 bg-green-500/5'
                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                        }`}
                      >
                        {/* Match Header */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-slate-500">Match {match.matchNumber}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              match.status === 'played'
                                ? 'bg-green-500/20 text-green-400'
                                : match.status === 'walkover'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-slate-700/50 text-slate-400'
                            }`}
                          >
                            {match.status === 'played'
                              ? 'Played'
                              : match.status === 'walkover'
                                ? 'Walkover'
                                : 'Pending'}
                          </span>
                        </div>

                        {/* Player 1 */}
                        {match.player1 ? (
                          <div className="mb-2">
                            <div
                              className={`flex items-center justify-between p-2 rounded ${
                                match.winner?.id === match.player1.id
                                  ? 'bg-green-500/20 border-l-2 border-green-500'
                                  : 'bg-slate-700/30'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">
                                  #{match.player1.seed}
                                </span>
                                <span
                                  className={`text-sm ${
                                    match.winner?.id === match.player1.id
                                      ? 'font-bold text-green-400'
                                      : 'text-white'
                                  }`}
                                >
                                  {match.player1.name}
                                </span>
                              </div>

                              {match.status === 'pending' && (
                                <Button
                                  onClick={() => handleRecordWinner(match.id, match.player1!.id)}
                                  disabled={recordingWinnerId === match.player1.id}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-xs"
                                >
                                  {recordingWinnerId === match.player1.id ? (
                                    'Setting...'
                                  ) : (
                                    <>
                                      Winner
                                      <ChevronRight className="h-3 w-3 ml-1" />
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-2 p-2 bg-slate-700/20 rounded text-xs text-slate-500 italic">
                            TBD / Bye
                          </div>
                        )}

                        {/* vs */}
                        <div className="text-center my-1">
                          <span className="text-xs text-slate-600">vs</span>
                        </div>

                        {/* Player 2 */}
                        {match.player2 ? (
                          <div className="mb-3">
                            <div
                              className={`flex items-center justify-between p-2 rounded ${
                                match.winner?.id === match.player2.id
                                  ? 'bg-green-500/20 border-l-2 border-green-500'
                                  : 'bg-slate-700/30'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">
                                  #{match.player2.seed}
                                </span>
                                <span
                                  className={`text-sm ${
                                    match.winner?.id === match.player2.id
                                      ? 'font-bold text-green-400'
                                      : 'text-white'
                                  }`}
                                >
                                  {match.player2.name}
                                </span>
                              </div>

                              {match.status === 'pending' && (
                                <Button
                                  onClick={() => handleRecordWinner(match.id, match.player2!.id)}
                                  disabled={recordingWinnerId === match.player2.id}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-xs"
                                >
                                  {recordingWinnerId === match.player2.id ? (
                                    'Setting...'
                                  ) : (
                                    <>
                                      Winner
                                      <ChevronRight className="h-3 w-3 ml-1" />
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-3 p-2 bg-slate-700/20 rounded text-xs text-slate-500 italic">
                            TBD / Bye
                          </div>
                        )}

                        {/* Score Display */}
                        {match.status === 'played' && match.score && (
                          <div className="text-xs text-slate-400 p-2 bg-slate-700/20 rounded">
                            Score: {match.score}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-slate-700 space-y-2 text-xs text-slate-500">
            <p>
              <span className="inline-block w-3 h-3 bg-green-500/20 border border-green-500 rounded mr-2"></span>
              Bye: Player automatically advances (receives free pass)
            </p>
            <p>
              <span className="text-slate-600">👤</span>
              TBD: Match not yet determined (depends on previous round)
            </p>
            <p>
              <span className="text-yellow-500">#</span>
              Seed: Player seeding based on group position and ranking
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SingleEliminationBracket;
