import { Link } from 'react-router-dom';
import { ArrowRight, Bed, Bus, Clock, MapPin, PlayCircle, Utensils } from 'lucide-react';
import HoverImageSlider from './HoverImageSlider';
import { stagger } from '../hooks/useReveal';
import type { PackageView } from '../lib/packageView';

const FEATURE_ICONS = [
  { icon: Bed, label: 'தங்குமிடம்' },
  { icon: Utensils, label: 'உணவு' },
  { icon: Bus, label: 'போக்குவரத்து' },
  { icon: MapPin, label: 'வழிகாட்டி' },
];

/** Tailwind solid tag colour → hex (chip background). */
const TAG_HEX: Record<string, string> = {
  'bg-amber-500': '#D97706',
  'bg-emerald-500': '#059669',
  'bg-blue-500': '#2563EB',
  'bg-rose-500': '#E11D48',
  'bg-violet-500': '#7C3AED',
  'bg-teal-500': '#0D9488',
};

const CONTACT_PRICE = 'தொடர்பு கொள்ளவும்';

interface PackageCardProps {
  pkg: PackageView;
  index?: number;
  /** Enable scroll reveal animation classes (used in static homepage grid, off in live filterable grids). */
  reveal?: boolean;
  /** Cycle through multiple gallery photos on hover/touch. */
  useSlider?: boolean;
}

/** Shared editorial tour package card used on both the homepage and /packages listing. */
export default function PackageCard({ pkg, index = 0, reveal = false, useSlider = false }: PackageCardProps) {
  const gallery = pkg.images?.length ? pkg.images : [pkg.image];
  const hasExplicitPrice = Boolean(pkg.price && pkg.price !== CONTACT_PRICE);
  const inclusionsCount = pkg.inclusions?.length ?? 0;

  return (
    <article className={`pk-card font-tamil ${reveal ? 'rv' : ''}`} style={reveal ? stagger(index) : undefined}>
      <Link to={`/package/${pkg.slug}`} className="pk-media block" aria-label={pkg.title}>
        {useSlider && gallery.length > 1 ? (
          <HoverImageSlider images={gallery} title={pkg.title} />
        ) : (
          <img src={pkg.image} alt={pkg.title} loading="lazy" decoding="async" width={800} height={600} />
        )}
        {pkg.categoryTag && (
          <span className="pk-chip pk-chip-tag" style={{ background: TAG_HEX[pkg.tagColor] ?? '#059669' }}>
            <span>{pkg.categoryTag}</span>
          </span>
        )}
        {pkg.destinationName && (
          <span className="pk-chip pk-chip-cat">
            <span>{pkg.destinationName}</span>
          </span>
        )}
        <span className="pk-chip pk-chip-dur">
          <Clock className="w-3.5 h-3.5 shrink-0 text-[#F0B429]" aria-hidden="true" />
          <span>{pkg.duration}</span>
        </span>
      </Link>

      <div className="pk-body">
        <h3 className="pk-title">
          <Link to={`/package/${pkg.slug}`} className="text-inherit no-underline hover:text-[#1b2e55] transition-colors">
            {pkg.title}
          </Link>
        </h3>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {pkg.placesToVisit && pkg.placesToVisit.length > 0 && (
            <span className="pk-meta">
              <MapPin className="w-3.5 h-3.5 text-[#D99A0B] shrink-0" aria-hidden="true" />
              {pkg.placesToVisit.length} இடங்கள்
            </span>
          )}
          {pkg.startingLocation && (
            <span className="pk-meta">
              · {pkg.startingLocation}
            </span>
          )}
          {pkg.travelVideos?.length > 0 && (
            <span className="pk-meta">
              <PlayCircle className="w-3.5 h-3.5 text-[#D99A0B] shrink-0" aria-hidden="true" />
              Reels
            </span>
          )}
        </div>

        <p className="pk-sub line-clamp-2">{pkg.shortDescription}</p>

        <div className="pk-amen">
          {FEATURE_ICONS.map((f) => (
            <span key={f.label} className="pk-amen-i" title={f.label}>
              <f.icon className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">{f.label}</span>
            </span>
          ))}
          <span className="pk-amen-more">{inclusionsCount > 0 ? `${inclusionsCount} வசதிகள்` : '+மேலும்'}</span>
        </div>

        {hasExplicitPrice && (
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-lg font-extrabold text-[var(--h-navy)]">{pkg.price}</span>
            {pkg.originalPrice && (
              <span className="text-xs text-[var(--h-muted)] line-through">{pkg.originalPrice}</span>
            )}
            {pkg.priceNote && <span className="text-xs text-[var(--h-muted)] truncate">/ {pkg.priceNote}</span>}
          </div>
        )}

        <Link to={`/package/${pkg.slug}`} className="pk-btn">
          <span>விவரங்களைப் பார்க்க</span>
          <span className="pk-btn-arrow" aria-hidden="true">
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </article>
  );
}

