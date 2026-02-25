import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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

// Initial state
interface StateDashboardState {
  profile: StateProfile | null;
  stats: StateStats | null;
  activities: StateActivity[];
  upcomingEvents: StateEvent[];
  clubs: StateClub[];
  members: StateMember[];

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

// Helper for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
};

// Async thunks
export const fetchStateProfile = createAsyncThunk(
  'stateDashboard/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiCall('/api/state/profile');
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateStateProfile = createAsyncThunk(
  'stateDashboard/updateProfile',
  async (profileData: Partial<StateProfile>, { rejectWithValue }) => {
    try {
      const data = await apiCall('/api/state/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteStateAccount = createAsyncThunk(
  'stateDashboard/deleteAccount',
  async (confirmationToken: string, { rejectWithValue }) => {
    try {
      const data = await apiCall('/api/state/account', {
        method: 'DELETE',
        body: JSON.stringify({ confirmationToken }),
      });
      return data.message;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchStateStatistics = createAsyncThunk(
  'stateDashboard/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiCall('/api/state/statistics');
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchStateActivities = createAsyncThunk(
  'stateDashboard/fetchActivities',
  async ({ limit = 10, offset = 0 }: { limit?: number; offset?: number }, { rejectWithValue }) => {
    try {
      const data = await apiCall(`/api/state/activities?limit=${limit}&offset=${offset}`);
      return data.data.activities;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchUpcomingEvents = createAsyncThunk(
  'stateDashboard/fetchUpcomingEvents',
  async ({ limit = 10 }: { limit?: number }, { rejectWithValue }) => {
    try {
      const data = await apiCall(`/api/state/events/upcoming?limit=${limit}`);
      return data.data.events;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const createStateEvent = createAsyncThunk(
  'stateDashboard/createEvent',
  async (eventData: Partial<StateEvent>, { rejectWithValue }) => {
    try {
      const data = await apiCall('/api/state/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
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
      const data = await apiCall(`/api/state/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
      });
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteStateEvent = createAsyncThunk(
  'stateDashboard/deleteEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const data = await apiCall(`/api/state/events/${eventId}`, {
        method: 'DELETE',
      });
      return eventId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchStateClubs = createAsyncThunk(
  'stateDashboard/fetchClubs',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiCall('/api/state/clubs');
      return data.data.clubs;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchStateMembers = createAsyncThunk(
  'stateDashboard/fetchMembers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiCall('/api/state/members');
      return data.data.members;
    } catch (error: any) {
      return rejectWithValue(error.message);
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
      });
  },
});

export const { clearError } = stateDashboardSlice.actions;
export default stateDashboardSlice.reducer;
