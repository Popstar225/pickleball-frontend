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
  address: string;
  website: string;
  bio: string | null;
  emergencyContact: string | null;
  medicalInfo: string | null;
  joinedDate: string | null;
  lastActive: string | null;
  totalTournaments: number;
  clubs_count: number;
  ranking: string | null;
  currentClub: string | null;
  // Legacy fields for backward compatibility
  user_type?: string;
  role?: string;
  latitude?: number | null;
  longitude?: number | null;
  rfc?: string | null;
  business_name?: string | null;
  contact_person?: string | null;
  job_title?: string | null;
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
  tournamentsPlayedCount: number;
  messages: PlayerMessage[];
  unreadMessages: number;
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
  tournamentsPlayedCount: 0,
  messages: [],
  unreadMessages: 0,
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
      const response = await api.get('/clubs/memberships');
      return (response as any).data.data.clubs;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch player clubs',
      );
    }
  },
);

// Map a raw tournament-dashboard item to the flat shape the UI expects
function mapTournamentItem(item: any, isHistory: boolean): PlayerTournament & Record<string, any> {
  const modality = item.event?.modality ?? '';
  const skillBlock = item.event?.skill_block ?? '';
  const category = [modality, skillBlock].filter(Boolean).join(' ') || '—';

  let statusUI: string;
  if (isHistory) {
    statusUI = 'completed';
  } else if (item.status === 'confirmed') {
    statusUI = 'registered';
  } else {
    statusUI = 'pending';
  }

  return {
    id: item.registrationId,
    playerId: item.user_id ?? '',
    tournamentId: item.tournament?.id ?? '',
    tournamentName: item.tournament?.name ?? '—',
    category,
    registrationDate: item.registered_at ?? '',
    status: statusUI,
    paymentStatus: item.payment_status ?? '',
    registrationFee: item.entry_fee ?? 0,
    // Extra fields useful in detail pages
    tournament: item.tournament,
    event: item.event,
    phase: item.phase,
    standing: item.standing,
    upcoming_match: item.upcoming_match,
    recent_matches: item.recent_matches,
    result: item.result,
    final_position: item.final_position,
    points_earned: item.points_earned,
  };
}

export const fetchPlayerTournaments = createAsyncThunk(
  'playerDashboard/fetchTournaments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/players/tournament-dashboard');
      const { active = [], history = [], stats = {} } = (response as any).data ?? {};
      const items = [
        ...active.map((t: any) => mapTournamentItem(t, false)),
        ...history.map((t: any) => mapTournamentItem(t, true)),
      ];
      return { items, playedCount: (stats.history_count ?? 0) + (stats.active_count ?? 0) };
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
      // api.get returns res.data directly, so response = { success, data: { messages, pagination } }
      const response = await api.get(`/messages?type=inbox&limit=${limit}&offset=${offset}`);
      const raw: any[] = (response as any).data?.messages ?? [];
      const mapped: PlayerMessage[] = raw.map((m: any) => ({
        id: m.id,
        senderId: m.sender_id ?? '',
        senderName: m.sender?.full_name || m.sender?.username || m.sender_name || 'Sistema',
        subject: m.subject ?? '',
        body: m.content ?? '',
        date: m.created_at ?? '',
        read: m.is_read ?? false,
      }));
      const unread = mapped.filter((m) => !m.read).length;
      return { messages: mapped, unread };
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
      const response = await api.post('/messages', {
        recipient_id: recipientId,
        subject,
        content: body,
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
        const { items, playedCount } = action.payload as any;
        state.tournaments = items;
        state.tournamentsPlayedCount = playedCount;
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
        const { messages, unread } = action.payload as any;
        state.messages = messages;
        state.unreadMessages = unread;
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
