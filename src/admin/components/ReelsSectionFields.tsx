import { Film } from 'lucide-react';
import { TextArea, TextInput, Toggle } from '../ui';
import TravelVideosEditor from './TravelVideosEditor';
import type { ReelsSectionContent } from '../../types/content';

/** Shared editor for homepage Travel Reels settings and YouTube Shorts list. */
export default function ReelsSectionFields({
  value,
  onChange,
  packageReelsCount = 0,
}: {
  value: ReelsSectionContent;
  onChange: (patch: Partial<ReelsSectionContent>) => void;
  packageReelsCount?: number;
}) {
  return (
    <div className="space-y-6">
      <Toggle
        checked={value.enabled}
        onChange={(v) => onChange({ enabled: v })}
        label="Show Travel Reels section on homepage"
        description="Displays enabled YouTube Shorts added below, followed by Shorts from active tour packages."
      />

      <div className="grid md:grid-cols-2 gap-4">
        <TextInput
          label="Badge"
          value={value.badge}
          onChange={(e) => onChange({ badge: e.target.value })}
          className="font-tamil"
        />
        <TextInput
          label="Title"
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="font-tamil"
        />
        <TextArea
          label="Subtitle"
          rows={2}
          value={value.subtitle}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          containerClassName="md:col-span-2"
          className="font-tamil"
        />
      </div>

      {packageReelsCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-3 text-xs text-slate-600">
          <Film className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            <strong>{packageReelsCount}</strong> enabled YouTube Short{packageReelsCount === 1 ? '' : 's'} from active Tour Packages are also included automatically (homepage reels listed below appear first, up to 12 total).
          </p>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-slate-800 mb-1">Homepage YouTube Shorts &amp; Videos</p>
        <p className="text-xs text-slate-500 mb-3">
          Paste any YouTube Shorts URL (<code className="font-mono">youtube.com/shorts/…</code>) to feature directly on the homepage.
        </p>
        <TravelVideosEditor
          value={value.videos}
          onChange={(videos) => onChange({ videos })}
          duplicateMessage="This video is already added to homepage Travel Reels"
          emptyPreviewMessage="No standalone homepage Shorts added yet. Add a YouTube Shorts link above or manage package reels from Tour Packages."
        />
      </div>
    </div>
  );
}

