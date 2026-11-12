/**
 * YouTube helpers for Travel Reels.
 * Only the 11-character video ID is trusted. Thumbnail / embed / watch URLs are
 * always rebuilt from a validated ID on YouTube's official domains, so arbitrary
 * iframe URLs can never be injected through package data.
 */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be', 'www.youtu.be']);

export function isValidVideoId(id: unknown): id is string {
  return typeof id === 'string' && VIDEO_ID.test(id);
}

/**
 * Extracts the video ID from the supported URL formats:
 *   https://youtube.com/shorts/ID · https://www.youtube.com/shorts/ID
 *   https://youtu.be/ID · https://www.youtube.com/watch?v=ID
 *   https://www.youtube.com/embed/ID · https://m.youtube.com/watch?v=ID
 * Returns null for anything else (other domains, malformed IDs, playlists…).
 */
export function parseYouTubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;

  const segments = url.pathname.split('/').filter(Boolean);
  let id: string | null = null;
  if (host.endsWith('youtu.be')) id = segments[0] ?? null;
  else if (segments[0] === 'watch') id = url.searchParams.get('v');
  else if (['shorts', 'embed', 'live', 'v'].includes(segments[0] ?? '')) id = segments[1] ?? null;

  return isValidVideoId(id) ? id : null;
}

/** Thumbnail from YouTube's image CDN (no API key needed). hqdefault exists for every video. */
export function youTubeThumbnail(id: string): string {
  return isValidVideoId(id) ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
}

/**
 * Official embed URL. Starts muted (browsers only allow muted autoplay, and we never
 * autoplay with sound); `playsinline` keeps it inside the modal on iOS.
 */
export function youTubeEmbedUrl(id: string): string | null {
  if (!isValidVideoId(id)) return null;
  const params = new URLSearchParams({ autoplay: '1', mute: '1', playsinline: '1', rel: '0', modestbranding: '1' });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function youTubeWatchUrl(id: string): string {
  return `https://www.youtube.com/shorts/${id}`;
}
