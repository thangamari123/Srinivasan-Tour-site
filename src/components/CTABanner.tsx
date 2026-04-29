import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';

export default function CTABanner() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-navy-300 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1.5 bg-gold-400/10 text-gold-400 text-sm font-semibold rounded-full font-tamil mb-6">
            இப்போதே தொடங்குங்கள்
          </span>
          <h2 className="font-tamil text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            இப்போதே உங்கள் பயணத்தை{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">
              தொடங்குங்கள்
            </span>
          </h2>
          <p className="font-tamil text-white/60 text-lg max-w-2xl mx-auto mb-10">
            உங்கள் கனவு பயணத்தை நிஜமாக்க எங்களை தொடர்பு கொள்ளுங்கள். இன்றே உங்கள் இடத்தை உறுதி செய்யுங்கள்!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-400 to-gold-500 text-navy-950 font-bold text-base rounded-2xl hover:from-gold-300 hover:to-gold-400 transition-all duration-300 shadow-2xl shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105 font-tamil"
            >
              இப்போதே பதிவு செய்யுங்கள்
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:+919123456789"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-base rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 font-tamil"
            >
              <Phone className="w-5 h-5" />
              அழைக்கவும்
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
