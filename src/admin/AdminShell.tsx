import type { ComponentType, ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import FeedbackProvider from './context/FeedbackProvider';
import RequireAdmin from './components/RequireAdmin';
import AdminErrorBoundary from './components/AdminErrorBoundary';
import AdminLayout from './layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PackageList from './pages/packages/PackageList';
import PackageForm from './pages/packages/PackageForm';
import Destinations from './pages/Destinations';
import Categories from './pages/Categories';
import Homepage from './pages/Homepage';
import Testimonials from './pages/Testimonials';
import MediaLibrary from './pages/MediaLibrary';
import Settings from './pages/Settings';

/** Admin routes and providers (Firebase Auth provider is injected by AdminApp). */
export default function AdminShell({ AuthProvider }: { AuthProvider: ComponentType<{ children: ReactNode }> }) {
  return (
    <AuthProvider>
      <FeedbackProvider>
        <div translate="no" className="notranslate font-body text-slate-900 bg-slate-50 min-h-screen antialiased">
          <AdminErrorBoundary>
            <Routes>
              <Route path="login" element={<Login />} />
              <Route element={<RequireAdmin />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="packages" element={<PackageList />} />
                  <Route path="packages/new" element={<PackageForm />} />
                  <Route path="packages/:id" element={<PackageForm />} />
                  <Route path="destinations" element={<Destinations />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="homepage" element={<Homepage />} />
                  <Route path="testimonials" element={<Testimonials />} />
                  <Route path="media" element={<MediaLibrary />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>
              </Route>
            </Routes>
          </AdminErrorBoundary>
        </div>
      </FeedbackProvider>
    </AuthProvider>
  );
}
