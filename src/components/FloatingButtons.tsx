import { Phone } from 'lucide-react';
import '../styles/hero.css';

const WHATSAPP = 'https://wa.me/919384854560?text=வணக்கம்! சுற்றுலா பற்றிய தகவல் வேண்டும்';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 3C8.82 3 3 8.82 3 16c0 2.54.73 4.91 1.99 6.91L3.55 28.45l5.69-1.49A12.93 12.93 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.6c-2.21 0-4.27-.66-6-1.79l-.43-.28-3.38.89.9-3.29-.28-.45A10.55 10.55 0 0 1 5.4 16C5.4 10.15 10.15 5.4 16 5.4S26.6 10.15 26.6 16 21.85 26.6 16 26.6z"
      />
      <path d="M21.84 18.88c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.58-.95-.85-1.59-1.89-1.78-2.21-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.42 4.79.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.38.19-1.51-.08-.13-.29-.21-.61-.37z" />
    </svg>
  );
}

export default function FloatingButtons() {
  return (
    <>
      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="h-fab h-fab-wa font-tamil" aria-label="Chat on WhatsApp">
        <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8" />
        <span className="h-fab-tip" aria-hidden="true">WhatsApp செய்யுங்கள்</span>
      </a>
      <a href="tel:+919384854560" className="h-fab h-fab-call font-tamil" aria-label="Call us">
        <Phone className="w-6 h-6 fill-current h-ring-icon" aria-hidden="true" />
        <span className="h-fab-tip" aria-hidden="true">இப்போதே அழைக்கவும்</span>
      </a>
    </>
  );
}
