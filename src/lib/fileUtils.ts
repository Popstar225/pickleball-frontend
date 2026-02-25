/**
 * File and QR Code Utilities
 * 
 * This module provides comprehensive utilities for file handling,
 * QR code operations, file validation, and image processing.
 * 
 * IMPORTANT: QR code generation is handled by the backend API.
 * These frontend functions provide fallback implementations and
 * client-side helpers for working with existing QR codes.
 * 
 * For actual QR code generation, use the backend endpoints:
 * - POST /digital-credentials/:id/regenerate-qr
 * 
 * @author Pickleball Federation Team
 * @version 2.0.0
 */

// File type constants
export const FILE_TYPES = {
  IMAGE: {
    PNG: 'image/png',
    JPEG: 'image/jpeg',
    JPG: 'image/jpg',
    GIF: 'image/gif',
    WEBP: 'image/webp',
    SVG: 'image/svg+xml'
  },
  DOCUMENT: {
    PDF: 'application/pdf',
    DOC: 'application/msword',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    XLS: 'application/vnd.ms-excel',
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  TEXT: {
    TXT: 'text/plain',
    CSV: 'text/csv',
    JSON: 'application/json',
    XML: 'application/xml'
  }
} as const;

// File size constants (in bytes)
export const FILE_SIZES = {
  BYTE: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024
} as const;

// Maximum file sizes
export const MAX_FILE_SIZES = {
  IMAGE: 10 * FILE_SIZES.MB,        // 10MB
  DOCUMENT: 25 * FILE_SIZES.MB,     // 25MB
  QR_CODE: 5 * FILE_SIZES.MB,       // 5MB
  PROFILE_PICTURE: 2 * FILE_SIZES.MB, // 2MB
  THUMBNAIL: 1 * FILE_SIZES.MB      // 1MB
} as const;

// File extension mapping
export const FILE_EXTENSIONS = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'application/json': '.json',
  'application/xml': '.xml'
} as const;

// File validation interface
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    extension: string;
  };
}

// File validation options
export interface FileValidationOptions {
  allowedTypes?: string[];
  maxSize?: number;
  required?: boolean;
  allowMultiple?: boolean;
  maxFiles?: number;
}

// Validate file
export const validateFile = (
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult => {
  const {
    allowedTypes = Object.values(FILE_TYPES.IMAGE),
    maxSize = MAX_FILE_SIZES.IMAGE,
    required = true
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if file exists
  if (!file && required) {
    errors.push('File is required');
    return { isValid: false, errors, warnings };
  }

  if (!file) {
    return { isValid: true, errors, warnings };
  }

  // Get file info
  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    extension: getFileExtension(file.name)
  };

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type '${file.type}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file name
  if (!file.name || file.name.trim().length === 0) {
    errors.push('File name is required');
  }

  // Check for suspicious file extensions
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif'];
  if (suspiciousExtensions.includes(fileInfo.extension.toLowerCase())) {
    warnings.push('This file type may be potentially harmful');
  }

  // Check file size warnings
  if (file.size > maxSize * 0.8) {
    warnings.push('File size is approaching the maximum limit');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileInfo
  };
};

// Validate multiple files
export const validateFiles = (
  files: FileList | File[],
  options: FileValidationOptions = {}
): FileValidationResult => {
  const {
    allowMultiple = true,
    maxFiles = 10,
    ...fileOptions
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];
  const fileArray = Array.from(files);

  // Check if multiple files are allowed
  if (!allowMultiple && fileArray.length > 1) {
    errors.push('Only one file is allowed');
    return { isValid: false, errors, warnings };
  }

  // Check maximum number of files
  if (fileArray.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files are allowed`);
    return { isValid: false, errors, warnings };
  }

  // Validate each file
  for (const file of fileArray) {
    const validation = validateFile(file, fileOptions);
    if (!validation.isValid) {
      errors.push(...validation.errors.map(err => `${file.name}: ${err}`));
    }
    if (validation.warnings.length > 0) {
      warnings.push(...validation.warnings.map(warn => `${file.name}: ${warn}`));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Get file extension from filename
export const getFileExtension = (filename: string): string => {
  if (!filename) return '';
  
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  
  return filename.substring(lastDotIndex).toLowerCase();
};

// Get file name without extension
export const getFileNameWithoutExtension = (filename: string): string => {
  if (!filename) return '';
  
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return filename;
  
  return filename.substring(0, lastDotIndex);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Convert file size to bytes
export const parseFileSize = (sizeString: string): number => {
  const match = sizeString.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  
  const multipliers = {
    'B': 1,
    'KB': FILE_SIZES.KB,
    'MB': FILE_SIZES.MB,
    'GB': FILE_SIZES.GB,
    'TB': FILE_SIZES.TB
  };
  
  return value * multipliers[unit as keyof typeof multipliers];
};

// Check if file is an image
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

// Check if file is a document
export const isDocumentFile = (file: File): boolean => {
  return file.type.startsWith('application/') || file.type.startsWith('text/');
};

// Check if file is a PDF
export const isPdfFile = (file: File): boolean => {
  return file.type === FILE_TYPES.DOCUMENT.PDF;
};

// Check if file is a text file
export const isTextFile = (file: File): boolean => {
  return file.type.startsWith('text/');
};

// Create file URL for preview
export const createFileURL = (file: File): string => {
  return URL.createObjectURL(file);
};

// Revoke file URL to free memory
export const revokeFileURL = (url: string): void => {
  URL.revokeObjectURL(url);
};

// Read file as text
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

// Read file as data URL
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Read file as array buffer
export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Download file
export const downloadFile = (data: string | Blob, filename: string, mimeType?: string): void => {
  const blob = typeof data === 'string' ? new Blob([data], { type: mimeType || 'text/plain' }) : data;
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// QR Code utilities
export interface QRCodeOptions {
  width?: number;
  height?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  format?: 'PNG' | 'JPEG' | 'SVG';
  quality?: number; // For JPEG format
}

// Default QR code options
export const DEFAULT_QR_OPTIONS: Required<QRCodeOptions> = {
  width: 256,
  height: 256,
  margin: 4,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  errorCorrectionLevel: 'M',
  format: 'PNG',
  quality: 0.9
};

// Generate QR code data URL
// Note: This function is a client-side helper for working with existing QR codes
// For actual QR code generation, use the backend API endpoints
export const generateQRCodeDataURL = async (
  data: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  try {
    // Since QR code generation is handled by the backend,
    // this function provides a fallback for client-side operations
    // For actual QR code generation, use the backend regenerateQRCode endpoint
    
    const mergedOptions = { ...DEFAULT_QR_OPTIONS, ...options };
    
    // Create a simple canvas-based QR code representation
    // This is a fallback implementation for when backend QR codes are not available
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    
    canvas.width = mergedOptions.width;
    canvas.height = mergedOptions.height;
    
    // Fill background
    ctx.fillStyle = mergedOptions.color.light;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw a simple placeholder pattern (not a real QR code)
    ctx.fillStyle = mergedOptions.color.dark;
    ctx.font = `${Math.min(canvas.width, canvas.height) / 8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QR', canvas.width / 2, canvas.height / 2);
    
    // Add border
    ctx.strokeStyle = mergedOptions.color.dark;
    ctx.lineWidth = 2;
    ctx.strokeRect(mergedOptions.margin, mergedOptions.margin, 
                   canvas.width - 2 * mergedOptions.margin, 
                   canvas.height - 2 * mergedOptions.margin);
    
    return canvas.toDataURL(mergedOptions.format === 'JPEG' ? 'image/jpeg' : 'image/png', 
                           mergedOptions.format === 'JPEG' ? mergedOptions.quality : undefined);
  } catch (error) {
    console.error('Error generating QR code placeholder:', error);
    throw new Error('Failed to generate QR code placeholder. Use backend API for actual QR code generation.');
  }
};

// Generate QR code blob
// Note: This function is a client-side helper for working with existing QR codes
// For actual QR code generation, use the backend API endpoints
export const generateQRCodeBlob = async (
  data: string,
  options: QRCodeOptions = {}
): Promise<Blob> => {
  try {
    // Since QR code generation is handled by the backend,
    // this function provides a fallback for client-side operations
    // For actual QR code generation, use the backend regenerateQRCode endpoint
    
    const mergedOptions = { ...DEFAULT_QR_OPTIONS, ...options };
    
    // Create a simple canvas-based QR code representation
    // This is a fallback implementation for when backend QR codes are not available
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    
    canvas.width = mergedOptions.width;
    canvas.height = mergedOptions.height;
    
    // Fill background
    ctx.fillStyle = mergedOptions.color.light;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw a simple placeholder pattern (not a real QR code)
    ctx.fillStyle = mergedOptions.color.dark;
    ctx.font = `${Math.min(canvas.width, canvas.height) / 8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QR', canvas.width / 2, canvas.height / 2);
    
    // Add border
    ctx.strokeStyle = mergedOptions.color.dark;
    ctx.lineWidth = 2;
    ctx.strokeRect(mergedOptions.margin, mergedOptions.margin, 
                   canvas.width - 2 * mergedOptions.margin, 
                   canvas.height - 2 * mergedOptions.margin);
    
    // Convert canvas to blob
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        mergedOptions.format === 'JPEG' ? 'image/jpeg' : 'image/png',
        mergedOptions.format === 'JPEG' ? mergedOptions.quality : undefined
      );
    });
  } catch (error) {
    console.error('Error generating QR code blob placeholder:', error);
    throw new Error('Failed to generate QR code blob placeholder. Use backend API for actual QR code generation.');
  }
};

// Download QR code
// Note: This function is a client-side helper for working with existing QR codes
// For actual QR code generation, use the backend API endpoints
export const downloadQRCode = async (
  data: string,
  filename: string = 'qrcode',
  options: QRCodeOptions = {}
): Promise<void> => {
  try {
    const blob = await generateQRCodeBlob(data, options);
    const extension = options.format?.toLowerCase() || 'png';
    const fullFilename = `${filename}.${extension}`;
    
    downloadFile(blob, fullFilename, blob.type);
  } catch (error) {
    console.error('Error downloading QR code placeholder:', error);
    throw new Error('Failed to download QR code placeholder. Use backend API for actual QR code generation.');
  }
};

// Validate QR code data
export const validateQRCodeData = (data: string): { isValid: boolean; error?: string } => {
  if (!data || typeof data !== 'string') {
    return { isValid: false, error: 'QR code data must be a non-empty string' };
  }
  
  if (data.length > 2953) {
    return { isValid: false, error: 'QR code data is too long (maximum 2953 characters)' };
  }
  
  if (data.length === 0) {
    return { isValid: false, error: 'QR code data cannot be empty' };
  }
  
  return { isValid: true };
};

// Get file type from MIME type
export const getFileTypeFromMIME = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/')) return 'text';
  if (mimeType.startsWith('application/')) return 'document';
  return 'unknown';
};

// Get file icon based on type
export const getFileIcon = (file: File): string => {
  if (isImageFile(file)) return '🖼️';
  if (isPdfFile(file)) return '📄';
  if (isDocumentFile(file)) return '📝';
  if (isTextFile(file)) return '📄';
  return '📁';
};

// Sanitize filename
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
};

// Generate unique filename
export const generateUniqueFilename = (
  originalName: string,
  prefix?: string,
  suffix?: string
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);
  const nameWithoutExt = getFileNameWithoutExtension(originalName);
  
  let filename = `${nameWithoutExt}_${timestamp}_${random}${extension}`;
  
  if (prefix) {
    filename = `${prefix}_${filename}`;
  }
  
  if (suffix) {
    filename = `${filename.replace(extension, '')}_${suffix}${extension}`;
  }
  
  return sanitizeFilename(filename);
};

export default {
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
}; 