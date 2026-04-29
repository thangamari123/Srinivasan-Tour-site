import { motion } from 'framer-motion';
import { useState } from 'react';
import { X, Download } from 'lucide-react';

const galleryImages = [
  { src: '/images/gallery1.jpg', title: 'தாஜ்மஹால், ஆக்ரா', category: 'இந்தியா' },
  { src: '/images/gallery2.jpg', title: 'ஜெய்ப்பூர் அரண்மனை', category: 'இந்தியா' },
  { src: '/images/gallery3.jpg', title: 'பாலி கோவில், இந்தோனேசியா', category: 'வெளிநாடு' },
  { src: '/images/gallery4.jpg', title: 'ஸ்விஸ் ஆல்ப்ஸ்', category: 'வெளிநாடு' },
  { src: '/images/gallery5.jpg', title: 'முன்னார் தேயிலை தோட்டம்', category: 'இந்தியா' },
  { src: '/images/gallery6.jpg', title: 'இலங்கை கடற்கரை', category: 'வெளிநாடு' },
  { src: '/images/pilgrimage.jpg', title: 'திருப்பதி கோவில்', category: 'யாத்திரை' },
  { src: '/images/package2.jpg', title: 'கோவா கடற்கரை', category: 'இந்தியா' },
  { src: '/images/package3.jpg', title: 'சிங்கப்பூர் மரினா பே', category: 'வெளிநாடு' },
  { src: '/images/package4.jpg', title: 'மாலத்தீவு தீவுகள்', category: 'வெளிநாடு' },
  { src: '/images/package5.jpg', title: 'பாங்காக் அரண்மனை', category: 'வெளிநாடு' },
  { src: '/images/package6.jpg', title: 'ராமேஸ்வரம் கோவில்', category: 'யாத்திரை' },
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
            src="/images/gallery1.jpg"
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
            <h1 className="font-tamil text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              எங்கள் பயண கேலரி
            </h1>
            <p className="font-tamil text-white/60 text-lg max-w-2xl mx-auto">
              எங்கள் பயணிகள் பதிவு செய்த அழகிய நினைவுகள்
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-6 py-3 rounded-2xl font-tamil font-semibold text-sm transition-all duration-300 ${
                  activeFilter === cat
                    ? 'bg-gradient-to-r from-navy-400 to-navy-600 text-white shadow-lg shadow-navy-400/25'
                    : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.src}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="gallery-zoom group relative rounded-2xl overflow-hidden cursor-pointer aspect-[4/3]"
                onClick={() => setSelectedImage(image.src)}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="font-tamil text-white font-semibold text-sm">{image.title}</p>
                  <p className="font-tamil text-white/60 text-xs">{image.category}</p>
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
