import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Interfaces for partner dashboard data
export interface PartnerProfile {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  sponsorshipLevel: string;
  sponsorshipAmount: number;
  sponsorshipStartDate: string;
  sponsorshipEndDate: string;
  partneredSince: string;
  logoUrl: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerSponsorship {
  id: string;
  partnerId: string;
  level: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  benefits: string[];
}

export interface PartnerMessage {
  id: string;
  senderId: string;
  senderName: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
}

export interface PartnerPayment {
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
interface PartnerDashboardState {
  profile: PartnerProfile | null;
  sponsorships: PartnerSponsorship[];
  messages: PartnerMessage[];
  payments: PartnerPayment[];

  // Loading states
  profileLoading: boolean;
  sponsorshipsLoading: boolean;
  messagesLoading: boolean;
  paymentsLoading: boolean;

  // Error states
  profileError: string | null;
  sponsorshipsError: string | null;
  messagesError: string | null;
  paymentsError: string | null;
}

const initialState: PartnerDashboardState = {
  profile: null,
  sponsorships: [],
  messages: [],
  payments: [],

  profileLoading: false,
  sponsorshipsLoading: false,
  messagesLoading: false,
  paymentsLoading: false,

  profileError: null,
  sponsorshipsError: null,
  messagesError: null,
  paymentsError: null,
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
export const fetchPartnerProfile = createAsyncThunk(
  'partnerDashboard/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiCall('/api/partners/profile');
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const updatePartnerProfile = createAsyncThunk(
  'partnerDashboard/updateProfile',
  async (profileData: Partial<PartnerProfile>, { rejectWithValue }) => {
    try {
      const data = await apiCall('/api/partners/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const deletePartnerAccount = createAsyncThunk(
  'partnerDashboard/deleteAccount',
  async (confirmationToken: string, { rejectWithValue }) => {
    try {
      const data = await apiCall('/api/partners/account', {
        method: 'DELETE',
        body: JSON.stringify({ confirmationToken }),
      });
      return data.message;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchPartnerSponsorships = createAsyncThunk(
  'partnerDashboard/fetchSponsorships',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiCall('/api/partners/sponsorships');
      return data.data.sponsorships;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchPartnerMessages = createAsyncThunk(
  'partnerDashboard/fetchMessages',
  async (
    { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const data = await apiCall(`/api/partners/messages?limit=${limit}&offset=${offset}`);
      return data.data.messages;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const sendPartnerMessage = createAsyncThunk(
  'partnerDashboard/sendMessage',
  async (
    { recipientId, subject, body }: { recipientId: string; subject: string; body: string },
    { rejectWithValue },
  ) => {
    try {
      const data = await apiCall('/api/partners/messages', {
        method: 'POST',
        body: JSON.stringify({ recipientId, subject, body }),
      });
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchPartnerPayments = createAsyncThunk(
  'partnerDashboard/fetchPayments',
  async (
    { limit = 10, offset = 0 }: { limit?: number; offset?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const data = await apiCall(`/api/partners/payments?limit=${limit}&offset=${offset}`);
      return data.data.payments;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Slice
const partnerDashboardSlice = createSlice({
  name: 'partnerDashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.profileError = null;
      state.sponsorshipsError = null;
      state.messagesError = null;
      state.paymentsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Partner Profile
      .addCase(fetchPartnerProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchPartnerProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchPartnerProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })

      // Update Partner Profile
      .addCase(updatePartnerProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(updatePartnerProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(updatePartnerProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })

      // Delete Partner Account
      .addCase(deletePartnerAccount.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(deletePartnerAccount.fulfilled, (state) => {
        state.profileLoading = false;
        state.profile = null;
      })
      .addCase(deletePartnerAccount.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })

      // Fetch Partner Sponsorships
      .addCase(fetchPartnerSponsorships.pending, (state) => {
        state.sponsorshipsLoading = true;
        state.sponsorshipsError = null;
      })
      .addCase(fetchPartnerSponsorships.fulfilled, (state, action) => {
        state.sponsorshipsLoading = false;
        state.sponsorships = action.payload;
      })
      .addCase(fetchPartnerSponsorships.rejected, (state, action) => {
        state.sponsorshipsLoading = false;
        state.sponsorshipsError = action.payload as string;
      })

      // Fetch Partner Messages
      .addCase(fetchPartnerMessages.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(fetchPartnerMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchPartnerMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload as string;
      })

      // Send Partner Message
      .addCase(sendPartnerMessage.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(sendPartnerMessage.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendPartnerMessage.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload as string;
      })

      // Fetch Partner Payments
      .addCase(fetchPartnerPayments.pending, (state) => {
        state.paymentsLoading = true;
        state.paymentsError = null;
      })
      .addCase(fetchPartnerPayments.fulfilled, (state, action) => {
        state.paymentsLoading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPartnerPayments.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.paymentsError = action.payload as string;
      });
  },
});

export const { clearError } = partnerDashboardSlice.actions;
export default partnerDashboardSlice.reducer;
