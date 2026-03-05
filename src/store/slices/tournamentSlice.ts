/**
 * tournamentSlice.ts
 *
 * Redux slice for tournament state management
 * Handles validation, start workflow, and result corrections
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types
export interface ValidationIssue {
  event: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface CheckResult {
  name: string;
  passed: boolean;
}

export interface EventValidation {
  id: string;
  skill_block: string;
  gender: string;
  modality: string;
  format: string;
  status: 'ready' | 'warning' | 'blocked';
  current_participants: number;
  minimum_participants: number;
  max_participants: number;
  issues?: string;
}

export interface ValidationState {
  isValid: boolean;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  checks: CheckResult[];
  events: EventValidation[];
  summary: string;
}

export interface Tournament {
  id: string;
  name: string;
  // status values are returned from the API using underscore convention
  status: 'draft' | 'registration' | 'in_progress' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  organizer_id: string;
  total_events: number;
  total_registrations: number;
}

export interface TournamentState {
  currentTournament: Tournament | null;
  validation: ValidationState | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: TournamentState = {
  currentTournament: null,
  validation: null,
  loading: false,
  error: null,
  successMessage: null,
};

// Async Thunks
/**
 * Fetch tournament details
 * GET /tournaments/:id
 */
export const fetchTournamentDetails = createAsyncThunk<any, string, { rejectValue: string }>(
  'tournaments/fetchDetails',
  async (tournamentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/tournaments/${tournamentId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch tournament details');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error: unable to fetch tournament');
    }
  },
);

/**
 * Validate tournament readiness before start
 * GET /tournaments/:id/validate-start
 */
export const validateTournamentStart = createAsyncThunk<any, string, { rejectValue: string }>(
  'tournaments/validateStart',
  async (tournamentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/tournaments/${tournamentId}/validate-start`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Validation failed');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error: unable to validate tournament');
    }
  },
);

/**
 * Start tournament (generate groups, brackets, lock format)
 * POST /tournaments/:id/start
 */
export const startTournament = createAsyncThunk<
  any,
  { tournamentId: string; options?: Record<string, any> },
  { rejectValue: string }
>('tournaments/start', async ({ tournamentId, options = {} }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/start`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error.message || 'Failed to start tournament');
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue('Network error: unable to start tournament');
  }
});

/**
 * Cancel an event
 * POST /tournaments/:id/events/:eventId/cancel
 */
export const cancelEvent = createAsyncThunk<
  any,
  { tournamentId: string; eventId: string; reason: string },
  { rejectValue: string }
>('tournaments/cancelEvent', async ({ tournamentId, eventId, reason }, { rejectWithValue }) => {
  try {
    const response = await fetch(
      `${API_URL}/tournaments/${tournamentId}/events/${eventId}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error.message || 'Failed to cancel event');
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue('Network error: unable to cancel event');
  }
});

/**
 * Change event format
 * PUT /tournaments/:id/events/:eventId/format
 */
export const changeEventFormat = createAsyncThunk<
  any,
  { tournamentId: string; eventId: string; newFormat: string; reason: string },
  { rejectValue: string }
>(
  'tournaments/changeFormat',
  async ({ tournamentId, eventId, newFormat, reason }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/tournaments/${tournamentId}/events/${eventId}/format`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ format: newFormat, reason }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to change format');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error: unable to change format');
    }
  },
);

/**
 * Merge events
 * POST /tournaments/:id/events/merge
 */
export const mergeEvents = createAsyncThunk<
  any,
  { tournamentId: string; sourceEventId: string; targetEventId: string; reason: string },
  { rejectValue: string }
>(
  'tournaments/mergeEvents',
  async ({ tournamentId, sourceEventId, targetEventId, reason }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/tournaments/${tournamentId}/events/merge`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceEventId, targetEventId, reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to merge events');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error: unable to merge events');
    }
  },
);

/**
 * Correct a match result
 * PATCH /tournaments/:id/matches/:matchId/correct
 */
export const correctMatchResult = createAsyncThunk<
  any,
  { tournamentId: string; matchId: string; newScore: string; reason: string },
  { rejectValue: string }
>(
  'tournaments/correctMatch',
  async ({ tournamentId, matchId, newScore, reason }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/tournaments/${tournamentId}/matches/${matchId}/correct`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ set_scores: newScore, reason }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to correct match');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error: unable to correct match');
    }
  },
);

/**
 * Get match correction history
 * GET /tournaments/:id/matches/:matchId/corrections
 */
export const getMatchCorrectionHistory = createAsyncThunk<
  any,
  { tournamentId: string; matchId: string },
  { rejectValue: string }
>('tournaments/getCorrectionHistory', async ({ tournamentId, matchId }, { rejectWithValue }) => {
  try {
    const response = await fetch(
      `${API_URL}/tournaments/${tournamentId}/matches/${matchId}/corrections`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error.message || 'Failed to fetch correction history');
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue('Network error: unable to fetch correction history');
  }
});

/**
 * Extract qualifiers from groups
 * POST /tournaments/:id/qualifiers/extract
 */
export const extractQualifiers = createAsyncThunk<
  any,
  { tournamentId: string; strategy?: string; topN?: number },
  { rejectValue: string }
>(
  'tournaments/extractQualifiers',
  async ({ tournamentId, strategy = 'topN', topN = 2 }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/tournaments/${tournamentId}/qualifiers/extract`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ strategy, topN }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to extract qualifiers');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error: unable to extract qualifiers');
    }
  },
);

// Slice
const tournamentSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {
    // Synchronous actions
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    resetValidation: (state) => {
      state.validation = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tournament Details
    builder
      .addCase(fetchTournamentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournamentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTournament = action.payload.tournament || action.payload;
      })
      .addCase(
        fetchTournamentDetails.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Unknown error';
        },
      );

    // Validate Tournament Start
    builder
      .addCase(validateTournamentStart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateTournamentStart.fulfilled, (state, action) => {
        state.loading = false;
        state.validation = action.payload.validation || action.payload;
      })
      .addCase(
        validateTournamentStart.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Validation failed';
        },
      );

    // Start Tournament
    builder
      .addCase(startTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTournament.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Tournament started successfully!';
        if (state.currentTournament) {
          state.currentTournament.status = 'in_progress';
        }
        state.validation = null;
      })
      .addCase(startTournament.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to start tournament';
      });

    // Cancel Event
    builder
      .addCase(cancelEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Event cancelled successfully';
        // Refresh validation after event cancel
        state.validation = null;
      })
      .addCase(cancelEvent.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to cancel event';
      });

    // Change Event Format
    builder
      .addCase(changeEventFormat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeEventFormat.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Event format changed successfully';
        state.validation = null;
      })
      .addCase(changeEventFormat.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to change format';
      });

    // Merge Events
    builder
      .addCase(mergeEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Events merged successfully';
        state.validation = null;
      })
      .addCase(mergeEvents.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to merge events';
      });

    // Correct Match Result
    builder
      .addCase(correctMatchResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(correctMatchResult.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Match result corrected successfully';
      })
      .addCase(correctMatchResult.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to correct match';
      });

    // Get Correction History
    builder
      .addCase(getMatchCorrectionHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMatchCorrectionHistory.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(
        getMatchCorrectionHistory.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to fetch correction history';
        },
      );

    // Extract Qualifiers
    builder
      .addCase(extractQualifiers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(extractQualifiers.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Qualifiers extracted successfully';
      })
      .addCase(extractQualifiers.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to extract qualifiers';
      });
  },
});

export const { clearError, clearSuccess, resetValidation } = tournamentSlice.actions;
export default tournamentSlice.reducer;
