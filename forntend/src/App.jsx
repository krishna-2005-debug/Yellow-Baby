import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Login = lazy(() => import('./pages/Login'));

function PageLoader() {
  return <div className="pt-16"><Loader /></div>;
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/login" element={<Login />} />
                  {/* 404 */}
                  <Route path="*" element={
                    <div className="pt-16 min-h-screen flex flex-col items-center justify-center gap-4">
                      <span className="text-8xl">🙈</span>
                      <h2 className="text-2xl font-bold text-gray-700">Page not found</h2>
                      <a href="/" className="px-5 py-2.5 rounded-2xl bg-yellow-400 text-white font-semibold hover:bg-yellow-500 transition-colors">Go Home</a>
                    </div>
                  } />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>

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
