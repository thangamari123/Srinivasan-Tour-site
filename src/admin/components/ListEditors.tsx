import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button, IconButton, TextArea } from '../ui';
import type { ItineraryDay } from '../../types/content';

/** Editable list of short strings (highlights, inclusions, exclusions…). */
export function StringListEditor({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    // Allow pasting several lines at once.
    const items = draft
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!items.length) return;
    onChange([...value, ...items]);
    setDraft('');
  };

  const update = (i: number, text: string) => onChange(value.map((v, idx) => (idx === i ? text : v)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <p className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} <span className="text-slate-400 font-normal">({value.length})</span>
      </p>
      {value.length > 0 && (
        <ul className="space-y-1.5 mb-2">
          {value.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span className="w-6 text-xs text-slate-400 text-right shrink-0">{i + 1}.</span>
              <input
                value={item}
                onChange={(e) => update(i, e.target.value)}
                aria-label={`${label} item ${i + 1}`}
                className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
              <IconButton icon={ArrowUp} label="Move up" disabled={i === 0} onClick={() => move(i, -1)} />
              <IconButton icon={ArrowDown} label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)} />
              <IconButton icon={Trash2} label="Remove" tone="danger" onClick={() => onChange(value.filter((_, idx) => idx !== i))} />
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData('text');
            if (text.includes('\n')) {
              e.preventDefault();
              const items = text.split('\n').map((s) => s.trim()).filter(Boolean);
              onChange([...value, ...items]);
            }
          }}
          placeholder={placeholder ?? 'Type and press Enter…'}
          aria-label={`Add ${label}`}
          className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
        />
        <Button variant="secondary" icon={Plus} onClick={add} disabled={!draft.trim()}>
          Add
        </Button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/** Day-wise itinerary editor. Day numbers are kept sequential automatically. */
export function ItineraryEditor({ value, onChange }: { value: ItineraryDay[]; onChange: (v: ItineraryDay[]) => void }) {
  const renumber = (days: ItineraryDay[]) => days.map((d, i) => ({ ...d, day: i + 1 }));
  const update = (i: number, patch: Partial<ItineraryDay>) =>
    onChange(value.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(renumber(next));
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-slate-500 rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center">
          No itinerary yet. The itinerary section is hidden on the website until you add a day.
        </p>
      )}
      {value.map((day, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center h-7 px-2.5 rounded-md bg-indigo-600 text-white text-xs font-semibold shrink-0">
              Day {i + 1}
            </span>
            <input
              value={day.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Title, e.g. Chennai → Tirupati"
              aria-label={`Day ${i + 1} title`}
              className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
            <IconButton icon={ArrowUp} label="Move up" disabled={i === 0} onClick={() => move(i, -1)} />
            <IconButton icon={ArrowDown} label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)} />
            <IconButton icon={Trash2} label="Remove day" tone="danger" onClick={() => onChange(renumber(value.filter((_, idx) => idx !== i)))} />
          </div>
          <TextArea
            value={day.description}
            onChange={(e) => update(i, { description: e.target.value })}
            rows={3}
            placeholder="What happens on this day…"
            aria-label={`Day ${i + 1} description`}
          />
        </div>
      ))}
      <Button
        variant="secondary"
        icon={Plus}
        onClick={() => onChange([...value, { day: value.length + 1, title: '', description: '' }])}
      >
        Add day
      </Button>
    </div>
  );
}
