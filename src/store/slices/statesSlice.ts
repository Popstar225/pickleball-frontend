import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

interface State {
  id: string;
  username: string;
  business_name: string;
  profile_photo?: string;
  bio?: string;
  state: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  contact_person: string;
  job_title: string;
  membership_status: string;
  created_at: string;
}

interface StatesState {
  states: State[];
  loading: boolean;
  error: string | null;
}

const initialState: StatesState = {
  states: [],
  loading: false,
  error: null,
};

export const fetchStates = createAsyncThunk(
  'states/fetchStates',
  async (params: any = {}) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const url = queryString ? `/users/states?${queryString}` : '/users/states';
    const response = await api.get(url);
    
    // Extract unique state names from the response
    const responseData = response as any;
    const states = responseData?.data?.states || [];
    const uniqueStates = states.reduce((acc: any[], current: any) => {
      const exists = acc.find(item => item.state === current.state);
      if (!exists) {
        acc.push({
          id: current.id,
          state: current.state,
          city: current.city
        });
      }
      return acc;
    }, []);
    
    return {
      data: {
        states: uniqueStates
      }
    };
  }
);

const statesSlice = createSlice({
  name: 'states',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearStates: (state) => {
      state.states = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.states = payload?.data?.states || [];
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch states';
      });
  },
});

export const { clearError, clearStates } = statesSlice.actions;
export default statesSlice.reducer; 