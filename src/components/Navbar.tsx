import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Globe, ChevronDown, Check, Lock } from 'lucide-react';
import '../styles/hero.css';

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

const PHONE = 'tel:+919384854560';

function readLanguageCookie() {
  const parts = `; ${document.cookie}`.split('; googtrans=');
  const value = parts.length === 2 ? parts.pop()?.split(';').shift() : undefined;
  const code = value?.split('/').pop();
  return languages.find((l) => l.code === code) ?? languages[0];
}

/** Google Translate reads the googtrans cookie; reload to apply (existing behaviour). */
function applyLanguage(code: string) {
  const domain = window.location.hostname === 'localhost' ? '' : `domain=.${window.location.hostname.split('.').slice(-2).join('.')};`;
  document.cookie = `googtrans=/ta/${code}; ${domain}path=/`;
  document.cookie = `googtrans=/ta/${code}; path=/`;
  window.location.reload();
}

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(readLanguageCookie);
  const langRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleLanguageChange = (lang: (typeof languages)[0]) => {
    setCurrentLang(lang);
    setIsLangOpen(false);
    applyLanguage(lang.code);
  };

  const closeAll = useCallback(() => {
    setIsLangOpen(false);
    setIsOpen(false);
  }, []);

  // Close dropdown / sheet on outside click and on Esc
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (langRef.current && !langRef.current.contains(target)) setIsLangOpen(false);
      if (navRef.current && !navRef.current.contains(target)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [closeAll]);

  return (
    <div className="h-nav-wrap font-tamil">
      <div className="h-container" ref={navRef}>
        <nav className="h-nav" aria-label="Main">
          {/* Logo */}
          <Link to="/" className="h-brand" onClick={closeAll}>
            <span className="h-brand-tile">
              <img src="https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/logo/logo.webp" alt="ஸ்ரீநிவாசா Tour Operators" width={46} height={46} />
            </span>
            <span>
              <span className="h-brand-name block">ஸ்ரீநிவாசா</span>
              <span className="h-brand-sub block">Tour Operators</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="h-links">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="h-link" aria-current={isActive(link.path) ? 'page' : undefined}>
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="h-actions">
            <Link to="/admin/login" className="h-admin" onClick={closeAll}>
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              Admin Login
            </Link>

            <div className="h-lang" ref={langRef}>
              <button
                type="button"
                className="h-lang-btn"
                aria-haspopup="listbox"
                aria-expanded={isLangOpen}
                onClick={() => setIsLangOpen((o) => !o)}
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                {currentLang.name}
                <ChevronDown className="h-chev w-4 h-4" aria-hidden="true" />
              </button>
              {isLangOpen && (
                <div className="h-dropdown" role="listbox" aria-label="Language">
                  {languages.map((lang) => {
                    const selected = currentLang.code === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className="h-option"
                        onClick={() => handleLanguageChange(lang)}
                      >
                        {lang.name}
                        {selected && <Check className="w-4 h-4 text-[#8A5A06]" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <a href={PHONE} className="h-call">
              <Phone className="w-[18px] h-[18px] h-ring-icon" aria-hidden="true" />
              அழைக்கவும்
            </a>
          </div>

          {/* Mobile / tablet: call + menu circles */}
          <div className="h-circles">
            <a href={PHONE} className="h-circle h-circle-call" aria-label="அழைக்கவும்">
              <Phone className="w-5 h-5 h-ring-icon" aria-hidden="true" />
            </a>
            <button
              type="button"
              className="h-circle h-circle-menu"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="h-mobile-sheet"
              onClick={() => setIsOpen((o) => !o)}
            >
              {isOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </nav>

        {/* Mobile sheet */}
        {isOpen && (
          <div id="h-mobile-sheet" className="h-sheet">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="h-sheet-link"
                aria-current={isActive(link.path) ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-sheet-divider" />
            <div className="h-sheet-langs" role="group" aria-label="Language">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className="h-sheet-lang"
                  aria-pressed={currentLang.code === lang.code}
                  onClick={() => handleLanguageChange(lang)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
