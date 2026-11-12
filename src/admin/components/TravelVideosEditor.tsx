import { useRef, useState, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, GripVertical, Play, Plus, Trash2, Youtube } from 'lucide-react';
import { Button, IconButton, TextArea, TextInput, Toggle, cx } from '../ui';
import { TravelReelsGrid } from '../../components/TravelReels';
import { parseYouTubeId, youTubeThumbnail } from '../../lib/youtube';
import type { TravelVideo } from '../../types/content';
import { MAX_TRAVEL_VIDEOS, TRAVEL_VIDEO_LIMITS, renumberVideos } from '../services/travelVideos';

const LIMITS = TRAVEL_VIDEO_LIMITS;
const renumber = renumberVideos;

interface Draft {
  url: string;
  title: string;
  location: string;
  description: string;
}

const EMPTY_DRAFT: Draft = { url: '', title: '', location: '', description: '' };

export default function TravelVideosEditor({
  value,
  onChange,
  defaultLocation = '',
}: {
  value: TravelVideo[];
  onChange: (videos: TravelVideo[]) => void;
  defaultLocation?: string;
}) {
  const [formOpen, setFormOpen] = useState(value.length === 0);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [touched, setTouched] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  // Ref mirrors dragIndex so dragover/drop work even before React re-renders.
  const dragRef = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const draftId = parseYouTubeId(draft.url);
  const duplicate = Boolean(draftId && value.some((v) => v.videoId === draftId));
  const urlError = !draft.url.trim()
    ? touched
      ? 'Paste a YouTube Shorts or video link'
      : undefined
    : !draftId
      ? 'Not a valid YouTube link. Use youtube.com/shorts/…, youtu.be/… or youtube.com/watch?v=…'
      : duplicate
        ? 'This video is already added to the package'
        : undefined;
  const titleError = touched && !draft.title.trim() ? 'Video title is required' : undefined;
  const full = value.length >= MAX_TRAVEL_VIDEOS;

  const add = () => {
    setTouched(true);
    if (!draftId || duplicate || !draft.title.trim() || full) return;
    onChange(
      renumber([
        ...value,
        {
          videoId: draftId,
          url: draft.url.trim(),
          title: draft.title.trim().slice(0, LIMITS.title),
          location: (draft.location.trim() || defaultLocation).slice(0, LIMITS.location),
          description: draft.description.trim().slice(0, LIMITS.description),
          enabled: true,
          displayOrder: value.length + 1,
        },
      ]),
    );
    setDraft(EMPTY_DRAFT);
    setTouched(false);
    setFormOpen(false);
  };

  const update = (i: number, patch: Partial<TravelVideo>) => onChange(value.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(renumber(next));
  };
  const remove = (i: number) => {
    const next = renumber(value.filter((_, idx) => idx !== i));
    onChange(next);
    if (next.length === 0) setFormOpen(true);
  };

  const enabledVideos = value.filter((v) => v.enabled);

  return (
    <div className="space-y-6">
      {/* ── Added videos ── */}
      {value.length > 0 && (
        <ul className="space-y-3" aria-label="Travel videos">
          {value.map((v, i) => (
            <li
              key={v.videoId}
              draggable
              onDragStart={(e: DragEvent) => {
                dragRef.current = i;
                setDragIndex(i);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(i));
              }}
              onDragOver={(e) => {
                if (dragRef.current === null) return;
                e.preventDefault();
                setOverIndex(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragRef.current !== null) move(dragRef.current, i);
                dragRef.current = null;
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                dragRef.current = null;
                setDragIndex(null);
                setOverIndex(null);
              }}
              data-video-id={v.videoId}
              className={cx(
                'flex gap-3 rounded-xl border bg-white p-3 transition-all',
                overIndex === i && dragIndex !== i ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200',
                dragIndex === i && 'opacity-40',
                !v.enabled && 'bg-slate-50',
              )}
            >
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className="text-xs font-semibold text-slate-500 tabular-nums">#{i + 1}</span>
                <span className="hidden sm:block cursor-grab text-slate-400" title="Drag to reorder">
                  <GripVertical className="w-4 h-4" />
                </span>
                <IconButton icon={ArrowUp} label="Move video up" disabled={i === 0} onClick={() => move(i, i - 1)} />
                <IconButton icon={ArrowDown} label="Move video down" disabled={i === value.length - 1} onClick={() => move(i, i + 1)} />
              </div>

              <div className={cx('relative w-16 sm:w-20 aspect-[9/16] rounded-lg overflow-hidden bg-slate-900 shrink-0', !v.enabled && 'opacity-50')}>
                <img src={youTubeThumbnail(v.videoId)} alt="" loading="lazy" className="w-full h-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                  </span>
                </span>
              </div>

              <div className="flex-1 min-w-0 grid sm:grid-cols-2 gap-2">
                <TextInput
                  aria-label={`Video ${i + 1} title`}
                  placeholder="Video title"
                  value={v.title}
                  maxLength={LIMITS.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  error={!v.title.trim() ? 'Title is required' : undefined}
                  className="font-tamil"
                />
                <TextInput
                  aria-label={`Video ${i + 1} location`}
                  placeholder="Location / destination"
                  value={v.location}
                  maxLength={LIMITS.location}
                  onChange={(e) => update(i, { location: e.target.value })}
                  className="font-tamil"
                />
                <TextInput
                  aria-label={`Video ${i + 1} description`}
                  placeholder="Short description (optional)"
                  value={v.description}
                  maxLength={LIMITS.description}
                  onChange={(e) => update(i, { description: e.target.value })}
                  containerClassName="sm:col-span-2"
                  className="font-tamil"
                />
                <div className="sm:col-span-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Toggle checked={v.enabled} onChange={(on) => update(i, { enabled: on })} label={v.enabled ? 'Shown on website' : 'Hidden'} />
                  <a href={`https://www.youtube.com/shorts/${v.videoId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-indigo-600 font-mono">
                    {v.videoId}
                  </a>
                </div>
              </div>

              <IconButton icon={Trash2} label={`Remove video ${i + 1}`} tone="danger" onClick={() => remove(i)} />
            </li>
          ))}
        </ul>
      )}

      {/* ── Add video form ── */}
      {formOpen && !full ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 space-y-4">
          <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
            <div className="space-y-4">
              <TextInput
                label="YouTube Shorts URL"
                required
                type="url"
                inputMode="url"
                placeholder="https://youtube.com/shorts/VIDEO_ID"
                value={draft.url}
                onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
                error={urlError}
                hint={draftId && !duplicate ? undefined : 'Supports youtube.com/shorts/…, youtu.be/… and youtube.com/watch?v=…'}
              />
              {draftId && !duplicate && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-700 -mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid video · ID <code className="font-mono">{draftId}</code>
                </p>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <TextInput
                  label="Video title"
                  required
                  maxLength={LIMITS.title}
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  error={titleError}
                  className="font-tamil"
                />
                <TextInput
                  label="Location / destination"
                  maxLength={LIMITS.location}
                  placeholder={defaultLocation || 'e.g. Munnar'}
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  className="font-tamil"
                />
              </div>
              <TextArea
                label="Short description (optional)"
                rows={2}
                maxLength={LIMITS.description}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="font-tamil"
              />
            </div>

            {/* Thumbnail preview before saving */}
            <div className="w-28 mx-auto md:mx-0">
              <p className="text-xs font-medium text-slate-500 mb-1.5 text-center">Thumbnail</p>
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-200 border border-slate-200">
                {draftId ? (
                  <img src={youTubeThumbnail(draftId)} alt="Video thumbnail preview" className="w-full h-full object-cover" data-testid="draft-thumbnail" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <Youtube className="w-7 h-7" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {value.length > 0 && (
              <Button variant="secondary" onClick={() => { setFormOpen(false); setDraft(EMPTY_DRAFT); setTouched(false); }}>
                Cancel
              </Button>
            )}
            <Button icon={Plus} onClick={add} disabled={Boolean(draft.url && (!draftId || duplicate))}>
              Add video
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" icon={Plus} onClick={() => setFormOpen(true)} disabled={full}>
          {full ? `Maximum ${MAX_TRAVEL_VIDEOS} videos` : 'Add Another Video'}
        </Button>
      )}

      {/* ── Live preview (same component as the public website) ── */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-1">Live preview</p>
        <p className="text-xs text-slate-500 mb-3">Exactly as shown on the website. Click a card to preview playback. Hidden videos are not shown.</p>
        {enabledVideos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            No videos to show yet — the Travel Reels section stays hidden on the website until you add and enable a video.
          </div>
        ) : (
          <div className="rounded-xl bg-white border border-slate-200 p-4 sm:p-6" data-testid="reels-preview">
            <TravelReelsGrid videos={enabledVideos} />
          </div>
        )}
      </div>
    </div>
  );
}
