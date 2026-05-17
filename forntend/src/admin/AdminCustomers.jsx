import { useState, useEffect } from 'react';
import { Search, Download, RefreshCw, Phone, User, ShoppingBag, Calendar } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const DEMO_CUSTOMERS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  mobile: `9${String(8765432100 - i * 1000111).slice(0, 9)}`,
  name: ['Priya Sharma', 'Rahul Gupta', 'Anita Patel', 'Vikram Singh', 'Sunita Rao',
         'Amit Kumar', 'Deepa Nair', 'Suresh Iyer', 'Kavita Joshi', 'Ravi Menon'][i],
  order_count: Math.floor(Math.random() * 8) + 1,
  total_spent: Math.floor(Math.random() * 15000) + 500,
  joined: new Date(Date.now() - i * 86400000 * 12).toISOString(),
  is_active: i % 5 !== 3,
}));

function fmtDate(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/users/admin/');
      setCustomers(data.results || data);
    } catch {
      setCustomers(DEMO_CUSTOMERS);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(customers); return; }
    setFiltered(customers.filter(c =>
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.mobile || '').includes(search)
    ));
  }, [customers, search]);

  const total     = customers.length;
  const active    = customers.filter(c => c.is_active).length;
  const totalSpent = customers.reduce((a, c) => a + (c.total_spent || 0), 0);

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Customers</h1>
          <p className="adm-page-sub">{total} registered customers</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="adm-btn adm-btn-ghost" onClick={fetchCustomers}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="adm-btn adm-btn-ghost">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Customers', value: total,  icon: User,        color: '#3B82F6' },
          { label: 'Active',          value: active, icon: Phone,       color: '#10B981' },
          { label: 'Total Revenue',   value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: ShoppingBag, color: '#F59E0B' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{
            background: 'var(--adm-surface)', border: '1px solid var(--adm-border)',
            borderRadius: 12, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={16} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--adm-text-muted)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--adm-text)' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="adm-filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-muted)', pointerEvents: 'none' }} />
          <input className="adm-input" style={{ paddingLeft: 32, width: '100%' }}
            placeholder="Search by name or phone…" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <div className="adm-spinner" /> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th><th>Customer</th><th>Mobile</th>
                <th>Orders</th><th>Total Spent</th><th>Joined</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--adm-text-muted)', fontSize: 12 }}>{idx + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,#FBBF24,#F59E0B)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, color: '#fff',
                      }}>
                        {(c.name || c.mobile || 'U')[0].toUpperCase()}
                      </div>
                      <span style={{ color: 'var(--adm-text)', fontWeight: 600, fontSize: 13 }}>
                        {c.name || '—'}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{c.mobile}</td>
                  <td style={{ fontWeight: 600 }}>{c.order_count || 0}</td>
                  <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>₹{(c.total_spent || 0).toLocaleString('en-IN')}</td>
                  <td style={{ fontSize: 12, color: 'var(--adm-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={11} />
                      {fmtDate(c.joined || c.date_joined || new Date().toISOString())}
                    </div>
                  </td>
                  <td>
                    <span className={`adm-badge adm-badge-${c.is_active ? 'active' : 'inactive'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={7}>
                  <div className="adm-empty">
                    <div className="adm-empty-icon">👥</div>
                    <div className="adm-empty-title">No customers found</div>
                    <div className="adm-empty-sub">Try a different search</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



