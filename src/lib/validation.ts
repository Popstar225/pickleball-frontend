/**
 * Validation Utilities
 * 
 * This module provides comprehensive validation functions for form inputs,
 * data validation, and user input sanitization throughout the application.
 * 
 * @author Pickleball Federation Team
 * @version 2.0.0
 */

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors, warnings };
  }

  if (typeof email !== 'string') {
    errors.push('Email must be a string');
    return { isValid: false, errors, warnings };
  }

  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    errors.push('Email cannot be empty');
    return { isValid: false, errors, warnings };
  }

  if (trimmedEmail.length > 254) {
    errors.push('Email is too long (maximum 254 characters)');
    return { isValid: false, errors, warnings };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    errors.push('Please enter a valid email address');
    return { isValid: false, errors, warnings };
  }

  // Check for common disposable email domains
  const disposableDomains = [
    'tempmail.org', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'sharklasers.com'
  ];
  
  const domain = trimmedEmail.split('@')[1];
  if (disposableDomains.includes(domain)) {
    warnings.push('Disposable email addresses are not recommended');
  }

  return { isValid: true, errors, warnings };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors, warnings };
  }

  if (typeof password !== 'string') {
    errors.push('Password must be a string');
    return { isValid: false, errors, warnings };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password is too long (maximum 128 characters)');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    warnings.push('Password should contain at least one special character');
  }

  // Check for common weak passwords
  const weakPasswords = [
    'password', '123456', 'qwerty', 'admin', 'letmein',
    'welcome', 'monkey', 'dragon', 'master', 'football'
  ];
  
  if (weakPasswords.includes(password.toLowerCase())) {
    warnings.push('This password is commonly used and may be insecure');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Name validation
export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors, warnings };
  }

  if (typeof name !== 'string') {
    errors.push(`${fieldName} must be a string`);
    return { isValid: false, errors, warnings };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length === 0) {
    errors.push(`${fieldName} cannot be empty`);
    return { isValid: false, errors, warnings };
  }

  if (trimmedName.length < 2) {
    errors.push(`${fieldName} must be at least 2 characters long`);
  }

  if (trimmedName.length > 100) {
    errors.push(`${fieldName} is too long (maximum 100 characters)`);
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    errors.push(`${fieldName} contains invalid characters`);
  }

  // Check for excessive spaces or special characters
  if (/\s{2,}/.test(trimmedName)) {
    warnings.push(`${fieldName} contains multiple consecutive spaces`);
  }

  if (trimmedName.startsWith(' ') || trimmedName.endsWith(' ')) {
    warnings.push(`${fieldName} contains leading or trailing spaces`);
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Phone number validation
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!phone) {
    errors.push('Phone number is required');
    return { isValid: false, errors, warnings };
  }

  if (typeof phone !== 'string') {
    errors.push('Phone number must be a string');
    return { isValid: false, errors, warnings };
  }

  const cleanedPhone = phone.replace(/\D/g, '');
  
  if (cleanedPhone.length < 10) {
    errors.push('Phone number must be at least 10 digits');
  }

  if (cleanedPhone.length > 15) {
    errors.push('Phone number is too long (maximum 15 digits)');
  }

  // Check for valid phone number patterns
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(cleanedPhone)) {
    errors.push('Please enter a valid phone number');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// URL validation
export const validateURL = (url: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!url) {
    errors.push('URL is required');
    return { isValid: false, errors, warnings };
  }

  if (typeof url !== 'string') {
    errors.push('URL must be a string');
    return { isValid: false, errors, warnings };
  }

  try {
    const urlObj = new URL(url);
    
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      errors.push('URL must use HTTP or HTTPS protocol');
    }
    
    if (!urlObj.hostname) {
      errors.push('URL must have a valid hostname');
    }
    
    if (urlObj.hostname.length > 253) {
      errors.push('URL hostname is too long');
    }
    
  } catch {
    errors.push('Please enter a valid URL');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Date validation
export const validateDate = (date: string | Date, fieldName: string = 'Date'): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!date) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors, warnings };
  }

  let dateObj: Date;
  
  try {
    dateObj = new Date(date);
  } catch {
    errors.push(`${fieldName} is not a valid date`);
    return { isValid: false, errors, warnings };
  }

  if (isNaN(dateObj.getTime())) {
    errors.push(`${fieldName} is not a valid date`);
    return { isValid: false, errors, warnings };
  }

  const now = new Date();
  
  // Check if date is in the future (for birth dates, etc.)
  if (dateObj > now) {
    warnings.push(`${fieldName} is in the future`);
  }

  // Check if date is too far in the past (for birth dates)
  const minDate = new Date(1900, 0, 1);
  if (dateObj < minDate) {
    warnings.push(`${fieldName} seems to be too far in the past`);
  }

  return { isValid: true, errors, warnings };
};

// Number validation
export const validateNumber = (
  value: number | string, 
  options: {
    min?: number;
    max?: number;
    required?: boolean;
    fieldName?: string;
  } = {}
): ValidationResult => {
  const { min, max, required = true, fieldName = 'Number' } = options;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (required && (value === null || value === undefined || value === '')) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors, warnings };
  }

  if (!required && (value === null || value === undefined || value === '')) {
    return { isValid: true, errors, warnings };
  }

  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    errors.push(`${fieldName} must be a valid number`);
    return { isValid: false, errors, warnings };
  }

  if (min !== undefined && numValue < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  }

  if (max !== undefined && numValue > max) {
    errors.push(`${fieldName} must be no more than ${max}`);
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Generic string validation
export const validateString = (
  value: string,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    fieldName?: string;
    pattern?: RegExp;
    patternMessage?: string;
  } = {}
): ValidationResult => {
  const { 
    minLength, 
    maxLength, 
    required = true, 
    fieldName = 'Field',
    pattern,
    patternMessage
  } = options;
  
  const errors: string[] = [];
  const warnings: string[] = [];

  if (required && !value) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors, warnings };
  }

  if (!required && !value) {
    return { isValid: true, errors, warnings };
  }

  if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`);
    return { isValid: false, errors, warnings };
  }

  const trimmedValue = value.trim();
  
  if (required && trimmedValue.length === 0) {
    errors.push(`${fieldName} cannot be empty`);
    return { isValid: false, errors, warnings };
  }

  if (minLength !== undefined && trimmedValue.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters long`);
  }

  if (maxLength !== undefined && trimmedValue.length > maxLength) {
    errors.push(`${fieldName} is too long (maximum ${maxLength} characters)`);
  }

  if (pattern && !pattern.test(trimmedValue)) {
    errors.push(patternMessage || `${fieldName} format is invalid`);
  }

  return { isValid: errors.length === 0, errors, warnings };
};

// Form validation helper
export const validateForm = (data: Record<string, any>, validations: Record<string, any>): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};

  for (const [field, validation] of Object.entries(validations)) {
    const value = data[field];
    
    switch (validation.type) {
      case 'email':
        results[field] = validateEmail(value);
        break;
      case 'password':
        results[field] = validatePassword(value);
        break;
      case 'name':
        results[field] = validateName(value, validation.fieldName);
        break;
      case 'phone':
        results[field] = validatePhone(value);
        break;
      case 'url':
        results[field] = validateURL(value);
        break;
      case 'date':
        results[field] = validateDate(value, validation.fieldName);
        break;
      case 'number':
        results[field] = validateNumber(value, validation);
        break;
      case 'string':
        results[field] = validateString(value, validation);
        break;
      default:
        results[field] = { isValid: true, errors: [], warnings: [] };
    }
  }

  return results;
};

// Check if form is valid
export const isFormValid = (validationResults: Record<string, ValidationResult>): boolean => {
  return Object.values(validationResults).every(result => result.isValid);
};

// Get all errors from form validation
export const getAllFormErrors = (validationResults: Record<string, ValidationResult>): string[] => {
  const allErrors: string[] = [];
  
  Object.values(validationResults).forEach(result => {
    allErrors.push(...result.errors);
  });
  
  return allErrors;
};

// Get all warnings from form validation
export const getAllFormWarnings = (validationResults: Record<string, ValidationResult>): string[] => {
  const allWarnings: string[] = [];
  
  Object.values(validationResults).forEach(result => {
    allWarnings.push(...result.warnings);
  });
  
  return allWarnings;
};

export default {
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
}; 