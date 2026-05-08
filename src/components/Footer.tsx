import { Link } from 'react-router-dom';
import { Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

const quickLinks = [
  { name: 'முகப்பு', path: '/' },
  { name: 'எங்களைப் பற்றி', path: '/about' },
  { name: 'தொகுப்புகள்', path: '/packages' },
  { name: 'கேலரி', path: '/gallery' },
  { name: 'தொடர்பு', path: '/contact' },
];

const tourTypes = [
  'திருப்பதி யாத்திரை',
  'ராமேஸ்வரம் யாத்திரை',
  'கேரளா சுற்றுலா',
  'கோவா சுற்றுலா',
  'சிங்கப்பூர் சுற்றுலா',
  'துபாய் சுற்றுலா',
];

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white font-tamil">
      {/* Top decorative line */}
      <div className="h-1 bg-gradient-to-r from-gold-400 via-navy-400 to-gold-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/images/logo.webp"
                alt="ஸ்ரீநிவாசா Tour Operators"
                className="w-12 h-12 rounded-xl shadow-lg shadow-gold-500/20 object-cover"
              />
              <div>
                <p className="font-bold text-lg leading-tight">ஸ்ரீநிவாசா</p>
                <p className="text-gold-400 text-xs font-medium tracking-widest uppercase">Tour Operators</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              15+ ஆண்டுகள் அனுபவம் கொண்ட நம்பிக்கையான சுற்றுலா நிறுவனம். உங்கள் கனவு பயணத்தை நாங்கள் நிஜமாக்குகிறோம்.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/profile.php?id=61570715695145" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-gold-400/20 border border-white/10 flex items-center justify-center text-white/60 hover:text-gold-400 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/madhumalathi151/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-gold-400/20 border border-white/10 flex items-center justify-center text-white/60 hover:text-gold-400 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@Srinivasa_tour" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-gold-400/20 border border-white/10 flex items-center justify-center text-white/60 hover:text-gold-400 transition-all">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gold-400 font-bold text-sm uppercase tracking-wider mb-5">விரைவு இணைப்புகள்</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-gold-400 text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tour Types */}
          <div>
            <h4 className="text-gold-400 font-bold text-sm uppercase tracking-wider mb-5">சுற்றுலா வகைகள்</h4>
            <ul className="space-y-3">
              {tourTypes.map((tour) => (
                <li key={tour}>
                  <Link
                    to="/packages"
                    className="text-white/60 hover:text-gold-400 text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {tour}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold-400 font-bold text-sm uppercase tracking-wider mb-5">தொடர்பு</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white/80 text-sm font-medium text-gold-400 mb-1">Head Office</p>
                  <p className="text-white/80 text-sm">19/34, Venkataraman Street,</p>
                  <p className="text-white/80 text-sm">Perambur, Chennai - 600 011.</p>
                  <p className="text-white/60 text-xs mt-0.5">(Opp. Railway Station & Bus Stand)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white/80 text-sm font-medium text-gold-400 mb-1">Branch</p>
                  <p className="text-white/80 text-sm">No. 10, 1st Cross Street,</p>
                  <p className="text-white/80 text-sm">Kalyan Nagar, West Tambaram,</p>
                  <p className="text-white/80 text-sm">Chennai - 600 045.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white/80 text-sm">93848 54560, 93848 54561</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            © 2026 ஸ்ரீநிவாசா டூர் ஆபரேட்டர்ஸ். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.
          </p>
          <p className="text-white/30 text-xs">ISO 9001:2015 சான்றிதழ் பெற்ற நிறுவனம்</p>
        </div>
      </div>
    </footer>
  );
}
