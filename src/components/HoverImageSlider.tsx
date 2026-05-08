import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HoverImageSliderProps {
  images: string[];
  title: string;
}

export default function HoverImageSlider({ images, title }: HoverImageSliderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isHovered && images.length > 1) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 1500); // Change image every 1.5 seconds
    } else {
      setCurrentIndex(0); // Reset to first image when not hovering
    }
    return () => clearInterval(timer);
  }, [isHovered, images.length]);

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} custom={currentIndex}>
        <motion.img
          key={currentIndex}
          custom={currentIndex}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
          src={images[currentIndex]}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Progress indicators at bottom */}
      {isHovered && images.length > 1 && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1.5 z-10">
          {images.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
