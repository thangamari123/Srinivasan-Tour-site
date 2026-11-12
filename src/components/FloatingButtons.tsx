import { Phone, MessageCircle } from 'lucide-react';
import '../styles/hero.css';

const WHATSAPP = 'https://wa.me/919384854560?text=வணக்கம்! சுற்றுலா பற்றிய தகவல் வேண்டும்';

export default function FloatingButtons() {
  return (
    <>
      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="h-fab h-fab-wa font-tamil" aria-label="Chat on WhatsApp">
        <MessageCircle className="w-7 h-7 fill-current" aria-hidden="true" />
        <span className="h-fab-tip" aria-hidden="true">WhatsApp செய்யுங்கள்</span>
      </a>
      <a href="tel:+919384854560" className="h-fab h-fab-call font-tamil" aria-label="Call us">
        <Phone className="w-6 h-6 fill-current h-ring-icon" aria-hidden="true" />
        <span className="h-fab-tip" aria-hidden="true">இப்போதே அழைக்கவும்</span>
      </a>
    </>
  );
}
