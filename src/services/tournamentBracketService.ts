/**
 * Tournament Bracket Service
 *
 * Handles bracket generation, qualifier advancement, and real-time bracket status tracking
 * for enhanced timeline visualization during the post-match workflow
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BracketMatch {
  id: string;
  player1_id: string;
  player1_name: string;
  player2_id: string;
  player2_name: string;
  round: number;
  position: number;
  winner_id?: string;
  status: 'pending' | 'completed' | 'in-progress';
  set_scores?: Array<{ set: number; player1: number; player2: number }>;
}

export interface BracketRound {
  round: number;
  matches: BracketMatch[];
}

export interface BracketStructure {
  eventId: string;
  totalRounds: number;
  rounds: BracketRound[];
  winner?: {
    id: string;
    name: string;
  };
}

export interface Qualifier {
  id: string;
  user_id: string;
  name: string;
  group_id: string;
  position: number;
  points: number;
  seed: number;
}

export interface TournamentCompletionStatus {
  eventId: string;
  status: 'planning' | 'groups' | 'standings' | 'matches' | 'qualifiers' | 'bracket' | 'completed';
  bracketGenerated: boolean;
  qualifiersAdvanced: number;
  totalQualifiers: number;
  bracketMatchesCompleted: number;
  totalBracketMatches: number;
  winner?: {
    id: string;
    name: string;
    ranking: number;
  };
  completionPercentage: number;
}

// ─── API Calls ─────────────────────────────────────────────────────────────────
/**
 * Fetches the current bracket structure for an event
 * Shows all rounds and matches with live status
 */
export const getBracketStructure = async (
  tournamentId: string,
  eventId: string,
): Promise<BracketStructure | null> => {
  try {
    const response = await api.get<BracketStructure>(
      `/tournaments/${tournamentId}/events/${eventId}/bracket`,
    );
    return response as BracketStructure;
  } catch (error) {
    console.error('Failed to fetch bracket structure:', error);
    return null;
  }
};

/**
 * Fetches list of qualified players for the event
 * Includes seeding information and group ranking
 */
export const getQualifiers = async (
  tournamentId: string,
  eventId: string,
): Promise<Qualifier[] | null> => {
  try {
    const response = await api.get<Qualifier[]>(
      `/tournaments/${tournamentId}/events/${eventId}/qualifiers`,
    );
    return response as Qualifier[];
  } catch (error) {
    console.error('Failed to fetch qualifiers:', error);
    return null;
  }
};

/**
 * Fetches tournament completion status and workflow state
 * Returns what stage the tournament is in and progress metrics
 */
export const getTournamentCompletionStatus = async (
  tournamentId: string,
  eventId: string,
): Promise<TournamentCompletionStatus | null> => {
  try {
    const response = await api.get<TournamentCompletionStatus>(
      `/tournaments/${tournamentId}/events/${eventId}/completion-status`,
    );
    return response as TournamentCompletionStatus;
  } catch (error) {
    console.error('Failed to fetch tournament completion status:', error);
    return null;
  }
};

/**
 * Marks a tournament event as complete
 * Locks the event and marks it as finished
 */
export const markTournamentAsComplete = async (
  tournamentId: string,
  eventId: string,
): Promise<{ success: boolean; message?: string; error?: string } | null> => {
  try {
    const response = await api.post<{ success: boolean; message: string }>(
      `/tournaments/${tournamentId}/events/${eventId}/mark-complete`,
      { award_ranking_points: true },  // Pass request body
    );
    return response as { success: boolean; message: string };
  } catch (error) {
    console.error('Failed to mark tournament as complete:', error);
    return null;
  }
};

/**
 * Polls for bracket generation status until bracket is ready
 * Used to automatically update UI when group stage completes and bracket auto-generates
 */
export const pollBracketStatus = async (
  tournamentId: string,
  eventId: string,
  maxAttempts: number = 30,
  delayMs: number = 1000,
): Promise<BracketStructure | null> => {
  let attempts = 0;

  const poll = async (): Promise<BracketStructure | null> => {
    if (attempts >= maxAttempts) {
      console.warn('Bracket generation polling timeout after', attempts, 'attempts');
      return null;
    }

    const bracket = await getBracketStructure(tournamentId, eventId);
    if (bracket && bracket.rounds && bracket.rounds.length > 0) {
      console.log('Bracket generated successfully', bracket);
      return bracket;
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return poll();
  };

  return poll();
};

/**
 * Get count of qualifiers for progress tracking
 */
export const getQualifiersCount = async (
  tournamentId: string,
  eventId: string,
): Promise<{ advanced: number; total: number }> => {
  try {
    const qualifiers = await getQualifiers(tournamentId, eventId);
    if (!qualifiers) return { advanced: 0, total: 0 };
    return { advanced: qualifiers.length, total: qualifiers.length };
  } catch (error) {
    console.error('Failed to get qualifiers count:', error);
    return { advanced: 0, total: 0 };
  }
};

/**
 * Get bracket matches completion percentage
 */
export const getBracketCompletionPercentage = async (
  tournamentId: string,
  eventId: string,
): Promise<{ completed: number; total: number; percentage: number }> => {
  try {
    const bracket = await getBracketStructure(tournamentId, eventId);
    if (!bracket) return { completed: 0, total: 0, percentage: 0 };

    let total = 0;
    let completed = 0;

    bracket.rounds.forEach((round) => {
      round.matches.forEach((match) => {
        total++;
        if (match.status === 'completed') completed++;
      });
    });

    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  } catch (error) {
    console.error('Failed to get bracket completion percentage:', error);
    return { completed: 0, total: 0, percentage: 0 };
  }
};

export default {
  getBracketStructure,
  getQualifiers,
  getTournamentCompletionStatus,
  pollBracketStatus,
  getQualifiersCount,
  getBracketCompletionPercentage,
};
