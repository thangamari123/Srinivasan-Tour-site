import { useMemo, useState } from 'react';
import { FolderTree, ImageOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { COLLECTIONS } from '../../lib/firebaseConfig';
import { SLUG_PATTERN, slugify } from '../../lib/slug';
import { useCollection } from '../hooks/useCollection';
import { useActor } from '../hooks/useUploader';
import { useAuth } from '../context/auth';
import { useConfirm, useToast } from '../context/feedback';
import { countReferences, createItem, errorMessage, isSlugTaken, patchItem, removeItem, saveItem } from '../services/content';
import { ImageField } from '../components/ImageFields';
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
  TextArea,
  TextInput,
  Th,
  Toggle,
  cx,
} from '../ui';
import type { Category, ContentStatus, ImageRef, TagColor, TourPackage } from '../../types/content';
import { TAG_COLOR_CLASSES } from '../../data/defaultContent';

interface FormState {
  name: string;
  slug: string;
  description: string;
  image: ImageRef | null;
  tagColor: TagColor;
  status: ContentStatus;
  sortOrder: string;
}

const EMPTY: FormState = {
  name: '',
  slug: '',
  description: '',
  image: null,
  tagColor: 'emerald',
  status: 'active',
  sortOrder: '0',
};

const categoryOrder = (c: Category) => c.displayOrder ?? c.sortOrder ?? 0;

export default function Categories() {
  const { isFullAdmin } = useAuth();
  const actor = useActor();
  const toast = useToast();
  const confirm = useConfirm();
  const { data, loading, error, reload } = useCollection<Category>(COLLECTIONS.categories);
  const packages = useCollection<TourPackage>(COLLECTIONS.tourPackages);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    packages.data.forEach((p) => m.set(p.categoryId, (m.get(p.categoryId) ?? 0) + 1));
    return m;
  }, [packages.data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...data]
      .sort((a, b) => categoryOrder(a) - categoryOrder(b))
      .filter((c) => (statusFilter === 'all' || c.status === statusFilter) && [c.name, c.slug, c.description].some((s) => s?.toLowerCase().includes(q)));
  }, [data, search, statusFilter]);

  const open = (c: Category | 'new') => {
    setEditing(c);
    setErrors({});
    setSlugTouched(c !== 'new');
    setForm(
      c === 'new'
        ? { ...EMPTY, sortOrder: String(data.length) }
        : {
            name: c.name ?? '',
            slug: c.slug ?? '',
            description: c.description ?? '',
            image: c.image?.url ? c.image : null,
            tagColor: c.tagColor ?? 'emerald',
            status: c.status === 'inactive' ? 'inactive' : 'active',
            sortOrder: String(categoryOrder(c)),
          },
    );
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v, ...(k === 'name' && !slugTouched ? { slug: slugify(String(v)) } : {}) }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    if (k === 'name' && !slugTouched && errors.slug) setErrors((e) => ({ ...e, slug: undefined }));
  };

  const save = async () => {
    if (saving) return;
    const e: typeof errors = {};
    const name = form.name.trim();
    const slug = form.slug.trim();
    const rawOrder = form.sortOrder.trim();
    const order = Number(rawOrder);
    if (!name) e.name = 'Name is required';
    if (!slug || !SLUG_PATTERN.test(slug)) e.slug = 'Use lowercase letters, numbers and hyphens';
    else if (slug.length > 80) e.slug = 'Slug must be 80 characters or fewer';
    if (!rawOrder || !Number.isFinite(order) || !Number.isInteger(order) || order < 0) {
      e.sortOrder = 'Enter a whole number (0 or greater)';
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    if (form.image?.url?.startsWith('data:')) {
      toast('Images must be uploaded to Cloudflare R2; base64 data URLs are not allowed.', 'error');
      return;
    }

    const editId = editing !== 'new' && editing ? editing.id : undefined;
    setSaving(true);
    try {
      if (await isSlugTaken(COLLECTIONS.categories, slug, editId)) {
        setErrors({ slug: 'This slug is already used by another category' });
        return;
      }
      const payload = {
        name,
        slug,
        description: form.description.trim(),
        image: form.image?.url ? { ...form.image } : null,
        tagColor: form.tagColor,
        status: form.status,
        sortOrder: order,
        displayOrder: order,
      };
      if (editId) await saveItem(COLLECTIONS.categories, editId, payload, actor, payload.name);
      else await createItem(COLLECTIONS.categories, payload, actor, payload.name);
      toast(editId ? 'Category updated' : 'Category added');
      setEditing(null);
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (c: Category) => {
    if (busyId) return;
    setBusyId(c.id);
    try {
      const next = c.status === 'active' ? 'inactive' : 'active';
      await patchItem(COLLECTIONS.categories, c.id, { status: next }, actor, c.name);
      toast(next === 'active' ? 'Category activated' : 'Category deactivated');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (c: Category) => {
    if (busyId) return;
    setBusyId(c.id);
    try {
      const used = await countReferences(COLLECTIONS.tourPackages, 'categoryId', c.id);
      if (used > 0) {
        await confirm({
          title: 'Category in use',
          message: `${used} package${used > 1 ? 's are' : ' is'} in “${c.name}”. Move ${used > 1 ? 'them' : 'it'} to another category before deleting.`,
          confirmLabel: 'OK',
        });
        return;
      }
      if (!(await confirm({ title: 'Delete category?', message: `“${c.name}” will be permanently deleted.`, confirmLabel: 'Delete', danger: true }))) return;
      await removeItem(COLLECTIONS.categories, c.id, actor, c.name);
      toast('Category deleted');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Categories"
        description="Group packages (e.g. யாத்திரை, இந்தியா, வெளிநாடு). The colour is used for the badge on package cards."
        actions={<Button icon={Plus} onClick={() => open('new')}>Add category</Button>}
      />
      <Card padded={false}>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-200">
          <SearchInput value={search} onChange={setSearch} placeholder="Search categories…" className="flex-1" />
          <SelectInput value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status" containerClassName="sm:w-44">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </SelectInput>
        </div>
        {error && <div className="p-4"><ErrorBanner message={error} onRetry={reload} /></div>}
        {loading ? (
          <div key="loading">
            <TableSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <div key="empty">
            <EmptyState icon={FolderTree} title={data.length ? 'No categories match' : 'No categories yet'} action={!data.length && <Button icon={Plus} onClick={() => open('new')}>Add category</Button>} />
          </div>
        ) : (
          <div key="table">
            <Table>
              <thead>
                <tr>
                  <Th>Category</Th>
                  <Th className="hidden md:table-cell">Packages</Th>
                  <Th className="hidden sm:table-cell">Order</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <Td>
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div className="w-12 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                          {c.image?.url ? <img src={c.image.url} alt={c.name} className="w-full h-full object-cover" loading="lazy" /> : <ImageOff className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cx('w-2.5 h-2.5 rounded-full shrink-0', TAG_COLOR_CLASSES[c.tagColor ?? 'emerald']?.solid)} />
                            <button type="button" onClick={() => open(c)} className="font-medium text-slate-900 hover:text-indigo-600 font-tamil text-left">{c.name}</button>
                          </div>
                          <p className="text-xs text-slate-500">{c.slug}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="hidden md:table-cell tabular-nums">{counts.get(c.id) ?? 0}</Td>
                    <Td className="hidden sm:table-cell tabular-nums">{categoryOrder(c)}</Td>
                    <Td>
                      <button type="button" onClick={() => toggleStatus(c)} disabled={busyId === c.id} title="Toggle status">
                        <StatusBadge status={c.status} />
                      </button>
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end">
                        <IconButton icon={Pencil} label="Edit" onClick={() => open(c)} disabled={busyId === c.id} />
                        {isFullAdmin && <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => remove(c)} disabled={busyId === c.id} />}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => !saving && setEditing(null)}
        title={editing === 'new' ? 'Add category' : 'Edit category'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button onClick={save} loading={saving}>{editing === 'new' ? 'Add category' : 'Save changes'}</Button>
          </>
        }
      >
        <div className="grid md:grid-cols-2 gap-4">
          <TextInput label="Category name" required value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} className="font-tamil" />
          <TextInput
            label="Slug"
            required
            value={form.slug}
            hint="Lowercase letters, numbers, and hyphens (type an English slug for Tamil names)."
            onChange={(e) => {
              setSlugTouched(true);
              set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
            }}
            error={errors.slug}
          />
          <TextArea label="Description" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} containerClassName="md:col-span-2" className="font-tamil" />
          <div>
            <p className="block text-sm font-medium text-slate-700 mb-1.5">Badge colour</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TAG_COLOR_CLASSES) as TagColor[]).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => set('tagColor', color)}
                  aria-label={color}
                  aria-pressed={form.tagColor === color}
                  className={cx(
                    'w-8 h-8 rounded-full bg-gradient-to-br ring-offset-2 transition',
                    TAG_COLOR_CLASSES[color].gradient,
                    form.tagColor === color ? 'ring-2 ring-slate-900' : 'hover:scale-110',
                  )}
                />
              ))}
            </div>
          </div>
          <TextInput
            label="Display order"
            type="number"
            min={0}
            step={1}
            value={form.sortOrder}
            error={errors.sortOrder}
            onChange={(e) => set('sortOrder', e.target.value)}
          />
          <div className="md:col-span-2">
            <ImageField
              label="Category image"
              value={form.image}
              onChange={(v) => set('image', v)}
              folder="categories"
              aspect="aspect-[4/3]"
              hint="Upload via Cloudflare R2 or select from Media Library."
            />
          </div>
          <div className="md:col-span-2">
            <Toggle checked={form.status === 'active'} onChange={(v) => set('status', v ? 'active' : 'inactive')} label="Active" />
          </div>
        </div>
      </Modal>
    </>
  );
}
