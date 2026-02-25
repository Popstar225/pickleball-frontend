/**
 * API Response Handler
 * 
 * This module provides utilities for handling API responses, errors,
 * and success states consistently throughout the application.
 * 
 * @author Pickleball Federation Team
 * @version 2.0.0
 */

// API Response Status
export enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  PARTIAL_SUCCESS = 'partial_success'
}

// API Response Interface
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  status: 'success' | 'error' | 'partial_success';
  errors?: string[];
  warnings?: string[];
  metadata?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// API Error Interface
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

// Error Types
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

// Error Category
export interface ErrorCategory {
  type: ErrorType;
  title: string;
  description: string;
  userMessage: string;
  retryable: boolean;
  actionRequired: boolean;
}

// Error Categories Mapping
export const ERROR_CATEGORIES: Record<ErrorType, ErrorCategory> = {
  [ErrorType.NETWORK]: {
    type: ErrorType.NETWORK,
    title: 'Network Error',
    description: 'Unable to connect to the server',
    userMessage: 'Please check your internet connection and try again',
    retryable: true,
    actionRequired: false
  },
  [ErrorType.AUTHENTICATION]: {
    type: ErrorType.AUTHENTICATION,
    title: 'Authentication Error',
    description: 'Your session has expired or is invalid',
    userMessage: 'Please log in again to continue',
    retryable: false,
    actionRequired: true
  },
  [ErrorType.AUTHORIZATION]: {
    type: ErrorType.AUTHORIZATION,
    title: 'Access Denied',
    description: 'You do not have permission to perform this action',
    userMessage: 'Contact your administrator if you believe this is an error',
    retryable: false,
    actionRequired: true
  },
  [ErrorType.VALIDATION]: {
    type: ErrorType.VALIDATION,
    title: 'Validation Error',
    description: 'The provided data is invalid or incomplete',
    userMessage: 'Please check your input and try again',
    retryable: true,
    actionRequired: false
  },
  [ErrorType.NOT_FOUND]: {
    type: ErrorType.NOT_FOUND,
    title: 'Not Found',
    description: 'The requested resource was not found',
    userMessage: 'The item you are looking for may have been moved or deleted',
    retryable: false,
    actionRequired: false
  },
  [ErrorType.SERVER_ERROR]: {
    type: ErrorType.SERVER_ERROR,
    title: 'Server Error',
    description: 'An unexpected error occurred on the server',
    userMessage: 'We are experiencing technical difficulties. Please try again later',
    retryable: true,
    actionRequired: false
  },
  [ErrorType.TIMEOUT]: {
    type: ErrorType.TIMEOUT,
    title: 'Request Timeout',
    description: 'The request took too long to complete',
    userMessage: 'The request is taking longer than expected. Please try again',
    retryable: true,
    actionRequired: false
  },
  [ErrorType.UNKNOWN]: {
    type: ErrorType.UNKNOWN,
    title: 'Unknown Error',
    description: 'An unexpected error occurred',
    userMessage: 'Something went wrong. Please try again or contact support',
    retryable: true,
    actionRequired: false
  }
};

// Parse API Error
export const parseApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      message: data?.message || `HTTP ${status} Error`,
      status,
      code: data?.code,
      details: data?.details,
      timestamp: new Date().toISOString(),
      requestId: data?.requestId
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'No response received from server',
      status: 0,
      code: 'NO_RESPONSE',
      details: error.request,
      timestamp: new Date().toISOString()
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      code: 'UNKNOWN',
      details: error,
      timestamp: new Date().toISOString()
    };
  }
};

// Categorize Error
export const categorizeError = (error: ApiError): ErrorCategory => {
  const { status } = error;
  
  if (status === 0) {
    return ERROR_CATEGORIES[ErrorType.NETWORK];
  } else if (status === 401) {
    return ERROR_CATEGORIES[ErrorType.AUTHENTICATION];
  } else if (status === 403) {
    return ERROR_CATEGORIES[ErrorType.AUTHORIZATION];
  } else if (status === 400) {
    return ERROR_CATEGORIES[ErrorType.VALIDATION];
  } else if (status === 404) {
    return ERROR_CATEGORIES[ErrorType.NOT_FOUND];
  } else if (status === 408 || status === 504) {
    return ERROR_CATEGORIES[ErrorType.TIMEOUT];
  } else if (status >= 500) {
    return ERROR_CATEGORIES[ErrorType.SERVER_ERROR];
  } else {
    return ERROR_CATEGORIES[ErrorType.UNKNOWN];
  }
};

// Handle API Response
export const handleApiResponse = <T>(
  response: any,
  defaultMessage: string = 'Operation completed successfully'
): ApiResponse<T> => {
  if (response?.data) {
    return {
      data: response.data,
      message: response.data.message || defaultMessage,
      status: response.data.status || 'success',
      errors: response.data.errors || [],
      warnings: response.data.warnings || [],
      metadata: response.data.metadata || {
        timestamp: new Date().toISOString()
      }
    };
  }
  
  return {
    data: response as T,
    message: defaultMessage,
    status: 'success',
    metadata: {
      timestamp: new Date().toISOString()
    }
  };
};

// Handle API Error
export const handleApiError = (error: any): { error: ApiError; category: ErrorCategory } => {
  const apiError = parseApiError(error);
  const category = categorizeError(apiError);
  
  return { error: apiError, category };
};

// Check if response is successful
export const isSuccessfulResponse = (response: any): boolean => {
  if (!response) return false;
  
  if (response.status === 'success') return true;
  if (response.status === 'partial_success') return true;
  
  // Check HTTP status codes
  if (response.status >= 200 && response.status < 300) return true;
  
  return false;
};

// Check if response has errors
export const hasErrors = (response: any): boolean => {
  if (!response) return false;
  
  if (response.errors && response.errors.length > 0) return true;
  if (response.status === 'error') return true;
  
  return false;
};

// Check if response has warnings
export const hasWarnings = (response: any): boolean => {
  if (!response) return false;
  
  return !!(response.warnings && response.warnings.length > 0);
};

// Extract error messages
export const extractErrorMessages = (response: any): string[] => {
  if (!response) return [];
  
  const messages: string[] = [];
  
  if (response.message && response.status === 'error') {
    messages.push(response.message);
  }
  
  if (response.errors && Array.isArray(response.errors)) {
    messages.push(...response.errors);
  }
  
  return messages;
};

// Extract warning messages
export const extractWarningMessages = (response: any): string[] => {
  if (!response?.warnings) return [];
  
  return Array.isArray(response.warnings) ? response.warnings : [];
};

// Create success response
export const createSuccessResponse = <T>(
  data: T,
  message: string = 'Operation completed successfully',
  metadata?: any
): ApiResponse<T> => ({
  data,
  message,
  status: 'success',
  metadata: {
    timestamp: new Date().toISOString(),
    ...metadata
  }
});

// Create error response
export const createErrorResponse = <T>(
  message: string,
  errors: string[] = [],
  status: number = 400,
  code?: string
): ApiResponse<T> => ({
  data: null as T,
  message,
  status: 'error',
  errors,
  metadata: {
    timestamp: new Date().toISOString()
  }
});

// Create partial success response
export const createPartialSuccessResponse = <T>(
  data: T,
  message: string = 'Operation completed with warnings',
  warnings: string[] = [],
  metadata?: any
): ApiResponse<T> => ({
  data,
  message,
  status: 'partial_success',
  warnings,
  metadata: {
    timestamp: new Date().toISOString(),
    ...metadata
  }
});

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  maxRetryDelay: number;
}

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  maxRetryDelay: 10000
};

// Calculate retry delay
export const calculateRetryDelay = (
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number => {
  const delay = config.retryDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxRetryDelay);
};

// Should retry request
export const shouldRetry = (
  error: ApiError,
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): boolean => {
  if (attempt >= config.maxRetries) return false;
  
  const category = categorizeError(error);
  return category.retryable;
};

// Format error for display
export const formatErrorForDisplay = (error: ApiError, category: ErrorCategory): string => {
  if (error.message && error.message !== category.userMessage) {
    return `${category.userMessage}: ${error.message}`;
  }
  
  return category.userMessage;
};

// Create user-friendly error message
export const createUserFriendlyMessage = (error: any): string => {
  const { error: apiError, category } = handleApiError(error);
  return formatErrorForDisplay(apiError, category);
};

// Response transformer for pagination
export const transformPaginatedResponse = <T>(
  response: any,
  dataKey: string = 'data'
): { data: T[]; pagination: any; total: number } => {
  const data = response[dataKey] || response.data || [];
  const pagination = response.metadata?.pagination || {};
  const total = pagination.total || data.length;
  
  return { data, pagination, total };
};

// Response transformer for list responses
export const transformListResponse = <T>(
  response: any,
  dataKey: string = 'data'
): T[] => {
  return response[dataKey] || response.data || [];
};

// Response transformer for single item responses
export const transformSingleResponse = <T>(
  response: any,
  dataKey: string = 'data'
): T | null => {
  const data = response[dataKey] || response.data;
  return data || null;
};

export default {
  ApiStatus,
  ErrorType,
  ERROR_CATEGORIES,
  parseApiError,
  categorizeError,
  handleApiResponse,
  handleApiError,
  isSuccessfulResponse,
  hasErrors,
  hasWarnings,
  extractErrorMessages,
  extractWarningMessages,
  createSuccessResponse,
  createErrorResponse,
  createPartialSuccessResponse,
  shouldRetry,
  calculateRetryDelay,
  createUserFriendlyMessage,
  transformPaginatedResponse,
  transformListResponse,
  transformSingleResponse
}; 