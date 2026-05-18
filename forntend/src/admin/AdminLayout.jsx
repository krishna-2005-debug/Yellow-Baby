import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart2,
  Settings, LogOut, Bell, Search, Menu, X, ChevronRight,
  Layers, Tag, Home, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './admin.css';
import { BASE_URL } from '../api/api';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',  to: '/admin-panel' },
  { icon: ShoppingCart,    label: 'Orders',      to: '/admin-panel/orders' },
  { icon: Package,         label: 'Products',    to: '/admin-panel/products' },
  { icon: Users,           label: 'Customers',   to: '/admin-panel/customers' },
  { icon: BarChart2,       label: 'Analytics',   to: '/admin-panel/analytics' },
  { icon: Layers,          label: 'Content',     to: '/admin-panel/content' },
  { icon: Tag,             label: 'Coupons',     to: '/admin-panel/coupons' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="adm-root">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="adm-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`adm-sidebar ${sidebarOpen ? 'expanded' : 'collapsed'} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="adm-logo">
          <div className="adm-logo-icon">🍼</div>
          {sidebarOpen && (
            <div className="adm-logo-text">
              <span className="adm-logo-brand">Yellow Baby</span>
              <span className="adm-logo-sub">Admin Portal</span>
            </div>
          )}
          <button className="adm-collapse-btn" onClick={() => setSidebarOpen(v => !v)}>
            <ChevronRight size={14} className={sidebarOpen ? 'rotate-180' : ''} />
          </button>
        </div>

        {/* Nav */}
        <nav className="adm-nav">
          <div className="adm-nav-section-label">{sidebarOpen && 'MAIN MENU'}</div>
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={18} className="adm-nav-icon" />
              {sidebarOpen && <span className="adm-nav-label">{label}</span>}
              {sidebarOpen && <ChevronRight size={12} className="adm-nav-arrow" />}
            </NavLink>
          ))}

          <div className="adm-nav-divider" />
          <div className="adm-nav-section-label">{sidebarOpen && 'OTHER'}</div>

          <a href="/" target="_blank" rel="noreferrer"
            className="adm-nav-link" title={!sidebarOpen ? 'View Store' : undefined}>
            <Home size={18} className="adm-nav-icon" />
            {sidebarOpen && <span className="adm-nav-label">View Store</span>}
            {sidebarOpen && <ExternalLink size={11} className="adm-nav-arrow" />}
          </a>
          <a href={`${BASE_URL}/admin/`} target="_blank" rel="noreferrer"
            className="adm-nav-link" title={!sidebarOpen ? 'Django Admin Settings' : undefined}>
            <Settings size={18} className="adm-nav-icon" />
            {sidebarOpen && <span className="adm-nav-label">Django Admin</span>}
            {sidebarOpen && <ChevronRight size={12} className="adm-nav-arrow" />}
          </a>
        </nav>

        {/* User info at bottom */}
        <div className="adm-sidebar-footer">
          <div className="adm-user-avatar">
            {user?.mobile ? user.mobile.slice(-2) : 'AD'}
          </div>
          {sidebarOpen && (
            <div className="adm-user-info">
              <div className="adm-user-name">{user?.name || 'Administrator'}</div>
              <div className="adm-user-role">Super Admin</div>
            </div>
          )}
          <button className="adm-logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className={`adm-main ${sidebarOpen ? 'with-sidebar' : 'with-sidebar-collapsed'}`}>
        {/* Top Bar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <button className="adm-mobile-menu-btn" onClick={() => setMobileSidebarOpen(v => !v)}>
              {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="adm-search-wrap">
              <Search size={15} className="adm-search-icon" />
              <input className="adm-search" placeholder="Search orders, products, customers…" />
            </div>
          </div>
          <div className="adm-topbar-right">
            <a href={`${BASE_URL}/admin/`} target="_blank" rel="noreferrer"
              className="adm-topbar-btn" title="Django Admin">
              <ExternalLink size={16} />
              <span className="adm-topbar-btn-label">Django Admin</span>
            </a>
            <button className="adm-notif-btn" onClick={() => setNotifications(0)}>
              <Bell size={18} />
              {notifications > 0 && <span className="adm-notif-badge">{notifications}</span>}
            </button>
            <div className="adm-topbar-avatar">
              {user?.mobile ? user.mobile.slice(-2) : 'AD'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}



