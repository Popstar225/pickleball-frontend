/**
 * Payment Service
 * 
 * Handles all payment-related API calls and Stripe integration
 */

import axios from 'axios';

import { baseURL } from '@/lib/const';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface PaymentIntentRequest {
  amount: number;
  payment_type: string;
  currency?: string;
  tournament_id?: string;
  club_id?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntentResponse {
  success: boolean;
  data: {
    payment_id: string;
    client_secret: string;
    amount: number;
    currency: string;
  };
}

export interface ConfirmPaymentRequest {
  payment_intent_id: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_type: string;
  payment_method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  processed_at?: string;
  created_at: string;
  refund_amount?: number;
  refund_reason?: string;
  refunded_at?: string;
  description?: string;
  processing_fee?: number;
  failure_reason?: string;
  billing_address?: object;
  receipt_url?: string;
  invoice_number?: string;
  updated_at?: string;
}

export interface PaymentStats {
  total_revenue: number;
  total_payments: number;
  by_type: Record<string, { count: number; total: number }>;
  by_method: Record<string, { count: number; total: number }>;
  average_payment: number;
}

export interface ProfileStats {
  total_registrations: number;
  total_revenue: number;
  by_user_type: Record<string, { count: number; total_revenue: number }>;
}

class PaymentService {
  /**
   * Create a payment intent
   */
  static async createPaymentIntent(
    data: PaymentIntentRequest
  ): Promise<PaymentIntentResponse> {
    try {
      const response = await apiClient.post<PaymentIntentResponse>(
        '/stripe/payment-intent',
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirm a payment
   */
  static async confirmPayment(
    paymentId: string,
    data: ConfirmPaymentRequest
  ): Promise<{ success: boolean; data: { payment: Payment } }> {
    try {
      const response = await apiClient.post(
        `/payments/${paymentId}/confirm`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all payments (paginated)
   */
  static async getPayments(
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>
  ): Promise<{ success: boolean; data: Payment[]; pagination: any }> {
    try {
      const response = await apiClient.get('/payments', {
        params: { page, limit, ...filters },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment by ID
   */
  static async getPaymentById(
    paymentId: string
  ): Promise<{ success: boolean; data: { payment: Payment } }> {
    try {
      const response = await apiClient.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's payment history
   */
  static async getUserPaymentHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ success: boolean; data: Payment[]; pagination: any }> {
    try {
      const response = await apiClient.get(
        `/payments/user/${userId}`,
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment statistics (Admin only)
   */
  static async getPaymentStats(): Promise<{
    success: boolean;
    data: { stats: PaymentStats };
  }> {
    try {
      const response = await apiClient.get('/payments/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get profile registration statistics (SuperAdmin only)
   */
  static async getProfileStatistics(): Promise<{
    success: boolean;
    data: { stats: ProfileStats };
  }> {
    try {
      const response = await apiClient.get('/payments/admin/profile-statistics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refund a payment (Admin only)
   */
  static async refundPayment(
    paymentId: string,
    data: { refund_amount?: number; refund_reason?: string }
  ): Promise<{ success: boolean; data: { payment: Payment } }> {
    try {
      const response = await apiClient.post(
        `/payments/${paymentId}/refund`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a subscription
   */
  static async createSubscription(planId: string): Promise<{
    success: boolean;
    data: { subscription: any };
  }> {
    try {
      const response = await apiClient.post('/stripe/subscribe', {
        plan_id: planId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get saved payment methods
   */
  static async getPaymentMethods(): Promise<{
    success: boolean;
    data: { payment_methods: any[] };
  }> {
    try {
      const response = await apiClient.get('/stripe/payment-methods');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment history
   */
  static async getPaymentHistory(
    limit: number = 10,
    offset: number = 0
  ): Promise<{ success: boolean; data: any }> {
    try {
      const response = await apiClient.get('/stripe/history', {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user's membership status
   */
  static async getMembershipStatus(): Promise<{
    success: boolean;
    data: {
      membership_status: string;
      membership_tier: string | null;
      membership_expires_at: string | null;
      membership_activated_at: string | null;
      user_type: string;
      requires_annual_fee: boolean;
      annual_fee: number;
      has_premium_plan_option: boolean;
      premium_plan_fee: number | null;
      is_expired: boolean;
    };
  }> {
    try {
      const response = await apiClient.get('/payments/membership/status');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create payment intent for annual membership (player, coach, club, state)
   */
  static async createAnnualMembershipPayment(): Promise<{
    success: boolean;
    data: {
      payment_id: string;
      client_secret: string;
      amount: number;
      currency: string;
      user_type: string;
    };
  }> {
    try {
      const response = await apiClient.post('/payments/membership/annual');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirm annual membership payment
   */
  static async confirmAnnualMembership(
    paymentId: string,
    paymentIntentId: string
  ): Promise<{ success: boolean; data: { membership_status: string; expires_at: string } }> {
    try {
      const response = await apiClient.post(`/payments/membership/annual/${paymentId}/confirm`, {
        payment_intent_id: paymentIntentId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create payment intent for Premium Plan (club, partner)
   */
  static async createPremiumPlanPayment(): Promise<{
    success: boolean;
    data: {
      payment_id: string;
      client_secret: string;
      amount: number;
      currency: string;
      user_type: string;
      features: string[];
    };
  }> {
    try {
      const response = await apiClient.post('/payments/membership/premium-plan');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirm Premium Plan payment
   */
  static async confirmPremiumPlan(
    paymentId: string,
    paymentIntentId: string
  ): Promise<{ success: boolean; data: { membership_status: string; expires_at: string; features: string[] } }> {
    try {
      const response = await apiClient.post(`/payments/membership/premium-plan/${paymentId}/confirm`, {
        payment_intent_id: paymentIntentId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create payment for player features (nearby search)
   */
  static async createPlayerFeaturePayment(featureType: string): Promise<{
    success: boolean;
    data: {
      payment_id: string;
      client_secret: string;
      amount: number;
      currency: string;
      feature_type: string;
    };
  }> {
    try {
      const response = await apiClient.post('/payments/features/player', { feature_type: featureType });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirm payment for player feature (nearby search)
   */
  static async confirmPlayerFeaturePayment(
    paymentId: string,
    paymentIntentId: string,
  ): Promise<{ success: boolean; data: { feature_type: string } }> {
    try {
      const response = await apiClient.post(`/payments/features/player/${paymentId}/confirm`, {
        payment_intent_id: paymentIntentId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create payment intent for digital credential (player/coach)
   */
  static async createDigitalCredentialPayment(planType: 'basic' | 'membership' | 'premium'): Promise<{
    success: boolean;
    data: { payment_id: string; client_secret: string; amount: number; currency: string; plan_type: string };
  }> {
    try {
      const response = await apiClient.post('/payments/digital-credential', { plan_type: planType });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirm digital credential payment and issue the credential
   */
  static async confirmDigitalCredentialPayment(
    paymentId: string,
    paymentIntentId: string,
  ): Promise<{ success: boolean; data: { payment: Payment; credential: any } }> {
    try {
      const response = await apiClient.post(`/payments/digital-credential/${paymentId}/confirm`, {
        payment_intent_id: paymentIntentId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create payment intent for court rental
   */
  static async createCourtRentalPayment(data: {
    amount: number;         // in cents
    court_id: string;
    club_id?: string;
    start_time: string;     // ISO string
    end_time: string;       // ISO string
    duration_hours: number;
    description?: string;
  }): Promise<PaymentIntentResponse> {
    try {
      const response = await apiClient.post<PaymentIntentResponse>(
        '/stripe/payment-intent',
        {
          amount: data.amount,
          payment_type: 'court_rental',
          currency: 'mxn',
          club_id: data.club_id,
          description: data.description || 'Renta de cancha',
          metadata: {
            court_id: data.court_id,
            start_time: data.start_time,
            end_time: data.end_time,
            duration_hours: data.duration_hours,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create payment for coach license
   */
  static async createCoachLicensePayment(
    licenseType: string,
    amount: number
  ): Promise<{
    success: boolean;
    data: {
      payment_id: string;
      client_secret: string;
      amount: number;
      currency: string;
      license_type: string;
    };
  }> {
    try {
      const response = await apiClient.post('/payments/features/coach-license', {
        license_type: licenseType,
        amount,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      return new Error(message);
    }
    return error as Error;
  }
}

export default PaymentService;
