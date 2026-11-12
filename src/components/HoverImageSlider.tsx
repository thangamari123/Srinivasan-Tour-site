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
    if (!isHovered || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 1500); // Change image every 1.5 seconds
    return () => clearInterval(timer);
  }, [isHovered, images.length]);

  const stopHover = () => {
    setIsHovered(false);
    setCurrentIndex(0);
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={stopHover}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={stopHover}
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

      {/* Indicators removed */}
    </div>
  );
}
