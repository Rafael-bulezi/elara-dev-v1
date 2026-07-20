/**
 * Elara Image Utility
 * -------------------
 * Client-side compression (browser-image-compression) + Supabase Storage
 * Image Transformation URL builder.
 *
 * Pipeline:
 *  1. Validate → 2. Compress client-side → 3. Upload original to Supabase
 *  4. Serve via Supabase transform URLs at the right size for each context
 */

import imageCompression from 'browser-image-compression';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Max upload size the user can select (8 MB). Reject anything bigger. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Accepted MIME types. HEIC / TIFF / BMP are rejected. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ─── Size presets (match the research recommendation exactly) ─────────────────

export type ImageVariant = 'thumb' | 'medium' | 'large' | 'avatar';

const VARIANT_OPTIONS: Record<ImageVariant, { maxWidthOrHeight: number; maxSizeMB: number; quality: number }> = {
  /** Product grid / card — target < 60 KB, 400 px */
  thumb:  { maxWidthOrHeight: 400,  maxSizeMB: 0.06, quality: 0.80 },
  /** Product detail page — target < 200 KB, 1000 px */
  medium: { maxWidthOrHeight: 1000, maxSizeMB: 0.20, quality: 0.85 },
  /** Zoom / full-screen — target < 400 KB, 1600 px */
  large:  { maxWidthOrHeight: 1600, maxSizeMB: 0.40, quality: 0.85 },
  /** Profile avatars — target < 30 KB, 200 px */
  avatar: { maxWidthOrHeight: 200,  maxSizeMB: 0.03, quality: 0.80 },
};

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ImageValidationResult {
  ok: boolean;
  error?: string;
}

/**
 * Validate a file before compression/upload.
 * Checks MIME type and size.
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: `Formato não suportado (${file.type || 'desconhecido'}). Use JPEG, PNG ou WebP.`,
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return {
      ok: false,
      error: `Imagem muito grande (${mb} MB). O tamanho máximo é 8 MB.`,
    };
  }
  return { ok: true };
}

// ─── Compression ─────────────────────────────────────────────────────────────

/**
 * Compress an image client-side for a given display context.
 *
 * @param file   - The raw File from <input type="file">
 * @param variant - Which size preset to apply
 * @returns      Compressed File (as WebP when the browser supports it)
 */
export async function compressImage(file: File, variant: ImageVariant): Promise<File> {
  const { maxWidthOrHeight, maxSizeMB } = VARIANT_OPTIONS[variant];

  const compressed = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: 'image/webp',    // convert to WebP
    initialQuality: VARIANT_OPTIONS[variant].quality,
  });

  return compressed;
}

// ─── Supabase Transform URL Builder ──────────────────────────────────────────

/**
 * Convert a Supabase Storage public URL into a transform URL that
 * auto-resizes and re-encodes to WebP on the fly.
 *
 * Only applies to URLs that contain `supabase.co/storage/v1/object/public`.
 * Falls back to the original URL for external images or non-Supabase sources.
 *
 * Transform docs: https://supabase.com/docs/guides/storage/serving/image-transformations
 *
 * @param url     Raw storage URL from supabase.storage.getPublicUrl()
 * @param width   Desired output width in pixels
 * @param quality WebP quality 1-100 (default 80)
 */
export function getTransformUrl(
  url: string | undefined | null,
  width: number,
  quality = 80
): string | undefined {
  if (!url) return undefined;

  // Only transform Supabase storage object URLs
  if (!url.includes('/storage/v1/object/public/')) return url;

  // Replace /object/public/ with /render/image/public/
  const renderUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');

  // Append (or merge) transform query params
  const base = renderUrl.split('?')[0];
  return `${base}?width=${width}&quality=${quality}&resize=contain&format=webp`;
}

/**
 * Convenience helpers for each display context.
 */
export const thumbUrl   = (url?: string | null) => getTransformUrl(url, 400,  80);
export const mediumUrl  = (url?: string | null) => getTransformUrl(url, 1000, 85);
export const largeUrl   = (url?: string | null) => getTransformUrl(url, 1600, 85);
export const avatarUrl  = (url?: string | null) => getTransformUrl(url, 200,  80);
