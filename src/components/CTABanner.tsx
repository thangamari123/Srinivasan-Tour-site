import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Send } from 'lucide-react';
import { useSiteContent } from '../context/siteContentContext';
import { useReveal } from '../hooks/useReveal';
import '../styles/home.css';

const ROUTE = 'M-20 300 C 200 120, 420 360, 700 160 S 1100 40, 1300 120';

/** CTA styled as a boarding pass. All text comes from Homepage → Call to action. */
export default function CTABanner() {
  const { homepage } = useSiteContent();
  const cta = homepage.cta;
  const passRef = useRef<HTMLDivElement>(null);
  useReveal(passRef, ['.bp']); // adds .is-in → draws the brush stroke

  const primaryInner = (
    <>
      <span>{cta.primaryLabel}</span>
      <span className="bp-circle" aria-hidden="true">
        <ArrowRight className="w-5 h-5" />
      </span>
    </>
  );

  return (
    <section className="s-sec s-ivory font-tamil" aria-labelledby="cta-title">
      <div className="h-container">
        <div ref={passRef} className="bp rv">
          <div className="bp-main">
            <span className="bp-orb bp-orb-1" aria-hidden="true" />
            <span className="bp-orb bp-orb-2" aria-hidden="true" />
            <svg className="bp-route" viewBox="0 0 1300 420" fill="none" aria-hidden="true">
              <path d={ROUTE} stroke="rgba(240,180,41,.5)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="bp-plane" aria-hidden="true">
              <Send className="w-4 h-4" style={{ transform: 'rotate(45deg)' }} />
            </span>

            <div className="bp-content">
              <span className="s-eyebrow s-eyebrow-navy">{cta.badge}</span>
              <h2 id="cta-title" className="bp-h2">
                {cta.headingPrefix}{' '}
                <span className="bp-hl">
                  <span>{cta.headingHighlight}</span>
                  <svg className="bp-brush" viewBox="0 0 220 28" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M6 18 C 60 6, 150 4, 214 14" fill="none" stroke="#F0B429" strokeWidth="14" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
              <p className="bp-lead">{cta.description}</p>
              <div className="bp-btns">
                {cta.primaryLink.startsWith('/') ? (
                  <Link to={cta.primaryLink} className="bp-btn bp-btn-gold">
                    {primaryInner}
                  </Link>
                ) : (
                  <a href={cta.primaryLink} className="bp-btn bp-btn-gold">
                    {primaryInner}
                  </a>
                )}
                <a href={`tel:${cta.phone}`} className="bp-btn bp-btn-ghost">
                  <span className="bp-circle" aria-hidden="true">
                    <Phone className="w-[18px] h-[18px] h-ring-icon" />
                  </span>
                  <span>{cta.secondaryLabel}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
