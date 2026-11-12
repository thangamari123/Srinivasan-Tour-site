import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Film, RotateCcw, Save } from 'lucide-react';
import { COLLECTIONS } from '../../lib/firebaseConfig';
import { defaultHomepage } from '../../data/defaultContent';
import type { ReelsSectionContent, TourPackage } from '../../types/content';
import { useCollection } from '../hooks/useCollection';
import { useActor } from '../hooks/useUploader';
import { useConfirm, useToast } from '../context/feedback';
import { errorMessage, saveHomepageSection } from '../services/content';
import { countActivePackageReels, normalizeReelsSection, sanitizeTravelVideos } from '../services/travelVideos';
import ReelsSectionFields from '../components/ReelsSectionFields';
import { Badge, Button, Card, CardHeader, ErrorBanner, PageHeader, Skeleton } from '../ui';

type DocWithId = { id: string } & Record<string, unknown>;

export default function TravelReels() {
  const actor = useActor();
  const toast = useToast();
  const confirm = useConfirm();
  const homepageDocs = useCollection<DocWithId>(COLLECTIONS.homepage);
  const packages = useCollection<TourPackage>(COLLECTIONS.tourPackages);

  const [draft, setDraft] = useState<ReelsSectionContent | null>(null);
  const [saving, setSaving] = useState(false);

  const saved = useMemo(
    () => normalizeReelsSection(homepageDocs.data.find((d) => d.id === 'reels')),
    [homepageDocs.data],
  );
  const current = draft ?? saved;
  const dirty = draft !== null;

  const packageReelsCount = useMemo(() => countActivePackageReels(packages.data), [packages.data]);
  const packagesWithReels = useMemo(
    () => packages.data.filter((p) => Array.isArray(p.travelVideos) && p.travelVideos.length > 0),
    [packages.data],
  );

  const update = (patch: Partial<ReelsSectionContent>) => setDraft({ ...current, ...patch });

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload: ReelsSectionContent = {
        ...current,
        videos: sanitizeTravelVideos(current.videos),
      };
      await saveHomepageSection('reels', payload as unknown as Record<string, unknown>, actor);
      setDraft(null);
      toast('Travel Reels updated — changes are live');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (
      !(await confirm({
        title: 'Restore default Travel Reels heading?',
        message: 'Resets section visibility, heading text and list to the original defaults. Nothing is saved until you click Save changes.',
        confirmLabel: 'Load original',
      }))
    ) {
      return;
    }
    setDraft(defaultHomepage.reels);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Travel Reels"
        description="Add and manage YouTube Shorts shown in the homepage Travel Reels section."
        actions={
          <a href="/" target="_blank" rel="noreferrer">
            <Button variant="secondary" icon={ExternalLink}>Preview website</Button>
          </a>
        }
      />

      {homepageDocs.error && <ErrorBanner message={homepageDocs.error} onRetry={homepageDocs.reload} />}

      <Card>
        <CardHeader
          title="Homepage Travel Reels"
          description="YouTube Shorts added here appear first in the homepage carousel, followed by Shorts linked to active tour packages."
          action={
            <Button size="sm" variant="ghost" icon={RotateCcw} onClick={resetToDefault}>
              Original defaults
            </Button>
          }
        />
        {homepageDocs.loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <ReelsSectionFields value={current} onChange={update} packageReelsCount={packageReelsCount} />
        )}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
          {dirty && (
            <>
              <span className="text-xs text-amber-600 mr-auto">Unsaved changes</span>
              <Button variant="secondary" onClick={() => setDraft(null)}>
                Discard
              </Button>
            </>
          )}
          <Button icon={Save} onClick={save} loading={saving} disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Package-Linked Travel Reels"
          description="Reels added inside individual tour packages also appear on their package detail page and feed into the homepage."
          action={
            <Link to="/admin/packages">
              <Button size="sm" variant="secondary">Manage packages</Button>
            </Link>
          }
        />
        {packages.loading ? (
          <Skeleton className="h-24" />
        ) : packagesWithReels.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            <Film className="w-6 h-6 mx-auto mb-2 text-slate-400" />
            No tour packages have YouTube Shorts attached yet. You can add Shorts directly above or edit any tour package.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {packagesWithReels.map((pkg) => {
              const pkgVideos = pkg.travelVideos ?? [];
              const totalCount = pkgVideos.length;
              const enabledCount = pkgVideos.filter((v) => v.enabled !== false).length;
              return (
                <li key={pkg.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 font-tamil truncate">{pkg.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {enabledCount} active / {totalCount} total YouTube Short{totalCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={pkg.status === 'active' ? 'green' : 'gray'}>{pkg.status}</Badge>
                    <Link to={`/admin/packages/${pkg.id}`}>
                      <Button size="sm" variant="secondary">Edit reels</Button>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

