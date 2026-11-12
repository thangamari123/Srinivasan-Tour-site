/**
 * Production backend: Firebase Firestore for content, Cloudflare R2 (through the
 * Worker in /worker) for images. Behaviour is identical to the original services.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as limitTo,
  onSnapshot,
  orderBy as orderByField,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type QueryConstraint,
} from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { deleteImage, isMediaApiConfigured, uploadImage } from '../../lib/api';
import type { DataBackend, DocData, QueryOptions } from './backend';

function buildQuery(col: string, opts: QueryOptions = {}) {
  const constraints: QueryConstraint[] = [];
  opts.where?.forEach((w) => constraints.push(where(w.field, w.op, w.value)));
  if (opts.orderBy) constraints.push(orderByField(opts.orderBy, opts.direction ?? 'asc'));
  if (opts.limit) constraints.push(limitTo(opts.limit));
  return query(collection(getDb(), col), ...constraints);
}

export const firestoreBackend: DataBackend = {
  mediaEnabled: isMediaApiConfigured,

  subscribe(col, opts, onData, onError) {
    return onSnapshot(
      buildQuery(col, opts),
      (snap) => onData(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as DocData)),
      onError,
    );
  },
  async list(col, opts) {
    const snap = await getDocs(buildQuery(col, opts));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as DocData);
  },
  async get(col, id) {
    const snap = await getDoc(doc(getDb(), col, id));
    return snap.exists() ? ({ ...snap.data(), id: snap.id } as DocData) : null;
  },
  async add(col, data) {
    return (await addDoc(collection(getDb(), col), data)).id;
  },
  async set(col, id, data) {
    await setDoc(doc(getDb(), col, id), data);
  },
  async update(col, id, patch) {
    await updateDoc(doc(getDb(), col, id), patch);
  },
  async remove(col, id) {
    await deleteDoc(doc(getDb(), col, id));
  },
  newId(col) {
    return doc(collection(getDb(), col)).id;
  },
  async batchSet(ops) {
    const batch = writeBatch(getDb());
    ops.forEach((op) => batch.set(doc(getDb(), op.col, op.id), op.data));
    await batch.commit();
  },
  timestamp() {
    return serverTimestamp();
  },
  async uploadImage(file, fileName, folder, getIdToken, onProgress, signal) {
    return uploadImage(file, fileName, folder, await getIdToken(), onProgress, signal);
  },
  async deleteImage(key, getIdToken) {
    await deleteImage(key, await getIdToken());
  },
};
