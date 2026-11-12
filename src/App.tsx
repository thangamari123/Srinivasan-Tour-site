import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Link, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import FloatingButtons from './components/FloatingButtons';
import Preloader from './components/Preloader';
import Home from './pages/Home';
import About from './pages/About';
import Packages from './pages/Packages';
import PackageDetail from './pages/PackageDetail';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import SiteContentProvider from './context/SiteContentProvider';

// The admin panel is code-split so public visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'));

const ROUTE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'ஸ்ரீநிவாசா டூர் ஆபரேட்டர்ஸ் | Srinivasa Tour Operators',
    description: 'Trusted Tamil Nadu tour operator offering pilgrimage tours, domestic holidays, and international tour packages.',
  },
  '/about': {
    title: 'எங்களைப் பற்றி | About — Srinivasa Tour Operators',
    description: 'Learn about Srinivasa Tour Operators, our travel expertise, spiritual tour planning, and customer service.',
  },
  '/packages': {
    title: 'சுற்றுலா தொகுப்புகள் | Tour Packages — Srinivasa Tour Operators',
    description: 'Explore pilgrimage, domestic India, and international tour packages with transparent itineraries and WhatsApp enquiry.',
  },
  '/gallery': {
    title: 'புகைப்பட தொகுப்பு | Gallery — Srinivasa Tour Operators',
    description: 'Photos and memorable moments from our pilgrimage, domestic, and international group tours.',
  },
  '/contact': {
    title: 'தொடர்பு கொள்ள | Contact Us — Srinivasa Tour Operators',
    description: 'Contact Srinivasa Tour Operators by phone, WhatsApp, or visit our office to plan your next trip.',
  },
};

function usePublicSeo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const meta = ROUTE_META[cleanPath];
    if (meta) {
      document.title = meta.title;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', meta.description);
    }
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://srinivasatour.com${cleanPath}`);
  }, [pathname]);
}

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4 py-24">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 mb-2">404</p>
        <h1 className="font-tamil text-3xl font-bold text-navy-950 mb-3">பக்கம் கிடைக்கவில்லை</h1>
        <p className="font-tamil text-gray-600 mb-8">நீங்கள் தேடும் பக்கம் இல்லை அல்லது மாற்றப்பட்டிருக்கலாம்.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="px-5 py-2.5 rounded-xl bg-navy-600 text-white font-semibold font-tamil hover:bg-navy-700 transition-colors">
            முகப்புக்குத் திரும்பு
          </Link>
          <Link to="/packages" className="px-5 py-2.5 rounded-xl border border-slate-300 text-navy-950 font-semibold font-tamil hover:bg-slate-100 transition-colors">
            சுற்றுலா தொகுப்புகள்
          </Link>
        </div>
      </div>
    </div>
  );
}

function PublicSite() {
  usePublicSeo();
  return (
    <SiteContentProvider>
      <div className="min-h-screen flex flex-col">
        <Preloader />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/package/:slug" element={<PackageDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </SiteContentProvider>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                  <div className="w-8 h-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              }
            >
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="/*" element={<PublicSite />} />
      </Routes>
    </Router>
  );
}

export default App;
