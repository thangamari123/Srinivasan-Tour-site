import { motion } from 'framer-motion';
import { Award, Users, MapPin, Calendar, CheckCircle, Shield } from 'lucide-react';

const milestones = [
  { icon: Calendar, value: '15+', label: 'ஆண்டு அனுபவம்' },
  { icon: Users, value: '10,000+', label: 'மகிழ்ச்சியான பயணிகள்' },
  { icon: MapPin, value: '50+', label: 'சுற்றுலா இடங்கள்' },
  { icon: Award, value: '200+', label: 'தொகுப்புகள்' },
];

const values = [
  'பாதுகாப்பான மற்றும் நம்பிக்கையான சேவை',
  'விலை உறவில் சிறந்த தொகுப்புகள்',
  'அனுபவம் வாய்ந்த வழிகாட்டிகள்',
  '24/7 வாடிக்கையாளர் ஆதரவு',
  'தனிப்பயன் சுற்றுலா திட்டங்கள்',
  'முழு பயண கவனிப்பு',
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-navy-950 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/india-tour.jpg"
            alt="About us"
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
              எங்களைப் பற்றி
            </span>
            <h1 className="font-tamil text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              ஸ்ரீநிவாசா டூர் ஆபரேட்டர்ஸ்
            </h1>
            <p className="font-tamil text-white/60 text-lg max-w-2xl mx-auto">
              15+ ஆண்டுகளாக உங்கள் கனவு பயணங்களை நிஜமாக்கும் நம்பிக்கையான சுற்றுலா நிறுவனம்
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white relative">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <img
                  src="/images/pilgrimage.jpg"
                  alt="Our story"
                  className="w-full h-96 object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-gold-400 to-gold-500 text-navy-950 rounded-2xl p-6 shadow-xl">
                  <p className="text-3xl font-bold font-heading">15+</p>
                  <p className="font-tamil text-sm font-semibold">ஆண்டுகள்</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 bg-navy-400/10 text-navy-400 text-sm font-semibold rounded-full font-tamil mb-4">
                எங்கள் கதை
              </span>
              <h2 className="font-tamil text-3xl sm:text-4xl font-bold text-navy-950 mb-6">
                பயணமே வாழ்க்கை – அதை சிறப்பாக்குவோம்
              </h2>
              <p className="font-tamil text-navy-600/70 leading-relaxed mb-4">
                ஸ்ரீநிவாசா டூர் ஆபரேட்டர்ஸ் 2009-ம் ஆண்டு தொடங்கப்பட்டது. எங்கள் நோக்கம் ஒவ்வொரு பயணியும் பாதுகாப்பாகவும், மகிழ்ச்சியுடனும் தங்கள் கனவு இடங்களுக்கு செல்வதற்கு உதவுவது.
              </p>
              <p className="font-tamil text-navy-600/70 leading-relaxed mb-4">
                யாத்திரை, இந்திய சுற்றுலா, வெளிநாட்டு சுற்றுலா என பல்வேறு வகையான சுற்றுலா தொகுப்புகளை நாங்கள் வழங்குகிறோம். ஒவ்வொரு பயணமும் கவனமாக திட்டமிடப்பட்டு, பாதுகாப்பான முறையில் நடத்தப்படுகிறது.
              </p>
              <p className="font-tamil text-navy-600/70 leading-relaxed mb-6">
                எங்கள் நிறுவனம் ISO 9001:2015 சான்றிதழ் பெற்றது. இது எங்கள் சேவையின் தரத்தையும், நம்பிக்கையையும் உறுதி செய்கிறது.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="font-tamil text-emerald-700 font-semibold text-sm">ISO 9001:2015 சான்றிதழ் பெற்ற நிறுவனம்</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-20 bg-navy-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-8 rounded-3xl bg-white shadow-lg shadow-navy-950/5 border border-navy-100/30"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-navy-400 to-navy-600 text-white mb-4">
                  <item.icon className="w-7 h-7" />
                </div>
                <p className="text-3xl font-bold text-navy-950 font-heading mb-1">{item.value}</p>
                <p className="font-tamil text-navy-600/60 text-sm">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-navy-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 bg-gold-400/10 text-gold-400 text-sm font-semibold rounded-full font-tamil mb-6">
              எங்கள் நோக்கம்
            </span>
            <h2 className="font-tamil text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8">
              ஒவ்வொரு பயணமும் ஒரு அனுபவம்
            </h2>
            <p className="font-tamil text-white/60 text-lg leading-relaxed max-w-3xl mx-auto mb-12">
              எங்கள் நோக்கம் ஒவ்வொரு பயணிக்கும் மலிவு விலையில், உயர்தர சுற்றுலா அனுபவத்தை வழங்குவது. பாதுகாப்பு, வசதி, மற்றும் மகிழ்ச்சி – இவையே எங்கள் முதன்மை குறிக்கோள்கள்.
            </p>
          </motion.div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5"
              >
                <CheckCircle className="w-5 h-5 text-gold-400 shrink-0" />
                <span className="font-tamil text-white/80 text-sm text-left">{value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
