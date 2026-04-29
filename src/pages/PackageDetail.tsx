import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPackageBySlug } from '../data/packages';
import {
  Clock, MapPin, CheckCircle, XCircle, Phone,
  ArrowLeft, ArrowRight, Bus, Bed, Utensils, Compass,
  Calendar, Star, Shield, ChevronLeft, ChevronRight, X, Play, Pause, Volume2, VolumeX, Download
} from 'lucide-react';

export default function PackageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const pkg = slug ? getPackageBySlug(slug) : undefined;

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center">
          <h1 className="font-tamil text-3xl font-bold text-navy-950 mb-4">தொகுப்பு கிடைக்கவில்லை</h1>
          <p className="font-tamil text-navy-600/60 mb-6">தவறான இணைப்பு அல்லது தொகுப்பு நீக்கப்பட்டிருக்கலாம்</p>
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-navy-400 to-navy-600 text-white font-semibold rounded-xl font-tamil"
          >
            <ArrowLeft className="w-4 h-4" />
            தொகுப்புகளுக்கு திரும்பு
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-24 bg-navy-950 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={pkg.image}
            alt={pkg.title}
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/85 to-navy-950" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm mb-8"
          >
            <Link to="/" className="text-white/50 hover:text-gold-400 font-tamil transition-colors">முகப்பு</Link>
            <span className="text-white/30">/</span>
            <Link to="/packages" className="text-white/50 hover:text-gold-400 font-tamil transition-colors">தொகுப்புகள்</Link>
            <span className="text-white/30">/</span>
            <span className="text-gold-400 font-tamil">{pkg.title}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <span className={`inline-block px-3 py-1 ${pkg.tagColor} text-white text-xs font-bold rounded-full font-tamil mb-4`}>
                {pkg.categoryTag}
              </span>
              <h1 className="font-tamil text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                {pkg.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm rounded-xl font-tamil">
                  <Clock className="w-4 h-4 text-gold-400" />
                  {pkg.duration}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm rounded-xl font-tamil">
                  <MapPin className="w-4 h-4 text-gold-400" />
                  {pkg.categoryTag} தொகுப்பு
                </span>
              </div>
              <p className="font-tamil text-white/70 text-lg leading-relaxed max-w-2xl">
                {pkg.fullDescription}
              </p>
            </motion.div>

            {/* Right - Booking Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="p-5 sm:p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 mb-3">
                    <Phone className="w-7 h-7 sm:w-8 sm:h-8 text-navy-950" />
                  </div>
                  <p className="font-tamil text-white font-bold text-lg">இப்போதே பதிவு செய்யுங்கள்</p>
                  <p className="font-tamil text-white/50 text-sm mt-1">சிறந்த விலைக்கு எங்களை தொடர்பு கொள்ளுங்கள்</p>
                </div>
                <a
                  href="tel:+919123456789"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-gold-400 to-gold-500 text-navy-950 font-bold text-base rounded-2xl hover:from-gold-300 hover:to-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105 font-tamil mb-3"
                >
                  <Phone className="w-5 h-5" />
                  இப்போதே அழைக்கவும்
                </a>
                <Link
                  to="/contact"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-white/10 text-white font-bold text-base rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 font-tamil"
                >
                  விசாரனை அனுப்புங்கள்
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Highlights & Details */}
      <section className="py-16 bg-navy-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-white shadow-lg shadow-navy-950/5 border border-navy-100/30"
              >
                <h2 className="font-tamil text-2xl font-bold text-navy-950 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center">
                    <Star className="w-5 h-5 text-navy-950" />
                  </div>
                  சிறப்பம்சங்கள்
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pkg.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="font-tamil text-navy-700 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Itinerary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-white shadow-lg shadow-navy-950/5 border border-navy-100/30"
              >
                <h2 className="font-tamil text-2xl font-bold text-navy-950 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-400 to-navy-600 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-white" />
                  </div>
                  பயண அட்டவணை
                </h2>
                <div className="space-y-0">
                  {pkg.itinerary.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-400 to-navy-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>
                        {index < pkg.itinerary.length - 1 && (
                          <div className="w-0.5 h-full bg-navy-200 my-1" />
                        )}
                      </div>
                      {/* Content */}
                      <div className={`pb-8 ${index === pkg.itinerary.length - 1 ? 'pb-0' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-tamil text-navy-400 text-xs font-semibold">{item.day}</span>
                        </div>
                        <h3 className="font-tamil text-navy-950 font-bold text-base mb-1">{item.title}</h3>
                        <p className="font-tamil text-navy-600/60 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Inclusions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-3xl bg-white shadow-lg shadow-navy-950/5 border border-navy-100/30"
              >
                <h3 className="font-tamil text-lg font-bold text-navy-950 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  உள்ளடக்கங்கள்
                </h3>
                <ul className="space-y-3">
                  {pkg.inclusions.map((item) => {
                    const iconMap: Record<string, typeof Bus> = {
                      'போக்குவரத்து': Bus,
                      'விமானம்': Bus,
                      'தங்குமிடம்': Bed,
                      'ரிசோர்ட்': Bed,
                      'உணவு': Utensils,
                    };
                    const Icon = iconMap[item] || CheckCircle;
                    return (
                      <li key={item} className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-tamil text-navy-700 text-sm">{item}</span>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>

              {/* Exclusions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-3xl bg-white shadow-lg shadow-navy-950/5 border border-navy-100/30"
              >
                <h3 className="font-tamil text-lg font-bold text-navy-950 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  உள்ளடக்கம் அல்லாதவை
                </h3>
                <ul className="space-y-3">
                  {pkg.exclusions.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <XCircle className="w-4 h-4 text-red-300 shrink-0" />
                      <span className="font-tamil text-navy-600/60 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Quick Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 border border-white/10"
              >
                <h3 className="font-tamil text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gold-400" />
                  முக்கிய தகவல்
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                    <span className="font-tamil text-white/70 text-sm">{pkg.duration}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gold-400 shrink-0" />
                    <span className="font-tamil text-white/70 text-sm">தினமும் புறப்படுகிறது</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bus className="w-4 h-4 text-gold-400 shrink-0" />
                    <span className="font-tamil text-white/70 text-sm">முழு போக்குவரத்து</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bed className="w-4 h-4 text-gold-400 shrink-0" />
                    <span className="font-tamil text-white/70 text-sm">உயர்தர தங்குமிடம்</span>
                  </div>
                </div>
              </motion.div>

              {/* CTA */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-gold-400 to-gold-500 text-center">
                <p className="font-tamil text-navy-950 font-bold text-lg mb-2">இப்போதே பதிவு செய்யுங்கள்!</p>
                <p className="font-tamil text-navy-950/70 text-sm mb-4">உங்கள் இடத்தை உறுதி செய்ய எங்களை தொடர்பு கொள்ளுங்கள்</p>
                <a
                  href="tel:+919123456789"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-navy-950 text-gold-400 font-bold text-sm rounded-xl hover:bg-navy-800 transition-colors font-tamil"
                >
                  <Phone className="w-4 h-4" />
                  +91 91234 56789
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery - Sliding Carousel */}
      <section className="py-16 bg-navy-950 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-gold-400/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-navy-400/5 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-semibold rounded-full font-tamil mb-4">
              புகைப்படங்கள்
            </span>
            <h2 className="font-tamil text-2xl sm:text-3xl font-bold text-white">
              பயண புகைப்படங்கள்
            </h2>
          </motion.div>

          {/* Carousel */}
          <GalleryCarousel images={pkg.images} title={pkg.title} />
        </div>
      </section>

      {/* Video Reels Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-navy-400/10 text-navy-400 text-sm font-semibold rounded-full font-tamil mb-4">
              வீடியோக்கள்
            </span>
            <h2 className="font-tamil text-2xl sm:text-3xl font-bold text-navy-950 mb-3">
              பயண வீடியோக்கள்
            </h2>
            <p className="font-tamil text-navy-600/60 text-base max-w-xl mx-auto">
              எங்கள் பயணிகளின் நிஜமான அனுபவங்களை வீடியோவில் காணுங்கள்
            </p>
          </motion.div>

          <VideoReels category={pkg.category} />
        </div>
      </section>

      {/* Back Button */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy-950 text-white font-semibold text-sm rounded-xl hover:bg-navy-400 transition-colors font-tamil"
          >
            <ArrowLeft className="w-4 h-4" />
            திரும்ப செல்க
          </button>
        </div>
      </section>
    </>
  );
}

/* ─── Gallery Carousel Component ─── */
function GalleryCarousel({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const total = images.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  // Get visible images: previous, current, next
  const getVisible = () => {
    const prevIdx = (current - 1 + total) % total;
    const nextIdx = (current + 1) % total;
    return [
      { src: images[prevIdx], idx: prevIdx, position: 'prev' as const },
      { src: images[current], idx: current, position: 'current' as const },
      { src: images[nextIdx], idx: nextIdx, position: 'next' as const },
    ];
  };

  return (
    <>
      {/* Main Carousel */}
      <div className="relative">
        {/* Desktop: 3 cards (prev | current | next) */}
        <div className="hidden sm:flex items-center justify-center gap-4">
          {getVisible().map((item) => (
            <div
              key={`${item.idx}-${item.position}`}
              className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
                item.position === 'current'
                  ? 'w-[55%] h-80 shadow-2xl shadow-gold-500/10 border-2 border-gold-400/30 scale-100 z-10'
                  : 'w-[22%] h-64 shadow-lg shadow-navy-950/20 border border-white/10 opacity-50 scale-95 z-0 hover:opacity-70'
              }`}
              onClick={() => {
                if (item.position === 'current') {
                  setLightbox(item.src);
                } else if (item.position === 'prev') {
                  prev();
                } else {
                  next();
                }
              }}
            >
              <img
                src={item.src}
                alt={`${title} ${item.idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Mobile: single card */}
        <div className="sm:hidden relative">
          <div
            className="rounded-2xl overflow-hidden aspect-[4/3] h-auto shadow-2xl shadow-gold-500/10 border-2 border-gold-400/30 cursor-pointer"
            onClick={() => setLightbox(images[current])}
          >
            <img
              src={images[current]}
              alt={`${title} ${current + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Arrow Buttons */}
        <button
          onClick={prev}
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-gold-400 hover:border-gold-400/30 hover:bg-white/20 transition-all duration-300 z-20"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-gold-400 hover:border-gold-400/30 hover:bg-white/20 transition-all duration-300 z-20"
          aria-label="Next image"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`rounded-full transition-all duration-300 ${
              index === current
                ? 'w-8 h-3 bg-gradient-to-r from-gold-400 to-gold-500'
                : 'w-3 h-3 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Image ${index + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="text-center font-tamil text-white/40 text-sm mt-3">
        {current + 1} / {total}
      </p>

      {/* Lightbox */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-navy-950/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <a
            href={lightbox}
            download
            onClick={(e) => e.stopPropagation()}
            className="absolute top-6 right-22 sm:right-24 w-12 h-12 rounded-full bg-gold-400 hover:bg-gold-500 flex items-center justify-center text-navy-950 transition-colors z-10 shadow-lg shadow-gold-500/30"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </a>
          <motion.img
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 25 }}
            src={lightbox}
            alt="Gallery"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </>
  );
}

/* ─── Video Reels Component ─── */
interface ReelData {
  type: 'youtube' | 'drive';
  videoId: string;
  title: string;
  location: string;
  views: string;
}

/*
  ╔══════════════════════════════════════════════════════════════╗
  ║  HOW TO ADD YOUR OWN VIDEOS:                                ║
  ║                                                              ║
  ║  YouTube Shorts:                                             ║
  ║    type: 'youtube', videoId: 'YOUR_VIDEO_ID'                 ║
  ║    Example: youtube.com/shorts/JsAWZ1vQ5x0                  ║
  ║    → videoId: 'JsAWZ1vQ5x0'                                 ║
  ║                                                              ║
  ║  Google Drive:                                               ║
  ║    type: 'drive', videoId: 'YOUR_FILE_ID'                    ║
  ║    Example: drive.google.com/file/d/1aBc...XyZ/view          ║
  ║    → videoId: '1aBc...XyZ'                                  ║
  ╚══════════════════════════════════════════════════════════════╝
*/
const reelsByCategory: Record<string, ReelData[]> = {
  pilgrimage: [
    { type: 'youtube', videoId: 'JsAWZ1vQ5x0', title: 'திருப்பதி தரிசனம்', location: 'திருமலை', views: '12K' },
    { type: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'ராமேஸ்வரம் கோவில்', location: 'ராமேஸ்வரம்', views: '8.5K' },
    { type: 'youtube', videoId: 'JsAWZ1vQ5x0', title: 'வாரணாசி கங்கை', location: 'காசி', views: '15K' },
    { type: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'ஸ்ரீரங்கம் தரிசனம்', location: 'திருச்சி', views: '6.2K' },
  ],
  india: [
    { type: 'youtube', videoId: 'JsAWZ1vQ5x0', title: 'கேரளா பின்புற நீர்வழி', location: 'ஆலப்புழா', views: '18K' },
    { type: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'கோவா கடற்கரை', location: 'கோவா', views: '22K' },
    { type: 'youtube', videoId: 'JsAWZ1vQ5x0', title: 'ராஜஸ்தான் அரண்மனை', location: 'ஜெய்ப்பூர்', views: '9.1K' },
    { type: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'ஹிமாச்சல் மலைகள்', location: 'மனாலி', views: '14K' },
  ],
  international: [
    { type: 'youtube', videoId: 'JsAWZ1vQ5x0', title: 'சிங்கப்பூர் இரவு', location: 'மரினா பே', views: '25K' },
    { type: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'துபாய் நீர்த்தாரை', location: 'புர்ஜ் கலீபா', views: '31K' },
    { type: 'youtube', videoId: 'JsAWZ1vQ5x0', title: 'மாலத்தீவு தீவுகள்', location: 'மாலத்தீவு', views: '20K' },
    { type: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'பாலி கோவில்கள்', location: 'பாலி', views: '11K' },
  ],
};

function getThumbnail(reel: ReelData): string {
  if (reel.type === 'youtube') {
    return `https://img.youtube.com/vi/${reel.videoId}/hqdefault.jpg`;
  }
  // Google Drive thumbnail
  return `https://drive.google.com/thumbnail?id=${reel.videoId}&sz=w400`;
}

function getEmbedUrl(reel: ReelData): string {
  if (reel.type === 'youtube') {
    return `https://www.youtube.com/embed/${reel.videoId}?autoplay=1&loop=1&rel=0&modestbranding=1&playsinline=1`;
  }
  // Google Drive embed
  return `https://drive.google.com/file/d/${reel.videoId}/preview`;
}

function VideoReels({ category }: { category: string }) {
  const reels = reelsByCategory[category] || reelsByCategory.pilgrimage;
  const [activeReel, setActiveReel] = useState<ReelData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openReel = (reel: ReelData, index: number) => {
    setActiveReel(reel);
    setCurrentIndex(index);
  };

  const closeReel = () => {
    setActiveReel(null);
  };

  const goNext = () => {
    const nextIdx = (currentIndex + 1) % reels.length;
    setCurrentIndex(nextIdx);
    setActiveReel(reels[nextIdx]);
  };

  const goPrev = () => {
    const prevIdx = (currentIndex - 1 + reels.length) % reels.length;
    setCurrentIndex(prevIdx);
    setActiveReel(reels[prevIdx]);
  };

  return (
    <>
      {/* Reels Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {reels.map((reel, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative rounded-2xl overflow-hidden aspect-[9/16] bg-navy-950 cursor-pointer shadow-lg shadow-navy-950/10 border border-navy-100/20 hover:border-gold-400/30 hover:shadow-xl hover:shadow-gold-500/10 transition-all duration-300"
            onClick={() => openReel(reel, index)}
          >
            {/* Thumbnail Image */}
            <img
              src={getThumbnail(reel)}
              alt={reel.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-navy-950/30 pointer-events-none" />

            {/* Play button center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-gold-400/40 transition-all duration-300">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>

            {/* Top - Reels badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-md">
                <Play className="w-2.5 h-2.5 text-white fill-white" />
                <span className="text-white text-[10px] font-bold uppercase tracking-wider">Reels</span>
              </div>
            </div>

            {/* Top right - Views */}
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-md text-white text-[10px] font-semibold">
                <EyeIcon />
                {reel.views}
              </span>
            </div>

            {/* Bottom - Title & Location */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="font-tamil text-white font-bold text-sm leading-tight mb-1 line-clamp-2">
                {reel.title}
              </p>
              <p className="font-tamil text-white/60 text-xs">
                📍 {reel.location}
              </p>
            </div>

            {/* Side actions (like Instagram reels) */}
            <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="flex flex-col items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                  <HeartIcon />
                </div>
                <span className="text-white text-[10px] font-semibold">{reel.views}</span>
              </button>
              <button className="flex flex-col items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                  <ShareIcon />
                </div>
                <span className="text-white text-[10px] font-semibold">Share</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fullscreen Reel Modal */}
      {activeReel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
          onClick={closeReel}
        >
          {/* Close button */}
          <button
            onClick={closeReel}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous button */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Video Player - Reel format */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-[85vw] max-w-[360px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl shadow-gold-500/10 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Iframe embed */}
            <iframe
              src={getEmbedUrl(activeReel)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={activeReel.title}
              style={{ border: 'none' }}
            />

            {/* Bottom info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
              <p className="font-tamil text-white font-bold text-base mb-1">{activeReel.title}</p>
              <p className="font-tamil text-white/60 text-sm">📍 {activeReel.location}</p>
            </div>
          </motion.div>

          {/* Next button */}
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {reels.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); openReel(reels[index], index); }}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-6 h-2.5 bg-gold-400'
                    : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
}

/* ─── Small SVG Icons for Reels ─── */
function EyeIcon() {
  return (
    <svg className="w-3 h-3 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}
