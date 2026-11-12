import { useEffect, useRef, useState, type DragEvent } from 'react';
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Library, Trash2, UploadCloud, X } from 'lucide-react';
import { Button, IconButton, cx } from '../ui';
import MediaPickerModal from './MediaPickerModal';
import { useUploader, type UploadTask } from '../hooks/useUploader';
import type { MediaFolder } from '../services/media';
import type { ImageRef } from '../../types/content';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '../../lib/api';
import { formatBytes } from '../../lib/imageUtils';

const ACCEPT = ALLOWED_IMAGE_TYPES.join(',');

/* ─── Drop zone ─── */

function DropZone({
  onFiles,
  multiple,
  compact,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  compact?: boolean;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  return (
    <div
      onDragOver={(e) => {
        // Ignore internal thumbnail drags (reordering) — only react to files.
        if (!e.dataTransfer.types.includes('Files')) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Upload images"
      className={cx(
        'flex flex-col items-center justify-center text-center rounded-xl border-2 border-dashed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        compact ? 'p-4 h-full min-h-[7rem]' : 'p-6 sm:p-8',
        over ? 'border-indigo-500 bg-indigo-50/60' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50',
        disabled && 'opacity-60 cursor-not-allowed',
      )}
    >
      <UploadCloud className={cx('text-slate-400 mb-2', compact ? 'w-6 h-6' : 'w-8 h-8')} />
      <p className="text-sm font-medium text-slate-700">
        <span className="text-indigo-600">Click to upload</span>
        {!compact && ' or drag and drop'}
      </p>
      {!compact && (
        <p className="text-xs text-slate-500 mt-1">
          JPG, PNG, WebP, GIF, AVIF · up to {formatBytes(MAX_UPLOAD_BYTES)} · large photos are compressed automatically
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}

function UploadTile({ task, onCancel }: { task: UploadTask; onCancel: (id: string) => void }) {
  return (
    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
      <img src={task.previewUrl} alt="" className="w-full h-full object-cover opacity-50" />
      <button
        type="button"
        onClick={() => onCancel(task.id)}
        aria-label={`Cancel upload of ${task.name}`}
        title="Cancel upload"
        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 text-slate-600 hover:text-rose-600 flex items-center justify-center shadow"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="absolute inset-x-2 bottom-2">
        <div className="h-1.5 rounded-full bg-white/80 overflow-hidden">
          <div className="h-full bg-indigo-600 transition-all" style={{ width: `${task.progress}%` }} />
        </div>
        <p className="text-[11px] font-medium text-slate-800 mt-1 truncate">
          {task.progress < 100 ? `Uploading ${task.progress}%` : 'Processing…'}
        </p>
      </div>
    </div>
  );
}

/* ─── Single image ─── */

export function ImageField({
  label,
  value,
  onChange,
  folder,
  hint,
  aspect = 'aspect-[16/9]',
}: {
  label: string;
  value: ImageRef | null;
  onChange: (value: ImageRef | null) => void;
  folder: MediaFolder;
  hint?: string;
  aspect?: string;
}) {
  const { upload, tasks, cancel } = useUploader(folder);
  const [pickerOpen, setPickerOpen] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: File[]) => {
    const [ref] = await upload(files.slice(0, 1));
    if (ref) onChange(ref);
  };

  return (
    <div>
      <p className="block text-sm font-medium text-slate-700 mb-1.5">{label}</p>
      <input
        ref={replaceInputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length) handleFiles(files);
        }}
      />
      {tasks[0] ? (
        <div className={cx('max-w-md', aspect)}>
          <UploadTile task={tasks[0]} onCancel={cancel} />
        </div>
      ) : value?.url ? (
        <div className={cx('relative group max-w-md rounded-xl overflow-hidden bg-slate-100 border border-slate-200', aspect)}>
          <img src={value.url} alt={value.alt ?? ''} className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/75 via-slate-900/35 to-transparent flex flex-wrap items-center justify-end gap-2 p-2.5">
            <Button size="sm" variant="secondary" icon={UploadCloud} onClick={() => replaceInputRef.current?.click()}>
              Upload
            </Button>
            <Button size="sm" variant="secondary" icon={Library} onClick={() => setPickerOpen(true)}>
              Replace
            </Button>
            <Button size="sm" variant="danger" icon={Trash2} onClick={() => onChange(null)}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-md space-y-2">
          <DropZone onFiles={handleFiles} />
          <Button size="sm" variant="ghost" icon={Library} onClick={() => setPickerOpen(true)}>
            Choose from media library
          </Button>
        </div>
      )}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      <MediaPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(refs) => refs[0] && onChange(refs[0])} />
    </div>
  );
}

/* ─── Gallery (multiple, reorderable) ─── */

export function GalleryField({
  label,
  value,
  onChange,
  folder,
  hint,
  max = 40,
}: {
  label: string;
  value: ImageRef[];
  onChange: (value: ImageRef[]) => void;
  folder: MediaFolder;
  hint?: string;
  max?: number;
}) {
  const { upload, tasks, cancel } = useUploader(folder);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // Keep a ref to the latest value: uploads resolve after the user may have reordered/removed items.
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const addRefs = (refs: ImageRef[]) => {
    const existing = new Set(latest.current.map((v) => v.url));
    onChange([...latest.current, ...refs.filter((r) => !existing.has(r.url))].slice(0, max));
  };

  const handleFiles = async (files: File[]) => {
    const room = max - latest.current.length;
    const refs = await upload(files.slice(0, Math.max(room, 0)));
    if (refs.length) addRefs(refs);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm font-medium text-slate-700">
          {label} <span className="text-slate-400 font-normal">({value.length}/{max})</span>
        </p>
        <Button size="sm" variant="ghost" icon={Library} onClick={() => setPickerOpen(true)}>
          From library
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {value.map((img, index) => (
          <div
            key={`${img.url}-${index}`}
            draggable
            onDragStart={(e) => {
              setDragIndex(index);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(index));
            }}
            onDragOver={(e) => {
              if (dragIndex === null) return;
              e.preventDefault();
              setOverIndex(index);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null) move(dragIndex, index);
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={cx(
              'relative group aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 border transition-all',
              overIndex === index && dragIndex !== index ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-200',
              dragIndex === index && 'opacity-40',
            )}
          >
            <img src={img.url} alt="" loading="lazy" className="w-full h-full object-cover pointer-events-none" />
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/60 text-white text-[10px] font-semibold">
              {index + 1}
            </span>
            <span className="absolute top-1.5 right-1.5 p-1 rounded bg-white/80 text-slate-500 cursor-grab hidden sm:block" title="Drag to reorder">
              <GripVertical className="w-3.5 h-3.5" />
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-1 bg-gradient-to-t from-slate-900/70 to-transparent">
              <div className="flex">
                <IconButton icon={ArrowLeft} label="Move left" className="text-white hover:text-white hover:bg-white/20 w-7 h-7" disabled={index === 0} onClick={() => move(index, index - 1)} />
                <IconButton icon={ArrowRight} label="Move right" className="text-white hover:text-white hover:bg-white/20 w-7 h-7" disabled={index === value.length - 1} onClick={() => move(index, index + 1)} />
              </div>
              <IconButton
                icon={Trash2}
                label="Remove from gallery"
                className="text-white hover:text-white hover:bg-rose-500/80 w-7 h-7"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              />
            </div>
          </div>
        ))}
        {tasks.map((t) => (
          <UploadTile key={t.id} task={t} onCancel={cancel} />
        ))}
        {value.length + tasks.length < max && (
          <div className="aspect-[4/3]">
            <DropZone onFiles={handleFiles} multiple compact />
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
        <ImagePlus className="w-3.5 h-3.5" />
        {hint ?? 'Drag thumbnails (or use the arrows) to reorder. Removing an image here keeps it in the media library.'}
      </p>
      <MediaPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addRefs} multiple />
    </div>
  );
}
