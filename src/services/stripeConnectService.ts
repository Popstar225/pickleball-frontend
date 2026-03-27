/**
 * Stripe Connect Service (frontend)
 *
 * API calls for managing Stripe Connect payout accounts (admin / club).
 */

import axios from 'axios';
import { baseURL } from '@/lib/const';

const api = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface ConnectAccountStatus {
  connected: boolean;
  account_id?: string;
  onboarded: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  business_profile?: { name?: string; url?: string } | null;
  requirements?: { currently_due?: string[]; errors?: any[] } | null;
}

class StripeConnectService {
  /** Create a Stripe Express account for the authenticated user */
  static async createAccount(): Promise<{ success: boolean; data: { account_id: string } }> {
    const r = await api.post('/stripe/connect/account');
    return r.data;
  }

  /** Get a one-time onboarding URL — redirect the user to this URL */
  static async getOnboardingLink(): Promise<{ success: boolean; data: { url: string } }> {
    const r = await api.post('/stripe/connect/onboarding-link');
    return r.data;
  }

  /** Fetch live account status from Stripe (also syncs DB) */
  static async getAccountStatus(): Promise<{ success: boolean; data: ConnectAccountStatus }> {
    const r = await api.get('/stripe/connect/status');
    return r.data;
  }

  /** Get a Stripe Express dashboard URL for the account holder */
  static async getDashboardLink(): Promise<{ success: boolean; data: { url: string } }> {
    const r = await api.get('/stripe/connect/dashboard-link');
    return r.data;
  }
}

export default StripeConnectService;
