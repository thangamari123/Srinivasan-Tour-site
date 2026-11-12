import { useMemo, useState } from 'react';
import { MessageSquareQuote, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { COLLECTIONS } from '../../lib/firebaseConfig';
import { useCollection } from '../hooks/useCollection';
import { useActor } from '../hooks/useUploader';
import { useAuth } from '../context/auth';
import { useConfirm, useToast } from '../context/feedback';
import { createItem, errorMessage, patchItem, removeItem, saveItem } from '../services/content';
import { Button, Card, EmptyState, ErrorBanner, IconButton, Modal, PageHeader, SearchInput, StatusBadge, TableSkeleton, TextArea, TextInput, Toggle, cx } from '../ui';
import type { ContentStatus, Testimonial } from '../../types/content';
import { TESTIMONIAL_COLORS } from '../../data/defaultContent';

interface FormState {
  name: string;
  location: string;
  tour: string;
  text: string;
  rating: number;
  color: string;
  status: ContentStatus;
  sortOrder: string;
}

const EMPTY: FormState = { name: '', location: '', tour: '', text: '', rating: 5, color: TESTIMONIAL_COLORS[0], status: 'active', sortOrder: '0' };

export default function Testimonials() {
  const { isFullAdmin } = useAuth();
  const actor = useActor();
  const toast = useToast();
  const confirm = useConfirm();
  const { data, loading, error, reload } = useCollection<Testimonial>(COLLECTIONS.testimonials);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Testimonial | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...data]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .filter((t) => [t.name, t.location, t.tour, t.text].some((s) => s?.toLowerCase().includes(q)));
  }, [data, search]);

  const safeRating = (r: unknown) => Math.min(5, Math.max(1, Math.round(Number(r) || 5)));

  const open = (t: Testimonial | 'new') => {
    setEditing(t);
    setErrors({});
    setForm(
      t === 'new'
        ? { ...EMPTY, color: TESTIMONIAL_COLORS[data.length % TESTIMONIAL_COLORS.length], sortOrder: String(data.length) }
        : {
            name: t.name ?? '',
            location: t.location ?? '',
            tour: t.tour ?? '',
            text: t.text ?? '',
            rating: safeRating(t.rating),
            color: t.color || TESTIMONIAL_COLORS[0],
            status: t.status === 'inactive' ? 'inactive' : 'active',
            sortOrder: String(t.sortOrder ?? 0),
          },
    );
  };
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const save = async () => {
    if (saving) return;
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.text.trim()) e.text = 'Review text is required';
    setErrors(e);
    if (Object.keys(e).length) return;
    const editId = editing !== 'new' && editing ? editing.id : undefined;
    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        location: form.location.trim(),
        tour: form.tour.trim(),
        text: form.text.trim(),
        rating: safeRating(form.rating),
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editId) await saveItem(COLLECTIONS.testimonials, editId, payload, actor, payload.name);
      else await createItem(COLLECTIONS.testimonials, payload, actor, payload.name);
      toast(editId ? 'Testimonial updated' : 'Testimonial added');
      setEditing(null);
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (t: Testimonial) => {
    if (busyId) return;
    setBusyId(t.id);
    try {
      await patchItem(COLLECTIONS.testimonials, t.id, { status: t.status === 'active' ? 'inactive' : 'active' }, actor, t.name ?? 'Testimonial');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (t: Testimonial) => {
    if (busyId) return;
    if (!(await confirm({ title: 'Delete testimonial?', message: `The review by “${t.name}” will be permanently deleted.`, confirmLabel: 'Delete', danger: true }))) return;
    setBusyId(t.id);
    try {
      await removeItem(COLLECTIONS.testimonials, t.id, actor, t.name ?? 'Testimonial');
      toast('Testimonial deleted');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader title="Testimonials" description="Customer reviews shown in the homepage slider. The section hides automatically when none are active." actions={<Button icon={Plus} onClick={() => open('new')}>Add testimonial</Button>} />
      <Card padded={false}>
        <div className="p-4 border-b border-slate-200">
          <SearchInput value={search} onChange={setSearch} placeholder="Search reviews…" />
        </div>
        {error && <div className="p-4"><ErrorBanner message={error} onRetry={reload} /></div>}
        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={MessageSquareQuote} title={data.length ? 'No reviews match' : 'No testimonials yet'} action={!data.length && <Button icon={Plus} onClick={() => open('new')}>Add testimonial</Button>} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((t) => (
              <li key={t.id} className="flex items-start gap-4 px-4 sm:px-5 py-4 hover:bg-slate-50/60">
                <div className={cx('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-semibold shrink-0', t.color || TESTIMONIAL_COLORS[0])}>
                  {(t.name ?? '?').charAt(0) || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="font-medium text-slate-900 font-tamil">{t.name}</p>
                    <span className="text-xs text-slate-500 font-tamil">{[t.location, t.tour].filter(Boolean).join(' · ')}</span>
                    <span className="flex">{Array.from({ length: Math.min(5, Math.max(0, Math.round(Number(t.rating) || 0))) }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2 font-tamil">{t.text}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => toggleStatus(t)} disabled={busyId === t.id} title="Toggle status" className="hidden sm:block">
                    <StatusBadge status={t.status} />
                  </button>
                  <IconButton icon={Pencil} label="Edit" onClick={() => open(t)} disabled={busyId === t.id} />
                  {isFullAdmin && <IconButton icon={Trash2} label="Delete" tone="danger" onClick={() => remove(t)} disabled={busyId === t.id} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => !saving && setEditing(null)}
        title={editing === 'new' ? 'Add testimonial' : 'Edit testimonial'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="grid md:grid-cols-2 gap-4">
          <TextInput label="Customer name" required value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} className="font-tamil" />
          <TextInput label="Location" value={form.location} onChange={(e) => set('location', e.target.value)} className="font-tamil" />
          <TextInput label="Tour taken" value={form.tour} onChange={(e) => set('tour', e.target.value)} containerClassName="md:col-span-2" className="font-tamil" />
          <TextArea label="Review" required rows={4} value={form.text} onChange={(e) => set('text', e.target.value)} error={errors.text} containerClassName="md:col-span-2" className="font-tamil" />
          <div>
            <p className="block text-sm font-medium text-slate-700 mb-1.5">Rating</p>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={form.rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => set('rating', n)}>
                  <Star className={cx('w-6 h-6', n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="block text-sm font-medium text-slate-700 mb-1.5">Accent colour</p>
            <div className="flex gap-2">
              {TESTIMONIAL_COLORS.map((c) => (
                <button key={c} type="button" aria-label={c} aria-pressed={form.color === c} onClick={() => set('color', c)} className={cx('w-7 h-7 rounded-full bg-gradient-to-br ring-offset-2', c, form.color === c && 'ring-2 ring-slate-900')} />
              ))}
            </div>
          </div>
          <TextInput label="Display order" type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
          <div className="self-end pb-2">
            <Toggle checked={form.status === 'active'} onChange={(v) => set('status', v ? 'active' : 'inactive')} label="Show on website" />
          </div>
        </div>
      </Modal>
    </>
  );
}
