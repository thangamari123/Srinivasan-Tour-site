import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../context/siteContentContext';
import { findPackageBySlug } from '../lib/packageView';
import TravelReelsSection from '../components/TravelReels';
import {
  MapPin, CheckCircle, XCircle, Phone,
  ArrowLeft, Bus, Bed, Compass,
  Calendar, Star, Info, Navigation
} from 'lucide-react';

export default function PackageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { packages, loading, error } = useSiteContent();
  const pkg = slug ? findPackageBySlug(packages, slug) : undefined;

  // If the package was reached through an old slug, move to the canonical URL.
  useEffect(() => {
    if (pkg && slug && pkg.slugHistory.includes(slug) && pkg.slug !== slug) {
      navigate(`/package/${pkg.slug}`, { replace: true });
    }
  }, [pkg, slug, navigate]);

  const [galleryState, setGalleryState] = useState<{ slug?: string; index: number }>({ slug, index: 0 });
  const rawIndex = galleryState.slug === slug ? galleryState.index : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const desc = document.querySelector('meta[name="description"]');
    if (pkg) {
      document.title = `${pkg.title} | Srinivasa Tour Operators`;
      if (desc && pkg.shortDescription) desc.setAttribute('content', pkg.shortDescription);
    } else if (!loading) {
      document.title = 'தொகுப்பு கிடைக்கவில்லை | Srinivasa Tour Operators';
    }
  }, [pkg, loading]);

  const packageImages = pkg?.images && pkg.images.length > 0
    ? pkg.images
    : (slug && imagesByPackage[slug] ? imagesByPackage[slug] : (pkg ? [pkg.image] : []));
  const displayImages = packageImages.length > 0 ? packageImages : ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package1.webp'];
  const activeImageIndex = rawIndex % displayImages.length;
  const activeImage = displayImages[activeImageIndex] || displayImages[0];

  const setActiveImageIndex = (updater: number | ((prev: number) => number)) => {
    setGalleryState((prev) => {
      const base = prev.slug === slug ? prev.index : 0;
      const next = typeof updater === 'function' ? updater(base) : updater;
      return { slug, index: next };
    });
  };

  useEffect(() => {
    if (!pkg || displayImages.length <= 1) return;

    const interval = setInterval(() => {
      setGalleryState((prev) => {
        const base = prev.slug === slug ? prev.index : 0;
        return { slug, index: (base + 1) % displayImages.length };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [pkg, slug, displayImages.length]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen pb-24 pt-28" aria-busy="true">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-4 w-24 bg-gray-200 rounded mb-6" />
          <div className="h-6 w-28 bg-gray-200 rounded-full mb-3" />
          <div className="h-9 w-3/4 bg-gray-200 rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-[2048/1365] w-full rounded-3xl bg-gray-200" />
              <div className="flex gap-4">
                {[0, 1, 2, 3].map((i) => <div key={i} className="w-24 h-20 sm:w-32 sm:h-24 rounded-2xl bg-gray-200" />)}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-64 rounded-3xl bg-gray-200" />
              <div className="h-40 rounded-3xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <h1 className="font-tamil text-2xl font-bold text-navy-950 mb-4">{error}</h1>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy-600 text-white font-semibold rounded-xl font-tamil"
          >
            மீண்டும் முயற்சிக்கவும்
          </button>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="font-tamil text-3xl font-bold text-navy-950 mb-4">தொகுப்பு கிடைக்கவில்லை</h1>
          <p className="font-tamil text-gray-500 mb-6">தவறான இணைப்பு அல்லது தொகுப்பு நீக்கப்பட்டிருக்கலாம்</p>
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy-600 text-white font-semibold rounded-xl font-tamil"
          >
            <ArrowLeft className="w-4 h-4" />
            தொகுப்புகளுக்கு திரும்பு
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-slate-50 min-h-screen text-navy-950 font-sans pb-24 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 py-2 -my-2 text-gray-500 hover:text-navy-600 transition-colors font-tamil mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          திரும்ப செல்க
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <span className="inline-block px-3 py-1 bg-navy-50 text-navy-600 text-xs sm:text-sm font-bold rounded-full font-tamil mb-2 sm:mb-3">
            {pkg.duration}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy-950 mb-3 sm:mb-4 font-tamil">
            {pkg.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-tamil text-gray-600">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              <MapPin className="w-4 h-4 text-navy-600" />
              {pkg.categoryTag}
            </span>
            <div className="flex items-center gap-1">
              <div className="flex items-center text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-gray-500 ml-1">(120+ Reviews)</span>
            </div>
          </div>
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">

            {/* Hero Gallery */}
            <div className="space-y-4">
              <div className="aspect-[2048/1365] w-full rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100 relative group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    src={activeImage}
                    alt={pkg.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = pkg.image || 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package1.webp';
                    }}
                  />
                </AnimatePresence>

              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-24 h-20 sm:w-32 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${activeImageIndex === idx ? 'border-navy-600 ring-2 ring-navy-50' : 'border-transparent opacity-60 hover:opacity-100 hover:border-navy-600/50'}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = pkg.image || 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package1.webp';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Info Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
              <div className="bg-white px-4 py-3 sm:p-4 rounded-2xl border border-[var(--color-line)] flex flex-row sm:flex-col items-center sm:justify-center text-left sm:text-center gap-3 sm:gap-2 shadow-[var(--shadow-card)] hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 shrink-0 rounded-full bg-navy-50 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-navy-600" />
                </div>
                <span className="text-sm sm:text-xs text-gray-500 font-tamil">பயண வகை</span>
                <span className="ml-auto sm:ml-0 text-sm font-bold text-navy-950 font-tamil text-right sm:text-center">{pkg.categoryTag}</span>
              </div>
              <div className="bg-white px-4 py-3 sm:p-4 rounded-2xl border border-[var(--color-line)] flex flex-row sm:flex-col items-center sm:justify-center text-left sm:text-center gap-3 sm:gap-2 shadow-[var(--shadow-card)] hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 shrink-0 rounded-full bg-navy-50 flex items-center justify-center">
                  <Bed className="w-5 h-5 text-navy-600" />
                </div>
                <span className="text-sm sm:text-xs text-gray-500 font-tamil">தங்குமிடம்</span>
                <span className="ml-auto sm:ml-0 text-sm font-bold text-navy-950 font-tamil text-right sm:text-center">தங்கும் விடுதி</span>
              </div>
              <div className="bg-white px-4 py-3 sm:p-4 rounded-2xl border border-[var(--color-line)] flex flex-row sm:flex-col items-center sm:justify-center text-left sm:text-center gap-3 sm:gap-2 shadow-[var(--shadow-card)] hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 shrink-0 rounded-full bg-navy-50 flex items-center justify-center">
                  <Bus className="w-5 h-5 text-navy-600" />
                </div>
                <span className="text-sm sm:text-xs text-gray-500 font-tamil">போக்குவரத்து</span>
                <span className="ml-auto sm:ml-0 text-sm font-bold text-navy-950 font-tamil text-right sm:text-center">A/C பேருந்து</span>
              </div>
            </div>

            {/* Places to Visit (பார்க்கும் இடங்கள்) */}
            {pkg.placesToVisit && pkg.placesToVisit.length > 0 && (
              <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-tamil text-navy-950">பார்க்கும் இடங்கள் (Places to Visit)</h2>
                    <p className="text-gray-500 text-xs sm:text-sm font-tamil">இந்த சுற்றுலாவில் நீங்கள் காணக்கூடிய முக்கிய தலங்கள் & இடங்கள்</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  {pkg.placesToVisit.map((place, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-gradient-to-r from-navy-50/50 to-emerald-50/30 p-3.5 sm:p-4 rounded-xl border border-navy-600/15 hover:border-navy-600/40 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 mt-0.5 text-navy-600 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <span className="font-tamil text-navy-950 font-medium leading-relaxed text-sm sm:text-base">{place}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Overview: full description, start point & destination (admin-managed) */}
            {(pkg.startingLocation || pkg.destinationName) && (
              <div className="flex flex-wrap gap-3 text-sm font-tamil text-gray-600">
                {pkg.startingLocation && (
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                    <Navigation className="w-4 h-4 text-navy-600" />
                    புறப்படும் இடம்: <strong className="text-navy-950">{pkg.startingLocation}</strong>
                  </span>
                )}
                {pkg.destinationName && (
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                    <MapPin className="w-4 h-4 text-navy-600" />
                    {pkg.destinationName}
                  </span>
                )}
              </div>
            )}

            {/* Day-wise Itinerary */}
            {pkg.itinerary.length > 0 && (
              <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold font-tamil text-navy-950">பயணத் திட்டம் (Itinerary)</h2>
                </div>
                <ol className="relative border-l-2 border-navy-600/20 ml-3 space-y-6">
                  {pkg.itinerary.map((day, idx) => (
                    <li key={idx} className="ml-6">
                      <span className="absolute -left-[13px] flex items-center justify-center w-6 h-6 rounded-full bg-navy-600 text-white text-xs font-bold">
                        {day.day || idx + 1}
                      </span>
                      <h3 className="font-tamil font-bold text-navy-950 text-base sm:text-lg">
                        நாள் {day.day || idx + 1}{day.title ? ` – ${day.title}` : ''}
                      </h3>
                      {day.description && (
                        <p className="font-tamil text-gray-600 text-sm sm:text-base leading-relaxed mt-1 whitespace-pre-line">{day.description}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Important Information */}
            {pkg.importantInfo && (
              <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Info className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold font-tamil text-navy-950">முக்கிய தகவல்கள்</h2>
                </div>
                <p className="font-tamil text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">{pkg.importantInfo}</p>
              </section>
            )}

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1 space-y-6 relative">

            <div className="sticky top-28 space-y-6">
              {/* Price Card */}
              <div className="bg-white p-6 rounded-3xl shadow-lg shadow-black/5 border border-gray-100">
                <div className="mb-6 pb-6 border-b border-gray-100 text-center">
                  <p className="text-gray-500 text-sm mb-1 font-tamil">தொகுப்பு விலை</p>
                  {pkg.originalPrice && (
                    <p className="text-base text-gray-400 line-through font-tamil">{pkg.originalPrice}</p>
                  )}
                  <h3 className="text-3xl font-bold text-navy-600 font-tamil">{pkg.price}</h3>
                  <p className="text-xs text-gray-400 mt-2 font-tamil">{pkg.priceNote}</p>
                </div>
                <div className="space-y-3">
                  <a href="tel:+919384854560" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-gold-400 to-gold-500 text-navy-950 py-3.5 rounded-xl font-bold hover:from-gold-300 hover:to-gold-400 shadow-md shadow-gold-500/20 transition-all hover:scale-[1.02] transform duration-300 shadow-md shadow-navy-600/20 font-tamil">
                    <Phone className="w-4 h-4" />
                    இப்போதே அழைக்கவும்
                  </a>
                  <Link to="/contact" className="flex items-center justify-center gap-2 w-full border border-navy-600 text-navy-600 py-3.5 rounded-xl font-bold hover:bg-navy-50 transition-colors font-tamil">
                    விசாரனை அனுப்புங்கள்
                  </Link>
                </div>
              </div>

              {/* Inclusions */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 font-tamil text-navy-950">உள்ளடக்கங்கள் (Includes)</h3>
                <ul className="space-y-3">
                  {pkg.inclusions.map(inc => (
                    <li key={inc} className="flex items-start gap-3 text-sm font-tamil text-gray-600">
                      <CheckCircle className="w-5 h-5 text-navy-600 shrink-0" />
                      <span className="mt-0.5">{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 font-tamil text-navy-950">உள்ளடக்கம் அல்லாதவை (Excludes)</h3>
                <ul className="space-y-3">
                  {pkg.exclusions.map(exc => (
                    <li key={exc} className="flex items-start gap-3 text-sm font-tamil text-gray-500">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <span className="mt-0.5">{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Card */}
              <div className="bg-navy-50 p-6 rounded-3xl shadow-sm border border-navy-600/10 text-center">
                <h3 className="text-lg font-bold text-navy-600 mb-1 font-tamil">உதவி தேவையா?</h3>
                <p className="text-sm text-navy-600/80 mb-5 font-tamil">அழைக்க அல்லது WhatsApp செய்யவும்</p>
                <a href="tel:+919384854560" className="inline-flex items-center justify-center gap-2 text-xl font-bold text-navy-950 mb-5 hover:text-navy-600 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Phone className="w-5 h-5 text-navy-600" />
                  </div>
                  +91 93848 54560
                </a>
                <a
                  href={`https://wa.me/919384854560?text=${encodeURIComponent(`வணக்கம்! "${pkg.title}" (${pkg.duration}) சுற்றுலா பற்றிய விவரங்கள் வேண்டும்.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-white text-navy-600 py-3 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all font-tamil border border-white hover:border-navy-600/20"
                >
                  WhatsApp Us
                </a>
              </div>



            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Travel Reels (YouTube Shorts managed in the admin panel; hidden when none) */}
      <TravelReelsSection videos={pkg.travelVideos} className="bg-white border-t border-gray-200 mt-20 py-20" />
    </div>
  );
}

const imagesByPackage: Record<string, string[]> = {
  'tirupathi-yathirai': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_tirupati.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/pilgrimage.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package1.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery1.webp'],
  'rameswaram-yathirai': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_rameswaram.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package6.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery2.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/pilgrimage.webp'],
  'varanasi-yathirai': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_varanasi.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package1.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery3.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/hero-bg.webp'],
  'srirangam-yathirai': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_srirangam.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/pilgrimage.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery4.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package6.webp'],
  'kerala-nature-tour': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_kerala.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/india-tour.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery5.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package2.webp'],
  'goa-beach-tour': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_goa.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package2.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery6.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/india-tour.webp'],
  'rajasthan-palace-tour': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_rajasthan.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery2.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery1.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package3.webp'],
  'himachal-mountain-tour': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_himachal.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery4.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery5.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/india-tour.webp'],
  'singapore-malaysia-tour': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_singapore.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package3.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package5.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/international-tour.webp'],
  'singapore-malaysia-6-days': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_singapore.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package3.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package5.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/international-tour.webp'],
  'dubai-tour': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_dubai.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/international-tour.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package4.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery2.webp'],
  'dubai-tour-4-days': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_dubai.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/international-tour.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package4.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery2.webp'],
  'maldives-tour': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_maldives.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package4.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery6.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery5.webp'],
  'bali-thailand-tour': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/destinations/gen_bali.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package5.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery3.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/international-tour.webp'],
  'thailand-bangkok-pattaya-4-days': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package5.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery3.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/international-tour.webp'],
  'thailand-bangkok-pattaya-5-days': ['https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package5.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery3.webp', 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/international-tour.webp'],
};
