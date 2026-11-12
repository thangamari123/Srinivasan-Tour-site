import { useCallback, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/auth';
import { useToast } from '../context/feedback';
import { uploadToLibrary, type MediaFolder } from '../services/media';
import { errorMessage } from '../services/content';
import { validateImageFile } from '../../lib/imageUtils';
import { backend } from '../data/backend';
import type { ImageRef } from '../../types/content';

export interface UploadTask {
  id: string;
  name: string;
  progress: number;
  /** Temporary local preview (object URL) shown only while the upload runs. */
  previewUrl: string;
}

export function useActor() {
  const { user } = useAuth();
  return useMemo(() => ({ uid: user?.uid ?? '', email: user?.email ?? '' }), [user]);
}

const fileFingerprint = (f: File) => `${f.name}:${f.size}:${f.lastModified}`;

/**
 * Uploads files one-by-one to R2 through the media Worker (keeps memory low and
 * progress readable). Validates each file first, ignores a file that is already
 * uploading (prevents accidental repeated uploads), and supports cancellation.
 * Resolves with the successfully uploaded refs, in the original order.
 */
export function useUploader(folder: MediaFolder) {
  const { getIdToken } = useAuth();
  const actor = useActor();
  const toast = useToast();
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const controllers = useRef(new Map<string, AbortController>());
  const inFlight = useRef(new Set<string>());

  const cancel = useCallback((id: string) => controllers.current.get(id)?.abort(), []);

  const upload = useCallback(
    async (files: File[]): Promise<ImageRef[]> => {
      if (!backend().mediaEnabled) {
        toast('Image upload is not configured: VITE_MEDIA_API_URL is missing.', 'error');
        return [];
      }
      if (!navigator.onLine) {
        toast('You are offline. Reconnect to upload images.', 'error');
        return [];
      }
      const valid: File[] = [];
      files.forEach((f) => {
        const problem = validateImageFile(f);
        if (problem) toast(problem, 'error');
        else if (inFlight.current.has(fileFingerprint(f))) toast(`${f.name} is already uploading.`, 'info');
        else valid.push(f);
      });
      if (!valid.length) return [];

      const queued = valid.map((f, i) => ({
        id: `${Date.now()}-${i}-${f.name}`,
        name: f.name,
        progress: 0,
        previewUrl: URL.createObjectURL(f),
      }));
      // Register every controller up front so queued (not yet started) uploads can be cancelled too.
      queued.forEach((t) => controllers.current.set(t.id, new AbortController()));
      valid.forEach((f) => inFlight.current.add(fileFingerprint(f)));
      setTasks((t) => [...t, ...queued]);

      const results: ImageRef[] = [];
      let cancelled = 0;
      for (let i = 0; i < valid.length; i++) {
        const task = queued[i];
        const controller = controllers.current.get(task.id)!;
        try {
          if (controller.signal.aborted) throw new Error('Upload cancelled');
          const ref = await uploadToLibrary(
            valid[i],
            folder,
            actor,
            getIdToken,
            (p) => setTasks((t) => t.map((x) => (x.id === task.id ? { ...x, progress: p } : x))),
            controller.signal,
          );
          results.push(ref);
        } catch (err) {
          if (controller.signal.aborted) cancelled++;
          else toast(`${valid[i].name}: ${errorMessage(err)}`, 'error');
        } finally {
          controllers.current.delete(task.id);
          inFlight.current.delete(fileFingerprint(valid[i]));
          URL.revokeObjectURL(task.previewUrl);
          setTasks((t) => t.filter((x) => x.id !== task.id));
        }
      }
      if (results.length) toast(results.length === 1 ? 'Image uploaded' : `${results.length} images uploaded`);
      if (cancelled) toast(cancelled === 1 ? 'Upload cancelled' : `${cancelled} uploads cancelled`, 'info');
      return results;
    },
    [folder, actor, getIdToken, toast],
  );

  return { upload, cancel, tasks, uploading: tasks.length > 0 };
}
