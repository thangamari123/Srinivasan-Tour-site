import { useMemo, useRef, useState } from 'react';
import { Check, Copy, ImageOff, Info, Loader2, Search, Trash2, UploadCloud } from 'lucide-react';
import { COLLECTIONS } from '../../lib/firebaseConfig';
import { ALLOWED_IMAGE_TYPES } from '../../lib/api';
import { backend } from '../data/backend';
import { formatBytes } from '../../lib/imageUtils';
import { useCollection } from '../hooks/useCollection';
import { useActor, useUploader } from '../hooks/useUploader';
import { useAuth } from '../context/auth';
import { useConfirm, useToast } from '../context/feedback';
import { deleteMedia, findMediaUsage, type MediaFolder, type MediaUsage } from '../services/media';
import { errorMessage } from '../services/content';
import { Badge, Button, Card, EmptyState, ErrorBanner, Modal, PageHeader, SearchInput, SelectInput, Skeleton, cx } from '../ui';
import type { MediaItem } from '../../types/content';
import { formatDate } from '../utils';

const TYPE_LABEL: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/gif': 'GIF',
  'image/avif': 'AVIF',
};

export default function MediaLibrary() {
  const { isFullAdmin, getIdToken } = useAuth();
  const actor = useActor();
  const toast = useToast();
  const confirm = useConfirm();
  const [pageLimit, setPageLimit] = useState(60);
  const { data, loading, error, reload } = useCollection<MediaItem>(COLLECTIONS.media, { orderBy: 'uploadedAt', direction: 'desc', limit: pageLimit });
  const hasMore = data.length >= pageLimit;

  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [folder, setFolder] = useState('all');
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [usage, setUsage] = useState<MediaUsage[] | null>(null);
  const [checkingUsage, setCheckingUsage] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploadFolder, setUploadFolder] = useState<MediaFolder>('general');
  const detailsSeq = useRef(0);
  const { upload, tasks, cancel } = useUploader(uploadFolder);
  const isMediaApiConfigured = backend().mediaEnabled;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(
      (m) =>
        (type === 'all' || m.contentType === type) &&
        (folder === 'all' || m.folder === folder) &&
        (!q || (m.fileName ?? '').toLowerCase().includes(q) || (m.key ?? '').toLowerCase().includes(q)),
    );
  }, [data, search, type, folder]);

  const totalSize = useMemo(() => data.reduce((sum, m) => sum + (Number(m.size) || 0), 0), [data]);

  const openDetails = async (m: MediaItem) => {
    const seq = ++detailsSeq.current;
    setSelected(m);
    setUsage(null);
    setCheckingUsage(true);
    try {
      const found = await findMediaUsage(m.url);
      if (detailsSeq.current === seq) setUsage(found);
    } catch (err) {
      if (detailsSeq.current === seq) toast(errorMessage(err), 'error');
    } finally {
      if (detailsSeq.current === seq) setCheckingUsage(false);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast('Could not copy — select the URL and copy it manually', 'error');
    }
  };

  const remove = async () => {
    if (!selected || deleting) return;
    setDeleting(true);
    try {
      // Re-check right before deleting in case something started using it.
      const current = await findMediaUsage(selected.url);
      setUsage(current);
      if (current.length) {
        toast('This image is still in use. Remove it from those items first.', 'error');
        return;
      }
      if (!(await confirm({ title: 'Delete image permanently?', message: `“${selected.fileName}” will be deleted from storage. This cannot be undone.`, confirmLabel: 'Delete image', danger: true }))) return;
      await deleteMedia(selected, actor, getIdToken);
      toast('Image deleted');
      setSelected(null);
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Media Library"
        description={`All images stored in Cloudflare R2 · ${data.length}${hasMore ? '+' : ''} files · ${formatBytes(totalSize)}${hasMore ? '+' : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <SelectInput value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value as MediaFolder)} aria-label="Upload folder" className="py-1.5">
              <option value="general">General</option>
              <option value="packages">Packages</option>
              <option value="destinations">Destinations</option>
              <option value="categories">Categories</option>
              <option value="homepage">Homepage</option>
              <option value="testimonials">Testimonials</option>
            </SelectInput>
            <label className={cx('inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 cursor-pointer whitespace-nowrap', !isMediaApiConfigured && 'opacity-50 pointer-events-none')}>
              {tasks.length ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {tasks.length ? `Uploading ${tasks.length}…` : 'Upload images'}
              <input
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = '';
                  if (files.length) void upload(files);
                }}
              />
            </label>
          </div>
        }
      />

      {!isMediaApiConfigured && (
        <div className="mb-4">
          <ErrorBanner message="Uploads are disabled: VITE_MEDIA_API_URL is not set. See docs/ADMIN_SETUP.md." />
        </div>
      )}

      {tasks.length > 0 && (
        <Card className="mb-4">
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 text-sm">
                <span className="flex-1 truncate">{t.name}</span>
                <div className="w-40 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all" style={{ width: `${t.progress}%` }} />
                </div>
                <span className="w-10 text-right text-xs text-slate-500 tabular-nums">{t.progress}%</span>
                <button type="button" onClick={() => cancel(t.id)} className="text-xs font-medium text-slate-500 hover:text-rose-600">
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card padded={false}>
        <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-slate-200">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by file name…" className="flex-1" />
          <div className="grid grid-cols-2 gap-3 md:w-80">
            <SelectInput value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
              <option value="all">All types</option>
              {Object.entries(TYPE_LABEL).map(([mime, label]) => (
                <option key={mime} value={mime}>{label}</option>
              ))}
            </SelectInput>
            <SelectInput value={folder} onChange={(e) => setFolder(e.target.value)} aria-label="Filter by folder">
              <option value="all">All folders</option>
              {['packages', 'destinations', 'categories', 'homepage', 'testimonials', 'general'].map((f) => (
                <option key={f} value={f} className="capitalize">{f}</option>
              ))}
            </SelectInput>
          </div>
        </div>

        {error && <div className="p-4"><ErrorBanner message={error} onRetry={reload} /></div>}

        <div className="p-4">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={data.length ? Search : ImageOff} title={data.length ? 'No images match your filters' : 'No images uploaded yet'} description={data.length ? undefined : 'Images uploaded from any form appear here.'} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
              {filtered.map((m) => (
                <div key={m.id} className="group rounded-lg border border-slate-200 overflow-hidden bg-white">
                  <button type="button" onClick={() => openDetails(m)} className="block w-full aspect-square bg-slate-100 overflow-hidden" title="View details">
                    <img src={m.url} alt={m.fileName} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </button>
                  <div className="p-2">
                    <p className="text-xs font-medium text-slate-800 truncate" title={m.fileName}>{m.fileName}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-slate-500">{formatBytes(m.size)} · {TYPE_LABEL[m.contentType] ?? m.contentType}</span>
                      <button type="button" onClick={() => copyUrl(m.url)} className="p-1 rounded text-slate-400 hover:text-indigo-600" title="Copy URL" aria-label="Copy URL">
                        {copied === m.url ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && hasMore && (
            <div className="flex justify-center mt-6">
              <Button variant="secondary" onClick={() => setPageLimit((n) => n + 60)}>
                Load more
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => !deleting && setSelected(null)}
        title="Image details"
        size="lg"
        footer={
          selected && (
            <>
              {isFullAdmin && (
                <Button variant="danger" icon={Trash2} onClick={remove} loading={deleting} disabled={checkingUsage || Boolean(usage?.length)} className="mr-auto">
                  Delete
                </Button>
              )}
              <Button variant="secondary" icon={copied === selected.url ? Check : Copy} onClick={() => copyUrl(selected.url)}>
                Copy URL
              </Button>
              <a href={selected.url} target="_blank" rel="noreferrer">
                <Button variant="secondary">Open original</Button>
              </a>
            </>
          )
        }
      >
        {selected && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center max-h-80">
              <img src={selected.url} alt={selected.fileName} className="max-h-80 w-auto object-contain" />
            </div>
            <div className="space-y-3 text-sm">
              <dl className="grid grid-cols-[96px_1fr] gap-y-2">
                <dt className="text-slate-500">File name</dt>
                <dd className="text-slate-900 break-all">{selected.fileName}</dd>
                <dt className="text-slate-500">Size</dt>
                <dd>{formatBytes(selected.size)}</dd>
                <dt className="text-slate-500">Type</dt>
                <dd>{TYPE_LABEL[selected.contentType] ?? selected.contentType}</dd>
                {selected.width ? (
                  <>
                    <dt className="text-slate-500">Dimensions</dt>
                    <dd>{selected.width} × {selected.height}px</dd>
                  </>
                ) : null}
                <dt className="text-slate-500">Folder</dt>
                <dd className="capitalize">{selected.folder}</dd>
                <dt className="text-slate-500">Uploaded</dt>
                <dd>{formatDate(selected.uploadedAt, true)}</dd>
                <dt className="text-slate-500">By</dt>
                <dd className="break-all">{selected.uploadedBy ?? '—'}</dd>
              </dl>
              <input readOnly value={selected.url} onFocus={(e) => e.target.select()} aria-label="Image URL" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600" />
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Used in
                </p>
                {checkingUsage ? (
                  <p className="text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Checking…</p>
                ) : usage && usage.length ? (
                  <>
                    <ul className="space-y-1">
                      {usage.map((u) => (
                        <li key={`${u.collection}-${u.id}`} className="flex items-center gap-2">
                          <Badge tone="blue">{u.collection === COLLECTIONS.tourPackages ? 'Package' : u.collection === COLLECTIONS.homepage ? 'Homepage' : u.collection === COLLECTIONS.destinations ? 'Destination' : 'Category'}</Badge>
                          <span className="truncate font-tamil">{u.label}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-slate-500 mt-2">This image cannot be deleted while it is in use.</p>
                  </>
                ) : (
                  <p className="text-emerald-700">Not used anywhere — safe to delete.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
