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
    <section className="py-10 md:py-24 bg-white border-b border-[#ece7dc] relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-5 md:mb-14">
          <span className="inline-block px-3 py-1 bg-gold-400/10 text-gold-600 text-xs sm:text-sm font-semibold rounded-full font-tamil mb-2 md:mb-4">
            {section.badge}
          </span>
          <h2 className="font-tamil text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-navy-950 mb-1.5 md:mb-3">{section.title}</h2>
          <p className="font-tamil text-navy-600/70 text-xs sm:text-sm md:text-base max-w-2xl mx-auto">{section.subtitle}</p>
        </motion.div>

        <div className="flex flex-nowrap overflow-x-auto gap-2.5 -mx-4 px-4 pb-2 snap-x snap-proximity [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-5">
          {list.map((d) => (
            <div key={d.id} className="flex-none w-[38vw] min-w-[132px] max-w-[170px] snap-start md:w-auto md:min-w-0 md:max-w-none">
              <Link
                to={`/packages?destination=${encodeURIComponent(d.slug)}`}
                className="group relative block aspect-[4/5] rounded-xl md:rounded-2xl overflow-hidden shadow-md shadow-navy-950/10"
              >
                <img src={d.image!.url} alt={d.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-2.5 md:p-5">
                  <h3 className="font-tamil text-white font-bold text-sm md:text-xl leading-tight line-clamp-2">{d.name}</h3>
                  {(d.state || d.country) && (
                    <p className="flex items-center gap-1 text-white/75 text-[11px] md:text-sm mt-0.5 md:mt-1 min-w-0">
                      <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0 text-gold-400" />
                      <span className="truncate">{[d.state, d.country].filter(Boolean).join(', ')}</span>
                    </p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
