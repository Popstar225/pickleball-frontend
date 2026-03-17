import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { imageBaseURL } from "./const"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves an image path to a full URL.
 * - If already a full URL (e.g. Vercel Blob): returned as-is.
 * - In local dev: relative paths are prefixed with the local backend base URL.
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${imageBaseURL}/${cleanPath}`;
}
