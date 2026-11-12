/**
 * Shared content types for Firestore documents.
 * Images are always stored as references (URL + R2 object key) — never as binary data.
 */
import type { Timestamp } from 'firebase/firestore';

export type ContentStatus = 'active' | 'inactive';

export interface ImageRef {
  url: string;
  /** R2 object key. Empty for legacy images bundled in /public. */
  key?: string;
  /** Firestore id of the media library entry, when uploaded through the admin panel. */
  mediaId?: string;
  alt?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

/** A YouTube Short attached to a package (only the ID + metadata is stored, never the video). */
export interface TravelVideo {
  videoId: string;
  /** The URL the admin pasted (kept for reference; playback always uses videoId). */
  url: string;
  title: string;
  location: string;
  description: string;
  enabled: boolean;
  displayOrder: number;
}

export interface TourPackage {
  id: string;
  title: string;
  slug: string;
  /** Previous slugs so that old links keep working after a slug change. */
  slugHistory?: string[];
  shortDescription: string;
  fullDescription: string;
  destinationId: string;
  categoryId: string;
  durationDays: number;
  durationNights: number;
  /** null → "contact us" pricing */
  price: number | null;
  discountPrice: number | null;
  priceNote: string;
  startingLocation: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  importantInfo: string;
  featured: boolean;
  status: ContentStatus;
  featuredImage: ImageRef | null;
  gallery: ImageRef[];
  /** Optional — packages created before Travel Reels existed have no such field. */
  travelVideos?: TravelVideo[];
  sortOrder: number;
  /** URLs of uploaded media referenced by this document (used for safe media deletion). */
  mediaRefs?: string[];
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: ImageRef | null;
  country: string;
  state: string;
  status: ContentStatus;
  mediaRefs?: string[];
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type TagColor = 'amber' | 'emerald' | 'blue' | 'rose' | 'violet' | 'teal';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: ImageRef | null;
  tagColor: TagColor;
  status: ContentStatus;
  sortOrder: number;
  /** Numeric display order alias kept in sync with sortOrder for backward compatibility. */
  displayOrder?: number;
  mediaRefs?: string[];
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  tour: string;
  text: string;
  rating: number;
  color: string;
  status: ContentStatus;
  sortOrder: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

/** Metadata for an image stored in Cloudflare R2 (collection: media). */
export interface MediaItem {
  id: string;
  /** R2 object key returned by the Worker */
  key: string;
  /** Final public URL returned by the Worker */
  url: string;
  /** Original file name chosen by the admin */
  fileName: string;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
  folder: string;
  uploadedBy?: string;
  uploadedAt?: Timestamp | null;
}

export type AdminRole = 'admin' | 'editor';

export interface AdminUser {
  id: string; // Firebase Auth UID
  email: string;
  name?: string;
  role: AdminRole;
  active: boolean;
  createdAt?: Timestamp | null;
}

export interface ActivityLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'upload' | 'import';
  entity: string;
  entityId?: string;
  entityName?: string;
  uid: string;
  userEmail: string;
  createdAt?: Timestamp | null;
}

/* ─── Homepage singletons (collection: homepage) ─── */

export interface HeroContent {
  badge: string;
  headingPrefix: string;
  headingHighlight: string;
  headingSuffix: string;
  description: string;
  backgroundImages: ImageRef[];
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel: string;
  phone: string;
  stats: { value: string; label: string }[];
  mediaRefs?: string[];
}

export interface FeaturedSectionContent {
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  /** Manually picked & ordered packages. Empty → packages flagged as featured. */
  packageIds: string[];
  limit: number;
}

export interface DestinationsSectionContent {
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  destinationIds: string[];
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  image: ImageRef | null;
  buttonLabel: string;
  link: string;
  active: boolean;
}

export interface BannersSectionContent {
  enabled: boolean;
  items: PromoBanner[];
  mediaRefs?: string[];
}

export interface AboutSectionContent {
  badge: string;
  title: string;
  subtitle: string;
  reasons: { title: string; description: string }[];
}

export interface CtaSectionContent {
  badge: string;
  headingPrefix: string;
  headingHighlight: string;
  description: string;
  primaryLabel: string;
  primaryLink: string;
  secondaryLabel: string;
  phone: string;
}

export interface TestimonialsSectionContent {
  badge: string;
  title: string;
  subtitle: string;
}

export interface ReelsSectionContent {
  enabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  videos: TravelVideo[];
}

export interface HomepageContent {
  hero: HeroContent;
  featured: FeaturedSectionContent;
  destinations: DestinationsSectionContent;
  banners: BannersSectionContent;
  about: AboutSectionContent;
  reels: ReelsSectionContent;
  testimonials: TestimonialsSectionContent;
  cta: CtaSectionContent;
}

export type HomepageSectionKey = keyof HomepageContent;
