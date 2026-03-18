/**
 * Ranking Service
 *
 * Handles all ranking-related API calls
 * Fetches player rankings with filtering and pagination
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import { get } from '@/lib/api';

export interface RankingUser {
  id: string;
  username: string;
  full_name: string;
  skill_level: string;
  state: string;
  profile_photo?: string;
  gender?: string;
  date_of_birth?: string;
  bio?: string;
  city?: string;
}

export interface RankingData {
  id: string;
  position: number;
  points: number;
  category: string;
  skill_level: string;
  tournaments_played: number;
  matches_played: number;
  win_percentage: number;
  user: RankingUser;
}

export interface RankingResponse {
  data: {
    rankings: RankingData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  success: boolean;
  message: string;
}

/**
 * Fetch rankings with optional filters
 */
export async function fetchRankings(params: {
  category?: string;
  skill_level?: string;
  state?: string;
  page?: number;
  limit?: number;
}): Promise<RankingResponse> {
  const queryParams = new URLSearchParams();

  if (params.category) queryParams.append('category', params.category);
  if (params.skill_level) queryParams.append('skill_level', params.skill_level);
  if (params.state) queryParams.append('state', params.state);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = `/api/v1/rankings${queryString ? `?${queryString}` : ''}`;

  return get<RankingResponse>(url);
}

/**
 * Fetch top players
 */
export async function fetchTopPlayers(params?: {
  limit?: number;
  state?: string;
  skill_level?: string;
}): Promise<RankingResponse> {
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.state) queryParams.append('state', params.state);
  if (params?.skill_level) queryParams.append('skill_level', params.skill_level);

  const queryString = queryParams.toString();
  const url = `/api/v1/rankings/top${queryString ? `?${queryString}` : ''}`;

  return get<RankingResponse>(url);
}

/**
 * Fetch rankings for a specific user (by userId)
 */
export async function fetchUserRankings(
  userId: string,
  params?: { category?: string; skill_level?: string },
): Promise<RankingResponse> {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);
  if (params?.skill_level) queryParams.append('skill_level', params.skill_level);
  const queryString = queryParams.toString();
  const url = `/api/v1/rankings/user/${userId}${queryString ? `?${queryString}` : ''}`;
  return get<RankingResponse>(url);
}

/**
 * Fetch state rankings
 */
export async function fetchStateRankings(
  state: string,
  params?: {
    page?: number;
    limit?: number;
  },
): Promise<RankingResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = `/api/v1/rankings/${state}${queryString ? `?${queryString}` : ''}`;

  return get<RankingResponse>(url);
}
