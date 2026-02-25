import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { baseURL } from './const';
import {
  DigitalCredential,
  CreateDigitalCredentialResponse,
  GetDigitalCredentialResponse,
  VerifyDigitalCredentialResponse,
  UpdateDigitalCredentialResponse,
  RegenerateQRCodeResponse,
  GetAllDigitalCredentialsResponse,
  GetCredentialStatsResponse,
  DeleteDigitalCredentialResponse,
} from '../types/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor: always set the latest token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;

    // Decode and log token payload for debugging using jwt-decode
    try {
      const decodedToken = jwtDecode<any>(token);
      console.log('[API Request] Token Payload:', decodedToken);
    } catch (error) {
      console.error('[API Request] Failed to decode token:', error);
    }
  } else {
    delete config.headers.Authorization;
    console.log('[API Request] No token found in localStorage');
  }

  // Automatically set Content-Type for FormData (file uploads)
  if (config.data instanceof FormData) {
    // Remove the hardcoded Content-Type to let axios set it automatically for FormData
    delete config.headers['Content-Type'];
  }

  return config;
});

/**
 * GET request
 */
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return apiClient
    .get<T>(url, config)
    .then((res: AxiosResponse<T>) => res.data)
    .catch((err) => {
      console.error(`GET ${url} failed`, err);
      throw err;
    });
}

/**
 * POST request
 */
export async function post<T, U = unknown>(
  url: string,
  data: U,
  config?: AxiosRequestConfig,
): Promise<T> {
  return apiClient
    .post<T>(url, data, config)
    .then((res: AxiosResponse<T>) => res.data)
    .catch((err) => {
      console.error(`POST ${url} failed`, err);
      throw err;
    });
}

/**
 * PUT request
 */
export async function put<T, U = unknown>(
  url: string,
  data: U,
  config?: AxiosRequestConfig,
): Promise<T> {
  return apiClient
    .put<T>(url, data, config)
    .then((res: AxiosResponse<T>) => res.data)
    .catch((err) => {
      console.error(`PUT ${url} failed`, err);
      throw err;
    });
}

/**
 * DELETE request
 */
export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return apiClient
    .delete<T>(url, config)
    .then((res: AxiosResponse<T>) => res.data)
    .catch((err) => {
      console.error(`DELETE ${url} failed`, err);
      throw err;
    });
}

// Digital Credential API functions
export const digitalCredentialApi = {
  // Create a new digital credential
  create: () => post<CreateDigitalCredentialResponse>('/digital-credentials', {}),

  // Get the authenticated user's digital credential
  getMyCredential: () => get<GetDigitalCredentialResponse>('/digital-credentials/my-credential'),

  // Get digital credential by ID (admin or owner)
  getById: (id: string) => get<GetDigitalCredentialResponse>(`/digital-credentials/${id}`),

  // Verify a digital credential by verification code (public)
  verify: (verificationCode: string) =>
    get<VerifyDigitalCredentialResponse>(`/digital-credentials/verify/${verificationCode}`),

  // Update a digital credential
  update: (id: string, data: Partial<DigitalCredential>) =>
    put<UpdateDigitalCredentialResponse>(`/digital-credentials/${id}`, data),

  // Regenerate QR code for a digital credential
  regenerateQR: (id: string) =>
    post<RegenerateQRCodeResponse>(`/digital-credentials/${id}/regenerate-qr`, {}),

  // Get all digital credentials (admin only)
  getAll: (params?: {
    page?: number;
    limit?: number;
    affiliation_status?: string;
    state_affiliation?: string;
    is_verified?: boolean;
    search?: string;
  }) => get<GetAllDigitalCredentialsResponse>('/digital-credentials', { params }),

  // Get credential statistics (admin only)
  getStats: () => get<GetCredentialStatsResponse>('/digital-credentials/stats'),

  // Delete digital credential (admin only)
  delete: (id: string) => del<DeleteDigitalCredentialResponse>(`/digital-credentials/${id}`),
};

export const api = {
  get,
  post,
  put,
  delete: del,
  digitalCredentials: digitalCredentialApi,
};
