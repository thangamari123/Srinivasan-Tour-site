import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Eye, EyeOff, ExternalLink, Package, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { COLLECTIONS } from '../../../lib/firebaseConfig';
import { useCollection } from '../../hooks/useCollection';
import { useActor } from '../../hooks/useUploader';
import { useAuth } from '../../context/auth';
import { useConfirm, useToast } from '../../context/feedback';
import { createItem, errorMessage, isSlugTaken, patchItem, removeItem } from '../../services/content';
import {
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  IconButton,
  Modal,
  PageHeader,
  SearchInput,
  SelectInput,
  StatusBadge,
  Table,
  TableSkeleton,
  Td,
  Th,
} from '../../ui';
import type { Category, Destination, TourPackage } from '../../../types/content';
import { formatPrice } from '../../../lib/packageView';
import { millis } from '../../utils';

export default function PackageList() {
  const navigate = useNavigate();
  const { isFullAdmin } = useAuth();
  const actor = useActor();
  const toast = useToast();
  const confirm = useConfirm();
  // Sorted client-side: an orderBy() query would silently drop docs missing the field.
  const packages = useCollection<TourPackage>(COLLECTIONS.tourPackages);
  const categories = useCollection<Category>(COLLECTIONS.categories);
  const destinations = useCollection<Destination>(COLLECTIONS.destinations);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'sortOrder' | 'updated' | 'title' | 'priceAsc' | 'durationAsc'>('sortOrder');
  const [previewPkg, setPreviewPkg] = useState<TourPackage | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const catName = useMemo(() => new Map(categories.data.map((c) => [c.id, c.name])), [categories.data]);
  const destName = useMemo(() => new Map(destinations.data.map((d) => [d.id, d.name])), [destinations.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorted = [...packages.data].sort((a, b) => {
      if (sortBy === 'updated') {
        return (millis(b.updatedAt) || millis(b.createdAt)) - (millis(a.updatedAt) || millis(a.createdAt));
      }
      if (sortBy === 'title') {
        return (a.title ?? '').localeCompare(b.title ?? '');
      }
      if (sortBy === 'priceAsc') {
        const pa = a.discountPrice ?? a.price ?? Number.MAX_SAFE_INTEGER;
        const pb = b.discountPrice ?? b.price ?? Number.MAX_SAFE_INTEGER;
        return pa - pb;
      }
      if (sortBy === 'durationAsc') {
        return (a.durationDays ?? 0) - (b.durationDays ?? 0);
      }
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
    return sorted.filter((p) => {
      if (category !== 'all' && p.categoryId !== category) return false;
      if (status !== 'all' && p.status !== status) return false;
      if (featuredFilter === 'featured' && !p.featured) return false;
      if (featuredFilter === 'standard' && p.featured) return false;
      if (!q) return true;
      return [p.title, p.slug, p.shortDescription, destName.get(p.destinationId), ...(p.highlights ?? [])]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q));
    });
  }, [packages.data, search, category, status, featuredFilter, sortBy, destName]);

  const duplicate = async (p: TourPackage) => {
    if (busyId) return;
    setBusyId(p.id);
    try {
      const baseSlug = (p.slug || 'package').slice(0, 65).replace(/-+$/g, '') || 'package';
      let candidate = `${baseSlug}-copy`;
      let n = 2;
      while (await isSlugTaken(COLLECTIONS.tourPackages, candidate)) {
        candidate = `${baseSlug}-copy-${n++}`;
      }
      const copyTitle = `${(p.title ?? 'Untitled package').slice(0, 293)} (Copy)`;
      const newId = await createItem(
        COLLECTIONS.tourPackages,
        {
          title: copyTitle,
          slug: candidate,
          slugHistory: [],
          shortDescription: p.shortDescription ?? '',
          fullDescription: p.fullDescription ?? '',
          destinationId: p.destinationId ?? '',
          categoryId: p.categoryId ?? '',
          durationDays: p.durationDays ?? 1,
          durationNights: p.durationNights ?? 0,
          price: p.price ?? null,
          discountPrice: p.discountPrice ?? null,
          priceNote: p.priceNote ?? '',
          startingLocation: p.startingLocation ?? '',
          highlights: Array.isArray(p.highlights) ? p.highlights : [],
          itinerary: Array.isArray(p.itinerary) ? p.itinerary : [],
          inclusions: Array.isArray(p.inclusions) ? p.inclusions : [],
          exclusions: Array.isArray(p.exclusions) ? p.exclusions : [],
          importantInfo: p.importantInfo ?? '',
          featured: false,
          status: 'inactive',
          featuredImage: p.featuredImage ?? null,
          gallery: Array.isArray(p.gallery) ? p.gallery : [],
          travelVideos: Array.isArray(p.travelVideos) ? p.travelVideos : [],
          sortOrder: (p.sortOrder ?? 0) + 1,
        },
        actor,
        copyTitle,
      );
      toast('Package duplicated as draft — opening copy');
      navigate(`/admin/packages/${newId}`);
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const togglePublish = async (p: TourPackage) => {
    if (busyId) return;
    const next = p.status === 'active' ? 'inactive' : 'active';
    setBusyId(p.id);
    try {
      await patchItem(COLLECTIONS.tourPackages, p.id, { status: next }, actor, p.title, next === 'active' ? 'publish' : 'unpublish');
      toast(next === 'active' ? 'Package published — it is now live on the website' : 'Package unpublished');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const toggleFeatured = async (p: TourPackage) => {
    if (busyId) return;
    setBusyId(p.id);
    try {
      await patchItem(COLLECTIONS.tourPackages, p.id, { featured: !p.featured }, actor, p.title);
      toast(p.featured ? 'Removed from featured' : 'Marked as featured');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p: TourPackage) => {
    if (busyId) return;
    const ok = await confirm({
      title: 'Delete package?',
      message: `“${p.title}” will be permanently removed from the website. Its images stay in the Media Library. This cannot be undone.`,
      confirmLabel: 'Delete package',
      danger: true,
    });
    if (!ok) return;
    setBusyId(p.id);
    try {
      await removeItem(COLLECTIONS.tourPackages, p.id, actor, p.title);
      toast('Package deleted');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const hasFilters = search || category !== 'all' || status !== 'all' || featuredFilter !== 'all';
  const PAGE_SIZE = 20;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Tour Packages"
        description="Create, edit and publish the tour packages shown on the website."
        actions={
          <Button icon={Plus} onClick={() => navigate('/admin/packages/new')}>
            Add package
          </Button>
        }
      />

      <Card padded={false}>
        <div className="flex flex-col lg:flex-row gap-3 p-4 border-b border-slate-200">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(0); }} placeholder="Search title, slug, destination, place…" className="flex-1" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:w-auto">
            <SelectInput value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }} aria-label="Filter by category">
              <option value="all">All categories</option>
              {categories.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
            <SelectInput value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} aria-label="Filter by status">
              <option value="all">All statuses</option>
              <option value="active">Published</option>
              <option value="inactive">Draft / Inactive</option>
            </SelectInput>
            <SelectInput value={featuredFilter} onChange={(e) => { setFeaturedFilter(e.target.value); setPage(0); }} aria-label="Filter featured">
              <option value="all">All packages</option>
              <option value="featured">Featured only</option>
              <option value="standard">Non-featured</option>
            </SelectInput>
            <SelectInput value={sortBy} onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(0); }} aria-label="Sort packages">
              <option value="sortOrder">Display order</option>
              <option value="updated">Recently updated</option>
              <option value="title">Title (A–Z)</option>
              <option value="durationAsc">Duration (shortest)</option>
              <option value="priceAsc">Price (lowest)</option>
            </SelectInput>
          </div>
        </div>

        {packages.error && (
          <div className="p-4">
            <ErrorBanner message={packages.error} onRetry={packages.reload} />
          </div>
        )}

        {packages.loading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : filtered.length === 0 ? (
          hasFilters ? (
            <EmptyState
              icon={Package}
              title="No packages match your filters"
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch('');
                    setCategory('all');
                    setStatus('all');
                    setFeaturedFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Package}
              title="No packages yet"
              description="Add your first tour package, or import the existing website packages from Settings."
              action={
                <Button icon={Plus} onClick={() => navigate('/admin/packages/new')}>
                  Add package
                </Button>
              }
            />
          )
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Package</Th>
                <Th className="hidden md:table-cell">Category</Th>
                <Th className="hidden lg:table-cell">Duration</Th>
                <Th className="hidden lg:table-cell">Price</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((p) => {
                const thumb = p.featuredImage?.url || p.gallery?.[0]?.url;
                const busy = busyId === p.id;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <Td>
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="w-14 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          {thumb && <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />}
                        </div>
                        <div className="min-w-0">
                          <Link to={`/admin/packages/${p.id}`} className="font-medium text-slate-900 hover:text-indigo-600 line-clamp-1 font-tamil">
                            {p.title}
                          </Link>
                          <p className="text-xs text-slate-500 truncate">/{p.slug}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="hidden md:table-cell">
                      <span className="font-tamil">{catName.get(p.categoryId) ?? <span className="text-slate-400">—</span>}</span>
                    </Td>
                    <Td className="hidden lg:table-cell whitespace-nowrap">
                      {p.durationDays}D{p.durationNights ? ` / ${p.durationNights}N` : ''}
                    </Td>
                    <Td className="hidden lg:table-cell whitespace-nowrap">
                      {p.discountPrice != null && p.price != null ? (
                        <>
                          <span className="font-medium">{formatPrice(p.discountPrice)}</span>{' '}
                          <span className="text-xs text-slate-400 line-through">{formatPrice(p.price)}</span>
                        </>
                      ) : (
                        formatPrice(p.price) ?? <span className="text-slate-400">On request</span>
                      )}
                    </Td>
                    <Td>
                      <StatusBadge status={p.status} />
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <IconButton
                          icon={Star}
                          label={p.featured ? 'Remove from featured' : 'Mark as featured'}
                          onClick={() => toggleFeatured(p)}
                          disabled={busy}
                          className={p.featured ? 'text-amber-500 hover:text-amber-600 [&>svg]:fill-amber-400' : ''}
                        />
                        <IconButton
                          icon={p.status === 'active' ? EyeOff : Eye}
                          label={p.status === 'active' ? 'Unpublish' : 'Publish'}
                          onClick={() => togglePublish(p)}
                          disabled={busy}
                        />
                        {p.status === 'active' ? (
                          <a
                            href={`/package/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View on website"
                            aria-label="View on website"
                            className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <IconButton icon={Eye} label="Preview draft" onClick={() => setPreviewPkg(p)} className="hidden sm:inline-flex" />
                        )}
                        <IconButton icon={Copy} label="Duplicate package" onClick={() => duplicate(p)} disabled={busy} />
                        <IconButton icon={Pencil} label="Edit" onClick={() => navigate(`/admin/packages/${p.id}`)} />
                        {isFullAdmin && <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => remove(p)} disabled={busy} />}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        {!packages.loading && filtered.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing {filtered.length} of {packages.data.length} packages
              {pageCount > 1 && ` · page ${currentPage + 1} of ${pageCount}`}
            </p>
            {pageCount > 1 && (
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
                  Previous
                </Button>
                <Button size="sm" variant="secondary" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}>
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
      <Modal
        open={Boolean(previewPkg)}
        onClose={() => setPreviewPkg(null)}
        title={previewPkg?.title ?? 'Package preview'}
        size="lg"
        footer={
          previewPkg && (
            <>
              <Button variant="secondary" onClick={() => setPreviewPkg(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  const id = previewPkg.id;
                  setPreviewPkg(null);
                  navigate(`/admin/packages/${id}`);
                }}
              >
                Edit package
              </Button>
            </>
          )
        }
      >
        {previewPkg && (
          <div className="space-y-4 text-sm">
            {(previewPkg.featuredImage?.url || previewPkg.gallery?.[0]?.url) && (
              <div className="aspect-[16/9] max-h-64 w-full overflow-hidden rounded-lg bg-slate-100">
                <img src={previewPkg.featuredImage?.url || previewPkg.gallery?.[0]?.url} alt={previewPkg.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <StatusBadge status={previewPkg.status} />
              <span>{catName.get(previewPkg.categoryId) ?? 'Uncategorised'}</span>
              <span>· {previewPkg.durationDays}D{previewPkg.durationNights ? ` / ${previewPkg.durationNights}N` : ''}</span>
              <span>· {formatPrice(previewPkg.discountPrice ?? previewPkg.price) ?? 'On request'}</span>
            </div>
            {previewPkg.shortDescription && <p className="text-slate-700 font-tamil">{previewPkg.shortDescription}</p>}
            {previewPkg.highlights?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Places to visit ({previewPkg.highlights.length})</p>
                <p className="text-xs text-slate-600 font-tamil leading-relaxed">{previewPkg.highlights.join(' · ')}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
