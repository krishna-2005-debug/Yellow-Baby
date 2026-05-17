import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import AdminGuard from './admin/AdminGuard';

// Lazy load pages
const Home          = lazy(() => import('./pages/Home'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart          = lazy(() => import('./pages/Cart'));
const Checkout      = lazy(() => import('./pages/Checkout'));
const OrderSuccess  = lazy(() => import('./pages/OrderSuccess'));
const Orders        = lazy(() => import('./pages/Orders'));
const OrderDetail   = lazy(() => import('./pages/OrderDetail'));
const Login         = lazy(() => import('./pages/Login'));

// Admin panel (lazy)
const AdminLayout    = lazy(() => import('./admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminOrders    = lazy(() => import('./admin/AdminOrders'));
const AdminProducts  = lazy(() => import('./admin/AdminProducts'));
const AdminCustomers = lazy(() => import('./admin/AdminCustomers'));
const AdminAnalytics = lazy(() => import('./admin/AdminAnalytics'));
const AdminContent   = lazy(() => import('./admin/AdminContent'));
const AdminCoupons   = lazy(() => import('./admin/AdminCoupons'));

function PageLoader() {
  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader /></div>;
}

function AdminLoader() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F0F13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(245,158,11,0.15)', borderTopColor: '#F59E0B', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── ADMIN PANEL (no Navbar/Footer) ── */}
              <Route path="/admin-panel" element={
                <AdminGuard>
                  <Suspense fallback={<AdminLoader />}>
                    <AdminLayout />
                  </Suspense>
                </AdminGuard>
              }>
                <Route index element={<Suspense fallback={<AdminLoader />}><AdminDashboard /></Suspense>} />
                <Route path="orders"    element={<Suspense fallback={<AdminLoader />}><AdminOrders /></Suspense>} />
                <Route path="products"  element={<Suspense fallback={<AdminLoader />}><AdminProducts /></Suspense>} />
                <Route path="customers" element={<Suspense fallback={<AdminLoader />}><AdminCustomers /></Suspense>} />
                <Route path="analytics" element={<Suspense fallback={<AdminLoader />}><AdminAnalytics /></Suspense>} />
                <Route path="content"   element={<Suspense fallback={<AdminLoader />}><AdminContent /></Suspense>} />
                <Route path="coupons"   element={<Suspense fallback={<AdminLoader />}><AdminCoupons /></Suspense>} />
              </Route>

              {/* ── STORE ROUTES (with Navbar/Footer) ── */}
              <Route path="*" element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:id" element={<OrderDetail />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="*" element={
                        <div className="pt-16 min-h-screen flex flex-col items-center justify-center gap-4">
                          <span className="text-8xl">🙈</span>
                          <h2 className="text-2xl font-bold text-gray-700">Page not found</h2>
                          <a href="/" className="px-5 py-2.5 rounded-2xl bg-yellow-400 text-white font-semibold hover:bg-yellow-500 transition-colors">Go Home</a>
                        </div>
                      } />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />
            </Routes>
          </Suspense>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '16px',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '14px',
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
