import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  organizer_type: 'club' | 'state' | 'admin';
  organizer_name: string;
  state: string;
  city: string;
  venue_name: string;
  status:
    | 'draft'
    | 'pending_validation'
    | 'approved'
    | 'rejected'
    | 'published'
    | 'in_progress'
    | 'completed'
    | 'cancelled';
  created_at?: string;
  events?: Array<{
    id: string;
    skill_block: string;
    gender: string;
    modality: string;
    max_participants: number;
    current_participants: number;
    is_active: boolean;
  }>;
}

interface FetchPendingTournamentsParams {
  state?: string;
  limit?: number;
  page?: number;
}

interface TournamentValidationState {
  pendingTournaments: Tournament[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

const initialState: TournamentValidationState = {
  pendingTournaments: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  },
};

/**
 * Async thunk to fetch pending tournaments awaiting validation
 * Filters by user type:
 * - State users: see pending tournaments from clubs in their state
 * - Federation users: see all pending tournaments from states
 */
export const fetchPendingTournaments = createAsyncThunk(
  'tournamentValidation/fetchPendingTournaments',
  async (params: FetchPendingTournamentsParams, { rejectWithValue }) => {
    try {
      let url =
        '/tournaments/pending?limit=' + (params.limit || 50) + '&page=' + (params.page || 1);
      if (params.state) {
        url += '&state=' + params.state;
      }

      const response = await api.get<any>(url);

      // Extract tournaments data from response
      // Backend returns: { success: true, data: { tournaments: [...], total: number, pages: number, currentPage: number } }
      const data = response?.data;
      let tournaments = data?.tournaments || [];

      // Calculate stats
      const stats = {
        total: tournaments.length,
        pending: tournaments.filter((t: any) => t.status === 'pending_validation').length,
        approved: tournaments.filter((t: any) => ['approved', 'state_approved'].includes(t.status))
          .length,
        rejected: tournaments.filter((t: any) => t.status === 'rejected').length,
      };

      return {
        tournaments,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 50,
          total: data?.total || tournaments.length,
          pages: data?.pages || 1,
        },
        stats,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pending tournaments');
    }
  },
);

/**
 * Async thunk to approve a pending tournament
 */
export const approveTournament = createAsyncThunk(
  'tournamentValidation/approveTournament',
  async (payload: { tournamentId: string }, { rejectWithValue }) => {
    try {
      await api.put(`/tournaments/${payload.tournamentId}/approve`, {});
      return payload.tournamentId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to approve tournament');
    }
  },
);

/**
 * Async thunk to reject a pending tournament
 */
export const rejectTournament = createAsyncThunk(
  'tournamentValidation/rejectTournament',
  async (payload: { tournamentId: string; reason: string }, { rejectWithValue }) => {
    try {
      await api.put(`/tournaments/${payload.tournamentId}/reject`, {
        rejection_reason: payload.reason,
      });
      return payload.tournamentId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject tournament');
    }
  },
);

const tournamentValidationSlice = createSlice({
  name: 'tournamentValidation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetPendingTournaments: (state) => {
      state.pendingTournaments = [];
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch Pending Tournaments
    builder
      .addCase(fetchPendingTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingTournaments = action.payload.tournaments;
        state.pagination = action.payload.pagination;
        state.stats = action.payload.stats;
      })
      .addCase(fetchPendingTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Approve Tournament
    builder
      .addCase(approveTournament.pending, (state) => {
        state.error = null;
      })
      .addCase(approveTournament.fulfilled, (state, action) => {
        // Remove approved tournament from list
        state.pendingTournaments = state.pendingTournaments.filter((t) => t.id !== action.payload);
        // Update stats
        state.stats.pending = Math.max(0, state.stats.pending - 1);
        state.stats.approved = state.stats.approved + 1;
      })
      .addCase(approveTournament.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Reject Tournament
    builder
      .addCase(rejectTournament.pending, (state) => {
        state.error = null;
      })
      .addCase(rejectTournament.fulfilled, (state, action) => {
        // Remove rejected tournament from list
        state.pendingTournaments = state.pendingTournaments.filter((t) => t.id !== action.payload);
        // Update stats
        state.stats.pending = Math.max(0, state.stats.pending - 1);
        state.stats.rejected = state.stats.rejected + 1;
      })
      .addCase(rejectTournament.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetPendingTournaments } = tournamentValidationSlice.actions;
export default tournamentValidationSlice.reducer;
