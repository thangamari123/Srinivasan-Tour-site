import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fading out after 2 seconds
    const timer = setTimeout(() => {
      setIsFading(true);
      // Remove from DOM after fade transition completes
      setTimeout(() => {
        setLoading(false);
      }, 500); // 500ms fade duration
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-navy-950 transition-opacity duration-500 ease-in-out ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background pattern/glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-gold-500/10 blur-[120px] rounded-full mix-blend-overlay"></div>
        <div className="absolute top-[80%] right-[10%] w-[40%] h-[40%] bg-gold-400/10 blur-[100px] rounded-full mix-blend-overlay"></div>
      </div>

      <div className="relative flex flex-col items-center z-10 w-full max-w-md px-8">
        {/* Logo with subtle floating animation */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 animate-float">
          <div className="absolute inset-0 bg-gold-400/20 rounded-full blur-xl animate-pulse"></div>
          <img
            src="/images/logo.png"
            alt="Srinivasa Tour Operators"
            className="relative w-full h-full object-cover rounded-2xl shadow-2xl shadow-gold-500/20"
          />
        </div>
        
        {/* Brand Name */}
        <h1 className="text-white font-tamil font-bold text-2xl sm:text-3xl mb-1 tracking-wide drop-shadow-lg text-center">
          ஸ்ரீநிவாசா
        </h1>
        <p className="text-gold-400 font-tamil text-sm sm:text-base tracking-[0.25em] uppercase mb-12 font-medium drop-shadow-md text-center">
          Tour Operators
        </p>

        {/* Professional Travel Loader */}
        <div className="w-full relative flex items-center mb-6">
          {/* Track */}
          <div className="absolute w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
             {/* Progress Fill */}
             <div className="h-full bg-gradient-to-r from-gold-500/20 via-gold-400 to-gold-300 animate-[progress_2s_ease-in-out_forwards]"></div>
          </div>
          
          {/* Flying Plane */}
          <div className="absolute text-gold-400 animate-[fly_2s_ease-in-out_forwards]">
            <Plane className="w-6 h-6 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
          </div>
        </div>

        {/* Loading text */}
        <p className="text-white/60 text-xs tracking-[0.2em] uppercase animate-pulse">
          Your Journey Begins...
        </p>
      </div>
    </div>
  );
}
