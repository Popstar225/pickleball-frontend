/**
 * useTournament.ts
 *
 * Custom React hooks for tournament-related API operations
 * Provides easy access to async thunks and state management
 */

import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import {
  fetchTournamentDetails,
  validateTournamentStart,
  startTournament,
  cancelEvent,
  changeEventFormat,
  mergeEvents,
  correctMatchResult,
  getMatchCorrectionHistory,
  extractQualifiers,
  clearError,
  clearSuccess,
  resetValidation,
} from '@/store/slices/tournamentSlice';

/**
 * Hook to fetch tournament details
 */
export function useFetchTournament() {
  const dispatch = useDispatch<AppDispatch>();

  return {
    fetchTournament: (tournamentId: string) =>
      dispatch(fetchTournamentDetails(tournamentId) as any),
  };
}

/**
 * Hook to validate tournament before start
 */
export function useValidateTournament() {
  const dispatch = useDispatch<AppDispatch>();
  const { validation, loading, error } = useSelector((state: RootState) => state.tournament);

  return {
    validate: (tournamentId: string) => dispatch(validateTournamentStart(tournamentId) as any),
    validation,
    loading,
    error,
    reset: () => dispatch(resetValidation()),
  };
}

/**
 * Hook to start tournament
 */
export function useStartTournament() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage } = useSelector((state: RootState) => state.tournament);

  return {
    start: (tournamentId: string, options?: Record<string, any>) =>
      dispatch(startTournament({ tournamentId, options }) as any),
    loading,
    error,
    success: successMessage,
    clearError: () => dispatch(clearError()),
    clearSuccess: () => dispatch(clearSuccess()),
  };
}

/**
 * Hook to cancel an event
 */
export function useCancelEvent() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage } = useSelector((state: RootState) => state.tournament);

  return {
    cancel: (tournamentId: string, eventId: string, reason: string) =>
      dispatch(cancelEvent({ tournamentId, eventId, reason }) as any),
    loading,
    error,
    success: successMessage,
    clearError: () => dispatch(clearError()),
    clearSuccess: () => dispatch(clearSuccess()),
  };
}

/**
 * Hook to change event format
 */
export function useChangeEventFormat() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage } = useSelector((state: RootState) => state.tournament);

  return {
    changeFormat: (tournamentId: string, eventId: string, newFormat: string, reason: string) =>
      dispatch(changeEventFormat({ tournamentId, eventId, newFormat, reason }) as any),
    loading,
    error,
    success: successMessage,
    clearError: () => dispatch(clearError()),
    clearSuccess: () => dispatch(clearSuccess()),
  };
}

/**
 * Hook to merge events
 */
export function useMergeEvents() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage } = useSelector((state: RootState) => state.tournament);

  return {
    merge: (tournamentId: string, sourceEventId: string, targetEventId: string, reason: string) =>
      dispatch(mergeEvents({ tournamentId, sourceEventId, targetEventId, reason }) as any),
    loading,
    error,
    success: successMessage,
    clearError: () => dispatch(clearError()),
    clearSuccess: () => dispatch(clearSuccess()),
  };
}

/**
 * Hook to correct match results
 */
export function useCorrectMatchResult() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage } = useSelector((state: RootState) => state.tournament);

  return {
    correct: (tournamentId: string, matchId: string, newScore: string, reason: string) =>
      dispatch(correctMatchResult({ tournamentId, matchId, newScore, reason }) as any),
    loading,
    error,
    success: successMessage,
    clearError: () => dispatch(clearError()),
    clearSuccess: () => dispatch(clearSuccess()),
  };
}

/**
 * Hook to get match correction history
 */
export function useMatchCorrectionHistory() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.tournament);

  return {
    getHistory: (tournamentId: string, matchId: string) =>
      dispatch(getMatchCorrectionHistory({ tournamentId, matchId }) as any),
    loading,
    error,
    clearError: () => dispatch(clearError()),
  };
}

/**
 * Hook to extract qualifiers
 */
export function useExtractQualifiers() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage } = useSelector((state: RootState) => state.tournament);

  return {
    extract: (tournamentId: string, strategy: string = 'topN', topN: number = 2) =>
      dispatch(extractQualifiers({ tournamentId, strategy, topN }) as any),
    loading,
    error,
    success: successMessage,
    clearError: () => dispatch(clearError()),
    clearSuccess: () => dispatch(clearSuccess()),
  };
}

/**
 * Hook to get current tournament and loading state
 */
export function useTournamentState() {
  return useSelector((state: RootState) => ({
    tournament: state.tournament.currentTournament,
    validation: state.tournament.validation,
    loading: state.tournament.loading,
    error: state.tournament.error,
    success: state.tournament.successMessage,
  }));
}
