import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

const navLinks = [
  { name: 'முகப்பு', path: '/' },
  { name: 'எங்களைப் பற்றி', path: '/about' },
  { name: 'தொகுப்புகள்', path: '/packages' },
  { name: 'கேலரி', path: '/gallery' },
  { name: 'தொடர்பு', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-tamil ${
        scrolled
          ? 'bg-navy-950/95 backdrop-blur-xl shadow-2xl shadow-navy-950/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <img
              src="/images/logo.png"
              alt="ஸ்ரீநிவாசா Tour Operators"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/40 transition-all object-cover"
            />
            <div>
              <p className="text-white font-bold text-base sm:text-lg leading-tight tracking-wide">ஸ்ரீநிவாசா</p>
              <p className="text-gold-400 text-[10px] sm:text-xs font-medium tracking-widest uppercase">Tour Operators</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'text-gold-400 bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+919123456789"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-navy-950 font-bold text-sm rounded-xl hover:from-gold-300 hover:to-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105"
            >
              <Phone className="w-4 h-4" />
              அழைக்கவும்
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-navy-950/98 backdrop-blur-xl border-t border-white/5 px-4 py-5 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-3 rounded-xl text-center text-base font-semibold transition-all ${
                location.pathname === link.path
                  ? 'text-gold-400 bg-white/10'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3">
            <a
              href="tel:+919123456789"
              className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-gradient-to-r from-gold-400 to-gold-500 text-navy-950 font-bold text-sm rounded-xl shadow-lg shadow-gold-500/25"
            >
              <Phone className="w-4 h-4" />
              அழைக்கவும்
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
