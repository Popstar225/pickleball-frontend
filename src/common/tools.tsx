import { imageBaseURL } from '@/lib/const';

export const getFullImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${imageBaseURL}${imagePath}`;
  };

  