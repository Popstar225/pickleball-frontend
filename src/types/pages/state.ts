export interface StateDashboardProps {
  state: State;
  recentActivity: StateActivity[];
  upcomingEvents: StateEvent[];
  stats: StateStats;
  notifications: StateNotification[];
}

export interface State {
  id: string;
  profile: StateProfile;
  management: StateManagement;
  facilities: StateFacility[];
  members: StateMember[];
  policies: StatePolicies;
}

export interface StateProfile {
  name: string;
  abbreviation: string;
  description: string;
  flag?: string;
  seal?: string;
  capital: string;
  population: number;
  area: number;
  website: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface StateManagement {
  director: StateDirector;
  staff: StateStaff[];
  committees: StateCommittee[];
  contactInfo: StateContactInfo;
}

export interface StateDirector {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  bio: string;
  image?: string;
  termStart: string;
  termEnd?: string;
}

export interface StateStaff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  permissions: string[];
  hireDate: string;
}

export interface StateCommittee {
  id: string;
  name: string;
  purpose: string;
  members: StateCommitteeMember[];
  meetings: StateCommitteeMeeting[];
}

export interface StateCommitteeMember {
  id: string;
  name: string;
  role: string;
  joinDate: string;
}

export interface StateCommitteeMeeting {
  id: string;
  date: string;
  time: string;
  location: string;
  agenda: string[];
  attendees: string[];
}

export interface StateContactInfo {
  address: string;
  phone: string;
  email: string;
  emergencyContact: string;
  businessHours: string;
}

export interface StateFacility {
  id: string;
  name: string;
  type: 'court' | 'training' | 'equipment' | 'office';
  description: string;
  location: string;
  capacity: number;
  amenities: string[];
  availability: StateFacilityAvailability;
  pricing: StateFacilityPricing;
}

export interface StateFacilityAvailability {
  days: string[];
  hours: {
    open: string;
    close: string;
  };
  maintenanceSchedule?: string;
  status: 'available' | 'maintenance' | 'reserved';
}

export interface StateFacilityPricing {
  memberPrice: number;
  nonMemberPrice: number;
  hourlyRate: number;
  dailyRate: number;
  specialRates?: {
    [key: string]: number;
  };
}

export interface StateMember {
  id: string;
  profile: StateMemberProfile;
  membership: StateMembershipDetails;
  preferences: StateMemberPreferences;
  activity: StateMemberActivity;
}

export interface StateMemberProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  joinDate: string;
  city: string;
  county: string;
}

export interface StateMembershipDetails {
  type: 'basic' | 'premium' | 'vip' | 'family';
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  dues: number;
  paymentMethod: string;
}

export interface StateMemberPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
  };
  gameplay: {
    preferredCourts: string[];
    preferredTimes: string[];
    skillLevel: string;
  };
}

export interface StateMemberActivity {
  totalGames: number;
  lastPlayed: string;
  favoriteCourts: string[];
  achievements: string[];
}

export interface StatePolicies {
  membership: StateMembershipPolicy;
  facilities: StateFacilityPolicy;
  events: StateEventPolicy;
  conduct: StateConductPolicy;
}

export interface StateMembershipPolicy {
  applicationProcess: string;
  requirements: string[];
  dues: string;
  cancellation: string;
}

export interface StateFacilityPolicy {
  reservationRules: string;
  usageGuidelines: string;
  maintenance: string;
  safety: string;
}

export interface StateEventPolicy {
  hosting: string;
  participation: string;
  cancellation: string;
  refunds: string;
}

export interface StateConductPolicy {
  behavior: string;
  dressCode: string;
  sportsmanship: string;
  violations: string;
}

export interface StateActivity {
  id: string;
  type: 'game' | 'tournament' | 'practice' | 'social' | 'maintenance' | 'administrative';
  title: string;
  description: string;
  date: string;
  participants: number;
  location: string;
}

export interface StateEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'tournament' | 'social' | 'training' | 'meeting' | 'conference';
  maxParticipants: number;
  currentParticipants: number;
  registrationRequired: boolean;
}

export interface StateStats {
  totalMembers: number;
  activeMembers: number;
  totalFacilities: number;
  monthlyEvents: number;
  monthlyRevenue: number;
  memberSatisfaction: number;
  growthRate: number;
}

export interface StateNotification {
  id: string;
  type: 'event' | 'maintenance' | 'policy' | 'system' | 'administrative';
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface StateProfilePageProps {
  state: State;
  onProfileUpdate: (profile: Partial<StateProfile>) => void;
  onPoliciesUpdate: (policies: Partial<StatePolicies>) => void;
  isLoading?: boolean;
}

export interface StateMicrositeProps {
  state: State;
  isPublic: boolean;
}

export interface CourtManagementProps {
  facilities: StateFacility[];
  onFacilityUpdate: (id: string, facility: Partial<StateFacility>) => void;
  onFacilityAdd: (facility: Omit<StateFacility, 'id'>) => void;
  onFacilityDelete: (id: string) => void;
  isLoading?: boolean;
}

export interface MemberManagementProps {
  members: StateMember[];
  onMemberUpdate: (id: string, member: Partial<StateMember>) => void;
  onMemberRemove: (id: string) => void;
  onMembershipUpdate: (id: string, membership: Partial<StateMembershipDetails>) => void;
  isLoading?: boolean;
}

export interface AnnouncementsProps {
  announcements: StateAnnouncement[];
  onAnnouncementAdd: (announcement: Omit<StateAnnouncement, 'id'>) => void;
  onAnnouncementUpdate: (id: string, announcement: Partial<StateAnnouncement>) => void;
  onAnnouncementDelete: (id: string) => void;
  isLoading?: boolean;
}

export interface StateAnnouncement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience: string[];
  expiresAt?: string;
}

export interface StatisticsProps {
  stats: StateStats;
  trends: StateTrend[];
  reports: StateReport[];
  dateRange: {
    start: string;
    end: string;
  };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  isLoading?: boolean;
}

export interface StateTrend {
  metric: string;
  period: string;
  values: number[];
  labels: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
}

export interface StateReport {
  id: string;
  title: string;
  description: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  date: string;
  data: any;
  format: 'pdf' | 'excel' | 'csv';
} 