import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// Interfaces for coach dashboard data
export interface CoachProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  dateOfBirth: string;
  gender: string;
  state: string;
  city: string;
  profilePhoto: string | null;
  bio: string | null;
  skillLevel: string;
  experienceYears: number;
  certifications: string[];
  specializations: string[];
  languages: string[];
  hourlyRate: string;
  rating: number;
  reviewsCount: number;
  totalStudents: number;
  activeStudents: number;
  lessonTypesOffered: string[];
  website: string | null;
  membershipStatus: string;
  joinedDate: string;
  lastActive: string;
}

export interface CoachCredential {
  id: string;
  coachId: string;
  credentialType: string;
  credentialNumber: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  certificateUrl: string;
  createdAt: string;
}

export interface CoachStudent {
  id: string;
  playerId: string;
  firstName: string;
  lastName: string;
  level: string;
  joinDate: string;
  totalSessions: number;
  lastSessionDate: string;
  status: string;
  progress: string;
}

// Club Types - CORRECTED TO MATCH ACTUAL MODEL
export interface Club {
  id: string;
  name: string;
  club_type: 'recreational' | 'competitive' | 'training' | 'mixed';
  description?: string;
  contact_person: string;
  contact_email: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  state: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  founded_date?: string;
  member_count: number;
  max_members?: number;
  has_courts: boolean;
  court_count: number;
  court_types?: object;
  offers_training: boolean;
  offers_tournaments: boolean;
  offers_equipment: boolean;
  membership_status: 'active' | 'expired' | 'suspended' | 'cancelled' | 'pending';
  membership_expires_at?: string;
  subscription_plan: 'basic' | 'premium';
  membership_fee?: number;
  court_rental_fee?: number;
  logo?: string;
  banner_image?: string;
  photos?: object;
  website?: string;
  social_media?: object;
  operating_hours?: object;
  availability?: object;
  club_rules?: string;
  dress_code?: string;
  total_tournaments: number;
  total_matches: number;
  created_at: string;
  updated_at: string;
}

// Team Registration (Coach viewing players in tournaments)
export interface TeamRegistrationUser {
  id: string;
  full_name: string;
  email: string;
  skill_level?: string;
}

export interface TeamRegistrationEvent {
  id: string;
  skill_block: '2.5' | '3.5' | '4.5' | '5+';
  gender: 'M' | 'F' | 'Mixed';
  modality: 'Singles' | 'Doubles' | 'Mixed';
}

export interface TeamRegistration {
  id: string;
  user_id: string;
  tournament_id: string;
  tournament_event_id: string;
  group_id?: string | null;
  skill_block: '2.5' | '3.5' | '4.5' | '5+';
  gender: 'M' | 'F' | 'Mixed';
  modality: 'Singles' | 'Doubles' | 'Mixed';
  status: 'pending' | 'confirmed' | 'waitlist' | 'cancelled' | 'withdrawn';
  payment_status: 'pending' | 'paid' | 'refunded' | 'partial';
  entry_fee: number | string;
  final_position?: number | null;
  points_earned: number;
  registration_date: string;
  tournament_name: string;
  user: TeamRegistrationUser;
  event: TeamRegistrationEvent;
}

export interface TeamRegistrationsResponse {
  judge_info: {
    id: string;
    name: string;
    email: string;
  };
  tournaments_count: number;
  registrations_count: number;
  registrations: TeamRegistration[];
}

export interface CoachMessage {
  id: string;
  senderId: string;
  senderName: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
}

export interface CoachPayment {
  id: string;
  paymentDate: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId: string;
  sessionsCount: number;
}

export interface CoachCredentialData {
  id: string;
  coach_id: string;
  credential_number: string;
  coach_name: string;
  nrtp_level: string;
  affiliation_status: string;
  club_name: string;
  state_affiliation: string;
  issued_date: string;
  created_at: string;
  expiry_date: string;
  verification_code: string;
  qr_code_url: string;
  user?: {
    profile_photo?: string;
  };
}

// Court Types - CORRECTED TO MATCH ACTUAL MODEL
export interface CourtDimensions {
  length: number;
  width: number;
  height: number;
  units: 'meters' | 'feet';
}

export interface CourtOperatingHours {
  [day: string]: {
    open: string;
    close: string;
  };
}

export interface Court {
  id: string;
  name: string;
  court_type: 'indoor' | 'outdoor' | 'covered';
  surface: 'concrete' | 'asphalt' | 'synthetic' | 'grass' | 'clay';
  description?: string;
  dimensions?: CourtDimensions;
  capacity?: number;
  club_id: string;
  club_name?: string;
  club?: Club;
  is_available: boolean;
  is_maintenance: boolean;
  maintenance_notes?: string;
  maintenance_start?: string;
  maintenance_end?: string;
  operating_hours?: CourtOperatingHours;
  hourly_rate?: number | string;
  daily_rate?: number | string;
  member_discount?: number | string;
  member_rate?: number;
  equipment_included?: string[];
  amenities?: string[];
  has_lighting?: boolean;
  has_net?: boolean;
  has_equipment?: boolean;
  photos?: string[];
  total_bookings: number;
  total_hours: number;
  total_hours_booked?: number | string;
  average_rating?: number | string;
  review_count?: number;
  is_active?: boolean;
  is_featured?: boolean;
  settings?: object;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

// Initial state
interface CoachDashboardState {
  profile: CoachProfile | null;
  credentials: CoachCredential[];
  myCredential: CoachCredentialData | null;
  courts: Court[];
  students: CoachStudent[];
  messages: CoachMessage[];
  payments: CoachPayment[];

  // Loading states
  profileLoading: boolean;
  credentialsLoading: boolean;
  myCredentialLoading: boolean;
  courtsLoading: boolean;
  studentsLoading: boolean;
  messagesLoading: boolean;
  paymentsLoading: boolean;

  // Error states
  profileError: string | null;
  credentialsError: string | null;
  myCredentialError: string | null;
  courtsError: string | null;
  studentsError: string | null;
  messagesError: string | null;
  paymentsError: string | null;

  // coach team registrations (players in tournaments where coach is assigned as judge)
  teamRegistrations: TeamRegistration[];
  teamRegistrationsLoading: boolean;
  teamRegistrationsError: string | null;
  teamRegistrationsJudgeInfo: { id: string; name: string; email: string } | null;
  teamRegistrationsTournamentsCount: number;
  teamRegistrationsTotal: number;

  // Pagination
  courtsPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: CoachDashboardState = {
  profile: null,
  credentials: [],
  myCredential: null,
  courts: [],
  students: [],
  messages: [],
  payments: [],

  profileLoading: false,
  credentialsLoading: false,
  myCredentialLoading: false,
  courtsLoading: false,
  studentsLoading: false,
  messagesLoading: false,
  paymentsLoading: false,

  profileError: null,
  credentialsError: null,
  myCredentialError: null,
  courtsError: null,
  studentsError: null,
  messagesError: null,
  paymentsError: null,

  teamRegistrations: [],
  teamRegistrationsLoading: false,
  teamRegistrationsError: null,
  teamRegistrationsJudgeInfo: null,
  teamRegistrationsTournamentsCount: 0,
  teamRegistrationsTotal: 0,

  courtsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchCoachProfile = createAsyncThunk(
  'coachDashboard/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/coaches/profile');

      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch coach profile',
      );
    }
  },
);

export const updateCoachProfile = createAsyncThunk(
  'coachDashboard/updateProfile',
  async (profileData: Partial<CoachProfile>, { rejectWithValue }) => {
    try {
      const response = await api.put('/coaches/profile', profileData);
      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update coach profile',
      );
    }
  },
);

export const deleteCoachAccount = createAsyncThunk(
  'coachDashboard/deleteAccount',
  async (confirmationToken: string, { rejectWithValue }) => {
    try {
      const response = await api.delete('/coaches/account');
      return (response as any).message;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete account',
      );
    }
  },
);

export const fetchCoachCredentials = createAsyncThunk(
  'coachDashboard/fetchCredentials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/coaches/credentials');
      return (response as any).data?.credentials || (response as any).data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch credentials',
      );
    }
  },
);

export const renewCoachCredential = createAsyncThunk(
  'coachDashboard/renewCredential',
  async (
    {
      credentialId,
      stripePaymentMethodId,
    }: { credentialId: string; stripePaymentMethodId: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post('/coaches/credentials/renew', {
        credentialId,
        stripePaymentMethodId,
      });
      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to renew credential',
      );
    }
  },
);

export const fetchCoachStudents = createAsyncThunk(
  'coachDashboard/fetchStudents',
  async (
    { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get('/coaches/students', { params: { limit, offset } });
      return (response as any).data?.students || (response as any).data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch students',
      );
    }
  },
);

export const addCoachStudent = createAsyncThunk(
  'coachDashboard/addStudent',
  async ({ playerId, notes }: { playerId: string; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/coaches/students/add', { playerId, notes });
      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to add student',
      );
    }
  },
);

export const updateCoachStudent = createAsyncThunk(
  'coachDashboard/updateStudent',
  async (
    { studentId, studentData }: { studentId: string; studentData: Partial<CoachStudent> },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put(`/coaches/students/${studentId}`, studentData);
      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update student',
      );
    }
  },
);

export const fetchCoachMessages = createAsyncThunk(
  'coachDashboard/fetchMessages',
  async (
    { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get('/coaches/messages', { params: { limit, offset } });
      return (response as any).data?.messages || (response as any).data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch messages',
      );
    }
  },
);

export const sendCoachMessage = createAsyncThunk(
  'coachDashboard/sendMessage',
  async (
    { recipientId, subject, body }: { recipientId: string; subject: string; body: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post('/coaches/messages', { recipientId, subject, body });
      return (response as any).data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to send message',
      );
    }
  },
);

export const fetchCoachPayments = createAsyncThunk(
  'coachDashboard/fetchPayments',
  async (
    { limit = 10, offset = 0 }: { limit?: number; offset?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get('/coaches/payments', { params: { limit, offset } });
      return (response as any).data?.payments || (response as any).data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch payments',
      );
    }
  },
);

export const fetchMyCoachCredential = createAsyncThunk(
  'coachDashboard/fetchMyCredential',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/coaches/credentials', {});
      return response as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch credential',
      );
    }
  },
);

export const createCoachCredential = createAsyncThunk(
  'coachDashboard/createCredential',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post<any>('/coaches/credentials', {});
      return response as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create credential',
      );
    }
  },
);

// ============================================================================
// New: Coach team registration thunk
// ============================================================================
export const fetchCoachTeamRegistrations = createAsyncThunk(
  'coachDashboard/fetchTeamRegistrations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/coaches/me/team-registrations');

      // Backend response structure:
      // {
      //   success: true,
      //   data: {
      //     judge_info: { id, name, email },
      //     tournaments_count: number,
      //     registrations_count: number,
      //     registrations: TeamRegistration[]
      //   }
      // }

      const data = (response as any).data as TeamRegistrationsResponse;

      if (!data) {
        return rejectWithValue('No registration data returned from server');
      }

      return {
        judge_info: data.judge_info || { id: '', name: '', email: '' },
        tournaments_count: data.tournaments_count || 0,
        registrations_count: data.registrations_count || 0,
        registrations: data.registrations || [],
      };
    } catch (error: any) {
      console.error('Fetch coach team registrations error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch team registrations',
      );
    }
  },
);

// Courts Management Thunks
export const fetchCoachCourts = createAsyncThunk(
  'coachDashboard/fetchCourts',
  async (
    {
      page = 1,
      limit = 10,
      court_type,
      surface,
      is_available,
      search,
    }: {
      page?: number;
      limit?: number;
      court_type?: string;
      surface?: string;
      is_available?: boolean;
      search?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const params: any = { page, limit };
      if (court_type) params.court_type = court_type;
      if (surface) params.surface = surface;
      if (is_available !== undefined) params.is_available = is_available;
      if (search) params.search = search;

      const response = await api.get<any>('/courts', { params });
      return response as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch courts',
      );
    }
  },
);

export const getCourtById = createAsyncThunk(
  'coachDashboard/getCourtById',
  async (courtId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<any>(`/courts/${courtId}`, {});
      return response as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch court',
      );
    }
  },
);

export const createCourt = createAsyncThunk(
  'coachDashboard/createCourt',
  async (
    courtData: {
      name: string;
      court_type: string;
      surface: string;
      hourly_rate?: number;
      max_capacity?: number;
      lights?: boolean;
      covered?: boolean;
      description?: string;
      is_available?: boolean;
      is_active?: boolean;
      settings?: Record<string, any>;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post<any>('/courts', courtData);
      return response as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create court',
      );
    }
  },
);

export const updateCourt = createAsyncThunk(
  'coachDashboard/updateCourt',
  async (
    {
      courtId,
      updateData,
    }: {
      courtId: string;
      updateData: Partial<Court>;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.put<any>(`/courts/${courtId}`, updateData);
      return response as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update court',
      );
    }
  },
);

export const deleteCourt = createAsyncThunk(
  'coachDashboard/deleteCourt',
  async (courtId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete<any>(`/courts/${courtId}`);
      return courtId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete court',
      );
    }
  },
);

// Slice
const coachDashboardSlice = createSlice({
  name: 'coachDashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.profileError = null;
      state.credentialsError = null;
      state.studentsError = null;
      state.messagesError = null;
      state.paymentsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Coach Profile
      .addCase(fetchCoachProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchCoachProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCoachProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })

      // Update Coach Profile
      .addCase(updateCoachProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(updateCoachProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateCoachProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })

      // Delete Coach Account
      .addCase(deleteCoachAccount.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(deleteCoachAccount.fulfilled, (state) => {
        state.profileLoading = false;
        state.profile = null;
      })
      .addCase(deleteCoachAccount.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })

      // Fetch Coach Credentials
      .addCase(fetchCoachCredentials.pending, (state) => {
        state.credentialsLoading = true;
        state.credentialsError = null;
      })
      .addCase(fetchCoachCredentials.fulfilled, (state, action) => {
        state.credentialsLoading = false;
        state.credentials = action.payload;
      })
      .addCase(fetchCoachCredentials.rejected, (state, action) => {
        state.credentialsLoading = false;
        state.credentialsError = action.payload as string;
      })

      // Renew Coach Credential
      .addCase(renewCoachCredential.pending, (state) => {
        state.credentialsLoading = true;
        state.credentialsError = null;
        state.myCredentialLoading = true;
        state.myCredentialError = null;
      })
      .addCase(renewCoachCredential.fulfilled, (state, action) => {
        state.credentialsLoading = false;
        state.myCredentialLoading = false;
        state.myCredential = action.payload;
      })
      .addCase(renewCoachCredential.rejected, (state, action) => {
        state.credentialsLoading = false;
        state.credentialsError = action.payload as string;
        state.myCredentialLoading = false;
        state.myCredentialError = action.payload as string;
      })

      // Fetch Coach Students
      .addCase(fetchCoachStudents.pending, (state) => {
        state.studentsLoading = true;
        state.studentsError = null;
      })
      .addCase(fetchCoachStudents.fulfilled, (state, action) => {
        state.studentsLoading = false;
        state.students = action.payload;
      })
      .addCase(fetchCoachStudents.rejected, (state, action) => {
        state.studentsLoading = false;
        state.studentsError = action.payload as string;
      })

      // Add Coach Student
      .addCase(addCoachStudent.pending, (state) => {
        state.studentsLoading = true;
        state.studentsError = null;
      })
      .addCase(addCoachStudent.fulfilled, (state, action) => {
        state.studentsLoading = false;
        state.students.push(action.payload);
      })
      .addCase(addCoachStudent.rejected, (state, action) => {
        state.studentsLoading = false;
        state.studentsError = action.payload as string;
      })

      // Update Coach Student
      .addCase(updateCoachStudent.pending, (state) => {
        state.studentsLoading = true;
        state.studentsError = null;
      })
      .addCase(updateCoachStudent.fulfilled, (state, action) => {
        state.studentsLoading = false;
        const index = state.students.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      .addCase(updateCoachStudent.rejected, (state, action) => {
        state.studentsLoading = false;
        state.studentsError = action.payload as string;
      })

      // Fetch Coach Messages
      .addCase(fetchCoachMessages.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(fetchCoachMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchCoachMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload as string;
      })

      // Send Coach Message
      .addCase(sendCoachMessage.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(sendCoachMessage.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendCoachMessage.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload as string;
      })

      // Fetch Coach Payments
      .addCase(fetchCoachPayments.pending, (state) => {
        state.paymentsLoading = true;
        state.paymentsError = null;
      })
      .addCase(fetchCoachPayments.fulfilled, (state, action) => {
        state.paymentsLoading = false;
        state.payments = action.payload;
      })
      .addCase(fetchCoachPayments.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.paymentsError = action.payload as string;
      })

      // Fetch My Credential
      .addCase(fetchMyCoachCredential.pending, (state) => {
        state.myCredentialLoading = true;
        state.myCredentialError = null;
      })
      .addCase(fetchMyCoachCredential.fulfilled, (state, action) => {
        state.myCredentialLoading = false;
        state.myCredential = action.payload;
      })
      .addCase(fetchMyCoachCredential.rejected, (state, action) => {
        state.myCredentialLoading = false;
        state.myCredentialError = action.payload as string;
      })

      // Create Credential
      .addCase(createCoachCredential.pending, (state) => {
        state.myCredentialLoading = true;
        state.myCredentialError = null;
      })
      .addCase(createCoachCredential.fulfilled, (state, action) => {
        state.myCredentialLoading = false;
        state.myCredential = action.payload;
      })
      .addCase(createCoachCredential.rejected, (state, action) => {
        state.myCredentialLoading = false;
        state.myCredentialError = action.payload as string;
      })

      // Coach team registrations
      .addCase(fetchCoachTeamRegistrations.pending, (state) => {
        state.teamRegistrationsLoading = true;
        state.teamRegistrationsError = null;
      })
      .addCase(fetchCoachTeamRegistrations.fulfilled, (state, action) => {
        state.teamRegistrationsLoading = false;
        // Payload structure: { judge_info, tournaments_count, registrations_count, registrations }
        const payload = action.payload as any;
        state.teamRegistrations = payload.registrations || [];
        state.teamRegistrationsJudgeInfo = payload.judge_info || null;
        state.teamRegistrationsTournamentsCount = payload.tournaments_count || 0;
        state.teamRegistrationsTotal = payload.registrations_count || 0;
      })
      .addCase(fetchCoachTeamRegistrations.rejected, (state, action) => {
        state.teamRegistrationsLoading = false;
        state.teamRegistrationsError = (action.payload as string) || action.error.message || null;
      })

      // Fetch Courts
      .addCase(fetchCoachCourts.pending, (state) => {
        state.courtsLoading = true;
        state.courtsError = null;
      })
      .addCase(fetchCoachCourts.fulfilled, (state, action) => {
        state.courtsLoading = false;
        state.courts = (action.payload as any).data?.data || [];
        state.courtsPagination = (action.payload as any).pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        };
      })
      .addCase(fetchCoachCourts.rejected, (state, action) => {
        state.courtsLoading = false;
        state.courtsError = action.payload as string;
      })

      // Get Court by ID
      .addCase(getCourtById.pending, (state) => {
        state.courtsLoading = true;
        state.courtsError = null;
      })
      .addCase(getCourtById.fulfilled, (state, action) => {
        state.courtsLoading = false;
        const court = (action.payload as any).data;
        const index = state.courts.findIndex((c) => c.id === court.id);
        if (index >= 0) {
          state.courts[index] = court;
        } else {
          state.courts.push(court);
        }
      })
      .addCase(getCourtById.rejected, (state, action) => {
        state.courtsLoading = false;
        state.courtsError = action.payload as string;
      })

      // Create Court
      .addCase(createCourt.pending, (state) => {
        state.courtsLoading = true;
        state.courtsError = null;
      })
      .addCase(createCourt.fulfilled, (state, action) => {
        state.courtsLoading = false;
        const court = (action.payload as any).data;
        state.courts.push(court);
      })
      .addCase(createCourt.rejected, (state, action) => {
        state.courtsLoading = false;
        state.courtsError = action.payload as string;
      })

      // Update Court
      .addCase(updateCourt.pending, (state) => {
        state.courtsLoading = true;
        state.courtsError = null;
      })
      .addCase(updateCourt.fulfilled, (state, action) => {
        state.courtsLoading = false;
        const updatedCourt = (action.payload as any).data?.court;
        const index = state.courts.findIndex((c) => c.id === updatedCourt.id);
        if (index >= 0) {
          state.courts[index] = updatedCourt;
        }
      })
      .addCase(updateCourt.rejected, (state, action) => {
        state.courtsLoading = false;
        state.courtsError = action.payload as string;
      })

      // Delete Court
      .addCase(deleteCourt.pending, (state) => {
        state.courtsLoading = true;
        state.courtsError = null;
      })
      .addCase(deleteCourt.fulfilled, (state, action) => {
        state.courtsLoading = false;
        state.courts = state.courts.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCourt.rejected, (state, action) => {
        state.courtsLoading = false;
        state.courtsError = action.payload as string;
      });
  },
});

export const { clearError } = coachDashboardSlice.actions;
export default coachDashboardSlice.reducer;
