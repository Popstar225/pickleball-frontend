export interface CoachDashboardProps {
  coach: Coach;
  recentSessions: CoachingSession[];
  upcomingSessions: CoachingSession[];
  students: Student[];
  stats: CoachStats;
  notifications: CoachNotification[];
}

export interface Coach {
  id: string;
  profile: CoachProfile;
  credentials: CoachCredentials;
  business: CoachBusiness;
  availability: CoachAvailability;
}

export interface CoachProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  profilePicture?: string;
  experience: number; // years
  specialties: string[];
  languages: string[];
  location: string;
}

export interface CoachCredentials {
  certifications: Certification[];
  education: Education[];
  achievements: Achievement[];
  verified: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId: string;
  image?: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: number;
  gpa?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'tournament' | 'coaching' | 'recognition';
}

export interface CoachBusiness {
  businessName: string;
  businessType: 'individual' | 'company' | 'partnership';
  taxId?: string;
  insurance: boolean;
  liabilityCoverage?: number;
  businessHours: BusinessHours[];
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  available: boolean;
}

export interface CoachAvailability {
  availableDays: string[];
  availableTimes: TimeSlot[];
  maxBookingsPerDay: number;
  advanceBookingDays: number;
  cancellationPolicy: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface CoachingSession {
  id: string;
  student: Student;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  type: 'individual' | 'group' | 'assessment';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location: string;
  notes?: string;
  price: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  progress: StudentProgress;
  lastSession?: string;
}

export interface StudentProgress {
  totalSessions: number;
  skillImprovement: number; // percentage
  goalsAchieved: number;
  currentFocus: string[];
}

export interface CoachStats {
  totalStudents: number;
  totalSessions: number;
  averageRating: number;
  totalEarnings: number;
  monthlyEarnings: number;
  completionRate: number;
}

export interface CoachNotification {
  id: string;
  type: 'booking' | 'cancellation' | 'reminder' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl?: string;
}

export interface CoachProfilePageProps {
  coach: Coach;
  onProfileUpdate: (profile: Partial<CoachProfile>) => void;
  onCredentialsUpdate: (credentials: Partial<CoachCredentials>) => void;
  onBusinessUpdate: (business: Partial<CoachBusiness>) => void;
  isLoading?: boolean;
}

export interface CredentialsPageProps {
  coach: Coach;
  onCredentialsUpdate: (credentials: Partial<CoachCredentials>) => void;
  isLoading?: boolean;
}

export interface CertificationsPageProps {
  certifications: Certification[];
  onCertificationAdd: (certification: Omit<Certification, 'id'>) => void;
  onCertificationUpdate: (id: string, certification: Partial<Certification>) => void;
  onCertificationDelete: (id: string) => void;
  isLoading?: boolean;
}

export interface SessionsPageProps {
  sessions: CoachingSession[];
  filters: SessionFilters;
  onSessionUpdate: (id: string, session: Partial<CoachingSession>) => void;
  onSessionCancel: (id: string) => void;
  isLoading?: boolean;
}

export interface SessionFilters {
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  studentId?: string;
  type?: string;
}

export interface StudentsPageProps {
  students: Student[];
  onStudentUpdate: (id: string, student: Partial<Student>) => void;
  onStudentRemove: (id: string) => void;
  isLoading?: boolean;
} 