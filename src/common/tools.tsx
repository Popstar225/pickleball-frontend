import { getImageUrl } from '@/lib/utils';

/** @deprecated Use getImageUrl from @/lib/utils instead */
export const getFullImageUrl = (imagePath: string | null | undefined): string | null => {
  const result = getImageUrl(imagePath);
  return result || null;
};

  