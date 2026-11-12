import { useMemo, useState } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
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
} from '../ui';
import type { ContentStatus, Destination, ImageRef } from '../../types/content';

interface FormState {
  name: string;
  slug: string;
  description: string;
  image: ImageRef | null;
  country: string;
  state: string;
  status: ContentStatus;
}

const EMPTY: FormState = { name: '', slug: '', description: '', image: null, country: 'India', state: '', status: 'active' };

export default function Destinations() {
  const { isFullAdmin } = useAuth();
  const actor = useActor();
  const toast = useToast();
  const confirm = useConfirm();
  const { data, loading, error, reload } = useCollection<Destination>(COLLECTIONS.destinations);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<Destination | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...data]
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
      .filter((d) => (statusFilter === 'all' || d.status === statusFilter) && [d.name, d.state, d.country, d.slug].some((s) => s?.toLowerCase().includes(q)));
  }, [data, search, statusFilter]);

  const open = (d: Destination | 'new') => {
    setEditing(d);
    setErrors({});
    setSlugTouched(d !== 'new');
    setForm(
      d === 'new'
        ? EMPTY
        : {
            name: d.name ?? '',
            slug: d.slug ?? '',
            description: d.description ?? '',
            image: d.image?.url ? d.image : null,
            country: d.country ?? '',
            state: d.state ?? '',
            status: d.status === 'inactive' ? 'inactive' : 'active',
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
    if (!name) e.name = 'Name is required';
    if (!slug || !SLUG_PATTERN.test(slug)) e.slug = 'Use lowercase letters, numbers and hyphens';
    else if (slug.length > 80) e.slug = 'Slug must be 80 characters or fewer';
    setErrors(e);
    if (Object.keys(e).length) return;

    const editId = editing !== 'new' && editing ? editing.id : undefined;
    setSaving(true);
    try {
      if (await isSlugTaken(COLLECTIONS.destinations, slug, editId)) {
        setErrors({ slug: 'This slug is already used by another destination' });
        return;
      }
      const payload = { ...form, name, slug, description: form.description.trim(), country: form.country.trim(), state: form.state.trim() };
      if (editId) await saveItem(COLLECTIONS.destinations, editId, payload, actor, payload.name);
      else await createItem(COLLECTIONS.destinations, payload, actor, payload.name);
      toast(editId ? 'Destination updated' : 'Destination added');
      setEditing(null);
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (d: Destination) => {
    if (busyId) return;
    setBusyId(d.id);
    try {
      const next = d.status === 'active' ? 'inactive' : 'active';
      await patchItem(COLLECTIONS.destinations, d.id, { status: next }, actor, d.name);
      toast(next === 'active' ? 'Destination activated' : 'Destination deactivated');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (d: Destination) => {
    if (busyId) return;
    setBusyId(d.id);
    try {
      const used = await countReferences(COLLECTIONS.tourPackages, 'destinationId', d.id);
      if (used > 0) {
        await confirm({
          title: 'Destination in use',
          message: `${used} package${used > 1 ? 's use' : ' uses'} “${d.name}”. Reassign ${used > 1 ? 'them' : 'it'} to another destination (or deactivate this one) before deleting.`,
          confirmLabel: 'OK',
        });
        return;
      }
      if (!(await confirm({ title: 'Delete destination?', message: `“${d.name}” will be permanently deleted.`, confirmLabel: 'Delete', danger: true }))) return;
      await removeItem(COLLECTIONS.destinations, d.id, actor, d.name);
      toast('Destination deleted');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Destinations"
        description="Places your tours go to. Active destinations can be shown on the homepage."
        actions={<Button icon={Plus} onClick={() => open('new')}>Add destination</Button>}
      />
      <Card padded={false}>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-200">
          <SearchInput value={search} onChange={setSearch} placeholder="Search destinations…" className="flex-1" />
          <SelectInput value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status" containerClassName="sm:w-44">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </SelectInput>
        </div>
        {error && <div className="p-4"><ErrorBanner message={error} onRetry={reload} /></div>}
        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={MapPin} title={data.length ? 'No destinations match' : 'No destinations yet'} action={!data.length && <Button icon={Plus} onClick={() => open('new')}>Add destination</Button>} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Destination</Th>
                <Th className="hidden md:table-cell">Location</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60">
                  <Td>
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <div className="w-12 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        {d.image?.url && <img src={d.image.url} alt="" className="w-full h-full object-cover" loading="lazy" />}
                      </div>
                      <div className="min-w-0">
                        <button type="button" onClick={() => open(d)} className="font-medium text-slate-900 hover:text-indigo-600 text-left font-tamil">{d.name}</button>
                        <p className="text-xs text-slate-500">{d.slug}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="hidden md:table-cell">{[d.state, d.country].filter(Boolean).join(', ') || '—'}</Td>
                  <Td>
                    <button type="button" onClick={() => toggleStatus(d)} disabled={busyId === d.id} title="Toggle status">
                      <StatusBadge status={d.status} />
                    </button>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end">
                      <IconButton icon={Pencil} label="Edit" onClick={() => open(d)} disabled={busyId === d.id} />
                      {isFullAdmin && <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => remove(d)} disabled={busyId === d.id} />}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => !saving && setEditing(null)}
        title={editing === 'new' ? 'Add destination' : 'Edit destination'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button onClick={save} loading={saving}>{editing === 'new' ? 'Add destination' : 'Save changes'}</Button>
          </>
        }
      >
        <div className="grid md:grid-cols-2 gap-4">
          <TextInput label="Destination name" required value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} className="font-tamil" />
          <TextInput
            label="Slug"
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
            }}
            error={errors.slug}
          />
          <TextInput label="State / Region" value={form.state} onChange={(e) => set('state', e.target.value)} />
          <TextInput label="Country" value={form.country} onChange={(e) => set('country', e.target.value)} />
          <TextArea label="Description" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} containerClassName="md:col-span-2" className="font-tamil" />
          <div className="md:col-span-2">
            <ImageField label="Destination image" value={form.image} onChange={(v) => set('image', v)} folder="destinations" aspect="aspect-[4/3]" />
          </div>
          <div className="md:col-span-2">
            <Toggle checked={form.status === 'active'} onChange={(v) => set('status', v ? 'active' : 'inactive')} label="Active" description="Inactive destinations are hidden from the website." />
          </div>
        </div>
      </Modal>
    </>
  );
}
