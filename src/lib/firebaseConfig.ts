/**
 * Firebase configuration values (no SDK imports here, so the public site can check
 * `isFirebaseConfigured` without pulling the Firebase SDK into the main bundle).
 * Firebase web config values are public identifiers, not secrets — access is
 * enforced by Firestore security rules.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Optional (Google Analytics); not required by the admin panel or website.
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

/** True when the required Firebase env variables are present. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

/** Firestore collection names — single source of truth. */
export const COLLECTIONS = {
  admins: 'admins',
  tourPackages: 'tourPackages',
  destinations: 'destinations',
  categories: 'categories',
  homepage: 'homepage',
  testimonials: 'testimonials',
  media: 'media',
  activityLogs: 'activityLogs',
  settings: 'settings',
} as const;
