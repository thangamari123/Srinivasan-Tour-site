import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from './api';

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Returns an error message, or null when the file is acceptable. */
export function validateImageFile(file: File): string | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return `${file.name}: unsupported type. Allowed: JPG, PNG, WebP, GIF, AVIF.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `${file.name}: ${formatBytes(file.size)} exceeds the ${formatBytes(MAX_UPLOAD_BYTES)} limit.`;
  }
  return null;
}

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}

export interface PreparedImage {
  blob: Blob;
  fileName: string;
  width: number;
  height: number;
  originalSize: number;
}

const MAX_DIMENSION = 2400;
const COMPRESS_THRESHOLD = 400 * 1024; // only re-encode files larger than 400 KB or oversized

/**
 * Downscales very large photos and re-encodes them as WebP when that makes them smaller.
 * GIFs (possibly animated) and already-small images are passed through untouched.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  const img = await loadImage(file);
  let { naturalWidth: width, naturalHeight: height } = img;
  const base = { blob: file as Blob, fileName: file.name, width, height, originalSize: file.size };

  const oversized = Math.max(width, height) > MAX_DIMENSION;
  if (file.type === 'image/gif' || (!oversized && file.size <= COMPRESS_THRESHOLD)) return base;

  const scale = oversized ? MAX_DIMENSION / Math.max(width, height) : 1;
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return base;
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82));
  // Some browsers silently fall back to PNG; only keep the result if it is real WebP and smaller.
  if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return base;

  const fileName = file.name.replace(/\.[^.]+$/, '') + '.webp';
  return { blob, fileName, width, height, originalSize: file.size };
}
