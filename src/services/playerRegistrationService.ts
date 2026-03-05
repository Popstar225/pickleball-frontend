/**
 * Player Registration Service
 *
 * Handles all registration-related API calls and validation
 * Works in conjunction with backend eligibility services
 *
 * @author Pickleball Federation Team
 * @version 1.0.0
 */

import { api } from '@/lib/api';
import type { TournamentEvent } from '@/types/api';

export interface PlayerProfile {
  id: string;
  full_name: string;
  email: string;
  skill_level: string;
  gender: 'M' | 'F' | 'Mixed';
  is_active: boolean;
  membership_status: 'active' | 'expired' | 'pending';
  current_rating?: number;
}

export interface EligibilityCheckResult {
  eligible: boolean;
  reasons: string[];
  warnings: string[];
  playerInfo: PlayerProfile | null;
  eventInfo: {
    id: string;
    skill_block: string;
    gender: string;
    modality: string;
    max_participants: number;
    current_participants: number;
    registration_deadline: string;
  } | null;
  penalties: Array<{
    id: string;
    penalty_type: 'warning' | 'suspension' | 'disqualification';
    reason: string;
    expires_date?: string;
  }>;
}

export interface RegistrationData {
  user_id: string;
  partner_user_id?: string;
  ranking_points?: number;
  skill_block: string;
  gender: string;
  modality: string;
  entry_fee: number;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  registration: {
    id: string;
    userId: string;
    eventId: string;
    status: 'confirmed' | 'waitlist' | 'pending';
    position?: number; // In waiting list
  };
}

export interface WaitlistPosition {
  position: number;
  total_waitlist: number;
  spots_available: number;
  estimated_time?: string;
}

class PlayerRegistrationService {
  /**
   * Check player eligibility for a tournament event
   * Validates: membership, penalties, skill level, gender, capacity
   */
  static async checkEligibility(
    tournamentId: string,
    eventId: string,
    userId: string,
    partnerId?: string,
  ): Promise<EligibilityCheckResult> {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        ...(partnerId && { partner_id: partnerId }),
      });

      const response = await api.get<EligibilityCheckResult>(
        `/tournaments/${tournamentId}/events/${eventId}/check-eligibility?${params}`,
      );

      return response as EligibilityCheckResult;
    } catch (error) {
      console.error('Eligibility check failed:', error);
      throw error;
    }
  }

  /**
   * Register player for tournament event
   * Creates registration, handles capacity/waitlist
   */
  static async registerForEvent(
    tournamentId: string,
    eventId: string,
    registrationData: RegistrationData,
  ): Promise<RegistrationResponse> {
    try {
      const response = await api.post<RegistrationResponse>(
        `/tournaments/${tournamentId}/events/${eventId}/register`,
        registrationData,
      );

      return response as RegistrationResponse;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Get player's current registrations
   */
  static async getPlayerRegistrations(userId: string) {
    try {
      const response = await api.get(`/players/${userId}/registrations`);
      return response;
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      throw error;
    }
  }

  /**
   * Get waitlist for an event
   */
  static async getEventWaitlist(tournamentId: string, eventId: string) {
    try {
      const response = await api.get(`/tournaments/${tournamentId}/events/${eventId}/waitlist`);
      return response;
    } catch (error) {
      console.error('Failed to fetch waitlist:', error);
      throw error;
    }
  }

  /**
   * Get player's position in waitlist
   */
  static async getWaitlistPosition(
    tournamentId: string,
    eventId: string,
    userId: string,
  ): Promise<WaitlistPosition> {
    try {
      const response = await api.get<WaitlistPosition>(
        `/tournaments/${tournamentId}/events/${eventId}/waitlist/${userId}`,
      );
      return response as WaitlistPosition;
    } catch (error) {
      console.error('Failed to get waitlist position:', error);
      throw error;
    }
  }

  /**
   * Cancel registration
   */
  static async cancelRegistration(registrationId: string) {
    try {
      const response = await api.delete(`/tournaments/registrations/${registrationId}`);
      return response;
    } catch (error) {
      console.error('Failed to cancel registration:', error);
      throw error;
    }
  }

  /**
   * Get available partners for doubles event
   */
  static async findAvailablePartners(tournamentId: string, eventId: string, userId: string) {
    try {
      const response = await api.get(
        `/tournaments/${tournamentId}/events/${eventId}/available-partners`,
        {
          params: { user_id: userId },
        },
      );
      return response;
    } catch (error) {
      console.error('Failed to find available partners:', error);
      throw error;
    }
  }

  /**
   * Validate skill level compatibility with event
   */
  static validateSkillLevel(playerSkillLevel: string, eventSkillBlock: string): boolean {
    const skillMap: Record<string, string> = {
      '2.5': '2.5',
      '3.5': '3.5',
      '4.5': '4.5',
      '5+': '5+',
    };

    const playerBlock = skillMap[playerSkillLevel] || playerSkillLevel;
    return playerBlock === eventSkillBlock;
  }

  /**
   * Validate gender compatibility with event
   */
  static validateGender(playerGender: string, eventGender: string): boolean {
    const normalized = playerGender.toUpperCase();
    if (eventGender === 'Mixed') return true;
    if (normalized === 'M' && eventGender === 'M') return true;
    if (normalized === 'F' && eventGender === 'F') return true;
    return false;
  }

  /**
   * Validate modality support (Singles/Doubles/Mixed)
   */
  static validateModality(modality: string, playerGender: string, partnerGender?: string): boolean {
    if (modality === 'Singles') return true;

    if (modality === 'Doubles') {
      // Both same gender
      return playerGender === partnerGender;
    }

    if (modality === 'Mixed') {
      // One M, one F
      const genders = [playerGender, partnerGender].map((g) => g.toUpperCase());
      return (genders.includes('M') && genders.includes('F')) || genders.includes('MIXED');
    }

    return false;
  }
}

export default PlayerRegistrationService;
