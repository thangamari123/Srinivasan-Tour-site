/**
 * Centralized API configuration for the Cloudflare Worker that fronts R2.
 * No R2 credentials ever live in the frontend: the Worker uses an R2 binding and
 * verifies the caller's Firebase ID token + admin role before every write.
 */

export const MEDIA_API_URL = (import.meta.env.VITE_MEDIA_API_URL || '').replace(/\/+$/, '');

export const isMediaApiConfigured = Boolean(MEDIA_API_URL);

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'] as const;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // must match MAX_UPLOAD_BYTES in the Worker

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function requireApi() {
  if (!isMediaApiConfigured) {
    throw new ApiError('Media API is not configured. Set VITE_MEDIA_API_URL in your .env file.', 0);
  }
}

/**
 * Upload a single file. Uses XMLHttpRequest because fetch() has no upload progress events.
 */
export function uploadImage(
  file: Blob,
  fileName: string,
  folder: string,
  idToken: string,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<UploadResult> {
  requireApi();
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file, fileName);
    form.append('folder', folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${MEDIA_API_URL}/api/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
    xhr.responseType = 'json';

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      const body = xhr.response as (UploadResult & { error?: string }) | null;
      if (xhr.status >= 200 && xhr.status < 300 && body?.url) resolve(body);
      else reject(new ApiError(body?.error || `Upload failed (${xhr.status})`, xhr.status));
    };
    xhr.onerror = () => reject(new ApiError('Network error while uploading. Check the Media API URL and CORS settings.', 0));
    xhr.onabort = () => reject(new ApiError('Upload cancelled', 0));
    signal?.addEventListener('abort', () => xhr.abort());

    xhr.send(form);
  });
}

export async function deleteImage(key: string, idToken: string): Promise<void> {
  requireApi();
  const res = await fetch(`${MEDIA_API_URL}/api/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ key }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(body?.error || `Delete failed (${res.status})`, res.status);
  }
}
