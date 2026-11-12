import { createContext, useContext } from 'react';
import type { AdminUser } from '../../types/content';

export type AuthStatus = 'loading' | 'signedOut' | 'unauthorized' | 'authorized';

/** The parts of the signed-in Firebase user the admin UI needs. */
export interface AdminSessionUser {
  uid: string;
  email: string | null;
}

export interface AuthState {
  status: AuthStatus;
  user: AdminSessionUser | null;
  /** The user's admins/{uid} record. Display only — authorization is enforced by Firestore rules and the Worker. */
  admin: AdminUser | null;
  /** True for the "admin" role (delete, settings, user management). Editors can create & edit. */
  isFullAdmin: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  /** Fresh Firebase ID token for calling the media Worker. */
  getIdToken: () => Promise<string>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider missing');
  return ctx;
}
