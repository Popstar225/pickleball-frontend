import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { imageBaseURL } from "./const"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Constructs a full URL for an image from a relative path
 * @param imagePath - Relative path like "/uploads/qr-codes/filename.png"
 * @returns Full URL like "http://localhost:5000/uploads/qr-codes/filename.png"
 */
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with a slash, remove it to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  const fullUrl = `${imageBaseURL}/${cleanPath}`;
  console.log('getImageUrl debug:', { imagePath, imageBaseURL, cleanPath, fullUrl });
  
  // Add cache-busting parameter to prevent browser caching issues
  const cacheBuster = `?t=${Date.now()}`;
  return fullUrl + cacheBuster;
}
