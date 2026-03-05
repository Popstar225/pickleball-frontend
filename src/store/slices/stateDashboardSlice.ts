import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// Interfaces for state dashboard data
export interface StateProfile {
  id: string;
  stateName: string;
  coordinatorName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  foundationDate: string;
  totalMembers: number;
  activeClubs: number;
  description: string;
  logoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface StateStats {
  totalMembers: number;
  activeClubs: number;
  tournamentsThisYear: number;
  upcomingEvents: number;
  membershipGrowth: number;
  messagesUnread: number;
}

export interface StateActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  status: string;
}

export interface StateEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  participants: number;
  type: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface StateClub {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  coordinatorName: string;
  phone: string;
  email: string;
  memberCount: number;
  createdAt: string;
}

export interface StateMember {
  id: string;
  name: string;
  email: string;
  membershipStatus: string;
  joinDate: string;
}

export interface StateCourt {
  id: string;
  name: string;
  court_type: string;
  surface: string;
  status: string;
  is_available: boolean;
  club_id: string;
  club?: { id: string; name: string; state: string; city: string };
  venue_id?: string;
  venue?: { id: string; name: string; address: string };
  created_at: string;
  updated_at: string;
}

// Initial state
interface StateDashboardState {
  profile: StateProfile | null;
  stats: StateStats | null;
  activities: StateActivity[];
  upcomingEvents: StateEvent[];
  clubs: StateClub[];
  members: StateMember[];
  courts: StateCourt[];
  courtsLoading: boolean;
  courtsError: string | null;
  courtsPagination: { page: number; limit: number; total: number; pages: number } | null;

  // Loading states
  profileLoading: boolean;
  statsLoading: boolean;
  activitiesLoading: boolean;
  eventsLoading: boolean;
  clubsLoading: boolean;
  membersLoading: boolean;

  // Error states
  profileError: string | null;
  statsError: string | null;
  activitiesError: string | null;
  eventsError: string | null;
  clubsError: string | null;
  membersError: string | null;
}

const initialState: StateDashboardState = {
  profile: null,
  stats: null,
  activities: [],
  upcomingEvents: [],
  clubs: [],
  members: [],
  courts: [],
  courtsLoading: false,
  courtsError: null,
  courtsPagination: null,

  profileLoading: false,
  statsLoading: false,
  activitiesLoading: false,
  eventsLoading: false,
  clubsLoading: false,
  membersLoading: false,

  profileError: null,
  statsError: null,
  activitiesError: null,
  eventsError: null,
  clubsError: null,
  membersError: null,
};

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

// Async thunks
export const fetchStateProfile = createAsyncThunk(
  'stateDashboard/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get('/states/profile');
      return (data as any)?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateStateProfile = createAsyncThunk(
  'stateDashboard/updateProfile',
  async (profileData: Record<string, any>, { rejectWithValue }) => {
    try {
      const data = await api.put('/states/profile', profileData);
      return (data as any)?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteStateAccount = createAsyncThunk(
  'stateDashboard/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.delete('/states/account');
      return (data as any)?.message;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const fetchStateStatistics = createAsyncThunk(
  'stateDashboard/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get('/states/statistics');
      return (data as any)?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const fetchStateActivities = createAsyncThunk(
  'stateDashboard/fetchActivities',
  async ({ limit = 10, offset = 0 }: { limit?: number; offset?: number }, { rejectWithValue }) => {
    try {
      const data = await api.get(`/states/activities?limit=${limit}&offset=${offset}`);
      return (data as any)?.data?.activities;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const fetchUpcomingEvents = createAsyncThunk(
  'stateDashboard/fetchUpcomingEvents',
  async ({ limit = 10 }: { limit?: number }, { rejectWithValue }) => {
    try {
      const data = await api.get(`/states/events/upcoming?limit=${limit}`);
      return (data as any)?.data?.events;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const createStateEvent = createAsyncThunk(
  'stateDashboard/createEvent',
  async (eventData: Partial<StateEvent>, { rejectWithValue }) => {
    try {
      const data = await api.post('/states/events', eventData);
      return (data as any)?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateStateEvent = createAsyncThunk(
  'stateDashboard/updateEvent',
  async (
    { eventId, eventData }: { eventId: string; eventData: Partial<StateEvent> },
    { rejectWithValue },
  ) => {
    try {
      const data = await api.put(`/states/events/${eventId}`, eventData);
      return (data as any)?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteStateEvent = createAsyncThunk(
  'stateDashboard/deleteEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/states/events/${eventId}`);
      return eventId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const fetchStateClubs = createAsyncThunk(
  'stateDashboard/fetchClubs',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get('/states/clubs');
      return (data as any)?.data?.clubs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const fetchStateMembers = createAsyncThunk(
  'stateDashboard/fetchMembers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get('/states/members');
      return (data as any)?.data?.members;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const fetchStateCourts = createAsyncThunk(
  'stateDashboard/fetchCourts',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      court_type?: string;
      surface?: string;
      status?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.court_type && params.court_type !== 'all')
        queryParams.append('court_type', params.court_type);
      if (params.surface && params.surface !== 'all') queryParams.append('surface', params.surface);
      const queryString = queryParams.toString();
      const data = await api.get(`/courts?${queryString}`);
      return (data as any)?.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const deleteStateCourt = createAsyncThunk(
  'stateDashboard/deleteCourt',
  async (courtId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/courts/${courtId}`);
      return courtId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Slice
const stateDashboardSlice = createSlice({
  name: 'stateDashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.profileError = null;
      state.statsError = null;
      state.activitiesError = null;
      state.eventsError = null;
      state.clubsError = null;
      state.membersError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch State Profile
      .addCase(fetchStateProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchStateProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchStateProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })

      // Update State Profile
      .addCase(updateStateProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(updateStateProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateStateProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })

      // Delete State Account
      .addCase(deleteStateAccount.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(deleteStateAccount.fulfilled, (state) => {
        state.profileLoading = false;
        state.profile = null;
      })
      .addCase(deleteStateAccount.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })

      // Fetch State Statistics
      .addCase(fetchStateStatistics.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchStateStatistics.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStateStatistics.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload as string;
      })

      // Fetch State Activities
      .addCase(fetchStateActivities.pending, (state) => {
        state.activitiesLoading = true;
        state.activitiesError = null;
      })
      .addCase(fetchStateActivities.fulfilled, (state, action) => {
        state.activitiesLoading = false;
        state.activities = action.payload;
      })
      .addCase(fetchStateActivities.rejected, (state, action) => {
        state.activitiesLoading = false;
        state.activitiesError = action.payload as string;
      })

      // Fetch Upcoming Events
      .addCase(fetchUpcomingEvents.pending, (state) => {
        state.eventsLoading = true;
        state.eventsError = null;
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.eventsLoading = false;
        state.upcomingEvents = action.payload;
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.eventsLoading = false;
        state.eventsError = action.payload as string;
      })

      // Create State Event
      .addCase(createStateEvent.pending, (state) => {
        state.eventsLoading = true;
        state.eventsError = null;
      })
      .addCase(createStateEvent.fulfilled, (state, action) => {
        state.eventsLoading = false;
        state.upcomingEvents.push(action.payload);
      })
      .addCase(createStateEvent.rejected, (state, action) => {
        state.eventsLoading = false;
        state.eventsError = action.payload as string;
      })

      // Update State Event
      .addCase(updateStateEvent.pending, (state) => {
        state.eventsLoading = true;
        state.eventsError = null;
      })
      .addCase(updateStateEvent.fulfilled, (state, action) => {
        state.eventsLoading = false;
        const index = state.upcomingEvents.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.upcomingEvents[index] = action.payload;
        }
      })
      .addCase(updateStateEvent.rejected, (state, action) => {
        state.eventsLoading = false;
        state.eventsError = action.payload as string;
      })

      // Delete State Event
      .addCase(deleteStateEvent.pending, (state) => {
        state.eventsLoading = true;
        state.eventsError = null;
      })
      .addCase(deleteStateEvent.fulfilled, (state, action) => {
        state.eventsLoading = false;
        state.upcomingEvents = state.upcomingEvents.filter((e) => e.id !== action.payload);
      })
      .addCase(deleteStateEvent.rejected, (state, action) => {
        state.eventsLoading = false;
        state.eventsError = action.payload as string;
      })

      // Fetch State Clubs
      .addCase(fetchStateClubs.pending, (state) => {
        state.clubsLoading = true;
        state.clubsError = null;
      })
      .addCase(fetchStateClubs.fulfilled, (state, action) => {
        state.clubsLoading = false;
        state.clubs = action.payload;
      })
      .addCase(fetchStateClubs.rejected, (state, action) => {
        state.clubsLoading = false;
        state.clubsError = action.payload as string;
      })

      // Fetch State Members
      .addCase(fetchStateMembers.pending, (state) => {
        state.membersLoading = true;
        state.membersError = null;
      })
      .addCase(fetchStateMembers.fulfilled, (state, action) => {
        state.membersLoading = false;
        state.members = action.payload;
      })
      .addCase(fetchStateMembers.rejected, (state, action) => {
        state.membersLoading = false;
        state.membersError = action.payload as string;
      })

      // Fetch State Courts
      .addCase(fetchStateCourts.pending, (state) => {
        state.courtsLoading = true;
        state.courtsError = null;
      })
      .addCase(fetchStateCourts.fulfilled, (state, action) => {
        state.courtsLoading = false;
        const payload = action.payload as any;
        state.courts = payload.courts || payload.rows || [];
        if (payload.pagination) {
          state.courtsPagination = payload.pagination;
        }
      })
      .addCase(fetchStateCourts.rejected, (state, action) => {
        state.courtsLoading = false;
        state.courtsError = action.payload as string;
      })

      // Delete State Court
      .addCase(deleteStateCourt.pending, (state) => {
        state.courtsLoading = true;
        state.courtsError = null;
      })
      .addCase(deleteStateCourt.fulfilled, (state, action) => {
        state.courtsLoading = false;
        state.courts = state.courts.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteStateCourt.rejected, (state, action) => {
        state.courtsLoading = false;
        state.courtsError = action.payload as string;
      });
  },
});

export const { clearError } = stateDashboardSlice.actions;
export default stateDashboardSlice.reducer;
