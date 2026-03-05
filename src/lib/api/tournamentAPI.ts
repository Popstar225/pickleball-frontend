/**
 * Tournament API Service
 *
 * This file provides clean, typed API functions for all tournament-related backend calls.
 * These functions are used by Redux thunks to fetch and mutate tournament data.
 *
 * @version 1.0.0
 */

import { api } from '../../lib/api';

/**
 * TOURNAMENT ENDPOINTS
 */
export const tournamentAPI = {
  // List all tournaments with filters
  listTournaments: async (filters?: {
    tournament_type?: string;
    status?: string;
    organizer_type?: string;
    organizer_id?: string;
    state?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryString = filters
      ? new URLSearchParams(filters as Record<string, string>).toString()
      : '';
    return api.get(`/tournaments${queryString ? `?${queryString}` : ''}`);
  },

  // Get single tournament with events included
  getTournament: async (tournamentId: string) => {
    return api.get(`/tournaments/${tournamentId}`);
  },

  // Get tournaments by organizer
  getTournamentsByOrganizer: async (organizerId: string, organizerType: string) => {
    return api.get(`/tournaments?organizer_id=${organizerId}&organizer_type=${organizerType}`);
  },

  // Create new tournament
  createTournament: async (data: any) => {
    return api.post('/tournaments', data);
  },

  // Update tournament
  updateTournament: async (tournamentId: string, data: any) => {
    return api.put(`/tournaments/${tournamentId}`, data);
  },
};

/**
 * TOURNAMENT EVENT ENDPOINTS
 *
 * Events are tournament divisions/categories (e.g., "4.5 Mixed Doubles", "5.0 Singles")
 */
export const tournamentEventAPI = {
  // List all events for a tournament
  listEventsByTournament: async (tournamentId: string) => {
    return api.get(`/tournaments/${tournamentId}/events`);
  },

  // Get single event details with groups
  getEvent: async (tournamentId: string, eventId: string) => {
    return api.get(`/tournaments/${tournamentId}/events/${eventId}`);
  },

  // Create new event in tournament
  createEvent: async (tournamentId: string, data: any) => {
    return api.post(`/tournaments/${tournamentId}/events`, data);
  },

  // Update event
  updateEvent: async (tournamentId: string, eventId: string, data: any) => {
    return api.put(`/tournaments/${tournamentId}/events/${eventId}`, data);
  },

  // Get event registrations
  getEventRegistrations: async (tournamentId: string, eventId: string, filters?: any) => {
    const queryString = filters
      ? new URLSearchParams(filters as Record<string, string>).toString()
      : '';
    return api.get(
      `/tournaments/${tournamentId}/events/${eventId}/registrations${queryString ? `?${queryString}` : ''}`,
    );
  },

  // Get event standings (quick stats)
  getEventStandings: async (tournamentId: string, eventId: string) => {
    return api.get(`/tournaments/${tournamentId}/events/${eventId}/standings`);
  },
};

/**
 * TOURNAMENT GROUP ENDPOINTS
 *
 * Groups are subgroups of players within an event for the group stage.
 * Each group plays round-robin matches, then top players advance to bracket.
 */
export const groupAPI = {
  // List all groups for an event
  listGroupsByEvent: async (
    tournamentId: string,
    eventId: string,
    filters?: { status?: string },
  ) => {
    const queryString = filters?.status ? `?status=${filters.status}` : '';
    return api.get(`/tournaments/${tournamentId}/events/${eventId}/groups${queryString}`);
  },

  // Get single group with standings
  getGroup: async (tournamentId: string, eventId: string, groupId: string) => {
    return api.get(`/tournaments/${tournamentId}/events/${eventId}/groups/${groupId}`);
  },

  // Get group's standalone standings (separate call if needed)
  getGroupStandings: async (tournamentId: string, eventId: string, groupId: string) => {
    return api.get(`/tournaments/${tournamentId}/events/${eventId}/groups/${groupId}/standings`);
  },

  // Generate groups for an event (auto-balance players)
  generateGroups: async (tournamentId: string, eventId: string, options?: { force?: boolean }) => {
    const queryString = options?.force ? '?force=true' : '';
    return api.post(
      `/tournaments/${tournamentId}/events/${eventId}/groups/generate${queryString}`,
      {},
    );
  },

  // Finalize group standings (mark complete, calculate qualifiers)
  finalizeGroup: async (tournamentId: string, eventId: string, groupId: string) => {
    return api.post(
      `/tournaments/${tournamentId}/events/${eventId}/groups/${groupId}/finalize`,
      {},
    );
  },

  // Update group status
  updateGroup: async (
    tournamentId: string,
    eventId: string,
    groupId: string,
    data: { status: string },
  ) => {
    return api.put(`/tournaments/${tournamentId}/events/${eventId}/groups/${groupId}`, data);
  },

  // Get group's matches
  getGroupMatches: async (tournamentId: string, eventId: string, groupId: string) => {
    return api.get(`/tournaments/${tournamentId}/events/${eventId}/groups/${groupId}/matches`);
  },

  // Get group seeding info
  getGroupSeeding: async (tournamentId: string, eventId: string, groupId: string) => {
    return api.get(`/tournaments/${tournamentId}/events/${eventId}/groups/${groupId}/seeding`);
  },
};

/**
 * TOURNAMENT REGISTRATION ENDPOINTS
 *
 * Registrations are player signups for specific events
 */
export const registrationAPI = {
  // Get all registrations for an event
  getEventRegistrations: async (tournamentId: string, eventId: string) => {
    return api.get(`/tournaments/${tournamentId}/events/${eventId}/registrations`);
  },

  // Get single registration
  getRegistration: async (tournamentId: string, eventId: string, registrationId: string) => {
    return api.get(
      `/tournaments/${tournamentId}/events/${eventId}/registrations/${registrationId}`,
    );
  },

  // Register a player for an event
  registerForEvent: async (
    tournamentId: string,
    eventId: string,
    data: { user_id: string; skill_rating?: number; partner_id?: string },
  ) => {
    return api.post(`/tournaments/${tournamentId}/events/${eventId}/register`, data);
  },

  // Update registration (e.g., assign to group)
  updateRegistration: async (
    tournamentId: string,
    eventId: string,
    registrationId: string,
    data: any,
  ) => {
    return api.put(
      `/tournaments/${tournamentId}/events/${eventId}/registrations/${registrationId}`,
      data,
    );
  },

  // Withdraw from event
  withdrawFromEvent: async (tournamentId: string, eventId: string, registrationId: string) => {
    return api.delete(
      `/tournaments/${tournamentId}/events/${eventId}/registrations/${registrationId}`,
    );
  },

  // Get available partners for doubles
  getAvailablePartners: async (tournamentId: string, eventId: string, userId: string) => {
    return api.get(
      `/tournaments/${tournamentId}/events/${eventId}/available-partners?user_id=${userId}`,
    );
  },
};

/**
 * TOURNAMENT MATCH ENDPOINTS
 *
 * Matches are individual games between players
 */
export const matchAPI = {
  // Get all matches for a tournament
  getTournamentMatches: async (tournamentId: string, filters?: any) => {
    const queryString = filters
      ? new URLSearchParams(filters as Record<string, string>).toString()
      : '';
    return api.get(`/tournaments/${tournamentId}/matches${queryString ? `?${queryString}` : ''}`);
  },

  // Get all matches for an event
  getEventMatches: async (
    tournamentId: string,
    eventId: string,
    filters?: { group_id?: string; status?: string },
  ) => {
    const queryString = filters
      ? new URLSearchParams(filters as Record<string, string>).toString()
      : '';
    return api.get(
      `/tournaments/${tournamentId}/events/${eventId}/matches${queryString ? `?${queryString}` : ''}`,
    );
  },

  // Get single match details
  getMatch: async (matchId: string) => {
    return api.get(`/matches/${matchId}`);
  },

  // Create new match
  createMatch: async (
    tournamentId: string,
    eventId: string,
    data: {
      player1_id: string;
      player2_id?: string;
      court_id?: string;
      scheduled_time?: string;
      group_id?: string;
    },
  ) => {
    return api.post(`/tournaments/${tournamentId}/events/${eventId}/matches`, data);
  },

  // Record match result
  recordMatchResult: async (
    matchId: string,
    data: {
      winner_id: string;
      score_player1: number;
      score_player2: number;
      notes?: string;
    },
  ) => {
    return api.put(`/matches/${matchId}`, data);
  },

  // Record match score with detailed sets
  recordScore: async (
    matchId: string,
    data: {
      sets: Array<{
        player1_score: number;
        player2_score: number;
      }>;
    },
  ) => {
    return api.post(`/matches/${matchId}/score`, data);
  },

  // Record special match outcome (walkover, injury, DQ, etc)
  recordSpecialOutcome: async (
    matchId: string,
    data: {
      outcome: 'walkover' | 'injury' | 'dq' | 'withdrawal' | 'retirement';
      reason?: string;
      winner_id?: string;
    },
  ) => {
    return api.post(`/matches/${matchId}/special-outcome`, data);
  },

  // Update match (reschedule, change court, etc)
  updateMatch: async (matchId: string, data: any) => {
    return api.put(`/matches/${matchId}`, data);
  },

  // Cancel match
  cancelMatch: async (matchId: string) => {
    return api.delete(`/matches/${matchId}`);
  },
};

/**
 * TOURNAMENT BRACKET ENDPOINTS
 *
 * Bracket functionality for single elimination phase
 */
export const bracketAPI = {
  // Extract qualifiers from groups (advance top 2 per group)
  extractQualifiers: async (tournamentId: string, eventId: string, groupIds: string[]) => {
    return api.post(`/tournaments/${tournamentId}/events/${eventId}/brackets/qualifiers`, {
      group_ids: groupIds,
    });
  },

  // Get bracket structure
  getBracket: async (tournamentId: string, eventId: string) => {
    return api.get(`/tournaments/${tournamentId}/events/${eventId}/bracket`);
  },

  // Get bracket matches
  getBracketMatches: async (tournamentId: string, eventId: string) => {
    return api.get(`/tournaments/${tournamentId}/events/${eventId}/bracket/matches`);
  },

  // Generate bracket from qualifiers
  generateBracket: async (tournamentId: string, eventId: string, qualifierIds: string[]) => {
    return api.post(`/tournaments/${tournamentId}/events/${eventId}/bracket/generate`, {
      qualifier_ids: qualifierIds,
    });
  },
};

/**
 * HELPER FUNCTION: Fetch all tournament data at once
 *
 * Useful for dashboard initialization
 */
export async function fetchTournamentWithAllData(tournamentId: string) {
  try {
    const tournament = await tournamentAPI.getTournament(tournamentId);
    const events = await tournamentEventAPI.listEventsByTournament(tournamentId);
    const registrations = await registrationAPI.getEventRegistrations(tournamentId, events[0]?.id);

    return {
      tournament,
      events,
      registrations,
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * HELPER FUNCTION: Fetch event with groups and standings
 *
 * Used when viewing a specific event
 */
export async function fetchEventWithGroups(tournamentId: string, eventId: string) {
  try {
    const event = await tournamentEventAPI.getEvent(tournamentId, eventId);
    const groups = await groupAPI.listGroupsByEvent(tournamentId, eventId);
    const matches = await matchAPI.getEventMatches(tournamentId, eventId);
    const registrations = await registrationAPI.getEventRegistrations(tournamentId, eventId);

    return {
      event,
      groups,
      matches,
      registrations,
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * HELPER FUNCTION: Fetch complete group with standings and matches
 */
export async function fetchCompleteGroup(tournamentId: string, eventId: string, groupId: string) {
  try {
    const group = await groupAPI.getGroup(tournamentId, eventId, groupId);
    const standings = await groupAPI.getGroupStandings(tournamentId, eventId, groupId);
    const matches = await groupAPI.getGroupMatches(tournamentId, eventId, groupId);

    return {
      group,
      standings,
      matches,
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
