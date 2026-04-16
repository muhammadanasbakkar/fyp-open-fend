/**
 * Browser-side image compression using the Canvas API.
 * Resizes to maxSize if the image exceeds it, then re-encodes as WebP
 * at the given quality. No quality loss below maxSize — only byte reduction.
 */
export async function compressImage(
  file: File,
  options: {
    /** Max width OR height in pixels. Aspect ratio is preserved. Default 1600. */
    maxSize?: number;
    /** Encoding quality 0–1. Default 0.85 (visually lossless for photos). */
    quality?: number;
  } = {}
): Promise<File> {
  const { maxSize = 1600, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // ── Scale down only if the image exceeds maxSize ──────────────────────
      let { naturalWidth: w, naturalHeight: h } = img;
      if (w > maxSize || h > maxSize) {
        if (w >= h) {
          h = Math.round((h * maxSize) / w);
          w = maxSize;
        } else {
          w = Math.round((w * maxSize) / h);
          h = maxSize;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context not available"));
        return;
      }

      // Draw with smooth interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);

      // ── Encode as WebP (better compression than JPEG at same quality) ─────
      const mime = "image/webp";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Compression failed — canvas.toBlob returned null"));
            return;
          }

          // Only swap to compressed version if it's actually smaller
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          const baseName = file.name.replace(/\.[^.]+$/, "");
          const compressed = new File([blob], `${baseName}.webp`, {
            type: mime,
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        mime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = objectUrl;
  });
}

/**
 * Compress an array of image files in parallel.
 */
export async function compressImages(
  files: File[],
  options?: { maxSize?: number; quality?: number }
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, options)));
}
