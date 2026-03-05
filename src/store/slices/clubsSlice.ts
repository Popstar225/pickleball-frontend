import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Club, ClubsQueryParams, CreateClubRequest, Court, Tournament } from '../../types/api';
import { api } from '../../lib/api';

interface ClubWithDetails extends Club {
  courts?: Court[];
  tournaments?: Tournament[];
  rating?: number;
  logo?: string;
  contact?: { phone?: string; email?: string; website?: string };
  upcomingEvents?: { name: string; date: string; time: string }[];
  facilities?: string[];
}

interface UserClub {
  id: string;
  name?: string;
  location?: string;
  members?: number;
  joinedDate?: string;
  status?: 'active' | 'inactive' | 'suspended';
  logo?: string;
  rating?: number;
}

interface ClubsState {
  clubs: Club[];
  currentClub: ClubWithDetails | null;
  myClubs: UserClub[];
  loading: boolean;
  error: string | null;
  joinError: string | null;
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
  myClubs: [],
  loading: false,
  error: null,
  joinError: null,
  pagination: null,
};

export const fetchClubs = createAsyncThunk('clubs/fetchClubs', async (params: ClubsQueryParams) => {
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  return await api.get(`/clubs?${queryString}`);
});

export const fetchClub = createAsyncThunk('clubs/fetchClub', async (id: string) => {
  return await api.get(`/clubs/${id}`);
});

export const fetchMyClubs = createAsyncThunk('clubs/fetchMyClubs', async () => {
  // Fetch user's club memberships from the dedicated endpoint
  try {
    const data = await api.get('/clubs/memberships');
    return data;
  } catch (error) {
    console.error('Failed to fetch user clubs:', error);
    return { data: { clubs: [] } };
  }
});

export const joinClub = createAsyncThunk('clubs/joinClub', async (clubId: string) => {
  return await api.post(`/clubs/${clubId}/join`, {});
});

export const leaveClub = createAsyncThunk('clubs/leaveClub', async (clubId: string) => {
  await api.post(`/clubs/${clubId}/leave`, {});
  return clubId;
});

export const createClub = createAsyncThunk(
  'clubs/createClub',
  async (clubData: CreateClubRequest) => {
    return await api.post('/clubs', clubData);
  },
);

export const updateClub = createAsyncThunk(
  'clubs/updateClub',
  async ({ id, data }: { id: string; data: Partial<CreateClubRequest> }) => {
    return await api.put(`/clubs/${id}`, data);
  },
);

export const deleteClub = createAsyncThunk('clubs/deleteClub', async (id: string) => {
  await api.delete(`/clubs/${id}`);
  return id;
});

export const fetchClubCourts = createAsyncThunk('clubs/fetchClubCourts', async (clubId: string) => {
  const data = await api.get(`/clubs/${clubId}/courts`);
  return { clubId, courts: data || [] };
});

export const fetchClubTournaments = createAsyncThunk(
  'clubs/fetchClubTournaments',
  async (clubId: string) => {
    const data = await api.get(`/clubs/${clubId}/tournaments`);
    return { clubId, tournaments: data || [] };
  },
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
    setUpdatedClub: (state, action) => {
      const index = state.clubs.findIndex((club) => club.id === action.payload.id);
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
        state.clubs = payload?.data?.clubs || []; // Access nested data.clubs
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
      // Fetch My Clubs
      .addCase(fetchMyClubs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyClubs.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        const clubsData = Array.isArray(payload?.data?.clubs)
          ? payload.data.clubs
          : Array.isArray(payload?.data)
            ? payload.data
            : payload?.clubs || [];

        // Map clubs with fallback values for missing properties
        state.myClubs = clubsData.map((club: any) => ({
          id: club.id || '',
          name: club.name || club.club?.name || 'Unknown Club',
          location: club.location || club.club?.city || 'N/A',
          members: club.members || club.member_count || 0,
          joinedDate: club.joinedDate || club.joined_date || new Date().toISOString(),
          status: club.status || 'active',
          logo: club.logo || club.club?.logo,
          rating: club.rating || club.club?.average_rating || 0,
        }));
      })
      .addCase(fetchMyClubs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch my clubs';
      })
      // Join Club
      .addCase(joinClub.pending, (state) => {
        state.loading = true;
        state.joinError = null;
      })
      .addCase(joinClub.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload) {
          state.myClubs.push({
            id: payload.id || payload.club_id,
            name: payload.name,
            location: `${payload.city}, ${payload.state}`,
            members: payload.member_count || 0,
            joinedDate: new Date().toISOString(),
            status: 'active',
            logo: payload.logo,
            rating: payload.rating || 0,
          });
        }
      })
      .addCase(joinClub.rejected, (state, action) => {
        state.loading = false;
        state.joinError = action.error.message || 'Failed to join club';
      })
      // Leave Club
      .addCase(leaveClub.pending, (state) => {
        state.loading = true;
        state.joinError = null;
      })
      .addCase(leaveClub.fulfilled, (state, action) => {
        state.loading = false;
        const clubId = action.payload as string;
        state.myClubs = state.myClubs.filter((c) => c.id !== clubId);
      })
      .addCase(leaveClub.rejected, (state, action) => {
        state.loading = false;
        state.joinError = action.error.message || 'Failed to leave club';
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
      // Update Club
      .addCase(updateClub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClub.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload) {
          const updated = payload.data || payload;
          const idx = state.clubs.findIndex((c) => c.id === updated.id);
          if (idx !== -1) state.clubs[idx] = updated;
          if (state.currentClub && state.currentClub.id === updated.id) state.currentClub = updated;
        }
      })
      .addCase(updateClub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update club';
      })
      // Delete Club
      .addCase(deleteClub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClub.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload as string;
        state.clubs = state.clubs.filter((c) => c.id !== id);
        if (state.currentClub && state.currentClub.id === id) state.currentClub = null;
      })
      .addCase(deleteClub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete club';
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

export const { clearError, setCurrentClub, clearClubs, addClub, setUpdatedClub } =
  clubsSlice.actions;
export default clubsSlice.reducer;
