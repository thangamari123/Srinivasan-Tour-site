import { COLLECTIONS } from '../../lib/firebaseConfig';
import { prepareImage, validateImageFile } from '../../lib/imageUtils';
import { backend } from '../data/backend';
import type { ImageRef, MediaItem } from '../../types/content';
import { logActivity, type Actor } from './content';

export type MediaFolder = 'packages' | 'destinations' | 'categories' | 'homepage' | 'testimonials' | 'general';

/**
 * Validate → compress → store the file (R2 via the Worker in production) → record
 * metadata in the media collection. Returns an ImageRef for content documents.
 */
export async function uploadToLibrary(
  file: File,
  folder: MediaFolder,
  actor: Actor,
  getIdToken: () => Promise<string>,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<ImageRef> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  const prepared = await prepareImage(file);
  const result = await backend().uploadImage(prepared.blob, prepared.fileName, folder, getIdToken, onProgress, signal);
  if (!result?.url || !result?.key) throw new Error('The media API did not return an image URL.');

  let mediaId: string;
  try {
    mediaId = await backend().add(COLLECTIONS.media, {
      key: result.key,
      url: result.url,
      fileName: prepared.fileName,
      contentType: result.contentType,
      size: result.size,
      width: prepared.width,
      height: prepared.height,
      folder,
      uploadedBy: actor.email,
      uploadedAt: backend().timestamp(),
    });
  } catch (err) {
    // The file is in R2 but could not be recorded: remove it so no orphan is left behind.
    // (Only the "admin" role may delete; for editors the object stays and is reported.)
    await backend()
      .deleteImage(result.key, getIdToken)
      .catch(() => console.error('[media] orphaned R2 object (metadata write failed):', result.key));
    throw err;
  }
  await logActivity(actor, 'upload', COLLECTIONS.media, mediaId, file.name);

  return { url: result.url, key: result.key, mediaId };
}

export interface MediaUsage {
  collection: string;
  id: string;
  label: string;
}

const USAGE_SOURCES: { col: string; labelField: string }[] = [
  { col: COLLECTIONS.tourPackages, labelField: 'title' },
  { col: COLLECTIONS.destinations, labelField: 'name' },
  { col: COLLECTIONS.categories, labelField: 'name' },
  { col: COLLECTIONS.homepage, labelField: '' },
];

/** Where is this image still referenced? Uses the `mediaRefs` array kept on every content doc. */
export async function findMediaUsage(url: string): Promise<MediaUsage[]> {
  const results = await Promise.all(
    USAGE_SOURCES.map(async ({ col, labelField }) => {
      const docs = await backend().list(col, { where: [{ field: 'mediaRefs', op: 'array-contains', value: url }], limit: 20 });
      return docs.map((d) => ({
        collection: col,
        id: d.id,
        label: labelField ? String(d[labelField] ?? d.id) : `Homepage · ${d.id}`,
      }));
    }),
  );
  return results.flat();
}

/** Deletes the stored file, then the metadata. Callers must check usage first. */
export async function deleteMedia(item: MediaItem, actor: Actor, getIdToken: () => Promise<string>) {
  await backend().deleteImage(item.key, getIdToken);
  await backend().remove(COLLECTIONS.media, item.id);
  await logActivity(actor, 'delete', COLLECTIONS.media, item.id, item.fileName);
}
