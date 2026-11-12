import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { DocumentData } from 'firebase/firestore';
import { COLLECTIONS, isFirebaseConfigured } from '../lib/firebaseConfig';
import { SiteContentContext, type SiteContent } from './siteContentContext';
import { defaultHomepage } from '../data/defaultContent';
import { toPackageView } from '../lib/packageView';
import { resolveMediaInValue } from '../lib/r2Media';
import type {
  Category,
  Destination,
  HomepageContent,
  HomepageSectionKey,
  Testimonial,
  TourPackage,
} from '../types/content';

type Raw = {
  packages: TourPackage[] | null;
  categories: Category[] | null;
  destinations: Destination[] | null;
  testimonials: Testimonial[] | null;
  homepage: Partial<Record<HomepageSectionKey, DocumentData>> | null;
};

const getOrder = (item: { displayOrder?: number; sortOrder?: number }) => item.displayOrder ?? item.sortOrder ?? 0;
const bySortOrder = <T extends { displayOrder?: number; sortOrder?: number }>(a: T, b: T) => getOrder(a) - getOrder(b);

function mergeHomepage(docs: Raw['homepage']): HomepageContent {
  if (!docs) return resolveMediaInValue(defaultHomepage);
  const merged = { ...defaultHomepage } as Record<HomepageSectionKey, unknown>;
  (Object.keys(defaultHomepage) as HomepageSectionKey[]).forEach((key) => {
    if (docs[key]) merged[key] = resolveMediaInValue({ ...defaultHomepage[key], ...docs[key] });
    else merged[key] = resolveMediaInValue(defaultHomepage[key]);
  });
  return merged as unknown as HomepageContent;
}

/**
 * Shown when the Firebase environment variables are missing. There is deliberately
 * no fallback to bundled/mock content — the site reports a configuration error.
 */
const CONFIG_ERROR: SiteContent = {
  loading: false,
  error: 'Website configuration error: Firebase is not configured.',
  packages: [],
  categories: [],
  destinations: [],
  testimonials: [],
  homepage: defaultHomepage,
};

/**
 * Subscribes (realtime) to the public content in Firestore so admin changes
 * appear on the live site without a refresh or redeploy.
 * Only active documents are queried — matching the Firestore security rules.
 */
export default function SiteContentProvider({ children }: { children: ReactNode }) {
  if (!isFirebaseConfigured) {
    console.error('[SiteContent] Missing VITE_FIREBASE_* environment variables — website content cannot be loaded.');
    return <SiteContentContext.Provider value={CONFIG_ERROR}>{children}</SiteContentContext.Provider>;
  }
  return <FirestoreContentProvider>{children}</FirestoreContentProvider>;
}

function FirestoreContentProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<Raw>({
    packages: null,
    categories: null,
    destinations: null,
    testimonials: null,
    homepage: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubs: (() => void)[] = [];
    let cancelled = false;
    const onError = (err: Error) => {
      console.error('[SiteContent]', err);
      setError('உள்ளடக்கத்தை ஏற்ற முடியவில்லை. பின்னர் மீண்டும் முயற்சிக்கவும்.');
    };

    // The Firebase SDK is loaded lazily so it does not delay the first paint.
    Promise.all([import('firebase/firestore'), import('../lib/firebase')])
      .then(([{ collection, onSnapshot, query, where }, { getDb }]) => {
        if (cancelled) return;
        const db = getDb();
        const activeList = (name: string, key: 'packages' | 'categories' | 'destinations' | 'testimonials') =>
          onSnapshot(
            query(collection(db, name), where('status', '==', 'active')),
            (snap) => {
              const items = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
              setRaw((prev) => ({ ...prev, [key]: items }));
            },
            onError,
          );

        unsubs = [
          activeList(COLLECTIONS.tourPackages, 'packages'),
          activeList(COLLECTIONS.categories, 'categories'),
          activeList(COLLECTIONS.destinations, 'destinations'),
          activeList(COLLECTIONS.testimonials, 'testimonials'),
          onSnapshot(
            collection(db, COLLECTIONS.homepage),
            (snap) => {
              const docs: Raw['homepage'] = {};
              snap.docs.forEach((d) => {
                docs[d.id as HomepageSectionKey] = d.data();
              });
              setRaw((prev) => ({ ...prev, homepage: docs }));
            },
            onError,
          ),
        ];
      })
      .catch(onError);

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, []);

  const value = useMemo<SiteContent>(() => {
    const categories = [...(raw.categories ?? [])].sort(bySortOrder).map((c) => resolveMediaInValue(c));
    const destinations = [...(raw.destinations ?? [])]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((d) => resolveMediaInValue(d));
    const catMap = new Map(categories.map((c) => [c.id, c]));
    const destMap = new Map(destinations.map((d) => [d.id, d]));
    const packages = [...(raw.packages ?? [])]
      .sort(bySortOrder)
      .map((p) => toPackageView(p, catMap, destMap));

    const loading =
      !error && (raw.packages === null || raw.categories === null || raw.homepage === null || raw.destinations === null);

    return {
      loading,
      error,
      packages,
      categories,
      destinations,
      testimonials: [...(raw.testimonials ?? [])].sort(bySortOrder),
      homepage: mergeHomepage(raw.homepage),
    };
  }, [raw, error]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}
