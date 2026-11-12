import { useMemo, useState } from 'react';
import { Check, ImageOff } from 'lucide-react';
import { Button, EmptyState, ErrorBanner, Modal, SearchInput, Skeleton, cx } from '../ui';
import { useCollection } from '../hooks/useCollection';
import { COLLECTIONS } from '../../lib/firebaseConfig';
import type { ImageRef, MediaItem } from '../../types/content';

/** Pick one or more already-uploaded images from the media library. */
export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
  multiple = false,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (refs: ImageRef[]) => void;
  multiple?: boolean;
}) {
  if (!open) return null;
  return <PickerBody onClose={onClose} onSelect={onSelect} multiple={multiple} />;
}

function PickerBody({
  onClose,
  onSelect,
  multiple,
}: {
  onClose: () => void;
  onSelect: (refs: ImageRef[]) => void;
  multiple: boolean;
}) {
  const { data, loading, error } = useCollection<MediaItem>(COLLECTIONS.media, { orderBy: 'uploadedAt', direction: 'desc', limit: 300 });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(
    () => data.filter((m) => m.fileName?.toLowerCase().includes(search.toLowerCase())),
    [data, search],
  );

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : multiple ? [...s, id] : [id]));

  const confirm = () => {
    const byId = new Map(data.map((m) => [m.id, m]));
    onSelect(
      selected
        .map((id) => byId.get(id))
        .filter((m): m is MediaItem => Boolean(m))
        .map((m) => ({ url: m.url, key: m.key, mediaId: m.id })),
    );
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Media library"
      description={multiple ? 'Select one or more images' : 'Select an image'}
      size="xl"
      footer={
        <>
          <span className="mr-auto text-sm text-slate-500 self-center">{selected.length} selected</span>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={!selected.length}>
            Use {selected.length > 1 ? 'images' : 'image'}
          </Button>
        </>
      }
    >
      <SearchInput value={search} onChange={setSearch} placeholder="Search by file name…" className="mb-4" />
      {error && <ErrorBanner message={error} />}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ImageOff} title="No images found" description="Upload images from any form, or from the Media Library page." />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((m) => {
            const isSelected = selected.includes(m.id);
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => toggle(m.id)}
                className={cx(
                  'relative aspect-square rounded-lg overflow-hidden bg-slate-100 ring-2 transition-all',
                  isSelected ? 'ring-indigo-600' : 'ring-transparent hover:ring-slate-300',
                )}
                title={m.fileName}
              >
                <img src={m.url} alt={m.fileName} loading="lazy" className="w-full h-full object-cover" />
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
