/**
 * Court Service
 *
 * Handles all court and venue-related API calls
 * Fetches court and venue locations with coordinates
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import { get } from '@/lib/api';

export interface Club {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  city?: string;
  address?: string;
}

export interface Venue {
  id: string;
  name: string;
  address?: string;
  number_of_courts?: number;
  club: Club;
}

export interface Court {
  id: string;
  name: string;
  court_type?: string;
  surface?: string;
  club: Club;
  venue?: Venue;
}

export interface CourtsResponse {
  data: Court[];
  success: boolean;
  message: string;
}

export interface VenueResponse {
  data: Venue;
  success: boolean;
  message: string;
}

export interface VenuesResponse {
  data: Venue[];
  success: boolean;
  message: string;
}

/**
 * Fetch all courts
 */
export async function fetchCourts(params?: {
  state?: string;
  city?: string;
  court_type?: string;
  limit?: number;
  page?: number;
}): Promise<CourtsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.state) queryParams.append('state', params.state);
  if (params?.city) queryParams.append('city', params.city);
  if (params?.court_type) queryParams.append('court_type', params.court_type);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.page) queryParams.append('page', params.page.toString());

  const queryString = queryParams.toString();
  const url = `/api/v1/courts${queryString ? `?${queryString}` : ''}`;

  return get<CourtsResponse>(url);
}

/**
 * Fetch courts by state
 */
export async function fetchCourtsByState(state: string): Promise<CourtsResponse> {
  return get<CourtsResponse>(`/api/v1/courts?state=${state}`);
}

/**
 * Fetch venue by ID
 */
export async function fetchVenueById(venueId: string): Promise<VenueResponse> {
  return get<VenueResponse>(`/api/v1/venues/${venueId}`);
}

/**
 * Fetch venues by club
 */
export async function fetchVenuesByClub(clubId: string): Promise<VenuesResponse> {
  return get<VenuesResponse>(`/api/v1/venues/club/${clubId}`);
}

/**
 * Convert coordinates to bounds for map display
 */
export function getMapBounds(locations: { latitude: number; longitude: number }[]) {
  if (locations.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 };
  }

  const latitudes = locations.map((l) => l.latitude);
  const longitudes = locations.map((l) => l.longitude);

  return {
    north: Math.max(...latitudes),
    south: Math.min(...latitudes),
    east: Math.max(...longitudes),
    west: Math.min(...longitudes),
  };
}
