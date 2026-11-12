import { useRef, useState, type CSSProperties, type KeyboardEvent, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Play } from 'lucide-react';
import { ReelPlayer, type ReelVideo } from './TravelReels';
import { useSiteContent } from '../context/siteContentContext';
import { useReveal } from '../hooks/useReveal';
import { isValidVideoId, youTubeThumbnail } from '../lib/youtube';
import '../styles/home.css';

const MAX_HOME_REELS = 8;

/** transform / z-index / opacity / filter for a reel at distance d from the active one. */
function coverflowStyle(d: number): CSSProperties {
  const a = Math.abs(d);
  const rotate = d === 0 ? 0 : d > 0 ? -34 : 34;
  return {
    transform: `translateX(-50%) translateX(${d * 62}%) rotateY(${rotate}deg) scale(${1 - Math.min(a, 2) * 0.14})`,
    zIndex: 10 - a,
    opacity: a === 0 ? 1 : a === 1 ? 0.9 : a === 2 ? 0.55 : 0,
    filter: `brightness(${a === 0 ? 1 : 0.7})`,
    pointerEvents: a > 2 ? 'none' : undefined,
  };
}

/**
 * Homepage Travel Reels: enabled videos from all active packages (the site content
 * provider only loads active packages), in package order, de-duplicated by video ID.
 * Hidden when there are none.
 */
export default function HomeTravelReels() {
  const { packages, loading } = useSiteContent();
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  const seen = new Set<string>();
  const videos: ReelVideo[] = [];
  for (const pkg of packages) {
    for (const v of pkg.travelVideos) {
      if (videos.length >= MAX_HOME_REELS || seen.has(v.videoId) || !isValidVideoId(v.videoId)) continue;
      seen.add(v.videoId);
      videos.push(v);
    }
  }

  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  if (loading || videos.length === 0) return null;

  const current = active ?? Math.floor((videos.length - 1) / 2); // start with the middle reel
  const go = (i: number) => setActive((i + videos.length) % videos.length);

  const onTouchStart = (e: TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) >= 40) go(current + (dx < 0 ? 1 : -1));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(current + 1);
    if (e.key === 'ArrowLeft') go(current - 1);
  };

  return (
    <section ref={sectionRef} className="s-sec s-ivory font-tamil" aria-labelledby="reels-title">
      <div className="h-container">
        <div className="s-head s-head-center rv">
          <span className="s-eyebrow s-eyebrow-red">
            <Play className="w-3 h-3 fill-[#E11D48] text-[#E11D48]" aria-hidden="true" /> Travel Reels
          </span>
          <h2 id="reels-title" className="s-h2">எங்கள் பயணங்கள் சொல்வது</h2>
          <p className="s-lead">பயணிகளின் நிஜமான அனுபவங்களை வீடியோவில் காணுங்கள்</p>
        </div>

        <div
          className="cf"
          role="group"
          aria-roledescription="carousel"
          aria-label="Travel Reels"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onKeyDown={onKey}
        >
          {videos.map((v, i) => {
            const d = i - current;
            const isActive = d === 0;
            return (
              <button
                key={v.videoId}
                type="button"
                className="cf-reel"
                style={coverflowStyle(d)}
                tabIndex={Math.abs(d) > 2 ? -1 : 0}
                aria-label={`${isActive ? 'Play reel' : 'Show reel'}: ${v.title}`}
                aria-hidden={Math.abs(d) > 2 ? true : undefined}
                onClick={() => (isActive ? setPlaying(i) : setActive(i))}
              >
                <img src={youTubeThumbnail(v.videoId)} alt="" loading="lazy" decoding="async" />
                <span className="cf-shade" aria-hidden="true" />
                <span className="cf-shorts" aria-hidden="true">
                  <Play className="w-3 h-3 fill-white" /> Shorts
                </span>
                <span className="cf-play" aria-hidden="true">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </span>
                <span className="cf-info">
                  <span className="cf-title block">{v.title}</span>
                  {v.location && (
                    <span className="cf-city">
                      <MapPin className="w-3.5 h-3.5 text-[#F0B429]" aria-hidden="true" />
                      {v.location}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {videos.length > 1 && (
          <div className="cf-controls">
            <button type="button" className="s-arr" aria-label="Previous reel" onClick={() => go(current - 1)}>
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="s-dots" role="group" aria-label="Choose reel">
              {videos.map((v, i) => (
                <button key={v.videoId} type="button" className="s-dot" aria-label={`Show reel: ${v.title}`} aria-current={i === current} onClick={() => go(i)} />
              ))}
            </div>
            <button type="button" className="s-arr" aria-label="Next reel" onClick={() => go(current + 1)}>
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {playing !== null && <ReelPlayer videos={videos} index={playing} onClose={() => setPlaying(null)} onIndex={setPlaying} />}
    </section>
  );
}
