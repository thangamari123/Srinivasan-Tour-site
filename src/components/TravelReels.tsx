/**
 * Travel Reels (YouTube Shorts) — shared by the public website and the admin
 * package-editor preview, so both render identical cards.
 *
 * - Thumbnails are lazy-loaded from YouTube's image CDN.
 * - The YouTube iframe is created only after a click, one at a time.
 * - Embed URLs are built from a validated 11-character video ID only.
 * - No view counts or engagement numbers are shown (we have no verified data).
 */
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Play, X } from 'lucide-react';
import { isValidVideoId, youTubeEmbedUrl, youTubeThumbnail, youTubeWatchUrl } from '../lib/youtube';

export interface ReelVideo {
  videoId: string;
  title: string;
  location: string;
  description?: string;
}

/* ─── Card ─── */

export function TravelReelCard({ video, onOpen, index = 0 }: { video: ReelVideo; onOpen: () => void; index?: number }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.08, 0.4) }}
      onClick={onOpen}
      aria-label={`Play video: ${video.title}`}
      className="group relative block w-full rounded-2xl overflow-hidden aspect-[9/16] bg-navy-950 cursor-pointer shadow-lg shadow-navy-950/10 border border-navy-100/20 hover:border-gold-400/30 hover:shadow-xl hover:shadow-navy-950/20 hover:-translate-y-1 transition-all duration-300 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
    >
      {/* 4:3 YouTube thumbnail, cropped to the 9:16 card */}
      <img
        src={youTubeThumbnail(video.videoId)}
        alt={video.title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-navy-950/30 pointer-events-none" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-gold-400/40 transition-all duration-300">
          <Play className="w-6 h-6 text-white fill-white ml-1" />
        </div>
      </div>

      {/* YouTube Shorts badge */}
      <div className="absolute top-3 left-3">
        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-600 to-red-500 rounded-md shadow-sm">
          <Play className="w-2.5 h-2.5 text-white fill-white" />
          <span className="text-white text-[11px] font-bold uppercase tracking-wider">Shorts</span>
        </div>
      </div>

      {/* Title & location */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p className="font-tamil text-white font-bold text-sm leading-tight mb-1 line-clamp-2">{video.title}</p>
        {video.location && <p className="font-tamil text-white/70 text-xs truncate">📍 {video.location}</p>}
      </div>
    </motion.button>
  );
}

/* ─── Player modal (iframe created only while open) ─── */

export function ReelPlayer({ videos, index, onClose, onIndex }: { videos: ReelVideo[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const video = videos[index];
  const embed = video ? youTubeEmbedUrl(video.videoId) : null;
  const total = videos.length;
  const next = useCallback(() => onIndex((index + 1) % total), [index, total, onIndex]);
  const prev = useCallback(() => onIndex((index - 1 + total) % total), [index, total, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && total > 1) next();
      if (e.key === 'ArrowLeft' && total > 1) prev();
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, next, prev, total]);

  if (!video || !embed) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
    >
      <button type="button" onClick={onClose} aria-label="Close video" className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-20">
        <X className="w-6 h-6" />
      </button>

      {total > 1 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous video" className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-20">
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        {/* 9:16 player sized to fit both width and height of the screen */}
        <div className="relative aspect-[9/16] h-[min(78vh,calc((100vw-7rem)*16/9))] max-h-[720px] rounded-2xl overflow-hidden shadow-2xl shadow-gold-500/10 border border-white/10 bg-black">
          <iframe
            key={video.videoId}
            src={embed}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ border: 'none' }}
          />
        </div>
        <div className="text-center max-w-sm">
          <p className="font-tamil text-white font-bold text-base">{video.title}</p>
          {video.location && <p className="font-tamil text-white/60 text-sm">📍 {video.location}</p>}
          <a href={youTubeWatchUrl(video.videoId)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-xs text-white/60 hover:text-white">
            Open on YouTube <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {total > 1 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next video" className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-20">
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>,
    document.body,
  );
}

/* ─── Grid (cards + player) ─── */

export function TravelReelsGrid({ videos }: { videos: ReelVideo[] }) {
  const valid = videos.filter((v) => isValidVideoId(v.videoId));
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const close = () => setOpenIndex(null);

  return (
    <>
      {/* 1 card on very narrow phones, 2 on phones/tablets, 4 on desktop */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[260px] min-[400px]:max-w-none mx-auto">
        {valid.map((v, i) => (
          <TravelReelCard key={v.videoId} video={v} index={i} onOpen={() => setOpenIndex(i)} />
        ))}
      </div>
      {openIndex !== null && <ReelPlayer videos={valid} index={openIndex} onClose={close} onIndex={setOpenIndex} />}
    </>
  );
}

/* ─── Section (public website) ─── */

export default function TravelReelsSection({
  videos,
  title = 'எங்கள் பயணங்கள் சொல்வது',
  subtitle = 'பயணிகளின் நிஜமான அனுபவங்களை வீடியோவில் காணுங்கள்',
  className = 'bg-white border-t border-gray-200 py-16 sm:py-20',
}: {
  videos: ReelVideo[];
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  if (!videos.some((v) => isValidVideoId(v.videoId))) return null; // hide when empty
  return (
    <section className={className}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="eyebrow mb-3">
            <Play className="w-3 h-3 fill-red-500 text-red-500" /> Travel Reels
          </span>
          <h2 className="font-tamil text-2xl sm:text-4xl font-bold text-navy-950 mb-2 sm:mb-3">{title}</h2>
          <p className="font-tamil text-navy-600/70 text-sm sm:text-base">{subtitle}</p>
        </div>
        <TravelReelsGrid videos={videos} />
      </div>
    </section>
  );
}
