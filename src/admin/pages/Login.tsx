import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Plane } from 'lucide-react';
import { useAuth } from '../context/auth';
import { Button, TextInput } from '../ui';

export default function Login() {
  const { status, signIn, resetPassword, error } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [resetSent, setResetSent] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;
  if (status === 'authorized') return <Navigate to={from && from.startsWith('/admin') ? from : '/admin'} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (mode === 'login') await signIn(email, password);
      else {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch {
      /* error is exposed through context */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative bg-slate-900 overflow-hidden">
        <img src="https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/hero-bg.webp" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-slate-900/70 to-slate-900" />
        <div className="relative flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
            <span className="font-semibold">Srinivasa Tours</span>
          </div>
          <div>
            <h2 className="text-3xl font-semibold leading-tight">Manage packages, destinations and homepage content in one place.</h2>
            <p className="text-white/60 mt-3">Changes go live on the website instantly — no redeploy needed.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center mb-6 lg:hidden">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{mode === 'login' ? 'Sign in to admin' : 'Reset password'}</h1>
          <p className="text-sm text-slate-500 mt-1.5">
            {mode === 'login' ? 'Authorized staff only.' : 'We will email you a reset link if the account exists.'}
          </p>

          {error && mode === 'login' && (
            <div role="alert" className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {resetSent && mode === 'reset' && (
            <div role="status" className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              If an account exists for that email, a reset link is on its way.
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <TextInput
              label="Email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {mode === 'login' && (
              <div className="relative">
                <TextInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-[34px] p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}
            <Button type="submit" className="w-full" loading={submitting || status === 'loading'} icon={Lock}>
              {mode === 'login' ? 'Sign in' : 'Send reset link'}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'reset' : 'login');
              setResetSent(false);
            }}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {mode === 'login' ? 'Forgot password?' : '← Back to sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
