import { Phone, MessageCircle } from 'lucide-react';

export default function FloatingButtons() {
  return (
    <>
      {/* Desktop Floating Buttons (Hidden on mobile) */}
      <div className="fixed bottom-8 right-8 hidden sm:flex flex-col items-end gap-4 z-50">
        {/* WhatsApp Button */}
        <a
          href="https://wa.me/919384854560?text=வணக்கம்! சுற்றுலா பற்றிய தகவல் வேண்டும்"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-16 h-16 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-2xl shadow-[#25D366]/30 hover:scale-110 transition-all duration-300"
          aria-label="WhatsApp"
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
          <MessageCircle className="w-8 h-8 relative z-10 fill-current" />
          {/* Tooltip */}
          <span className="absolute right-20 top-1/2 -translate-y-1/2 px-4 py-2 bg-navy-950 text-white text-sm font-tamil font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl border border-white/10">
            WhatsApp செய்யுங்கள்
          </span>
        </a>

        {/* Call Button */}
        <a
          href="tel:+919384854560"
          className="group relative w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-navy-950 flex items-center justify-center shadow-2xl shadow-gold-500/30 hover:scale-110 transition-all duration-300"
          aria-label="Call"
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-gold-400 animate-ping opacity-20" />
          <Phone className="w-8 h-8 relative z-10 fill-current" />
          {/* Tooltip */}
          <span className="absolute right-20 top-1/2 -translate-y-1/2 px-4 py-2 bg-navy-950 text-white text-sm font-tamil font-semibold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl border border-white/10">
            இப்போதே அழைக்கவும்
          </span>
        </a>
      </div>

      {/* Mobile Sticky CTA Bar (Visible only on mobile) */}
      <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/95 backdrop-blur-xl p-2 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-2 border border-gray-100">
          <a
            href="tel:+919384854560"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#007AFF] text-white font-bold rounded-[1.5rem] shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
          >
            <Phone className="w-5 h-5 fill-current" />
            <span className="text-sm tracking-tight">Call Now</span>
          </a>
          <a
            href="https://wa.me/919384854560"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#00C853] text-white font-bold rounded-[1.5rem] shadow-lg shadow-green-500/25 active:scale-95 transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span className="text-sm tracking-tight">WhatsApp</span>
          </a>
        </div>
      </div>
    </>
  );
}
