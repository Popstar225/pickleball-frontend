import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CourtReservation, BookCourtRequest, CourtAvailabilityQueryParams, CourtBookingsQueryParams } from '../../types/api';
import { api } from '../../lib/api';

interface CourtReservationsState {
  reservations: CourtReservation[];
  currentReservation: CourtReservation | null;
  courtAvailability: Array<{
    start_time: string;
    end_time: string;
    available: boolean;
  }>;
  courtBookings: CourtReservation[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

const initialState: CourtReservationsState = {
  reservations: [],
  currentReservation: null,
  courtAvailability: [],
  courtBookings: [],
  loading: false,
  error: null,
  pagination: null,
};

export const createCourtReservation = createAsyncThunk(
  'courtReservations/createCourtReservation',
  async ({ courtId, bookingData }: { courtId: string; bookingData: BookCourtRequest }) => {
    const data = await api.post(`/courts/${courtId}/book`, bookingData);
    const response = data as any;
    return response?.reservation;
  }
);

export const fetchCourtReservations = createAsyncThunk(
  'courtReservations/fetchCourtReservations',
  async (params: { page?: number; limit?: number; user_id?: string; club_id?: string; status?: string }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return await api.get(`/court-reservations?${queryString}`);
  }
);

export const getCourtAvailability = createAsyncThunk(
  'courtReservations/getCourtAvailability',
  async ({ courtId, params }: { courtId: string; params: CourtAvailabilityQueryParams }) => {
    const queryParams = new URLSearchParams();
    queryParams.append('date', params.date);
    if (params.duration) queryParams.append('duration', params.duration.toString());
    
    const data = await api.get(`/courts/${courtId}/availability?${queryParams.toString()}`);
    return { courtId, availability: data || [] };
  }
);

export const getCourtBookings = createAsyncThunk(
  'courtReservations/getCourtBookings',
  async ({ courtId, params }: { courtId: string; params: CourtBookingsQueryParams }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const data = await api.get(`/courts/${courtId}/bookings?${queryString}`);
    return { courtId, bookings: data || [] };
  }
);

export const cancelCourtReservation = createAsyncThunk(
  'courtReservations/cancelCourtReservation',
  async (reservationId: string) => {
    await api.put(`/court-reservations/${reservationId}/cancel`, {});
    return reservationId;
  }
);

const courtReservationsSlice = createSlice({
  name: 'courtReservations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentReservation: (state, action) => {
      state.currentReservation = action.payload;
    },
    clearReservations: (state) => {
      state.reservations = [];
      state.pagination = null;
    },
    clearCourtAvailability: (state) => {
      state.courtAvailability = [];
    },
    clearCourtBookings: (state) => {
      state.courtBookings = [];
    },
    addReservation: (state, action) => {
      state.reservations.unshift(action.payload);
    },
    updateReservation: (state, action) => {
      const index = state.reservations.findIndex(reservation => reservation.id === action.payload.id);
      if (index !== -1) {
        state.reservations[index] = action.payload;
      }
      if (state.currentReservation && state.currentReservation.id === action.payload.id) {
        state.currentReservation = action.payload;
      }
      // Update in court bookings if exists
      const bookingIndex = state.courtBookings.findIndex(b => b.id === action.payload.id);
      if (bookingIndex !== -1) {
        state.courtBookings[bookingIndex] = action.payload;
      }
    },
    removeReservation: (state, action) => {
      state.reservations = state.reservations.filter(r => r.id !== action.payload);
      state.courtBookings = state.courtBookings.filter(b => b.id !== action.payload);
      if (state.currentReservation && state.currentReservation.id === action.payload) {
        state.currentReservation = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Court Reservation
      .addCase(createCourtReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourtReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations.unshift(action.payload);
        state.currentReservation = action.payload;
      })
      .addCase(createCourtReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create court reservation';
      })
      // Fetch Court Reservations
      .addCase(fetchCourtReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourtReservations.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.reservations = payload?.data || [];
        state.pagination = payload?.pagination || null;
      })
      .addCase(fetchCourtReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch court reservations';
      })
      // Get Court Availability
      .addCase(getCourtAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourtAvailability.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.courtAvailability = payload?.availability || [];
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
        state.courtBookings = payload?.bookings || [];
      })
      .addCase(getCourtBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get court bookings';
      })
      // Cancel Court Reservation
      .addCase(cancelCourtReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelCourtReservation.fulfilled, (state, action) => {
        state.loading = false;
        // Remove reservation from all arrays
        state.reservations = state.reservations.filter(r => r.id !== action.payload);
        state.courtBookings = state.courtBookings.filter(b => b.id !== action.payload);
        if (state.currentReservation && state.currentReservation.id === action.payload) {
          state.currentReservation = null;
        }
      })
      .addCase(cancelCourtReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to cancel court reservation';
      });
  },
});

export const { clearError, setCurrentReservation, clearReservations, clearCourtAvailability, clearCourtBookings, addReservation, updateReservation, removeReservation } = courtReservationsSlice.actions;
export default courtReservationsSlice.reducer; 