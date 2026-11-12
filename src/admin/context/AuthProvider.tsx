import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { COLLECTIONS, getDb, getFirebaseApp } from '../../lib/firebase';
import { AuthContext, type AuthState, type AuthStatus } from './auth';
import type { AdminUser } from '../../types/content';

function friendlyAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Firebase configuration error: the API key is invalid.';
    default:
      return 'Sign-in failed. Please try again.';
  }
}

const isActiveAdmin = (d: Partial<AdminUser> | undefined) =>
  d?.active === true && (d.role === 'admin' || d.role === 'editor');

/**
 * Firebase Auth session (persisted in the browser) + admin authorization.
 *
 * The admins/{uid} record is watched live, so deactivating a user or changing
 * their role takes effect immediately. The record is only used for UI decisions;
 * every write is independently authorized by Firestore security rules and every
 * upload/delete by the media Worker (which verifies the Firebase ID token).
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useMemo(() => getAuth(getFirebaseApp()), []);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Set when the user signs out on purpose, so we don't report "session expired". */
  const intentionalSignOut = useRef(false);
  const wasAuthorized = useRef(false);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => undefined);
    let unsubAdmin: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      unsubAdmin?.();
      unsubAdmin = null;

      if (!fbUser) {
        setUser(null);
        setAdmin(null);
        if (wasAuthorized.current && !intentionalSignOut.current) {
          setError('Your session has expired. Please sign in again.');
          setStatus('unauthorized');
        } else {
          setStatus((prev) => (prev === 'unauthorized' ? prev : 'signedOut'));
        }
        wasAuthorized.current = false;
        intentionalSignOut.current = false;
        return;
      }

      setStatus('loading');
      unsubAdmin = onSnapshot(
        doc(getDb(), COLLECTIONS.admins, fbUser.uid),
        (snap) => {
          const data = snap.data() as Omit<AdminUser, 'id'> | undefined;
          if (snap.exists() && isActiveAdmin(data)) {
            setUser(fbUser);
            setAdmin({ ...(data as Omit<AdminUser, 'id'>), id: snap.id });
            setError(null);
            setStatus('authorized');
            wasAuthorized.current = true;
            return;
          }
          // Signed in to Firebase but not (or no longer) an active admin: end the session.
          wasAuthorized.current = false;
          setError('This account is not authorized to access the admin panel.');
          setStatus('unauthorized');
          setUser(null);
          setAdmin(null);
          void fbSignOut(auth);
        },
        (err) => {
          console.error('[auth] admin lookup failed', err);
          wasAuthorized.current = false;
          setError(
            (err as { code?: string }).code === 'permission-denied'
              ? 'This account is not authorized to access the admin panel.'
              : 'Could not verify admin access. Check your connection and try again.',
          );
          setStatus('unauthorized');
          setUser(null);
          setAdmin(null);
          void fbSignOut(auth);
        },
      );
    });

    return () => {
      unsubAdmin?.();
      unsubAuth();
    };
  }, [auth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch (err) {
        const code = (err as { code?: string }).code ?? '';
        const message = friendlyAuthError(code);
        setError(message);
        throw new Error(message);
      }
    },
    [auth],
  );

  const signOut = useCallback(async () => {
    intentionalSignOut.current = true;
    setError(null);
    setStatus('signedOut');
    await fbSignOut(auth);
  }, [auth]);

  const resetPassword = useCallback(
    async (email: string) => {
      // Always resolves the same way so the form does not reveal which emails exist.
      await sendPasswordResetEmail(auth, email.trim()).catch(() => undefined);
    },
    [auth],
  );

  const getIdToken = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) throw new Error('Your session has expired. Please sign in again.');
    try {
      return await current.getIdToken();
    } catch {
      throw new Error('Your session has expired. Please sign in again.');
    }
  }, [auth]);

  const value = useMemo<AuthState>(
    () => ({
      status,
      user,
      admin,
      isFullAdmin: admin?.role === 'admin',
      error,
      signIn,
      signOut,
      resetPassword,
      getIdToken,
    }),
    [status, user, admin, error, signIn, signOut, resetPassword, getIdToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
