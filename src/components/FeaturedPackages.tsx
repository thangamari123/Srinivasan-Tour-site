import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight, Bookmark, Bed, Utensils, Bus, MapPin } from 'lucide-react';
import { getFeaturedPackages } from '../data/packages';
import HoverImageSlider from './HoverImageSlider';

const categoryStyles: Record<string, { badge: string; icon: string }> = {
  'யாத்திரை': { badge: 'from-amber-400 to-orange-500', icon: 'text-amber-500' },
  'இந்தியா': { badge: 'from-emerald-400 to-teal-500', icon: 'text-emerald-500' },
  'வெளிநாடு': { badge: 'from-blue-400 to-indigo-500', icon: 'text-blue-500' },
};

const featureIcons = [
  { icon: Bed, label: 'தங்குமிடம்' },
  { icon: Utensils, label: 'உணவு' },
  { icon: Bus, label: 'போக்குவரத்து' },
  { icon: MapPin, label: 'வழிகாட்டி' },
];

export default function FeaturedPackages() {
  const packages = getFeaturedPackages();

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50/80" />
      <div className="absolute inset-0 pattern-dots opacity-20" />

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-12 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 text-xs sm:text-sm font-semibold rounded-full font-tamil mb-3 sm:mb-4">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" />
              Popular Collections
            </span>
            <h2 className="font-tamil text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Best Travel Packages
            </h2>
            <p className="font-tamil text-slate-500 text-xs sm:text-base mt-1.5 max-w-lg">
              யாத்திரை, இந்திய சுற்றுலா, வெளிநாட்டு சுற்றுலா – உங்கள் விருப்பத்தை தேர்வு செய்யுங்கள்
            </p>
          </motion.div>

          <Link
            to="/packages"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300 font-tamil group shrink-0"
          >
            அனைத்து தொகுப்புகளையும் பார்க்க
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {packages.map((pkg, index) => {
            const style = categoryStyles[pkg.categoryTag] || categoryStyles['இந்தியா'];

            return (
              <motion.div
                key={pkg.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.4 }}
              >
                <div className="group relative rounded-2xl overflow-hidden bg-white shadow-md shadow-slate-950/5 border border-slate-100 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">

                  {/* Image Section */}
                  <div className="relative h-40 sm:h-36 md:h-40 overflow-hidden shrink-0">
                    <HoverImageSlider images={pkg.images && pkg.images.length > 0 ? pkg.images : [pkg.image]} title={pkg.title} />

                    {/* Bottom fade overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Category Badge - Top Left */}
                    <span className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r ${style.badge} text-white text-[11px] font-bold rounded-full shadow-sm`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                      {pkg.categoryTag}
                    </span>

                    {/* Bookmark Icon - Top Right */}
                    <button
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/30 hover:text-white transition-all duration-200"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Bookmark"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="p-3.5 sm:p-4 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="font-tamil text-sm sm:text-base font-bold text-slate-900 mb-1.5 leading-snug group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 min-h-[2.5rem]">
                      {pkg.title}
                    </h3>

                    {/* Meta Row */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-medium">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {pkg.duration}
                      </span>
                      {pkg.placesToVisit && pkg.placesToVisit.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-medium">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          {pkg.placesToVisit.length} இடங்கள்
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="font-tamil text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2 flex-1">
                      {pkg.shortDescription}
                    </p>

                    {/* Feature Icons Row */}
                    <div className="flex items-center gap-1 mb-3 pb-2.5 border-b border-slate-100">
                      {featureIcons.map((feat) => (
                        <div
                          key={feat.label}
                          className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-50 hover:bg-blue-50 group/icon transition-colors duration-200"
                          title={feat.label}
                        >
                          <feat.icon className={`w-3.5 h-3.5 text-slate-400 group-hover/icon:${style.icon} transition-colors duration-200`} />
                        </div>
                      ))}
                      <span className="ml-auto text-[10px] text-slate-400 font-medium font-tamil">+மேலும்</span>
                    </div>

                    {/* CTA Button */}
                    <Link
                      to={`/package/${pkg.slug}`}
                      className="relative inline-flex items-center justify-center gap-1.5 w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-xs sm:text-sm rounded-xl overflow-hidden transition-all duration-300 shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 hover:scale-[1.01] font-tamil"
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        விவரங்களைப் பார்க்க
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            to="/packages"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-md shadow-blue-500/20 font-tamil"
          >
            அனைத்து தொகுப்புகளையும் பார்க்க
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
