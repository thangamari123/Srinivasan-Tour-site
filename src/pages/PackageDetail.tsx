import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getPackageBySlug, getPackagesByCategory } from '../data/packages';
import {
  Clock, MapPin, CheckCircle, XCircle, Phone,
  ArrowLeft, ArrowRight, Bus, Bed, Utensils, Compass,
  Calendar, Star, Shield, ChevronLeft, ChevronRight, X, Play, Pause, Volume2, VolumeX, Download, Users
} from 'lucide-react';

export default function PackageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const pkg = slug ? getPackageBySlug(slug) : undefined;
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <h1 className="font-tamil text-3xl font-bold text-[#1E293B] mb-4">தொகுப்பு கிடைக்கவில்லை</h1>
          <p className="font-tamil text-gray-500 mb-6">தவறான இணைப்பு அல்லது தொகுப்பு நீக்கப்பட்டிருக்கலாம்</p>
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2E7D32] text-white font-semibold rounded-xl font-tamil"
          >
            <ArrowLeft className="w-4 h-4" />
            தொகுப்புகளுக்கு திரும்பு
          </Link>
        </div>
      </div>
    );
  }

  const packageImages = slug && imagesByPackage[slug] ? imagesByPackage[slug] : pkg.images;
  const displayImages = packageImages && packageImages.length > 0 ? packageImages : [pkg.image];
  const activeImage = displayImages[activeImageIndex];
  
  const relatedPackages = getPackagesByCategory(pkg.category).filter(p => p.slug !== pkg.slug).slice(0, 3);

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#1E293B] font-sans pb-24 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#2E7D32] transition-colors font-tamil mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          திரும்ப செல்க
        </button>

        {/* Header */}
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] text-sm font-bold rounded-full font-tamil mb-3">
            {pkg.duration}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-[#1E293B] mb-4 font-tamil">
            {pkg.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-tamil text-gray-600">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              <MapPin className="w-4 h-4 text-[#2E7D32]" />
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
              <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100 relative">
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
                  />
                </AnimatePresence>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {displayImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-24 h-20 sm:w-32 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${activeImageIndex === idx ? 'border-[#2E7D32] ring-2 ring-[#E8F5E9]' : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#2E7D32]/50'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Info Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-2 shadow-sm hover:-translate-y-1 transition-transform">
                 <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                   <Compass className="w-5 h-5 text-[#2E7D32]" />
                 </div>
                 <span className="text-xs text-gray-500 font-tamil">பயண வகை</span>
                 <span className="text-sm font-bold text-[#1E293B] font-tamil">{pkg.categoryTag}</span>
               </div>
               <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-2 shadow-sm hover:-translate-y-1 transition-transform">
                 <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                   <Users className="w-5 h-5 text-[#2E7D32]" />
                 </div>
                 <span className="text-xs text-gray-500 font-tamil">குழு அளவு</span>
                 <span className="text-sm font-bold text-[#1E293B] font-tamil">20-30 நபர்கள்</span>
               </div>
               <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-2 shadow-sm hover:-translate-y-1 transition-transform">
                 <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                   <Bed className="w-5 h-5 text-[#2E7D32]" />
                 </div>
                 <span className="text-xs text-gray-500 font-tamil">தங்குமிடம்</span>
                 <span className="text-sm font-bold text-[#1E293B] font-tamil">உயர்தர ஹோட்டல்</span>
               </div>
               <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-2 shadow-sm hover:-translate-y-1 transition-transform">
                 <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                   <Bus className="w-5 h-5 text-[#2E7D32]" />
                 </div>
                 <span className="text-xs text-gray-500 font-tamil">போக்குவரத்து</span>
                 <span className="text-sm font-bold text-[#1E293B] font-tamil">A/C பேருந்து</span>
               </div>
            </div>

            {/* Overview */}
            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-4 font-tamil text-[#1E293B]">Overview</h2>
              <p className="text-gray-600 leading-relaxed font-tamil text-lg">
                {pkg.fullDescription}
              </p>
            </section>

            {/* Highlights */}
            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 font-tamil text-[#1E293B]">சிறப்பம்சங்கள் (Highlights)</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {pkg.highlights.map(h => (
                  <div key={h} className="flex items-start gap-3 bg-[#E8F5E9]/40 p-4 rounded-xl border border-[#2E7D32]/10 transition-colors hover:bg-[#E8F5E9]">
                    <CheckCircle className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
                    <span className="font-tamil text-[#1E293B] font-medium leading-relaxed">{h}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary */}
            <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-8 font-tamil text-[#1E293B]">பயண அட்டவணை (Itinerary)</h2>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.125rem] sm:before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-200">
                 {pkg.itinerary.map((item, index) => (
                   <div key={index} className="relative flex gap-6 items-start">
                     {/* Timeline Dot */}
                     <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white border-4 border-[#E8F5E9] shrink-0 flex items-center justify-center shadow-sm relative z-10 mt-1">
                       <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#2E7D32]" />
                     </div>
                     {/* Content Card */}
                     <div className="bg-gray-50/50 hover:bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-gray-100 w-full transition-all duration-300 hover:shadow-md hover:border-[#2E7D32]/20 group">
                       <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold rounded-md font-tamil mb-3">{item.day}</span>
                       <h3 className="font-tamil text-[#1E293B] font-bold text-lg mb-2 group-hover:text-[#2E7D32] transition-colors">{item.title}</h3>
                       <p className="font-tamil text-gray-600 leading-relaxed text-sm sm:text-base">{item.description}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </section>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1 space-y-6 relative">
            
            <div className="sticky top-28 space-y-6">
              {/* Price Card */}
              <div className="bg-white p-6 rounded-3xl shadow-lg shadow-black/5 border border-gray-100">
                <div className="mb-6 pb-6 border-b border-gray-100 text-center">
                  <p className="text-gray-500 text-sm mb-1 font-tamil">தொகுப்பு விலை</p>
                  <h3 className="text-3xl font-bold text-[#2E7D32] font-tamil">{pkg.price}</h3>
                  <p className="text-xs text-gray-400 mt-2 font-tamil">{pkg.priceNote}</p>
                </div>
                <div className="space-y-3">
                  <a href="tel:+919384854560" className="flex items-center justify-center gap-2 w-full bg-[#2E7D32] text-white py-3.5 rounded-xl font-bold hover:bg-[#1B5E20] transition-all hover:scale-[1.02] transform duration-300 shadow-md shadow-[#2E7D32]/20 font-tamil">
                    <Phone className="w-4 h-4" />
                    இப்போதே அழைக்கவும்
                  </a>
                  <Link to="/contact" className="flex items-center justify-center gap-2 w-full border border-[#2E7D32] text-[#2E7D32] py-3.5 rounded-xl font-bold hover:bg-[#E8F5E9] transition-colors font-tamil">
                    விசாரனை அனுப்புங்கள்
                  </Link>
                </div>
              </div>

              {/* Inclusions */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 font-tamil text-[#1E293B]">உள்ளடக்கங்கள் (Includes)</h3>
                <ul className="space-y-3">
                  {pkg.inclusions.map(inc => (
                    <li key={inc} className="flex items-start gap-3 text-sm font-tamil text-gray-600">
                      <CheckCircle className="w-5 h-5 text-[#2E7D32] shrink-0" />
                      <span className="mt-0.5">{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 font-tamil text-[#1E293B]">உள்ளடக்கம் அல்லாதவை (Excludes)</h3>
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
              <div className="bg-[#E8F5E9] p-6 rounded-3xl shadow-sm border border-[#2E7D32]/10 text-center">
                <h3 className="text-lg font-bold text-[#2E7D32] mb-1 font-tamil">உதவி தேவையா?</h3>
                <p className="text-sm text-[#2E7D32]/80 mb-5 font-tamil">அழைக்க அல்லது WhatsApp செய்யவும்</p>
                <a href="tel:+919384854560" className="inline-flex items-center justify-center gap-2 text-xl font-bold text-[#1E293B] mb-5 hover:text-[#2E7D32] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Phone className="w-5 h-5 text-[#2E7D32]" />
                  </div>
                  +91 93848 54560
                </a>
                <button className="w-full bg-white text-[#2E7D32] py-3 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all font-tamil border border-white hover:border-[#2E7D32]/20">
                  WhatsApp Us
                </button>
              </div>

              {/* Related Packages */}
              {relatedPackages.length > 0 && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold mb-4 font-tamil text-[#1E293B]">தொடர்புடைய தொகுப்புகள்</h3>
                  <div className="space-y-4">
                    {relatedPackages.map(rel => (
                      <Link to={`/package/${rel.slug}`} key={rel.slug} className="group flex gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-colors">
                        <img src={rel.image} alt={rel.title} className="w-20 h-20 rounded-xl object-cover shadow-sm" />
                        <div className="flex-1 py-1">
                          <h4 className="font-tamil font-bold text-[#1E293B] text-sm group-hover:text-[#2E7D32] transition-colors line-clamp-1">{rel.title}</h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 mb-2 font-tamil">
                            <Clock className="w-3 h-3" /> {rel.duration}
                          </div>
                          <span className="text-[#2E7D32] text-xs font-bold font-tamil group-hover:underline">விவரங்கள் &rarr;</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Section - Video Reels */}
      <div className="bg-white border-t border-gray-200 mt-20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold rounded-full font-tamil mb-3">பயணிகள் கருத்துக்கள்</span>
            <h2 className="font-tamil text-3xl font-bold text-[#1E293B] mb-2">எங்கள் பயணிகள் சொல்வது</h2>
            <p className="font-tamil text-gray-500 text-sm">பயணிகளின் நிஜமான அனுபவங்களை வீடியோவில் காணுங்கள்</p>
          </div>
          <VideoReels category={pkg.category} slug={pkg.slug} />
        </div>
      </div>
    </div>
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

const reelsByPackage: Record<string, ReelData[]> = {
  'tirupathi-yathirai': [
    { type: 'youtube', videoId: '9kpF_wuxFVU', title: 'திருப்பதி தரிசனம்', location: 'திருமலை', views: '12K' },
    { type: 'youtube', videoId: '3y4VTfd_uHc', title: 'பத்மாவதி தாயார் கோவில்', location: 'திருப்பதி', views: '8.5K' },
    { type: 'youtube', videoId: 'Ux1Emi4nX60', title: 'திருப்பதி மலைப் பாதை', location: 'திருப்பதி', views: '15K' },
    { type: 'youtube', videoId: 'tRwQTU4Gd4M', title: 'கோவிந்தராஜசுவாமி கோவில்', location: 'திருப்பதி', views: '6.2K' },
  ],
  'rameswaram-yathirai': [
    { type: 'youtube', videoId: 'Zjy2dHyW8qs', title: 'ராமேஸ்வரம் கோவில்', location: 'ராமேஸ்வரம்', views: '14K' },
    { type: 'youtube', videoId: '6m7nT2x6UGY', title: 'தனுஷ்கோடி பயணம்', location: 'தனுஷ்கோடி', views: '22K' },
    { type: 'youtube', videoId: '6xUNZQalY1k', title: 'அக்னி தீர்த்தம்', location: 'ராமேஸ்வரம்', views: '18K' },
    { type: 'youtube', videoId: 'RruC4SuDK80', title: 'பாம்பன் பாலம்', location: 'ராமேஸ்வரம்', views: '25K' },
  ],
  'varanasi-yathirai': [
    { type: 'youtube', videoId: 'Kb_4OuWzqJw', title: 'காசி விஸ்வநாதர் தரிசனம்', location: 'வாரணாசி', views: '30K' },
    { type: 'youtube', videoId: 'trO4-tYJqyY', title: 'கங்கை ஆரத்தி', location: 'வாரணாசி', views: '45K' },
    { type: 'youtube', videoId: 'wS2hYPDlQcQ', title: 'கங்கை படகு சவாரி', location: 'வாரணாசி', views: '20K' },
    { type: 'youtube', videoId: 'gNPyvV4DYvc', title: 'சாரநாத் புத்தர் கோவில்', location: 'வாரணாசி', views: '15K' },
  ],
  'srirangam-yathirai': [
    { type: 'youtube', videoId: '8UfLtHGHXMs', title: 'ஸ்ரீ ரங்கநாதர் தரிசனம்', location: 'ஸ்ரீரங்கம்', views: '18K' },
    { type: 'youtube', videoId: '2sbgDWCTeMw', title: 'கோபுர தரிசனம்', location: 'ஸ்ரீரங்கம்', views: '12K' },
    { type: 'youtube', videoId: 'oE_3i_nRxic', title: 'ஜம்புகேஸ்வரர் கோவில்', location: 'திருச்சி', views: '10K' },
    { type: 'youtube', videoId: 'BIiZjrQtpRg', title: 'உறையூர் கோவில்', location: 'திருச்சி', views: '8K' },
  ],
  'kerala-nature-tour': [
    { type: 'youtube', videoId: 'cyF2doCivIo', title: 'ஆலப்புழா ஹவுஸ்போட்', location: 'ஆலப்புழா', views: '25K' },
    { type: 'youtube', videoId: 'OaF34GSTtCw', title: 'முன்னார் தேயிலை தோட்டம்', location: 'முன்னார்', views: '32K' },
    { type: 'youtube', videoId: 'uCleWHSZOWc', title: 'தேக்கடி யானை சவாரி', location: 'தேக்கடி', views: '20K' },
    { type: 'youtube', videoId: '80N2U1FT_40', title: 'கதகளி நடனம்', location: 'கேரளா', views: '15K' },
  ],
  'goa-beach-tour': [
    { type: 'youtube', videoId: '9kpF_wuxFVU', title: 'பாகா கடற்கரை', location: 'கோவா', views: '40K' },
    { type: 'youtube', videoId: '3y4VTfd_uHc', title: 'கோவா நீர் விளையாட்டுகள்', location: 'கோவா', views: '35K' },
    { type: 'youtube', videoId: 'Ux1Emi4nX60', title: 'பழைய கோவா தேவாலயம்', location: 'கோவா', views: '25K' },
    { type: 'youtube', videoId: 'tRwQTU4Gd4M', title: 'கோவா சூரிய அஸ்தமனம்', location: 'கோவா', views: '30K' },
  ],
  'rajasthan-palace-tour': [
    { type: 'youtube', videoId: 'Zjy2dHyW8qs', title: 'ஜெய்ப்பூர் ஹவா மஹால்', location: 'ஜெய்ப்பூர்', views: '28K' },
    { type: 'youtube', videoId: '6m7nT2x6UGY', title: 'உதய்ப்பூர் ஏரி அரண்மனை', location: 'உதய்ப்பூர்', views: '35K' },
    { type: 'youtube', videoId: '6xUNZQalY1k', title: 'பாலைவன சபாரி', location: 'ஜோத்பூர்', views: '22K' },
    { type: 'youtube', videoId: 'RruC4SuDK80', title: 'மெஹரான்கர் கோட்டை', location: 'ஜோத்பூர்', views: '25K' },
  ],
  'himachal-mountain-tour': [
    { type: 'youtube', videoId: 'Kb_4OuWzqJw', title: 'ஷிம்லா பனிப்பொழிவு', location: 'ஷிம்லா', views: '45K' },
    { type: 'youtube', videoId: 'trO4-tYJqyY', title: 'மனாலி ரோதங் பாஸ்', location: 'மனாலி', views: '50K' },
    { type: 'youtube', videoId: 'wS2hYPDlQcQ', title: 'சோலங்கு பள்ளத்தாக்கு', location: 'மனாலி', views: '38K' },
    { type: 'youtube', videoId: 'gNPyvV4DYvc', title: 'தர்மசாலா பௌத்த கோவில்', location: 'தர்மசாலா', views: '20K' },
  ],
  'singapore-malaysia-tour': [
    { type: 'youtube', videoId: '8UfLtHGHXMs', title: 'மரினா பே சேண்ட்ஸ்', location: 'சிங்கப்பூர்', views: '55K' },
    { type: 'youtube', videoId: '2sbgDWCTeMw', title: 'யுனிவர்சல் ஸ்டுடியோஸ்', location: 'சிங்கப்பூர்', views: '60K' },
    { type: 'youtube', videoId: 'oE_3i_nRxic', title: 'கெந்திங் ஹைலேண்ட்ஸ்', location: 'மலேசியா', views: '40K' },
    { type: 'youtube', videoId: 'BIiZjrQtpRg', title: 'பத்து குகைகள்', location: 'மலேசியா', views: '35K' },
  ],
  'dubai-tour': [
    { type: 'youtube', videoId: 'cyF2doCivIo', title: 'புர்ஜ் கலீபா', location: 'துபாய்', views: '80K' },
    { type: 'youtube', videoId: 'OaF34GSTtCw', title: 'டெசர்ட் சபாரி', location: 'துபாய்', views: '65K' },
    { type: 'youtube', videoId: 'uCleWHSZOWc', title: 'துபாய் மால்', location: 'துபாய்', views: '45K' },
    { type: 'youtube', videoId: '80N2U1FT_40', title: 'துபாய் பவுண்டன் ஷோ', location: 'துபாய்', views: '70K' },
  ],
  'maldives-tour': [
    { type: 'youtube', videoId: '9kpF_wuxFVU', title: 'மாலத்தீவு வாட்டர் வில்லா', location: 'மாலத்தீவு', views: '75K' },
    { type: 'youtube', videoId: '3y4VTfd_uHc', title: 'ஸ்கூபா டைவிங்', location: 'மாலத்தீவு', views: '50K' },
    { type: 'youtube', videoId: 'Ux1Emi4nX60', title: 'ஸ்நார்க்கெலிங்', location: 'மாலத்தீவு', views: '40K' },
    { type: 'youtube', videoId: 'tRwQTU4Gd4M', title: 'சூரிய அஸ்தமன பயணம்', location: 'மாலத்தீவு', views: '60K' },
  ],
  'bali-thailand-tour': [
    { type: 'youtube', videoId: 'Zjy2dHyW8qs', title: 'பாலி உபுத் நெல் வயல்', location: 'பாலி', views: '35K' },
    { type: 'youtube', videoId: '6m7nT2x6UGY', title: 'தானா லோட் கோவில்', location: 'பாலி', views: '45K' },
    { type: 'youtube', videoId: '6xUNZQalY1k', title: 'பாங்காக் வாட் அருண்', location: 'தாய்லாந்து', views: '55K' },
    { type: 'youtube', videoId: 'RruC4SuDK80', title: 'பட்டாயா கோரல் தீவு', location: 'தாய்லாந்து', views: '65K' },
  ],
};

const imagesByPackage: Record<string, string[]> = {
  'tirupathi-yathirai': ['/images/gen_tirupati.webp', '/images/pilgrimage.webp', '/images/package1.webp', '/images/gallery1.webp'],
  'rameswaram-yathirai': ['/images/gen_rameswaram.webp', '/images/package6.webp', '/images/gallery2.webp', '/images/pilgrimage.webp'],
  'varanasi-yathirai': ['/images/gen_varanasi.webp', '/images/package1.webp', '/images/gallery3.webp', '/images/hero-bg.webp'],
  'srirangam-yathirai': ['/images/gen_srirangam.webp', '/images/pilgrimage.webp', '/images/gallery4.webp', '/images/package6.webp'],
  'kerala-nature-tour': ['/images/gen_kerala.webp', '/images/india-tour.webp', '/images/gallery5.webp', '/images/package2.webp'],
  'goa-beach-tour': ['/images/gen_goa.webp', '/images/package2.webp', '/images/gallery6.webp', '/images/india-tour.webp'],
  'rajasthan-palace-tour': ['/images/gen_rajasthan.webp', '/images/gallery2.webp', '/images/gallery1.webp', '/images/package3.webp'],
  'himachal-mountain-tour': ['/images/gen_himachal.webp', '/images/gallery4.webp', '/images/gallery5.webp', '/images/india-tour.webp'],
  'singapore-malaysia-tour': ['/images/gen_singapore.webp', '/images/package3.webp', '/images/package5.webp', '/images/international-tour.webp'],
  'dubai-tour': ['/images/gen_dubai.webp', '/images/international-tour.webp', '/images/package4.webp', '/images/gallery2.webp'],
  'maldives-tour': ['/images/gen_maldives.webp', '/images/package4.webp', '/images/gallery6.webp', '/images/gallery5.webp'],
  'bali-thailand-tour': ['/images/gen_bali.webp', '/images/package5.webp', '/images/gallery3.webp', '/images/international-tour.webp'],
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

function VideoReels({ category, slug }: { category: string, slug?: string }) {
  const reels = (slug && reelsByPackage[slug]) || reelsByCategory[category] || reelsByCategory.pilgrimage;
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
