import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

const contactInfo = [
  {
    icon: Phone,
    title: 'தொலைபேசி',
    lines: ['+91 93848 54560'],
    color: 'from-blue-400 to-indigo-500',
  },
  {
    icon: Mail,
    title: 'மின்னஞ்சல்',
    lines: ['info@srinivasatours.com', 'booking@srinivasatours.com'],
    color: 'from-emerald-400 to-teal-500',
  },
  {
    icon: MapPin,
    title: 'முகவரி',
    lines: ['123, காந்தி சாலை', 'சென்னை - 600001'],
    color: 'from-amber-400 to-orange-500',
  },
  {
    icon: Clock,
    title: 'நேரம்',
    lines: ['திங்கள் - சனி: 9AM - 7PM', 'ஞாயிறு: 10AM - 5PM'],
    color: 'from-rose-400 to-pink-500',
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [errors, setErrors] = useState({ name: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = { name: '', phone: '', message: '' };
    let valid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'பெயர் அவசியம்';
      valid = false;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'தொலைபேசி எண் அவசியம்';
      valid = false;
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'சரியான 10 இலக்க எண் உள்ளிடவும்';
      valid = false;
    }
    if (!formData.message.trim()) {
      newErrors.message = 'செய்தி அவசியம்';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Redirect to WhatsApp
      const whatsappMessage = `வணக்கம்! என் பெயர் ${formData.name}. %0Aதொலைபேசி: ${formData.phone} %0Aசெய்தி: ${formData.message}`;
      const whatsappUrl = `https://wa.me/919384854560?text=${whatsappMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
      setSubmitted(true);
      setFormData({ name: '', phone: '', message: '' });
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-navy-950 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/gallery5.webp"
            alt="Contact"
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
              தொடர்பு
            </span>
            <h1 className="font-tamil text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              எங்களை தொடர்பு கொள்ளுங்கள்
            </h1>
            <p className="font-tamil text-white/60 text-lg max-w-2xl mx-auto">
              உங்கள் கேள்விகளுக்கு எங்கள் குழு உடனடியாக பதிலளிக்கும்
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-3xl bg-white shadow-lg shadow-navy-950/5 border border-navy-100/30 hover:shadow-xl hover:shadow-navy-400/10 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${info.color} text-white mb-4`}>
                  <info.icon className="w-6 h-6" />
                </div>
                <h3 className="font-tamil text-navy-950 font-bold text-sm mb-2">{info.title}</h3>
                {info.lines.map((line) => (
                  <p key={line} className="font-tamil text-navy-600/70 text-sm">{line}</p>
                ))}
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 sm:p-10 rounded-3xl bg-white shadow-2xl shadow-navy-950/5 border border-navy-100/30"
            >
              <div className="text-center mb-8">
                <h2 className="font-tamil text-2xl sm:text-3xl font-bold text-navy-950 mb-2">
                  விசாரனை அனுப்புங்கள்
                </h2>
                <p className="font-tamil text-navy-600/60 text-sm">
                  உங்கள் விவரங்களை நிரப்புங்கள், எங்கள் குழு உடனடியாக தொடர்பு கொள்ளும்
                </p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="font-tamil text-xl font-bold text-navy-950 mb-2">
                    நன்றி! உங்கள் விசாரனை அனுப்பப்பட்டது
                  </h3>
                  <p className="font-tamil text-navy-600/60 text-sm mb-6">
                    எங்கள் குழு விரைவில் உங்களை தொடர்பு கொள்ளும்
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="font-tamil text-navy-400 font-semibold text-sm hover:text-navy-600 transition-colors"
                  >
                    மீண்டும் அனுப்புங்கள்
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block font-tamil text-navy-950 font-semibold text-sm mb-2">
                      பெயர்
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      placeholder="உங்கள் பெயர்"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.name ? 'border-red-400 bg-red-50/50' : 'border-navy-100 bg-navy-50/30'
                      } focus:outline-none focus:ring-2 focus:ring-navy-400/30 focus:border-navy-400 transition-all font-tamil text-sm text-navy-950 placeholder:text-navy-400/40`}
                    />
                    {errors.name && (
                      <p className="font-tamil text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-tamil text-navy-950 font-semibold text-sm mb-2">
                      தொலைபேசி எண்
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      placeholder="9384854560"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.phone ? 'border-red-400 bg-red-50/50' : 'border-navy-100 bg-navy-50/30'
                      } focus:outline-none focus:ring-2 focus:ring-navy-400/30 focus:border-navy-400 transition-all font-tamil text-sm text-navy-950 placeholder:text-navy-400/40`}
                    />
                    {errors.phone && (
                      <p className="font-tamil text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-tamil text-navy-950 font-semibold text-sm mb-2">
                      செய்தி
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (errors.message) setErrors({ ...errors, message: '' });
                      }}
                      placeholder="உங்கள் செய்தியை இங்கே எழுதுங்கள்..."
                      className={`w-full px-4 py-3 rounded-xl border resize-none ${
                        errors.message ? 'border-red-400 bg-red-50/50' : 'border-navy-100 bg-navy-50/30'
                      } focus:outline-none focus:ring-2 focus:ring-navy-400/30 focus:border-navy-400 transition-all font-tamil text-sm text-navy-950 placeholder:text-navy-400/40`}
                    />
                    {errors.message && (
                      <p className="font-tamil text-red-500 text-xs mt-1">{errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-400 to-gold-500 text-navy-950 font-bold text-base rounded-2xl hover:from-gold-300 hover:to-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-[1.02] font-tamil"
                  >
                    <Send className="w-5 h-5" />
                    விசாரனை அனுப்புங்கள்
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
