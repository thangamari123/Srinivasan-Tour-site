import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Eye, Save, Send, Wand2 } from 'lucide-react';
import { COLLECTIONS } from '../../../lib/firebaseConfig';
import { backend } from '../../data/backend';
import { SLUG_PATTERN, slugify } from '../../../lib/slug';
import { formatPrice } from '../../../lib/packageView';
import { useCollection } from '../../hooks/useCollection';
import { useActor } from '../../hooks/useUploader';
import { useToast } from '../../context/feedback';
import { createItem, errorMessage, isSlugTaken, saveItem } from '../../services/content';
import { GalleryField, ImageField } from '../../components/ImageFields';
import { ItineraryEditor, StringListEditor } from '../../components/ListEditors';
import TravelVideosEditor from '../../components/TravelVideosEditor';
import { sanitizeTravelVideos } from '../../services/travelVideos';
import {
  Button,
  Card,
  CardHeader,
  ErrorBanner,
  IconButton,
  Modal,
  PageHeader,
  SelectInput,
  Skeleton,
  StatusBadge,
  TextArea,
  TextInput,
  Toggle,
} from '../../ui';
import type { Category, ContentStatus, Destination, ImageRef, ItineraryDay, TourPackage, TravelVideo } from '../../../types/content';

interface FormState {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  destinationId: string;
  categoryId: string;
  durationDays: string;
  durationNights: string;
  price: string;
  discountPrice: string;
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
  travelVideos: TravelVideo[];
  sortOrder: string;
}

const EMPTY: FormState = {
  title: '',
  slug: '',
  shortDescription: '',
  fullDescription: '',
  destinationId: '',
  categoryId: '',
  durationDays: '',
  durationNights: '',
  price: '',
  discountPrice: '',
  priceNote: '',
  startingLocation: '',
  highlights: [],
  itinerary: [],
  inclusions: [],
  exclusions: [],
  importantInfo: '',
  featured: false,
  status: 'inactive',
  featuredImage: null,
  gallery: [],
  travelVideos: [],
  sortOrder: '0',
};

function fromDoc(p: TourPackage): FormState {
  const num = (v: number | null | undefined) => (typeof v === 'number' && Number.isFinite(v) ? String(v) : '');
  const strArr = (v: unknown) => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : String(x ?? ''))) : []);
  const cleanGallery = Array.isArray(p.gallery)
    ? p.gallery.filter((x): x is ImageRef => Boolean(x && typeof x === 'object' && typeof x.url === 'string' && x.url))
    : [];
  const cleanFeatured =
    p.featuredImage && typeof p.featuredImage === 'object' && typeof p.featuredImage.url === 'string' && p.featuredImage.url
      ? p.featuredImage
      : null;
  const cleanItinerary = Array.isArray(p.itinerary)
    ? p.itinerary.map((d, idx) => ({
        day: typeof d?.day === 'number' && d.day > 0 ? d.day : idx + 1,
        title: typeof d?.title === 'string' ? d.title : String(d?.title ?? ''),
        description: typeof d?.description === 'string' ? d.description : String(d?.description ?? ''),
      }))
    : [];
  return {
    title: p.title ?? '',
    slug: p.slug ?? '',
    shortDescription: p.shortDescription ?? '',
    fullDescription: p.fullDescription ?? '',
    destinationId: p.destinationId ?? '',
    categoryId: p.categoryId ?? '',
    durationDays: num(p.durationDays),
    durationNights: num(p.durationNights),
    price: num(p.price),
    discountPrice: num(p.discountPrice),
    priceNote: p.priceNote ?? '',
    startingLocation: p.startingLocation ?? '',
    highlights: strArr(p.highlights),
    itinerary: cleanItinerary,
    inclusions: strArr(p.inclusions),
    exclusions: strArr(p.exclusions),
    importantInfo: p.importantInfo ?? '',
    featured: Boolean(p.featured),
    status: p.status === 'active' ? 'active' : 'inactive',
    featuredImage: cleanFeatured,
    gallery: cleanGallery,
    // Backward compatible: packages created before Travel Reels have no travelVideos.
    travelVideos: Array.isArray(p.travelVideos)
      ? [...p.travelVideos].sort((a, b) => (a?.displayOrder ?? 0) - (b?.displayOrder ?? 0))
      : [],
    sortOrder: num(p.sortOrder ?? 0),
  };
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  const isNum = (v: string) => v.trim() !== '' && Number.isFinite(Number(v));
  const title = f.title.trim();
  const slug = f.slug.trim();
  if (!title) e.title = 'Title is required';
  else if (title.length > 300) e.title = 'Title must be 300 characters or fewer';
  if (!slug) e.slug = 'URL slug is required';
  else if (slug.length > 80) e.slug = 'Slug must be 80 characters or fewer';
  else if (!SLUG_PATTERN.test(slug)) e.slug = 'Use lowercase letters, numbers and single hyphens only (e.g. kasi-tour-11-days)';
  if (!f.shortDescription.trim()) e.shortDescription = 'Short description is required';
  if (!f.categoryId) e.categoryId = 'Choose a category';
  if (!isNum(f.durationDays) || Number(f.durationDays) < 1 || !Number.isInteger(Number(f.durationDays)))
    e.durationDays = 'Enter the number of days (1 or more)';
  if (f.durationNights && (!isNum(f.durationNights) || Number(f.durationNights) < 0)) e.durationNights = 'Enter a valid number';
  if (f.price && (!isNum(f.price) || Number(f.price) < 0)) e.price = 'Enter a valid amount';
  if (f.discountPrice) {
    if (!isNum(f.discountPrice) || Number(f.discountPrice) < 0) e.discountPrice = 'Enter a valid amount';
    else if (!f.price) e.discountPrice = 'Set the regular price first';
    else if (Number(f.discountPrice) >= Number(f.price)) e.discountPrice = 'Discount price must be lower than the price';
  }
  if (f.gallery.length > 60) e.featuredImage = 'Gallery can have at most 60 images';
  if (f.travelVideos.some((v) => !v.title.trim())) e.travelVideos = 'Every travel video needs a title';
  else if (f.travelVideos.length > 20) e.travelVideos = 'At most 20 travel videos are allowed per package';
  if (f.status === 'active' && !f.featuredImage && f.gallery.length === 0)
    e.featuredImage = 'Add at least one image before publishing';
  return e;
}

export default function PackageForm() {
  const { id } = useParams<{ id: string }>();
  return <PackageFormEditor key={id ?? 'new'} id={id} />;
}

function PackageFormEditor({ id }: { id?: string }) {
  const isNew = !id;
  const navigate = useNavigate();
  const actor = useActor();
  const toast = useToast();
  const categories = useCollection<Category>(COLLECTIONS.categories);
  const destinations = useCollection<Destination>(COLLECTIONS.destinations);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [original, setOriginal] = useState<TourPackage | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    backend()
      .get(COLLECTIONS.tourPackages, id)
      .then((snap) => {
        if (cancelled) return;
        if (!snap) {
          setLoadError('This package no longer exists.');
        } else {
          const data = snap as unknown as TourPackage;
          setOriginal(data);
          setForm(fromDoc(data));
        }
      })
      .catch((err) => !cancelled && setLoadError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'title' && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    setDirty(true);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const sortedCategories = useMemo(
    () => [...categories.data].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [categories.data],
  );
  const sortedDestinations = useMemo(
    () => [...destinations.data].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')),
    [destinations.data],
  );

  const saveWithStatus = async (statusOverride?: ContentStatus) => {
    if (saving) return; // prevent duplicate submissions (double click / Enter)
    const nextForm: FormState = statusOverride ? { ...form, status: statusOverride } : form;
    if (statusOverride) setForm(nextForm);
    const found = validate(nextForm);
    setErrors(found);
    if (Object.keys(found).length) {
      toast('Please fix the highlighted fields', 'error');
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSaving(true);
    try {
      const slug = nextForm.slug.trim();
      if (await isSlugTaken(COLLECTIONS.tourPackages, slug, id)) {
        setErrors({ slug: 'Another package already uses this slug' });
        toast('That URL slug is already in use', 'error');
        return;
      }

      const toNum = (v: string) => (v.trim() === '' ? null : Number(v));
      const slugHistory = new Set(original?.slugHistory ?? []);
      if (original && original.slug && original.slug !== slug) slugHistory.add(original.slug);
      slugHistory.delete(slug);

      const payload = {
        title: nextForm.title.trim(),
        slug,
        slugHistory: [...slugHistory],
        shortDescription: nextForm.shortDescription.trim(),
        fullDescription: nextForm.fullDescription.trim(),
        destinationId: nextForm.destinationId,
        categoryId: nextForm.categoryId,
        durationDays: Number(nextForm.durationDays),
        durationNights: Number(nextForm.durationNights || 0),
        price: toNum(nextForm.price),
        discountPrice: toNum(nextForm.discountPrice),
        priceNote: nextForm.priceNote.trim(),
        startingLocation: nextForm.startingLocation.trim(),
        highlights: nextForm.highlights.map((s) => s.trim()).filter(Boolean),
        itinerary: nextForm.itinerary.map((d, i) => ({ day: i + 1, title: d.title.trim(), description: d.description.trim() })),
        inclusions: nextForm.inclusions.map((s) => s.trim()).filter(Boolean),
        exclusions: nextForm.exclusions.map((s) => s.trim()).filter(Boolean),
        importantInfo: nextForm.importantInfo.trim(),
        featured: nextForm.featured,
        status: nextForm.status,
        featuredImage: nextForm.featuredImage,
        gallery: nextForm.gallery,
        travelVideos: sanitizeTravelVideos(nextForm.travelVideos),
        sortOrder: Number(nextForm.sortOrder) || 0,
      };

      if (!id) {
        const newId = await createItem(COLLECTIONS.tourPackages, payload, actor, payload.title);
        toast(payload.status === 'active' ? 'Package created and published' : 'Package saved as draft');
        setDirty(false);
        navigate(`/admin/packages/${newId}`, { replace: true });
      } else {
        await saveItem(COLLECTIONS.tourPackages, id, payload, actor, payload.title);
        setOriginal((o) => (o ? { ...o, ...payload } : o));
        setDirty(false);
        toast(
          statusOverride === 'active'
            ? 'Package published'
            : statusOverride === 'inactive'
              ? 'Package saved as draft'
              : 'Changes saved',
        );
      }
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await saveWithStatus();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={loadError} />
        <Link to="/admin/packages" className="text-sm font-medium text-indigo-600">
          ← Back to packages
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex items-center gap-2 mb-2">
        <IconButton icon={ArrowLeft} label="Back to packages" onClick={() => navigate('/admin/packages')} />
        <Link to="/admin/packages" className="text-sm text-slate-500 hover:text-slate-700">
          Tour Packages
        </Link>
      </div>
      <PageHeader
        title={isNew ? 'New tour package' : form.title || 'Edit package'}
        description={isNew ? 'Fill in the details below. Save as inactive to keep it hidden until ready.' : `/package/${original?.slug}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" icon={Eye} onClick={() => setPreviewOpen(true)}>
              Preview
            </Button>
            {!isNew && original?.status === 'active' && (
              <a href={`/package/${original.slug}`} target="_blank" rel="noreferrer">
                <Button variant="secondary" icon={ExternalLink}>
                  View live
                </Button>
              </a>
            )}
            <Button type="submit" icon={Save} loading={saving} className="hidden sm:inline-flex">
              {isNew ? 'Create package' : 'Save changes'}
            </Button>
          </div>
        }
      />

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Basic information" />
            <div className="space-y-4">
              <TextInput label="Package title" required value={form.title} onChange={(e) => set('title', e.target.value)} error={errors.title} className="font-tamil" />
              <div>
                <TextInput
                  label="URL slug"
                  required
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  error={errors.slug}
                  hint={`Page address: /package/${form.slug || 'your-slug'}${!isNew ? ' · old links keep working after a change' : ''}`}
                />
                <button
                  type="button"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  onClick={() => {
                    set('slug', slugify(form.title));
                    setSlugTouched(true);
                  }}
                >
                  <Wand2 className="w-3.5 h-3.5" /> Generate from title (English titles only)
                </button>
              </div>
              <TextArea
                label="Short description"
                required
                rows={2}
                value={form.shortDescription}
                onChange={(e) => set('shortDescription', e.target.value)}
                error={errors.shortDescription}
                hint="Shown on package cards (about 1–2 lines)."
                className="font-tamil"
              />
              <TextArea
                label="Full description"
                rows={6}
                value={form.fullDescription}
                onChange={(e) => set('fullDescription', e.target.value)}
                className="font-tamil"
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Images" description="The featured image is used on cards; the gallery appears on the package page." />
            <div className="space-y-6">
              <div>
                <ImageField label="Featured image" value={form.featuredImage} onChange={(v) => set('featuredImage', v)} folder="packages" />
                {errors.featuredImage && <p className="mt-1.5 text-xs text-rose-600" aria-invalid="true">{errors.featuredImage}</p>}
              </div>
              <GalleryField label="Gallery images" value={form.gallery} onChange={(v) => set('gallery', v)} folder="packages" />
            </div>
          </Card>

          <Card>
            <CardHeader title="Tour highlights" description="Places to visit — shown as the numbered list on the package page." />
            <StringListEditor label="Highlights" value={form.highlights} onChange={(v) => set('highlights', v)} placeholder="e.g. காசி விஸ்வநாதர்" hint="Tip: paste several lines at once to add them all." />
          </Card>

          <Card>
            <CardHeader title="Itinerary" description="Day-by-day plan." />
            <ItineraryEditor value={form.itinerary} onChange={(v) => set('itinerary', v)} />
          </Card>

          <Card>
            <CardHeader title="Inclusions & exclusions" />
            <div className="grid md:grid-cols-2 gap-6">
              <StringListEditor label="Inclusions" value={form.inclusions} onChange={(v) => set('inclusions', v)} placeholder="e.g. ரயில் கட்டணம்" />
              <StringListEditor label="Exclusions" value={form.exclusions} onChange={(v) => set('exclusions', v)} placeholder="e.g. தனிப்பட்ட செலவுகள்" />
            </div>
          </Card>

          <Card>
            <CardHeader title="Important information" description="Terms, what to carry, cancellation policy, etc." />
            <TextArea rows={5} value={form.importantInfo} onChange={(e) => set('importantInfo', e.target.value)} aria-label="Important information" className="font-tamil" />
          </Card>

          <Card>
            <CardHeader title="Travel Reels / YouTube Shorts" description="Add travel videos related to this tour package." />
            {errors.travelVideos && (
              <p className="mb-3 text-xs text-rose-600" aria-invalid="true">{errors.travelVideos}</p>
            )}
            <TravelVideosEditor
              value={form.travelVideos}
              onChange={(v) => set('travelVideos', v)}
              defaultLocation={destinations.data.find((d) => d.id === form.destinationId)?.name ?? ''}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Publishing" />
            <div className="space-y-4">
              <Toggle
                checked={form.status === 'active'}
                onChange={(v) => set('status', v ? 'active' : 'inactive')}
                label={form.status === 'active' ? 'Active (published)' : 'Inactive (hidden)'}
                description="Only active packages appear on the website."
              />
              <Toggle checked={form.featured} onChange={(v) => set('featured', v)} label="Featured package" description="Shown in the homepage “Best Travel Packages” section." />
              <TextInput label="Display order" type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} hint="Lower numbers appear first." />
            </div>
          </Card>

          <Card>
            <CardHeader title="Classification" />
            <div className="space-y-4">
              <SelectInput label="Category" required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} error={errors.categoryId}>
                <option value="">Select a category…</option>
                {sortedCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.status !== 'active' ? ' (inactive)' : ''}
                  </option>
                ))}
              </SelectInput>
              {!categories.loading && categories.data.length === 0 && (
                <p className="text-xs text-amber-700">
                  No categories yet — <Link to="/admin/categories" className="underline">create one first</Link>.
                </p>
              )}
              <SelectInput label="Destination" value={form.destinationId} onChange={(e) => set('destinationId', e.target.value)}>
                <option value="">— None —</option>
                {sortedDestinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {d.status !== 'active' ? ' (inactive)' : ''}
                  </option>
                ))}
              </SelectInput>
              <TextInput label="Starting location" value={form.startingLocation} onChange={(e) => set('startingLocation', e.target.value)} placeholder="e.g. Chennai" />
            </div>
          </Card>

          <Card>
            <CardHeader title="Duration & price" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <TextInput label="Days" required type="number" min={1} value={form.durationDays} onChange={(e) => set('durationDays', e.target.value)} error={errors.durationDays} />
                <TextInput label="Nights" type="number" min={0} value={form.durationNights} onChange={(e) => set('durationNights', e.target.value)} error={errors.durationNights} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextInput label="Price (₹)" type="number" min={0} value={form.price} onChange={(e) => set('price', e.target.value)} error={errors.price} />
                <TextInput label="Discount price (₹)" type="number" min={0} value={form.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} error={errors.discountPrice} />
              </div>
              <p className="text-xs text-slate-500 -mt-2">Leave price empty to show “தொடர்பு கொள்ளவும்” (contact us).</p>
              <TextInput label="Price note" value={form.priceNote} onChange={(e) => set('priceNote', e.target.value)} placeholder="e.g. per person" className="font-tamil" />
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky save bar (mobile & always-visible on long forms) */}
      <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 mt-6 px-4 sm:px-6 lg:px-8 py-3 bg-white/90 backdrop-blur border-t border-slate-200 flex flex-wrap items-center justify-end gap-2 sm:gap-3 z-10">
        {dirty && <span className="text-xs text-amber-600 mr-auto">Unsaved changes</span>}
        <Button variant="secondary" onClick={() => navigate('/admin/packages')}>
          Cancel
        </Button>
        {form.status !== 'inactive' ? (
          <Button variant="secondary" onClick={() => void saveWithStatus('inactive')} disabled={saving}>
            Save as draft
          </Button>
        ) : (
          <Button variant="secondary" icon={Send} onClick={() => void saveWithStatus('active')} disabled={saving}>
            Publish
          </Button>
        )}
        <Button type="submit" icon={Save} loading={saving}>
          {isNew ? 'Create package' : 'Save changes'}
        </Button>
      </div>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={form.title || 'Untitled package preview'}
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
            Close preview
          </Button>
        }
      >
        <div className="space-y-4 text-sm">
          {(form.featuredImage?.url || form.gallery[0]?.url) && (
            <div className="aspect-[16/9] max-h-64 w-full overflow-hidden rounded-lg bg-slate-100">
              <img src={form.featuredImage?.url || form.gallery[0].url} alt={form.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <StatusBadge status={form.status} />
            <span>{categories.data.find((c) => c.id === form.categoryId)?.name ?? 'No category'}</span>
            {form.durationDays && (
              <span>· {form.durationDays}D{form.durationNights ? ` / ${form.durationNights}N` : ''}</span>
            )}
            <span>· {formatPrice(form.discountPrice ? Number(form.discountPrice) : form.price ? Number(form.price) : null) ?? 'தொடர்பு கொள்ளவும்'}</span>
          </div>
          {form.shortDescription && <p className="text-slate-700 font-tamil">{form.shortDescription}</p>}
          {form.fullDescription && <p className="text-xs text-slate-600 font-tamil whitespace-pre-line">{form.fullDescription}</p>}
          {form.highlights.filter(Boolean).length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Places to visit</p>
              <p className="text-xs text-slate-700 font-tamil">{form.highlights.filter(Boolean).join(' · ')}</p>
            </div>
          )}
          {form.itinerary.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Itinerary ({form.itinerary.length} days)</p>
              <ul className="space-y-1 text-xs text-slate-700 font-tamil">
                {form.itinerary.map((d, i) => (
                  <li key={i}><strong>Day {i + 1}:</strong> {d.title || '—'}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </form>
  );
}
