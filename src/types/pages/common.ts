export interface ClubsPageProps {
  clubs: Club[];
  filters: ClubFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  onClubSelect: (club: Club) => void;
  isLoading?: boolean;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logo?: string;
  location: string;
  type: 'public' | 'private' | 'semi-private';
  category: 'recreation' | 'competitive' | 'social' | 'training';
  rating: number;
  memberCount: number;
  courtCount: number;
  amenities: string[];
  pricing: ClubPricing;
}

export interface ClubPricing {
  membershipFee: number;
  monthlyDues: number;
  courtHourlyRate: number;
  guestFee: number;
}

export interface ClubFilters {
  location?: string;
  type?: string;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  amenities?: string[];
  rating?: number;
}

export interface CourtReservationsPageProps {
  reservations: CourtReservation[];
  availableCourts: Court[];
  filters: ReservationFilters;
  onReservationCreate: (reservation: Omit<CourtReservation, 'id'>) => void;
  onReservationUpdate: (id: string, reservation: Partial<CourtReservation>) => void;
  onReservationCancel: (id: string) => void;
  isLoading?: boolean;
}

export interface CourtReservation {
  id: string;
  court: Court;
  user: User;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  type: 'individual' | 'group' | 'tournament';
  participants: number;
  notes?: string;
  price: number;
  createdAt: string;
}

export interface Court {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor' | 'covered';
  surface: 'concrete' | 'asphalt' | 'clay' | 'artificial-grass';
  size: 'standard' | 'oversized' | 'mini';
  amenities: string[];
  availability: CourtAvailability;
  pricing: CourtPricing;
  location: string;
}

export interface CourtAvailability {
  days: string[];
  hours: {
    open: string;
    close: string;
  };
  maintenanceSchedule?: string;
  status: 'available' | 'maintenance' | 'reserved';
}

export interface CourtPricing {
  memberPrice: number;
  nonMemberPrice: number;
  hourlyRate: number;
  specialRates?: {
    [key: string]: number;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  membershipType: 'basic' | 'premium' | 'vip';
}

export interface ReservationFilters {
  date?: string;
  timeRange?: {
    start: string;
    end: string;
  };
  courtType?: string;
  surface?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface FindCourtProps {
  courts: Court[];
  filters: CourtFilters;
  mapCenter: MapCoordinates;
  onCourtSelect: (court: Court) => void;
  onFiltersChange: (filters: CourtFilters) => void;
  onMapCenterChange: (coordinates: MapCoordinates) => void;
  isLoading?: boolean;
}

export interface CourtFilters {
  location?: string;
  type?: string;
  surface?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  amenities?: string[];
  availability?: {
    date: string;
    time: string;
  };
}

export interface MapCoordinates {
  lat: number;
  lng: number;
  zoom: number;
}

export interface MembershipProps {
  user: User;
  membership: Membership;
  benefits: MembershipBenefit[];
  onMembershipUpgrade: (type: string) => void;
  onMembershipCancel: () => void;
  onPaymentMethodUpdate: (method: PaymentMethod) => void;
  isLoading?: boolean;
}

export interface Membership {
  type: 'basic' | 'premium' | 'vip';
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  paymentMethod: PaymentMethod;
}

export interface MembershipBenefit {
  id: string;
  name: string;
  description: string;
  icon: string;
  included: boolean;
  value?: number;
}

export interface PaymentMethod {
  id: string;
  type: 'credit-card' | 'debit-card' | 'bank-transfer' | 'paypal';
  last4?: string;
  brand?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface MessagePageProps {
  conversations: Conversation[];
  activeConversation?: Conversation;
  onConversationSelect: (conversation: Conversation) => void;
  onMessageSend: (conversationId: string, message: Omit<Message, 'id'>) => void;
  onConversationCreate: (participants: string[]) => void;
  isLoading?: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  type: 'direct' | 'group';
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface PlayerFinderPageProps {
  players: Player[];
  filters: PlayerFinderFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  onPlayerSelect: (player: Player) => void;
  onPlayerContact: (player: Player) => void;
  isLoading?: boolean;
}

export interface Player {
  id: string;
  profile: PlayerProfile;
  stats: PlayerStats;
  availability: PlayerAvailability;
  preferences: PlayerPreferences;
}

export interface PlayerProfile {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  experience: number; // years
  location: string;
  bio?: string;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winPercentage: number;
  averageScore: number;
  skillRating: number;
}

export interface PlayerAvailability {
  availableDays: string[];
  availableTimes: string[];
  maxTravelDistance: number;
  preferredLocations: string[];
}

export interface PlayerPreferences {
  preferredSkillLevel: string[];
  preferredGameType: string[];
  preferredCourtType: string[];
  communicationPreferences: string[];
}

export interface PlayerFinderFilters {
  skillLevel?: string;
  location?: string;
  availability?: {
    days: string[];
    time: string;
  };
  gameType?: string;
  maxDistance?: number;
  experience?: number;
}

export interface RankingsPageProps {
  rankings: Ranking[];
  categories: RankingCategory[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onPlayerSelect: (player: Player) => void;
  isLoading?: boolean;
}

export interface Ranking {
  id: string;
  player: Player;
  category: string;
  rank: number;
  points: number;
  previousRank: number;
  change: 'up' | 'down' | 'stable';
  tournaments: number;
  wins: number;
  losses: number;
}

export interface RankingCategory {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  updateFrequency: string;
}

export interface TournamentsPageProps {
  tournaments: Tournament[];
  filters: TournamentFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  onTournamentSelect: (tournament: Tournament) => void;
  onTournamentRegister: (tournament: Tournament) => void;
  isLoading?: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  image?: string;
  startDate: string;
  endDate: string;
  location: string;
  venue: string;
  type: 'singles' | 'doubles' | 'mixed' | 'team';
  format: 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss';
  skillLevels: string[];
  ageGroups: string[];
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  prizePool: number;
  registrationDeadline: string;
  status: 'upcoming' | 'registration' | 'in-progress' | 'completed' | 'cancelled';
  organizer: TournamentOrganizer;
}

export interface TournamentOrganizer {
  id: string;
  name: string;
  type: 'club' | 'state' | 'partner' | 'individual';
  contactInfo: ContactInfo;
}

export interface ContactInfo {
  email: string;
  phone: string;
  website?: string;
}

export interface TournamentFilters {
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  type?: string;
  skillLevel?: string;
  ageGroup?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  status?: string;
} 