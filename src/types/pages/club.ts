export interface ClubDashboardProps {
  club: Club;
  recentActivity: ClubActivity[];
  upcomingEvents: ClubEvent[];
  stats: ClubStats;
  notifications: ClubNotification[];
}

export interface Club {
  id: string;
  profile: ClubProfile;
  facilities: ClubFacility[];
  members: ClubMember[];
  management: ClubManagement;
  policies: ClubPolicies;
}

export interface ClubProfile {
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  founded: string;
  type: 'public' | 'private' | 'semi-private';
  category: 'recreation' | 'competitive' | 'social' | 'training';
  website?: string;
  socialMedia: SocialMediaLinks;
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

export interface ClubFacility {
  id: string;
  name: string;
  type: 'court' | 'training' | 'social' | 'equipment';
  description: string;
  capacity: number;
  amenities: string[];
  availability: FacilityAvailability;
  pricing: FacilityPricing;
}

export interface FacilityAvailability {
  days: string[];
  hours: {
    open: string;
    close: string;
  };
  maintenanceSchedule?: string;
  status: 'available' | 'maintenance' | 'reserved';
}

export interface FacilityPricing {
  memberPrice: number;
  nonMemberPrice: number;
  hourlyRate: number;
  dailyRate: number;
  specialRates?: {
    [key: string]: number;
  };
}

export interface ClubMember {
  id: string;
  profile: MemberProfile;
  membership: MembershipDetails;
  preferences: MemberPreferences;
  activity: MemberActivity;
}

export interface MemberProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  joinDate: string;
}

export interface MembershipDetails {
  type: 'basic' | 'premium' | 'vip' | 'family';
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  dues: number;
  paymentMethod: string;
}

export interface MemberPreferences {
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

export interface MemberActivity {
  totalGames: number;
  lastPlayed: string;
  favoriteCourts: string[];
  achievements: string[];
}

export interface ClubManagement {
  owner: ClubOwner;
  staff: ClubStaff[];
  committees: Committee[];
  contactInfo: ContactInformation;
}

export interface ClubOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  ownershipPercentage: number;
  joinDate: string;
}

export interface ClubStaff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  permissions: string[];
  hireDate: string;
}

export interface Committee {
  id: string;
  name: string;
  purpose: string;
  members: CommitteeMember[];
  meetings: CommitteeMeeting[];
}

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  joinDate: string;
}

export interface CommitteeMeeting {
  id: string;
  date: string;
  time: string;
  location: string;
  agenda: string[];
  attendees: string[];
}

export interface ContactInformation {
  address: string;
  phone: string;
  email: string;
  emergencyContact: string;
  businessHours: string;
}

export interface ClubPolicies {
  membership: MembershipPolicy;
  facilities: FacilityPolicy;
  events: EventPolicy;
  conduct: ConductPolicy;
}

export interface MembershipPolicy {
  applicationProcess: string;
  requirements: string[];
  dues: string;
  cancellation: string;
}

export interface FacilityPolicy {
  reservationRules: string;
  usageGuidelines: string;
  maintenance: string;
  safety: string;
}

export interface EventPolicy {
  hosting: string;
  participation: string;
  cancellation: string;
  refunds: string;
}

export interface ConductPolicy {
  behavior: string;
  dressCode: string;
  sportsmanship: string;
  violations: string;
}

export interface ClubActivity {
  id: string;
  type: 'game' | 'tournament' | 'practice' | 'social' | 'maintenance';
  title: string;
  description: string;
  date: string;
  participants: number;
  location: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'tournament' | 'social' | 'training' | 'meeting';
  maxParticipants: number;
  currentParticipants: number;
  registrationRequired: boolean;
}

export interface ClubStats {
  totalMembers: number;
  activeMembers: number;
  totalCourts: number;
  monthlyGames: number;
  monthlyRevenue: number;
  memberSatisfaction: number;
}

export interface ClubNotification {
  id: string;
  type: 'event' | 'maintenance' | 'policy' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface ClubProfilePageProps {
  club: Club;
  onProfileUpdate: (profile: Partial<ClubProfile>) => void;
  onPoliciesUpdate: (policies: Partial<ClubPolicies>) => void;
  isLoading?: boolean;
}

export interface ClubMicrositeProps {
  club: Club;
  isPublic: boolean;
}

export interface CourtManagementProps {
  facilities: ClubFacility[];
  onFacilityUpdate: (id: string, facility: Partial<ClubFacility>) => void;
  onFacilityAdd: (facility: Omit<ClubFacility, 'id'>) => void;
  onFacilityDelete: (id: string) => void;
  isLoading?: boolean;
}

export interface MemberManagementProps {
  members: ClubMember[];
  onMemberUpdate: (id: string, member: Partial<ClubMember>) => void;
  onMemberRemove: (id: string) => void;
  onMembershipUpdate: (id: string, membership: Partial<MembershipDetails>) => void;
  isLoading?: boolean;
} 