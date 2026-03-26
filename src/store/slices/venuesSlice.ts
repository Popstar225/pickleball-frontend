import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export interface Court {
  id: string;
  name: string;
  court_number: number;
  court_type: string;
  surface_type: string;
  hourly_rate: number;
  is_active: boolean;
  is_available: boolean;
}

export interface Venue {
  id: string;
  club_id: string;
  name: string;
  state: string;
  address: string;
  phone?: string;
  whatsapp?: string;
  court_type: string;
  surface_type: string;
  base_price_per_hour: number;
  number_of_courts: number;
  operating_hours?: Record<string, any>;
  payment_config?: Record<string, any>;
  description?: string;
  facilities?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  courts?: Court[];
  club?: {
    id: string;
    name: string;
    state?: string;
    city?: string;
    address?: string;
    logo?: string;
  };
}

interface VenuesState {
  venues: Venue[];
  selectedVenue: Venue | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const initialState: VenuesState = {
  venues: [],
  selectedVenue: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
};

// Async thunks
export const fetchAllVenues = createAsyncThunk(
  'venues/fetchAll',
  async (
    params: { page?: number; limit?: number; is_active?: boolean } = {},
    { rejectWithValue },
  ) => {
    try {
      const p = new URLSearchParams();
      if (params.page)  p.append('page', String(params.page));
      if (params.limit) p.append('limit', String(params.limit));
      if (params.is_active !== undefined) p.append('is_active', String(params.is_active));
      const response = await api.get(`/venues?${p.toString()}`);
      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch venues');
    }
  },
);

export const fetchVenuesByClub = createAsyncThunk(
  'venues/fetchByClub',
  async (
    payload: { clubId: string; page?: number; limit?: number; isActive?: boolean },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      if (payload.page) params.append('page', payload.page.toString());
      if (payload.limit) params.append('limit', payload.limit.toString());
      if (payload.isActive !== undefined) params.append('is_active', payload.isActive.toString());

      const response = await api.get(`/venues/club/${payload.clubId}?${params.toString()}`);
      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch venues');
    }
  },
);

export const fetchVenueById = createAsyncThunk(
  'venues/fetchById',
  async (venueId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/venues/${venueId}`);
      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch venue');
    }
  },
);

export const createVenue = createAsyncThunk(
  'venues/create',
  async (
    payload: {
      club_id: string;
      name: string;
      state: string;
      address: string;
      phone?: string;
      whatsapp?: string;
      court_type: string;
      surface_type: string;
      base_price_per_hour: number;
      number_of_courts: number;
      operating_hours?: Record<string, any>;
      payment_config?: Record<string, any>;
      description?: string;
      facilities?: string[];
    },
    { rejectWithValue },
  ) => {
    try {
      // Validate payload before sending
      if (!payload.club_id) {
        console.error('❌ Missing club_id');
        return rejectWithValue('Club ID is required');
      }
      if (!payload.name) {
        console.error('❌ Missing name');
        return rejectWithValue('Venue name is required');
      }
      if (payload.number_of_courts <= 0) {
        console.error('❌ Invalid number_of_courts:', payload.number_of_courts);
        return rejectWithValue('Number of courts must be greater than 0');
      }

      // Map field names to match backend expectations
      const apiPayload = {
        club_id: payload.club_id,
        name: payload.name,
        state: payload.state || '',
        address: payload.address || '',
        phone: payload.phone || '',
        whatsapp: payload.whatsapp || '',
        court_type: payload.court_type || 'outdoor',
        surface_type: payload.surface_type || 'concrete',
        base_price_per_hour: Number(payload.base_price_per_hour) || 0,
        number_of_courts: Number(payload.number_of_courts) || 1,
        operating_hours: payload.operating_hours,
        payment_config: payload.payment_config,
        description: payload.description || '',
        facilities: payload.facilities || [],
      };

      console.log('📤 CREATE VENUE - Full Payload:', JSON.stringify(apiPayload, null, 2));
      console.log('📊 Court Details: type=%s, surface=%s, price=$%d, count=%d', 
        apiPayload.court_type, apiPayload.surface_type, apiPayload.base_price_per_hour, apiPayload.number_of_courts);

      const response = await api.post('/venues', apiPayload);
      console.log('✅ Venue created successfully:', response);
      return (response as any).data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create venue';
      const errorDetails = error.response?.data?.details || error.response?.data;
      console.error('❌ VENUE CREATION FAILED');
      console.error('   Message:', errorMsg);
      console.error('   Details:', errorDetails);
      console.error('   Full Error:', error.response?.data || error);
      return rejectWithValue(errorMsg);
    }
  },
);

export const updateVenue = createAsyncThunk(
  'venues/update',
  async (
    payload: {
      id: string;
      data: Partial<Venue>;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put(`/venues/${payload.id}`, payload.data);
      return (response as any)?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update venue');
    }
  },
);

export const deleteVenue = createAsyncThunk(
  'venues/delete',
  async (venueId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/venues/${venueId}`);
      return venueId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete venue');
    }
  },
);

const venuesSlice = createSlice({
  name: 'venues',
  initialState,
  reducers: {
    clearSelectedVenue: (state) => {
      state.selectedVenue = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all venues (admin)
    builder
      .addCase(fetchAllVenues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload?.venues || [];
        state.pagination = action.payload?.pagination || initialState.pagination;
      })
      .addCase(fetchAllVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch venues by club
    builder
      .addCase(fetchVenuesByClub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVenuesByClub.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload.venues || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchVenuesByClub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch venue by ID
    builder
      .addCase(fetchVenueById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVenueById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVenue = action.payload;
      })
      .addCase(fetchVenueById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create venue
    builder
      .addCase(createVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVenue.fulfilled, (state, action) => {
        state.loading = false;
        state.venues.unshift(action.payload);
      })
      .addCase(createVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update venue
    builder
      .addCase(updateVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVenue.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.venues.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.venues[index] = action.payload;
        }
        if (state.selectedVenue?.id === action.payload.id) {
          state.selectedVenue = action.payload;
        }
      })
      .addCase(updateVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete venue
    builder
      .addCase(deleteVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVenue.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = state.venues.filter((v) => v.id !== action.payload);
        if (state.selectedVenue?.id === action.payload) {
          state.selectedVenue = null;
        }
      })
      .addCase(deleteVenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedVenue, clearError } = venuesSlice.actions;
export default venuesSlice.reducer;
