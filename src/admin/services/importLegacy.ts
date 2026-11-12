/**
 * One-time migration of the content that used to be hardcoded in the codebase
 * (src/data/packages.ts, homepage components) into the content store.
 * Idempotent: existing categories/packages (matched by slug), testimonials and
 * homepage sections are never overwritten.
 */
import { COLLECTIONS } from '../../lib/firebaseConfig';
import { allPackages } from '../../data/packages';
import { defaultCategories, defaultHomepage, defaultTestimonials } from '../../data/defaultContent';
import r2MigrationMap from '../../data/r2MigrationMap.json';
import type { HomepageSectionKey } from '../../types/content';
import { backend, type BatchSet } from '../data/backend';
import { collectMediaRefs, logActivity, type Actor } from './content';

const keyByUrl = new Map<string, string>(
  Object.values(r2MigrationMap as Record<string, { key: string; url: string }>).map((e) => [e.url, e.key]),
);

const toImageRef = (url: string) => {
  const key = keyByUrl.get(url);
  return key ? { url, key } : { url };
};

export interface ImportSummary {
  categories: number;
  packages: number;
  testimonials: number;
  homepageSections: number;
}

export async function importLegacyContent(actor: Actor): Promise<ImportSummary> {
  const db = backend();
  const [cats, pkgs, tests, home] = await Promise.all([
    db.list(COLLECTIONS.categories),
    db.list(COLLECTIONS.tourPackages),
    db.list(COLLECTIONS.testimonials),
    db.list(COLLECTIONS.homepage),
  ]);

  const ops: BatchSet[] = [];
  const summary: ImportSummary = { categories: 0, packages: 0, testimonials: 0, homepageSections: 0 };
  const ts = () => ({ createdAt: db.timestamp(), updatedAt: db.timestamp() });

  // Categories (slug → id)
  const categoryIdBySlug = new Map<string, string>();
  cats.forEach((c) => categoryIdBySlug.set(String(c.slug), c.id));
  defaultCategories.forEach((c) => {
    if (categoryIdBySlug.has(c.slug)) return;
    const id = db.newId(COLLECTIONS.categories);
    const catData = { ...c, image: c.image?.url ? toImageRef(c.image.url) : null };
    ops.push({ col: COLLECTIONS.categories, id, data: { ...catData, mediaRefs: collectMediaRefs(catData), ...ts() } });
    categoryIdBySlug.set(c.slug, id);
    summary.categories++;
  });

  // Packages
  const existingSlugs = new Set(pkgs.map((p) => String(p.slug)));
  allPackages.forEach((p, index) => {
    if (existingSlugs.has(p.slug)) return;
    const days = parseInt(p.duration.replace(/[^0-9]/g, ''), 10) || 1;
    const images = (p.images?.length ? p.images : [p.image]).filter(Boolean);
    const cover = p.image || images[0];
    const featuredImage = cover ? toImageRef(cover) : null;
    const gallery = images.filter((u) => u !== cover).map((url) => toImageRef(url));
    const pkgData = {
        title: p.title,
        slug: p.slug,
        slugHistory: [],
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        destinationId: '',
        categoryId: categoryIdBySlug.get(p.category) ?? '',
        durationDays: days,
        durationNights: 0,
        price: null,
        discountPrice: null,
        // The old data shows "contact us" pricing; keep its note.
        priceNote: p.priceNote ?? '',
        startingLocation: '',
        highlights: p.placesToVisit ?? [],
        itinerary: [],
        inclusions: p.inclusions ?? [],
        exclusions: p.exclusions ?? [],
        importantInfo: '',
        featured: index < 8, // the old site featured the first 8 packages
        status: 'active',
        featuredImage,
        gallery,
        sortOrder: index,
    };
    ops.push({
      col: COLLECTIONS.tourPackages,
      id: db.newId(COLLECTIONS.tourPackages),
      data: {
        ...pkgData,
        mediaRefs: collectMediaRefs(pkgData),
        ...ts(),
      },
    });
    summary.packages++;
  });

  // Testimonials — only when there are none yet
  if (tests.length === 0) {
    defaultTestimonials.forEach((t) => {
      ops.push({ col: COLLECTIONS.testimonials, id: db.newId(COLLECTIONS.testimonials), data: { ...t, ...ts() } });
      summary.testimonials++;
    });
  }

  // Homepage sections that do not exist yet
  const existingSections = new Set(home.map((d) => d.id));
  (Object.keys(defaultHomepage) as HomepageSectionKey[]).forEach((key) => {
    if (existingSections.has(key)) return;
    const section = defaultHomepage[key];
    ops.push({ col: COLLECTIONS.homepage, id: key, data: { ...section, mediaRefs: collectMediaRefs(section), updatedAt: db.timestamp() } });
    summary.homepageSections++;
  });

  if (ops.length > 0) {
    await db.batchSet(ops);
    await logActivity(actor, 'import', 'website', undefined, `${summary.packages} packages, ${summary.categories} categories`);
  }
  return summary;
}
