import { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Eye, ChevronDown } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

const DEMO_ORDERS = Array.from({ length: 12 }, (_, i) => ({
  id: 1024 - i,
  user__mobile: `9${String(8000000000 - i * 1111111).slice(0, 9)}`,
  total_amount: [1499, 2350, 3200, 980, 4500, 1850, 2900, 1200, 5400, 2100, 3700, 850][i],
  status: STATUSES.slice(1)[i % 6],
  created_at: new Date(Date.now() - i * 86400000 * 1.5).toISOString(),
  items_count: Math.floor(Math.random() * 3) + 1,
}));

function OrderRow({ order, onStatusChange }) {
  const [changing, setChanging] = useState(false);
  const [open, setOpen] = useState(false);

  const handleStatus = async (newStatus) => {
    setOpen(false);
    setChanging(true);
    try {
      await api.patch(`/api/orders/admin/${order.id}/`, { status: newStatus });
      onStatusChange(order.id, newStatus);
      toast.success(`Order #${order.id} → ${newStatus}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update status');
    } finally { setChanging(false); }
  };

  const d = new Date(order.created_at);
  const dateStr = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;

  return (
    <tr>
      <td><strong style={{ color: 'var(--adm-text)', fontWeight: 700 }}>#{order.id}</strong></td>
      <td>{order.user__mobile || '—'}</td>
      <td style={{ color: 'var(--adm-text-muted)', fontSize: 12 }}>{dateStr}</td>
      <td>{order.items_count || 1} item{(order.items_count || 1) > 1 ? 's' : ''}</td>
      <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
      <td>
        <span className={`adm-badge adm-badge-${order.status}`}>{order.status}</span>
      </td>
      <td>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            className="adm-btn adm-btn-ghost"
            style={{ padding: '5px 10px', fontSize: 11 }}
            onClick={() => setOpen(v => !v)}
            disabled={changing}
          >
            {changing ? '…' : 'Change'} <ChevronDown size={11} />
          </button>
          {open && (
            <div style={{
              position: 'absolute', top: '110%', right: 0, zIndex: 50,
              background: '#FFFFFF', border: '1px solid var(--adm-border)',
              borderRadius: 10, overflow: 'hidden', minWidth: 130,
              boxShadow: 'var(--adm-s3)',
            }}>
              {STATUSES.slice(1).map(s => (
                <button key={s} onClick={() => handleStatus(s)}
                  style={{
                    display: 'block', width: '100%', padding: '8px 14px',
                    background: s === order.status ? 'rgba(245,158,11,0.1)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: 12, fontFamily: 'var(--adm-font)',
                    color: s === order.status ? 'var(--adm-accent)' : 'var(--adm-text-sub)',
                    textTransform: 'capitalize',
                  }}
                  onMouseEnter={e => e.target.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.target.style.background = s === order.status ? 'rgba(245,158,11,0.1)' : 'transparent'}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/orders/admin/');
      const list = data.results || data;
      setOrders(list);
    } catch {
      setOrders(DEMO_ORDERS);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    let list = orders;
    if (status !== 'all') list = list.filter(o => o.status === status);
    if (search.trim()) list = list.filter(o =>
      String(o.id).includes(search) || (o.user__mobile || '').includes(search)
    );
    setFiltered(list);
  }, [orders, status, search]);

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const counts = STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Orders</h1>
          <p className="adm-page-sub">{orders.length} total orders</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="adm-btn adm-btn-ghost" onClick={fetchOrders}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="adm-btn adm-btn-ghost">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Status summary pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button key={s} className={`adm-filter-pill ${status === s ? 'active' : ''}`}
            onClick={() => setStatus(s)}>
            {s === 'all' ? `All (${orders.length})` : `${s} (${counts[s] || 0})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="adm-filters">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-muted)', pointerEvents: 'none' }} />
          <input className="adm-input" style={{ paddingLeft: 34, width: '100%' }}
            placeholder="Search by order ID or phone…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      {loading ? <div className="adm-spinner" /> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Date</th>
                <th>Items</th><th>Amount</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <OrderRow key={o.id} order={o} onStatusChange={handleStatusChange} />
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7}>
                    <div className="adm-empty">
                      <div className="adm-empty-icon">📭</div>
                      <div className="adm-empty-title">No orders found</div>
                      <div className="adm-empty-sub">Try adjusting your filters</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



