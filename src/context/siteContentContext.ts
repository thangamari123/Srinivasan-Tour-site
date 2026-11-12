import { createContext, useContext } from 'react';
import type { Category, Destination, HomepageContent, Testimonial } from '../types/content';
import type { PackageView } from '../lib/packageView';

export interface SiteContent {
  loading: boolean;
  error: string | null;
  /** Active packages, sorted by sortOrder. */
  packages: PackageView[];
  categories: Category[];
  destinations: Destination[];
  testimonials: Testimonial[];
  homepage: HomepageContent;
}

export const SiteContentContext = createContext<SiteContent | null>(null);

export function useSiteContent(): SiteContent {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used inside <SiteContentProvider>');
  return ctx;
}
