import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export interface CoachCredentialData {
  id: string;
  coach_id: string;
  credential_number: string;
  coach_name: string;
  nrtp_level: string;
  affiliation_status: string;
  club_name: string;
  state_affiliation: string;
  issued_date: string;
  created_at: string;
  expiry_date: string;
  verification_code: string;
  qr_code_url: string;
  user?: {
    profile_photo?: string;
  };
}

interface CoachCredentialsState {
  myCredential: CoachCredentialData | null;
  loading: boolean;
  error: string | null;
}

const initialState: CoachCredentialsState = {
  myCredential: null,
  loading: false,
  error: null,
};

export const fetchMyCoachCredentials = createAsyncThunk(
  'coachCredentials/fetchMyCredentials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/coaches/credentials/my-credential', {});
      return response as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch credentials',
      );
    }
  },
);

export const createCoachCredential = createAsyncThunk(
  'coachCredentials/createCredential',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post<any>('/coaches/credentials', {});
      return response as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create credential',
      );
    }
  },
);

export const renewCoachCredential = createAsyncThunk(
  'coachCredentials/renewCredential',
  async (paymentData: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.post<any>('/coaches/credentials/renew', paymentData);
      return response as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to renew credential',
      );
    }
  },
);

const coachCredentialsSlice = createSlice({
  name: 'coachCredentials',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearCredential(state) {
      state.myCredential = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch my credentials
    builder
      .addCase(fetchMyCoachCredentials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyCoachCredentials.fulfilled, (state, action) => {
        state.loading = false;
        state.myCredential = action.payload;
      })
      .addCase(fetchMyCoachCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create credential
    builder
      .addCase(createCoachCredential.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoachCredential.fulfilled, (state, action) => {
        state.loading = false;
        state.myCredential = action.payload;
      })
      .addCase(createCoachCredential.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Renew credential
    builder
      .addCase(renewCoachCredential.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(renewCoachCredential.fulfilled, (state, action) => {
        state.loading = false;
        state.myCredential = action.payload;
      })
      .addCase(renewCoachCredential.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCredential } = coachCredentialsSlice.actions;
export default coachCredentialsSlice.reducer;
