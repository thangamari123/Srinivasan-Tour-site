/**
 * Centralized Firebase SDK initialization. Configuration lives in ./firebaseConfig
 * (values come from Vite env variables — see .env.example).
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { initializeFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig';

export { COLLECTIONS, isFirebaseConfigured } from './firebaseConfig';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Copy .env.example to .env and fill in your project values.');
  }
  if (!app) app = getApps()[0] ?? initializeApp(firebaseConfig);
  return app;
}

export function getDb(): Firestore {
  // ignoreUndefinedProperties: optional form fields left undefined are simply omitted.
  if (!db) db = initializeFirestore(getFirebaseApp(), { ignoreUndefinedProperties: true });
  return db;
}
