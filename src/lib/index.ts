/**
 * Utility Library Index
 * 
 * This module provides a centralized export of all utility functions,
 * constants, and helper modules for the Pickleball Federation platform.
 * 
 * @author Pickleball Federation Team
 * @version 2.0.0
 */

// Core utilities
export * from './commonUtils';
export * from './validation';
export * from './apiResponseHandler';
export * from './dateUtils';
export * from './fileUtils';

// Re-export commonly used utilities for convenience
export {
  // Common utilities
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
  
  // Utility functions
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
} from './commonUtils';

export {
  // Validation utilities
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateURL,
  validateDate,
  validateNumber,
  validateString,
  validateForm,
  isFormValid,
  getAllFormErrors,
  getAllFormWarnings
} from './validation';

export {
  // API response handling
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
} from './apiResponseHandler';

export {
  // Date and time utilities
  DATE_FORMATS as DATE_FORMAT_CONSTANTS,
  TIME_ZONES,
  isValidDate,
  parseDate,
  formatDate,
  getRelativeTimeString,
  getAge,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  addDays,
  subtractDays,
  addMonths,
  subtractMonths,
  addYears,
  subtractYears,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getDaysBetween,
  isDateBetween,
  getMonthName,
  getDayName,
  formatDuration,
  getTimezoneOffset,
  convertToTimezone,
  getCurrentTimestamp,
  getCurrentISOString,
  isWeekend,
  isWeekday,
  getBusinessDaysBetween
} from './dateUtils';

export {
  // File and QR code utilities
  FILE_TYPES,
  FILE_SIZES,
  MAX_FILE_SIZES,
  FILE_EXTENSIONS,
  validateFile,
  validateFiles,
  getFileExtension,
  getFileNameWithoutExtension,
  formatFileSize,
  parseFileSize,
  isImageFile,
  isDocumentFile,
  isPdfFile,
  isTextFile,
  createFileURL,
  revokeFileURL,
  readFileAsText,
  readFileAsDataURL,
  readFileAsArrayBuffer,
  downloadFile,
  generateQRCodeDataURL,
  generateQRCodeBlob,
  downloadQRCode,
  validateQRCodeData,
  getFileTypeFromMIME,
  getFileIcon,
  sanitizeFilename,
  generateUniqueFilename
} from './fileUtils';

// Note: This module uses ES module syntax with named exports
// For better tree-shaking and performance, use named imports:
// import { generateId, debounce, formatDate } from '@/lib';
// 
// Avoid using default imports as they can cause bundling issues
// and don't support tree-shaking effectively.
// 
// Example usage:
// import { APP_CONSTANTS, USER_TYPES, generateId } from '@/lib';
// import { validateEmail, formatDate } from '@/lib'; 