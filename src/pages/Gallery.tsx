import { motion } from 'framer-motion';
import { useState } from 'react';
import { X, Download } from 'lucide-react';

const galleryImages = [
  { src: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery1.webp', title: 'தாஜ்மஹால், ஆக்ரா', category: 'இந்தியா' },
  { src: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery2.webp', title: 'ஜெய்ப்பூர் அரண்மனை', category: 'இந்தியா' },
  { src: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery3.webp', title: 'பாலி கோவில், இந்தோனேசியா', category: 'வெளிநாடு' },
  { src: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery4.webp', title: 'ஸ்விஸ் ஆல்ப்ஸ்', category: 'வெளிநாடு' },
  { src: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery5.webp', title: 'முன்னார் தேயிலை தோட்டம்', category: 'இந்தியா' },
  { src: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery6.webp', title: 'இலங்கை கடற்கரை', category: 'வெளிநாடு' },
  { src: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/homepage/pilgrimage.webp', title: 'திருப்பதி கோவில்', category: 'யாத்திரை' },
  { src: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package2.webp', title: 'கோவா கடற்கரை', category: 'இந்தியா' },
  { src: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package3.webp', title: 'சிங்கப்பூர் மரினா பே', category: 'வெளிநாடு' },
  { src: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package4.webp', title: 'மாலத்தீவு தீவுகள்', category: 'வெளிநாடு' },
  { src: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package5.webp', title: 'பாங்காக் அரண்மனை', category: 'வெளிநாடு' },
  { src: 'https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package6.webp', title: 'ராமேஸ்வரம் கோவில்', category: 'யாத்திரை' },
];

const categories = ['அனைத்தும்', 'யாத்திரை', 'இந்தியா', 'வெளிநாடு'];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('அனைத்தும்');

  const filteredImages =
    activeFilter === 'அனைத்தும்'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeFilter);

  const handleDownload = (imageSrc: string) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = imageSrc.split('/').pop() || 'image.jpg';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-navy-950 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/gallery1.webp"
            alt="Gallery"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 to-navy-950" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 bg-gold-400/10 text-gold-400 text-sm font-semibold rounded-full font-tamil mb-4">
              புகைப்படங்கள்
            </span>
            <h1 className="font-tamil text-[1.75rem] leading-tight min-[375px]:text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 text-balance [overflow-wrap:anywhere]">
              எங்கள் பயண கேலரி
            </h1>
            <p className="font-tamil text-white/60 text-lg max-w-2xl mx-auto">
              எங்கள் பயணிகள் பதிவு செய்த அழகிய நினைவுகள்
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12 sm:py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter */}
          <div className="flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3 mb-8 sm:mb-14 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`shrink-0 whitespace-nowrap px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-tamil font-semibold text-sm transition-all duration-300 ${
                  activeFilter === cat
                    ? 'bg-navy-900 text-white shadow-md shadow-navy-950/20'
                    : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.src}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="gallery-zoom group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer aspect-square sm:aspect-[4/3] bg-slate-100"
                onClick={() => setSelectedImage(image.src)}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-300">
                  <p className="font-tamil text-white font-semibold text-xs sm:text-sm line-clamp-1">{image.title}</p>
                  <p className="font-tamil text-white/70 text-[11px] sm:text-xs">{image.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-navy-950/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Download */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(selectedImage);
            }}
            className="absolute top-4 right-20 w-12 h-12 rounded-full bg-gold-400 hover:bg-gold-500 flex items-center justify-center text-navy-950 transition-colors z-10 shadow-lg shadow-gold-500/30"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>

          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 25 }}
            src={selectedImage}
            alt="Gallery"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </>
  );
}
