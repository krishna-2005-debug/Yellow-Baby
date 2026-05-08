import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMenuOpen(false); }, [location]);

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/?gender=boys', label: 'Boys' },
    { to: '/?gender=girls', label: 'Girls' },
    { to: '/?gender=unisex', label: 'Unisex' },
  ];

  return (
    <header
      className={`navbar-glass fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'scrolled' : ''}`}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(251,191,36,0.5)',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img src="/logo.png" alt="Yellow Baby" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '14px' }} />
            </div>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#4E3728', letterSpacing: '-0.3px', fontFamily: 'Outfit, sans-serif' }}>
              Yellow <span style={{ color: '#F59E0B' }}>Baby</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'none', gap: '4px' }} className="hidden md:flex">
            {navItems.map(({ to, label }) => (
              <Link key={to} to={to} className="nav-link">{label}</Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* Cart */}
            <Link to="/cart" id="navbar-cart-btn" style={{
              position: 'relative', padding: '8px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', color: '#374151', transition: 'all 0.18s',
              background: 'transparent',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FFFBEB'; e.currentTarget.style.color = '#D97706'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px',
                  minWidth: '18px', height: '18px',
                  background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                  color: '#fff', fontSize: '10px', fontWeight: '800',
                  borderRadius: '100px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: '0 4px',
                  boxShadow: '0 2px 6px rgba(251,191,36,0.5)',
                  animation: 'pulseDot 1.5s ease-in-out infinite',
                  fontFamily: 'Outfit, sans-serif',
                }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button id="navbar-user-menu-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '4px 12px 4px 4px', borderRadius: '100px',
                    background: 'transparent', border: '1.5px solid #FDE68A',
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FFFBEB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: '800', fontSize: '13px',
                    fontFamily: 'Outfit, sans-serif',
                  }}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'none' }} className="hidden sm:block">
                    {user.name?.split(' ')[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: '168px', background: '#fff', borderRadius: '18px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                    border: '1.5px solid #FEF3C7', padding: '8px', zIndex: 60,
                  }}>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'block', padding: '9px 12px', fontSize: '13px',
                        fontWeight: '600', color: '#374151', textDecoration: 'none',
                        borderRadius: '12px', transition: 'background 0.15s',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FFFBEB'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      📦 My Orders
                    </Link>
                    <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                      style={{
                        width: '100%', textAlign: 'left', padding: '9px 12px',
                        fontSize: '13px', fontWeight: '600', color: '#EF4444',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        borderRadius: '12px', transition: 'background 0.15s',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" id="navbar-login-btn" className="btn-primary"
                style={{ padding: '8px 18px', borderRadius: '12px', fontSize: '13px' }}>
                <User size={15} />
                Login
              </Link>
            )}

            {/* Mobile toggle */}
            <button id="navbar-mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                padding: '8px', borderRadius: '12px', background: 'transparent',
                border: 'none', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFFBEB'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              className="md:hidden"
            >
              {menuOpen ? <X size={22} color="#374151" /> : <Menu size={22} color="#374151" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            borderTop: '1px solid #FEF3C7', paddingTop: '12px', paddingBottom: '16px',
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}>
            {navItems.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: '10px 14px', fontSize: '14px', fontWeight: '600',
                color: '#374151', textDecoration: 'none', borderRadius: '12px',
                fontFamily: 'Outfit, sans-serif', transition: 'background 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FFFBEB'; e.currentTarget.style.color = '#D97706'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
              >{label}</Link>
            ))}
            {!user && (
              <Link to="/login" style={{
                padding: '10px 14px', fontSize: '14px', fontWeight: '700',
                color: '#D97706', textDecoration: 'none', borderRadius: '12px',
                background: '#FFFBEB', fontFamily: 'Outfit, sans-serif', marginTop: '4px',
              }}>Login / Sign Up</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
