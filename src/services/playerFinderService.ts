/**
 * Player Finder Service
 *
 * Handles all player search and geolocation-based API calls
 * Finds nearby players with distance calculations
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import { post } from '@/lib/api';

export interface PlayerFinderResult {
  id: string;
  full_name: string;
  profile_photo?: string;
  skill_level: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  membership_status: string;
  distance_km: number; // Distance from search origin
}

export interface PlayerFinderResponse {
  data: PlayerFinderResult[];
  success: boolean;
  message: string;
}

/**
 * Search for nearby players using geolocation
 */
export async function searchNearbyPlayers(params: {
  latitude: number;
  longitude: number;
  radius_km?: number;
  skill_level?: string;
  state?: string;
  limit?: number;
}): Promise<PlayerFinderResponse> {
  const url = '/api/v1/player-finder/search';

  return post<PlayerFinderResponse, typeof params>(url, {
    latitude: params.latitude,
    longitude: params.longitude,
    radius_km: params.radius_km || 50,
    skill_level: params.skill_level,
    state: params.state,
    limit: params.limit,
  });
}

/**
 * Get user's current geolocation (browser API wrapper)
 */
export function getCurrentLocation(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position.coords);
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
    );
  });
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Used for client-side calculations when needed
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}
