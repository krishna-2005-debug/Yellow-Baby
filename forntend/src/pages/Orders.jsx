import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Loader2 } from 'lucide-react';
import { getOrders, cancelOrder } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS = {
  pending:   { bg: '#FEF3C7', color: '#92400E', icon: '⏳' },
  confirmed: { bg: '#DBEAFE', color: '#1E40AF', icon: '✅' },
  packed:    { bg: '#EDE9FE', color: '#5B21B6', icon: '📦' },
  shipped:   { bg: '#E0E7FF', color: '#3730A3', icon: '🚚' },
  delivered: { bg: '#D1FAE5', color: '#065F46', icon: '🎉' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', icon: '❌' },
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const font = 'Outfit, sans-serif';

  useEffect(() => {
    if (!user) return;
    getOrders()
      .then(({ data }) => setOrders(data.results || data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await cancelOrder(id);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not cancel order');
    }
  };

  if (loading) return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={36} color="#FBBF24" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'linear-gradient(180deg,#FFFBEB 0%,#FCF4EE 60%)', fontFamily: font }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '36px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg,#FBBF24,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(251,191,36,0.35)' }}>
            <Package size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#4E3728', margin: 0 }}>My Orders</h1>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '28px', border: '1.5px solid #FEF3C7', padding: '56px 32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(251,191,36,0.08)' }}>
            <div style={{ fontSize: '64px', marginBottom: '14px' }}>📦</div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#4E3728', marginBottom: '8px' }}>No orders yet</h2>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '22px' }}>Your order history will appear here once you make a purchase.</p>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 24px', borderRadius: '14px', background: 'linear-gradient(135deg,#FBBF24,#F59E0B)', color: '#fff', fontWeight: '700', fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(251,191,36,0.35)' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map((order) => {
              const st = STATUS[order.status] || { bg: '#F3F4F6', color: '#374151', icon: '📋' };
              return (
                <div key={order.id} id={`order-${order.id}`} style={{
                  background: '#fff', borderRadius: '24px',
                  border: '1.5px solid #FEF3C7',
                  boxShadow: '0 2px 10px rgba(251,191,36,0.06)',
                  overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #FEF9EE' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#4E3728', margin: '0 0 2px' }}>Order #{order.id}</p>
                      <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '100px', background: st.bg, color: st.color, fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {st.icon} {order.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(order.items || []).slice(0, 2).map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', overflow: 'hidden', flexShrink: 0 }}>
                          {item.product_image
                            ? <img src={item.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👕</div>
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#4E3728', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name}</p>
                          <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>Size: {item.size} × {item.quantity}</p>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#4E3728', flexShrink: 0 }}>₹{Number(item.total_price || item.price).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    {(order.items || []).length > 2 && (
                      <p style={{ fontSize: '12px', color: '#9CA3AF' }}>+{order.items.length - 2} more item(s)</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#FCF4EE', borderTop: '1px solid #FEF9EE' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 2px' }}>Total</p>
                      <p style={{ fontSize: '16px', fontWeight: '800', color: '#D97706', margin: 0 }}>₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button onClick={() => handleCancel(order.id)} style={{
                          padding: '7px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '700',
                          background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', cursor: 'pointer',
                          fontFamily: font, transition: 'background 0.15s',
                        }}>Cancel</button>
                      )}
                      <Link to={`/orders/${order.id}`} style={{
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px',
                        borderRadius: '12px', fontSize: '12px', fontWeight: '700',
                        background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A',
                        textDecoration: 'none', transition: 'background 0.15s',
                      }}>Details <ChevronRight size={13} /></Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
