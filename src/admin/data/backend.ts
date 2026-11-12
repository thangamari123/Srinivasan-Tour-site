/**
 * Admin data-access contract. The only implementation is `firestoreBackend`
 * (Firebase Firestore for content, Cloudflare R2 via the media Worker for images).
 * There is no mock / local fallback: if Firebase is not configured the admin shows
 * a configuration error instead.
 */
import { firestoreBackend } from './firestoreBackend';

export type DocData = Record<string, unknown> & { id: string };

export interface WhereClause {
  field: string;
  op: '==' | 'array-contains';
  value: unknown;
}

export interface QueryOptions {
  where?: WhereClause[];
  orderBy?: string;
  direction?: 'asc' | 'desc';
  limit?: number;
}

export interface BatchSet {
  col: string;
  id: string;
  data: Record<string, unknown>;
}

export interface StoredImage {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface DataBackend {
  /** Whether image upload is available (Media API URL configured). */
  readonly mediaEnabled: boolean;

  subscribe(col: string, opts: QueryOptions, onData: (docs: DocData[]) => void, onError: (err: Error) => void): () => void;
  list(col: string, opts?: QueryOptions): Promise<DocData[]>;
  get(col: string, id: string): Promise<DocData | null>;
  add(col: string, data: Record<string, unknown>): Promise<string>;
  /** Create or fully replace a document. */
  set(col: string, id: string, data: Record<string, unknown>): Promise<void>;
  /** Shallow-merge fields into an existing document. */
  update(col: string, id: string, patch: Record<string, unknown>): Promise<void>;
  remove(col: string, id: string): Promise<void>;
  /** New unique document id for `col` (used by batch writes). */
  newId(col: string): string;
  /** Atomic multi-document write. */
  batchSet(ops: BatchSet[]): Promise<void>;
  /** Firestore server timestamp sentinel. */
  timestamp(): unknown;

  uploadImage(
    file: Blob,
    fileName: string,
    folder: string,
    getIdToken: () => Promise<string>,
    onProgress?: (p: number) => void,
    signal?: AbortSignal,
  ): Promise<StoredImage>;
  deleteImage(key: string, getIdToken: () => Promise<string>): Promise<void>;
}

let activeBackend: DataBackend = firestoreBackend;

/** The production data service used by every admin page and service. */
export function backend(): DataBackend {
  return activeBackend;
}

/** Override the data backend for automated tests (pass null to restore production Firestore). */
export function setBackendOverride(next: DataBackend | null): void {
  activeBackend = next ?? firestoreBackend;
}
