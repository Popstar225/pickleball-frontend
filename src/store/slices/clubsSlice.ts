import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Club, ClubsQueryParams, CreateClubRequest, Court, Tournament } from '../../types/api';
import { api } from '../../lib/api';

interface ClubWithDetails extends Club {
  courts?: Court[];
  tournaments?: Tournament[];
}

interface ClubsState {
  clubs: Club[];
  currentClub: ClubWithDetails | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

const initialState: ClubsState = {
  clubs: [],
  currentClub: null,
  loading: false,
  error: null,
  pagination: null,
};

export const fetchClubs = createAsyncThunk(
  'clubs/fetchClubs',
  async (params: ClubsQueryParams) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return await api.get(`/clubs?${queryString}`);
  }
);

export const fetchClub = createAsyncThunk(
  'clubs/fetchClub',
  async (id: string) => {
    return await api.get(`/clubs/${id}`);
  }
);

export const createClub = createAsyncThunk(
  'clubs/createClub',
  async (clubData: CreateClubRequest) => {
    return await api.post('/clubs', clubData);
  }
);

export const fetchClubCourts = createAsyncThunk(
  'clubs/fetchClubCourts',
  async (clubId: string) => {
    const data = await api.get(`/clubs/${clubId}/courts`);
    return { clubId, courts: data || [] };
  }
);

export const fetchClubTournaments = createAsyncThunk(
  'clubs/fetchClubTournaments',
  async (clubId: string) => {
    const data = await api.get(`/clubs/${clubId}/tournaments`);
    return { clubId, tournaments: data || [] };
  }
);

const clubsSlice = createSlice({
  name: 'clubs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentClub: (state, action) => {
      state.currentClub = action.payload;
    },
    clearClubs: (state) => {
      state.clubs = [];
      state.pagination = null;
    },
    addClub: (state, action) => {
      state.clubs.unshift(action.payload);
    },
    updateClub: (state, action) => {
      const index = state.clubs.findIndex(club => club.id === action.payload.id);
      if (index !== -1) {
        state.clubs[index] = action.payload;
      }
      if (state.currentClub && state.currentClub.id === action.payload.id) {
        state.currentClub = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Clubs
      .addCase(fetchClubs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClubs.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.clubs = payload?.data?.data || [];  // Fix: access nested data.data
        state.pagination = payload?.pagination || null;
      })
      .addCase(fetchClubs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch clubs';
      })
      // Fetch Club
      .addCase(fetchClub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClub.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload) {
          state.currentClub = payload;
        }
      })
      .addCase(fetchClub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch club';
      })
      // Create Club
      .addCase(createClub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClub.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload) {
          state.clubs.unshift(payload);
          state.currentClub = payload;
        }
      })
      .addCase(createClub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create club';
      })
      // Fetch Club Courts
      .addCase(fetchClubCourts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClubCourts.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        // Update current club with courts if it's the same club
        if (state.currentClub && state.currentClub.id === payload.clubId) {
          state.currentClub = { ...state.currentClub, courts: payload.courts || [] };
        }
      })
      .addCase(fetchClubCourts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch club courts';
      })
      // Fetch Club Tournaments
      .addCase(fetchClubTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClubTournaments.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        // Update current club with tournaments if it's the same club
        if (state.currentClub && state.currentClub.id === payload.clubId) {
          state.currentClub = { ...state.currentClub, tournaments: payload.tournaments || [] };
        }
      })
      .addCase(fetchClubTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch club tournaments';
      });
  },
});

export const { clearError, setCurrentClub, clearClubs, addClub, updateClub } = clubsSlice.actions;
export default clubsSlice.reducer; 