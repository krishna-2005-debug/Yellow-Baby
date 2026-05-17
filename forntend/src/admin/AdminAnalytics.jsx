import { TrendingUp, ShoppingCart, Users, Package, BarChart2, PieChart } from 'lucide-react';

// Simple SVG bar chart
function BarChartSvg({ data, color = '#F59E0B' }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 520, H = 140, PAD = 30, BAR_W = Math.floor((W - PAD * 2) / data.length) - 6;
  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} style={{ width: '100%', overflow: 'visible' }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f}
          x1={PAD} y1={H - H * f}
          x2={W - PAD} y2={H - H * f}
          stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
      ))}
      {/* Bars */}
      {data.map((d, i) => {
        const x = PAD + i * ((W - PAD * 2) / data.length) + 3;
        const bh = Math.max((d.value / max) * H, 4);
        return (
          <g key={i}>
            <rect x={x} y={H - bh} width={BAR_W} height={bh}
              rx={4} fill={`${color}22`} />
            <rect x={x} y={H - bh} width={BAR_W} height={8}
              rx={3} fill={color} />
            <text x={x + BAR_W / 2} y={H + 16} textAnchor="middle"
              fill="rgba(255,255,255,0.35)" fontSize={9}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const WEEKLY = [
  { label: 'Mon', value: 18000 }, { label: 'Tue', value: 24500 },
  { label: 'Wed', value: 19800 }, { label: 'Thu', value: 31200 },
  { label: 'Fri', value: 28400 }, { label: 'Sat', value: 42100 },
  { label: 'Sun', value: 12450 },
];
const MONTHLY = [
  { label: 'Jan', value: 240000 }, { label: 'Feb', value: 180000 },
  { label: 'Mar', value: 310000 }, { label: 'Apr', value: 290000 },
  { label: 'May', value: 284000 },
];

const TOP_PRODUCTS = [
  { name: 'Cozy Onesie Set', sales: 87, revenue: 78213 },
  { name: 'Soft Muslin Blanket', sales: 64, revenue: 83136 },
  { name: 'Diaper Bag Deluxe', sales: 41, revenue: 102459 },
  { name: 'Baby Romper Pack', sales: 98, revenue: 73402 },
  { name: 'Swaddle Wrap Pack', sales: 55, revenue: 54945 },
];

export default function AdminAnalytics() {
  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Analytics</h1>
          <p className="adm-page-sub">Sales insights & performance overview</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="adm-kpi-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: '₹18.2L', sub: 'All time', icon: TrendingUp, color: '#F59E0B' },
          { label: 'Total Orders', value: '892', sub: '134 this month', icon: ShoppingCart, color: '#3B82F6' },
          { label: 'Customers', value: '216', sub: '18 new this week', icon: Users, color: '#10B981' },
          { label: 'Avg. Order', value: '₹2,040', sub: 'Per transaction', icon: Package, color: '#8B5CF6' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="adm-kpi">
            <div className="adm-kpi-stripe" style={{ background: color }} />
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
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Weekly Revenue */}
        <div className="adm-panel">
          <div className="adm-panel-head">
            <span className="adm-panel-title"><BarChart2 size={14} /> Weekly Revenue</span>
          </div>
          <div style={{ padding: '16px 16px 8px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>
              ₹1,76,450
            </div>
            <div style={{ fontSize: 11, color: 'var(--adm-text-muted)', marginBottom: 16 }}>
              This week · <span style={{ color: '#6EE7B7' }}>↑ 12% vs last week</span>
            </div>
            <BarChartSvg data={WEEKLY} color="#6366F1" />
          </div>
        </div>

        {/* Monthly trend */}
        <div className="adm-panel">
          <div className="adm-panel-head">
            <span className="adm-panel-title"><PieChart size={14} /> Monthly Trend</span>
          </div>
          <div style={{ padding: '16px 16px 8px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>
              ₹2,84,000
            </div>
            <div style={{ fontSize: 11, color: 'var(--adm-text-muted)', marginBottom: 16 }}>
              May 2026 · <span style={{ color: '#6EE7B7' }}>↑ 8% vs April</span>
            </div>
            <BarChartSvg data={MONTHLY} color="#8B5CF6" />
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="adm-panel" style={{ marginBottom: 24 }}>
        <div className="adm-panel-head">
          <span className="adm-panel-title">🏆 Top Selling Products</span>
        </div>
        <table className="adm-table">
          <thead>
            <tr>
              <th>#</th><th>Product</th><th>Units Sold</th><th>Revenue</th><th>Share</th>
            </tr>
          </thead>
          <tbody>
            {TOP_PRODUCTS.map((p, i) => {
              const maxRev = Math.max(...TOP_PRODUCTS.map(x => x.revenue));
              const pct = Math.round(p.revenue / maxRev * 100);
              return (
                <tr key={p.name}>
                  <td>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: i === 0 ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                      fontSize: 11, fontWeight: 800,
                      color: i === 0 ? '#818CF8' : 'var(--adm-text-muted)',
                    }}>
                      {i + 1}
                    </div>
                  </td>
                  <td style={{ color: 'var(--adm-text)', fontWeight: 600 }}>{p.name}</td>
                  <td>{p.sales}</td>
                  <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>₹{p.revenue.toLocaleString('en-IN')}</td>
                  <td style={{ width: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', borderRadius: 3, transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--adm-text-muted)', width: 30, textAlign: 'right' }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
