import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

interface RankingIssue {
  id: string;
  player_id: string;
  player_name: string;
  player_email: string;
  current_rank: number;
  requested_rank: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  tournament_results?: any[];
  skill_assessment?: any;
  previous_rankings?: any[];
}

interface RankingIssueRequest {
  player_id: string;
  requested_rank: number;
  reason: string;
  supporting_evidence?: any;
}

interface RankingIssueUpdate {
  status: 'approved' | 'rejected';
  review_notes?: string;
  new_rank?: number;
}

interface RankingsState {
  rankingIssues: RankingIssue[];
  selectedIssue: RankingIssue | null;
  playerRankings: any[]; // Add player rankings state
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  } | null;
}

const initialState: RankingsState = {
  rankingIssues: [],
  selectedIssue: null,
  playerRankings: [], // Initialize player rankings
  loading: false,
  error: null,
  pagination: null,
  stats: null,
};

// Async thunks
export const fetchRankingIssues = createAsyncThunk(
  'rankings/fetchIssues',
  async (params?: {
    status?: string;
    player_id?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/admin/rankings/issues${queryString ? `?${queryString}` : ''}`);
    return response;
  }
);

export const fetchPlayerRankings = createAsyncThunk(
  'rankings/fetchPlayerRankings',
  async (params?: {
    category?: string;
    skill_level?: string;
    state?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/rankings${queryString ? `?${queryString}` : ''}`);
    return response;
  }
);

export const fetchRankingIssueById = createAsyncThunk(
  'rankings/fetchIssueById',
  async (id: string) => {
    const response = await api.get(`/admin/rankings/issues/${id}`);
    return response;
  }
);

export const createRankingIssue = createAsyncThunk(
  'rankings/createIssue',
  async (issueData: RankingIssueRequest) => {
    const response = await api.post('/admin/rankings/issues', issueData);
    return response;
  }
);

export const updateRankingIssue = createAsyncThunk(
  'rankings/updateIssue',
  async ({ id, issueData }: { id: string; issueData: RankingIssueUpdate }) => {
    const response = await api.put(`/admin/rankings/issues/${id}`, issueData);
    return response;
  }
);

export const deleteRankingIssue = createAsyncThunk(
  'rankings/deleteIssue',
  async (id: string) => {
    await api.delete(`/admin/rankings/issues/${id}`);
    return id;
  }
);

export const approveRankingIssue = createAsyncThunk(
  'rankings/approveIssue',
  async ({ id, newRank, notes }: { id: string; newRank: number; notes?: string }) => {
    const response = await api.post(`/admin/rankings/issues/${id}/approve`, { new_rank: newRank, review_notes: notes });
    return response;
  }
);

export const rejectRankingIssue = createAsyncThunk(
  'rankings/rejectIssue',
  async ({ id, notes }: { id: string; notes?: string }) => {
    const response = await api.post(`/admin/rankings/issues/${id}/reject`, { review_notes: notes });
    return response;
  }
);

export const fetchRankingStats = createAsyncThunk(
  'rankings/fetchStats',
  async () => {
    const response = await api.get('/admin/rankings/stats');
    return response;
  }
);

export const exportRankingsReport = createAsyncThunk(
  'rankings/exportReport',
  async (params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
    format?: 'csv' | 'excel' | 'pdf';
  }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/admin/rankings/export${queryString ? `?${queryString}` : ''}`, {
      responseType: 'blob'
    });
    return response;
  }
);

const rankingsSlice = createSlice({
  name: 'rankings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedIssue: (state, action) => {
      state.selectedIssue = action.payload;
    },
    clearSelectedIssue: (state) => {
      state.selectedIssue = null;
    },
    clearRankingIssues: (state) => {
      state.rankingIssues = [];
      state.pagination = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Ranking Issues
      .addCase(fetchRankingIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRankingIssues.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data) {
          state.rankingIssues = payload.data.issues || [];
          state.pagination = payload.data.pagination || null;
        }
      })
      .addCase(fetchRankingIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ranking issues';
      })
      // Fetch Ranking Issue by ID
      .addCase(fetchRankingIssueById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRankingIssueById.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data) {
          state.selectedIssue = payload.data.issue;
        }
      })
      .addCase(fetchRankingIssueById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ranking issue';
      })
      // Create Ranking Issue
      .addCase(createRankingIssue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRankingIssue.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data?.issue) {
          state.rankingIssues.unshift(payload.data.issue);
        }
      })
      .addCase(createRankingIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create ranking issue';
      })
      // Update Ranking Issue
      .addCase(updateRankingIssue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRankingIssue.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data?.issue) {
          const index = state.rankingIssues.findIndex(issue => issue.id === payload.data.issue.id);
          if (index !== -1) {
            state.rankingIssues[index] = payload.data.issue;
          }
          if (state.selectedIssue?.id === payload.data.issue.id) {
            state.selectedIssue = payload.data.issue;
          }
        }
      })
      .addCase(updateRankingIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update ranking issue';
      })
      // Delete Ranking Issue
      .addCase(deleteRankingIssue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRankingIssue.fulfilled, (state, action) => {
        state.loading = false;
        const issueId = action.payload as string;
        state.rankingIssues = state.rankingIssues.filter(issue => issue.id !== issueId);
        if (state.selectedIssue?.id === issueId) {
          state.selectedIssue = null;
        }
      })
      .addCase(deleteRankingIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete ranking issue';
      })
      // Approve Ranking Issue
      .addCase(approveRankingIssue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveRankingIssue.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data?.issue) {
          const index = state.rankingIssues.findIndex(issue => issue.id === payload.data.issue.id);
          if (index !== -1) {
            state.rankingIssues[index] = payload.data.issue;
          }
          if (state.selectedIssue?.id === payload.data.issue.id) {
            state.selectedIssue = payload.data.issue;
          }
        }
      })
      .addCase(approveRankingIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to approve ranking issue';
      })
      // Reject Ranking Issue
      .addCase(rejectRankingIssue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectRankingIssue.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data?.issue) {
          const index = state.rankingIssues.findIndex(issue => issue.id === payload.data.issue.id);
          if (index !== -1) {
            state.rankingIssues[index] = payload.data.issue;
          }
          if (state.selectedIssue?.id === payload.data.issue.id) {
            state.selectedIssue = payload.data.issue;
          }
        }
      })
      .addCase(rejectRankingIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reject ranking issue';
      })
      // Fetch Ranking Stats
      .addCase(fetchRankingStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRankingStats.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        if (payload?.data) {
          state.stats = payload.data;
        }
      })
      .addCase(fetchRankingStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ranking stats';
      })
      // Export Rankings Report
      .addCase(exportRankingsReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportRankingsReport.fulfilled, (state, action) => {
        state.loading = false;
        // Handle file download
        const blob = new Blob([action.payload as BlobPart], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rankings-report.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .addCase(exportRankingsReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to export rankings report';
      })
      // Fetch Player Rankings
      .addCase(fetchPlayerRankings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayerRankings.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.playerRankings = payload?.data?.rankings || [];
        state.pagination = payload?.data?.pagination || null;
      })
      .addCase(fetchPlayerRankings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch player rankings';
      });
  },
});

export const {
  clearError,
  setSelectedIssue,
  clearSelectedIssue,
  clearRankingIssues,
  clearStats,
} = rankingsSlice.actions;

export default rankingsSlice.reducer; 