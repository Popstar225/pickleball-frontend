import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';
import { LoginRequest, RegisterRequest, ProfileResponse, LoginResponse, RegisterResponse } from '../../types/api';

// Action creators that manage pending state
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterRequest | FormData, { rejectWithValue }) => {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ProfileResponse>('/auth/profile');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to get profile');
    }
  }
);

export const refreshUserData = createAsyncThunk(
  'auth/refreshUserData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ProfileResponse>('/auth/profile');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to refresh user data');
    }
  }
);

export const restoreAuthState = createAsyncThunk(
  'auth/restoreAuthState',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (token && refreshToken) {
      try {
        const response = await api.get<ProfileResponse>('/auth/profile');
        return response;
      } catch (error: any) {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        return rejectWithValue(error.response?.data?.message || error.message || 'Authentication failed');
      }
    } else {
      return rejectWithValue('No authentication tokens found');
    }
  }
);

// Initial state
const initialState = {
  user: null as any,
  token: null as string | null,
  refresh_token: null as string | null,
  loading: false,
  error: null as string | null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refresh_token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload);
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        
        // Check if payload is an error object (shouldn't happen with proper error handling, but safety check)
        if (payload && typeof payload === 'object' && 'message' in payload && 'name' in payload && payload.name === 'AxiosError') {
          console.error('Received error object in fulfilled case:', payload);
          state.error = payload.message || 'Login failed';
          state.isAuthenticated = false;
          return;
        }
        
        // Backend sends: { success: true, message: "...", data: { user: {...}, tokens: { accessToken, refreshToken } } }
        if (payload?.data?.user && payload?.data?.tokens) {
          state.user = payload.data.user;
          state.token = payload.data.tokens.accessToken;
          state.refresh_token = payload.data.tokens.refreshToken;
          state.isAuthenticated = true;
          
          // Store tokens in localStorage
          localStorage.setItem('token', payload.data.tokens.accessToken);
          localStorage.setItem('refresh_token', payload.data.tokens.refreshToken);
          
          console.log('Login successful - User and tokens stored in Redux:', {
            user: payload.data.user,
            hasToken: !!payload.data.tokens.accessToken,
            hasRefreshToken: !!payload.data.tokens.refreshToken,
            profilePhoto: payload.data.user.profile_photo,
            verificationDocuments: payload.data.user.verification_documents
          });
        } else {
          console.error('Invalid login response structure:', payload);
          state.error = 'Invalid response from server';
          state.isAuthenticated = false;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Login failed';
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        
        // Check if payload is an error object (shouldn't happen with proper error handling, but safety check)
        if (payload && typeof payload === 'object' && 'message' in payload && 'name' in payload && payload.name === 'AxiosError') {
          console.error('Received error object in fulfilled case:', payload);
          state.error = payload.message || 'Registration failed';
          state.isAuthenticated = false;
          return;
        }
        
        // Backend sends: { success: true, message: "...", data: { user: {...}, tokens: { accessToken, refreshToken } } }
        if (payload?.data?.user && payload?.data?.tokens) {
          state.user = payload.data.user;
          state.token = payload.data.tokens.accessToken;
          state.refresh_token = payload.data.tokens.refreshToken;
          state.isAuthenticated = true;
          
          // Store tokens in localStorage
          localStorage.setItem('token', payload.data.tokens.accessToken);
          localStorage.setItem('refresh_token', payload.data.tokens.refreshToken);
          
          console.log('Registration successful - User and tokens stored in Redux:', {
            user: payload.data.user,
            hasToken: !!payload.data.tokens.accessToken,
            hasRefreshToken: !!payload.data.tokens.refreshToken,
            profilePhoto: payload.data.user.profile_photo,
            verificationDocuments: payload.data.user.verification_documents
          });
        } else {
          console.error('Invalid register response structure:', payload);
          state.error = 'Invalid response from server';
          state.isAuthenticated = false;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Registration failed';
        state.isAuthenticated = false;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload?.data) {
          state.user = payload.data;
          state.isAuthenticated = true;
          
          console.log('Profile retrieved successfully:', {
            user: payload.data,
            profilePhoto: payload.data.profile_photo,
            verificationDocuments: payload.data.verification_documents
          });
        }
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to get profile';
        state.isAuthenticated = false;
      })
      // Restore Auth State
      .addCase(restoreAuthState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreAuthState.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload?.data) {
          state.user = payload.data;
          state.isAuthenticated = true;
          
          console.log('Auth state restored successfully:', {
            user: payload.data,
            profilePhoto: payload.data.profile_photo,
            verificationDocuments: payload.data.verification_documents
          });
        }
      })
      .addCase(restoreAuthState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to restore auth state';
        state.isAuthenticated = false;
      })
      // Refresh User Data
      .addCase(refreshUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshUserData.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload?.data) {
          state.user = payload.data;
          state.isAuthenticated = true;
          
          console.log('User data refreshed successfully:', {
            user: payload.data,
            profilePhoto: payload.data.profile_photo,
            verificationDocuments: payload.data.verification_documents
          });
        }
      })
      .addCase(refreshUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to refresh user data';
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, setToken, updateUser } = authSlice.actions;
export default authSlice.reducer; 