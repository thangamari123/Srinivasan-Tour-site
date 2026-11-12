/**
 * Maps Firestore TourPackage documents to the PackageData shape that the existing
 * public components already render, so their markup stays unchanged.
 */
import type { PackageData } from '../data/packages';
import type { Category, Destination, ItineraryDay, TourPackage, TravelVideo } from '../types/content';
import { isValidVideoId } from './youtube';
import { TAG_COLOR_CLASSES } from '../data/defaultContent';
import { resolveMediaUrl } from './r2Media';

export interface PackageView extends PackageData {
  id: string;
  featured: boolean;
  sortOrder: number;
  slugHistory: string[];
  startingLocation: string;
  destinationName: string;
  destinationSlug: string;
  itinerary: ItineraryDay[];
  importantInfo: string;
  /** Original price shown struck-through when a discount price exists. */
  originalPrice: string | null;
  /** Enabled YouTube Shorts with valid IDs, in display order. */
  travelVideos: { videoId: string; title: string; location: string; description: string }[];
}

/** Enabled, valid videos sorted by displayOrder. Tolerates packages without the field. */
export function publicTravelVideos(videos: TravelVideo[] | undefined, fallbackLocation = '') {
  return (Array.isArray(videos) ? videos : [])
    .filter((v) => v && v.enabled !== false && isValidVideoId(v.videoId))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((v) => ({
      videoId: v.videoId,
      title: String(v.title ?? '').slice(0, 120),
      location: String(v.location || fallbackLocation).slice(0, 80),
      description: String(v.description ?? '').slice(0, 300),
    }));
}

export function formatPrice(value: number | null | undefined): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return `₹${value.toLocaleString('en-IN')}`;
}

export function formatDuration(days: number, nights: number): string {
  const d = `${days} நாட்கள்`;
  return nights > 0 ? `${d} / ${nights} இரவுகள்` : d;
}

const CONTACT_PRICE = 'தொடர்பு கொள்ளவும்';
const CONTACT_PRICE_NOTE = 'விவரங்களுக்கு அழைக்கவும்';

export function toPackageView(
  pkg: TourPackage,
  categoriesById: Map<string, Category>,
  destinationsById: Map<string, Destination>,
): PackageView {
  const category = categoriesById.get(pkg.categoryId);
  const destination = destinationsById.get(pkg.destinationId);
  const colors = TAG_COLOR_CLASSES[category?.tagColor ?? 'emerald'] ?? TAG_COLOR_CLASSES.emerald;

  const gallery = (pkg.gallery ?? []).map((g) => resolveMediaUrl(g.url)).filter(Boolean);
  const featuredUrl = resolveMediaUrl(pkg.featuredImage?.url);
  const cover = featuredUrl || gallery[0] || resolveMediaUrl('https://srinivasa-media-api.srinivasatour23.workers.dev/api/images/website/gallery/package1.webp');
  const images = featuredUrl ? [cover, ...gallery.filter((u) => u !== cover)] : gallery;

  const hasDiscount = pkg.discountPrice !== null && pkg.discountPrice !== undefined && pkg.price !== null;
  const price = formatPrice(hasDiscount ? pkg.discountPrice : pkg.price);

  return {
    id: pkg.id,
    slug: pkg.slug,
    title: pkg.title,
    duration: formatDuration(pkg.durationDays || 0, pkg.durationNights || 0),
    category: category?.slug ?? '',
    categoryTag: category?.name ?? '',
    tagColor: colors.solid,
    image: cover,
    images: images.length ? images : [cover],
    shortDescription: pkg.shortDescription ?? '',
    fullDescription: pkg.fullDescription ?? '',
    placesToVisit: pkg.highlights ?? [],
    inclusions: pkg.inclusions ?? [],
    exclusions: pkg.exclusions ?? [],
    price: price ?? CONTACT_PRICE,
    priceNote: pkg.priceNote || (price ? '' : CONTACT_PRICE_NOTE),
    originalPrice: hasDiscount ? formatPrice(pkg.price) : null,
    featured: Boolean(pkg.featured),
    sortOrder: pkg.sortOrder ?? 0,
    slugHistory: pkg.slugHistory ?? [],
    startingLocation: pkg.startingLocation ?? '',
    destinationName: destination?.name ?? '',
    destinationSlug: destination?.slug ?? '',
    itinerary: pkg.itinerary ?? [],
    importantInfo: pkg.importantInfo ?? '',
    travelVideos: publicTravelVideos(pkg.travelVideos, destination?.name ?? ''),
  };
}

/** Legacy URLs that were renamed before the admin panel existed. */
const LEGACY_SLUG_ALIASES: Record<string, string> = {
  'bangalore-dharmasthala-tour-7-days': 'bangalore-mysore-coorg-6-days',
  'madhya-pradesh-tour-11-days': 'madhya-pradesh-tour-13-days',
  'dubai-tour': 'dubai-tour-4-days',
  'thailand-bangkok-pattaya-5-days': 'thailand-bangkok-pattaya-4-days',
  'sikkim-darjeeling-tour-11-days': 'kolkata-tour-11-days',
};

export function findPackageBySlug(packages: PackageView[], slug: string): PackageView | undefined {
  const target = LEGACY_SLUG_ALIASES[slug] ?? slug;
  return (
    packages.find((p) => p.slug === slug || p.slug === target) ??
    packages.find((p) => p.slugHistory.includes(slug))
  );
}
