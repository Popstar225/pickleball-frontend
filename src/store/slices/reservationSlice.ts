import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Venue, Court, CourtReservation, Payment } from '../../types/api';
import { api } from '../../lib/api';

interface ReservationState {
  // Venues
  venues: Venue[];
  selectedVenue: Venue | null;

  // Courts
  courts: Court[];
  selectedCourt: Court | null;

  // Reservations
  availableTimeSlots: Array<{ start: string; end: string; available: boolean }>;
  currentReservation: Partial<CourtReservation> | null;
  myReservations: CourtReservation[];

  // Payment
  paymentDetails: {
    amount: number;
    subtotal: number;
    discount: number;
    tax: number;
    currency: string;
    paymentMethod: 'card' | 'paypal' | 'bank_transfer' | null;
  } | null;

  // UI State
  step:
    | 'select-venue'
    | 'select-court'
    | 'select-date'
    | 'select-time'
    | 'review-payment'
    | 'confirmation';
  selectedDate: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: ReservationState = {
  venues: [],
  selectedVenue: null,
  courts: [],
  selectedCourt: null,
  availableTimeSlots: [],
  currentReservation: null,
  myReservations: [],
  paymentDetails: null,
  step: 'select-venue',
  selectedDate: null,
  loading: false,
  error: null,
  success: null,
};

// Async thunks
export const fetchVenuesByClub = createAsyncThunk(
  'reservation/fetchVenuesByClub',
  async (clubId: string, { rejectWithValue }) => {
    try {
      const data: any = await api.get(`/venues/club/${clubId}`);
      return data?.data || data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch venues');
    }
  },
);

export const fetchCourtsByVenue = createAsyncThunk(
  'reservation/fetchCourtsByVenue',
  async (venueId: string, { rejectWithValue }) => {
    try {
      const data: any = await api.get(`/courts/venue/${venueId}`);
      return data?.data || data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch courts');
    }
  },
);

export const checkCourtAvailability = createAsyncThunk(
  'reservation/checkCourtAvailability',
  async (
    params: {
      courtId: string;
      date: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response: any = await api.get(`/courts/${params.courtId}/availability`, {
        params: { date: params.date },
      });
      
      // Extract the data array from response
      const availabilityData = response?.data || response || [];
      
      // Ensure we have an array
      if (!Array.isArray(availabilityData)) {
        return [];
      }
      
      // Transform the response to match frontend expectations
      // Convert start_time/end_time to start/end for time display
      return availabilityData.map((slot: any) => ({
        start: slot.start_time?.substring(11, 16) || '00:00', // Extract HH:MM from ISO string
        end: slot.end_time?.substring(11, 16) || '00:00',
        available: Boolean(slot.available),
      }));
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch availability');
    }
  },
);

export const createReservation = createAsyncThunk(
  'reservation/createReservation',
  async (reservationData: Partial<CourtReservation>, { rejectWithValue }) => {
    try {
      const data: any = await api.post('/court-reservations', reservationData);
      return data?.data || data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create reservation');
    }
  },
);

export const fetchMyReservations = createAsyncThunk(
  'reservation/fetchMyReservations',
  async (_, { rejectWithValue }) => {
    try {
      const data: any = await api.get('/court-reservations');
      return data?.data || data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reservations');
    }
  },
);

export const cancelReservation = createAsyncThunk(
  'reservation/cancelReservation',
  async (
    params: {
      reservationId: string;
      reason?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const data: any = await api.post(`/court-reservations/${params.reservationId}/cancel`, {
        reason: params.reason,
      });
      return { id: params.reservationId, ...(data?.data || data) };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel reservation');
    }
  },
);

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    // Navigation
    setStep: (
      state,
      action: PayloadAction<
        | 'select-venue'
        | 'select-court'
        | 'select-date'
        | 'select-time'
        | 'review-payment'
        | 'confirmation'
      >,
    ) => {
      state.step = action.payload;
    },

    goToPreviousStep: (state) => {
      const steps = [
        'select-venue',
        'select-court',
        'select-date',
        'select-time',
        'review-payment',
        'confirmation',
      ];
      const currentIndex = steps.indexOf(state.step);
      if (currentIndex > 0) {
        state.step = steps[currentIndex - 1] as any;
      }
    },

    goToNextStep: (state) => {
      const steps = [
        'select-venue',
        'select-court',
        'select-date',
        'select-time',
        'review-payment',
        'confirmation',
      ];
      const currentIndex = steps.indexOf(state.step);
      if (currentIndex < steps.length - 1) {
        state.step = steps[currentIndex + 1] as any;
      }
    },

    // Selection
    selectVenue: (state, action: PayloadAction<Venue>) => {
      state.selectedVenue = action.payload;
      state.courts = [];
      state.selectedCourt = null;
    },

    selectCourt: (state, action: PayloadAction<Court>) => {
      state.selectedCourt = action.payload;
    },

    selectDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },

    selectTimeSlot: (state, action: PayloadAction<{ start: string; end: string }>) => {
      if (state.currentReservation) {
        state.currentReservation.start_time = action.payload.start;
        state.currentReservation.end_time = action.payload.end;
      }
    },

    // Reservation Data
    setReservationData: (state, action: PayloadAction<Partial<CourtReservation>>) => {
      state.currentReservation = {
        ...state.currentReservation,
        ...action.payload,
      };
    },

    setPaymentDetails: (
      state,
      action: PayloadAction<Partial<ReservationState['paymentDetails']>>,
    ) => {
      if (state.paymentDetails) {
        state.paymentDetails = {
          ...state.paymentDetails,
          ...action.payload,
        };
      }
    },

    // Clear
    clearReservation: (state) => {
      state.currentReservation = null;
      state.selectedVenue = null;
      state.selectedCourt = null;
      state.selectedDate = null;
      state.availableTimeSlots = [];
      state.paymentDetails = null;
      state.step = 'select-venue';
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.success = null;
    },
  },

  extraReducers: (builder) => {
    // Fetch venues
    builder
      .addCase(fetchVenuesByClub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVenuesByClub.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = Array.isArray(action.payload)
          ? action.payload
          : (action.payload as any)?.venues || [];
      })
      .addCase(fetchVenuesByClub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch courts
    builder
      .addCase(fetchCourtsByVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourtsByVenue.fulfilled, (state, action) => {
        state.loading = false;
        state.courts = Array.isArray(action.payload)
          ? action.payload
          : (action.payload as any)?.courts || [];
      })
      .addCase(fetchCourtsByVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Check availability
    builder
      .addCase(checkCourtAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkCourtAvailability.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure availableTimeSlots is always an array
        state.availableTimeSlots = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(checkCourtAvailability.rejected, (state, action) => {
        state.loading = false;
        state.availableTimeSlots = [];
        state.error = action.payload as string;
      });

    // Create reservation
    builder
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Reservation created successfully!';
        state.myReservations.push(action.payload);
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch my reservations
    builder
      .addCase(fetchMyReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.myReservations = Array.isArray(action.payload)
          ? action.payload
          : (action.payload as any)?.reservations || [];
      })
      .addCase(fetchMyReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Cancel reservation
    builder
      .addCase(cancelReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Reservation cancelled successfully!';
        state.myReservations = state.myReservations.filter((r) => r.id !== action.payload.id);
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setStep,
  goToPreviousStep,
  goToNextStep,
  selectVenue,
  selectCourt,
  selectDate,
  selectTimeSlot,
  setReservationData,
  setPaymentDetails,
  clearReservation,
  clearError,
  clearSuccess,
} = reservationSlice.actions;

export default reservationSlice.reducer;
