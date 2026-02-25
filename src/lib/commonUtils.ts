/**
 * Common Utilities and Constants
 * 
 * This module provides comprehensive utilities for common operations,
 * constants, and helper functions used throughout the application.
 * 
 * @author Pickleball Federation Team
 * @version 2.0.0
 */

// Application constants
export const APP_CONSTANTS = {
  NAME: 'Pickleball Sports Federation',
  VERSION: '2.0.0',
  DESCRIPTION: 'Official platform for Pickleball Sports Federation',
  WEBSITE: 'https://pickleballfederation.org',
  SUPPORT_EMAIL: 'support@pickleballfederation.org',
  CONTACT_PHONE: '+1-800-PICKLEBALL',
  COPYRIGHT: '© 2024 Pickleball Sports Federation. All rights reserved.'
} as const;

// User types and roles
export const USER_TYPES = {
  PLAYER: 'player',
  COACH: 'coach',
  CLUB: 'club',
  PARTNER: 'partner',
  STATE_ASSOCIATION: 'state_association',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const;

// User type labels for display
export const USER_TYPE_LABELS: Record<string, string> = {
  [USER_TYPES.PLAYER]: 'Player',
  [USER_TYPES.COACH]: 'Coach',
  [USER_TYPES.CLUB]: 'Club',
  [USER_TYPES.PARTNER]: 'Partner',
  [USER_TYPES.STATE_ASSOCIATION]: 'State Association',
  [USER_TYPES.ADMIN]: 'Administrator',
  [USER_TYPES.SUPER_ADMIN]: 'Super Administrator'
};

// Affiliation statuses
export const AFFILIATION_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
} as const;

// Affiliation status labels
export const AFFILIATION_STATUS_LABELS: Record<string, string> = {
  [AFFILIATION_STATUSES.ACTIVE]: 'Active',
  [AFFILIATION_STATUSES.INACTIVE]: 'Inactive',
  [AFFILIATION_STATUSES.PENDING]: 'Pending',
  [AFFILIATION_STATUSES.SUSPENDED]: 'Suspended',
  [AFFILIATION_STATUSES.EXPIRED]: 'Expired',
  [AFFILIATION_STATUSES.CANCELLED]: 'Cancelled'
};

// Verification statuses
export const VERIFICATION_STATUSES = {
  VERIFIED: 'verified',
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  FAILED: 'failed'
} as const;

// Verification status labels
export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  [VERIFICATION_STATUSES.VERIFIED]: 'Verified',
  [VERIFICATION_STATUSES.UNVERIFIED]: 'Unverified',
  [VERIFICATION_STATUSES.PENDING]: 'Pending Verification',
  [VERIFICATION_STATUSES.FAILED]: 'Verification Failed'
};

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MIN_LIMIT: 5,
  MAX_LIMIT: 100,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
} as const;

// Sort directions
export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
} as const;

// Sort direction labels
export const SORT_DIRECTION_LABELS: Record<string, string> = {
  [SORT_DIRECTIONS.ASC]: 'Ascending',
  [SORT_DIRECTIONS.DESC]: 'Descending'
};

// Common statuses
export const STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const;

// Status labels
export const STATUS_LABELS: Record<string, string> = {
  [STATUSES.ACTIVE]: 'Active',
  [STATUSES.INACTIVE]: 'Inactive',
  [STATUSES.PENDING]: 'Pending',
  [STATUSES.COMPLETED]: 'Completed',
  [STATUSES.CANCELLED]: 'Cancelled',
  [STATUSES.DRAFT]: 'Draft',
  [STATUSES.PUBLISHED]: 'Published',
  [STATUSES.ARCHIVED]: 'Archived'
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

// HTTP status messages
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  [HTTP_STATUS.OK]: 'OK',
  [HTTP_STATUS.CREATED]: 'Created',
  [HTTP_STATUS.ACCEPTED]: 'Accepted',
  [HTTP_STATUS.NO_CONTENT]: 'No Content',
  [HTTP_STATUS.BAD_REQUEST]: 'Bad Request',
  [HTTP_STATUS.UNAUTHORIZED]: 'Unauthorized',
  [HTTP_STATUS.FORBIDDEN]: 'Forbidden',
  [HTTP_STATUS.NOT_FOUND]: 'Not Found',
  [HTTP_STATUS.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
  [HTTP_STATUS.CONFLICT]: 'Conflict',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HTTP_STATUS.BAD_GATEWAY]: 'Bad Gateway',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service Unavailable',
  [HTTP_STATUS.GATEWAY_TIMEOUT]: 'Gateway Timeout'
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  RECENT_SEARCHES: 'recent_searches',
  NOTIFICATION_SETTINGS: 'notification_settings'
} as const;

// Session storage keys
export const SESSION_KEYS = {
  CURRENT_PAGE: 'current_page',
  FORM_DATA: 'form_data',
  TEMP_UPLOADS: 'temp_uploads',
  WIZARD_STATE: 'wizard_state'
} as const;

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;

// Language constants
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  JA: 'ja',
  KO: 'ko',
  ZH: 'zh'
} as const;

// Language labels
export const LANGUAGE_LABELS: Record<string, string> = {
  [LANGUAGES.EN]: 'English',
  [LANGUAGES.ES]: 'Español',
  [LANGUAGES.FR]: 'Français',
  [LANGUAGES.DE]: 'Deutsch',
  [LANGUAGES.IT]: 'Italiano',
  [LANGUAGES.PT]: 'Português',
  [LANGUAGES.JA]: '日本語',
  [LANGUAGES.KO]: '한국어',
  [LANGUAGES.ZH]: '中文'
};

// Currency constants
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  CAD: 'CAD',
  AUD: 'AUD',
  JPY: 'JPY',
  CHF: 'CHF',
  CNY: 'CNY'
} as const;

// Currency symbols
export const CURRENCY_SYMBOLS: Record<string, string> = {
  [CURRENCIES.USD]: '$',
  [CURRENCIES.EUR]: '€',
  [CURRENCIES.GBP]: '£',
  [CURRENCIES.CAD]: 'C$',
  [CURRENCIES.AUD]: 'A$',
  [CURRENCIES.JPY]: '¥',
  [CURRENCIES.CHF]: 'CHF',
  [CURRENCIES.CNY]: '¥'
};

// Time constants
export const TIME = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH: 30,
  DAYS_PER_YEAR: 365
} as const;

// Date formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  US: 'MM/DD/YYYY',
  EUROPEAN: 'DD/MM/YYYY',
  FULL: 'MMMM DD, YYYY',
  SHORT: 'MMM DD, YYYY',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss'
} as const;

// Phone number formats
export const PHONE_FORMATS = {
  US: '+1 (###) ###-####',
  INTERNATIONAL: '+## (###) ###-####',
  SIMPLE: '###-###-####'
} as const;

// Social media platforms
export const SOCIAL_PLATFORMS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok'
} as const;

// Social media platform labels
export const SOCIAL_PLATFORM_LABELS: Record<string, string> = {
  [SOCIAL_PLATFORMS.FACEBOOK]: 'Facebook',
  [SOCIAL_PLATFORMS.TWITTER]: 'Twitter',
  [SOCIAL_PLATFORMS.INSTAGRAM]: 'Instagram',
  [SOCIAL_PLATFORMS.LINKEDIN]: 'LinkedIn',
  [SOCIAL_PLATFORMS.YOUTUBE]: 'YouTube',
  [SOCIAL_PLATFORMS.TIKTOK]: 'TikTok'
};

// Utility functions

// Generate unique ID
export const generateId = (prefix: string = 'id'): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
};

// Generate random string
export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate random number
export const generateRandomNumber = (min: number = 0, max: number = 100): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj as T;
  }
  return obj;
};

// Merge objects deeply
export const deepMerge = <T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T => {
  if (!sources.length) return target;
  
  const source = sources.shift();
  if (source === undefined) return target;
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
};

// Check if value is object
export const isObject = (item: unknown): item is Record<string, unknown> => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

// Check if value is empty
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Check if value is not empty
export const isNotEmpty = (value: unknown): boolean => {
  return !isEmpty(value);
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Capitalize each word
export const capitalizeWords = (str: string): string => {
  if (!str) return str;
  return str.split(' ').map(capitalize).join(' ');
};

// Convert to camel case
export const toCamelCase = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, c => c.toLowerCase());
};

// Convert to kebab case
export const toKebabCase = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

// Convert to snake case
export const toSnakeCase = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

// Convert to title case
export const toTitleCase = (str: string): string => {
  if (!str) return str;
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

// Truncate string
export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// Format currency
export const formatCurrency = (
  amount: number,
  currency: string = CURRENCIES.USD,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// Sleep function
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry function
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) break;
      await sleep(delay * attempt);
    }
  }
  
  throw lastError!;
};

// Memoize function
export const memoize = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, unknown>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Group array by key
export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// Sort array by key
export const sortBy = <T, K extends keyof T>(
  array: T[],
  key: K,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Remove duplicates from array
export const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return Array.from(new Set(array));
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// Chunk array into smaller arrays
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Flatten nested arrays
export const flatten = <T>(array: T[]): T[] => {
  return array.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item);
  }, [] as T[]);
};

// Get nested object value
export const getNestedValue = (obj: Record<string, unknown>, path: string, defaultValue?: unknown): unknown => {
  const keys = path.split('.');
  let result: unknown = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return defaultValue;
    }
  }
  
  return result;
};

// Set nested object value
export const setNestedValue = (obj: Record<string, unknown>, path: string, value: unknown): void => {
  const keys = path.split('.');
  let current: Record<string, unknown> = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  
  current[keys[keys.length - 1]] = value;
};

// Pick properties from object
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// Omit properties from object
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

// Check if two objects are equal
export const isEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    const keysA = Object.keys(a as Record<string, unknown>);
    const keysB = Object.keys(b as Record<string, unknown>);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false;
    }
    
    return true;
  }
  
  return false;
};

export default {
  APP_CONSTANTS,
  USER_TYPES,
  USER_TYPE_LABELS,
  AFFILIATION_STATUSES,
  AFFILIATION_STATUS_LABELS,
  VERIFICATION_STATUSES,
  VERIFICATION_STATUS_LABELS,
  PAGINATION,
  SORT_DIRECTIONS,
  SORT_DIRECTION_LABELS,
  STATUSES,
  STATUS_LABELS,
  HTTP_STATUS,
  HTTP_STATUS_MESSAGES,
  STORAGE_KEYS,
  SESSION_KEYS,
  THEMES,
  LANGUAGES,
  LANGUAGE_LABELS,
  CURRENCIES,
  CURRENCY_SYMBOLS,
  TIME,
  DATE_FORMATS,
  PHONE_FORMATS,
  SOCIAL_PLATFORMS,
  SOCIAL_PLATFORM_LABELS,
  generateId,
  generateRandomString,
  generateRandomNumber,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  isObject,
  isEmpty,
  isNotEmpty,
  capitalize,
  capitalizeWords,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  toTitleCase,
  truncate,
  formatNumber,
  formatCurrency,
  formatPercentage,
  sleep,
  retry,
  memoize,
  groupBy,
  sortBy,
  removeDuplicates,
  chunk,
  flatten,
  getNestedValue,
  setNestedValue,
  pick,
  omit,
  isEqual
}; 