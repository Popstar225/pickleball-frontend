export interface HomePageProps {
  featuredEvents: Event[];
  latestNews: NewsItem[];
  upcomingTournaments: Tournament[];
  isLoading?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  type: 'tournament' | 'workshop' | 'social';
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  publishedAt: string;
  author: string;
  tags: string[];
}

export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'open';
}

export interface AboutPageProps {
  content: AboutContent;
  team: TeamMember[];
  stats: CompanyStats;
}

export interface AboutContent {
  title: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  socialLinks: SocialLinks;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  email?: string;
}

export interface CompanyStats {
  totalUsers: number;
  totalClubs: number;
  totalTournaments: number;
  totalCourts: number;
}

export interface ContactPageProps {
  contactInfo: ContactInfo;
  contactForm: ContactForm;
  officeLocations: OfficeLocation[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  businessHours: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface OfficeLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface EventsPageProps {
  events: Event[];
  filters: EventFilters;
  pagination: Pagination;
}

export interface EventFilters {
  type?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  location?: string;
  skillLevel?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface NewsPageProps {
  news: NewsItem[];
  categories: string[];
  selectedCategory?: string;
  pagination: Pagination;
} 