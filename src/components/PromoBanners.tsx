import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSiteContent } from '../context/siteContentContext';

/** Admin-managed promotional banner carousel. Hidden unless enabled with at least one active banner. */
export default function PromoBanners() {
  const { homepage } = useSiteContent();
  const section = homepage.banners;
  const items = (section.items ?? []).filter((b) => b.active && b.image?.url);
  const [raw, setIndex] = useState(0);
  const index = items.length ? raw % items.length : 0;

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIndex((i) => i + 1), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  if (!section.enabled || items.length === 0) return null;
  const b = items[index];
  const internal = b.link?.startsWith('/');
  const cta = (
    <span className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-navy-950 font-bold text-sm rounded-xl shadow-lg shadow-gold-500/25 font-tamil">
      {b.buttonLabel || 'மேலும் அறிய'}
      <ArrowRight className="w-4 h-4" />
    </span>
  );

  return (
    <section className="py-10 sm:py-14 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[21/8] bg-navy-950 shadow-xl shadow-navy-950/10">
          <AnimatePresence mode="wait">
            <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0">
              <img src={b.image!.url} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/50 to-transparent" />
              <div className="relative h-full flex flex-col justify-center p-5 sm:p-12 max-w-xl">
                {b.title && <h3 className="font-tamil text-xl sm:text-4xl font-bold text-white leading-tight">{b.title}</h3>}
                {b.subtitle && <p className="font-tamil text-white/75 text-sm sm:text-lg mt-2 sm:mt-3 line-clamp-3">{b.subtitle}</p>}
                {b.link && (
                  <div className="mt-4 sm:mt-6">
                    {internal ? <Link to={b.link}>{cta}</Link> : <a href={b.link} target="_blank" rel="noreferrer">{cta}</a>}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
          {items.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-5 right-4 sm:right-6 flex gap-1.5">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Banner ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-gold-400' : 'w-2 bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
