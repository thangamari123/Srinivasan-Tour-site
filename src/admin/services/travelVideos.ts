import { isValidVideoId } from '../../lib/youtube';
import type { TravelVideo } from '../../types/content';

export const MAX_TRAVEL_VIDEOS = 20;
export const TRAVEL_VIDEO_LIMITS = { title: 120, location: 80, description: 300, url: 300 };

/** Keep displayOrder in sync with list position (1-based). */
export const renumberVideos = (list: TravelVideo[]) => list.map((v, i) => ({ ...v, displayOrder: i + 1 }));

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
