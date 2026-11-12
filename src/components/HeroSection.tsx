import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Phone, Send } from 'lucide-react';
import { useSiteContent } from '../context/siteContentContext';
import { defaultHomepage } from '../data/defaultContent';
import '../styles/hero.css';

const FLIGHT_PATH = 'M40 380 C 10 280, 90 210, 200 190 S 400 120, 540 30';
const FOREIGN_FALLBACK = 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/international-tour.webp';

/** Pre-cropped responsive variants for the default temple photo (generated from https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/pilgrimage.webp). */
const TEMPLE = 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/pilgrimage.webp';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ─── Count-up for the stats (once, when visible; 1s after load; 1.6s easeOutCubic) ─── */
function parseStat(value: string) {
  const m = /^(\d+)(.*)$/.exec(value.trim());
  return m ? { target: Number(m[1]), suffix: m[2] } : null;
}

function useCountUp(targets: number[], ref: React.RefObject<HTMLElement | null>) {
  const [values, setValues] = useState<number[]>(() => (prefersReducedMotion() ? targets : targets.map(() => 0)));
  const key = targets.join(',');

  useEffect(() => {
    const final = key.split(',').map(Number);
    if (prefersReducedMotion() || !ref.current) {
      setValues(final);
      return;
    }
    let raf = 0;
    let timer = 0;
    const loadedAt = performance.now();
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 1600);
        const eased = 1 - Math.pow(1 - t, 3);
        setValues(final.map((n) => Math.round(n * eased)));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timer = window.setTimeout(run, Math.max(0, 1000 - (performance.now() - loadedAt)));
      },
      { threshold: 0.3 },
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [key, ref]);

  return values;
}

/* ─── Headline word with rise animation ─── */
function Word({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <span className="h-mask">
      <span className="h-rise" data-word style={{ animationDelay: `${delay}s` }}>
        {children}
      </span>
    </span>
  );
}

export default function HeroSection() {
  const { homepage } = useSiteContent();
  const hero = homepage.hero;

  const images = (hero.backgroundImages ?? []).map((i) => i.url).filter(Boolean);
  const defaults = defaultHomepage.hero.backgroundImages.map((i) => i.url);
  const mainPhoto = images[0] || defaults[0];
  const secondPhoto = images[1] || FOREIGN_FALLBACK;
  const isDefaultTemple = mainPhoto === TEMPLE;

  const prefixWords = hero.headingPrefix.split(/\s+/).filter(Boolean);
  const suffixWords = hero.headingSuffix.split(/\s+/).filter(Boolean);
  // Stagger: .2s, .3s, .4s … across every word of the headline
  let wordIndex = 0;
  const nextDelay = () => 0.2 + 0.1 * wordIndex++;

  const ringText = `${hero.description.replace(/\s+[–-]\s+/g, ' • ')} • `;
  // Letter-spacing / textLength stretching breaks Tamil glyph clusters on an SVG path,
  // so those are only used for Latin text; Tamil is sized to fit the circle instead.
  const ringIsLatin = /^[ -~•–]*$/.test(ringText);
  const ringTextRef = useRef<SVGTextElement>(null);
  useLayoutEffect(() => {
    const el = ringTextRef.current;
    if (!el || ringIsLatin) return;
    const fit = () => {
      el.setAttribute('font-size', '10.5');
      const len = el.getComputedTextLength();
      if (len > 0) el.setAttribute('font-size', String(Math.max(7, Math.min(12, (10.5 * 318) / len)).toFixed(2)));
    };
    fit();
    document.fonts?.ready.then(fit).catch(() => undefined);
  }, [ringText, ringIsLatin]);
  const isInternal = hero.primaryCtaLink.startsWith('/');

  /* Stats count-up */
  const statsRef = useRef<HTMLDivElement>(null);
  const parsed = hero.stats.map((s) => parseStat(s.value));
  const counts = useCountUp(parsed.map((p) => p?.target ?? 0), statsRef);

  /* Fit the Tamil headline to its column, scale the flight layer to the collage */
  const titleRef = useRef<HTMLHeadingElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const title = titleRef.current;
    const collage = collageRef.current;
    if (!title || !collage) return;
    const measure = () => {
      title.style.removeProperty('--h-fit');
      const fontSize = parseFloat(getComputedStyle(title).fontSize);
      const widest = Math.max(...[...title.querySelectorAll<HTMLElement>('[data-word]')].map((w) => w.scrollWidth));
      if (widest > 0) {
        const fit = Math.floor((title.clientWidth / (widest / fontSize)) * 0.97);
        if (fit < fontSize) title.style.setProperty('--h-fit', `${fit}px`);
      }
      collage.style.setProperty('--h-scale', String(Math.min(1, collage.clientWidth / 560)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(title);
    ro.observe(collage);
    // Web fonts change word widths once loaded
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => ro.disconnect();
  }, [hero.headingPrefix, hero.headingHighlight, hero.headingSuffix]);

  const primaryInner = (
    <>
      <span>{hero.primaryCtaLabel}</span>
      <span className="h-btn-arrow" aria-hidden="true">
        <ArrowRight className="w-5 h-5" />
      </span>
    </>
  );

  return (
    <section className="h-hero font-tamil" aria-labelledby="hero-title">
      <div className="h-container h-grid">
        {/* ── Text ── */}
        <div>
          <span className="h-badge h-up">
            <span className="h-badge-dot" aria-hidden="true" />
            {hero.badge}
          </span>

          <h1 id="hero-title" ref={titleRef} className="h-title">
            {prefixWords.map((w, i) => (
              <span key={`p${i}`}>
                <Word delay={nextDelay()}>{w}</Word>{' '}
              </span>
            ))}
            <br />
            <span className="h-hl">
              <Word delay={nextDelay()}>{hero.headingHighlight}</Word>
              <svg className="h-brush" viewBox="0 0 220 28" preserveAspectRatio="none" aria-hidden="true">
                <path d="M6 18 C 60 6, 150 4, 214 14" fill="none" stroke="#F0B429" strokeWidth="14" strokeLinecap="round" />
              </svg>
            </span>{' '}
            {suffixWords.map((w, i) => (
              <span key={`s${i}`}>
                <Word delay={nextDelay()}>{w}</Word>
                {i < suffixWords.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>

          <p className="h-sub h-up">{hero.description}</p>

          <div className="h-btns h-up">
            {isInternal ? (
              <Link to={hero.primaryCtaLink} className="h-btn h-btn-primary">
                {primaryInner}
              </Link>
            ) : (
              <a href={hero.primaryCtaLink} className="h-btn h-btn-primary">
                {primaryInner}
              </a>
            )}
            <a href={`tel:${hero.phone}`} className="h-btn h-btn-secondary">
              <span className="h-btn-icon" aria-hidden="true">
                <Phone className="w-[18px] h-[18px] h-ring-icon" />
              </span>
              <span>{hero.secondaryCtaLabel}</span>
            </a>
          </div>

          <div ref={statsRef} className="h-stats h-up">
            {hero.stats.map((stat, i) => {
              const p = parsed[i];
              const suffix = p?.suffix ?? '';
              const plus = suffix.endsWith('+');
              return (
                <div key={stat.label} className="h-stat">
                  <span className="h-stat-num">
                    {p ? (
                      <>
                        {counts[i]}
                        {plus ? suffix.slice(0, -1) : suffix}
                        {plus && <span className="h-stat-plus">+</span>}
                      </>
                    ) : (
                      stat.value
                    )}
                  </span>
                  <span className="h-stat-label">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Photo collage (decorative) ── */}
        <div ref={collageRef} className="h-collage h-up" aria-hidden="true">
          <div className="h-photo">
            {isDefaultTemple ? (
              <picture>
                <source media="(max-width: 767px)" srcSet="https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/hero-temple-landscape-640.webp 640w, https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/pilgrimage.webp 940w" sizes="100vw" width={640} height={427} />
                <img
                  src="https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/hero-temple-portrait-487.webp"
                  srcSet="https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/hero-temple-portrait-360.webp 360w, https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/hero-temple-portrait-487.webp 487w"
                  sizes="420px"
                  width={487}
                  height={627}
                  alt=""
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            ) : (
              <img src={mainPhoto} alt="" width={420} height={540} fetchPriority="high" decoding="async" />
            )}
          </div>

          <div className="h-photo2">
            <img
              src={secondPhoto === FOREIGN_FALLBACK ? 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/hero-foreign-500.webp' : secondPhoto}
              alt=""
              width={250}
              height={230}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="h-spin">
            <svg className="h-spin-ring" viewBox="0 0 140 140">
              <defs>
                <path id="h-ring-path" d="M70 70 m -52 0 a 52 52 0 1 1 104 0 a 52 52 0 1 1 -104 0" />
              </defs>
              <circle cx="70" cy="70" r="68" fill="#0F1E3A" />
              <text
                ref={ringTextRef}
                fill="#F0B429"
                fontFamily="Inter, 'Noto Sans Tamil', sans-serif"
                fontSize="10.5"
                fontWeight="700"
                letterSpacing={ringIsLatin ? 2.4 : 0}
              >
                {ringIsLatin ? (
                  <textPath href="#h-ring-path" textLength="318" lengthAdjust="spacing">
                    {ringText}
                  </textPath>
                ) : (
                  <textPath href="#h-ring-path">{ringText}</textPath>
                )}
              </text>
            </svg>
            <span className="h-spin-center">
              <Globe className="w-[42%] h-[42%]" />
            </span>
          </div>

          <div className="h-flight">
            <svg width="560" height="420" viewBox="0 0 560 420" fill="none">
              <path d={FLIGHT_PATH} stroke="#D99A0B" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="h-plane">
              <Send className="w-4 h-4" style={{ transform: 'rotate(45deg)' }} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
