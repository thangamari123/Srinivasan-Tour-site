import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useSiteContent } from '../context/siteContentContext';
import { useReveal } from '../hooks/useReveal';
import '../styles/home.css';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function Testimonials() {
  const { homepage, testimonials } = useSiteContent();
  const section = homepage.testimonials;
  const [rawCurrent, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [flip, setFlip] = useState(false); // toggles the animation class so it replays on every change
  const total = testimonials.length;
  const current = total ? rawCurrent % total : 0;
  const sectionRef = useRef<HTMLElement>(null);
  const touchX = useRef<number | null>(null);
  useReveal(sectionRef);

  const goTo = useCallback(
    (i: number) => {
      if (!total) return;
      setCurrent(((i % total) + total) % total);
      setFlip((f) => !f);
    },
    [total],
  );
  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);
  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null || total < 2) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) >= 40) goTo(current + (dx < 0 ? 1 : -1));
  };

  // Autoplay every 6s; paused on hover / keyboard focus; off for reduced motion.
  useEffect(() => {
    if (total < 2 || paused || reducedMotion()) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, total, paused]);

  // Hide the whole section when there are no active testimonials.
  if (!total) return null;

  const item = testimonials[current];
  const rating = Math.max(1, Math.min(5, Math.round(item.rating || 5)));

  const dots = (extra = '') => (
    <div className={`s-dots ts-dots ${extra}`} role="group" aria-label="Reviews">
      {testimonials.map((_, index) => (
        <button
          key={index}
          type="button"
          className="s-dot"
          aria-label={`Go to review ${index + 1}`}
          aria-current={index === current}
          onClick={() => goTo(index)}
        />
      ))}
    </div>
  );
  const arrows = (
    <>
      <button type="button" className="s-arr" aria-label="Previous review" onClick={prev}>
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      </button>
      <button type="button" className="s-arr" aria-label="Next review" onClick={next}>
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </>
  );

  return (
    <section ref={sectionRef} className="s-sec s-white ts-sec font-tamil" aria-labelledby="reviews-title">
      <div className="h-container ts-grid">
        <div className="rv ts-intro">
          <span className="s-eyebrow s-eyebrow-grey">{section.badge}</span>
          <h2 id="reviews-title" className="s-h2">{section.title}</h2>
          <p className="s-lead">{section.subtitle}</p>
          {total > 1 && <div className="ts-nav">{arrows}</div>}
        </div>

        <div
          className="rv ts-stage"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="ts-stack" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <span className="ts-back ts-back-1" aria-hidden="true" />
            <span className="ts-back ts-back-2" aria-hidden="true" />
            <figure className={`ts-card ${flip ? 'ts-anim-b' : 'ts-anim-a'}`} aria-live="polite">
              <svg className="ts-quote-mark" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
                <path d="M20 10c-8 2-14 9-14 18v10h14V24h-7c0-5 3-8 8-9l-1-5zm22 0c-8 2-14 9-14 18v10h14V24h-7c0-5 3-8 8-9l-1-5z" />
              </svg>
              {item.tour && <span className="ts-tag">{item.tour}</span>}
              <div className="ts-stars" aria-label={`${rating} / 5`}>
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-[18px] h-[18px] fill-current" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="ts-text">"{item.text}"</blockquote>
              <figcaption className="ts-foot">
                <span className="ts-avatar" aria-hidden="true">{item.name.charAt(0)}</span>
                <span>
                  <span className="ts-name block">{item.name}</span>
                  <span className="ts-city block">{item.location}</span>
                </span>
              </figcaption>
            </figure>
          </div>
          {total > 1 && (
            <>
              {dots('ts-dots-desktop')}
              <div className="ts-mobile-nav">
                <button type="button" className="s-arr" aria-label="Previous review" onClick={prev}>
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </button>
                {dots()}
                <button type="button" className="s-arr" aria-label="Next review" onClick={next}>
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
