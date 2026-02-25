import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';
import { User, Pagination } from '../../types/api';

// Interfaces for admin dashboard data
export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalClubs: number;
  totalCourts: number;
  totalTournaments: number;
  monthlyRevenue: number;
  systemUptime: number;
  pendingApprovals: number;
  activeFederations: number;
  totalStates: number;
}

export interface SystemEvent {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  severity: 'Info' | 'Success' | 'Warning' | 'Error';
  user: string;
}

export interface PendingAction {
  id: number;
  type: string;
  count: number;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export interface RankingIssue {
  id: string;
  player_id: string;
  player_name: string;
  player_email: string;
  current_rank: number;
  requested_rank: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

export interface Microsite {
  id: number;
  name: string;
  type: 'state' | 'club' | 'partner';
  status: 'active' | 'pending' | 'inactive';
  lastUpdated: string;
  contentIssues: number;
  needsReview: boolean;
  url: string;
  owner: string;
  region: string;
}

export interface CourtPerformance {
  id: number;
  name: string;
  location: string;
  status: 'operational' | 'maintenance' | 'offline';
  uptime: number;
  responseTime: number;
  bookingsToday: number;
  utilization: number;
  lastMaintenance: string;
  nextMaintenance: string;
  issues: string[];
}

export interface Affiliation {
  id: number;
  entityName: string;
  entityType: 'club' | 'state' | 'partner';
  status: 'active' | 'pending' | 'suspended';
  region: string;
  memberCount: number;
  joinDate: string;
  renewalDate: string;
  complianceScore: number;
  lastAudit: string;
  contactPerson: string;
  contactEmail: string;
  benefits: string[];
}

export interface AdminMessage {
  id: number;
  subject: string;
  sender: string;
  recipients: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'sent' | 'delivered' | 'read';
  category: 'maintenance' | 'announcement' | 'update' | 'alert';
  sentAt: string;
  readAt?: string;
  content: string;
  attachments: string[];
  tags: string[];
}

// Initial state
interface AdminDashboardState {
  systemStats: SystemStats | null;
  recentSystemEvents: SystemEvent[];
  pendingActions: PendingAction[];
  rankingIssues: RankingIssue[];
  microsites: Microsite[];
  courtPerformance: CourtPerformance[];
  affiliations: Affiliation[];
  messages: AdminMessage[];
  adminUsers: User[];
  adminUsersPagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminDashboardState = {
  systemStats: null,
  recentSystemEvents: [],
  pendingActions: [],
  rankingIssues: [],
  microsites: [],
  courtPerformance: [],
  affiliations: [],
  messages: [],
  adminUsers: [],
  adminUsersPagination: null,
  loading: false,
  error: null,
};

// Admin users thunk
export const fetchAdminUsers = createAsyncThunk(
  'adminDashboard/fetchAdminUsers',
  async (params: Record<string, string | number>, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params as Record<string, string>).reduce(
          (acc, [k, v]) => {
            if (v !== undefined && v !== null && String(v) !== '') acc[k] = String(v);
            return acc;
          },
          {} as Record<string, string>,
        ),
      ).toString();
      const response = await api.get(`/admin/users?${queryString}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch admin users',
      );
    }
  },
);

// Async thunks
export const fetchAdminSystemStats = createAsyncThunk(
  'adminDashboard/fetchAdminSystemStats',
  async () => {
    const response = await api.get('/admin/system/stats');
    return (response as any).data.data;
  },
);

export const fetchAdminSystemEvents = createAsyncThunk(
  'adminDashboard/fetchAdminSystemEvents',
  async () => {
    const response = await api.get('/admin/system/events');
    return (response as any).data.data.events;
  },
);

export const fetchAdminPendingActions = createAsyncThunk(
  'adminDashboard/fetchAdminPendingActions',
  async () => {
    const response = await api.get('/admin/pending-actions');
    return (response as any).data.data.actions;
  },
);

export const fetchAdminRankingIssues = createAsyncThunk(
  'adminDashboard/fetchAdminRankingIssues',
  async () => {
    const response = await api.get('/admin/rankings/issues');
    return (response as any).data.data.issues;
  },
);

export const fetchAdminMicrosites = createAsyncThunk(
  'adminDashboard/fetchAdminMicrosites',
  async () => {
    const response = await api.get('/admin/microsites');
    return (response as any).data.data.microsites;
  },
);

export const fetchAdminCourtPerformance = createAsyncThunk(
  'adminDashboard/fetchAdminCourtPerformance',
  async () => {
    const response = await api.get('/admin/courts/performance');
    return (response as any).data.data.courts;
  },
);

export const fetchAdminAffiliations = createAsyncThunk(
  'adminDashboard/fetchAdminAffiliations',
  async () => {
    const response = await api.get('/admin/affiliations');
    return (response as any).data.data.affiliations;
  },
);

export const fetchAdminMessages = createAsyncThunk(
  'adminDashboard/fetchAdminMessages',
  async () => {
    const response = await api.get('/admin/messages');
    return (response as any).data.data.messages;
  },
);

// Slice
const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateSystemStats: (state, action) => {
      state.systemStats = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admin System Stats
      .addCase(fetchAdminSystemStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminSystemStats.fulfilled, (state, action) => {
        state.loading = false;
        state.systemStats = action.payload;
      })
      .addCase(fetchAdminSystemStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch admin system stats';
      })

      // Fetch Admin System Events
      .addCase(fetchAdminSystemEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminSystemEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.recentSystemEvents = action.payload;
      })
      .addCase(fetchAdminSystemEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch admin system events';
      })

      // Fetch Admin Pending Actions
      .addCase(fetchAdminPendingActions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminPendingActions.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingActions = action.payload;
      })
      .addCase(fetchAdminPendingActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch admin pending actions';
      })

      // Fetch Admin Ranking Issues
      .addCase(fetchAdminRankingIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminRankingIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.rankingIssues = action.payload;
      })
      .addCase(fetchAdminRankingIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch admin ranking issues';
      })

      // Fetch Admin Microsites
      .addCase(fetchAdminMicrosites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminMicrosites.fulfilled, (state, action) => {
        state.loading = false;
        state.microsites = action.payload;
      })
      .addCase(fetchAdminMicrosites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch admin microsites';
      })

      // Fetch Admin Court Performance
      .addCase(fetchAdminCourtPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminCourtPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.courtPerformance = action.payload;
      })
      .addCase(fetchAdminCourtPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch admin court performance';
      })

      // Fetch Admin Affiliations
      .addCase(fetchAdminAffiliations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminAffiliations.fulfilled, (state, action) => {
        state.loading = false;
        state.affiliations = action.payload;
      })
      .addCase(fetchAdminAffiliations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch admin affiliations';
      })

      // Fetch Admin Messages
      .addCase(fetchAdminMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchAdminMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch admin messages';
      });
    // Fetch Admin Users
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        // response expected: { success, message, data: users, pagination }
        state.adminUsers = payload?.data?.data || payload?.data || [];
        state.adminUsersPagination = payload?.data?.pagination || payload?.pagination || null;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || 'Failed to fetch admin users';
      });
  },
});

export const { clearError, updateSystemStats } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
