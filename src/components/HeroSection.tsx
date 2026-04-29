import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const backgroundImages = [
  '/images/pilgrimage.jpg',
  '/images/india-tour.jpg',
  '/images/international-tour.jpg',
  '/images/hero-bg.jpg'
];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-navy-950">
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={backgroundImages[currentImage]}
            src={backgroundImages[currentImage]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full object-cover"
            alt="Tour destination"
          />
        </AnimatePresence>
        <div className="hero-gradient absolute inset-0 z-1" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl z-1" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-navy-400/10 rounded-full blur-3xl z-1" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
            <span className="text-gold-400 text-sm font-medium font-tamil">15+ ஆண்டுகள் நம்பிக்கையான சேவை</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-tamil text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
          >
            உங்கள் கனவு பயணம்{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">
              இங்கே
            </span>{' '}
            ஆரம்பிக்கிறது!
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-tamil text-lg sm:text-xl text-white/70 max-w-xl mb-10 leading-relaxed"
          >
            இந்தியா & வெளிநாட்டு சுற்றுலா – முழுமையான வசதியுடன்
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/packages"
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
              Call Now
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-white/10"
          >
            {[
              { value: '15+', label: 'ஆண்டு அனுபவம்' },
              { value: '10K+', label: 'மகிழ்ச்சியான பயணிகள்' },
              { value: '200+', label: 'சுற்றுலா தொகுப்புகள்' },
              { value: '50+', label: 'இடங்கள்' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-bold text-gold-400 font-heading">{stat.value}</p>
                <p className="text-white/50 text-sm font-tamil mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
