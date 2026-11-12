import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  FolderTree,
  Home,
  Images,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquareQuote,
  Package,
  Plane,
  Settings,
  WifiOff,
  X,
} from 'lucide-react';
import { useAuth } from '../context/auth';
import { useConfirm } from '../context/feedback';
import AdminErrorBoundary from '../components/AdminErrorBoundary';
import { Badge, cx } from '../ui';

function useOnlineStatus() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('online', cb);
      window.addEventListener('offline', cb);
      return () => {
        window.removeEventListener('online', cb);
        window.removeEventListener('offline', cb);
      };
    },
    () => navigator.onLine,
  );
}

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/packages', label: 'Tour Packages', icon: Package },
  { to: '/admin/destinations', label: 'Destinations', icon: MapPin },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/homepage', label: 'Homepage', icon: Home },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { to: '/admin/media', label: 'Media Library', icon: Images },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut, admin, user } = useAuth();
  const confirm = useConfirm();

  const logout = async () => {
    if (await confirm({ title: 'Sign out?', message: 'You will need to sign in again to manage the website.', confirmLabel: 'Sign out' })) {
      await signOut();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Link to="/admin" onClick={onNavigate} className="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Plane className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Srinivasa Tours</p>
          <p className="text-[11px] text-slate-400">Admin panel</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Admin">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5',
              )
            }
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" />
          Logout
        </button>
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold uppercase shrink-0">
            {(admin?.name || user?.email || '?').charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{admin?.name || user?.email}</p>
            <p className="text-[11px] text-slate-400 capitalize">{admin?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const online = useOnlineStatus();
  const current = [...NAV].reverse().find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)));

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-slate-900 z-30">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      <div className={cx('lg:hidden fixed inset-0 z-50', drawerOpen ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!drawerOpen}>
        <div
          className={cx('absolute inset-0 bg-slate-900/50 transition-opacity', drawerOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={cx(
            'absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 shadow-2xl transition-transform duration-200',
            drawerOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="absolute top-4 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
          {drawerOpen && <Sidebar onNavigate={() => setDrawerOpen(false)} />}
        </aside>
      </div>

      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top navbar */}
        <header className="sticky top-0 z-20 h-16 bg-white/85 backdrop-blur border-b border-slate-200 flex items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="text-sm font-medium text-slate-900">{current?.label ?? 'Admin'}</p>
          <div className="ml-auto flex items-center gap-3">
            {admin?.role === 'editor' && <Badge tone="amber">Editor</Badge>}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
            >
              <span className="hidden sm:inline">View website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </header>

        {!online && (
          <div role="alert" className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2 text-sm text-amber-800 flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            You are offline. Changes cannot be saved and images cannot be uploaded until the connection is back.
          </div>
        )}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px] w-full mx-auto">
          <AdminErrorBoundary resetKey={`${location.pathname}${location.search}`} onDashboard={() => navigate('/admin')}>
            <Outlet />
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
