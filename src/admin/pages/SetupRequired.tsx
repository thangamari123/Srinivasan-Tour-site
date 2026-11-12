import { Settings2 } from 'lucide-react';
import { firebaseConfig } from '../../lib/firebaseConfig';
import { isMediaApiConfigured } from '../../lib/api';

const REQUIRED: { name: string; ok: boolean }[] = [
  { name: 'VITE_FIREBASE_API_KEY', ok: Boolean(firebaseConfig.apiKey) },
  { name: 'VITE_FIREBASE_AUTH_DOMAIN', ok: Boolean(firebaseConfig.authDomain) },
  { name: 'VITE_FIREBASE_PROJECT_ID', ok: Boolean(firebaseConfig.projectId) },
  { name: 'VITE_FIREBASE_APP_ID', ok: Boolean(firebaseConfig.appId) },
  { name: 'VITE_MEDIA_API_URL', ok: isMediaApiConfigured },
];

/** Configuration error shown at /admin when the Firebase environment variables are missing. */
export default function SetupRequired() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-body">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-5">
          <Settings2 className="w-6 h-6 text-rose-600" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Configuration error</h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          The admin panel cannot start because the Firebase environment variables are missing. Add them to <code className="px-1 py-0.5 rounded bg-slate-100">.env</code>{' '}
          (local) or to your hosting provider’s environment settings, then restart / redeploy.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm">
          {REQUIRED.map((r) => (
            <li key={r.name} className="flex items-center gap-2">
              <span className={r.ok ? 'text-emerald-600' : 'text-rose-600'}>{r.ok ? '✓' : '✗'}</span>
              <code className={r.ok ? 'text-slate-500' : 'text-slate-900 font-medium'}>{r.name}</code>
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-500 mt-4">
          See <code className="px-1 py-0.5 rounded bg-slate-100">docs/ADMIN_SETUP.md</code>.
        </p>
      </div>
    </div>
  );
}
