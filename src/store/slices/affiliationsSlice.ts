import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// Interfaces for affiliations
export interface Affiliation {
  id: string;
  entity_name: string;
  entity_type: 'club' | 'state' | 'partner';
  status: 'active' | 'pending' | 'suspended' | 'expired';
  region: string;
  member_count: number;
  join_date: string;
  renewal_date: string;
  compliance_score: number;
  last_audit: string;
  contact_person: string;
  contact_email: string;
  benefits: string[];
  created_at: string;
  updated_at: string;
}

export interface AffiliationRequest {
  entity_name: string;
  entity_type: 'club' | 'state' | 'partner';
  region: string;
  contact_person: string;
  contact_email: string;
  benefits?: string[];
}

export interface AffiliationUpdate {
  entity_name?: string;
  entity_type?: 'club' | 'state' | 'partner';
  region?: string;
  contact_person?: string;
  contact_email?: string;
  benefits?: string[];
}

export interface AffiliationStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  expired: number;
  total_members: number;
  average_compliance: number;
  by_region: Record<string, number>;
  by_type: Record<string, number>;
}

// State interface
interface AffiliationsState {
  affiliations: Affiliation[];
  selectedAffiliation: Affiliation | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  stats: AffiliationStats | null;
}

// Initial state
const initialState: AffiliationsState = {
  affiliations: [],
  selectedAffiliation: null,
  loading: false,
  error: null,
  pagination: null,
  stats: null,
};

// Async thunks
export const fetchAffiliations = createAsyncThunk(
  'affiliations/fetchAll',
  async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    region?: string;
    search?: string;
  }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/admin/affiliations${queryString ? `?${queryString}` : ''}`);
    return response as { data: Affiliation[]; pagination?: any };
  }
);

export const fetchAffiliationById = createAsyncThunk(
  'affiliations/fetchById',
  async (id: string) => {
    const response = await api.get(`/admin/affiliations/${id}`);
    return response as Affiliation;
  }
);

export const createAffiliation = createAsyncThunk(
  'affiliations/create',
  async (affiliationData: AffiliationRequest) => {
    const response = await api.post('/admin/affiliations', affiliationData);
    return response as Affiliation;
  }
);

export const updateAffiliation = createAsyncThunk(
  'affiliations/update',
  async ({ id, affiliationData }: { id: string; affiliationData: AffiliationUpdate }) => {
    const response = await api.put(`/admin/affiliations/${id}`, affiliationData);
    return response as Affiliation;
  }
);

export const deleteAffiliation = createAsyncThunk(
  'affiliations/delete',
  async (id: string) => {
    await api.delete(`/admin/affiliations/${id}`);
    return id;
  }
);

export const approveAffiliation = createAsyncThunk(
  'affiliations/approve',
  async ({ id, notes }: { id: string; notes?: string }) => {
    const response = await api.post(`/admin/affiliations/${id}/approve`, { review_notes: notes });
    return response as Affiliation;
  }
);

export const rejectAffiliation = createAsyncThunk(
  'affiliations/reject',
  async ({ id, notes }: { id: string; notes?: string }) => {
    const response = await api.post(`/admin/affiliations/${id}/reject`, { review_notes: notes });
    return response as Affiliation;
  }
);

export const suspendAffiliation = createAsyncThunk(
  'affiliations/suspend',
  async ({ id, reason }: { id: string; reason: string }) => {
    const response = await api.post(`/admin/affiliations/${id}/suspend`, { reason });
    return response as Affiliation;
  }
);

export const reactivateAffiliation = createAsyncThunk(
  'affiliations/reactivate',
  async ({ id, notes }: { id: string; notes?: string }) => {
    const response = await api.post(`/admin/affiliations/${id}/reactivate`, { notes });
    return response as Affiliation;
  }
);

export const fetchAffiliationStats = createAsyncThunk(
  'affiliations/fetchStats',
  async () => {
    const response = await api.get('/admin/affiliations/stats');
    return response as AffiliationStats;
  }
);

export const exportAffiliationsReport = createAsyncThunk(
  'affiliations/exportReport',
  async (params?: {
    type?: string;
    status?: string;
    region?: string;
    start_date?: string;
    end_date?: string;
    format?: 'csv' | 'excel' | 'pdf';
  }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await api.get(`/admin/affiliations/export${queryString ? `?${queryString}` : ''}`, {
      responseType: 'blob'
    });
    return response;
  }
);

// Slice
const affiliationsSlice = createSlice({
  name: 'affiliations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAffiliation: (state, action) => {
      state.selectedAffiliation = action.payload;
    },
    clearSelectedAffiliation: (state) => {
      state.selectedAffiliation = null;
    },
    clearAffiliations: (state) => {
      state.affiliations = [];
      state.pagination = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Affiliations
      .addCase(fetchAffiliations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAffiliations.fulfilled, (state, action) => {
        state.loading = false;
        state.affiliations = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchAffiliations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch affiliations';
      })
      
      // Fetch Affiliation by ID
      .addCase(fetchAffiliationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAffiliationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAffiliation = action.payload;
      })
      .addCase(fetchAffiliationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch affiliation';
      })
      
      // Create Affiliation
      .addCase(createAffiliation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAffiliation.fulfilled, (state, action) => {
        state.loading = false;
        state.affiliations.unshift(action.payload);
        if (state.pagination) {
          state.pagination.total += 1;
        }
      })
      .addCase(createAffiliation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create affiliation';
      })
      
      // Update Affiliation
      .addCase(updateAffiliation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAffiliation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.affiliations.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.affiliations[index] = action.payload;
        }
        if (state.selectedAffiliation?.id === action.payload.id) {
          state.selectedAffiliation = action.payload;
        }
      })
      .addCase(updateAffiliation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update affiliation';
      })
      
      // Delete Affiliation
      .addCase(deleteAffiliation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAffiliation.fulfilled, (state, action) => {
        state.loading = false;
        state.affiliations = state.affiliations.filter(a => a.id !== action.payload);
        if (state.pagination) {
          state.pagination.total -= 1;
        }
        if (state.selectedAffiliation?.id === action.payload) {
          state.selectedAffiliation = null;
        }
      })
      .addCase(deleteAffiliation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete affiliation';
      })
      
      // Approve Affiliation
      .addCase(approveAffiliation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveAffiliation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.affiliations.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.affiliations[index] = action.payload;
        }
        if (state.selectedAffiliation?.id === action.payload.id) {
          state.selectedAffiliation = action.payload;
        }
      })
      .addCase(approveAffiliation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to approve affiliation';
      })
      
      // Reject Affiliation
      .addCase(rejectAffiliation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectAffiliation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.affiliations.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.affiliations[index] = action.payload;
        }
        if (state.selectedAffiliation?.id === action.payload.id) {
          state.selectedAffiliation = action.payload;
        }
      })
      .addCase(rejectAffiliation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reject affiliation';
      })
      
      // Suspend Affiliation
      .addCase(suspendAffiliation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(suspendAffiliation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.affiliations.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.affiliations[index] = action.payload;
        }
        if (state.selectedAffiliation?.id === action.payload.id) {
          state.selectedAffiliation = action.payload;
        }
      })
      .addCase(suspendAffiliation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to suspend affiliation';
      })
      
      // Reactivate Affiliation
      .addCase(reactivateAffiliation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reactivateAffiliation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.affiliations.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.affiliations[index] = action.payload;
        }
        if (state.selectedAffiliation?.id === action.payload.id) {
          state.selectedAffiliation = action.payload;
        }
      })
      .addCase(reactivateAffiliation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reactivate affiliation';
      })
      
      // Fetch Stats
      .addCase(fetchAffiliationStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAffiliationStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAffiliationStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch affiliation stats';
      })
      
      // Export Report
      .addCase(exportAffiliationsReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportAffiliationsReport.fulfilled, (state, action) => {
        state.loading = false;
        // Handle file download
        const url = window.URL.createObjectURL(action.payload as Blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'affiliations-report.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .addCase(exportAffiliationsReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to export affiliations report';
      });
  },
});

// Export actions and reducer
export const {
  clearError,
  setSelectedAffiliation,
  clearSelectedAffiliation,
  clearAffiliations,
  clearStats,
} = affiliationsSlice.actions;

export default affiliationsSlice.reducer; 