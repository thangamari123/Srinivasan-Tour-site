import { useEffect } from 'react';
import { isFirebaseConfigured } from '../lib/firebaseConfig';
import AuthProvider from './context/AuthProvider';
import AdminShell from './AdminShell';
import SetupRequired from './pages/SetupRequired';

/** Keeps the admin out of search engines and prevents browser/Google Translate from breaking React DOM nodes. */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const prevTitle = document.title;
    const html = document.documentElement;
    const hadNotranslate = html.classList.contains('notranslate');
    const prevTranslate = html.getAttribute('translate');
    html.classList.add('notranslate');
    html.setAttribute('translate', 'no');
    document.title = 'Admin · Srinivasa Tours';
    return () => {
      meta.remove();
      document.title = prevTitle;
      if (!hadNotranslate) html.classList.remove('notranslate');
      if (prevTranslate === null) html.removeAttribute('translate');
      else html.setAttribute('translate', prevTranslate);
    };
  }, []);
}

/**
 * Admin entry point. Production-only: Firebase Auth + Firestore + R2 (Worker).
 * When the Firebase environment variables are missing a configuration error is
 * shown — there is no demo / mock fallback and no authentication bypass.
 */
export default function AdminApp() {
  useNoIndex();
  if (!isFirebaseConfigured) return <SetupRequired />;
  return <AdminShell AuthProvider={AuthProvider} />;
}
