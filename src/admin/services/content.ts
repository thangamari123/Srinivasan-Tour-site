/**
 * Admin write helpers. Every write stamps createdAt/updatedAt, keeps the
 * `mediaRefs` index used for safe media deletion, and appends to activityLogs.
 * Storage goes through the active data backend (Firestore in production).
 */
import { COLLECTIONS } from '../../lib/firebaseConfig';
import { backend } from '../data/backend';
import type { ActivityLog } from '../../types/content';

type Data = Record<string, unknown>;

export interface Actor {
  uid: string;
  email: string;
}

/** Recursively strip `undefined` values so writes never fail across Firestore/test backends. */
export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined).map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) out[k] = stripUndefined(v);
    }
    return out as T;
  }
  return value;
}

/** Collect URLs of uploaded images (ImageRef objects that carry a `key`) anywhere inside a document. */
export function collectMediaRefs(value: unknown, out = new Set<string>()): string[] {
  if (Array.isArray(value)) value.forEach((v) => collectMediaRefs(v, out));
  else if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.url === 'string' && typeof obj.key === 'string' && obj.key) out.add(obj.url);
    Object.entries(obj).forEach(([k, v]) => {
      if (k !== 'mediaRefs') collectMediaRefs(v, out);
    });
  }
  return [...out];
}

export async function logActivity(
  actor: Actor,
  action: ActivityLog['action'],
  entity: string,
  entityId?: string,
  entityName?: string,
) {
  try {
    await backend().add(COLLECTIONS.activityLogs, {
      action,
      entity,
      entityId: entityId ?? null,
      entityName: entityName ?? null,
      uid: actor.uid,
      userEmail: actor.email,
      createdAt: backend().timestamp(),
    });
  } catch (err) {
    // Logging must never block the actual operation.
    console.warn('[activity] failed to log', err);
  }
}

export async function createItem(col: string, data: Data, actor: Actor, entityName: string): Promise<string> {
  const clean = stripUndefined(data);
  const id = await backend().add(col, {
    ...clean,
    mediaRefs: collectMediaRefs(clean),
    createdAt: backend().timestamp(),
    updatedAt: backend().timestamp(),
  });
  await logActivity(actor, 'create', col, id, entityName);
  return id;
}

/** Full-document update coming from an edit form (recomputes mediaRefs). */
export async function saveItem(col: string, id: string, data: Data, actor: Actor, entityName: string) {
  const clean = stripUndefined(data);
  await backend().update(col, id, {
    ...clean,
    mediaRefs: collectMediaRefs(clean),
    updatedAt: backend().timestamp(),
  });
  await logActivity(actor, 'update', col, id, entityName);
}

/** Partial update (e.g. status toggle) — leaves mediaRefs untouched. */
export async function patchItem(
  col: string,
  id: string,
  patch: Data,
  actor: Actor,
  entityName: string,
  action: ActivityLog['action'] = 'update',
) {
  await backend().update(col, id, { ...stripUndefined(patch), updatedAt: backend().timestamp() });
  await logActivity(actor, action, col, id, entityName);
}

export async function removeItem(col: string, id: string, actor: Actor, entityName: string) {
  await backend().remove(col, id);
  await logActivity(actor, 'delete', col, id, entityName);
}

/** Homepage sections are singleton documents with fixed ids. */
export async function saveHomepageSection(section: string, data: Data, actor: Actor) {
  const clean = stripUndefined(data);
  await backend().set(COLLECTIONS.homepage, section, {
    ...clean,
    mediaRefs: collectMediaRefs(clean),
    updatedAt: backend().timestamp(),
  });
  await logActivity(actor, 'update', COLLECTIONS.homepage, section, `Homepage · ${section}`);
}

/** True when another document in `col` already uses this slug. */
export async function isSlugTaken(col: string, slug: string, excludeId?: string): Promise<boolean> {
  const docs = await backend().list(col, { where: [{ field: 'slug', op: '==', value: slug }], limit: 2 });
  return docs.some((d) => d.id !== excludeId);
}

/** Count documents in `col` whose `field` equals `value` (used to block deleting referenced categories/destinations). */
export async function countReferences(col: string, field: string, value: string): Promise<number> {
  const docs = await backend().list(col, { where: [{ field, op: '==', value }], limit: 50 });
  return docs.length;
}

export function errorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case 'permission-denied':
      return 'You do not have permission to perform this action (or the input violates Firestore validation rules).';
    case 'unauthenticated':
      return 'Your admin session expired. Please sign in again.';
    case 'unavailable':
      return 'Network unavailable. Please check your connection and try again.';
    case 'not-found':
      return 'This record no longer exists in Firestore. Refresh the list and try again.';
    case 'invalid-argument':
      return 'One or more fields contain unsupported data. Please check your inputs and try again.';
    case 'already-exists':
      return 'A record with this identifier already exists.';
    case 'failed-precondition':
      return 'Firestore precondition failed (a required index or document state may be missing).';
    case 'deadline-exceeded':
      return 'The request timed out. Please try again.';
    case 'resource-exhausted':
      return 'Firestore quota temporarily exceeded. Please wait a moment and try again.';
    default:
      return (err as Error)?.message || 'Something went wrong.';
  }
}
