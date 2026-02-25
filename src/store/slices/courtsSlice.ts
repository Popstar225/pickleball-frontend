import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  Court,
  CourtsQueryParams,
  CreateCourtRequest,
  BookCourtRequest,
  CourtReservation,
} from '../../types/api';
import { api } from '../../lib/api';

interface CourtWithDetails extends Court {
  availability?: Array<{
    start_time: string;
    end_time: string;
    available: boolean;
  }>;
  bookings?: CourtReservation[];
}

interface CourtsState {
  courts: Court[];
  club: { id: string; name: string } | null;
  currentCourt: CourtWithDetails | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

const initialState: CourtsState = {
  courts: [],
  club: null,
  currentCourt: null,
  loading: false,
  error: null,
  pagination: null,
};

export const fetchCourts = createAsyncThunk(
  'courts/fetchCourts',
  async (params: CourtsQueryParams) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return await api.get(`/clubs/my-courts?${queryString}`);
  },
);

export const fetchCourt = createAsyncThunk('courts/fetchCourt', async (id: string) => {
  return await api.get(`/courts/${id}`);
});

export const createCourt = createAsyncThunk(
  'courts/createCourt',
  async (courtData: CreateCourtRequest) => {
    return await api.post('/courts', courtData);
  },
);

export const updateCourt = createAsyncThunk(
  'courts/updateCourt',
  async (
    { id, courtData }: { id: string; courtData: Partial<CreateCourtRequest> },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put(`/courts/${id}`, courtData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update court',
      );
    }
  },
);

export const deleteCourt = createAsyncThunk(
  'courts/deleteCourt',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/courts/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete court',
      );
    }
  },
);

export const bookCourt = createAsyncThunk(
  'courts/bookCourt',
  async ({ courtId, bookingData }: { courtId: string; bookingData: BookCourtRequest }) => {
    const data = await api.post(`/courts/${courtId}/book`, bookingData);
    const response = data as any;
    return { courtId, reservation: response?.reservation };
  },
);

export const getCourtAvailability = createAsyncThunk(
  'courts/getCourtAvailability',
  async ({ courtId, params }: { courtId: string; params: { date: string; duration?: number } }) => {
    const queryParams = new URLSearchParams();
    queryParams.append('date', params.date);
    if (params.duration) queryParams.append('duration', params.duration.toString());

    const data = await api.get(`/courts/${courtId}/availability?${queryParams.toString()}`);
    return { courtId, availability: data || [] };
  },
);

export const getCourtBookings = createAsyncThunk(
  'courts/getCourtBookings',
  async ({
    courtId,
    params,
  }: {
    courtId: string;
    params: {
      date?: string;
      status?: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';
    };
  }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const data = await api.get(`/courts/${courtId}/bookings?${queryString}`);
    return { courtId, bookings: data || [] };
  },
);

const courtsSlice = createSlice({
  name: 'courts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCourt: (state, action) => {
      state.currentCourt = action.payload;
    },
    clearCourts: (state) => {
      state.courts = [];
      state.pagination = null;
    },
    addCourt: (state, action) => {
      state.courts.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courts
      .addCase(fetchCourts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourts.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        console.log('📦 fetchCourts response:', payload);
        // Match backend response format: { success, message, data: { club: {...}, courts: [...] } }
        const responseData = payload?.data;
        state.courts = responseData?.courts || [];
        state.club = responseData?.club || null;
        state.pagination = payload?.pagination || null;
      })
      .addCase(fetchCourts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch courts';
      })
      // Fetch Court
      .addCase(fetchCourt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourt.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        console.log('📦 fetchCourt response:', payload);
        // Extract court data - could be { data: {...} } or just {...}
        state.currentCourt = payload?.data || payload || null;
      })
      .addCase(fetchCourt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch court';
      })
      // Create Court
      .addCase(createCourt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourt.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload) {
          state.courts.unshift(payload);
          state.currentCourt = payload;
        }
      })
      .addCase(createCourt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create court';
      })
      // Update Court
      .addCase(updateCourt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourt.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        const courtData = payload?.data || payload;
        const index = state.courts.findIndex((court) => court.id === courtData.id);
        if (index !== -1) {
          state.courts[index] = courtData;
        }
        if (state.currentCourt && state.currentCourt.id === courtData.id) {
          state.currentCourt = courtData;
        }
      })
      .addCase(updateCourt.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to update court';
      })
      // Delete Court
      .addCase(deleteCourt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourt.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        state.courts = state.courts.filter((court) => court.id !== id);
        if (state.currentCourt && state.currentCourt.id === id) {
          state.currentCourt = null;
        }
      })
      .addCase(deleteCourt.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to delete court';
      })
      // Book Court
      .addCase(bookCourt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookCourt.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        // Update current court if it's the same court
        if (state.currentCourt && state.currentCourt.id === payload.courtId) {
          state.currentCourt = {
            ...state.currentCourt,
            total_bookings: state.currentCourt.total_bookings + 1,
          };
        }
        // Update court in courts array if exists
        const index = state.courts.findIndex((c) => c.id === payload.courtId);
        if (index !== -1) {
          state.courts[index] = {
            ...state.courts[index],
            total_bookings: state.courts[index].total_bookings + 1,
          };
        }
      })
      .addCase(bookCourt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to book court';
      })
      // Get Court Availability
      .addCase(getCourtAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourtAvailability.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        // Update current court with availability if it's the same court
        if (state.currentCourt && state.currentCourt.id === payload.courtId) {
          state.currentCourt = { ...state.currentCourt, availability: payload.availability || [] };
        }
      })
      .addCase(getCourtAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get court availability';
      })
      // Get Court Bookings
      .addCase(getCourtBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourtBookings.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        // Update current court with bookings if it's the same court
        if (state.currentCourt && state.currentCourt.id === payload.courtId) {
          state.currentCourt = { ...state.currentCourt, bookings: payload.bookings || [] };
        }
      })
      .addCase(getCourtBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get court bookings';
      });
  },
});

export const { clearError, setCurrentCourt, clearCourts, addCourt } = courtsSlice.actions;
export default courtsSlice.reducer;
