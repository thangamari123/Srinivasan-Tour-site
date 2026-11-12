import migrationMapRaw from '../data/r2MigrationMap.json';

interface MappedEntry {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

const r2Map = migrationMapRaw as Record<string, MappedEntry>;

/** Resolves a local `/images/...` path to its migrated Cloudflare R2 Worker URL when mapped. */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  return r2Map[url]?.url ?? url;
}

/** Recursively upgrades any `{ url: '/images/...' }` entries inside Firestore content objects to R2 URLs. */
export function resolveMediaInValue<T>(value: T): T {
  if (typeof value === 'string') {
    return (r2Map[value]?.url ?? value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveMediaInValue(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = resolveMediaInValue(v);
    }
    return out as T;
  }
  return value;
}

