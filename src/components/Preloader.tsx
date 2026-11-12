import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Logo-reveal preloader.
 * Video: /images/preloader/logo-reveal-720.mp4 — an optimised copy of
 * /images/preloading-logo-animation.mp4 (cropped to the logo, 648×720, no audio, fast-start).
 */
const VIDEO = '/images/preloader/logo-reveal-720.mp4';
const POSTER = 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/preloader-logo-poster-720.webp';
const STILL = 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/preloader-logo-final-720.webp';

/** The animation is 7.9s long; 1.5× keeps the full reveal but holds visitors ~5.3s. */
const PLAYBACK_RATE = 1.5;
/** If the video hasn't started by then (slow network / autoplay blocked), show the still logo instead. */
const START_TIMEOUT_MS = 2500;
/** Never keep the site hidden longer than this. */
const MAX_DURATION_MS = 8000;
const STILL_HOLD_MS = 1100;
const FADE_MS = 500;
const SESSION_KEY = 'srinivasa-preloader-seen';
/** The optimised video's background was cleaned to pure white, so the page matches it exactly. */
const BG = '#FFFFFF';
/**
 * Feather the video's edges as a safety net so no rectangle edge is ever visible. Top/bottom fade 9%; sides only 2% because the finished logo
 * (hat, palm) reaches close to the left/right edges.
 */
const EDGE_MASK: React.CSSProperties = {
  WebkitMaskImage:
    'linear-gradient(to bottom, transparent 0, #000 9%, #000 91%, transparent 100%), linear-gradient(to right, transparent 0, #000 2%, #000 98%, transparent 100%)',
  WebkitMaskComposite: 'source-in',
  maskImage:
    'linear-gradient(to bottom, transparent 0, #000 9%, #000 91%, transparent 100%), linear-gradient(to right, transparent 0, #000 2%, #000 98%, transparent 100%)',
  maskComposite: 'intersect',
};

function alreadySeenThisSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function Preloader() {
  // Shown once per browser session (reloads / repeat visits in the same tab skip it).
  const [visible, setVisible] = useState(() => !alreadySeenThisSession());
  const [fading, setFading] = useState(false);
  const [mode, setMode] = useState<'video' | 'still'>(() => (prefersReducedMotion() ? 'still' : 'video'));
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const started = useRef(false);
  const done = useRef(false);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* private mode: just show it again next time */
    }
    setProgress(1);
    setFading(true);
    window.setTimeout(() => setVisible(false), FADE_MS);
  }, []);

  // Lock page scroll while the preloader covers the screen.
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  // Timers: hard cap, start timeout, and the still-image path.
  useEffect(() => {
    if (!visible) return;
    const cap = window.setTimeout(finish, MAX_DURATION_MS);
    let fallback = 0;
    let still = 0;
    if (mode === 'still') {
      still = window.setTimeout(finish, STILL_HOLD_MS);
    } else {
      fallback = window.setTimeout(() => {
        if (!started.current) setMode('still');
      }, START_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(cap);
      clearTimeout(fallback);
      clearTimeout(still);
    };
  }, [visible, mode, finish]);

  // Start playback (muted autoplay); if the browser refuses, fall back to the still logo.
  useEffect(() => {
    const v = videoRef.current;
    if (!visible || mode !== 'video' || !v) return;
    v.playbackRate = PLAYBACK_RATE;
    v.play()?.catch(() => setMode('still'));
  }, [visible, mode]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 transition-opacity ease-out ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_MS}ms`, background: BG }}
    >
      {/* Logo animation — sized to the viewport so it works from small phones to large desktops */}
      <div className="relative w-[min(78vw,50vh,420px)] aspect-[648/720]" style={EDGE_MASK} aria-hidden="true">
        {mode === 'video' ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain"
            src={VIDEO}
            poster={POSTER}
            muted
            playsInline
            autoPlay
            preload="auto"
            disablePictureInPicture
            onPlaying={() => {
              started.current = true;
              if (videoRef.current) videoRef.current.playbackRate = PLAYBACK_RATE;
            }}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) setProgress(v.currentTime / v.duration);
            }}
            onEnded={() => window.setTimeout(finish, 350)} // brief hold on the finished logo
            onError={() => setMode('still')}
          />
        ) : (
          <img src={STILL} alt="" className="absolute inset-0 w-full h-full object-contain" width={648} height={720} />
        )}
      </div>

      {/* Brand + progress */}
      <div className="mt-[clamp(8px,2.5vh,28px)] flex flex-col items-center w-full max-w-[280px]">
        <p className="font-tamil font-bold text-[#0F1E3A] text-xl sm:text-2xl tracking-wide text-center">ஸ்ரீநிவாசா</p>
        <p className="font-tamil text-[#8A5A06] text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold mt-0.5 text-center">
          Tour Operators
        </p>
        <div className="w-full h-[3px] mt-5 rounded-full bg-[#0F1E3A]/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#F0B429] to-[#D99A0B] transition-[width] duration-300 ease-out"
            style={{ width: `${Math.round((mode === 'still' ? 1 : progress) * 100)}%` }}
          />
        </div>
        <p className="mt-3 text-[#5B6478] text-[11px] tracking-[0.2em] uppercase">Your Journey Begins...</p>
      </div>

      <button
        type="button"
        onClick={finish}
        className="absolute bottom-[max(20px,env(safe-area-inset-bottom))] right-5 min-h-[44px] px-5 rounded-full text-sm font-semibold text-[#0F1E3A] bg-white/80 border border-[#E3DFD5] hover:bg-white transition-colors"
      >
        Skip
      </button>
    </div>
  );
}
