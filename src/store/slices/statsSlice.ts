import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';
import { ApiResponse } from '../../types/api';

interface OverviewStats {
  total_users: number;
  total_clubs: number;
  total_tournaments: number;
  total_revenue: number;
  active_memberships: number;
}

interface UserStats {
  total_users: number;
  new_users_this_month: number;
  active_users: number;
  users_by_type: Record<string, number>;
  users_by_state: Record<string, number>;
}

interface StatsState {
  overviewStats: OverviewStats | null;
  userStats: UserStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  overviewStats: null,
  userStats: null,
  loading: false,
  error: null,
};

export const fetchOverviewStats = createAsyncThunk(
  'stats/fetchOverviewStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<OverviewStats>>('/stats/overview');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch overview stats');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'stats/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<UserStats>>('/stats/users');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch user stats');
    }
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOverviewStats: (state) => {
      state.overviewStats = null;
    },
    clearUserStats: (state) => {
      state.userStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Overview Stats
      .addCase(fetchOverviewStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverviewStats.fulfilled, (state, action) => {
        state.loading = false;
        state.overviewStats = action.payload;
      })
      .addCase(fetchOverviewStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch overview stats';
      })
      // Fetch User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.userStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch user stats';
      });
  },
});

export const { clearError, clearOverviewStats, clearUserStats } = statsSlice.actions;
export default statsSlice.reducer; 