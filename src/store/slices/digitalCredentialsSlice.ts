/**
 * Digital Credentials Redux Slice - Optimized Implementation
 *
 * This slice manages the state for digital credentials including
 * creation, retrieval, updates, and management operations.
 *
 * @author Pickleball Federation Team
 * @version 2.0.0
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { digitalCredentialApi } from '../../lib/api';
import { DigitalCredential } from '../../types/api';

// State interface
interface DigitalCredentialsState {
  // Credential data
  myCredential: DigitalCredential | null;
  allCredentials: DigitalCredential[];
  selectedCredential: DigitalCredential | null;

  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  regeneratingQR: boolean;
  deleting: boolean;
  fetchingStats: boolean;

  // Error handling
  error: string | null;

  // Pagination and filters
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;

  // Statistics
  stats: {
    total: number;
    active: number;
    breakdown: Array<{
      affiliation_status: string;
      state_affiliation: string;
      is_verified: boolean;
      count: number;
    }>;
  } | null;
}

// Initial state
const initialState: DigitalCredentialsState = {
  myCredential: null,
  allCredentials: [],
  selectedCredential: null,
  loading: false,
  creating: false,
  updating: false,
  regeneratingQR: false,
  deleting: false,
  fetchingStats: false,
  error: null,
  pagination: null,
  stats: null,
};

// Async thunks
export const createDigitalCredential = createAsyncThunk(
  'digitalCredentials/create',
  async (_, { rejectWithValue }) => {
    try {
      const response = await digitalCredentialApi.create();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create digital credential',
      );
    }
  },
);

export const fetchMyDigitalCredential = createAsyncThunk(
  'digitalCredentials/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await digitalCredentialApi.getMyCredential();
      console.log('----------------------------', response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch digital credential');
    }
  },
);

export const fetchDigitalCredentialById = createAsyncThunk(
  'digitalCredentials/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await digitalCredentialApi.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch digital credential');
    }
  },
);

export const updateDigitalCredential = createAsyncThunk(
  'digitalCredentials/update',
  async ({ id, data }: { id: string; data: Partial<DigitalCredential> }, { rejectWithValue }) => {
    try {
      const response = await digitalCredentialApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update digital credential',
      );
    }
  },
);

export const regenerateQRCode = createAsyncThunk(
  'digitalCredentials/regenerateQR',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      if (!id) {
        throw new Error('Credential ID is required');
      }

      const response = await digitalCredentialApi.regenerateQR(id);

      // Validate response data
      if (!response.data || !response.data.qr_code_url || !response.data.qr_code_data) {
        throw new Error('Invalid response from server');
      }

      // Update the credential in the store with new QR code data
      const state = getState() as any;
      const currentCredential = state.digitalCredentials.myCredential;

      if (currentCredential && currentCredential.id === id) {
        return {
          id,
          updatedCredential: {
            ...currentCredential,
            qr_code_url: response.data.qr_code_url,
            qr_code_data: response.data.qr_code_data,
          },
          qr_code_url: response.data.qr_code_url,
          qr_code_data: response.data.qr_code_data,
        };
      }

      return {
        id,
        qr_code_url: response.data.qr_code_url,
        qr_code_data: response.data.qr_code_data,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to regenerate QR code';
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchAllDigitalCredentials = createAsyncThunk(
  'digitalCredentials/fetchAll',
  async (
    params: {
      page?: number;
      limit?: number;
      affiliation_status?: string;
      state_affiliation?: string;
      is_verified?: boolean;
      search?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await digitalCredentialApi.getAll(params);
      return {
        credentials: response.data,
        pagination: response.pagination,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch digital credentials',
      );
    }
  },
);

export const fetchCredentialStats = createAsyncThunk(
  'digitalCredentials/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await digitalCredentialApi.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch credential statistics',
      );
    }
  },
);

export const deleteDigitalCredential = createAsyncThunk(
  'digitalCredentials/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await digitalCredentialApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete digital credential',
      );
    }
  },
);

// Slice
const digitalCredentialsSlice = createSlice({
  name: 'digitalCredentials',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCredential: (state) => {
      state.myCredential = null;
    },
    clearSelectedCredential: (state) => {
      state.selectedCredential = null;
    },
    clearAllCredentials: (state) => {
      state.allCredentials = [];
      state.pagination = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
    setSelectedCredential: (state, action: PayloadAction<DigitalCredential | null>) => {
      state.selectedCredential = action.payload;
    },
    resetState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Create digital credential
    builder
      .addCase(createDigitalCredential.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(
        createDigitalCredential.fulfilled,
        (state, action: PayloadAction<DigitalCredential>) => {
          state.creating = false;
          state.myCredential = action.payload;
          state.error = null;
        },
      )
      .addCase(createDigitalCredential.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });

    // Fetch my digital credential
    builder
      .addCase(fetchMyDigitalCredential.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMyDigitalCredential.fulfilled,
        (state, action: PayloadAction<DigitalCredential>) => {
          state.loading = false;
          state.myCredential = action.payload;
          state.error = null;
        },
      )
      .addCase(fetchMyDigitalCredential.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch digital credential by ID
    builder
      .addCase(fetchDigitalCredentialById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDigitalCredentialById.fulfilled,
        (state, action: PayloadAction<DigitalCredential>) => {
          state.loading = false;
          state.selectedCredential = action.payload;
          state.error = null;
        },
      )
      .addCase(fetchDigitalCredentialById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update digital credential
    builder
      .addCase(updateDigitalCredential.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(
        updateDigitalCredential.fulfilled,
        (state, action: PayloadAction<DigitalCredential>) => {
          state.updating = false;
          state.myCredential = action.payload;
          if (state.selectedCredential?.id === action.payload.id) {
            state.selectedCredential = action.payload;
          }
          state.error = null;
        },
      )
      .addCase(updateDigitalCredential.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // Regenerate QR code
    builder
      .addCase(regenerateQRCode.pending, (state) => {
        state.regeneratingQR = true;
        state.error = null;
      })
      .addCase(
        regenerateQRCode.fulfilled,
        (
          state,
          action: PayloadAction<{
            id: string;
            qr_code_url: string;
            qr_code_data: string;
            updatedCredential?: DigitalCredential;
          }>,
        ) => {
          state.regeneratingQR = false;
          if (action.payload.updatedCredential) {
            state.myCredential = action.payload.updatedCredential;
          } else if (state.myCredential && state.myCredential.id === action.payload.id) {
            state.myCredential.qr_code_url = action.payload.qr_code_url;
            state.myCredential.qr_code_data = action.payload.qr_code_data;
          }
          if (state.selectedCredential && state.selectedCredential.id === action.payload.id) {
            state.selectedCredential.qr_code_url = action.payload.qr_code_url;
            state.selectedCredential.qr_code_data = action.payload.qr_code_data;
          }
          state.error = null;
        },
      )
      .addCase(regenerateQRCode.rejected, (state, action) => {
        state.regeneratingQR = false;
        state.error = action.payload as string;
      });

    // Fetch all digital credentials
    builder
      .addCase(fetchAllDigitalCredentials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllDigitalCredentials.fulfilled,
        (
          state,
          action: PayloadAction<{
            credentials: DigitalCredential[];
            pagination: {
              page: number;
              limit: number;
              total: number;
              pages: number;
            };
          }>,
        ) => {
          state.loading = false;
          state.allCredentials = action.payload.credentials;
          state.pagination = action.payload.pagination;
          state.error = null;
        },
      )
      .addCase(fetchAllDigitalCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch credential statistics
    builder
      .addCase(fetchCredentialStats.pending, (state) => {
        state.fetchingStats = true;
        state.error = null;
      })
      .addCase(
        fetchCredentialStats.fulfilled,
        (
          state,
          action: PayloadAction<{
            total: number;
            active: number;
            breakdown: Array<{
              affiliation_status: string;
              state_affiliation: string;
              is_verified: boolean;
              count: number;
            }>;
          }>,
        ) => {
          state.fetchingStats = false;
          state.stats = action.payload;
          state.error = null;
        },
      )
      .addCase(fetchCredentialStats.rejected, (state, action) => {
        state.fetchingStats = false;
        state.error = action.payload as string;
      });

    // Delete digital credential
    builder
      .addCase(deleteDigitalCredential.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteDigitalCredential.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        // Remove from all credentials list
        state.allCredentials = state.allCredentials.filter((cred) => cred.id !== action.payload);
        // Clear selected credential if it was deleted
        if (state.selectedCredential?.id === action.payload) {
          state.selectedCredential = null;
        }
        // Clear my credential if it was deleted
        if (state.myCredential?.id === action.payload) {
          state.myCredential = null;
        }
        state.error = null;
      })
      .addCase(deleteDigitalCredential.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  clearCredential,
  clearSelectedCredential,
  clearAllCredentials,
  clearStats,
  setSelectedCredential,
  resetState,
} = digitalCredentialsSlice.actions;

// Export selectors
export const selectMyDigitalCredential = (state: { digitalCredentials: DigitalCredentialsState }) =>
  state.digitalCredentials.myCredential;
export const selectAllDigitalCredentials = (state: {
  digitalCredentials: DigitalCredentialsState;
}) => state.digitalCredentials.allCredentials;
export const selectSelectedCredential = (state: { digitalCredentials: DigitalCredentialsState }) =>
  state.digitalCredentials.selectedCredential;
export const selectDigitalCredentialsLoading = (state: {
  digitalCredentials: DigitalCredentialsState;
}) => state.digitalCredentials.loading;
export const selectDigitalCredentialsError = (state: {
  digitalCredentials: DigitalCredentialsState;
}) => state.digitalCredentials.error;
export const selectDigitalCredentialsCreating = (state: {
  digitalCredentials: DigitalCredentialsState;
}) => state.digitalCredentials.creating;
export const selectDigitalCredentialsUpdating = (state: {
  digitalCredentials: DigitalCredentialsState;
}) => state.digitalCredentials.updating;
export const selectDigitalCredentialsRegeneratingQR = (state: {
  digitalCredentials: DigitalCredentialsState;
}) => state.digitalCredentials.regeneratingQR;
export const selectDigitalCredentialsDeleting = (state: {
  digitalCredentials: DigitalCredentialsState;
}) => state.digitalCredentials.deleting;
export const selectDigitalCredentialsFetchingStats = (state: {
  digitalCredentials: DigitalCredentialsState;
}) => state.digitalCredentials.fetchingStats;
export const selectDigitalCredentialsPagination = (state: {
  digitalCredentials: DigitalCredentialsState;
}) => state.digitalCredentials.pagination;
export const selectDigitalCredentialsStats = (state: {
  digitalCredentials: DigitalCredentialsState;
}) => state.digitalCredentials.stats;

// Export reducer
export default digitalCredentialsSlice.reducer;
