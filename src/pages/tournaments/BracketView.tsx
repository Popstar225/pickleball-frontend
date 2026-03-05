/**
 * Single Elimination Bracket Visualization
 *
 * Visual representation of tournament bracket with:
 * - Round-by-round bracket structure
 * - Player matchups and seeding
 * - Bye placements (gray boxes)
 * - Historical match results
 * - Winner advancement visualization
 * - Score display for completed matches
 *
 * @author Pickleball Federation Team
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ChevronRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface BracketMatch {
  id: string;
  seed1?: number;
  seed2?: number;
  player1_name: string;
  player2_name: string;
  player1_id?: string;
  player2_id?: string;
  player1_score?: number;
  player2_score?: number;
  winner_id?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'walkover' | 'cancelled';
  bye?: boolean;
  round: number;
  position: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface BracketData {
  tournament_id: string;
  tournament_name: string;
  event_type: string;
  total_rounds: number;
  matches: BracketMatch[];
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500/[0.06] border-emerald-500/20';
    case 'in_progress':
      return 'bg-sky-500/[0.06] border-sky-500/20';
    case 'pending':
      return 'bg-[#161c25] border-white/[0.08]';
    case 'walkover':
      return 'bg-amber-500/[0.06] border-amber-500/20';
    default:
      return 'bg-red-500/[0.06] border-red-500/20';
  }
};

const getStatusIcon = (status: string, size: number = 4) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className={cn(`w-${size} h-${size}`, 'text-emerald-400')} />;
    case 'in_progress':
      return <Clock className={cn(`w-${size} h-${size}`, 'text-sky-400')} />;
    case 'pending':
      return <div className={`w-${size} h-${size} rounded-full border border-white/20`} />;
    default:
      return <XCircle className={cn(`w-${size} h-${size}`, 'text-red-400')} />;
  }
};

const BracketMatch: React.FC<{
  match: BracketMatch;
  isLast: boolean;
  onClickMatch: (matchId: string) => void;
}> = ({ match, isLast, onClickMatch }) => {
  const isBye = match.bye || (!match.player1_name && !match.player2_name);
  const isCompleted = match.status === 'completed';

  if (isBye) {
    return (
      <div className="bg-white/[0.04] border border-white/[0.08] rounded p-2 text-xs text-white/40">
        BYE
      </div>
    );
  }

  return (
    <button
      onClick={() => onClickMatch(match.id)}
      className={cn(
        'w-full p-2 rounded border text-left transition-all hover:border-white/[0.15]',
        getStatusColor(match.status),
      )}
    >
      <div className="space-y-1">
        {/* PLAYER 1 */}
        <div
          className={cn(
            'flex items-center gap-2 text-xs',
            isCompleted && match.winner_id === match.player1_id
              ? 'text-emerald-400 font-bold'
              : 'text-white/60',
          )}
        >
          {match.seed1 && <span className="text-[9px] font-bold opacity-50">[{match.seed1}]</span>}
          <span className="flex-1 truncate">{match.player1_name || 'TBD'}</span>
          {match.player1_score !== undefined && (
            <span className="font-bold text-white">{match.player1_score}</span>
          )}
        </div>

        {/* PLAYER 2 */}
        <div
          className={cn(
            'flex items-center gap-2 text-xs border-t border-white/[0.08] pt-1',
            isCompleted && match.winner_id === match.player2_id
              ? 'text-emerald-400 font-bold'
              : 'text-white/60',
          )}
        >
          {match.seed2 && <span className="text-[9px] font-bold opacity-50">[{match.seed2}]</span>}
          <span className="flex-1 truncate">{match.player2_name || 'TBD'}</span>
          {match.player2_score !== undefined && (
            <span className="font-bold text-white">{match.player2_score}</span>
          )}
        </div>
      </div>

      {/* STATUS BADGE */}
      <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/[0.08]">
        <div className="flex items-center gap-1">
          {getStatusIcon(match.status, 3)}
          <span className="text-[9px] text-white/40">
            {match.status === 'pending' && 'Pending'}
            {match.status === 'in_progress' && 'In Progress'}
            {match.status === 'completed' && 'Complete'}
            {match.status === 'walkover' && 'Walkover'}
          </span>
        </div>
        {!isLast && <ChevronRight className="w-3 h-3 text-white/20" />}
      </div>
    </button>
  );
};

const BracketRound: React.FC<{
  round: number;
  roundName: string;
  matches: BracketMatch[];
  onClickMatch: (matchId: string) => void;
}> = ({ round, roundName, matches, onClickMatch }) => {
  const isLastRound = roundName.includes('Final');

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">
        {roundName}
      </h3>
      <div
        className={cn(
          'space-y-2',
          round > 1 && 'space-y-4', // More space between matches in later rounds
        )}
      >
        {matches.map((match) => (
          <BracketMatch
            key={match.id}
            match={match}
            isLast={isLastRound}
            onClickMatch={onClickMatch}
          />
        ))}
      </div>
    </div>
  );
};

export const BracketView: React.FC = () => {
  const { tournamentId, eventId } = useParams<{
    tournamentId: string;
    eventId: string;
  }>();
  const navigate = useNavigate();

  const [data, setData] = useState<BracketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  useEffect(() => {
    loadBracket();
  }, [tournamentId, eventId]);

  const loadBracket = async () => {
    try {
      setLoading(true);
      const endpoint = eventId
        ? `/tournaments/${tournamentId}/events/${eventId}/bracket`
        : `/tournaments/${tournamentId}/bracket`;
      const response = (await api.get(endpoint)) as ApiResponse<BracketData>;
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load bracket');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-white/40">Loading bracket...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-white/60">Bracket not found</p>
      </div>
    );
  }

  // Organize matches by round
  const matchesByRound = new Map<number, BracketMatch[]>();
  data.matches.forEach((match) => {
    if (!matchesByRound.has(match.round)) {
      matchesByRound.set(match.round, []);
    }
    matchesByRound.get(match.round)!.push(match);
  });

  const rounds = Array.from(matchesByRound.entries()).sort((a, b) => a[0] - b[0]);

  const getRoundName = (roundNumber: number, totalRounds: number): string => {
    if (roundNumber === 1) return 'Round of ' + Math.pow(2, totalRounds);
    if (roundNumber === totalRounds - 1) return 'Final';
    if (roundNumber === totalRounds - 2) return 'Semifinals';
    if (roundNumber === totalRounds - 3) return 'Quarterfinals';
    return `Round ${roundNumber}`;
  };

  return (
    <div className="min-h-screen space-y-6 pb-10">
      {/* HEADER */}
      <div className="sticky top-0 bg-[#0d1117]/95 backdrop-blur border-b border-white/[0.08] p-4 z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/40 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-bold text-white">Tournament Bracket</h1>
            </div>
            <p className="text-sm text-white/40 ml-10">
              {data.tournament_name} • {data.event_type}
            </p>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="flex items-start gap-2 p-2 bg-red-500/[0.06] border border-red-500/15 rounded-lg mt-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>

      <div className="px-4 space-y-8">
        {/* LEGEND */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            {getStatusIcon('completed', 4)}
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2 text-sky-400">
            {getStatusIcon('in_progress', 4)}
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2 text-white/40">
            {getStatusIcon('pending', 4)}
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            {getStatusIcon('walkover', 4)}
            <span>Walkover</span>
          </div>
        </div>

        {/* BRACKET ROUNDS */}
        {rounds.length === 0 ? (
          <div className="text-center py-10 bg-[#161c25] border border-white/[0.08] rounded-xl">
            <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No bracket data available yet</p>
            <p className="text-sm text-white/20 mt-1">
              Bracket will be generated once tournament starts
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rounds.map(([roundNumber, roundMatches]) => (
              <BracketRound
                key={roundNumber}
                round={roundNumber}
                roundName={getRoundName(roundNumber, data.total_rounds)}
                matches={roundMatches.sort((a, b) => a.position - b.position)}
                onClickMatch={(matchId) => {
                  setSelectedMatchId(matchId);
                  navigate(`/matches/${matchId}`);
                }}
              />
            ))}
          </div>
        )}

        {/* BRACKET INFO CARD */}
        {rounds.length > 0 && (
          <div className="bg-[#161c25] border border-white/[0.08] rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-white">Bracket Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-white/40 text-xs">Total Rounds</p>
                <p className="text-white font-semibold">{data.total_rounds}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Total Matches</p>
                <p className="text-white font-semibold">{data.matches.length}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Format</p>
                <p className="text-white font-semibold">Single Elimination</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Event</p>
                <p className="text-white font-semibold">{data.event_type}</p>
              </div>
            </div>

            {/* PROGRESS */}
            <div>
              <p className="text-white/40 text-xs mb-2">Progress</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-white/60">
                  <span>Completed</span>
                  <span className="font-bold text-emerald-400">
                    {data.matches.filter((m) => m.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>In Progress</span>
                  <span className="font-bold text-sky-400">
                    {data.matches.filter((m) => m.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Pending</span>
                  <span className="font-bold text-white/40">
                    {data.matches.filter((m) => m.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOW BRACKET WORKS */}
        <div className="bg-[#161c25] border border-white/[0.08] rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-white">How Bracket Works</h3>
          <ol className="space-y-2 text-xs text-white/60">
            <li className="flex gap-2">
              <span className="text-[#ace600] font-bold shrink-0">1.</span>
              <span>Winners advance to the next round automatically</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600] font-bold shrink-0">2.</span>
              <span>BYE boxes indicate players with automatic advancement (odd seeding)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600] font-bold shrink-0">3.</span>
              <span>Final match determines tournament champion</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600] font-bold shrink-0">4.</span>
              <span>All matches must be completed to advance</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default BracketView;
