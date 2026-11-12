import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/auth';
import { Button, TextInput } from '../ui';

const BRAND_LOGO = 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/logo/logo.webp';
const LOGO_VIDEO = '/images/preloader/logo-reveal-720.mp4';
const LOGO_POSTER =
  'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/preloader-logo-poster-720.webp';
const LOGO_STILL =
  'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/preloader-logo-final-720.webp';

/** Feathers the video's pure-white edges so no frame edge is ever visible against the white panel. */
const VIDEO_EDGE_MASK: CSSProperties = {
  WebkitMaskImage:
    'linear-gradient(to bottom, transparent 0, #000 9%, #000 91%, transparent 100%), linear-gradient(to right, transparent 0, #000 2%, #000 98%, transparent 100%)',
  WebkitMaskComposite: 'source-in',
  maskImage:
    'linear-gradient(to bottom, transparent 0, #000 9%, #000 91%, transparent 100%), linear-gradient(to right, transparent 0, #000 2%, #000 98%, transparent 100%)',
  maskComposite: 'intersect',
};

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function Login() {
  const { status, signIn, resetPassword, error } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [resetSent, setResetSent] = useState(false);
  const [videoFallback, setVideoFallback] = useState(() => prefersReducedMotion());
  const videoRef = useRef<HTMLVideoElement>(null);
  const replayTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFallback) return;
    video.play()?.catch(() => setVideoFallback(true));
    return () => {
      if (replayTimerRef.current !== null) {
        window.clearTimeout(replayTimerRef.current);
      }
    };
  }, [videoFallback]);

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
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left corporate identity panel (desktop) */}
      <div className="hidden lg:flex relative flex-col justify-between bg-white border-r border-slate-200/90 p-8 xl:p-12 overflow-hidden">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white shadow-sm">
              <img src={BRAND_LOGO} alt="Srinivasa Tours" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="block font-semibold text-slate-900 tracking-tight leading-tight">Srinivasa Tours</span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 mt-0.5">
                Operations Portal
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            SSL Secured
          </span>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center py-4 min-h-0">
          <div
            className="relative w-[min(35vw,42vh,420px)] max-w-full max-h-full aspect-[648/720]"
            style={VIDEO_EDGE_MASK}
            aria-hidden="true"
          >
            {videoFallback ? (
              <img
                src={LOGO_STILL}
                alt=""
                className="absolute inset-0 w-full h-full object-contain"
                width={648}
                height={720}
              />
            ) : (
              <video
                ref={videoRef}
                src={LOGO_VIDEO}
                poster={LOGO_POSTER}
                className="absolute inset-0 w-full h-full object-contain"
                muted
                playsInline
                autoPlay
                preload="auto"
                disablePictureInPicture
                onEnded={() => {
                  if (replayTimerRef.current !== null) window.clearTimeout(replayTimerRef.current);
                  replayTimerRef.current = window.setTimeout(() => {
                    const v = videoRef.current;
                    if (!v) return;
                    v.currentTime = 0;
                    v.play()?.catch(() => {});
                  }, 4000);
                }}
                onError={() => setVideoFallback(true)}
              />
            )}
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">
            Enterprise Content Management
          </p>
          <h2 className="text-2xl xl:text-[28px] font-semibold leading-snug tracking-tight text-[#0F1E3A]">
            Centralized control for tour packages, media, and live publishing.
          </h2>
          <p className="text-slate-500 mt-2 text-sm xl:text-[15px] leading-relaxed">
            Real-time synchronization across the public storefront with role-based access control.
          </p>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>ISO 9001:2015 Certified Operator</span>
            <span>Admin Console</span>
          </div>
        </div>
      </div>

      {/* Right authentication workspace */}
      <div className="flex flex-col justify-between p-4 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between gap-3 w-full max-w-[420px] mx-auto lg:max-w-none">
          <div className="flex items-center gap-2.5 lg:invisible">
            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white shadow-sm">
              <img src={BRAND_LOGO} alt="Srinivasa Tours" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="block text-sm font-semibold text-slate-900 leading-tight">Srinivasa Tours</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Admin Portal
              </span>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span>Public website</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="my-auto py-6 flex items-center justify-center">
          <div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_20px_48px_-24px_rgba(15,23,42,0.12)] p-6 sm:p-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0F1E3A] mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              <span>Authorized Access</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
              {mode === 'login' ? 'Sign in to workspace' : 'Reset account password'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'login'
                ? 'Enter your corporate credentials to continue.'
                : 'Enter your work email and we will send a recovery link.'}
            </p>

            {error && mode === 'login' && (
              <div role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                {error}
              </div>
            )}
            {resetSent && mode === 'reset' && (
              <div role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
                If an account exists for that email, a reset link is on its way.
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <TextInput
                label="Work email"
                type="email"
                placeholder="name@srinivasatour.com"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="py-2.5"
              />
              {mode === 'login' && (
                <div>
                  <div className="relative">
                    <TextInput
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="py-2.5 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2.5 top-[33px] p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setResetSent(false);
                      }}
                      className="text-xs font-medium text-slate-500 hover:text-[#0F1E3A] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-2.5 bg-[#0F1E3A] hover:bg-[#162B52] text-white shadow-sm shadow-slate-900/15 focus-visible:ring-[#0F1E3A]"
                loading={submitting || status === 'loading'}
                icon={Lock}
              >
                {mode === 'login' ? 'Sign in to console' : 'Send recovery link'}
              </Button>
            </form>

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setResetSent(false);
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#0F1E3A] font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Back to sign in</span>
              </button>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>Protected by Firebase Auth</span>
              <span>Staff Only</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} Srinivasa Tour Operators. All rights reserved.
        </p>
      </div>
    </div>
  );
}
