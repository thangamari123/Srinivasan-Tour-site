import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Landmark, MapPin, Globe, ArrowRight } from 'lucide-react';

const services = [
  {
    icon: Landmark,
    title: 'யாத்திரை',
    subtitle: 'Pilgrimage Tours',
    description: 'திருப்பதி, ராமேஸ்வரம், வாரணாசி உட்பட பல புண்ணிய தலங்களுக்கு எளிதான யாத்திரை ஏற்பாடுகள்.',
    image: '/images/pilgrimage.jpg',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    glowColor: 'shadow-amber-500/20',
    accent: 'text-amber-500',
    accentBg: 'bg-amber-500',
    number: '01',
  },
  {
    icon: MapPin,
    title: 'இந்திய சுற்றுலா',
    subtitle: 'India Tours',
    description: 'கேரளா, கோவா, ராஜஸ்தான், ஹிமாச்சல் – இந்தியாவின் அழகை கண்டு அனுபவியுங்கள்.',
    image: '/images/india-tour.jpg',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    glowColor: 'shadow-emerald-500/20',
    accent: 'text-emerald-500',
    accentBg: 'bg-emerald-500',
    number: '02',
  },
  {
    icon: Globe,
    title: 'வெளிநாட்டு சுற்றுலா',
    subtitle: 'International Tours',
    description: 'சிங்கப்பூர், துபாய், மாலத்தீவு, ஐரோப்பா – உலகம் முழுவதும் சுற்றுலா ஏற்பாடுகள்.',
    image: '/images/international-tour.jpg',
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    glowColor: 'shadow-blue-500/20',
    accent: 'text-blue-500',
    accentBg: 'bg-blue-500',
    number: '03',
  },
];

export default function ServicesSection() {
  return (
    <section className="py-28 bg-navy-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-gold-400/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-navy-400/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-0 w-px h-40 bg-gradient-to-b from-transparent via-gold-400/20 to-transparent" />
      <div className="absolute top-1/3 right-0 w-px h-40 bg-gradient-to-b from-transparent via-gold-400/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-semibold rounded-full font-tamil mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-gold-400" />
            எங்கள் சேவைகள்
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-tamil text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5"
          >
            உங்களுக்கான சிறந்த சேவைகள்
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/50 text-lg max-w-2xl mx-auto font-tamil"
          >
            யாத்திரை முதல் வெளிநாட்டு சுற்றுலா வரை – அனைத்தும் ஒரே இடத்தில்
          </motion.p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
            >
              <Link
                to="/packages"
                className="group relative block rounded-3xl overflow-hidden h-[420px] sm:h-[460px]"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-950/20 group-hover:from-navy-950/95 group-hover:via-navy-950/70 group-hover:to-navy-950/30 transition-all duration-500" />

                {/* Decorative glow on hover */}
                <div className={`absolute -bottom-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-15 blur-3xl transition-opacity duration-700`} />

                {/* Number Badge */}
                <div className="absolute top-5 right-5">
                  <span className={`font-heading text-5xl font-bold text-white/5 group-hover:text-white/10 transition-colors duration-500`}>
                    {service.number}
                  </span>
                </div>

                {/* Icon Badge */}
                <div className="absolute top-5 left-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg ${service.glowColor} group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
                  {/* Subtitle */}
                  <span className={`inline-block px-3 py-1 ${service.accentBg}/10 border ${service.accentBg}/20 ${service.accent} text-[11px] font-bold uppercase tracking-widest rounded-full mb-3 font-heading`}>
                    {service.subtitle}
                  </span>

                  {/* Title */}
                  <h3 className="font-tamil text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-gold-400 transition-colors duration-300">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="font-tamil text-white/60 text-sm leading-relaxed mb-5 line-clamp-2">
                    {service.description}
                  </p>

                  {/* CTA Arrow */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/10 ${service.accent} group-hover:bg-white group-hover:border-white/20 transition-all duration-300`}>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="font-tamil text-white/50 text-sm font-medium group-hover:text-white/80 transition-colors">
                      மேலும் அறிக
                    </span>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1">
                  <div className={`h-full bg-gradient-to-r ${service.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
