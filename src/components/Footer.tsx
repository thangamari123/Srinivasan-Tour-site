import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Facebook, Instagram, Youtube, ChevronDown, ShieldCheck } from 'lucide-react';
import '../styles/home.css';

const quickLinks = [
  { name: 'முகப்பு', path: '/' },
  { name: 'எங்களைப் பற்றி', path: '/about' },
  { name: 'தொகுப்புகள்', path: '/packages' },
  { name: 'கேலரி', path: '/gallery' },
  { name: 'தொடர்பு', path: '/contact' },
];

const tourTypes = [
  'ஷீரடி ஸ்ரீ சாய் பாபா யாத்திரை',
  'புனித காசி யாத்திரை',
  'பஞ்ச துவாரகா யாத்திரை',
  'அழகிய காஷ்மீர் சுற்றுலா',
  'சிங்கப்பூர் & மலேசியா சுற்றுலா',
  'அதிசயங்களின் நகரம் துபாய்',
];

const socials = [
  { href: 'https://www.facebook.com/profile.php?id=61570715695145', label: 'Facebook', icon: Facebook },
  { href: 'https://www.instagram.com/madhumalathi151/', label: 'Instagram', icon: Instagram },
  { href: 'https://www.youtube.com/@Srinivasa_tour', label: 'YouTube', icon: Youtube },
];

function useIsMobile() {
  const query = '(max-width: 767px)';
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMobile(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return mobile;
}

/** Link column: always open on tablet/desktop, a <details> accordion on mobile. */
function LinkColumn({ title, mobile, children }: { title: string; mobile: boolean; children: ReactNode }) {
  return (
    <details className="ft-col" open={mobile ? undefined : true}>
      <summary
        className="ft-title"
        onClick={(e) => {
          if (!mobile) e.preventDefault(); // not collapsible on larger screens
        }}
      >
        <h4>{title}</h4>
        <ChevronDown className="ft-chev w-4 h-4" aria-hidden="true" />
      </summary>
      {children}
    </details>
  );
}

export default function Footer() {
  const mobile = useIsMobile();

  return (
    <footer className="ft font-tamil">
      <div className="h-container">
        <div className="ft-grid">
          {/* Brand */}
          <div className="ft-brand-col">
            <div className="ft-brand-head">
              <Link to="/" className="ft-brand">
                <span className="ft-tile">
                  <img src="https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/logo/logo.webp" alt="ஸ்ரீநிவாசா Tour Operators" width={46} height={46} loading="lazy" />
                </span>
                <span>
                  <span className="ft-name block">ஸ்ரீநிவாசா</span>
                  <span className="ft-sub block">Tour Operators</span>
                </span>
              </Link>
              <div className="ft-social">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                    <s.icon className="w-[18px] h-[18px]" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
            <p className="ft-about">
              15+ ஆண்டுகள் அனுபவம் கொண்ட நம்பிக்கையான சுற்றுலா நிறுவனம். உங்கள் கனவு பயணத்தை நாங்கள் நிஜமாக்குகிறோம்.
            </p>
          </div>

          {/* Quick links */}
          <LinkColumn title="விரைவு இணைப்புகள்" mobile={mobile}>
            <ul className="ft-list ft-list-quick">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </LinkColumn>

          {/* Tour types */}
          <LinkColumn title="சுற்றுலா வகைகள்" mobile={mobile}>
            <ul className="ft-list">
              {tourTypes.map((tour) => (
                <li key={tour}>
                  <Link to="/packages">{tour}</Link>
                </li>
              ))}
            </ul>
          </LinkColumn>

          {/* Contact */}
          <div className="ft-contact-col">
            <h4 className="ft-title">தொடர்பு</h4>
            <ul className="ft-contact">
              <li>
                <span className="ft-ci" aria-hidden="true">
                  <MapPin className="w-[18px] h-[18px]" />
                </span>
                <div>
                  <p className="ft-label">Head Office</p>
                  <p className="ft-addr">
                    19/34, Venkataraman Street,{' '}
                    <br className="hidden md:inline" />
                    Perambur, Chennai - 600 011.
                  </p>
                  <p className="ft-addr-note">(Opp. Railway Station & Bus Stand)</p>
                </div>
              </li>
              <li>
                <span className="ft-ci" aria-hidden="true">
                  <MapPin className="w-[18px] h-[18px]" />
                </span>
                <div>
                  <p className="ft-label">Branch</p>
                  <p className="ft-addr">
                    No. 10, 1st Cross Street,{' '}
                    <br className="hidden md:inline" />
                    Kalyan Nagar, West Tambaram,{' '}
                    <br className="hidden md:inline" />
                    Chennai - 600 045.
                  </p>
                </div>
              </li>
              <li>
                <span className="ft-ci ft-ci-solid" aria-hidden="true">
                  <Phone className="w-[18px] h-[18px]" />
                </span>
                <div>
                  <a href="tel:+919384854560" className="ft-phone">93848 54560</a>
                  <span className="text-[#93A0BA]">, </span>
                  <a href="tel:+919384854561" className="ft-phone">93848 54561</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="ft-bottom">
          <p>© 2026 ஸ்ரீநிவாசா டூர் ஆபரேட்டர்ஸ். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
          <p className="ft-iso">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            ISO 9001:2015 சான்றிதழ் பெற்ற நிறுவனம்
          </p>
        </div>
      </div>
    </footer>
  );
}
