import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User, PlayerFinder, SearchPlayersQueryParams, UpdatePlayerFinderPreferencesRequest, SendMatchRequestRequest } from '../../types/api';
import { api } from '../../lib/api';

interface PlayerFinderState {
  searchResults: User[];
  nearbyPlayers: Array<User & { distance_km: number }>;
  preferences: PlayerFinder | null;
  stats: {
    total_matches_found: number;
    matches_contacted: number;
    successful_matches: number;
    is_active: boolean;
    last_search_date?: string;
  } | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

const initialState: PlayerFinderState = {
  searchResults: [],
  nearbyPlayers: [],
  preferences: null,
  stats: null,
  loading: false,
  error: null,
  pagination: null,
};

export const searchPlayers = createAsyncThunk(
  'playerFinder/searchPlayers',
  async (params: SearchPlayersQueryParams) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return await api.get(`/player-finder/search?${queryString}`);
  }
);

export const fetchNearbyPlayers = createAsyncThunk(
  'playerFinder/fetchNearbyPlayers',
  async (limit: number = 10) => {
    const data = await api.get(`/player-finder/nearby?limit=${limit}`);
    return data || [];
  }
);

export const fetchPlayerFinderPreferences = createAsyncThunk(
  'playerFinder/fetchPlayerFinderPreferences',
  async () => {
    return await api.get('/player-finder/preferences');
  }
);

export const updatePlayerFinderPreferences = createAsyncThunk(
  'playerFinder/updatePlayerFinderPreferences',
  async (preferences: UpdatePlayerFinderPreferencesRequest) => {
    return await api.put('/player-finder/preferences', preferences);
  }
);

export const togglePlayerFinderStatus = createAsyncThunk(
  'playerFinder/togglePlayerFinderStatus',
  async () => {
    return await api.put('/player-finder/toggle-status', {});
  }
);

export const fetchPlayerFinderStats = createAsyncThunk(
  'playerFinder/fetchPlayerFinderStats',
  async () => {
    return await api.get('/player-finder/stats');
  }
);

export const sendMatchRequest = createAsyncThunk(
  'playerFinder/sendMatchRequest',
  async ({ targetUserId, requestData }: { targetUserId: string; requestData: SendMatchRequestRequest }) => {
    const data = await api.post(`/player-finder/match-request/${targetUserId}`, requestData);
    return data;
  }
);

const playerFinderSlice = createSlice({
  name: 'playerFinder',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.pagination = null;
    },
    clearNearbyPlayers: (state) => {
      state.nearbyPlayers = [];
    },
    clearPreferences: (state) => {
      state.preferences = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
    addSearchResult: (state, action) => {
      state.searchResults.unshift(action.payload);
    },
    removeSearchResult: (state, action) => {
      state.searchResults = state.searchResults.filter(user => user.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Players
      .addCase(searchPlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPlayers.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.searchResults = payload?.data || [];
        state.pagination = payload?.pagination || null;
      })
      .addCase(searchPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search players';
      })
      // Fetch Nearby Players
      .addCase(fetchNearbyPlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyPlayers.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.nearbyPlayers = payload || [];
      })
      .addCase(fetchNearbyPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch nearby players';
      })
      // Fetch Player Finder Preferences
      .addCase(fetchPlayerFinderPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayerFinderPreferences.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload) {
          state.preferences = payload;
        }
      })
      .addCase(fetchPlayerFinderPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch player finder preferences';
      })
      // Update Player Finder Preferences
      .addCase(updatePlayerFinderPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlayerFinderPreferences.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload) {
          state.preferences = payload;
        }
      })
      .addCase(updatePlayerFinderPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update player finder preferences';
      })
      // Toggle Player Finder Status
      .addCase(togglePlayerFinderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePlayerFinderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload && state.preferences) {
          state.preferences.is_active = payload.is_active;
        }
      })
      .addCase(togglePlayerFinderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to toggle player finder status';
      })
      // Fetch Player Finder Stats
      .addCase(fetchPlayerFinderStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayerFinderStats.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload) {
          state.stats = payload;
        }
      })
      .addCase(fetchPlayerFinderStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch player finder stats';
      })
      // Send Match Request
      .addCase(sendMatchRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMatchRequest.fulfilled, (state, action) => {
        state.loading = false;
        // Update stats if available
        if (state.stats) {
          state.stats.matches_contacted += 1;
        }
      })
      .addCase(sendMatchRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send match request';
      });
  },
});

export const { clearError, clearSearchResults, clearNearbyPlayers, clearPreferences, clearStats, addSearchResult, removeSearchResult } = playerFinderSlice.actions;
export default playerFinderSlice.reducer; 