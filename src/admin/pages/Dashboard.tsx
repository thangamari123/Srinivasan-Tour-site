import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FolderTree,
  Home,
  Images,
  ImagePlus,
  MapPin,
  Package,
  PauseCircle,
  Plus,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react';
import { COLLECTIONS } from '../../lib/firebaseConfig';
import { useCollection } from '../hooks/useCollection';
import { useAuth } from '../context/auth';
import { Card, CardHeader, EmptyState, ErrorBanner, Skeleton, StatusBadge, cx } from '../ui';
import type { ActivityLog, Category, Destination, MediaItem, TourPackage } from '../../types/content';
import { millis, timeAgo } from '../utils';

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  loading,
  to,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
  loading: boolean;
  to: string;
}) {
  return (
    <Link to={to} className="group">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            {loading ? <Skeleton className="h-8 w-12 mt-2" /> : <p className="text-3xl font-semibold text-slate-900 mt-1 tabular-nums">{value}</p>}
          </div>
          <div className={cx('w-10 h-10 rounded-lg flex items-center justify-center', tone)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

const ACTION_LABEL: Record<ActivityLog['action'], string> = {
  create: 'created',
  update: 'updated',
  delete: 'deleted',
  publish: 'published',
  unpublish: 'unpublished',
  upload: 'uploaded',
  import: 'imported',
};

const ENTITY_LABEL: Record<string, string> = {
  tourPackages: 'package',
  destinations: 'destination',
  categories: 'category',
  testimonials: 'testimonial',
  homepage: 'homepage section',
  media: 'image',
  admins: 'admin user',
  settings: 'settings',
};

export default function Dashboard() {
  const { admin, user } = useAuth();
  const packages = useCollection<TourPackage>(COLLECTIONS.tourPackages);
  const destinations = useCollection<Destination>(COLLECTIONS.destinations);
  const categories = useCollection<Category>(COLLECTIONS.categories);
  const media = useCollection<MediaItem>(COLLECTIONS.media);
  const activity = useCollection<ActivityLog>(COLLECTIONS.activityLogs, { orderBy: 'createdAt', direction: 'desc', limit: 8 });

  const loading = packages.loading || destinations.loading || categories.loading || media.loading;
  const published = packages.data.filter((p) => p.status === 'active').length;
  const drafts = packages.data.length - published;
  const featured = packages.data.filter((p) => p.featured).length;
  const recent = [...packages.data]
    .sort((a, b) => (millis(b.updatedAt) || millis(b.createdAt)) - (millis(a.updatedAt) || millis(a.createdAt)))
    .slice(0, 5);
  const catName = new Map(categories.data.map((c) => [c.id, c.name]));
  const error = packages.error || destinations.error || categories.error || media.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Welcome back{admin?.name ? `, ${admin.name}` : ''}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Signed in as {user?.email}. Here is what is on the website right now.</p>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        <StatCard label="Total packages" value={packages.data.length} icon={Package} tone="bg-indigo-50 text-indigo-600" loading={loading} to="/admin/packages" />
        <StatCard label="Published" value={published} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" loading={loading} to="/admin/packages" />
        <StatCard label="Drafts" value={drafts} icon={PauseCircle} tone="bg-slate-100 text-slate-500" loading={loading} to="/admin/packages" />
        <StatCard label="Featured" value={featured} icon={Star} tone="bg-amber-50 text-amber-500" loading={loading} to="/admin/packages" />
        <StatCard label="Destinations" value={destinations.data.length} icon={MapPin} tone="bg-sky-50 text-sky-600" loading={loading} to="/admin/destinations" />
        <StatCard label="Categories" value={categories.data.length} icon={FolderTree} tone="bg-amber-50 text-amber-600" loading={loading} to="/admin/categories" />
        <StatCard label="Uploaded media" value={media.data.length} icon={Images} tone="bg-violet-50 text-violet-600" loading={loading} to="/admin/media" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padded={false}>
          <div className="px-5 sm:px-6 pt-5">
            <CardHeader
              title="Recently updated packages"
              action={
                <Link to="/admin/packages" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              }
            />
          </div>
          {loading ? (
            <div className="px-5 sm:px-6 pb-5 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No packages yet"
              description="Create your first package, or import the existing website content from Settings."
              action={
                <Link to="/admin/packages/new" className="text-sm font-medium text-indigo-600">
                  + Add package
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link to={`/admin/packages/${p.id}`} className="flex items-center gap-4 px-5 sm:px-6 py-3 hover:bg-slate-50">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      {(p.featuredImage?.url || p.gallery?.[0]?.url) && (
                        <img src={p.featuredImage?.url || p.gallery?.[0]?.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate font-tamil">{p.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {catName.get(p.categoryId) ?? 'Uncategorised'} · {p.durationDays} days · updated {timeAgo(p.updatedAt ?? p.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Quick actions" />
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: '/admin/packages/new', label: 'New package', icon: Plus },
              { to: '/admin/destinations', label: 'Destinations', icon: MapPin },
              { to: '/admin/homepage', label: 'Edit homepage', icon: Home },
              { to: '/admin/media', label: 'Upload images', icon: ImagePlus },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 p-3 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors"
              >
                <Icon className="w-4.5 h-4.5 text-indigo-600" />
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </Link>
            ))}
          </div>
          {!loading && packages.data.length === 0 && (
            <Link
              to="/admin/settings"
              className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              Import the current website content to get started
            </Link>
          )}
        </Card>
      </div>

      <Card padded={false}>
        <div className="px-5 sm:px-6 pt-5">
          <CardHeader title="Recent activity" description="The latest changes made by any admin." />
        </div>
        {activity.loading ? (
          <div className="px-5 sm:px-6 pb-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
        ) : activity.data.length === 0 ? (
          <EmptyState icon={Activity} title="No activity yet" />
        ) : (
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {activity.data.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 sm:px-6 py-3 text-sm">
                <span
                  className={cx(
                    'w-2 h-2 rounded-full shrink-0',
                    a.action === 'delete' ? 'bg-rose-500' : a.action === 'create' || a.action === 'upload' ? 'bg-emerald-500' : 'bg-indigo-500',
                  )}
                />
                <p className="flex-1 min-w-0 text-slate-600 truncate">
                  <span className="font-medium text-slate-900">{a.userEmail}</span> {ACTION_LABEL[a.action] ?? a.action}{' '}
                  {ENTITY_LABEL[a.entity] ?? a.entity}
                  {a.entityName && <span className="font-medium text-slate-900 font-tamil"> “{a.entityName}”</span>}
                </p>
                <span className="text-xs text-slate-400 shrink-0">{timeAgo(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
