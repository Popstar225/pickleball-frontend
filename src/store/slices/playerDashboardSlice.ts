import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// Interfaces for player dashboard data
export interface PlayerProfile {
  id: string;
  fullName: string;
  dateOfBirth: string;
  age: string | number;
  gender: string;
  state: string;
  curp: string;
  ineOrPassport: string | null;
  nrtpLevel: string;
  email: string;
  phone: string;
  profilePhoto: string | null;
  username: string;
  membershipStatus: string;
  city: string;
  bio: string | null;
  emergencyContact: string | null;
  medicalInfo: string | null;
  joinedDate: string | null;
  lastActive: string | null;
  totalTournaments: number;
  ranking: string | null;
  currentClub: string | null;
  // Legacy fields for backward compatibility
  user_type?: string;
  role?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  rfc?: string | null;
  business_name?: string | null;
  contact_person?: string | null;
  job_title?: string | null;
  website?: string | null;
  membership_expires_at?: string | null;
  email_verified?: boolean;
  preferences?: any | null;
  is_active?: boolean;
  is_verified?: boolean;
  verification_documents?: any | null;
  notes?: string | null;
  can_be_found?: boolean;
  club_id?: string | null;
}

export interface PlayerCredential {
  id: string;
  playerId: string;
  credentialType: string;
  credentialNumber: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  federalCode: string;
  qrCodeUrl: string;
  createdAt: string;
}

export interface PlayerClub {
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

export interface PlayerTournament {
  id: string;
  playerId: string;
  tournamentId: string;
  tournamentName: string;
  category: string;
  registrationDate: string;
  status: string;
  paymentStatus: string;
  registrationFee: number;
}

export interface PlayerMessage {
  id: string;
  senderId: string;
  senderName: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
}

export interface PlayerPayment {
  id: string;
  paymentDate: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId: string;
  invoice: string;
}

// Initial state
interface PlayerDashboardState {
  profile: PlayerProfile | null;
  credentials: PlayerCredential[];
  myClubs: PlayerClub[];
  tournaments: PlayerTournament[];
  messages: PlayerMessage[];
  payments: PlayerPayment[];

  // Loading states
  profileLoading: boolean;
  credentialsLoading: boolean;
  clubsLoading: boolean;
  tournamentsLoading: boolean;
  messagesLoading: boolean;
  paymentsLoading: boolean;

  // Error states
  profileError: string | null;
  credentialsError: string | null;
  clubsError: string | null;
  tournamentsError: string | null;
  messagesError: string | null;
  paymentsError: string | null;
}

const initialState: PlayerDashboardState = {
  profile: null,
  credentials: [],
  myClubs: [],
  tournaments: [],
  messages: [],
  payments: [],

  profileLoading: false,
  credentialsLoading: false,
  clubsLoading: false,
  tournamentsLoading: false,
  messagesLoading: false,
  paymentsLoading: false,

  profileError: null,
  credentialsError: null,
  clubsError: null,
  tournamentsError: null,
  messagesError: null,
  paymentsError: null,
};

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

export const fetchPlayerProfile = createAsyncThunk(
  'playerDashboard/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/players/profile');
      console.log('-------------------', response);
      // For debugging, just return the response data as-is
      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch player profile',
      );
    }
  },
);

export const updatePlayerProfile = createAsyncThunk(
  'playerDashboard/updateProfile',
  async (profileData: FormData | Partial<PlayerProfile>, { rejectWithValue }) => {
    try {
      const response = await api.put('/players/profile', profileData);
      return (response as any).data;
    } catch (error: any) {
      console.error('[updatePlayerProfile] Error response:', error.response);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update player profile',
      );
    }
  },
);

export const deletePlayerAccount = createAsyncThunk(
  'playerDashboard/deleteAccount',
  async (confirmationToken: string, { rejectWithValue }) => {
    try {
      const response = await api.delete('/players/account', {
        data: { confirmationToken },
      });
      return (response as any).data.message;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete player account',
      );
    }
  },
);

export const fetchPlayerCredentials = createAsyncThunk(
  'playerDashboard/fetchCredentials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/players/credentials');
      return (response as any).data.data.credentials;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch player credentials',
      );
    }
  },
);

export const renewPlayerCredential = createAsyncThunk(
  'playerDashboard/renewCredential',
  async (
    {
      credentialId,
      stripePaymentMethodId,
    }: { credentialId: string; stripePaymentMethodId: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post('/players/credentials/renew', {
        credentialId,
        stripePaymentMethodId,
      });
      return (response as any).data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to renew player credential',
      );
    }
  },
);

export const searchClubs = createAsyncThunk(
  'playerDashboard/searchClubs',
  async (
    {
      query,
      city,
      limit = 10,
      offset = 0,
    }: { query: string; city?: string; limit?: number; offset?: number },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        offset: offset.toString(),
      });
      if (city) params.append('city', city);
      const response = await api.get(`/players/clubs/search?${params}`);
      return (response as any).data.data.clubs;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to search clubs',
      );
    }
  },
);

export const joinClub = createAsyncThunk(
  'playerDashboard/joinClub',
  async ({ clubId, message }: { clubId: string; message?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/players/clubs/join', {
        clubId,
        message,
      });
      return (response as any).data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to join club',
      );
    }
  },
);

export const fetchPlayerClubs = createAsyncThunk(
  'playerDashboard/fetchClubs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/players/clubs/my-clubs');
      return (response as any).data.data.clubs;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch player clubs',
      );
    }
  },
);

export const fetchPlayerTournaments = createAsyncThunk(
  'playerDashboard/fetchTournaments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/players/tournaments');
      return (response as any).data.data.registrations;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch player tournaments',
      );
    }
  },
);

export const registerTournament = createAsyncThunk(
  'playerDashboard/registerTournament',
  async (
    { tournamentId, category }: { tournamentId: string; category: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post('/players/tournaments/register', {
        tournamentId,
        category,
      });
      return (response as any).data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to register for tournament',
      );
    }
  },
);

export const fetchPlayerMessages = createAsyncThunk(
  'playerDashboard/fetchMessages',
  async (
    { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get(`/players/messages?limit=${limit}&offset=${offset}`);
      return (response as any).data.data.messages;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch player messages',
      );
    }
  },
);

export const sendPlayerMessage = createAsyncThunk(
  'playerDashboard/sendMessage',
  async (
    { recipientId, subject, body }: { recipientId: string; subject: string; body: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post('/players/messages', {
        recipientId,
        subject,
        body,
      });
      return (response as any).data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to send player message',
      );
    }
  },
);

export const fetchPlayerPayments = createAsyncThunk(
  'playerDashboard/fetchPayments',
  async (
    { limit = 10, offset = 0 }: { limit?: number; offset?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get(`/players/payments?limit=${limit}&offset=${offset}`);
      return (response as any).data.data.payments;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch player payments',
      );
    }
  },
);

// Slice
const playerDashboardSlice = createSlice({
  name: 'playerDashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.profileError = null;
      state.credentialsError = null;
      state.clubsError = null;
      state.tournamentsError = null;
      state.messagesError = null;
      state.paymentsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Player Profile
      .addCase(fetchPlayerProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchPlayerProfile.fulfilled, (state, action) => {
        console.log('[Redux] fetchPlayerProfile.fulfilled - action.payload:', action.payload);
        console.log('[Redux] fetchPlayerProfile.fulfilled - current state:', state);
        state.profileLoading = false;
        state.profile = action.payload;
        console.log('[Redux] fetchPlayerProfile.fulfilled - updated state:', state);
      })
      .addCase(fetchPlayerProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })

      // Update Player Profile
      .addCase(updatePlayerProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(updatePlayerProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(updatePlayerProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })

      // Delete Player Account
      .addCase(deletePlayerAccount.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(deletePlayerAccount.fulfilled, (state) => {
        state.profileLoading = false;
        state.profile = null;
      })
      .addCase(deletePlayerAccount.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })

      // Fetch Player Credentials
      .addCase(fetchPlayerCredentials.pending, (state) => {
        state.credentialsLoading = true;
        state.credentialsError = null;
      })
      .addCase(fetchPlayerCredentials.fulfilled, (state, action) => {
        state.credentialsLoading = false;
        state.credentials = action.payload;
      })
      .addCase(fetchPlayerCredentials.rejected, (state, action) => {
        state.credentialsLoading = false;
        state.credentialsError = action.payload as string;
      })

      // Renew Player Credential
      .addCase(renewPlayerCredential.pending, (state) => {
        state.credentialsLoading = true;
        state.credentialsError = null;
      })
      .addCase(renewPlayerCredential.fulfilled, (state) => {
        state.credentialsLoading = false;
      })
      .addCase(renewPlayerCredential.rejected, (state, action) => {
        state.credentialsLoading = false;
        state.credentialsError = action.payload as string;
      })

      // Fetch Player Clubs
      .addCase(fetchPlayerClubs.pending, (state) => {
        state.clubsLoading = true;
        state.clubsError = null;
      })
      .addCase(fetchPlayerClubs.fulfilled, (state, action) => {
        state.clubsLoading = false;
        state.myClubs = action.payload;
      })
      .addCase(fetchPlayerClubs.rejected, (state, action) => {
        state.clubsLoading = false;
        state.clubsError = action.payload as string;
      })

      // Join Club
      .addCase(joinClub.pending, (state) => {
        state.clubsLoading = true;
        state.clubsError = null;
      })
      .addCase(joinClub.fulfilled, (state) => {
        state.clubsLoading = false;
      })
      .addCase(joinClub.rejected, (state, action) => {
        state.clubsLoading = false;
        state.clubsError = action.payload as string;
      })

      // Fetch Player Tournaments
      .addCase(fetchPlayerTournaments.pending, (state) => {
        state.tournamentsLoading = true;
        state.tournamentsError = null;
      })
      .addCase(fetchPlayerTournaments.fulfilled, (state, action) => {
        state.tournamentsLoading = false;
        state.tournaments = action.payload;
      })
      .addCase(fetchPlayerTournaments.rejected, (state, action) => {
        state.tournamentsLoading = false;
        state.tournamentsError = action.payload as string;
      })

      // Register Tournament
      .addCase(registerTournament.pending, (state) => {
        state.tournamentsLoading = true;
        state.tournamentsError = null;
      })
      .addCase(registerTournament.fulfilled, (state, action) => {
        state.tournamentsLoading = false;
        state.tournaments.push(action.payload);
      })
      .addCase(registerTournament.rejected, (state, action) => {
        state.tournamentsLoading = false;
        state.tournamentsError = action.payload as string;
      })

      // Fetch Player Messages
      .addCase(fetchPlayerMessages.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(fetchPlayerMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchPlayerMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload as string;
      })

      // Send Player Message
      .addCase(sendPlayerMessage.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(sendPlayerMessage.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendPlayerMessage.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload as string;
      })

      // Fetch Player Payments
      .addCase(fetchPlayerPayments.pending, (state) => {
        state.paymentsLoading = true;
        state.paymentsError = null;
      })
      .addCase(fetchPlayerPayments.fulfilled, (state, action) => {
        state.paymentsLoading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPlayerPayments.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.paymentsError = action.payload as string;
      });
  },
});

export const { clearError } = playerDashboardSlice.actions;
export default playerDashboardSlice.reducer;
