import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Bus, Bed, Utensils, ArrowRight } from 'lucide-react';
import { allPackages } from '../data/packages';
import HoverImageSlider from '../components/HoverImageSlider';

const inclusionIcons: Record<string, typeof Bus> = {
  'போக்குவரத்து': Bus,
  'விமானம்': Bus,
  'தங்குமிடம்': Bed,
  'ரிசோர்ட்': Bed,
  'உணவு': Utensils,
};

export default function Packages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState('all');
  const [tourNameFilter, setTourNameFilter] = useState('all');

  const currentPackages = allPackages.filter((pkg) => {
    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = pkg.title?.toLowerCase().includes(query);
      const matchDesc = pkg.shortDescription?.toLowerCase().includes(query);
      const matchSlug = pkg.slug?.toLowerCase().includes(query);
      const matchTag = pkg.categoryTag?.toLowerCase().includes(query);
      const matchHighlights = pkg.highlights?.some(h => h?.toLowerCase().includes(query));

      if (!matchTitle && !matchDesc && !matchSlug && !matchTag && !matchHighlights) {
        return false;
      }
    }

    // Tour Name Filter
    if (tourNameFilter !== 'all' && pkg.title !== tourNameFilter) {
      return false;
    }

    // Duration Filter
    if (durationFilter !== 'all') {
      const daysStr = pkg.duration.replace(/[^0-9]/g, '');
      const days = parseInt(daysStr, 10);
      
      if (!isNaN(days)) {
        if (durationFilter === 'short' && days > 5) return false;
        if (durationFilter === 'medium' && (days < 6 || days > 10)) return false;
        if (durationFilter === 'long' && days < 11) return false;
      }
    }

    return true;
  });

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-navy-950 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/package3.webp"
            alt="Packages"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 to-navy-950" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 bg-gold-400/10 text-gold-400 text-sm font-semibold rounded-full font-tamil mb-4">
              சுற்றுலா தொகுப்புகள்
            </span>
            <h1 className="font-tamil text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              உங்களுக்கான சிறந்த தொகுப்புகள்
            </h1>
            <p className="font-tamil text-white/60 text-lg max-w-2xl mx-auto">
              அனைத்து சுற்றுலா தொகுப்புகள் – உங்கள் விருப்பத்தை தேர்வு செய்யுங்கள்
            </p>
          </motion.div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Section */}
          <div className="bg-white p-6 rounded-3xl shadow-lg shadow-navy-950/5 border border-navy-100/30 mb-14">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
              
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <input 
                  type="text" 
                  placeholder="தேடுக..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 rounded-xl bg-navy-50 border-none focus:ring-2 focus:ring-gold-400 font-tamil text-sm"
                />
                <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Tour Name Filter */}
              <select 
                value={tourNameFilter}
                onChange={(e) => setTourNameFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-navy-50 border-none focus:ring-2 focus:ring-gold-400 font-tamil text-sm text-navy-600 outline-none w-full sm:w-48 appearance-none cursor-pointer"
              >
                <option value="all">சுற்றுலாவைத் தேர்ந்தெடுக்கவும்</option>
                {allPackages.map(pkg => (
                  <option key={pkg.slug} value={pkg.title}>{pkg.title}</option>
                ))}
              </select>

              {/* Duration Filter */}
              <select 
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-navy-50 border-none focus:ring-2 focus:ring-gold-400 font-tamil text-sm text-navy-600 outline-none w-full sm:w-48 appearance-none cursor-pointer"
              >
                <option value="all">அனைத்து நாட்கள்</option>
                <option value="short">1 - 5 நாட்கள்</option>
                <option value="medium">6 - 10 நாட்கள்</option>
                <option value="long">11+ நாட்கள்</option>
              </select>

            </div>
          </div>

          {/* Package Cards */}
          <AnimatePresence mode="wait">
            {currentPackages.length > 0 ? (
              <motion.div
                key="packages-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {currentPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group rounded-3xl overflow-hidden bg-white shadow-lg shadow-navy-950/5 border border-navy-100/30 hover:shadow-2xl hover:shadow-navy-400/10 transition-all duration-500 hover:-translate-y-2 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <HoverImageSlider images={pkg.images && pkg.images.length > 0 ? pkg.images : [pkg.image]} title={pkg.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent pointer-events-none" />
                      <span className={`absolute top-3 left-3 px-3 py-1 ${pkg.tagColor} text-white text-xs font-bold rounded-full font-tamil`}>
                        {pkg.categoryTag}
                      </span>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full font-tamil">
                          <Clock className="w-3 h-3" />
                          {pkg.duration}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-tamil text-lg font-bold text-navy-950 mb-2 group-hover:text-navy-400 transition-colors">
                        {pkg.title}
                      </h3>
                      <p className="font-tamil text-navy-600/60 text-sm leading-relaxed mb-4">
                        {pkg.shortDescription}
                      </p>

                      {/* Inclusions */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pkg.inclusions.slice(0, 4).map((inc) => {
                          const Icon = inclusionIcons[inc] || Bus;
                          return (
                            <span
                              key={inc}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-navy-50 text-navy-600 text-xs font-medium rounded-lg font-tamil"
                            >
                              <Icon className="w-3 h-3" />
                              {inc}
                            </span>
                          );
                        })}
                      </div>

                      {/* View Details Button */}
                      <div className="mt-auto pt-4 border-t border-navy-100/50">
                        <Link
                          to={`/package/${pkg.slug}`}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-navy-950 font-bold text-sm rounded-xl hover:from-gold-300 hover:to-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 hover:scale-[1.02] font-tamil"
                        >
                          விவரங்களை காண்க
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-navy-50 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-navy-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-tamil text-xl font-bold text-navy-900 mb-2">தொகுப்புகள் கிடைக்கவில்லை</h3>
                <p className="font-tamil text-navy-500 text-sm max-w-md">
                  உங்கள் தேடலுக்கு ஏற்ற சுற்றுலா தொகுப்புகள் எதுவும் கிடைக்கவில்லை. தயவுசெய்து உங்கள் தேடலை மாற்றியமைத்து மீண்டும் முயற்சிக்கவும்.
                </p>
                <button 
                  onClick={() => { setSearchQuery(''); setDurationFilter('all'); }}
                  className="mt-6 font-tamil px-6 py-2 bg-navy-50 hover:bg-navy-100 text-navy-700 font-semibold rounded-lg transition-colors"
                >
                  வடிகட்டிகளை அழிக்க
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
