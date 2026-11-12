/**
 * Migrates any remaining local `/images/...` references inside Firestore documents
 * (`tourPackages`, `categories`, `destinations`, `homepage`) to their verified
 * Cloudflare R2 Worker URLs from `src/data/r2MigrationMap.json`, updates `mediaRefs`,
 * and ensures corresponding metadata documents exist in `media`.
 *
 * Idempotent: documents already using R2 URLs with `key` and `mediaRefs` are skipped.
 */
import { COLLECTIONS } from '../../lib/firebaseConfig';
import migrationMapRaw from '../../data/r2MigrationMap.json';
import { backend, type BatchSet } from '../data/backend';
import { collectMediaRefs, logActivity, type Actor } from './content';

interface MappedEntry {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

const r2Map = migrationMapRaw as Record<string, MappedEntry>;

function inferFolder(key: string): string {
  if (key.startsWith('packages/')) return 'packages';
  if (key.startsWith('website/destinations/')) return 'destinations';
  if (key.startsWith('website/homepage/') || key.startsWith('website/logo/')) return 'homepage';
  if (key.startsWith('website/gallery/')) return 'general';
  return 'general';
}

function upgradeValue(val: unknown): { value: unknown; changed: boolean } {
  if (typeof val === 'string') {
    const mapped = r2Map[val];
    return mapped ? { value: mapped.url, changed: true } : { value: val, changed: false };
  }
  if (Array.isArray(val)) {
    let any = false;
    const next = val.map((item) => {
      const res = upgradeValue(item);
      if (res.changed) any = true;
      return res.value;
    });
    return { value: any ? next : val, changed: any };
  }
  if (val && typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (typeof obj.url === 'string' && r2Map[obj.url]) {
      const m = r2Map[obj.url];
      if (obj.url !== m.url || obj.key !== m.key) {
        return { value: { ...obj, url: m.url, key: m.key }, changed: true };
      }
      return { value: val, changed: false };
    }
    let any = false;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'mediaRefs') {
        out[k] = v;
        continue;
      }
      const res = upgradeValue(v);
      if (res.changed) any = true;
      out[k] = res.value;
    }
    return { value: any ? out : val, changed: any };
  }
  return { value: val, changed: false };
}

export interface R2FirestoreMigrationSummary {
  updatedDocs: number;
  mediaCreated: number;
}

export async function migrateFirestoreImagesToR2(actor: Actor): Promise<R2FirestoreMigrationSummary> {
  const db = backend();
  const cols = [COLLECTIONS.tourPackages, COLLECTIONS.categories, COLLECTIONS.destinations, COLLECTIONS.homepage];
  const [lists, existingMedia] = await Promise.all([
    Promise.all(cols.map((c) => db.list(c))),
    db.list(COLLECTIONS.media),
  ]);

  const ops: BatchSet[] = [];
  let updatedDocs = 0;
  const usedEntries = new Map<string, MappedEntry>();

  const registerUsedKeys = (refs: string[]) => {
    for (const url of refs) {
      const match = Object.values(r2Map).find((e) => e.url === url);
      if (match) usedEntries.set(match.key, match);
    }
  };

  cols.forEach((col, ci) => {
    for (const doc of lists[ci]) {
      const { id, ...rest } = doc;
      const upgraded = upgradeValue(rest);
      const nextData = upgraded.value as Record<string, unknown>;
      const nextRefs = collectMediaRefs(nextData);
      const prevRefs = Array.isArray(rest.mediaRefs) ? rest.mediaRefs : [];
      const refsChanged = JSON.stringify(prevRefs) !== JSON.stringify(nextRefs);

      registerUsedKeys(nextRefs);

      if (upgraded.changed || refsChanged) {
        ops.push({
          col,
          id,
          data: {
            ...nextData,
            mediaRefs: nextRefs,
            updatedAt: db.timestamp(),
          },
        });
        updatedDocs++;
      }
    }
  });

  // Also ensure every referenced migrated R2 image (plus site assets in map) has metadata in `media`.
  const existingKeys = new Set(existingMedia.map((m) => String(m.key ?? '')));
  let mediaCreated = 0;
  for (const entry of Object.values(r2Map)) {
    if (existingKeys.has(entry.key)) continue;
    const fileName = entry.key.split('/').pop() || entry.key;
    ops.push({
      col: COLLECTIONS.media,
      id: db.newId(COLLECTIONS.media),
      data: {
        key: entry.key,
        url: entry.url,
        fileName,
        contentType: entry.contentType,
        size: entry.size,
        folder: inferFolder(entry.key),
        uploadedBy: actor.email,
        uploadedAt: db.timestamp(),
      },
    });
    existingKeys.add(entry.key);
    mediaCreated++;
  }

  // Batch writes in chunks of 400 (Firestore batch limit is 500).
  for (let i = 0; i < ops.length; i += 400) {
    await db.batchSet(ops.slice(i, i + 400));
  }

  if (ops.length > 0) {
    await logActivity(actor, 'import', 'media', undefined, `Migrated ${updatedDocs} docs, ${mediaCreated} media records to R2`);
  }
  return { updatedDocs, mediaCreated };
}

