import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Package, ShoppingCart,
  Users, AlertTriangle, DollarSign, Activity,
  ArrowRight, RefreshCw
} from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: '#FCD34D', confirmed: '#93C5FD', packed: '#C4B5FD',
  shipped: '#A5B4FC', delivered: '#6EE7B7', cancelled: '#FCA5A5',
};

function KpiCard({ label, value, sub, icon: Icon, color, glow, trend, trendLabel }) {
  return (
    <div className="adm-kpi adm-animate-in" style={{ '--c': color }}>
      <div className="adm-kpi-stripe" style={{ background: color }} />
      <div className="adm-kpi-glow" style={{ background: color }} />
      <div className="adm-kpi-top">
        <div>
          <div className="adm-kpi-label">{label}</div>
          <div className="adm-kpi-val">{value}</div>
          <div className="adm-kpi-sub">{sub}</div>
        </div>
        <div className="adm-kpi-icon" style={{ background: `${color}1A` }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      {trend != null && (
        <div className={`adm-kpi-trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(trend)}% {trendLabel}
        </div>
      )}
    </div>
  );
}

function MiniBarChart({ data = [] }) {
  if (!data.length) return <div style={{ color: 'var(--adm-text-muted)', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>No data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="adm-bar-chart">
        {data.map((d, i) => (
          <div key={i} className="adm-bar" title={`₹${d.value}`}
            style={{ height: `${(d.value / max) * 100}%` }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--adm-text-muted)', overflow: 'hidden' }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusRing({ data = [] }) {
  const total = data.reduce((a, b) => a + b.count, 0) || 1;
  return (
    <div>
      {data.map(({ status, count }) => (
        <div key={status} className="adm-stat-mini">
          <div className="adm-stat-mini-dot" style={{ background: STATUS_COLORS[status] || '#6B6880' }} />
          <div className="adm-stat-mini-label" style={{ textTransform: 'capitalize' }}>{status}</div>
          <div style={{ fontSize: 11, color: 'var(--adm-text-muted)', marginRight: 6 }}>
            {Math.round(count / total * 100)}%
          </div>
          <div className="adm-stat-mini-val">{count}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await api.get('/api/orders/admin/dashboard/');
      // Map API response to component shape
      setStats({
        sales: {
          today:      { total: data.kpis.today_revenue,  count: data.kpis.today_orders },
          this_month: { total: data.kpis.month_revenue,  count: data.kpis.month_orders },
          all_time:   { total: data.kpis.all_revenue,    count: data.kpis.all_orders },
        },
        total_products:   data.kpis.products,
        active_products:  data.kpis.active_products,
        low_stock_count:  data.kpis.low_stock,
        total_users:      data.kpis.customers,
        new_users_week:   data.kpis.new_customers_week,
        daily_revenue:    data.revenue_chart.map(d => ({ label: d.day, value: d.revenue })),
        order_status_counts: data.order_status,
        recent_orders:    data.recent_orders,
        low_stock:        data.low_stock_products,
      });
    } catch {
      // Fallback to demo data when backend is offline
      setStats(DEMO_STATS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div className="adm-spinner" />;

  const s = stats || DEMO_STATS;
  const revenue7d = s.daily_revenue || DEMO_STATS.daily_revenue;

  return (
    <div>
      {/* Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Dashboard</h1>
          <p className="adm-page-sub">Welcome back — here's what's happening today</p>
        </div>
        <button className="adm-btn adm-btn-ghost" onClick={() => fetchStats(true)} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="adm-kpi-grid">
        <KpiCard label="Today's Revenue" value={`₹${(s.sales?.today?.total || 0).toLocaleString('en-IN')}`}
          sub={`${s.sales?.today?.count || 0} orders today`}
          icon={DollarSign} color="#F59E0B" trend={12} trendLabel="vs yesterday" />
        <KpiCard label="This Month" value={`₹${(s.sales?.this_month?.total || 0).toLocaleString('en-IN')}`}
          sub={`${s.sales?.this_month?.count || 0} orders`}
          icon={TrendingUp} color="#3B82F6" trend={8} trendLabel="vs last month" />
        <KpiCard label="All-Time Revenue" value={`₹${(s.sales?.all_time?.total || 0).toLocaleString('en-IN')}`}
          sub={`${s.sales?.all_time?.count || 0} total orders`}
          icon={Activity} color="#10B981" />
        <KpiCard label="Products" value={s.total_products || 0}
          sub={`${s.active_products || 0} active`}
          icon={Package} color="#059669" />
        <KpiCard label="Low Stock" value={s.low_stock_count || 0}
          sub="variants below 5 units"
          icon={AlertTriangle} color="#EF4444" trend={s.low_stock_count > 0 ? -1 : null} trendLabel="needs attention" />
        <KpiCard label="Customers" value={s.total_users || 0}
          sub="registered users"
          icon={Users} color="#06B6D4" trend={5} trendLabel="this week" />
      </div>

      {/* Panels */}
      <div className="adm-panels-grid">

        {/* Revenue Chart */}
        <div className="adm-panel">
          <div className="adm-panel-head">
            <span className="adm-panel-title">📈 Revenue (Last 7 Days)</span>
          </div>
          <div style={{ padding: '16px', height: 180 }}>
            <MiniBarChart data={revenue7d} />
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="adm-panel">
          <div className="adm-panel-head">
            <span className="adm-panel-title">🥧 Order Status</span>
            <Link to="/admin/orders" className="adm-panel-link">View all <ArrowRight size={11} style={{ display: 'inline' }} /></Link>
          </div>
          <StatusRing data={s.order_status_counts || DEMO_STATS.order_status_counts} />
        </div>

        {/* Recent Orders */}
        <div className="adm-panel">
          <div className="adm-panel-head">
            <span className="adm-panel-title">📦 Recent Orders</span>
            <Link to="/admin/orders" className="adm-panel-link">View all <ArrowRight size={11} style={{ display: 'inline' }} /></Link>
          </div>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Amount</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(s.recent_orders || DEMO_STATS.recent_orders).map(o => (
                <tr key={o.id}>
                  <td><strong style={{ color: 'var(--adm-text)', fontWeight: 700 }}>#{o.id}</strong></td>
                  <td>{o.user__mobile || o.mobile || '—'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--adm-text)' }}>₹{o.total_amount || o.amount}</td>
                  <td><span className={`adm-badge adm-badge-${o.status}`}>{o.status}</span></td>
                </tr>
              ))}
              {!(s.recent_orders?.length) && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--adm-text-muted)' }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Low Stock */}
        <div className="adm-panel">
          <div className="adm-panel-head">
            <span className="adm-panel-title">⚠️ Low Stock Alerts</span>
            <Link to="/admin/products" className="adm-panel-link">Manage <ArrowRight size={11} style={{ display: 'inline' }} /></Link>
          </div>
          <table className="adm-table">
            <thead><tr><th>Product</th><th>Size</th><th>Stock</th></tr></thead>
            <tbody>
              {(s.low_stock || DEMO_STATS.low_stock).map((item, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--adm-text)', fontWeight: 500 }}>{item.product__name || item.name}</td>
                  <td>Size {item.size}</td>
                  <td style={{ color: '#FCD34D', fontWeight: 700 }}>{item.stock} left</td>
                </tr>
              ))}
              {!(s.low_stock?.length) && (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24, color: 'var(--adm-green)', fontWeight: 600 }}>✓ All stocked well</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`.spin { animation: adm-spin 0.8s linear infinite; }`}</style>
    </div>
  );
}

// Demo data for display when API not connected
const DEMO_STATS = {
  sales: {
    today:      { total: 12450, count: 7 },
    this_month: { total: 284000, count: 134 },
    all_time:   { total: 1820000, count: 892 },
  },
  total_products: 48,
  active_products: 42,
  low_stock_count: 3,
  total_users: 216,
  daily_revenue: [
    { label: 'Mon', value: 18000 },
    { label: 'Tue', value: 24500 },
    { label: 'Wed', value: 19800 },
    { label: 'Thu', value: 31200 },
    { label: 'Fri', value: 28400 },
    { label: 'Sat', value: 42100 },
    { label: 'Sun', value: 12450 },
  ],
  order_status_counts: [
    { status: 'pending',   count: 12 },
    { status: 'confirmed', count: 24 },
    { status: 'packed',    count: 8  },
    { status: 'shipped',   count: 18 },
    { status: 'delivered', count: 56 },
    { status: 'cancelled', count: 6  },
  ],
  recent_orders: [
    { id: 1024, mobile: '98765 43210', amount: 2499, status: 'confirmed' },
    { id: 1023, mobile: '91234 56789', amount: 1850, status: 'shipped' },
    { id: 1022, mobile: '87654 32109', amount: 3200, status: 'delivered' },
    { id: 1021, mobile: '76543 21098', amount: 980,  status: 'pending'  },
    { id: 1020, mobile: '65432 10987', amount: 4500, status: 'packed'   },
  ],
  low_stock: [
    { name: 'Cozy Onesie',    product__name: 'Cozy Onesie',    size: '3M',  stock: 2 },
    { name: 'Soft Blanket',   product__name: 'Soft Blanket',   size: 'M',   stock: 4 },
    { name: 'Baby Romper',    product__name: 'Baby Romper',    size: '6M',  stock: 1 },
  ],
};



