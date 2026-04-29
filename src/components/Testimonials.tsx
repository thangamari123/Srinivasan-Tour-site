import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    name: 'ராஜகுமார் செல்வம்',
    location: 'சென்னை',
    tour: 'திருப்பதி யாத்திரை',
    text: 'திருப்பதி யாத்திரை மிகவும் சிறப்பாக ஏற்பாடு செய்யப்பட்டிருந்தது. தங்குமிடம், உணவு எல்லாமே சிறப்பாக இருந்தது. ஸ்ரீநிவாசா டூர்ஸுக்கு மிக்க நன்றி!',
    rating: 5,
    color: 'from-amber-400 to-orange-500',
  },
  {
    name: 'லக்ஷ்மி தேவி',
    location: 'கோயம்புத்தூர்',
    tour: 'கேரளா சுற்றுலா',
    text: 'கேரளா சுற்றுலா எங்கள் குடும்பத்திற்கு மிகவும் மகிழ்ச்சியளித்தது. குழந்தைகள் மிகவும் அனுபவித்தனர். வழிகாட்டி மிகவும் அனுபவம் வாய்ந்தவர்.',
    rating: 5,
    color: 'from-emerald-400 to-teal-500',
  },
  {
    name: 'சந்திரசேகர்',
    location: 'மதுரை',
    tour: 'சிங்கப்பூர் சுற்றுலா',
    text: 'சிங்கப்பூர் சுற்றுலா ஏற்பாடு மிகச் சிறப்பாக இருந்தது. விசா, பறப்பு, தங்குமிடம் எல்லாமே கவலையின்றி ஏற்பாடு செய்யப்பட்டது.',
    rating: 5,
    color: 'from-blue-400 to-indigo-500',
  },
  {
    name: 'பாரதி ராமசாமி',
    location: 'திருச்சி',
    tour: 'ராமேஸ்வரம் யாத்திரை',
    text: 'ராமேஸ்வரம் யாத்திரை ஒரு மனம் கவரும் அனுபவம். 22 தீர்த்த ஸ்நானம், தனுஷ்கோடி பயணம் எல்லாமே சிறப்பாக ஏற்பாடு செய்யப்பட்டிருந்தது. மீண்டும் ஸ்ரீநிவாசா டூர்ஸையே தேர்வு செய்வோம்!',
    rating: 5,
    color: 'from-rose-400 to-pink-500',
  },
  {
    name: 'வெங்கட் பிரசாத்',
    location: 'சேலம்',
    tour: 'துபாய் சுற்றுலா',
    text: 'துபாய் சுற்றுலா ஒரு கனவு பயணம்! புர்ஜ் கலீபா, டெசர்ட் சபாரி, ஷாப்பிங் எல்லாமே அருமை. விசா முதல் திரும்பும் வரை முழு கவனிப்பு. நன்றி ஸ்ரீநிவாசா டூர்ஸ்!',
    rating: 5,
    color: 'from-violet-400 to-purple-500',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const t = testimonials[current];

  return (
    <section className="py-28 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-navy-400/10 text-navy-400 text-sm font-semibold rounded-full font-tamil mb-4"
          >
            பயணிகள் கருத்துக்கள்
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-tamil text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-950 mb-4"
          >
            எங்கள் பயணிகள் சொல்வது
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-navy-600/60 text-lg max-w-2xl mx-auto font-tamil"
          >
            ஆயிரக்கணக்கான பயணிகளின் நம்பிக்கையும் மகிழ்ச்சியும்
          </motion.p>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-3xl mx-auto">
          {/* Card */}
          <div className="relative rounded-3xl bg-white shadow-2xl shadow-navy-950/8 border border-navy-100/40 overflow-hidden">
            {/* Top accent bar */}
            <div className={`h-1.5 bg-gradient-to-r ${t.color}`} />

            <div className="p-8 sm:p-10">
              {/* Quote + Tour badge row */}
              <div className="flex items-start justify-between mb-6">
                <span className={`inline-block px-3 py-1 bg-gradient-to-r ${t.color} text-white text-[11px] font-bold uppercase tracking-wider rounded-full font-heading`}>
                  {t.tour}
                </span>
                <Quote className="w-10 h-10 text-navy-100 shrink-0" />
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-gold-400 text-gold-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="font-tamil text-navy-800 text-base sm:text-lg leading-relaxed mb-8">
                "{t.text}"
              </p>

              {/* Divider */}
              <div className="h-px bg-navy-100/60 mb-6" />

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-tamil text-navy-950 font-bold text-base">{t.name}</p>
                  <p className="font-tamil text-navy-500/60 text-sm">{t.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-7 w-11 h-11 rounded-2xl bg-white shadow-lg shadow-navy-950/10 border border-navy-100/50 flex items-center justify-center text-navy-400 hover:text-gold-500 hover:border-gold-400/30 hover:shadow-xl transition-all duration-300"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-7 w-11 h-11 rounded-2xl bg-white shadow-lg shadow-navy-950/10 border border-navy-100/50 flex items-center justify-center text-navy-400 hover:text-gold-500 hover:border-gold-400/30 hover:shadow-xl transition-all duration-300"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2.5 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === current
                    ? 'w-8 h-3 bg-gradient-to-r from-navy-400 to-navy-600'
                    : 'w-3 h-3 bg-navy-200 hover:bg-navy-300'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
