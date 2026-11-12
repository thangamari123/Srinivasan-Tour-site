import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Phone, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { useSiteContent } from '../context/siteContentContext';
import { PackageGridSkeleton } from '../components/PackageCardSkeleton';
import PackageCard from '../components/PackageCard';
import { resolveMediaUrl } from '../lib/r2Media';
import '../styles/home.css';

type SortMode = 'recommended' | 'durationAsc' | 'durationDesc' | 'priceAsc';

function parsePriceNumber(price: string): number {
  const digits = price.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : Number.MAX_SAFE_INTEGER;
}

function parseDaysNumber(duration: string): number {
  const m = /\d+/.exec(duration);
  return m ? parseInt(m[0], 10) : 0;
}

export default function Packages() {
  const { packages: allPackages, categories, destinations, homepage, loading, error } = useSiteContent();
  const [searchParams, setSearchParams] = useSearchParams();

  const destinationSlug = searchParams.get('destination') ?? '';
  const categoryParam = searchParams.get('category') ?? 'all';
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '');
  const [categoryFilter, setCategoryFilter] = useState(() => categoryParam || 'all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortMode>('recommended');

  const activeDestination = destinations.find((d) => d.slug === destinationSlug);
  const heroBg = resolveMediaUrl('https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package3.webp');

  const categoryTabs = useMemo(() => {
    const counts = new Map<string, { slug: string; name: string; count: number }>();
    allPackages.forEach((pkg) => {
      if (!pkg.category) return;
      const existing = counts.get(pkg.category);
      if (existing) existing.count += 1;
      else counts.set(pkg.category, { slug: pkg.category, name: pkg.categoryTag || pkg.category, count: 1 });
    });
    const ordered: { slug: string; name: string; count: number }[] = [];
    categories.forEach((cat) => {
      const hit = counts.get(cat.slug);
      if (hit) ordered.push(hit);
    });
    counts.forEach((val, key) => {
      if (!ordered.some((o) => o.slug === key)) ordered.push(val);
    });
    return ordered;
  }, [allPackages, categories]);

  const currentPackages = useMemo(() => {
    const filtered = allPackages.filter((pkg) => {
      if (destinationSlug && pkg.destinationSlug !== destinationSlug) return false;
      if (categoryFilter !== 'all' && pkg.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const match = [
          pkg.title,
          pkg.shortDescription,
          pkg.slug,
          pkg.categoryTag,
          pkg.destinationName,
          pkg.startingLocation,
          ...(pkg.placesToVisit ?? []),
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query));
        if (!match) return false;
      }

      if (durationFilter !== 'all') {
        const days = parseDaysNumber(pkg.duration);
        if (days > 0) {
          if (durationFilter === 'short' && days > 5) return false;
          if (durationFilter === 'medium' && (days < 6 || days > 10)) return false;
          if (durationFilter === 'long' && days < 11) return false;
        }
      }

      return true;
    });

    if (sortBy === 'recommended') return filtered;
    return [...filtered].sort((a, b) => {
      if (sortBy === 'durationAsc') return parseDaysNumber(a.duration) - parseDaysNumber(b.duration);
      if (sortBy === 'durationDesc') return parseDaysNumber(b.duration) - parseDaysNumber(a.duration);
      return parsePriceNumber(a.price) - parsePriceNumber(b.price);
    });
  }, [allPackages, destinationSlug, categoryFilter, searchQuery, durationFilter, sortBy]);

  const hasActiveFilters = Boolean(searchQuery.trim() || destinationSlug || categoryFilter !== 'all' || durationFilter !== 'all' || sortBy !== 'recommended');

  const updateDestination = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('destination', slug);
    else next.delete('destination');
    setSearchParams(next, { replace: true });
  };

  const updateCategory = (slug: string) => {
    setCategoryFilter(slug);
    const next = new URLSearchParams(searchParams);
    if (slug && slug !== 'all') next.set('category', slug);
    else next.delete('category');
    setSearchParams(next, { replace: true });
  };

  const resetAll = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDurationFilter('all');
    setSortBy('recommended');
    setSearchParams({}, { replace: true });
  };

  return (
    <>
      {/* Editorial Navy Header */}
      <section className="relative pt-32 pb-16 sm:pt-36 sm:pb-20 bg-[var(--h-navy)] overflow-hidden font-tamil">
        <div className="absolute inset-0">
          <img src={heroBg} alt="சுற்றுலா தொகுப்புகள்" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1e3a]/85 via-[#0f1e3a]/90 to-[#0f1e3a]" />
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[540px] h-[280px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(240, 180, 41, 0.16), transparent 70%)' }}
          />
        </div>

        <div className="relative h-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span className="s-eyebrow s-eyebrow-navy">சுற்றுலா தொகுப்புகள்</span>
            <h1 className="mt-4 font-tamil text-[1.85rem] leading-tight min-[375px]:text-3xl sm:text-5xl font-extrabold text-white text-balance [overflow-wrap:anywhere]">
              {activeDestination ? `${activeDestination.name} சுற்றுலா தொகுப்புகள்` : 'உங்களுக்கான சிறந்த பயணத் தொகுப்புகள்'}
            </h1>
            <p className="mt-3 sm:mt-4 text-white/75 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              புனித யாத்திரை, இந்திய சுற்றுலா மற்றும் வெளிநாட்டுப் பயணங்கள் – முழுமையான ஏற்பாடுகளுடன் உங்கள் விருப்பத்தைத் தேர்ந்தெடுங்கள்.
            </p>

            {!loading && allPackages.length > 0 && (
              <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/85">
                <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
                  <strong className="text-[var(--h-gold)] font-bold">{allPackages.length}</strong> தொகுப்புகள்
                </span>
                {destinations.length > 0 && (
                  <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
                    <strong className="text-[var(--h-gold)] font-bold">{destinations.length}</strong> முக்கிய இடங்கள்
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Listing Section (matches homepage ivory canvas + .pk-card editorial grid) */}
      <section className="s-sec s-ivory !pt-10 sm:!pt-14 font-tamil" aria-label="சுற்றுலா தொகுப்புகள் பட்டியல்">
        <div className="h-container">
          {/* Category Pills matching FeaturedPackages */}
          {!loading && categoryTabs.length > 1 && (
            <div className="flex justify-start sm:justify-center mb-6">
              <div className="pk-tabs !mb-0" role="group" aria-label="பிரிவு அடிப்படையில் தேடுக">
                <button
                  type="button"
                  className="pk-tab"
                  aria-pressed={categoryFilter === 'all'}
                  onClick={() => updateCategory('all')}
                >
                  அனைத்தும் ({allPackages.length})
                </button>
                {categoryTabs.map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    className="pk-tab"
                    aria-pressed={categoryFilter === t.slug}
                    onClick={() => updateCategory(t.slug)}
                  >
                    {t.name} ({t.count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter & Search Toolbar */}
          <div className="rounded-[22px] bg-white border border-[var(--s-line)] shadow-[0_8px_28px_-16px_rgba(15,30,58,0.18)] p-4 sm:p-5 mb-8 sm:mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--h-muted)] pointer-events-none" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="பெயர், ஊர் அல்லது கோவில் தேடுக..."
                  aria-label="சுற்றுலா தொகுப்புகளைத் தேடுங்கள்"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-9 rounded-xl bg-[var(--h-ivory)] border border-[var(--s-line)] focus:border-[var(--h-gold)] focus:bg-white focus:outline-none text-sm text-[var(--h-navy)] placeholder:text-[var(--h-muted)] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="தேடலை அழி"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--h-muted)] hover:text-[var(--h-navy)] hover:bg-black/5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Destination Filter */}
              <select
                value={destinationSlug}
                onChange={(e) => updateDestination(e.target.value)}
                aria-label="இடத்தைத் தேர்ந்தெடுக்கவும்"
                className="h-11 px-3.5 rounded-xl bg-[var(--h-ivory)] border border-[var(--s-line)] focus:border-[var(--h-gold)] focus:bg-white focus:outline-none text-sm text-[var(--h-navy)] cursor-pointer"
              >
                <option value="">அனைத்து இடங்களும்</option>
                {destinations.map((dest) => (
                  <option key={dest.id} value={dest.slug}>
                    {dest.name}
                  </option>
                ))}
              </select>

              {/* Duration Filter */}
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                aria-label="பயண நாட்கள்"
                className="h-11 px-3.5 rounded-xl bg-[var(--h-ivory)] border border-[var(--s-line)] focus:border-[var(--h-gold)] focus:bg-white focus:outline-none text-sm text-[var(--h-navy)] cursor-pointer"
              >
                <option value="all">அனைத்து நாட்கள்</option>
                <option value="short">குறுகிய பயணம் (1 – 5 நாட்கள்)</option>
                <option value="medium">நடுத்தரப் பயணம் (6 – 10 நாட்கள்)</option>
                <option value="long">நீண்ட பயணம் (11+ நாட்கள்)</option>
              </select>

              {/* Sort Order */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortMode)}
                aria-label="வரிசைப்படுத்து"
                className="h-11 px-3.5 rounded-xl bg-[var(--h-ivory)] border border-[var(--s-line)] focus:border-[var(--h-gold)] focus:bg-white focus:outline-none text-sm text-[var(--h-navy)] cursor-pointer"
              >
                <option value="recommended">வரிசை: பரிந்துரைக்கப்பட்டவை</option>
                <option value="durationAsc">நாட்கள்: குறைவு முதல் அதிகம்</option>
                <option value="durationDesc">நாட்கள்: அதிகம் முதல் குறைவு</option>
                <option value="priceAsc">விலை: குறைவு முதல் அதிகம்</option>
              </select>
            </div>

            {/* Results summary & active filter pills */}
            <div className="mt-3.5 pt-3.5 border-t border-[var(--s-line)] flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-2 text-[var(--h-muted)]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--h-navy)]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#D99A0B]" aria-hidden="true" />
                  {loading ? 'தொகுப்புகள் ஏற்றப்படுகின்றன...' : `${currentPackages.length} தொகுப்புகள் காணப்படுகின்றன`}
                </span>
                {activeDestination && (
                  <button
                    type="button"
                    onClick={() => updateDestination('')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--h-gold-soft)] border border-[var(--h-gold-border)] text-[var(--h-gold-text-2)] font-semibold hover:bg-[#ffeaa8]"
                  >
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    {activeDestination.name}
                    <X className="w-3 h-3 ml-0.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[var(--h-navy)] bg-[var(--h-grey)] hover:bg-[#e1e6f0] transition-colors"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  அனைத்தையும் நீக்க
                </button>
              )}
            </div>
          </div>

          {/* Packages Grid */}
          {loading ? (
            <PackageGridSkeleton count={6} className="pk-packages-grid" />
          ) : error ? (
            <div className="rounded-3xl bg-white border border-[var(--s-line)] p-10 text-center max-w-xl mx-auto">
              <h3 className="text-xl font-bold text-[var(--h-navy)] mb-2">{error}</h3>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--h-navy)] text-white text-sm font-bold hover:bg-[#1b2e55] transition-colors"
              >
                மீண்டும் முயற்சிக்கவும்
              </button>
            </div>
          ) : currentPackages.length > 0 ? (
            <div className="pk-grid pk-packages-grid">
              {currentPackages.map((pkg, index) => (
                <PackageCard key={pkg.id || pkg.slug} pkg={pkg} index={index} useSlider />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-[var(--s-line)] py-16 px-6 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-[var(--h-ivory)] text-[var(--h-navy)] flex items-center justify-center mx-auto mb-5">
                <Search className="w-7 h-7 opacity-60" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-[var(--h-navy)] mb-2">தொகுப்புகள் கிடைக்கவில்லை</h3>
              <p className="text-sm text-[var(--h-muted)] leading-relaxed">
                உங்கள் தேடலுக்கு ஏற்ற சுற்றுலா தொகுப்புகள் தற்போது இல்லை. வடிகட்டிகளை மாற்றி மீண்டும் முயற்சிக்கவும்.
              </p>
              <button
                type="button"
                onClick={resetAll}
                className="mt-6 pk-btn !mt-6 inline-flex w-auto mx-auto"
              >
                <span>அனைத்து தொகுப்புகளையும் காண்க</span>
                <span className="pk-btn-arrow" aria-hidden="true">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          )}

          {/* Custom Tour Enquiry Strip */}
          {!loading && !error && (
            <div className="mt-14 sm:mt-16 rounded-3xl bg-[var(--h-navy)] text-white p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="s-eyebrow s-eyebrow-navy">தனிப்பயன் சுற்றுலா திட்டம்</span>
                <h2 className="mt-3 text-xl sm:text-2xl font-extrabold leading-snug">
                  உங்கள் குடும்பம் அல்லது குழுவிற்கு பிரத்யேக பயணத் திட்டம் வேண்டுமா?
                </h2>
                <p className="mt-2 text-sm text-white/75 leading-relaxed">
                  உங்கள் தேதி, நபர்களின் எண்ணிக்கை மற்றும் விருப்பத்திற்கேற்ப சிறந்த தொகுப்பை நாங்கள் வடிவமைத்துத் தருகிறோம்.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href={`tel:${(homepage.cta?.phone || '+919944171722').replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[var(--h-gold)] text-[var(--h-navy)] font-bold text-sm hover:bg-[#f5c44c] transition-colors"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  இப்போது அழைக்கவும்
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
                >
                  <span>தொடர்பு கொள்ள</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
