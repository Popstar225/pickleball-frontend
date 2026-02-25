import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ClubOperatingHours {
  [day: string]: {
    open: string;
    close: string;
  };
}

export interface OwnerInfo {
  name: string;
  email: string;
  phone: string;
  profilePhoto: string;
}

export interface ClubProfile {
  id: string;
  name: string;
  clubType: string;
  description: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  state: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  foundedDate: string;
  memberCount: number;
  maxMembers: number;
  hasCourts: boolean;
  courtCount: number;
  courtTypes: string[];
  offersTraining: boolean;
  offersTournaments: boolean;
  offersEquipment: boolean;
  membershipStatus: string;
  membershipExpiresAt: string;
  subscriptionPlan: string;
  membershipFee: string;
  courtRentalFee: string;
  logoUrl: string;
  bannerImage: string;
  photos: string[];
  website: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  operatingHours: ClubOperatingHours;
  availability: {
    court_booking: boolean;
    drop_in: boolean;
    leagues: boolean;
    tournaments: boolean;
  };
  clubRules: string;
  dressCode: string;
  totalTournaments: number;
  totalMatches: number;
  averageRating: string;
  reviewCount: number;
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  settings: {
    allow_guest_play: boolean;
    max_guest_visits: number;
    auto_approve_members: boolean;
  };
  notes: string;
  owner: {
    id: string;
    name: string;
    email: string;
    profilePhoto: string | null;
  };
}

export interface ClubStats {
  totalMembers: number;
  activeMembers: number;
  tournamentsOrganized: number;
  upcomingEvents: number;
  monthlyGrowth: number;
  federationStatus: string;
  membershipFeesDue: number;
}

export interface ClubMember {
  id: string;
  playerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  level: string;
  joinDate: string;
  membershipStatus: string;
  membershipFee: number;
  lastPaymentDate: string;
  credentialStatus: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  type: string;
  description: string;
  status: string;
}

export interface ClubFederationMembership {
  id: string;
  clubId: string;
  federationId: string;
  membershipStatus: string;
  renewalDate: string;
  annualFee: number;
  paymentStatus: string;
}

export interface MembershipFeePayment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  dueDate: string;
  paymentDate: string | null;
  status: string;
  paymentMethod: string | null;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface ClubDashboardState {
  profile: ClubProfile | null;
  stats: ClubStats | null;
  members: ClubMember[];
  events: ClubEvent[];
  federationMembership: ClubFederationMembership | null;
  membershipFees: MembershipFeePayment[];

  profileLoading: boolean;
  statsLoading: boolean;
  membersLoading: boolean;
  eventsLoading: boolean;
  federationLoading: boolean;
  feesLoading: boolean;

  profileError: string | null;
  statsError: string | null;
  membersError: string | null;
  eventsError: string | null;
  federationError: string | null;
  feesError: string | null;
}

const initialState: ClubDashboardState = {
  profile: null,
  stats: null,
  members: [],
  events: [],
  federationMembership: null,
  membershipFees: [],

  profileLoading: false,
  statsLoading: false,
  membersLoading: false,
  eventsLoading: false,
  federationLoading: false,
  feesLoading: false,

  profileError: null,
  statsError: null,
  membersError: null,
  eventsError: null,
  federationError: null,
  feesError: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchClubProfile = createAsyncThunk('clubDashboard/fetchProfile', async () => {
  const data = await api.get('/clubs/profile');
  return (data as any)?.data as ClubProfile;
});

export const updateClubProfile = createAsyncThunk(
  'clubDashb.pqoown.qwoard/updateProfile',
  async (profileData: Partial<ClubProfile>) => {
    const data = await api.put(`/clubs/profile`, profileData);
    return (data as any)?.data as ClubProfile;
  },
);

export const deleteClubAccount = createAsyncThunk(
  'clubDashboard/deleteAccount',
  async (confirmationToken: string) => {
    const data = await api.delete('/clubs/account', { data: { confirmationToken } });
    return (data as any)?.message as string;
  },
);

export const fetchClubStatistics = createAsyncThunk('clubDashboard/fetchStatistics', async () => {
  const data = await api.get('/clubs/statistics');
  return (data as any)?.data as ClubStats;
});

export const fetchClubMembers = createAsyncThunk(
  'clubDashboard/fetchMembers',
  async ({
    clubId,
    limit = 20,
    offset = 0,
    status = '',
  }: {
    clubId: string;
    limit?: number;
    offset?: number;
    status?: string;
  }) => {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    if (status) params.append('status', status);
    const data = await api.get(`/clubs/${clubId}/members?${params}`);
    return (data as any)?.data?.members as ClubMember[];
  },
);

export const addClubMember = createAsyncThunk(
  'clubDashboard/addMember',
  async ({
    playerId,
    membershipFee,
    notes,
  }: {
    playerId: string;
    membershipFee: number;
    notes?: string;
  }) => {
    const data = await api.post('/clubs/members', { playerId, membershipFee, notes });
    return (data as any)?.data as ClubMember;
  },
);

export const updateClubMember = createAsyncThunk(
  'clubDashboard/updateMember',
  async ({
    memberId,
    membershipStatus,
    membershipFee,
  }: {
    memberId: string;
    membershipStatus?: string;
    membershipFee?: number;
  }) => {
    const data = await api.put(`/clubs/members/${memberId}`, { membershipStatus, membershipFee });
    return (data as any)?.data as ClubMember;
  },
);

export const removeClubMember = createAsyncThunk(
  'clubDashboard/removeMember',
  async (memberId: string) => {
    await api.delete(`/clubs/members/${memberId}`);
    return memberId;
  },
);

export const fetchMembershipFees = createAsyncThunk(
  'clubDashboard/fetchMembershipFees',
  async ({ limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) => {
    const data = await api.get(`/clubs/membership-fees?limit=${limit}&offset=${offset}`);
    return (data as any)?.data?.payments as MembershipFeePayment[];
  },
);

export const sendMembershipFeeReminder = createAsyncThunk(
  'clubDashboard/sendReminder',
  async (memberId: string) => {
    const data = await api.post('/clubs/membership-fees/send-reminder', { memberId });
    return (data as any)?.message as string;
  },
);

export const fetchClubEvents = createAsyncThunk('clubDashboard/fetchEvents', async () => {
  const data = await api.get('/clubs/events');
  return (data as any)?.data?.events as ClubEvent[];
});

export const createClubEvent = createAsyncThunk(
  'clubDashboard/createEvent',
  async (eventData: Partial<ClubEvent>) => {
    const data = await api.post('/clubs/events', eventData);
    return (data as any)?.data as ClubEvent;
  },
);

export const fetchFederationMembership = createAsyncThunk(
  'clubDashboard/fetchFederationMembership',
  async () => {
    const data = await api.get('/clubs/federation-membership');
    return (data as any)?.data as ClubFederationMembership;
  },
);

export const renewFederationMembership = createAsyncThunk(
  'clubDashboard/renewFederationMembership',
  async ({ stripePaymentMethodId }: { stripePaymentMethodId: string }) => {
    const data = await api.post('/clubs/federation-membership/renew', { stripePaymentMethodId });
    return (data as any)?.data as ClubFederationMembership;
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const clubDashboardSlice = createSlice({
  name: 'clubDashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.profileError = null;
      state.statsError = null;
      state.membersError = null;
      state.eventsError = null;
      state.federationError = null;
      state.feesError = null;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Profile ────────────────────────────────────────────────────────────
      .addCase(fetchClubProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchClubProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchClubProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.error.message || 'Failed to fetch profile';
      })

      // ── Update Profile ─────────────────────────────────────────────────────
      .addCase(updateClubProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(updateClubProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateClubProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.error.message || 'Failed to update profile';
      })

      // ── Delete Account ─────────────────────────────────────────────────────
      .addCase(deleteClubAccount.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(deleteClubAccount.fulfilled, (state) => {
        state.profileLoading = false;
        state.profile = null;
      })
      .addCase(deleteClubAccount.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.error.message || 'Failed to delete account';
      })

      // ── Statistics ─────────────────────────────────────────────────────────
      .addCase(fetchClubStatistics.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchClubStatistics.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchClubStatistics.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.error.message || 'Failed to fetch statistics';
      })

      // ── Fetch Members ──────────────────────────────────────────────────────
      .addCase(fetchClubMembers.pending, (state) => {
        state.membersLoading = true;
        state.membersError = null;
      })
      .addCase(fetchClubMembers.fulfilled, (state, action) => {
        state.membersLoading = false;
        state.members = action.payload;
      })
      .addCase(fetchClubMembers.rejected, (state, action) => {
        state.membersLoading = false;
        state.membersError = action.error.message || 'Failed to fetch members';
      })

      // ── Add Member ─────────────────────────────────────────────────────────
      .addCase(addClubMember.pending, (state) => {
        state.membersLoading = true;
        state.membersError = null;
      })
      .addCase(addClubMember.fulfilled, (state, action) => {
        state.membersLoading = false;
        state.members.unshift(action.payload);
      })
      .addCase(addClubMember.rejected, (state, action) => {
        state.membersLoading = false;
        state.membersError = action.error.message || 'Failed to add member';
      })

      // ── Update Member ──────────────────────────────────────────────────────
      .addCase(updateClubMember.pending, (state) => {
        state.membersLoading = true;
        state.membersError = null;
      })
      .addCase(updateClubMember.fulfilled, (state, action) => {
        state.membersLoading = false;
        const index = state.members.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })
      .addCase(updateClubMember.rejected, (state, action) => {
        state.membersLoading = false;
        state.membersError = action.error.message || 'Failed to update member';
      })

      // ── Remove Member ──────────────────────────────────────────────────────
      .addCase(removeClubMember.pending, (state) => {
        state.membersLoading = true;
        state.membersError = null;
      })
      .addCase(removeClubMember.fulfilled, (state, action) => {
        state.membersLoading = false;
        state.members = state.members.filter((m) => m.id !== action.payload);
      })
      .addCase(removeClubMember.rejected, (state, action) => {
        state.membersLoading = false;
        state.membersError = action.error.message || 'Failed to remove member';
      })

      // ── Membership Fees ────────────────────────────────────────────────────
      .addCase(fetchMembershipFees.pending, (state) => {
        state.feesLoading = true;
        state.feesError = null;
      })
      .addCase(fetchMembershipFees.fulfilled, (state, action) => {
        state.feesLoading = false;
        state.membershipFees = action.payload;
      })
      .addCase(fetchMembershipFees.rejected, (state, action) => {
        state.feesLoading = false;
        state.feesError = action.error.message || 'Failed to fetch membership fees';
      })

      // ── Send Reminder ──────────────────────────────────────────────────────
      .addCase(sendMembershipFeeReminder.pending, (state) => {
        state.feesLoading = true;
        state.feesError = null;
      })
      .addCase(sendMembershipFeeReminder.fulfilled, (state) => {
        state.feesLoading = false;
      })
      .addCase(sendMembershipFeeReminder.rejected, (state, action) => {
        state.feesLoading = false;
        state.feesError = action.error.message || 'Failed to send reminder';
      })

      // ── Events ─────────────────────────────────────────────────────────────
      .addCase(fetchClubEvents.pending, (state) => {
        state.eventsLoading = true;
        state.eventsError = null;
      })
      .addCase(fetchClubEvents.fulfilled, (state, action) => {
        state.eventsLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchClubEvents.rejected, (state, action) => {
        state.eventsLoading = false;
        state.eventsError = action.error.message || 'Failed to fetch events';
      })

      // ── Create Event ───────────────────────────────────────────────────────
      .addCase(createClubEvent.pending, (state) => {
        state.eventsLoading = true;
        state.eventsError = null;
      })
      .addCase(createClubEvent.fulfilled, (state, action) => {
        state.eventsLoading = false;
        state.events.unshift(action.payload);
      })
      .addCase(createClubEvent.rejected, (state, action) => {
        state.eventsLoading = false;
        state.eventsError = action.error.message || 'Failed to create event';
      })

      // ── Federation Membership ──────────────────────────────────────────────
      .addCase(fetchFederationMembership.pending, (state) => {
        state.federationLoading = true;
        state.federationError = null;
      })
      .addCase(fetchFederationMembership.fulfilled, (state, action) => {
        state.federationLoading = false;
        state.federationMembership = action.payload;
      })
      .addCase(fetchFederationMembership.rejected, (state, action) => {
        state.federationLoading = false;
        state.federationError = action.error.message || 'Failed to fetch federation membership';
      })

      // ── Renew Federation Membership ────────────────────────────────────────
      .addCase(renewFederationMembership.pending, (state) => {
        state.federationLoading = true;
        state.federationError = null;
      })
      .addCase(renewFederationMembership.fulfilled, (state, action) => {
        state.federationLoading = false;
        state.federationMembership = action.payload;
      })
      .addCase(renewFederationMembership.rejected, (state, action) => {
        state.federationLoading = false;
        state.federationError = action.error.message || 'Failed to renew federation membership';
      });
  },
});

export const { clearError, setProfile } = clubDashboardSlice.actions;
export default clubDashboardSlice.reducer;
