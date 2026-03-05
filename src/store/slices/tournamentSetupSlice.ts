import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

interface TournamentEvent {
  key: string;
  label: string;
  block: string;
  gender: string;
  modality: string;
}

interface TournamentSetupData {
  name: string;
  venue_name: string;
  venue_address?: string;
  city: string;
  state: string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  entry_fee?: number;
  max_participants?: number;
  contact_email: string;
  contact_phone: string;
  description?: string;
  format: 'hybrid' | 'single_elimination';
  format_config: Record<string, any>;
  events: TournamentEvent[];
  tournament_type?: 'club' | 'state' | 'admin';
  judges?: Array<{ name: string; email: string }>; // optional array of judge objects with name and email
}

interface TournamentSetupState {
  validEvents: TournamentEvent[];
  createdTournament: any | null;
  loading: boolean;
  loadingEvents: boolean;
  error: string | null;
  success: boolean;
}

const initialState: TournamentSetupState = {
  validEvents: [],
  createdTournament: null,
  loading: false,
  loadingEvents: false,
  error: null,
  success: false,
};

// Async Thunks
export const fetchValidTournamentEvents = createAsyncThunk(
  'tournamentSetup/fetchValidTournamentEvents',
  async () => {
    return await api.get('/tournaments/setup/events');
  },
);

export const createTournamentWithSetup = createAsyncThunk(
  'tournamentSetup/createTournamentWithSetup',
  async (tournamentData: TournamentSetupData) => {
    // Map user role to tournament type
    const tournamentTypeMap: Record<string, string> = {
      club: 'local',
      state: 'state',
      admin: 'national',
    };

    const actualTournamentType =
      tournamentTypeMap[tournamentData.tournament_type || 'club'] || 'local';

    // Transform frontend form data to backend API format
    // note: we intentionally spread the entire tournamentData so fields like
    // `judges` (added via the review step) are preserved automatically.
    const payload = {
      ...tournamentData,
      tournament_type: actualTournamentType,
      technical_config: {
        format: tournamentData.format,
        format_config: tournamentData.format_config,
        events: tournamentData.events.map((event) => ({
          block: event.block,
          gender: event.gender,
          modality: event.modality,
        })),
      },
    };

    // Remove format and format_config from top level since they're now in technical_config
    delete (payload as any).format;
    delete (payload as any).format_config;

    return await api.post('/tournaments/setup', payload);
  },
);

const tournamentSetupSlice = createSlice({
  name: 'tournamentSetup',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Valid Tournament Events
    builder
      .addCase(fetchValidTournamentEvents.pending, (state) => {
        state.loadingEvents = true;
        state.error = null;
      })
      .addCase(fetchValidTournamentEvents.fulfilled, (state, action) => {
        state.loadingEvents = false;
        const payload = action.payload as any;
        state.validEvents = payload?.data || [];
        state.error = null;
      })
      .addCase(fetchValidTournamentEvents.rejected, (state, action) => {
        state.loadingEvents = false;
        state.error = action.error.message || 'Failed to fetch tournament events';
      });

    // Create Tournament With Setup
    builder
      .addCase(createTournamentWithSetup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTournamentWithSetup.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        // API returns { success, tournament, message }
        state.createdTournament = payload?.tournament || payload?.data || payload;
        state.success = true;
        state.error = null;
      })
      .addCase(createTournamentWithSetup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create tournament';
        state.success = false;
      });
  },
});

export const { clearError, clearSuccess, resetState } = tournamentSetupSlice.actions;
export default tournamentSetupSlice.reducer;
