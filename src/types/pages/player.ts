export interface PlayerDashboardProps {
  player: Player;
  recentActivity: PlayerActivity[];
  upcomingEvents: PlayerEvent[];
  stats: PlayerStats;
  notifications: PlayerNotification[];
}

export interface Player {
  id: string;
  profile: PlayerProfile;
  membership: PlayerMembership;
  preferences: PlayerPreferences;
  achievements: PlayerAchievement[];
}

export interface PlayerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bio?: string;
  profilePicture?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  experience: number; // years
  dominantHand: 'left' | 'right' | 'ambidextrous';
  playingStyle: string[];
}

export interface PlayerMembership {
  memberSince: string;
  membershipType: 'basic' | 'premium' | 'vip';
  status: 'active' | 'inactive' | 'suspended';
  renewalDate: string;
  autoRenew: boolean;
}

export interface PlayerPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    statsVisible: boolean;
    activityVisible: boolean;
  };
  gameplay: {
    preferredCourts: string[];
    preferredTimes: string[];
    maxTravelDistance: number;
  };
}

export interface PlayerAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'tournament' | 'skill' | 'participation' | 'social';
}

export interface PlayerActivity {
  id: string;
  type: 'game' | 'tournament' | 'practice' | 'social';
  title: string;
  description: string;
  date: string;
  location?: string;
  score?: string;
  opponent?: string;
}

export interface PlayerEvent {
  id: string;
  type: 'tournament' | 'practice' | 'social';
  title: string;
  date: string;
  location: string;
  status: 'upcoming' | 'registered' | 'completed' | 'cancelled';
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winPercentage: number;
  totalTournaments: number;
  tournamentWins: number;
  averageScore: number;
  skillRating: number;
  ranking: number;
}

export interface PlayerNotification {
  id: string;
  type: 'game' | 'tournament' | 'social' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl?: string;
}

export interface PlayerProfilePageProps {
  player: Player;
  onProfileUpdate: (profile: Partial<PlayerProfile>) => void;
  onPreferencesUpdate: (preferences: Partial<PlayerPreferences>) => void;
  isLoading?: boolean;
} 