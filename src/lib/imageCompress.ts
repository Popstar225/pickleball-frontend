/**
 * Compress and resize an image File using the browser Canvas API.
 * Outputs a JPEG File no larger than maxDimension × maxDimension and maxSizeBytes.
 */
export async function compressImage(
  file: File,
  maxDimension = 1200,
  quality = 0.82,
  maxSizeBytes = 2 * 1024 * 1024, // 2 MB
): Promise<File> {
  // Non-image files pass through unchanged
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if either dimension exceeds maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0, width, height);

      // Try progressively lower quality if still too large
      const tryExport = (q: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            if (blob.size > maxSizeBytes && q > 0.4) {
              tryExport(q - 0.1);
            } else {
              const compressed = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, '.jpg'),
                { type: 'image/jpeg', lastModified: Date.now() },
              );
              resolve(compressed);
            }
          },
          'image/jpeg',
          q,
        );
      };

      tryExport(quality);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // fallback: send original
    };

    img.src = url;
  });
}
