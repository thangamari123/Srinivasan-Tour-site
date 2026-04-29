import { motion } from 'framer-motion';
import { Award, ShieldCheck, Sparkles, HeartHandshake } from 'lucide-react';

const reasons = [
  {
    icon: Award,
    title: 'அனுபவம்',
    description: '15+ ஆண்டுகள் சுற்றுலா துறையில் சேவை. ஒவ்வொரு பயணத்திலும் நாங்கள் உங்கள் நம்பிக்கையான துணை.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: ShieldCheck,
    title: 'பாதுகாப்பு',
    description: 'பாதுகாப்பான பயணமே சிறந்த பயணம். முழு கவனிப்புடன் உங்கள் பாதுகாப்பை உறுதி செய்கிறோம்.',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    icon: Sparkles,
    title: 'முழு வசதி',
    description: 'போக்குவரத்து, தங்குமிடம், உணவு – அனைத்தும் ஒரே தொகுப்பில். நீங்கள் பயணம் மட்டும் அனுபவியுங்கள்.',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    icon: HeartHandshake,
    title: 'நம்பிக்கை',
    description: 'ஆயிரக்கணக்கான மகிழ்ச்சியான பயணிகள். ISO சான்றிதழ் பெற்ற நிறுவனம்.',
    gradient: 'from-rose-400 to-pink-500',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-navy-950 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-400/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-gold-400/10 text-gold-400 text-sm font-semibold rounded-full font-tamil mb-4"
          >
            ஏன் எங்களை தேர்வு செய்ய வேண்டும்?
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-tamil text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            எங்கள் சிறப்பம்சங்கள்
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/50 text-lg max-w-2xl mx-auto font-tamil"
          >
            உங்கள் பயணத்தை மேம்படுத்தும் நான்கு காரணங்கள்
          </motion.p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group text-center p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 hover:border-gold-400/20 transition-all duration-500"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${reason.gradient} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <reason.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-tamil text-xl font-bold text-white mb-3">{reason.title}</h3>
              <p className="font-tamil text-white/50 text-sm leading-relaxed">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
