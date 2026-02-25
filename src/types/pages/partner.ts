export interface PartnerDashboardProps {
  partner: Partner;
  recentActivity: PartnerActivity[];
  upcomingEvents: PartnerEvent[];
  stats: PartnerStats;
  notifications: PartnerNotification[];
}

export interface Partner {
  id: string;
  profile: PartnerProfile;
  business: PartnerBusiness;
  facilities: PartnerFacility[];
  partnerships: Partnership[];
  analytics: PartnerAnalytics;
}

export interface PartnerProfile {
  businessName: string;
  description: string;
  logo?: string;
  banner?: string;
  industry: string;
  website: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  contactPerson: ContactPerson;
}

export interface ContactPerson {
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedin?: string;
}

export interface PartnerBusiness {
  businessType: 'corporation' | 'llc' | 'partnership' | 'sole-proprietorship';
  taxId: string;
  founded: string;
  employees: number;
  revenue: string;
  certifications: string[];
  insurance: boolean;
  liabilityCoverage?: number;
}

export interface PartnerFacility {
  id: string;
  name: string;
  type: 'court' | 'training' | 'equipment' | 'retail';
  description: string;
  location: string;
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

export interface Partnership {
  id: string;
  type: 'sponsorship' | 'facility' | 'equipment' | 'service';
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  value: number;
  benefits: string[];
  obligations: string[];
  performance: PartnershipPerformance;
}

export interface PartnershipPerformance {
  metrics: PerformanceMetric[];
  targets: PerformanceTarget[];
  achievements: string[];
  challenges: string[];
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PerformanceTarget {
  name: string;
  target: number;
  current: number;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'completed' | 'overdue';
}

export interface PartnerAnalytics {
  overview: AnalyticsOverview;
  trends: AnalyticsTrend[];
  insights: AnalyticsInsight[];
  recommendations: AnalyticsRecommendation[];
}

export interface AnalyticsOverview {
  totalRevenue: number;
  monthlyRevenue: number;
  totalPartnerships: number;
  activePartnerships: number;
  customerSatisfaction: number;
  marketShare: number;
}

export interface AnalyticsTrend {
  metric: string;
  period: string;
  values: number[];
  labels: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
}

export interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'revenue' | 'partnerships' | 'operations' | 'market';
  date: string;
}

export interface AnalyticsRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'revenue' | 'partnerships' | 'operations' | 'market';
  expectedImpact: string;
  implementation: string;
}

export interface PartnerActivity {
  id: string;
  type: 'partnership' | 'facility' | 'event' | 'financial';
  title: string;
  description: string;
  date: string;
  impact: 'positive' | 'negative' | 'neutral';
  value?: number;
}

export interface PartnerEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'meeting' | 'presentation' | 'networking' | 'training';
  attendees: number;
  maxAttendees: number;
  registrationRequired: boolean;
}

export interface PartnerStats {
  totalPartnerships: number;
  activePartnerships: number;
  totalRevenue: number;
  monthlyRevenue: number;
  customerSatisfaction: number;
  marketShare: number;
  growthRate: number;
}

export interface PartnerNotification {
  id: string;
  type: 'partnership' | 'financial' | 'operational' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
}

export interface BusinessProfilePageProps {
  partner: Partner;
  onProfileUpdate: (profile: Partial<PartnerProfile>) => void;
  onBusinessUpdate: (business: Partial<PartnerBusiness>) => void;
  isLoading?: boolean;
}

export interface BusinessMicrositeProps {
  partner: Partner;
  isPublic: boolean;
}

export interface CourtManagementProps {
  facilities: PartnerFacility[];
  onFacilityUpdate: (id: string, facility: Partial<PartnerFacility>) => void;
  onFacilityAdd: (facility: Omit<PartnerFacility, 'id'>) => void;
  onFacilityDelete: (id: string) => void;
  isLoading?: boolean;
}

export interface AnalyticsPageProps {
  analytics: PartnerAnalytics;
  dateRange: {
    start: string;
    end: string;
  };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  isLoading?: boolean;
} 