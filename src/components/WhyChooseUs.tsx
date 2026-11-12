import { useRef } from 'react';
import { Award, ShieldCheck, Sparkles, HeartHandshake, MapPin, Plane } from 'lucide-react';
import { useSiteContent } from '../context/siteContentContext';
import { useReveal, stagger } from '../hooks/useReveal';
import '../styles/home.css';

// Icons and colours cycle by position; text comes from the CMS (Homepage → About / Why us).
const reasonStyles = [
  { icon: Award, bg: 'linear-gradient(135deg,#FB923C,#EA580C)', glow: 'rgba(234,88,12,.45)' },
  { icon: ShieldCheck, bg: 'linear-gradient(135deg,#34D399,#059669)', glow: 'rgba(5,150,105,.45)' },
  { icon: Sparkles, bg: 'linear-gradient(135deg,#818CF8,#4F46E5)', glow: 'rgba(79,70,229,.45)' },
  { icon: HeartHandshake, bg: 'linear-gradient(135deg,#F472B6,#DB2777)', glow: 'rgba(219,39,119,.45)' },
];

export default function WhyChooseUs() {
  const { homepage } = useSiteContent();
  const about = homepage.about;
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);
  const count = about.reasons.length;

  return (
    <section ref={sectionRef} className="s-sec s-navy font-tamil" aria-labelledby="highlights-title">
      <div className="h-container">
        <div className="s-head s-head-center rv">
          <span className="s-eyebrow">{about.badge}</span>
          <h2 id="highlights-title" className="s-h2">{about.title}</h2>
          <p className="s-lead">{about.subtitle}</p>
        </div>

        {/* Flight route over the cards (desktop/tablet) */}
        {count > 0 && (
          <div className="hl-route" aria-hidden="true">
            <svg className="hl-line" viewBox="0 0 1000 56" preserveAspectRatio="none">
              <path
                d="M0 28 C 120 4, 250 52, 375 28 S 625 4, 750 28 S 900 52, 1000 28"
                fill="none"
                stroke="rgba(240,180,41,.55)"
                strokeWidth="1.6"
                strokeDasharray="6 8"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {about.reasons.slice(0, 4).map((_, i) => (
              <span key={i} className="hl-pin" style={{ left: `${(100 / Math.min(count, 4)) * (i + 0.5)}%`, animationDelay: `${i * 0.4}s` }}>
                <MapPin className="w-6 h-6 fill-[#F0B429] text-[#F0B429] [&>circle]:fill-[#0F1E3A] [&>circle]:stroke-[#0F1E3A]" />
              </span>
            ))}
            <span className="hl-plane">
              <Plane className="w-4 h-4" />
            </span>
          </div>
        )}

        <div className="hl-grid">
          {about.reasons.map((reason, i) => {
            const st = reasonStyles[i % reasonStyles.length];
            return (
              <div key={`${reason.title}-${i}`} className="hl-card rv" style={stagger(i)}>
                <span className="hl-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="hl-icon" style={{ background: st.bg, boxShadow: `0 12px 24px -10px ${st.glow}` }} aria-hidden="true">
                  <st.icon className="w-6 h-6" />
                </span>
                <h3 className="hl-title">{reason.title}</h3>
                <p className="hl-text">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
