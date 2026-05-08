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
    <section className="py-28 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50/80" />
      <div className="absolute inset-0 pattern-dots opacity-20" />

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 text-sm font-semibold rounded-full font-tamil mb-4">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" />
              Popular Collections
            </span>
            <h2 className="font-tamil text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Best Travel Packages
            </h2>
            <p className="font-tamil text-slate-400 text-base mt-2 max-w-lg">
              யாத்திரை, இந்திய சுற்றுலா, வெளிநாட்டு சுற்றுலா – உங்கள் விருப்பத்தை தேர்வு செய்யுங்கள்
            </p>
          </motion.div>

          <Link
            to="/packages"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300 font-tamil group shrink-0"
          >
            View All Packages
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, index) => {
            const style = categoryStyles[pkg.categoryTag] || categoryStyles['இந்தியா'];

            return (
              <motion.div
                key={pkg.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="group relative rounded-2xl overflow-hidden bg-white shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] border border-slate-100/80 hover:shadow-[0_12px_40px_-8px_rgba(59,130,246,0.15)] transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">

                  {/* Image Section (42% height) */}
                  <div className="relative h-[220px] overflow-hidden">
                    <HoverImageSlider images={pkg.images && pkg.images.length > 0 ? pkg.images : [pkg.image]} title={pkg.title} />

                    {/* Bottom fade overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                    {/* Category Badge - Top Left */}
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r ${style.badge} text-white text-[11px] font-bold rounded-full shadow-md`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                      {pkg.categoryTag}
                    </span>

                    {/* Bookmark Icon - Top Right */}
                    <button
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/30 hover:text-white transition-all duration-200"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Bookmark"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="font-tamil text-[17px] font-bold text-slate-900 mb-2.5 leading-snug group-hover:text-blue-600 transition-colors duration-300">
                      {pkg.title}
                    </h3>

                    {/* Meta Row */}
                    <div className="flex items-center gap-4 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {pkg.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <Users className="w-3.5 h-3.5" />
                        20+ பயணிகள்
                      </span>
                    </div>

                    {/* Description */}
                    <p className="font-tamil text-slate-400 text-[13px] leading-relaxed mb-4 line-clamp-2 flex-1">
                      {pkg.shortDescription}
                    </p>

                    {/* Feature Icons Row */}
                    <div className="flex items-center gap-1 mb-5 pb-5 border-b border-slate-100">
                      {featureIcons.map((feat) => (
                        <div
                          key={feat.label}
                          className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-50 hover:bg-blue-50 group/icon transition-colors duration-200"
                          title={feat.label}
                        >
                          <feat.icon className={`w-4 h-4 text-slate-300 group-hover/icon:${style.icon} transition-colors duration-200`} />
                        </div>
                      ))}
                      <span className="ml-auto text-[11px] text-slate-300 font-medium font-tamil">+மேலும்</span>
                    </div>

                    {/* CTA Button */}
                    <Link
                      to={`/package/${pkg.slug}`}
                      className="relative inline-flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm rounded-xl overflow-hidden transition-all duration-300 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] font-tamil"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        View Details
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
        <div className="sm:hidden mt-8 text-center">
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 font-tamil"
          >
            View All Packages
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
