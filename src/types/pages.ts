// ============================================================================
// COMPREHENSIVE PAGE INTERFACES FOR PICKLEBALL PLATFORM
// ============================================================================

import { 
  User, 
  Club, 
  Tournament, 
  Court, 
  Payment, 
  Ranking, 
  Notification, 
  Banner, 
  PlayerFinder, 
  CourtReservation 
} from './api';

// ============================================================================
// COMMON INTERFACES
// ============================================================================

export interface PageProps {
  className?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SearchFilters {
  search: string;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// ============================================================================
// AUTHENTICATION PAGES
// ============================================================================

export interface LoginPageProps extends PageProps {}

export interface LoginPageState {
  email: string;
  password: string;
  rememberMe: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SelectUserTypePageProps extends PageProps {}

export interface SelectUserTypePageState {
  selectedType: 'player' | 'coach' | 'club' | 'partner' | 'state' | 'federation' | null;
  isLoading: boolean;
  error: string | null;
}

export interface RequiredFieldsPageProps extends PageProps {
  userType: 'player' | 'coach' | 'club' | 'partner' | 'state' | 'federation';
}

export interface RequiredFieldsPageState {
  formData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    state?: string;
    city?: string;
    phone?: string;
    skill_level?: '2.5' | '3.0' | '3.5' | '4.0' | '4.5' | '5.0' | '5.5';
    business_name?: string;
    contact_person?: string;
    rfc?: string;
    website?: string;
  };
  isLoading: boolean;
  error: string | null;
  passwordStrength: 'weak' | 'medium' | 'strong';
}

export interface OptionalFieldsPageProps extends PageProps {
  userType: 'player' | 'coach' | 'club' | 'partner' | 'state' | 'federation';
}

export interface OptionalFieldsPageState {
  formData: {
    profile_photo?: File | null;
    logo?: File | null;
    address?: string;
    latitude?: number;
    longitude?: number;
    whatsapp?: string;
    curp?: string;
    social_media?: Record<string, string>;
    operating_hours?: Record<string, any>;
    club_rules?: string;
    dress_code?: string;
    membership_fee?: number;
    court_rental_fee?: number;
    max_members?: number;
    court_types?: Record<string, any>;
    offers_training?: boolean;
    offers_tournaments?: boolean;
    offers_equipment?: boolean;
    founded_date?: string;
    notes?: string;
  };
  isLoading: boolean;
  error: string | null;
}

export interface ProfilePageProps extends PageProps {}

export interface ProfilePageState {
  isEditing: boolean;
  formData: Partial<User>;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

// ============================================================================
// HOME PAGES (PUBLIC)
// ============================================================================

export interface HomePageProps extends PageProps {}

export interface HomePageState {
  activeBannerIndex: number;
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
    photo: string;
  }>;
  stats: {
    totalUsers: number;
    totalClubs: number;
    totalTournaments: number;
    totalCourts: number;
  };
}

export interface AboutPageProps extends PageProps {}

export interface AboutPageState {
  companyInfo: {
    name: string;
    description: string;
    mission: string;
    vision: string;
    values: string[];
    team: Array<{
      name: string;
      role: string;
      bio: string;
      photo: string;
    }>;
  };
}

export interface EventsPageProps extends PageProps {}

export interface EventsPageState {
  events: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: 'tournament' | 'clinic' | 'social' | 'workshop';
    image: string;
    registrationRequired: boolean;
    maxParticipants?: number;
    currentParticipants: number;
  }>;
  filters: {
    eventType: string;
    dateRange: string;
    location: string;
  };
}

export interface NewsPageProps extends PageProps {}

export interface NewsPageState {
  articles: Array<{
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    publishDate: string;
    image: string;
    tags: string[];
    readTime: number;
  }>;
  categories: string[];
  selectedCategory: string;
}

export interface ContactPageProps extends PageProps {}

export interface ContactPageState {
  formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

// ============================================================================
// COMMON FUNCTIONALITY PAGES
// ============================================================================

export interface ClubsPageProps extends PageProps {}

export interface ClubsPageState {
  clubs: Club[];
  filters: {
    state: string;
    city: string;
    clubType: string;
    hasCourts: boolean;
    subscriptionPlan: string;
    search: string;
  };
  viewMode: 'grid' | 'list' | 'map';
  selectedClub: Club | null;
  showFilters: boolean;
}

export interface TournamentsPageProps extends PageProps {}

export interface TournamentsPageState {
  tournaments: Tournament[];
  filters: {
    tournamentType: string;
    category: string;
    status: string;
    state: string;
    city: string;
    search: string;
    dateRange: string;
  };
  viewMode: 'grid' | 'list' | 'calendar';
  selectedTournament: Tournament | null;
  showFilters: boolean;
}

export interface RankingsPageProps extends PageProps {}

export interface RankingsPageState {
  rankings: Ranking[];
  filters: {
    category: 'singles' | 'doubles' | 'mixed_doubles';
    skillLevel: string;
    state: string;
    search: string;
  };
  selectedCategory: 'singles' | 'doubles' | 'mixed_doubles';
  userRanking: Ranking | null;
}

export interface PlayerFinderPageProps extends PageProps {}

export interface PlayerFinderPageState {
  searchResults: User[];
  nearbyPlayers: Array<User & { distance_km: number }>;
  preferences: PlayerFinder | null;
  searchFilters: {
    skillLevel: string;
    gender: string;
    ageRange: [number, number];
    matchType: string;
    radius: number;
    location: string;
  };
  isSearching: boolean;
  showPreferences: boolean;
}

export interface CourtReservationsPageProps extends PageProps {}

export interface CourtReservationsPageState {
  courts: Court[];
  reservations: CourtReservation[];
  selectedCourt: Court | null;
  selectedDate: string;
  selectedTime: string;
  duration: number;
  bookingForm: {
    purpose: string;
    matchType: string;
    participants: string[];
    guestCount: number;
    specialRequests: string;
    equipmentNeeded: string[];
  };
  showBookingModal: boolean;
}

export interface FindCourtPageProps extends PageProps {}

export interface FindCourtPageState {
  courts: Court[];
  filters: {
    courtType: string;
    surface: string;
    isAvailable: boolean;
    clubId: string;
    search: string;
    location: string;
    radius: number;
  };
  viewMode: 'grid' | 'list' | 'map';
  selectedCourt: Court | null;
  showFilters: boolean;
  userLocation: { lat: number; lng: number } | null;
}

export interface MembershipPageProps extends PageProps {}

export interface MembershipPageState {
  plans: Array<{
    id: string;
    name: string;
    price: number;
    period: 'monthly' | 'yearly';
    features: string[];
    popular: boolean;
    discount?: number;
  }>;
  selectedPlan: string | null;
  billingCycle: 'monthly' | 'yearly';
  showPaymentModal: boolean;
}

export interface MessagePageProps extends PageProps {}

export interface MessagePageState {
  conversations: Array<{
    id: string;
    participant: User;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isOnline: boolean;
  }>;
  selectedConversation: string | null;
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    type: 'text' | 'image' | 'file';
  }>;
  newMessage: string;
  isTyping: boolean;
}

// ============================================================================
// PLAYER PAGES
// ============================================================================

export interface PlayerDashboardProps extends PageProps {}

export interface PlayerDashboardState {
  playerStats: {
    tournamentsPlayed: number;
    tournamentsWon: number;
    currentRanking: number;
    rankingChange: string;
    totalPoints: number;
    matchesPlayed: number;
    winRate: number;
    nextTournament: string;
    nextTournamentDate: string;
    upcomingMatches: number;
    recentAchievements: string[];
  };
  recentActivity: Array<{
    type: 'tournament' | 'match' | 'ranking';
    title: string;
    date: string;
    result: string;
    points: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
    status: string;
  }>;
  quickActions: Array<{
    title: string;
    description: string;
    icon: string;
    action: () => void;
  }>;
}

export interface PlayerProfileProps extends PageProps {}

export interface PlayerProfileState {
  profile: User | null;
  rankings: Ranking[];
  tournamentHistory: Array<{
    id: string;
    name: string;
    date: string;
    result: string;
    points: number;
    category: string;
  }>;
  matchHistory: Array<{
    id: string;
    opponent: string;
    date: string;
    result: string;
    score: string;
    tournament?: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    icon: string;
  }>;
  isEditing: boolean;
  editForm: Partial<User>;
}

// ============================================================================
// COACH PAGES
// ============================================================================

export interface CoachDashboardProps extends PageProps {}

export interface CoachDashboardState {
  coachStats: {
    totalStudents: number;
    activeStudents: number;
    totalSessions: number;
    completedSessions: number;
    averageRating: number;
    totalReviews: number;
    monthlyRevenue: number;
    upcomingSessions: number;
  };
  recentStudents: Array<{
    id: string;
    name: string;
    skillLevel: string;
    lastSession: string;
    progress: number;
    photo: string;
  }>;
  upcomingSessions: Array<{
    id: string;
    studentName: string;
    date: string;
    time: string;
    duration: number;
    type: string;
    status: string;
  }>;
  quickActions: Array<{
    title: string;
    description: string;
    icon: string;
    action: () => void;
  }>;
}

export interface CoachProfileProps extends PageProps {}

export interface CoachProfileState {
  profile: User | null;
  certifications: Array<{
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    credentialId: string;
    image: string;
  }>;
  specializations: string[];
  experience: {
    yearsOfExperience: number;
    totalStudents: number;
    totalSessions: number;
    specialties: string[];
  };
  isEditing: boolean;
  editForm: Partial<User>;
}

export interface CoachCredentialsProps extends PageProps {}

export interface CoachCredentialsState {
  credentials: Array<{
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    credentialId: string;
    image: string;
    isVerified: boolean;
    verificationDate?: string;
  }>;
  pendingCredentials: Array<{
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate: string;
    status: 'pending' | 'under_review' | 'approved' | 'rejected';
    submittedDate: string;
    reviewNotes?: string;
  }>;
  showAddCredential: boolean;
  newCredential: {
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    credentialId: string;
    image?: File;
  };
}

export interface CoachStudentsProps extends PageProps {}

export interface CoachStudentsState {
  students: Array<{
    id: string;
    name: string;
    email: string;
    skillLevel: string;
    joinDate: string;
    lastSession: string;
    totalSessions: number;
    progress: number;
    status: 'active' | 'inactive' | 'pending';
    photo: string;
    notes: string;
  }>;
  filters: {
    status: string;
    skillLevel: string;
    search: string;
  };
  selectedStudent: string | null;
  showAddStudent: boolean;
  newStudent: {
    name: string;
    email: string;
    skillLevel: string;
    notes: string;
  };
}

export interface CoachSessionsProps extends PageProps {}

export interface CoachSessionsState {
  sessions: Array<{
    id: string;
    studentName: string;
    date: string;
    time: string;
    duration: number;
    type: 'lesson' | 'practice' | 'assessment' | 'tournament_prep';
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    notes: string;
    studentFeedback?: string;
    rating?: number;
  }>;
  filters: {
    status: string;
    dateRange: string;
    studentId: string;
    type: string;
  };
  selectedSession: string | null;
  showAddSession: boolean;
  newSession: {
    studentId: string;
    date: string;
    time: string;
    duration: number;
    type: string;
    notes: string;
  };
}

export interface CoachCertificationsProps extends PageProps {}

export interface CoachCertificationsState {
  certifications: Array<{
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    credentialId: string;
    image: string;
    isVerified: boolean;
    verificationDate?: string;
    status: 'active' | 'expired' | 'pending_verification';
  }>;
  availableCertifications: Array<{
    id: string;
    name: string;
    description: string;
    requirements: string[];
    cost: number;
    duration: string;
    organization: string;
  }>;
  showAddCertification: boolean;
  selectedCertification: string | null;
}

// ============================================================================
// CLUB PAGES
// ============================================================================

export interface ClubDashboardProps extends PageProps {}

export interface ClubDashboardState {
  clubStats: {
    totalMembers: number;
    activeMembers: number;
    totalCourts: number;
    availableCourts: number;
    upcomingEvents: number;
    monthlyRevenue: number;
    averageRating: number;
    totalReviews: number;
  };
  recentMembers: Array<{
    id: string;
    name: string;
    type: string;
    joinDate: string;
    status: string;
    photo: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    participants: number;
    type: string;
    status: string;
  }>;
  courtStatus: Array<{
    id: string;
    name: string;
    status: 'available' | 'occupied' | 'maintenance' | 'reserved';
    currentBooking?: string;
    nextAvailable?: string;
  }>;
  quickActions: Array<{
    title: string;
    description: string;
    icon: string;
    action: () => void;
  }>;
}

export interface ClubProfileProps extends PageProps {}

export interface ClubProfileState {
  profile: Club | null;
  isEditing: boolean;
  editForm: Partial<Club>;
  photos: Array<{
    id: string;
    url: string;
    caption: string;
    isPrimary: boolean;
  }>;
  showAddPhoto: boolean;
  newPhoto: {
    file: File | null;
    caption: string;
  };
}

export interface ClubCourtManagementProps extends PageProps {}

export interface ClubCourtManagementState {
  courts: Court[];
  selectedCourt: Court | null;
  showAddCourt: boolean;
  showEditCourt: boolean;
  newCourt: {
    name: string;
    courtType: string;
    surface: string;
    description: string;
    dimensions: string;
    capacity: number;
    hourlyRate: number;
    memberRate: number;
    isAvailable: boolean;
  };
  editForm: Partial<Court>;
  maintenanceMode: boolean;
  maintenanceForm: {
    startDate: string;
    endDate: string;
    notes: string;
  };
}

export interface ClubMemberManagementProps extends PageProps {}

export interface ClubMemberManagementState {
  members: Array<{
    id: string;
    name: string;
    email: string;
    membershipType: string;
    joinDate: string;
    status: string;
    lastVisit: string;
    totalVisits: number;
    photo: string;
  }>;
  filters: {
    status: string;
    membershipType: string;
    search: string;
    joinDateRange: string;
  };
  selectedMember: string | null;
  showAddMember: boolean;
  newMember: {
    name: string;
    email: string;
    membershipType: string;
    notes: string;
  };
  bulkActions: {
    selectedMembers: string[];
    action: string;
  };
}

export interface ClubMicrositeProps extends PageProps {}

export interface ClubMicrositeState {
  microsite: {
    customDomain?: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
      logo: string;
      bannerImage: string;
    };
    content: {
      about: string;
      rules: string;
      contactInfo: Record<string, string>;
      socialLinks: Record<string, string>;
    };
    features: {
      showEvents: boolean;
      showMembers: boolean;
      showCourts: boolean;
      showPhotos: boolean;
      showNews: boolean;
    };
  };
  isEditing: boolean;
  previewMode: boolean;
}

// ============================================================================
// PARTNER PAGES
// ============================================================================

export interface PartnerDashboardProps extends PageProps {}

export interface PartnerDashboardState {
  partnerStats: {
    totalCourts: number;
    totalBookings: number;
    monthlyRevenue: number;
    averageRating: number;
    totalReviews: number;
    activePartnerships: number;
    upcomingEvents: number;
  };
  recentBookings: Array<{
    id: string;
    courtName: string;
    customerName: string;
    date: string;
    time: string;
    amount: number;
    status: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    participants: number;
    type: string;
    status: string;
  }>;
  quickActions: Array<{
    title: string;
    description: string;
    icon: string;
    action: () => void;
  }>;
}

export interface BusinessProfileProps extends PageProps {}

export interface BusinessProfileState {
  profile: User | null;
  isEditing: boolean;
  editForm: Partial<User>;
  businessDetails: {
    businessName: string;
    contactPerson: string;
    website: string;
    socialMedia: Record<string, string>;
    operatingHours: Record<string, any>;
    services: string[];
    description: string;
  };
  photos: Array<{
    id: string;
    url: string;
    caption: string;
    isPrimary: boolean;
  }>;
}

export interface PartnerCourtManagementProps extends PageProps {}

export interface PartnerCourtManagementState {
  courts: Court[];
  selectedCourt: Court | null;
  showAddCourt: boolean;
  showEditCourt: boolean;
  newCourt: {
    name: string;
    courtType: string;
    surface: string;
    description: string;
    hourlyRate: number;
    isAvailable: boolean;
  };
  editForm: Partial<Court>;
  availabilitySettings: {
    operatingHours: Record<string, any>;
    maintenanceSchedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
      reason: string;
    }>;
  };
}

export interface BusinessMicrositeProps extends PageProps {}

export interface BusinessMicrositeState {
  microsite: {
    customDomain?: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
      logo: string;
      bannerImage: string;
    };
    content: {
      about: string;
      services: string[];
      contactInfo: Record<string, string>;
      socialLinks: Record<string, string>;
    };
    features: {
      showServices: boolean;
      showCourts: boolean;
      showPhotos: boolean;
      showReviews: boolean;
      showContact: boolean;
    };
  };
  isEditing: boolean;
  previewMode: boolean;
}

export interface PartnerAnalyticsProps extends PageProps {}

export interface PartnerAnalyticsState {
  analytics: {
    revenue: {
      daily: Array<{ date: string; amount: number }>;
      weekly: Array<{ week: string; amount: number }>;
      monthly: Array<{ month: string; amount: number }>;
    };
    bookings: {
      total: number;
      byCourt: Record<string, number>;
      byTimeSlot: Record<string, number>;
      byCustomerType: Record<string, number>;
    };
    customers: {
      total: number;
      newThisMonth: number;
      repeatCustomers: number;
      topCustomers: Array<{
        name: string;
        totalBookings: number;
        totalSpent: number;
      }>;
    };
  };
  dateRange: {
    start: string;
    end: string;
  };
  selectedMetrics: string[];
}

// ============================================================================
// STATE PAGES
// ============================================================================

export interface StateDashboardProps extends PageProps {}

export interface StateDashboardState {
  stateStats: {
    totalMembers: number;
    totalClubs: number;
    totalCourts: number;
    totalTournaments: number;
    activeMemberships: number;
    monthlyRevenue: number;
    upcomingEvents: number;
    pendingApprovals: number;
  };
  recentMembers: Array<{
    id: string;
    name: string;
    type: string;
    joinDate: string;
    status: string;
    city: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    location: string;
    participants: number;
    type: string;
  }>;
  pendingApprovals: Array<{
    id: string;
    type: string;
    name: string;
    submittedDate: string;
    priority: string;
  }>;
  quickActions: Array<{
    title: string;
    description: string;
    icon: string;
    action: () => void;
  }>;
}

export interface StateProfileProps extends PageProps {}

export interface StateProfileState {
  profile: User | null;
  isEditing: boolean;
  editForm: Partial<User>;
  stateInfo: {
    stateName: string;
    abbreviation: string;
    population: number;
    pickleballClubs: number;
    registeredPlayers: number;
    stateChampionships: number;
    description: string;
    contactInfo: Record<string, string>;
  };
  photos: Array<{
    id: string;
    url: string;
    caption: string;
    isPrimary: boolean;
  }>;
}

export interface StateMemberManagementProps extends PageProps {}

export interface StateMemberManagementState {
  members: Array<{
    id: string;
    name: string;
    email: string;
    city: string;
    membershipType: string;
    joinDate: string;
    status: string;
    lastActivity: string;
    photo: string;
  }>;
  filters: {
    status: string;
    membershipType: string;
    city: string;
    search: string;
    joinDateRange: string;
  };
  selectedMember: string | null;
  showAddMember: boolean;
  newMember: {
    name: string;
    email: string;
    city: string;
    membershipType: string;
    notes: string;
  };
  bulkActions: {
    selectedMembers: string[];
    action: string;
  };
}

export interface StateCourtManagementProps extends PageProps {}

export interface StateCourtManagementState {
  courts: Court[];
  selectedCourt: Court | null;
  showAddCourt: boolean;
  showEditCourt: boolean;
  newCourt: {
    name: string;
    clubId: string;
    courtType: string;
    surface: string;
    description: string;
    hourlyRate: number;
    isAvailable: boolean;
  };
  editForm: Partial<Court>;
  courtApprovals: Array<{
    id: string;
    courtName: string;
    clubName: string;
    submittedDate: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewNotes?: string;
  }>;
}

export interface StateMicrositeProps extends PageProps {}

export interface StateMicrositeState {
  microsite: {
    customDomain?: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
      logo: string;
      bannerImage: string;
    };
    content: {
      about: string;
      mission: string;
      programs: string[];
      contactInfo: Record<string, string>;
      socialLinks: Record<string, string>;
    };
    features: {
      showPrograms: boolean;
      showClubs: boolean;
      showEvents: boolean;
      showNews: boolean;
      showContact: boolean;
    };
  };
  isEditing: boolean;
  previewMode: boolean;
}

export interface StateAnnouncementsProps extends PageProps {}

export interface StateAnnouncementsState {
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    targetAudience: string[];
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
  }>;
  showAddAnnouncement: boolean;
  newAnnouncement: {
    title: string;
    content: string;
    priority: string;
    targetAudience: string[];
    startDate: string;
    endDate: string;
  };
  filters: {
    priority: string;
    targetAudience: string;
    dateRange: string;
    search: string;
  };
}

export interface StateStatisticsProps extends PageProps {}

export interface StateStatisticsState {
  statistics: {
    membership: {
      total: number;
      byCity: Record<string, number>;
      byType: Record<string, number>;
      growth: Array<{ month: string; count: number }>;
    };
    clubs: {
      total: number;
      byType: Record<string, number>;
      byCity: Record<string, number>;
      growth: Array<{ month: string; count: number }>;
    };
    tournaments: {
      total: number;
      byType: Record<string, number>;
      bySeason: Record<string, number>;
      participants: Array<{ month: string; count: number }>;
    };
    revenue: {
      total: number;
      byMonth: Array<{ month: string; amount: number }>;
      bySource: Record<string, number>;
    };
  };
  dateRange: {
    start: string;
    end: string;
  };
  selectedMetrics: string[];
}

// ============================================================================
// SUPER ADMIN PAGES
// ============================================================================

export interface AdminDashboardProps extends PageProps {}

export interface AdminDashboardState {
  systemStats: {
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
  };
  recentSystemEvents: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    severity: string;
    user: string;
  }>;
  pendingActions: Array<{
    id: string;
    type: string;
    count: number;
    description: string;
    priority: string;
  }>;
  systemHealth: {
    database: 'healthy' | 'warning' | 'critical';
    api: 'healthy' | 'warning' | 'critical';
    storage: 'healthy' | 'warning' | 'critical';
    email: 'healthy' | 'warning' | 'critical';
  };
  quickActions: Array<{
    title: string;
    description: string;
    icon: string;
    action: () => void;
  }>;
}

export interface AdminProfileProps extends PageProps {}

export interface AdminProfileState {
  profile: User | null;
  isEditing: boolean;
  editForm: Partial<User>;
  adminPermissions: {
    userManagement: boolean;
    systemManagement: boolean;
    contentManagement: boolean;
    analyticsAccess: boolean;
    financialAccess: boolean;
  };
  activityLog: Array<{
    id: string;
    action: string;
    description: string;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
  }>;
}

export interface UserManagementProps extends PageProps {}

export interface UserManagementState {
  users: User[];
  filters: {
    userType: string;
    status: string;
    state: string;
    search: string;
    dateRange: string;
  };
  selectedUser: string | null;
  showAddUser: boolean;
  newUser: {
    userType: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    state: string;
    city: string;
  };
  bulkActions: {
    selectedUsers: string[];
    action: string;
  };
  userRoles: {
    [userId: string]: string;
  };
}

export interface SystemManagementProps extends PageProps {}

export interface SystemManagementState {
  systemSettings: {
    general: {
      siteName: string;
      siteDescription: string;
      maintenanceMode: boolean;
      registrationEnabled: boolean;
      emailVerificationRequired: boolean;
    };
    email: {
      smtpHost: string;
      smtpPort: number;
      smtpUser: string;
      smtpPassword: string;
      fromEmail: string;
      fromName: string;
    };
    security: {
      passwordMinLength: number;
      requireSpecialChars: boolean;
      sessionTimeout: number;
      maxLoginAttempts: number;
      twoFactorRequired: boolean;
    };
    features: {
      enablePlayerFinder: boolean;
      enableCourtReservations: boolean;
      enableTournaments: boolean;
      enableRankings: boolean;
      enableNotifications: boolean;
    };
  };
  isEditing: boolean;
  editSection: string | null;
  systemLogs: Array<{
    id: string;
    level: string;
    message: string;
    timestamp: string;
    context: Record<string, any>;
  }>;
  logFilters: {
    level: string;
    dateRange: string;
    search: string;
  };
}

export interface AnalyticsProps extends PageProps {}

export interface AnalyticsState {
  analytics: {
    users: {
      total: number;
      byType: Record<string, number>;
      byState: Record<string, number>;
      growth: Array<{ month: string; count: number }>;
      retention: Array<{ month: string; rate: number }>;
    };
    clubs: {
      total: number;
      byType: Record<string, number>;
      byState: Record<string, number>;
      growth: Array<{ month: string; count: number }>;
      performance: Array<{ name: string; members: number; revenue: number }>;
    };
    tournaments: {
      total: number;
      byType: Record<string, number>;
      byState: Record<string, number>;
      participants: Array<{ month: string; count: number }>;
      revenue: Array<{ month: string; amount: number }>;
    };
    revenue: {
      total: number;
      byMonth: Array<{ month: string; amount: number }>;
      bySource: Record<string, number>;
      byState: Record<string, number>;
    };
    system: {
      uptime: number;
      performance: Array<{ metric: string; value: number; status: string }>;
      errors: Array<{ type: string; count: number; lastOccurrence: string }>;
    };
  };
  dateRange: {
    start: string;
    end: string;
  };
  selectedMetrics: string[];
  exportFormat: 'csv' | 'json' | 'pdf';
}

export interface BannersPageProps extends PageProps {}

export interface BannersPageState {
  banners: Banner[];
  filters: {
    displayType: string;
    targetAudience: string;
    isActive: boolean;
    isFeatured: boolean;
    search: string;
    dateRange: string;
  };
  selectedBanner: string | null;
  showAddBanner: boolean;
  showEditBanner: boolean;
  newBanner: {
    title: string;
    subtitle: string;
    imageUrl: string;
    actionUrl: string;
    actionText: string;
    position: number;
    isActive: boolean;
    isFeatured: boolean;
    displayType: string;
    targetAudience: string;
    startDate: string;
    endDate: string;
    tags: string[];
  };
  editForm: Partial<Banner>;
  bannerAnalytics: {
    totalViews: number;
    totalClicks: number;
    clickThroughRate: number;
    topPerforming: Banner[];
  };
  dragAndDrop: {
    isDragging: boolean;
    draggedBanner: string | null;
    targetPosition: number | null;
  };
}

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

export interface HeaderProps {
  user: User | null;
  isAuthenticated: boolean;
  notifications: Notification[];
  unreadCount: number;
  onLogout: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export interface FooterProps {
  className?: string;
}

export interface SidebarProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  navigation: Array<{
    title: string;
    href: string;
    icon: string;
    children?: Array<{
      title: string;
      href: string;
      icon: string;
    }>;
  }>;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export interface FormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'date' | 'file';
  value: any;
  onChange: (value: any) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    header: string;
    render?: (value: any, row: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
  }>;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  selectedIds?: string[];
  loading?: boolean;
  emptyMessage?: string;
}

export interface ChartProps {
  data: any;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  options?: any;
  height?: number;
  width?: number;
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface UserCardProps {
  user: User;
  showActions?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onViewProfile?: (user: User) => void;
}

export interface TournamentCardProps {
  tournament: Tournament;
  showActions?: boolean;
  onRegister?: (tournament: Tournament) => void;
  onViewDetails?: (tournament: Tournament) => void;
  onEdit?: (tournament: Tournament) => void;
}

export interface ClubCardProps {
  club: Club;
  showActions?: boolean;
  onJoin?: (club: Club) => void;
  onViewDetails?: (club: Club) => void;
  onEdit?: (club: Club) => void;
}

export interface CourtCardProps {
  court: Court;
  showActions?: boolean;
  onBook?: (court: Court) => void;
  onViewDetails?: (court: Court) => void;
  onEdit?: (court: Court) => void;
}

// ============================================================================
// HOOK INTERFACES
// ============================================================================

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export interface UsePaginationReturn {
  page: number;
  limit: number;
  total: number;
  pages: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

export interface UseSearchReturn {
  search: string;
  filters: Record<string, any>;
  setSearch: (search: string) => void;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  applyFilters: () => void;
}

// ============================================================================
// UTILITY INTERFACES
// ============================================================================

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface FileUploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

export interface TableState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedIds: string[];
}

export interface ModalState {
  isOpen: boolean;
  type: string;
  data: any;
}

export interface ToastState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// EXPORT ALL INTERFACES
// ============================================================================