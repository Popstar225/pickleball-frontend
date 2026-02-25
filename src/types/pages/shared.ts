export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  website?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  available: boolean;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  participants?: number;
  location?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  maxParticipants: number;
  currentParticipants: number;
  registrationRequired: boolean;
}

export interface Stats {
  totalItems: number;
  activeItems: number;
  monthlyRevenue?: number;
  totalRevenue?: number;
  growthRate?: number;
  satisfaction?: number;
} 