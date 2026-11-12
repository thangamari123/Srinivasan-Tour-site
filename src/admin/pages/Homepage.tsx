import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ExternalLink, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { COLLECTIONS } from '../../lib/firebaseConfig';
import { useCollection } from '../hooks/useCollection';
import { useActor } from '../hooks/useUploader';
import { useConfirm, useToast } from '../context/feedback';
import { errorMessage, saveHomepageSection } from '../services/content';
import { GalleryField, ImageField } from '../components/ImageFields';
import ReelsSectionFields from '../components/ReelsSectionFields';
import { countActivePackageReels, sanitizeTravelVideos } from '../services/travelVideos';
import { Button, Card, CardHeader, ErrorBanner, IconButton, PageHeader, Skeleton, TextArea, TextInput, Toggle, cx } from '../ui';
import { defaultHomepage } from '../../data/defaultContent';
import type { Destination, HomepageContent, HomepageSectionKey, PromoBanner, TourPackage } from '../../types/content';

type DocWithId = { id: string } & Record<string, unknown>;

const TABS: { key: HomepageSectionKey; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'featured', label: 'Featured packages' },
  { key: 'destinations', label: 'Popular destinations' },
  { key: 'banners', label: 'Promo banners' },
  { key: 'about', label: 'About / Why us' },
  { key: 'reels', label: 'Travel reels' },
  { key: 'testimonials', label: 'Testimonials heading' },
  { key: 'cta', label: 'Call to action' },
];

const newUuid = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function stripMeta<T>(data: T): T {
  const copy = { ...(data as Record<string, unknown>) };
  delete copy.id;
  delete copy.updatedAt;
  delete copy.mediaRefs;
  return copy as T;
}

function normalizeSection<K extends HomepageSectionKey>(key: K, raw: Record<string, unknown> | undefined): HomepageContent[K] {
  const merged = raw ? { ...defaultHomepage[key], ...stripMeta(raw) } : { ...defaultHomepage[key] };
  const def = defaultHomepage[key] as unknown as Record<string, unknown>;
  const out = merged as unknown as Record<string, unknown>;
  for (const [field, defVal] of Object.entries(def)) {
    if (Array.isArray(defVal) && !Array.isArray(out[field])) {
      out[field] = defVal;
    }
  }
  if (key === 'featured' && typeof out.badge === 'string' && out.badge.trim() === 'Popular Collections') {
    out.badge = 'Featured Destinations';
  }
  return merged as HomepageContent[K];
}

export default function Homepage() {
  const actor = useActor();
  const toast = useToast();
  const confirm = useConfirm();
  const docs = useCollection<DocWithId>(COLLECTIONS.homepage);
  const packages = useCollection<TourPackage>(COLLECTIONS.tourPackages);
  const destinations = useCollection<Destination>(COLLECTIONS.destinations);

  const [tab, setTab] = useState<HomepageSectionKey>('hero');
  const [drafts, setDrafts] = useState<Partial<HomepageContent>>({});
  const [saving, setSaving] = useState(false);

  const saved = useMemo(() => {
    const byId = new Map(docs.data.map((d) => [d.id, d]));
    const out = {} as HomepageContent;
    (Object.keys(defaultHomepage) as HomepageSectionKey[]).forEach((k) => {
      (out as unknown as Record<string, unknown>)[k] = normalizeSection(k, byId.get(k));
    });
    return out;
  }, [docs.data]);

  const value = <K extends HomepageSectionKey>(k: K): HomepageContent[K] => (drafts[k] as HomepageContent[K]) ?? saved[k];
  const update = <K extends HomepageSectionKey>(k: K, patch: Partial<HomepageContent[K]>) =>
    setDrafts((d) => ({ ...d, [k]: { ...value(k), ...patch } }));
  const isDirty = (k: HomepageSectionKey) => drafts[k] !== undefined;

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const clean = stripMeta(value(tab));
      const payload =
        tab === 'reels'
          ? { ...(clean as HomepageContent['reels']), videos: sanitizeTravelVideos((clean as HomepageContent['reels']).videos) }
          : clean;
      await saveHomepageSection(tab, payload as unknown as Record<string, unknown>, actor);
      setDrafts((d) => {
        const next = { ...d };
        delete next[tab];
        return next;
      });
      toast('Homepage updated — changes are live');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!(await confirm({ title: 'Restore original content?', message: 'This loads the website’s original text for this section into the editor. Nothing is saved until you click Save.', confirmLabel: 'Load original' }))) return;
    setDrafts((d) => ({ ...d, [tab]: defaultHomepage[tab] }));
  };

  const activePackages = packages.data.filter((p) => p.status === 'active');
  const activeDestinations = destinations.data.filter((d) => d.status === 'active');

  let editor: ReactNode = null;
  if (tab === 'hero') {
    const hero = value('hero');
    editor = (
      <div className="space-y-5">
        <TextInput label="Badge text" value={hero.badge} onChange={(e) => update('hero', { badge: e.target.value })} className="font-tamil" />
        <div className="grid md:grid-cols-3 gap-4">
          <TextInput label="Heading – start" value={hero.headingPrefix} onChange={(e) => update('hero', { headingPrefix: e.target.value })} className="font-tamil" />
          <TextInput label="Heading – highlighted (gold)" value={hero.headingHighlight} onChange={(e) => update('hero', { headingHighlight: e.target.value })} className="font-tamil" />
          <TextInput label="Heading – end" value={hero.headingSuffix} onChange={(e) => update('hero', { headingSuffix: e.target.value })} className="font-tamil" />
        </div>
        <TextArea label="Description" rows={2} value={hero.description} onChange={(e) => update('hero', { description: e.target.value })} className="font-tamil" />
        <div className="grid md:grid-cols-2 gap-4">
          <TextInput label="Primary button label" value={hero.primaryCtaLabel} onChange={(e) => update('hero', { primaryCtaLabel: e.target.value })} className="font-tamil" />
          <TextInput label="Primary button link" value={hero.primaryCtaLink} onChange={(e) => update('hero', { primaryCtaLink: e.target.value })} hint="e.g. /packages or a full URL" />
          <TextInput label="Call button label" value={hero.secondaryCtaLabel} onChange={(e) => update('hero', { secondaryCtaLabel: e.target.value })} />
          <TextInput label="Phone number" value={hero.phone} onChange={(e) => update('hero', { phone: e.target.value })} />
        </div>
        <GalleryField
          label="Background images (slideshow)"
          value={hero.backgroundImages}
          onChange={(v) => update('hero', { backgroundImages: v })}
          folder="homepage"
          max={8}
          hint="Images rotate every 5 seconds. Wide landscape photos (1920px+) work best."
        />
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Statistics</p>
          <div className="space-y-2">
            {hero.stats.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input value={s.value} aria-label="Stat value" onChange={(e) => update('hero', { stats: hero.stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <input value={s.label} aria-label="Stat label" onChange={(e) => update('hero', { stats: hero.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} className="flex-1 min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-tamil" />
                <IconButton icon={Trash2} label="Remove stat" tone="danger" onClick={() => update('hero', { stats: hero.stats.filter((_, j) => j !== i) })} />
              </div>
            ))}
          </div>
          {hero.stats.length < 6 && (
            <Button size="sm" variant="secondary" icon={Plus} className="mt-2" onClick={() => update('hero', { stats: [...hero.stats, { value: '', label: '' }] })}>
              Add stat
            </Button>
          )}
        </div>
      </div>
    );
  } else if (tab === 'featured') {
    const f = value('featured');
    editor = (
      <div className="space-y-5">
        <Toggle checked={f.enabled} onChange={(v) => update('featured', { enabled: v })} label="Show this section" />
        <SectionHeadingFields value={f} onChange={(p) => update('featured', p)} />
        <TextInput label="Maximum packages shown" type="number" min={1} max={24} value={String(f.limit)} onChange={(e) => update('featured', { limit: Math.max(1, Number(e.target.value) || 8) })} containerClassName="max-w-xs" />
        <OrderedPicker
          title="Packages to feature"
          help="Leave empty to automatically show packages marked “Featured”. Or pick specific packages and set their order."
          loading={packages.loading}
          options={activePackages.map((p) => ({ id: p.id, label: p.title, image: p.featuredImage?.url || p.gallery?.[0]?.url, flag: p.featured ? 'Featured' : undefined }))}
          selected={f.packageIds}
          onChange={(ids) => update('featured', { packageIds: ids })}
        />
      </div>
    );
  } else if (tab === 'destinations') {
    const d = value('destinations');
    editor = (
      <div className="space-y-5">
        <Toggle checked={d.enabled} onChange={(v) => update('destinations', { enabled: v })} label="Show this section" description="Adds a “Popular Destinations” row on the homepage, below the featured packages." />
        <SectionHeadingFields value={d} onChange={(p) => update('destinations', p)} />
        <OrderedPicker
          title="Destinations to show first (optional)"
          help="All active destinations appear automatically. Leave empty for alphabetical order, or pick destinations here to pin them first."
          loading={destinations.loading}
          options={activeDestinations.map((x) => ({ id: x.id, label: x.name, image: x.image?.url }))}
          selected={d.destinationIds}
          onChange={(ids) => update('destinations', { destinationIds: ids })}
        />
      </div>
    );
  } else if (tab === 'banners') {
    const b = value('banners');
    const setItems = (items: PromoBanner[]) => update('banners', { items });
    editor = (
      <div className="space-y-5">
        <Toggle checked={b.enabled} onChange={(v) => update('banners', { enabled: v })} label="Show promotional banners" description="Shown between the services and featured packages sections." />
        {b.items.map((item, i) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Banner {i + 1}</span>
              <div className="ml-auto flex items-center gap-1">
                <Toggle checked={item.active} onChange={(v) => setItems(b.items.map((x) => (x.id === item.id ? { ...x, active: v } : x)))} label="Active" />
                <IconButton icon={ArrowUp} label="Move up" disabled={i === 0} onClick={() => { const n = [...b.items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setItems(n); }} />
                <IconButton icon={ArrowDown} label="Move down" disabled={i === b.items.length - 1} onClick={() => { const n = [...b.items]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; setItems(n); }} />
                <IconButton icon={Trash2} label="Remove banner" tone="danger" onClick={() => setItems(b.items.filter((x) => x.id !== item.id))} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <TextInput label="Title" value={item.title} onChange={(e) => setItems(b.items.map((x) => (x.id === item.id ? { ...x, title: e.target.value } : x)))} className="font-tamil" />
              <TextInput label="Subtitle" value={item.subtitle} onChange={(e) => setItems(b.items.map((x) => (x.id === item.id ? { ...x, subtitle: e.target.value } : x)))} className="font-tamil" />
              <TextInput label="Button label" value={item.buttonLabel} onChange={(e) => setItems(b.items.map((x) => (x.id === item.id ? { ...x, buttonLabel: e.target.value } : x)))} className="font-tamil" />
              <TextInput label="Link" value={item.link} placeholder="/package/kasi-tour-11-days" onChange={(e) => setItems(b.items.map((x) => (x.id === item.id ? { ...x, link: e.target.value } : x)))} />
            </div>
            <ImageField label="Banner image" value={item.image} onChange={(v) => setItems(b.items.map((x) => (x.id === item.id ? { ...x, image: v } : x)))} folder="homepage" aspect="aspect-[21/9]" />
          </div>
        ))}
        <Button
          variant="secondary"
          icon={Plus}
          onClick={() =>
            setItems([...b.items, { id: newUuid(), title: '', subtitle: '', image: null, buttonLabel: 'மேலும் அறிய', link: '/packages', active: true }])
          }
        >
          Add banner
        </Button>
      </div>
    );
  } else if (tab === 'about') {
    const a = value('about');
    editor = (
      <div className="space-y-5">
        <SectionHeadingFields value={a} onChange={(p) => update('about', p)} />
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Reasons (shown as cards; icons are assigned in order)</p>
          {a.reasons.map((r, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4 grid md:grid-cols-[200px_1fr_auto] gap-3 items-start">
              <TextInput aria-label="Reason title" placeholder="Title" value={r.title} onChange={(e) => update('about', { reasons: a.reasons.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} className="font-tamil" />
              <TextArea aria-label="Reason description" rows={2} placeholder="Description" value={r.description} onChange={(e) => update('about', { reasons: a.reasons.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} className="font-tamil" />
              <IconButton icon={Trash2} label="Remove" tone="danger" onClick={() => update('about', { reasons: a.reasons.filter((_, j) => j !== i) })} />
            </div>
          ))}
          {a.reasons.length < 8 && (
            <Button size="sm" variant="secondary" icon={Plus} onClick={() => update('about', { reasons: [...a.reasons, { title: '', description: '' }] })}>
              Add reason
            </Button>
          )}
        </div>
      </div>
    );
  } else if (tab === 'reels') {
    editor = (
      <ReelsSectionFields
        value={value('reels')}
        onChange={(p) => update('reels', p)}
        packageReelsCount={countActivePackageReels(packages.data)}
      />
    );
  } else if (tab === 'testimonials') {
    editor = (
      <div className="space-y-5">
        <SectionHeadingFields value={value('testimonials')} onChange={(p) => update('testimonials', p)} />
        <p className="text-sm text-slate-500">
          The reviews themselves are managed on the <Link to="/admin/testimonials" className="text-indigo-600 font-medium hover:underline">Testimonials</Link> page.
        </p>
      </div>
    );
  } else if (tab === 'cta') {
    const c = value('cta');
    editor = (
      <div className="space-y-5">
        <TextInput label="Badge text" value={c.badge} onChange={(e) => update('cta', { badge: e.target.value })} className="font-tamil" />
        <div className="grid md:grid-cols-2 gap-4">
          <TextInput label="Heading" value={c.headingPrefix} onChange={(e) => update('cta', { headingPrefix: e.target.value })} className="font-tamil" />
          <TextInput label="Heading – highlighted (gold)" value={c.headingHighlight} onChange={(e) => update('cta', { headingHighlight: e.target.value })} className="font-tamil" />
        </div>
        <TextArea label="Description" rows={3} value={c.description} onChange={(e) => update('cta', { description: e.target.value })} className="font-tamil" />
        <div className="grid md:grid-cols-2 gap-4">
          <TextInput label="Primary button label" value={c.primaryLabel} onChange={(e) => update('cta', { primaryLabel: e.target.value })} className="font-tamil" />
          <TextInput label="Primary button link" value={c.primaryLink} onChange={(e) => update('cta', { primaryLink: e.target.value })} />
          <TextInput label="Call button label" value={c.secondaryLabel} onChange={(e) => update('cta', { secondaryLabel: e.target.value })} className="font-tamil" />
          <TextInput label="Phone number" value={c.phone} onChange={(e) => update('cta', { phone: e.target.value })} />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Homepage"
        description="Edit each homepage section. Saved changes appear on the live website immediately."
        actions={
          <a href="/" target="_blank" rel="noreferrer">
            <Button variant="secondary" icon={ExternalLink}>Preview homepage</Button>
          </a>
        }
      />
      {docs.error && <div className="mb-4"><ErrorBanner message={docs.error} onRetry={docs.reload} /></div>}

      <div className="flex gap-1 overflow-x-auto pb-px mb-6 border-b border-slate-200 -mx-4 px-4 sm:mx-0 sm:px-0" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cx(
              'relative px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              tab === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800',
            )}
          >
            {t.label}
            {isDirty(t.key) && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-amber-500 align-middle" title="Unsaved changes" />}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader
          title={TABS.find((t) => t.key === tab)?.label ?? ''}
          action={<Button size="sm" variant="ghost" icon={RotateCcw} onClick={resetToDefault}>Original content</Button>}
        />
        {docs.loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          editor
        )}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
          {isDirty(tab) && (
            <>
              <span className="text-xs text-amber-600 mr-auto">Unsaved changes</span>
              <Button variant="secondary" onClick={() => setDrafts((d) => { const n = { ...d }; delete n[tab]; return n; })}>
                Discard
              </Button>
            </>
          )}
          <Button icon={Save} onClick={save} loading={saving} disabled={!isDirty(tab)}>
            Save section
          </Button>
        </div>
      </Card>
    </>
  );
}

function SectionHeadingFields<T extends { badge: string; title: string; subtitle: string }>({
  value,
  onChange,
}: {
  value: T;
  onChange: (patch: Partial<T>) => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <TextInput label="Badge" value={value.badge} onChange={(e) => onChange({ badge: e.target.value } as Partial<T>)} className="font-tamil" />
      <TextInput label="Title" value={value.title} onChange={(e) => onChange({ title: e.target.value } as Partial<T>)} className="font-tamil" />
      <TextArea label="Subtitle" rows={2} value={value.subtitle} onChange={(e) => onChange({ subtitle: e.target.value } as Partial<T>)} containerClassName="md:col-span-2" className="font-tamil" />
    </div>
  );
}

/** Choose items from a list and order them. */
function OrderedPicker({
  title,
  help,
  options,
  selected,
  onChange,
  loading,
}: {
  title: string;
  help: string;
  options: { id: string; label: string; image?: string; flag?: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
  loading: boolean;
}) {
  const byId = new Map(options.map((o) => [o.id, o]));
  const chosenIds = selected.filter((id) => byId.has(id));
  const chosen = chosenIds.map((id) => byId.get(id)!);
  const available = options.filter((o) => !chosenIds.includes(o.id));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= chosenIds.length) return;
    const n = [...chosenIds];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };

  return (
    <div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="text-xs text-slate-500 mb-3">{help}</p>
      {loading ? (
        <Skeleton className="h-32" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-100">Selected ({chosen.length})</p>
            {chosen.length === 0 ? (
              <p className="px-3 py-6 text-sm text-slate-400 text-center">Automatic</p>
            ) : (
              <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {chosen.map((o, i) => (
                  <PickerRow
                    key={o.id}
                    o={o}
                    actions={
                      <div className="flex">
                        <IconButton icon={ArrowUp} label="Move up" disabled={i === 0} onClick={() => move(i, -1)} />
                        <IconButton icon={ArrowDown} label="Move down" disabled={i === chosen.length - 1} onClick={() => move(i, 1)} />
                        <IconButton icon={Trash2} label="Remove" tone="danger" onClick={() => onChange(chosenIds.filter((x) => x !== o.id))} />
                      </div>
                    }
                  />
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-slate-200">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-100">Available ({available.length})</p>
            <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {available.map((o) => (
                <PickerRow key={o.id} o={o} actions={<IconButton icon={Plus} label="Add" onClick={() => onChange([...selected.filter((id) => byId.has(id)), o.id])} />} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

type PickerOption = { id: string; label: string; image?: string; flag?: string };

function PickerRow({ o, actions }: { o: PickerOption; actions: ReactNode }) {
  return (
    <li className="flex items-center gap-3 px-3 py-2">
      <div className="w-10 h-8 rounded bg-slate-100 overflow-hidden shrink-0">{o.image && <img src={o.image} alt="" className="w-full h-full object-cover" loading="lazy" />}</div>
      <span className="flex-1 min-w-0 truncate text-sm font-tamil">{o.label}</span>
      {o.flag && <span className="text-[10px] font-semibold text-amber-600 uppercase">{o.flag}</span>}
      {actions}
    </li>
  );
}
