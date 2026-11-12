import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSiteContent } from '../context/siteContentContext';
import { PackageGridSkeleton } from './PackageCardSkeleton';
import PackageCard from './PackageCard';
import { useReveal } from '../hooks/useReveal';
import type { PackageView } from '../lib/packageView';
import '../styles/home.css';

export default function FeaturedPackages() {
  const { packages: allActive, homepage, loading, error } = useSiteContent();
  const section = homepage.featured;
  const [filter, setFilter] = useState('all');
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  // Manually curated list (in admin-defined order) or, if empty, packages flagged "featured".
  const packages = useMemo(() => {
    const byId = new Map(allActive.map((p) => [p.id, p]));
    const curated = (section.packageIds ?? []).map((id) => byId.get(id)).filter(Boolean) as PackageView[];
    return (curated.length ? curated : allActive.filter((p) => p.featured)).slice(0, section.limit || 8);
  }, [allActive, section.packageIds, section.limit]);

  // Filter tabs: only the categories that actually appear among the featured packages.
  const tabs = useMemo(() => {
    const seen = new Map<string, string>();
    packages.forEach((p) => p.category && !seen.has(p.category) && seen.set(p.category, p.categoryTag));
    return [...seen].map(([key, label]) => ({ key, label }));
  }, [packages]);
  const visible = filter === 'all' ? packages : packages.filter((p) => p.category === filter);

  if (!section.enabled) return null;
  // Nothing to feature (and not loading/erroring): hide the section instead of showing an empty block.
  if (!loading && !error && packages.length === 0) return null;

  const viewAll = (extra: string) => (
    <Link to="/packages" className={`pk-all ${extra}`}>
      <span>அனைத்து தொகுப்புகளையும் பார்க்க</span>
      <span className="pk-all-arrow" aria-hidden="true">
        <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );

  return (
    <section ref={sectionRef} className="s-sec s-white font-tamil" aria-labelledby="featured-title">
      <div className="h-container">
        <div className="s-head rv">
          <div>
            <span className="s-eyebrow">{section.badge}</span>
            <h2 id="featured-title" className="s-h2">{section.title}</h2>
            <p className="s-lead">{section.subtitle}</p>
          </div>
          <div className="pk-head-link">{viewAll('')}</div>
        </div>

        {tabs.length > 1 && !loading && !error && (
          <div className="pk-tabs" role="group" aria-label="Filter packages">
            <button type="button" className="pk-tab" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
              அனைத்தும்
            </button>
            {tabs.map((t) => (
              <button key={t.key} type="button" className="pk-tab" aria-pressed={filter === t.key} onClick={() => setFilter(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {loading && <PackageGridSkeleton count={3} />}
        {error && !loading && <p className="pk-empty">{error}</p>}

        {!loading && !error && (
          <div className="pk-grid s-rail">
            {visible.map((pkg, index) => (
              <PackageCard key={pkg.slug} pkg={pkg} index={index} reveal />
            ))}
          </div>
        )}

        {viewAll('pk-all-mobile')}
      </div>
    </section>
  );
}
