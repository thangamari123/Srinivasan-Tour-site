import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Globe, ChevronDown } from 'lucide-react';

const navLinks = [
  { name: 'முகப்பு', path: '/' },
  { name: 'எங்களைப் பற்றி', path: '/about' },
  { name: 'தொகுப்புகள்', path: '/packages' },
  { name: 'கேலரி', path: '/gallery' },
  { name: 'தொடர்பு', path: '/contact' },
];

const languages = [
  { name: 'தமிழ்', code: 'ta' },
  { name: 'English', code: 'en' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    // Check for existing google translate cookie to sync state
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const googTrans = getCookie('googtrans');
    if (googTrans) {
      const langCode = googTrans.split('/').pop();
      const lang = languages.find(l => l.code === langCode);
      if (lang) setCurrentLang(lang);
    }
  }, []);

  const handleLanguageChange = (lang: typeof languages[0]) => {
    setCurrentLang(lang);
    setIsLangOpen(false);

    // Set Google Translate cookie
    const domain = window.location.hostname === 'localhost' ? '' : `domain=.${window.location.hostname.split('.').slice(-2).join('.')};`;
    document.cookie = `googtrans=/ta/${lang.code}; ${domain}path=/`;
    document.cookie = `googtrans=/ta/${lang.code}; path=/`; // Fallback for various path levels

    // Refresh to apply translation
    window.location.reload();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-tamil ${scrolled
          ? 'bg-navy-950/95 backdrop-blur-xl shadow-2xl shadow-navy-950/20'
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <img
              src="/images/logo.webp"
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.path
                    ? 'text-gold-400 bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Dropdown - Desktop */}
            <div className="relative hidden sm:block" ref={langRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/5"
              >
                <Globe className="w-4 h-4 text-gold-400" />
                <span className="text-xs font-semibold uppercase tracking-wider">{currentLang.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              <div
                className={`absolute right-0 mt-2 w-36 bg-navy-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-top-right z-50 ${isLangOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                  }`}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 flex items-center justify-between ${currentLang.code === lang.code
                        ? 'text-gold-400 bg-white/10'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    {lang.name}
                    {currentLang.code === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />}
                  </button>
                ))}
              </div>
            </div>

            <a
              href="tel:+919384854560"
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
        className={`lg:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="bg-navy-950/98 backdrop-blur-xl border-t border-white/5 px-4 py-6 space-y-4">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-xl text-center text-base font-semibold transition-all ${location.pathname === link.path
                    ? 'text-gold-400 bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {/* Language Switcher Mobile */}
            <div className="flex items-center justify-center gap-2 p-1 bg-white/5 rounded-xl">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${currentLang.code === lang.code
                      ? 'bg-gold-400 text-navy-950 shadow-lg shadow-gold-500/20'
                      : 'text-white/60 hover:text-white'
                    }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            <a
              href="tel:+919384854560"
              className="flex items-center justify-center gap-2 w-full px-5 py-4 bg-gradient-to-r from-gold-400 to-gold-500 text-navy-950 font-bold text-sm rounded-xl shadow-lg shadow-gold-500/25 active:scale-95 transition-transform"
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
