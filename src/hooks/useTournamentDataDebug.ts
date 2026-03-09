/**
 * Tournament Data Debugging Hook
 * 
 * Helps diagnose data loading issues in tournament dashboard
 * Logs detailed information about data fetch status and API responses
 */

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const useTournamentDataDebug = (
  eventId: string | undefined,
  tournamentId: string | undefined,
) => {
  const { eventMatches, eventGroups, eventRegistrations, loading, error } = useSelector(
    (s: RootState) => s.tournaments,
  );

  useEffect(() => {
    if (!eventId || !tournamentId) {
      console.log('[Debug] Missing event or tournament ID', { eventId, tournamentId });
      return;
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      context: { eventId, tournamentId },
      dataStatus: {
        matches: {
          count: eventMatches?.length || 0,
          hasData: !!eventMatches && eventMatches.length > 0,
          sample: eventMatches?.[0],
        },
        groups: {
          count: eventGroups?.length || 0,
          hasData: !!eventGroups && eventGroups.length > 0,
          sample: eventGroups?.[0],
        },
        registrations: {
          count: eventRegistrations?.length || 0,
          hasData: !!eventRegistrations && eventRegistrations.length > 0,
          sample: eventRegistrations?.[0],
        },
      },
      loadingState: loading,
      errorState: error,
    };

    console.group('🔍 Tournament Data Debug Info');
    console.table({
      'Matches Loaded': eventMatches?.length ? `✅ ${eventMatches.length}` : '❌ 0',
      'Groups Loaded': eventGroups?.length ? `✅ ${eventGroups.length}` : '❌ 0',
      'Registrations Loaded': eventRegistrations?.length ? `✅ ${eventRegistrations.length}` : '❌ 0',
      'Loading': loading ? '⏳ In Progress' : '✅ Complete',
      'Error': error ? `❌ ${error}` : '✅ None',
    });
    console.log('Detailed Debug Info:', debugInfo);
    console.groupEnd();

    // If matches not loaded, provide more detailed diagnostics
    if (!eventMatches || eventMatches.length === 0) {
      console.warn('[Debug] ⚠️ EventMatches not loaded:', {
        isArray: Array.isArray(eventMatches),
        type: typeof eventMatches,
        value: eventMatches,
      });
    }
  }, [eventId, tournamentId, eventMatches, eventGroups, eventRegistrations, loading, error]);

  return {
    matchCount: eventMatches?.length || 0,
    groupCount: eventGroups?.length || 0,
    registrationCount: eventRegistrations?.length || 0,
    isLoading: loading,
    hasError: !!error,
    errorMessage: error,
  };
};

export default useTournamentDataDebug;
