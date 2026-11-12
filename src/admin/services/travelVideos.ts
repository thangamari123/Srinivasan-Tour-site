import { isValidVideoId } from '../../lib/youtube';
import { defaultHomepage } from '../../data/defaultContent';
import type { ReelsSectionContent, TourPackage, TravelVideo } from '../../types/content';

export const MAX_TRAVEL_VIDEOS = 20;
export const TRAVEL_VIDEO_LIMITS = { title: 120, location: 80, description: 300, url: 300 };

/** Keep displayOrder in sync with list position (1-based). */
export const renumberVideos = (list: TravelVideo[]) => list.map((v, i) => ({ ...v, displayOrder: i + 1 }));

/** Count enabled valid Shorts across active tour packages. */
export const countActivePackageReels = (packages: TourPackage[]) =>
  packages
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + (Array.isArray(p.travelVideos) ? p.travelVideos.filter((v) => v?.enabled !== false && isValidVideoId(v?.videoId)).length : 0), 0);

/** Merge a stored homepage/reels document with safe defaults. */
export function normalizeReelsSection(raw: Record<string, unknown> | undefined): ReelsSectionContent {
  const merged = raw ? { ...defaultHomepage.reels, ...raw } : { ...defaultHomepage.reels };
  return {
    enabled: merged.enabled !== false,
    badge: String(merged.badge ?? defaultHomepage.reels.badge),
    title: String(merged.title ?? defaultHomepage.reels.title),
    subtitle: String(merged.subtitle ?? defaultHomepage.reels.subtitle),
    videos: Array.isArray(merged.videos) ? merged.videos : defaultHomepage.reels.videos,
  };
}

/** Trim, clamp lengths, drop invalid IDs and duplicates, renumber — applied before saving. */
export function sanitizeTravelVideos(list: TravelVideo[] | undefined): TravelVideo[] {
  const seen = new Set<string>();
  const L = TRAVEL_VIDEO_LIMITS;
  return renumberVideos(
    (list ?? [])
      .filter((v) => isValidVideoId(v?.videoId) && !seen.has(v.videoId) && seen.add(v.videoId))
      .slice(0, MAX_TRAVEL_VIDEOS)
      .map((v) => ({
        videoId: v.videoId,
        url: String(v.url ?? '').trim().slice(0, L.url),
        title: String(v.title ?? '').trim().slice(0, L.title),
        location: String(v.location ?? '').trim().slice(0, L.location),
        description: String(v.description ?? '').trim().slice(0, L.description),
        enabled: v.enabled !== false,
        displayOrder: 0,
      })),
  );
}
