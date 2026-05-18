import { useState, useEffect, useRef } from 'react';
import { Search, Download, RefreshCw, Eye, ChevronDown, X, MapPin, Phone, CreditCard, Package, Tag } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending:   '#F59E0B',
  confirmed: '#3B82F6',
  packed:    '#8B5CF6',
  shipped:   '#06B6D4',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const DEMO_ORDERS = Array.from({ length: 6 }, (_, i) => ({
  id: 1024 - i,
  user_mobile: `9${String(8000000000 - i * 1111111).slice(0, 9)}`,
  user_name: ['Priya Sharma', 'Rahul Gupta', 'Anita Patel', 'Vikram Singh', 'Sunita Rao', 'Amit Kumar'][i],
  total_amount: [1499, 2350, 3200, 980, 4500, 1850][i],
  status: STATUSES.slice(1)[i % 6],
  payment_method: ['cod', 'razorpay', 'cod', 'razorpay', 'cod', 'cod'][i],
  payment_status: ['pending', 'paid', 'pending', 'paid', 'pending', 'pending'][i],
  created_at: new Date(Date.now() - i * 86400000 * 1.5).toISOString(),
  items_count: Math.floor(Math.random() * 3) + 1,
}));

/* ── Order Detail Drawer ────────────────────────────────────────────────────── */
function OrderDetailDrawer({ orderId, onClose, onStatusChange }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/orders/admin/${orderId}/`);
        setDetail(data);
      } catch {
        toast.error('Failed to load order details');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [orderId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleStatus = async (newStatus) => {
    setStatusOpen(false);
    setChangingStatus(true);
    try {
      await api.patch(`/api/orders/admin/${orderId}/`, { status: newStatus });
      setDetail(prev => ({ ...prev, status: newStatus }));
      onStatusChange(orderId, newStatus);
      toast.success(`Order #${orderId} → ${newStatus}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update status');
    } finally { setChangingStatus(false); }
  };

  const fmtDate = (iso) => {
    const d = new Date(iso);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1000,
          width: 'min(520px, 95vw)',
          background: 'var(--adm-bg)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          animation: 'drawerSlideIn 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--adm-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: 'var(--adm-bg)', zIndex: 10,
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--adm-text)' }}>
              Order #{orderId}
            </div>
            {detail && (
              <div style={{ fontSize: 12, color: 'var(--adm-text-muted)', marginTop: 2 }}>
                {fmtDate(detail.created_at)}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--adm-border)',
            background: 'transparent', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'var(--adm-text-muted)',
          }}>
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 40 }}>
            <div className="adm-spinner" />
          </div>
        ) : detail && (
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Status + Change */}
            <div style={{
              background: 'var(--adm-surface)', borderRadius: 12,
              padding: '14px 16px', border: '1px solid var(--adm-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--adm-text-muted)', marginBottom: 6 }}>Order Status</div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                  background: `${STATUS_COLORS[detail.status] || '#6B7280'}1A`,
                  color: STATUS_COLORS[detail.status] || '#6B7280',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[detail.status] || '#6B7280' }} />
                  {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <button
                  className="adm-btn adm-btn-ghost"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                  onClick={() => setStatusOpen(v => !v)}
                  disabled={changingStatus}
                >
                  {changingStatus ? 'Updating…' : 'Change Status'} <ChevronDown size={12} />
                </button>
                {statusOpen && (
                  <div style={{
                    position: 'absolute', top: '110%', right: 0, zIndex: 50,
                    background: '#FFFFFF', border: '1px solid var(--adm-border)',
                    borderRadius: 10, overflow: 'hidden', minWidth: 150,
                    boxShadow: 'var(--adm-s3)',
                  }}>
                    {STATUSES.slice(1).map(s => (
                      <button key={s} onClick={() => handleStatus(s)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          width: '100%', padding: '8px 14px',
                          background: s === detail.status ? 'rgba(245,158,11,0.1)' : 'transparent',
                          border: 'none', cursor: 'pointer', textAlign: 'left',
                          fontSize: 12, fontFamily: 'var(--adm-font)',
                          color: s === detail.status ? 'var(--adm-accent)' : 'var(--adm-text-sub)',
                          textTransform: 'capitalize',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={e => e.currentTarget.style.background = s === detail.status ? 'rgba(245,158,11,0.1)' : 'transparent'}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s], flexShrink: 0 }} />
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--adm-text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Package size={14} color="var(--adm-accent)" /> Items ({detail.items.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {detail.items.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--adm-surface)', border: '1px solid var(--adm-border)',
                    borderRadius: 10, padding: '10px 12px',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                      background: '#F3F4F6', border: '1px solid var(--adm-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.image ? (
                        <img src={item.image} alt={item.product_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                      ) : (
                        <Package size={18} color="#9CA3AF" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--adm-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.product_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--adm-text-muted)', marginTop: 2 }}>
                        Size: {item.size} · Qty: {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--adm-text)', flexShrink: 0 }}>
                      ₹{item.subtotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div style={{
              background: 'var(--adm-surface)', borderRadius: 12,
              padding: '14px 16px', border: '1px solid var(--adm-border)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--adm-text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CreditCard size={14} color="var(--adm-accent)" /> Payment Summary
              </div>
              {[
                ['Subtotal', `₹${detail.subtotal.toLocaleString('en-IN')}`],
                detail.discount_amount > 0 ? ['Discount', `-₹${detail.discount_amount.toLocaleString('en-IN')}`] : null,
                ['Payment Method', detail.payment_method === 'cod' ? 'Cash on Delivery' : 'Razorpay'],
                ['Payment Status', detail.payment_status.charAt(0).toUpperCase() + detail.payment_status.slice(1)],
              ].filter(Boolean).map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--adm-text-sub)', marginBottom: 6 }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 600, color: label === 'Discount' ? '#10B981' : 'var(--adm-text)' }}>{value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--adm-border)', paddingTop: 8, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--adm-text)' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--adm-accent)' }}>₹{detail.total_amount.toLocaleString('en-IN')}</span>
              </div>
              {detail.coupon_code && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#10B981', fontWeight: 600 }}>
                  <Tag size={11} /> Coupon applied: {detail.coupon_code}
                </div>
              )}
            </div>

            {/* Customer + Address */}
            <div style={{
              background: 'var(--adm-surface)', borderRadius: 12,
              padding: '14px 16px', border: '1px solid var(--adm-border)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--adm-text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} color="var(--adm-accent)" /> Customer & Delivery
              </div>
              <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {detail.user_name && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--adm-text-muted)', minWidth: 60 }}>Name</span>
                    <span style={{ color: 'var(--adm-text)', fontWeight: 600 }}>{detail.user_name}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--adm-text-muted)', minWidth: 60 }}>Mobile</span>
                  <span style={{ color: 'var(--adm-text)', fontWeight: 600 }}>{detail.user_mobile}</span>
                </div>
                {detail.address?.name && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--adm-text-muted)', minWidth: 60 }}>Ship To</span>
                    <span style={{ color: 'var(--adm-text)', fontWeight: 600 }}>{detail.address.name}</span>
                  </div>
                )}
                {detail.address?.phone && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--adm-text-muted)', minWidth: 60 }}>Phone</span>
                    <span style={{ color: 'var(--adm-text)' }}>
                      <Phone size={10} style={{ display: 'inline', marginRight: 4 }} />{detail.address.phone}
                    </span>
                  </div>
                )}
                {detail.address?.address_line && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--adm-text-muted)', minWidth: 60 }}>Address</span>
                    <span style={{ color: 'var(--adm-text)' }}>
                      {detail.address.address_line}, {detail.address.city} - {detail.address.pincode}
                      {detail.address.state && `, ${detail.address.state}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

/* ── Order Row ───────────────────────────────────────────────────────────────── */
function OrderRow({ order, onStatusChange, onViewDetail }) {
  const [changing, setChanging] = useState(false);
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    <tr style={{ cursor: 'pointer' }} onClick={() => onViewDetail(order.id)}>
      <td><strong style={{ color: 'var(--adm-text)', fontWeight: 700 }}>#{order.id}</strong></td>
      <td>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--adm-text)' }}>{order.user_name || '—'}</div>
          <div style={{ fontSize: 11, color: 'var(--adm-text-muted)', fontFamily: 'monospace' }}>{order.user_mobile}</div>
        </div>
      </td>
      <td style={{ color: 'var(--adm-text-muted)', fontSize: 12 }}>{dateStr}</td>
      <td>{order.items_count || 1} item{(order.items_count || 1) > 1 ? 's' : ''}</td>
      <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
      <td><span className={`adm-badge adm-badge-${order.status}`}>{order.status}</span></td>
      <td onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            className="adm-btn adm-btn-ghost"
            style={{ padding: '5px 8px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => onViewDetail(order.id)}
            title="View Order Details"
          >
            <Eye size={13} />
          </button>
          <div style={{ position: 'relative' }} ref={dropRef}>
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
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = s === order.status ? 'rgba(245,158,11,0.1)' : 'transparent'}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────────── */
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
      String(o.id).includes(search) ||
      (o.user_mobile || '').includes(search) ||
      (o.user_name || '').toLowerCase().includes(search.toLowerCase())
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
            placeholder="Search by order ID, name or phone…"
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
                <OrderRow key={o.id} order={o}
                  onStatusChange={handleStatusChange}
                  onViewDetail={setSelectedOrderId} />
              ))}
              {!filtered.length && (
                <tr><td colSpan={7}>
                  <div className="adm-empty">
                    <div className="adm-empty-icon">📭</div>
                    <div className="adm-empty-title">No orders found</div>
                    <div className="adm-empty-sub">Try adjusting your filters</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Drawer */}
      {selectedOrderId !== null && (
        <OrderDetailDrawer
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
