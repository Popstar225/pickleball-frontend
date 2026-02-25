/**
 * Date and Time Utilities
 * 
 * This module provides comprehensive utilities for date formatting,
 * parsing, validation, and manipulation throughout the application.
 * 
 * @author Pickleball Federation Team
 * @version 2.0.0
 */

// Date format constants
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  US: 'MM/DD/YYYY',
  EUROPEAN: 'DD/MM/YYYY',
  FULL: 'MMMM DD, YYYY',
  SHORT: 'MMM DD, YYYY',
  COMPACT: 'MM/DD/YY',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATETIME_FULL: 'MMMM DD, YYYY [at] h:mm A',
  RELATIVE: 'relative'
} as const;

// Time zone constants
export const TIME_ZONES = {
  UTC: 'UTC',
  EST: 'America/New_York',
  CST: 'America/Chicago',
  MST: 'America/Denver',
  PST: 'America/Los_Angeles',
  GMT: 'Europe/London',
  CET: 'Europe/Paris',
  JST: 'Asia/Tokyo',
  AEST: 'Australia/Sydney'
} as const;

// Date validation
export const isValidDate = (date: any): boolean => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

// Parse date string
export const parseDate = (dateString: string | Date): Date | null => {
  if (!dateString) return null;
  
  if (dateString instanceof Date) {
    return isValidDate(dateString) ? dateString : null;
  }
  
  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
};

// Format date
export const formatDate = (
  date: Date | string | null,
  format: string = DATE_FORMATS.US,
  timezone?: string
): string => {
  if (!date) return '';
  
  const dateObj = parseDate(date);
  if (!dateObj) return '';
  
  try {
    // Apply timezone if specified
    if (timezone && timezone !== TIME_ZONES.UTC) {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      
      return new Intl.DateTimeFormat('en-US', options).format(dateObj);
    }
    
    // Custom formatting
    switch (format) {
      case DATE_FORMATS.ISO:
        return dateObj.toISOString().split('T')[0];
        
      case DATE_FORMATS.US:
        return new Intl.DateTimeFormat('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        }).format(dateObj);
        
      case DATE_FORMATS.EUROPEAN:
        return new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(dateObj);
        
      case DATE_FORMATS.FULL:
        return new Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }).format(dateObj);
        
      case DATE_FORMATS.SHORT:
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(dateObj);
        
      case DATE_FORMATS.COMPACT:
        return new Intl.DateTimeFormat('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit'
        }).format(dateObj);
        
      case DATE_FORMATS.TIME:
        return new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(dateObj);
        
      case DATE_FORMATS.DATETIME:
        return `${formatDate(dateObj, DATE_FORMATS.ISO)} ${formatDate(dateObj, DATE_FORMATS.TIME)}`;
        
      case DATE_FORMATS.DATETIME_FULL:
        return new Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).format(dateObj);
        
      case DATE_FORMATS.RELATIVE:
        return getRelativeTimeString(dateObj);
        
      default:
        return dateObj.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateObj.toLocaleDateString();
  }
};

// Get relative time string (e.g., "2 hours ago", "3 days ago")
export const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  } else {
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
  }
};

// Get age from birth date
export const getAge = (birthDate: Date | string): number | null => {
  const birth = parseDate(birthDate);
  if (!birth) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Check if date is today
export const isToday = (date: Date | string): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) return false;
  
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

// Check if date is yesterday
export const isYesterday = (date: Date | string): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) return false;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return dateObj.toDateString() === yesterday.toDateString();
};

// Check if date is this week
export const isThisWeek = (date: Date | string): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) return false;
  
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return dateObj >= startOfWeek && dateObj <= endOfWeek;
};

// Check if date is this month
export const isThisMonth = (date: Date | string): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) return false;
  
  const today = new Date();
  return dateObj.getMonth() === today.getMonth() && 
         dateObj.getFullYear() === today.getFullYear();
};

// Check if date is this year
export const isThisYear = (date: Date | string): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) return false;
  
  const today = new Date();
  return dateObj.getFullYear() === today.getFullYear();
};

// Add days to date
export const addDays = (date: Date | string, days: number): Date | null => {
  const dateObj = parseDate(date);
  if (!dateObj) return null;
  
  const result = new Date(dateObj);
  result.setDate(result.getDate() + days);
  return result;
};

// Subtract days from date
export const subtractDays = (date: Date | string, days: number): Date | null => {
  return addDays(date, -days);
};

// Add months to date
export const addMonths = (date: Date | string, months: number): Date | null => {
  const dateObj = parseDate(date);
  if (!dateObj) return null;
  
  const result = new Date(dateObj);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Subtract months from date
export const subtractMonths = (date: Date | string, months: number): Date | null => {
  return addMonths(date, -months);
};

// Add years to date
export const addYears = (date: Date | string, years: number): Date | null => {
  const dateObj = parseDate(date);
  if (!dateObj) return null;
  
  const result = new Date(dateObj);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

// Subtract years from date
export const subtractYears = (date: Date | string, years: number): Date | null => {
  return addYears(date, -years);
};

// Get start of day
export const getStartOfDay = (date: Date | string): Date | null => {
  const dateObj = parseDate(date);
  if (!dateObj) return null;
  
  const result = new Date(dateObj);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Get end of day
export const getEndOfDay = (date: Date | string): Date | null => {
  const dateObj = parseDate(date);
  if (!dateObj) return null;
  
  const result = new Date(dateObj);
  result.setHours(23, 59, 59, 999);
  return result;
};

// Get start of week
export const getStartOfWeek = (date: Date | string): Date | null => {
  const dateObj = parseDate(date);
  if (!dateObj) return null;
  
  const result = new Date(dateObj);
  const day = result.getDay();
  const diff = result.getDate() - day;
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Get end of week
export const getEndOfWeek = (date: Date | string): Date | null => {
  const startOfWeek = getStartOfWeek(date);
  if (!startOfWeek) return null;
  
  const result = new Date(startOfWeek);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

// Get start of month
export const getStartOfMonth = (date: Date | string): Date | null => {
  const dateObj = parseDate(date);
  if (!dateObj) return null;
  
  const result = new Date(dateObj);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Get end of month
export const getEndOfMonth = (date: Date | string): Date | null => {
  const dateObj = parseDate(date);
  if (!dateObj) return null;
  
  const result = new Date(dateObj);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};

// Get days between two dates
export const getDaysBetween = (startDate: Date | string, endDate: Date | string): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!start || !end) return 0;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Check if date is between two dates
export const isDateBetween = (
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean => {
  const dateObj = parseDate(date);
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!dateObj || !start || !end) return false;
  
  return dateObj >= start && dateObj <= end;
};

// Get month name
export const getMonthName = (date: Date | string, format: 'long' | 'short' = 'long'): string => {
  const dateObj = parseDate(date);
  if (!dateObj) return '';
  
  return new Intl.DateTimeFormat('en-US', {
    month: format
  }).format(dateObj);
};

// Get day name
export const getDayName = (date: Date | string, format: 'long' | 'short' = 'long'): string => {
  const dateObj = parseDate(date);
  if (!dateObj) return '';
  
  return new Intl.DateTimeFormat('en-US', {
    weekday: format
  }).format(dateObj);
};

// Format time duration
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// Get timezone offset
export const getTimezoneOffset = (timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone): number => {
  try {
    const date = new Date();
    const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const local = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (local.getTime() - utc.getTime()) / (1000 * 60 * 60);
  } catch {
    return 0;
  }
};

// Convert date to timezone
export const convertToTimezone = (
  date: Date | string,
  timezone: string
): Date | null => {
  const dateObj = parseDate(date);
  if (!dateObj) return null;
  
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    
    const formatted = new Intl.DateTimeFormat('en-US', options).format(dateObj);
    return new Date(formatted);
  } catch {
    return dateObj;
  }
};

// Get current timestamp
export const getCurrentTimestamp = (): number => {
  return Date.now();
};

// Get current ISO string
export const getCurrentISOString = (): string => {
  return new Date().toISOString();
};

// Check if date is weekend
export const isWeekend = (date: Date | string): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) return false;
  
  const day = dateObj.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

// Check if date is weekday
export const isWeekday = (date: Date | string): boolean => {
  return !isWeekend(date);
};

// Get business days between two dates
export const getBusinessDaysBetween = (startDate: Date | string, endDate: Date | string): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!start || !end) return 0;
  
  let businessDays = 0;
  const current = new Date(start);
  
  while (current <= end) {
    if (isWeekday(current)) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
};

export default {
  DATE_FORMATS,
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
}; 