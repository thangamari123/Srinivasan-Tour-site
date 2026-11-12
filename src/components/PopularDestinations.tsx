import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useSiteContent } from '../context/siteContentContext';
import type { Destination } from '../types/content';

/** Admin-managed "Popular Destinations" row. Hidden unless enabled in Homepage settings. */
export default function PopularDestinations() {
  const { homepage, destinations, loading } = useSiteContent();
  const section = homepage.destinations;
  if (!section.enabled || loading) return null;

  const byId = new Map(destinations.map((d) => [d.id, d]));
  const picked = (section.destinationIds ?? []).map((id) => byId.get(id)).filter(Boolean) as Destination[];
  const list = (picked.length ? picked : destinations).filter((d) => d.image?.url).slice(0, 8);
  if (!list.length) return null;

  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-3.5 py-1 bg-gold-400/10 text-gold-600 text-xs sm:text-sm font-semibold rounded-full font-tamil mb-3 sm:mb-4">
            {section.badge}
          </span>
          <h2 className="font-tamil text-2xl sm:text-4xl lg:text-5xl font-bold text-navy-950 mb-3">{section.title}</h2>
          <p className="font-tamil text-navy-600/70 text-sm sm:text-base max-w-2xl mx-auto">{section.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {list.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.06, 0.4) }}
            >
              <Link
                to={`/packages?destination=${encodeURIComponent(d.slug)}`}
                className="group relative block aspect-[4/5] rounded-2xl overflow-hidden shadow-md shadow-navy-950/10"
              >
                <img src={d.image!.url} alt={d.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5">
                  <h3 className="font-tamil text-white font-bold text-base sm:text-xl leading-tight">{d.name}</h3>
                  {(d.state || d.country) && (
                    <p className="flex items-center gap-1 text-white/70 text-xs sm:text-sm mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gold-400" />
                      {[d.state, d.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
