import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  Tournament,
  TournamentsQueryParams,
  CreateTournamentRequest,
  TournamentRegistrationRequest,
  // Tournament Event System
  TournamentEvent,
  CreateTournamentEventRequest,
  UpdateTournamentEventRequest,
  GenerateGroupsRequest,
  // Tournament Registration
  RegisterForEventRequest,
  // Tournament Matches
  CreateTournamentMatchRequest,
  RecordMatchResultRequest,
  // Tournament Groups
  // Tournament Standings
  // Penalties
  CreatePenaltyRequest,
  AppealPenaltyRequest,
  ReviewPenaltyAppealRequest,
  // API Response Types
  TournamentResponse,
  TournamentEventsResponse,
  TournamentsResponse,
  // Eligibility
} from '../../types/api';
import { api } from '../../lib/api';

interface TournamentsState {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  upcomingTournaments: Tournament[];
  federationTournaments: any[]; // Federation/admin level tournaments for calendar

  // Tournament Event System
  tournamentEvents: TournamentEvent[];
  currentEvent: TournamentEvent | null;

  // Tournament Registrations
  eventRegistrations: any[];

  // Tournament Matches
  eventMatches: any[];

  // Tournament Groups
  eventGroups: any[];
  groupStandings: any[];

  // Penalties
  penalties: any[];
  userPenalties: any[];

  // Player Eligibility
  eligibilityResult: any | null;

  // Organizer Dashboard
  preStartDashboard: any | null;

  // State Approval
  pendingApprovals: any[];
  approvalAuditTrail: any | null;

  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

const initialState: TournamentsState = {
  tournaments: [],
  currentTournament: null,
  upcomingTournaments: [],
  federationTournaments: [], // Federation/admin tournaments

  // Tournament Event System
  tournamentEvents: [],
  currentEvent: null,

  // Tournament Registrations
  eventRegistrations: [],

  // Tournament Matches
  eventMatches: [],

  // Tournament Groups
  eventGroups: [],
  groupStandings: [],

  // Penalties
  penalties: [],
  userPenalties: [],

  // Player Eligibility
  eligibilityResult: null,

  // Organizer Dashboard
  preStartDashboard: null,

  // State Approval
  pendingApprovals: [],
  approvalAuditTrail: null,

  loading: false,
  error: null,
  pagination: null,
};

export const fetchTournaments = createAsyncThunk(
  'tournaments/fetchTournaments',
  async (params: TournamentsQueryParams) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return await api.get(`/tournaments?${queryString}`);
  },
);

export const fetchUpcomingTournaments = createAsyncThunk(
  'tournaments/fetchUpcomingTournaments',
  async (limit: number = 5) => {
    const data = await api.get(`/tournaments/upcoming?limit=${limit}`);
    return data || [];
  },
);

// Fetch federation/admin level tournaments for calendar view
export const fetchFederationTournaments = createAsyncThunk(
  'tournaments/fetchFederationTournaments',
  async (params?: { status?: string; state?: string; page?: number; limit?: number }) => {
    const queryParams = {
      ...params,
      // Filter only federation and admin level tournaments
    };
    const queryString = new URLSearchParams(queryParams as Record<string, string>).toString();
    return await api.get(`/tournaments?${queryString}`);
  },
);

export const fetchTournament = createAsyncThunk(
  'tournaments/fetchTournament',
  async (id: string) => {
    const response = (await api.get(`/tournaments/${id}`)) as TournamentResponse;
    return response.data;
  },
);

export const createTournament = createAsyncThunk(
  'tournaments/createTournament',
  async (tournamentData: CreateTournamentRequest) => {
    return await api.post('/tournaments', tournamentData);
  },
);

export const registerForTournament = createAsyncThunk(
  'tournaments/registerForTournament',
  async ({
    tournamentId,
    registrationData,
  }: {
    tournamentId: string;
    registrationData: TournamentRegistrationRequest;
  }) => {
    const data = await api.post(`/tournaments/${tournamentId}/register`, registrationData);
    return { tournamentId, registration: data };
  },
);

// Delete a tournament
export const deleteTournament = createAsyncThunk(
  'tournaments/deleteTournament',
  async (tournamentId: string) => {
    await api.delete(`/tournaments/${tournamentId}`);
    return tournamentId;
  },
);

// Update tournament details
export const updateTournamentDetails = createAsyncThunk(
  'tournaments/updateTournamentDetails',
  async ({ id, updates }: { id: string; updates: Partial<any> }) => {
    const data = await api.put(`/tournaments/${id}`, updates);
    return data;
  },
);

// Update only tournament status
export const updateTournamentStatus = createAsyncThunk(
  'tournaments/updateTournamentStatus',
  async ({ id, status }: { id: string; status: string }) => {
    const data = await api.put(`/tournaments/${id}`, { status });
    return data;
  },
);

// Approve tournament (state committee)
export const approveTournament = createAsyncThunk(
  'tournaments/approveTournament',
  async ({ id, rejectionReason }: { id: string; rejectionReason?: string }) => {
    return await api.put(`/tournaments/${id}/approve`, {
      rejection_reason: rejectionReason,
    });
  },
);

// Publish tournament (federation)
export const publishTournament = createAsyncThunk(
  'tournaments/publishTournament',
  async (id: string) => {
    return await api.put(`/tournaments/${id}/publish`, {});
  },
);

// Start tournament
export const startTournament = createAsyncThunk(
  'tournaments/startTournament',
  async ({
    id,
    params = {},
  }: {
    id: string;
    params?: { generateGroups?: boolean; generateBrackets?: boolean };
  }) => {
    const response = (await api.post(`/tournaments/${id}/start`, params)) as TournamentResponse;
    return response.data;
  },
);

// Fetch tournaments by status (state/federationFEDMEX)
export const fetchPendingTournaments = createAsyncThunk(
  'tournaments/fetchPendingTournaments',
  async (params: { state?: string; limit?: number; page?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.state) queryParams.append('state', params.state);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.status) queryParams.append('status', params.status);
    const queryString = queryParams.toString();
    const url = `/tournaments/pending${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<TournamentsResponse>(url);
    console.log('[fetchPendingTournaments] Response:', response);
    return response.data;
  },
);

// Fetch all tournaments for a state (all statuses) - for frontend filtering
export const fetchTournamentsByState = createAsyncThunk(
  'tournaments/fetchTournamentsByState',
  async (params: { state?: string; limit?: number; page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params.state) queryParams.append('state', params.state);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    const queryString = queryParams.toString();
    const url = `/tournaments/by-state${queryString ? `?${queryString}` : ''}`;
    const data = await api.get(url);
    console.log('[fetchTournamentsByState] Response:', data);
    return data;
  },
);

// ============================================================================
// TOURNAMENT EVENT SYSTEM ASYNC THUNKS
// ============================================================================

export const fetchTournamentEvents = createAsyncThunk(
  'tournaments/fetchTournamentEvents',
  async ({
    tournamentId,
    params,
  }: {
    tournamentId: string;
    params?: { status?: string; skill_block?: string; modality?: string };
  }) => {
    const queryString = params
      ? new URLSearchParams(params as Record<string, string>).toString()
      : '';
    const url = `/tournaments/${tournamentId}/events${queryString ? `?${queryString}` : ''}`;
    const response = (await api.get(url)) as TournamentEventsResponse;
    return (response as any)?.events;
  },
);

export const fetchTournamentEvent = createAsyncThunk(
  'tournaments/fetchTournamentEvent',
  async ({ tournamentId, eventId }: { tournamentId: string; eventId: string }) => {
    return await api.get(`/tournaments/${tournamentId}/events/${eventId}`);
  },
);

export const createTournamentEvent = createAsyncThunk(
  'tournaments/createTournamentEvent',
  async ({
    tournamentId,
    eventData,
  }: {
    tournamentId: string;
    eventData: CreateTournamentEventRequest;
  }) => {
    return await api.post(`/tournaments/${tournamentId}/events`, eventData);
  },
);

export const updateTournamentEvent = createAsyncThunk(
  'tournaments/updateTournamentEvent',
  async ({
    tournamentId,
    eventId,
    eventData,
  }: {
    tournamentId: string;
    eventId: string;
    eventData: UpdateTournamentEventRequest;
  }) => {
    return await api.put(`/tournaments/${tournamentId}/events/${eventId}`, eventData);
  },
);

export const deleteTournamentEvent = createAsyncThunk(
  'tournaments/deleteTournamentEvent',
  async ({ tournamentId, eventId }: { tournamentId: string; eventId: string }) => {
    return await api.delete(`/tournaments/${tournamentId}/events/${eventId}`);
  },
);

export const generateGroups = createAsyncThunk(
  'tournaments/generateGroups',
  async ({
    tournamentId,
    eventId,
    params,
  }: {
    tournamentId: string;
    eventId: string;
    params?: GenerateGroupsRequest;
  }) => {
    const queryString = params?.force ? '?force=true' : '';
    return await api.post(
      `/tournaments/${tournamentId}/events/${eventId}/generate-groups${queryString}`,
      {},
    );
  },
);

export const fetchEventStandings = createAsyncThunk(
  'tournaments/fetchEventStandings',
  async ({ tournamentId, eventId }: { tournamentId: string; eventId: string }) => {
    return await api.get(`/tournaments/${tournamentId}/events/${eventId}/standings`);
  },
);

// ============================================================================
// TOURNAMENT REGISTRATION ASYNC THUNKS
// ============================================================================

export const registerForEvent = createAsyncThunk(
  'tournaments/registerForEvent',
  async ({
    tournamentId,
    eventId,
    registrationData,
  }: {
    tournamentId: string;
    eventId: string;
    registrationData: RegisterForEventRequest;
  }) => {
    return await api.post(
      `/tournaments/${tournamentId}/events/${eventId}/register`,
      registrationData,
    );
  },
);

export const fetchEventRegistrations = createAsyncThunk(
  'tournaments/fetchEventRegistrations',
  async ({
    tournamentId,
    eventId,
    params,
  }: {
    tournamentId: string;
    eventId: string;
    params?: { status?: string };
  }) => {
    const queryString = params?.status ? `?status=${params.status}` : '';
    return await api.get(
      `/tournaments/${tournamentId}/events/${eventId}/registrations${queryString}`,
    );
  },
);

export const fetchAvailablePartners = createAsyncThunk(
  'tournaments/fetchAvailablePartners',
  async ({
    tournamentId,
    eventId,
    userId,
  }: {
    tournamentId: string;
    eventId: string;
    userId: string;
  }) => {
    const queryString = `?user_id=${userId}&event_id=${eventId}`;
    return await api.get(`/tournaments/${tournamentId}/available-partners${queryString}`);
  },
);

export const fetchEventRegistration = createAsyncThunk(
  'tournaments/fetchEventRegistration',
  async ({
    tournamentId,
    eventId,
    registrationId,
  }: {
    tournamentId: string;
    eventId: string;
    registrationId: string;
  }) => {
    return await api.get(
      `/tournaments/${tournamentId}/events/${eventId}/registrations/${registrationId}`,
    );
  },
);

export const updateEventRegistration = createAsyncThunk(
  'tournaments/updateEventRegistration',
  async ({
    tournamentId,
    eventId,
    registrationId,
    groupId,
  }: {
    tournamentId: string;
    eventId: string;
    registrationId: string;
    groupId: string | null;
  }) => {
    return await api.put(
      `/tournaments/${tournamentId}/events/${eventId}/registrations/${registrationId}`,
      { group_id: groupId },
    );
  },
);

export const withdrawFromEvent = createAsyncThunk(
  'tournaments/withdrawFromEvent',
  async ({
    tournamentId,
    eventId,
    registrationId,
    reason,
  }: {
    tournamentId: string;
    eventId: string;
    registrationId: string;
    reason?: string;
  }) => {
    return await api.delete(
      `/tournaments/${tournamentId}/events/${eventId}/registrations/${registrationId}`,
    );
  },
);

// ============================================================================
// TOURNAMENT MATCHES ASYNC THUNKS
// ============================================================================

export const createTournamentMatch = createAsyncThunk(
  'tournaments/createTournamentMatch',
  async ({
    tournamentId,
    eventId,
    matchData,
  }: {
    tournamentId: string;
    eventId: string;
    matchData: CreateTournamentMatchRequest;
  }) => {
    return await api.post(`/tournaments/${tournamentId}/events/${eventId}/matches`, matchData);
  },
);

export const fetchEventMatches = createAsyncThunk(
  'tournaments/fetchEventMatches',
  async ({
    tournamentId,
    eventId,
    params,
  }: {
    tournamentId: string;
    eventId: string;
    params?: { group_id?: string; status?: string };
  }) => {
    const queryString = params
      ? new URLSearchParams(params as Record<string, string>).toString()
      : '';
    const url = `/tournaments/${tournamentId}/events/${eventId}/matches${queryString ? `?${queryString}` : ''}`;
    return await api.get(url);
  },
);

export const recordMatchResult = createAsyncThunk(
  'tournaments/recordMatchResult',
  async ({ matchId, resultData }: { matchId: string; resultData: RecordMatchResultRequest }) => {
    return await api.put(`/matches/${matchId}`, resultData);
  },
);

// ============================================================================
// TOURNAMENT GROUPS ASYNC THUNKS
// ============================================================================

export const fetchEventGroups = createAsyncThunk(
  'tournaments/fetchEventGroups',
  async ({
    tournamentId,
    eventId,
    params,
  }: {
    tournamentId: string;
    eventId: string;
    params?: { status?: string };
  }) => {
    const queryString = params?.status ? `?status=${params.status}` : '';
    return await api.get(`/tournaments/${tournamentId}/events/${eventId}/groups${queryString}`);
  },
);

export const fetchEventGroup = createAsyncThunk(
  'tournaments/fetchEventGroup',
  async ({
    tournamentId,
    eventId,
    groupId,
  }: {
    tournamentId: string;
    eventId: string;
    groupId: string;
  }) => {
    return await api.get(`/tournaments/${tournamentId}/events/${eventId}/groups/${groupId}`);
  },
);

export const updateEventGroup = createAsyncThunk(
  'tournaments/updateEventGroup',
  async ({
    tournamentId,
    eventId,
    groupId,
    status,
  }: {
    tournamentId: string;
    eventId: string;
    groupId: string;
    status: 'in_progress' | 'completed';
  }) => {
    return await api.put(`/tournaments/${tournamentId}/events/${eventId}/groups/${groupId}`, {
      status,
    });
  },
);

export const fetchGroupMatches = createAsyncThunk(
  'tournaments/fetchGroupMatches',
  async ({
    tournamentId,
    eventId,
    groupId,
    params,
  }: {
    tournamentId: string;
    eventId: string;
    groupId: string;
    params?: { status?: string };
  }) => {
    const queryString = params?.status ? `?status=${params.status}` : '';
    return await api.get(
      `/tournaments/${tournamentId}/events/${eventId}/groups/${groupId}/matches${queryString}`,
    );
  },
);

export const fetchGroupSeeding = createAsyncThunk(
  'tournaments/fetchGroupSeeding',
  async ({
    tournamentId,
    eventId,
    groupId,
  }: {
    tournamentId: string;
    eventId: string;
    groupId: string;
  }) => {
    return await api.get(
      `/tournaments/${tournamentId}/events/${eventId}/groups/${groupId}/seeding`,
    );
  },
);

export const finalizeGroup = createAsyncThunk(
  'tournaments/finalizeGroup',
  async ({
    tournamentId,
    eventId,
    groupId,
  }: {
    tournamentId: string;
    eventId: string;
    groupId: string;
  }) => {
    return await api.post(
      `/tournaments/${tournamentId}/events/${eventId}/groups/${groupId}/finalize`,
      {},
    );
  },
);

// ============================================================================
// PENALTIES SYSTEM ASYNC THUNKS
// ============================================================================

export const fetchPenalties = createAsyncThunk(
  'tournaments/fetchPenalties',
  async (params?: { status?: string; type?: string; severity?: string; user_id?: string }) => {
    const queryString = params
      ? new URLSearchParams(params as Record<string, string>).toString()
      : '';
    const url = `/penalties${queryString ? `?${queryString}` : ''}`;
    return await api.get(url);
  },
);

export const createPenalty = createAsyncThunk(
  'tournaments/createPenalty',
  async (penaltyData: CreatePenaltyRequest) => {
    return await api.post('/penalties', penaltyData);
  },
);

export const fetchPenalty = createAsyncThunk(
  'tournaments/fetchPenalty',
  async (penaltyId: string) => {
    return await api.get(`/penalties/${penaltyId}`);
  },
);

export const fetchUserPenalties = createAsyncThunk(
  'tournaments/fetchUserPenalties',
  async ({ userId, params }: { userId: string; params?: { status?: string } }) => {
    const queryString = params?.status ? `?status=${params.status}` : '';
    return await api.get(`/users/${userId}/penalties${queryString}`);
  },
);

export const appealPenalty = createAsyncThunk(
  'tournaments/appealPenalty',
  async ({ penaltyId, appealData }: { penaltyId: string; appealData: AppealPenaltyRequest }) => {
    return await api.post(`/penalties/${penaltyId}/appeal`, appealData);
  },
);

export const reviewPenaltyAppeal = createAsyncThunk(
  'tournaments/reviewPenaltyAppeal',
  async ({
    penaltyId,
    reviewData,
  }: {
    penaltyId: string;
    reviewData: ReviewPenaltyAppealRequest;
  }) => {
    return await api.put(`/penalties/${penaltyId}/review`, reviewData);
  },
);

export const deletePenalty = createAsyncThunk(
  'tournaments/deletePenalty',
  async (penaltyId: string) => {
    return await api.delete(`/penalties/${penaltyId}`);
  },
);

// ============================================================================
// ELIGIBILITY CHECK ASYNC THUNKS
// ============================================================================

export const checkRegistrationEligibility = createAsyncThunk(
  'tournaments/checkRegistrationEligibility',
  async (userId: string) => {
    return await api.get(`/users/${userId}/eligibility`);
  },
);

// ============================================================================
// PLAYER ELIGIBILITY CHECK ASYNC THUNKS
// ============================================================================

export const checkEventEligibility = createAsyncThunk(
  'tournaments/checkEventEligibility',
  async ({
    eventId,
    userId,
    partnerId,
  }: {
    eventId: string;
    userId: string;
    partnerId?: string;
  }) => {
    const params = new URLSearchParams({
      user_id: userId,
      ...(partnerId && { partner_id: partnerId }),
    });
    return await api.get(`/tournaments/registrations/check-eligibility?${params}`);
  },
);

// ============================================================================
// ORGANIZER PRE-START DASHBOARD ASYNC THUNKS
// ============================================================================

export const fetchTournamentPreStartDashboard = createAsyncThunk(
  'tournaments/fetchTournamentPreStartDashboard',
  async (tournamentId: string) => {
    return await api.get(`/tournaments/${tournamentId}/pre-start-dashboard`);
  },
);

const tournamentsSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTournament: (state, action) => {
      state.currentTournament = action.payload;
    },
    setCurrentEvent: (state, action) => {
      state.currentEvent = action.payload;
    },
    clearTournaments: (state) => {
      state.tournaments = [];
      state.pagination = null;
    },
    clearTournamentEvents: (state) => {
      state.tournamentEvents = [];
    },
    clearEventRegistrations: (state) => {
      state.eventRegistrations = [];
    },
    clearEventMatches: (state) => {
      state.eventMatches = [];
    },
    clearEventGroups: (state) => {
      state.eventGroups = [];
    },
    clearPenalties: (state) => {
      state.penalties = [];
      state.userPenalties = [];
    },
    clearEligibilityResult: (state) => {
      state.eligibilityResult = null;
    },
    clearPreStartDashboard: (state) => {
      state.preStartDashboard = null;
    },
    clearPendingApprovals: (state) => {
      state.pendingApprovals = [];
    },
    clearApprovalAuditTrail: (state) => {
      state.approvalAuditTrail = null;
    },
    addTournament: (state, action) => {
      state.tournaments.unshift(action.payload);
    },
    updateTournament: (state, action) => {
      const index = state.tournaments.findIndex(
        (tournament) => tournament.id === action.payload.id,
      );
      if (index !== -1) {
        state.tournaments[index] = action.payload;
      }
      if (state.currentTournament && state.currentTournament.id === action.payload.id) {
        state.currentTournament = action.payload;
      }
    },
    addTournamentEvent: (state, action) => {
      state.tournamentEvents.unshift(action.payload);
    },
    updateTournamentEventAction: (state, action) => {
      const index = state.tournamentEvents.findIndex((event) => event.id === action.payload.id);
      if (index !== -1) {
        state.tournamentEvents[index] = action.payload;
      }
      if (state.currentEvent && state.currentEvent.id === action.payload.id) {
        state.currentEvent = action.payload;
      }
    },
    removeTournamentEvent: (state, action) => {
      state.tournamentEvents = state.tournamentEvents.filter(
        (event) => event.id !== action.payload,
      );
      if (state.currentEvent && state.currentEvent.id === action.payload) {
        state.currentEvent = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tournaments
      .addCase(fetchTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournaments.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.tournaments = payload?.data?.data || []; // Fix: access nested data.data
        state.pagination = payload?.pagination || null;
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tournaments';
      })
      // Fetch Upcoming Tournaments
      .addCase(fetchUpcomingTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingTournaments.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.upcomingTournaments = payload || [];
      })
      .addCase(fetchUpcomingTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch upcoming tournaments';
      })
      // Fetch Tournament
      .addCase(fetchTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournament.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.currentTournament = action.payload;
        }
      })
      .addCase(fetchTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tournament';
      })
      // Fetch Federation Tournaments
      .addCase(fetchFederationTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFederationTournaments.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        // Filter for federation and admin level tournaments
        const federationData = payload?.data?.data || [];
        state.federationTournaments = federationData.filter(
          (t: any) => t.organizer_type === 'admin' || t.organizer_type === 'state',
        );
      })
      .addCase(fetchFederationTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch federation tournaments';
      })
      // Create Tournament
      .addCase(createTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTournament.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload) {
          state.tournaments.unshift(payload);
          state.currentTournament = payload;
        }
      })
      .addCase(createTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create tournament';
      })
      // Register for Tournament
      .addCase(registerForTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerForTournament.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        // Update current tournament if it's the same tournament
        if (state.currentTournament && state.currentTournament.id === payload.tournamentId) {
          state.currentTournament = {
            ...state.currentTournament,
            current_participants: state.currentTournament.current_participants + 1,
          };
        }
        // Update tournament in tournaments array if exists
        const index = state.tournaments.findIndex((t) => t.id === payload.tournamentId);
        if (index !== -1) {
          state.tournaments[index] = {
            ...state.tournaments[index],
            current_participants: state.tournaments[index].current_participants + 1,
          };
        }
      })
      // Delete Tournament
      .addCase(deleteTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTournament.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload as string;
        state.tournaments = state.tournaments.filter((t) => t.id !== id);
        if (state.currentTournament && state.currentTournament.id === id) {
          state.currentTournament = null;
        }
      })
      .addCase(deleteTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete tournament';
      })
      // Update Tournament Details
      .addCase(updateTournamentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTournamentDetails.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (!payload) return;
        const index = state.tournaments.findIndex((t) => t.id === payload.id);
        if (index !== -1) {
          state.tournaments[index] = payload;
        }
        if (state.currentTournament && state.currentTournament.id === payload.id) {
          state.currentTournament = payload;
        }
      })
      .addCase(updateTournamentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update tournament';
      })
      // Update Tournament Status
      .addCase(updateTournamentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTournamentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (!payload) return;
        const index = state.tournaments.findIndex((t) => t.id === payload.id);
        if (index !== -1) {
          state.tournaments[index] = payload;
        }
        if (state.currentTournament && state.currentTournament.id === payload.id) {
          state.currentTournament = payload;
        }
      })
      .addCase(updateTournamentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update tournament status';
      })
      // Approve Tournament
      .addCase(approveTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveTournament.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (!payload) return;
        const tournament = payload.data?.tournament || payload.tournament || payload;
        console.log('[approveTournament.fulfilled] Tournament:', tournament);
        const index = state.tournaments.findIndex((t) => t.id === tournament.id);
        if (index !== -1) {
          state.tournaments[index] = tournament;
        }
        if (state.currentTournament && state.currentTournament.id === tournament.id) {
          state.currentTournament = tournament;
        }
        // Remove from pending approvals
        state.pendingApprovals = state.pendingApprovals.filter((t: any) => t.id !== tournament.id);
      })
      .addCase(approveTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to approve tournament';
      })
      // Publish Tournament
      .addCase(publishTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishTournament.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (!payload) return;
        const tournament = payload.tournament || payload;
        const index = state.tournaments.findIndex((t) => t.id === tournament.id);
        if (index !== -1) {
          state.tournaments[index] = tournament;
        }
        if (state.currentTournament && state.currentTournament.id === tournament.id) {
          state.currentTournament = tournament;
        }
        // Remove from pending if it was pending
        state.pendingApprovals = state.pendingApprovals.filter((t: any) => t.id !== tournament.id);
      })
      .addCase(publishTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to publish tournament';
      })
      // Start Tournament
      .addCase(startTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTournament.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (!payload) return;
        const tournament = payload.data || payload;
        const index = state.tournaments.findIndex((t) => t.id === tournament.id);
        if (index !== -1) {
          state.tournaments[index] = tournament;
        }
        if (state.currentTournament && state.currentTournament.id === tournament.id) {
          state.currentTournament = tournament;
        }
      })
      .addCase(startTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to start tournament';
      })
      // Fetch Pending Tournaments
      .addCase(fetchPendingTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingTournaments.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        console.log('[fetchPendingTournaments] Full payload:', payload);
        // API returns { success, data: [...], pagination: {...} }
        state.pendingApprovals = Array.isArray(payload?.data) ? payload.data : [];
        state.pagination = payload?.pagination || null;
        console.log('[fetchPendingTournaments] pendingApprovals set to:', state.pendingApprovals);
      })
      .addCase(fetchPendingTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pending tournaments';
      })
      // Fetch Tournaments By State (all statuses)
      .addCase(fetchTournamentsByState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournamentsByState.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        console.log('[fetchTournamentsByState] Full payload:', payload);
        // API returns { success, data: { tournaments: [...], total, pages, currentPage } }
        state.pendingApprovals = Array.isArray(payload?.data?.tournaments)
          ? payload.data.tournaments
          : [];
        state.pagination = payload?.data || null;
        console.log('[fetchTournamentsByState] pendingApprovals set to:', state.pendingApprovals);
      })
      .addCase(fetchTournamentsByState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tournaments by state';
      })
      .addCase(registerForTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to register for tournament';
      });

    // ============================================================================
    // TOURNAMENT EVENT SYSTEM EXTRA REDUCERS
    // ============================================================================

    // Fetch Tournament Events
    builder
      .addCase(fetchTournamentEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournamentEvents.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        console.log('fetchTournamentEvents payload:', payload);

        // Handle multiple possible response structures
        let events: any[] = [];
        if (Array.isArray(payload)) {
          events = payload;
        } else if (payload?.data?.events && Array.isArray(payload.data.events)) {
          events = payload.data.events;
        } else if (payload?.data && Array.isArray(payload.data)) {
          events = payload.data;
        } else if (payload?.events && Array.isArray(payload.events)) {
          events = payload.events;
        }

        console.log('Extracted events:', events);
        state.tournamentEvents = events;
      })
      .addCase(fetchTournamentEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tournament events';
        console.error('fetchTournamentEvents rejected:', action.error.message);
        state.tournamentEvents = []; // Clear events on error
      })
      // Fetch Tournament Event
      .addCase(fetchTournamentEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournamentEvent.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data) {
          state.currentEvent = payload.data;
        }
      })
      .addCase(fetchTournamentEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tournament event';
      })
      // Create Tournament Event
      .addCase(createTournamentEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTournamentEvent.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data) {
          state.tournamentEvents.unshift(payload.data);
          state.currentEvent = payload.data;
        }
      })
      .addCase(createTournamentEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create tournament event';
      })
      // Update Tournament Event
      .addCase(updateTournamentEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTournamentEvent.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data) {
          const index = state.tournamentEvents.findIndex((event) => event.id === payload.data.id);
          if (index !== -1) {
            state.tournamentEvents[index] = payload.data;
          }
          if (state.currentEvent && state.currentEvent.id === payload.data.id) {
            state.currentEvent = payload.data;
          }
        }
      })
      .addCase(updateTournamentEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update tournament event';
      })
      // Delete Tournament Event
      .addCase(deleteTournamentEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTournamentEvent.fulfilled, (state, action) => {
        state.loading = false;
        const { eventId } = action.meta.arg;
        state.tournamentEvents = state.tournamentEvents.filter((event) => event.id !== eventId);
        if (state.currentEvent && state.currentEvent.id === eventId) {
          state.currentEvent = null;
        }
      })
      .addCase(deleteTournamentEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete tournament event';
      })
      // Generate Groups
      .addCase(generateGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateGroups.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        // Update current event to reflect groups generated
        if (state.currentEvent) {
          state.currentEvent.groupsGenerated = true;
          state.currentEvent.groupCount = payload?.groupCount || 0;
        }
      })
      .addCase(generateGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to generate groups';
      })
      // Fetch Event Standings
      .addCase(fetchEventStandings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventStandings.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.groupStandings = payload?.data?.standings || [];
      })
      .addCase(fetchEventStandings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch event standings';
      });

    // ============================================================================
    // TOURNAMENT REGISTRATION EXTRA REDUCERS
    // ============================================================================

    // Register for Event
    builder
      .addCase(registerForEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.loading = false;
        // Update current event participant count
        if (state.currentEvent) {
          state.currentEvent.participantCount += 1;
        }
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to register for event';
      })
      // Fetch Event Registrations
      .addCase(fetchEventRegistrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventRegistrations.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        console.log('fetchEventRegistrations payload:', payload);

        // Handle multiple possible response structures
        let registrations: any[] = [];
        if (Array.isArray(payload)) {
          registrations = payload;
        } else if (payload?.data?.registrations && Array.isArray(payload.data.registrations)) {
          registrations = payload.data.registrations;
        } else if (payload?.registrations && Array.isArray(payload.registrations)) {
          registrations = payload.registrations;
        } else if (payload?.data && Array.isArray(payload.data)) {
          registrations = payload.data;
        }

        console.log('Extracted registrations:', registrations);
        state.eventRegistrations = registrations;
      })
      .addCase(fetchEventRegistrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch event registrations';
        console.error('fetchEventRegistrations rejected:', action.error.message, action.payload);
        state.eventRegistrations = [];
      });

    // ============================================================================
    // TOURNAMENT MATCHES EXTRA REDUCERS
    // ============================================================================

    // Create Tournament Match
    builder
      .addCase(createTournamentMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTournamentMatch.fulfilled, (state, action) => {
        state.loading = false;
        // Match created successfully
      })
      .addCase(createTournamentMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create tournament match';
      })
      // Fetch Event Matches
      .addCase(fetchEventMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventMatches.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.eventMatches = payload?.data?.matches || [];
      })
      .addCase(fetchEventMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch event matches';
      })
      // Record Match Result
      .addCase(recordMatchResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordMatchResult.fulfilled, (state, action) => {
        state.loading = false;
        // Match result recorded successfully
      })
      .addCase(recordMatchResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to record match result';
      });

    // ============================================================================
    // TOURNAMENT GROUPS EXTRA REDUCERS
    // ============================================================================

    // Fetch Event Groups
    builder
      .addCase(fetchEventGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventGroups.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        console.log('[fetchEventGroups] Raw payload:', payload);

        let groups: any[] = [];

        // PRIORITY ORDER (based on actual response structure):
        // Option A: { data: { success, groupCount, groups } } - WRAPPED BY AXIOS
        if (payload?.data?.groups && Array.isArray(payload.data.groups)) {
          groups = payload.data.groups;
          console.log('[fetchEventGroups] ✓ Using Option A: payload.data.groups');
        }
        // Fallback: { success, groupCount, groups } - Direct response
        else if (payload?.groups && Array.isArray(payload.groups)) {
          groups = payload.groups;
          console.log('[fetchEventGroups] ✓ Using Fallback: payload.groups');
        }
        // Fallback: Direct array
        else if (Array.isArray(payload)) {
          groups = payload;
          console.log('[fetchEventGroups] ✓ Using Fallback: Direct array');
        }

        console.log('[fetchEventGroups] ✓ Extracted', groups.length, 'groups');
        console.log('[fetchEventGroups] Groups data:', groups);
        state.eventGroups = groups;
      })
      .addCase(fetchEventGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch event groups';
        state.eventGroups = [];
      })
      // Fetch Single Event Group
      .addCase(fetchEventGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventGroup.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;

        console.log('[fetchEventGroup] Payload received:', payload);

        // Extract standings from the API response
        let standings = [];
        if (payload?.data?.standings && Array.isArray(payload.data.standings)) {
          console.log('[fetchEventGroup] ✓ Using payload.data.standings');
          standings = payload.data.standings.map((s: any) => ({
            position: s.position,
            userId: s.userId,
            userName: s.playerName,
            matchesWon: s.matchesWon,
            matchesLost: s.matchesLost,
            setsWon: s.setsWon,
            setsLost: s.setsLost,
            pointsFor: s.pointsFor,
            pointsAgainst: s.pointsAgainst,
            rankingPoints: s.rankingPoints || 0,
            qualified: s.qualified,
          }));
        } else if (payload?.standings && Array.isArray(payload.standings)) {
          console.log('[fetchEventGroup] ✓ Using payload.standings');
          standings = payload.standings.map((s: any) => ({
            position: s.position,
            userId: s.userId,
            userName: s.playerName,
            matchesWon: s.matchesWon,
            matchesLost: s.matchesLost,
            setsWon: s.setsWon,
            setsLost: s.setsLost,
            pointsFor: s.pointsFor,
            pointsAgainst: s.pointsAgainst,
            rankingPoints: s.rankingPoints || 0,
            qualified: s.qualified,
          }));
        } else {
          console.warn('[fetchEventGroup] No standings found in payload:', payload);
        }

        console.log('[fetchEventGroup] ✓ Transformed standings:', standings);
        state.groupStandings = standings;
      })
      .addCase(fetchEventGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch event group';
      })
      // Update Event Group
      .addCase(updateEventGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEventGroup.fulfilled, (state, action) => {
        state.loading = false;
        const { groupId, status } = action.meta.arg;
        const group = state.eventGroups.find((g) => g.id === groupId);
        if (group) {
          group.status = status;
        }
      })
      .addCase(updateEventGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update event group';
      })
      // Finalize Group
      .addCase(finalizeGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(finalizeGroup.fulfilled, (state, action) => {
        state.loading = false;
        const { groupId } = action.meta.arg;
        const group = state.eventGroups.find((g) => g.id === groupId);
        if (group) {
          group.status = 'completed';
        }
      })
      .addCase(finalizeGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to finalize group';
      });

    // ============================================================================
    // PENALTIES SYSTEM EXTRA REDUCERS
    // ============================================================================

    // Fetch Penalties
    builder
      .addCase(fetchPenalties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPenalties.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.penalties = payload?.data?.penalties || [];
      })
      .addCase(fetchPenalties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch penalties';
      })
      // Create Penalty
      .addCase(createPenalty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPenalty.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data) {
          state.penalties.unshift(payload.data);
        }
      })
      .addCase(createPenalty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create penalty';
      })
      // Fetch User Penalties
      .addCase(fetchUserPenalties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPenalties.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.userPenalties = payload?.data?.penalties || [];
      })
      .addCase(fetchUserPenalties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user penalties';
      })
      // Appeal Penalty
      .addCase(appealPenalty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(appealPenalty.fulfilled, (state, action) => {
        state.loading = false;
        const { penaltyId } = action.meta.arg;
        const penalty = state.penalties.find((p) => p.id === penaltyId);
        if (penalty) {
          penalty.appealStatus = 'pending';
        }
      })
      .addCase(appealPenalty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to appeal penalty';
      })
      // Review Penalty Appeal
      .addCase(reviewPenaltyAppeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reviewPenaltyAppeal.fulfilled, (state, action) => {
        state.loading = false;
        const { penaltyId, reviewData } = action.meta.arg;
        const penalty = state.penalties.find((p) => p.id === penaltyId);
        if (penalty) {
          penalty.appealStatus = reviewData.decision;
          penalty.status = reviewData.decision === 'overturned' ? 'expired' : penalty.status;
        }
      })
      .addCase(reviewPenaltyAppeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to review penalty appeal';
      })
      // Delete Penalty
      .addCase(deletePenalty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePenalty.fulfilled, (state, action) => {
        state.loading = false;
        const penaltyId = action.meta.arg;
        state.penalties = state.penalties.filter((p) => p.id !== penaltyId);
      })
      .addCase(deletePenalty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete penalty';
      });

    // ============================================================================
    // ELIGIBILITY CHECK EXTRA REDUCERS
    // ============================================================================
    // ELIGIBILITY CHECK EXTRA REDUCERS
    // ============================================================================

    // Check Registration Eligibility
    builder
      .addCase(checkRegistrationEligibility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkRegistrationEligibility.fulfilled, (state, action) => {
        state.loading = false;
        // Eligibility check completed
      })
      .addCase(checkRegistrationEligibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to check registration eligibility';
      })
      // Check Event Eligibility
      .addCase(checkEventEligibility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkEventEligibility.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.eligibilityResult = payload?.data || null;
      })
      .addCase(checkEventEligibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to check event eligibility';
        state.eligibilityResult = null;
      });

    // ============================================================================
    // ORGANIZER DASHBOARD EXTRA REDUCERS
    // ============================================================================

    builder
      // Fetch Tournament Pre-Start Dashboard
      .addCase(fetchTournamentPreStartDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournamentPreStartDashboard.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.preStartDashboard = payload?.data || null;
      })
      .addCase(fetchTournamentPreStartDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pre-start dashboard';
        state.preStartDashboard = null;
      });
  },
});

export const {
  clearError,
  setCurrentTournament,
  setCurrentEvent,
  clearTournaments,
  clearTournamentEvents,
  clearEventRegistrations,
  clearEventMatches,
  clearEventGroups,
  clearPenalties,
  clearEligibilityResult,
  clearPreStartDashboard,
  clearPendingApprovals,
  clearApprovalAuditTrail,
  addTournament,
  updateTournament,
  addTournamentEvent,
  updateTournamentEventAction,
  removeTournamentEvent,
} = tournamentsSlice.actions;

export default tournamentsSlice.reducer;
