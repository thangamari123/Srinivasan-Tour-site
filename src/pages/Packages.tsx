import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Bus, Bed, Utensils, ArrowRight } from 'lucide-react';
import { getPackagesByCategory } from '../data/packages';

const tabs = [
  { id: 'pilgrimage', label: 'யாத்திரை' },
  { id: 'india', label: 'இந்திய சுற்றுலா' },
  { id: 'international', label: 'வெளிநாட்டு சுற்றுலா' },
];

const inclusionIcons: Record<string, typeof Bus> = {
  'போக்குவரத்து': Bus,
  'விமானம்': Bus,
  'தங்குமிடம்': Bed,
  'ரிசோர்ட்': Bed,
  'உணவு': Utensils,
};

export default function Packages() {
  const [activeTab, setActiveTab] = useState('pilgrimage');
  const currentPackages = getPackagesByCategory(activeTab);

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
              யாத்திரை, இந்திய சுற்றுலா, வெளிநாட்டு சுற்றுலா – உங்கள் விருப்பத்தை தேர்வு செய்யுங்கள்
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs & Packages */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-2xl font-tamil font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-navy-400 to-navy-600 text-white shadow-lg shadow-navy-400/25'
                    : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Package Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
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
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
                    <span className={`absolute top-3 left-3 px-3 py-1 ${pkg.tagColor} text-white text-xs font-bold rounded-full font-tamil`}>
                      {pkg.categoryTag}
                    </span>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
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
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
